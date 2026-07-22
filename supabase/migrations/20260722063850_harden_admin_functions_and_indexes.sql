create schema if not exists app_private;
revoke all on schema app_private from public, anon;
grant usage on schema app_private to authenticated;

drop policy quote_requests_admin_select on public.quote_requests;
drop policy status_history_admin_select on public.quote_request_status_history;
drop policy notes_admin_select on public.quote_request_notes;
drop policy notes_admin_insert on public.quote_request_notes;
drop policy notes_author_or_administrator_update on public.quote_request_notes;
drop policy attachments_admin_select on public.quote_request_attachments;
drop policy quote_attachments_storage_admin_select on storage.objects;

drop function public.update_quote_request_status(uuid, public.quote_request_status, text);
drop function public.archive_quote_request(uuid);
drop function public.is_active_admin(public.admin_role[]);

create function app_private.is_active_admin(required_roles public.admin_role[] default null)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = (select auth.uid())
      and active = true
      and (required_roles is null or role = any(required_roles))
  );
$$;

revoke all on function app_private.is_active_admin(public.admin_role[]) from public, anon;
grant execute on function app_private.is_active_admin(public.admin_role[]) to authenticated;

create policy quote_requests_admin_select
on public.quote_requests
for select
to authenticated
using (
  submission_completed_at is not null
  and (select app_private.is_active_admin())
);

create policy status_history_admin_select
on public.quote_request_status_history
for select
to authenticated
using ((select app_private.is_active_admin()));

create policy notes_admin_select
on public.quote_request_notes
for select
to authenticated
using ((select app_private.is_active_admin()));

create policy notes_admin_insert
on public.quote_request_notes
for insert
to authenticated
with check (
  (select app_private.is_active_admin())
  and author_id = (select auth.uid())
);

create policy notes_author_or_administrator_update
on public.quote_request_notes
for update
to authenticated
using (
  author_id = (select auth.uid())
  or (select app_private.is_active_admin(array['administrador'::public.admin_role]))
)
with check (
  author_id = (select auth.uid())
  or (select app_private.is_active_admin(array['administrador'::public.admin_role]))
);

create policy attachments_admin_select
on public.quote_request_attachments
for select
to authenticated
using ((select app_private.is_active_admin()));

create policy quote_attachments_storage_admin_select
on storage.objects
for select
to authenticated
using (
  bucket_id = 'quote-attachments'
  and (select app_private.is_active_admin())
);

create or replace function public.record_quote_status_change()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  requested_message text;
  acting_user uuid;
begin
  if new.status is distinct from old.status then
    requested_message := nullif(btrim(current_setting('micronativa.public_status_message', true)), '');
    acting_user := coalesce(
      auth.uid(),
      nullif(current_setting('micronativa.changed_by', true), '')::uuid
    );
    insert into public.quote_request_status_history (
      quote_request_id,
      previous_status,
      new_status,
      changed_by,
      public_message
    ) values (
      new.id,
      old.status,
      new.status,
      acting_user,
      coalesce(requested_message, public.default_public_status_message(new.status))
    );
  end if;
  return new;
end;
$$;

create function public.update_quote_request_status(
  request_id uuid,
  requested_status public.quote_request_status,
  requested_public_message text,
  acting_user_id uuid
)
returns public.quote_requests
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_record public.quote_requests;
  actor_role public.admin_role;
  transition_allowed boolean := false;
begin
  select role into actor_role
  from public.admin_users
  where user_id = acting_user_id and active = true;

  if actor_role is null then
    raise exception 'not_authorized' using errcode = '42501';
  end if;

  select * into current_record
  from public.quote_requests
  where id = request_id and archived_at is null and submission_completed_at is not null
  for update;

  if not found then
    raise exception 'request_not_found' using errcode = 'P0002';
  end if;

  if current_record.status = requested_status then
    return current_record;
  end if;

  transition_allowed := case current_record.status
    when 'recebido' then requested_status in ('em_analise', 'cancelado')
    when 'em_analise' then requested_status in ('contato_realizado', 'aguardando_cliente', 'visita_agendada', 'proposta_enviada', 'cancelado')
    when 'contato_realizado' then requested_status in ('em_analise', 'aguardando_cliente', 'visita_agendada', 'proposta_enviada', 'cancelado')
    when 'aguardando_cliente' then requested_status in ('contato_realizado', 'visita_agendada', 'proposta_enviada', 'cancelado')
    when 'visita_agendada' then requested_status in ('em_analise', 'aguardando_cliente', 'proposta_enviada', 'cancelado')
    when 'proposta_enviada' then requested_status in ('aguardando_cliente', 'em_execucao', 'cancelado')
    when 'em_execucao' then requested_status in ('concluido', 'cancelado')
    when 'concluido' then false
    when 'cancelado' then actor_role = 'administrador' and requested_status = 'recebido'
  end;

  if not transition_allowed then
    raise exception 'invalid_status_transition' using errcode = '22023';
  end if;

  if requested_public_message is not null and char_length(btrim(requested_public_message)) > 500 then
    raise exception 'public_message_too_long' using errcode = '22001';
  end if;

  perform set_config('micronativa.public_status_message', coalesce(btrim(requested_public_message), ''), true);
  perform set_config('micronativa.changed_by', acting_user_id::text, true);

  update public.quote_requests
  set status = requested_status
  where id = request_id
  returning * into current_record;

  return current_record;
end;
$$;

create function public.archive_quote_request(request_id uuid, acting_user_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (
    select 1 from public.admin_users
    where user_id = acting_user_id and active = true and role = 'administrador'
  ) then
    raise exception 'not_authorized' using errcode = '42501';
  end if;

  update public.quote_requests
  set archived_at = coalesce(archived_at, now())
  where id = request_id;

  if not found then
    raise exception 'request_not_found' using errcode = 'P0002';
  end if;
end;
$$;

revoke all on function public.update_quote_request_status(uuid, public.quote_request_status, text, uuid) from public, anon, authenticated;
revoke all on function public.archive_quote_request(uuid, uuid) from public, anon, authenticated;
grant execute on function public.update_quote_request_status(uuid, public.quote_request_status, text, uuid) to service_role;
grant execute on function public.archive_quote_request(uuid, uuid) to service_role;

revoke execute on function public.rls_auto_enable() from public, anon, authenticated;

create index quote_request_notes_author_idx on public.quote_request_notes (author_id);
create index quote_request_status_history_changed_by_idx on public.quote_request_status_history (changed_by) where changed_by is not null;
