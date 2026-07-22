create function public.is_active_admin(required_roles public.admin_role[] default null)
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

create function public.update_quote_request_status(
  request_id uuid,
  requested_status public.quote_request_status,
  requested_public_message text default null
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
  where user_id = (select auth.uid()) and active = true;

  if actor_role is null then
    raise exception 'not_authorized' using errcode = '42501';
  end if;

  select * into current_record
  from public.quote_requests
  where id = request_id and archived_at is null
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

  perform set_config(
    'micronativa.public_status_message',
    coalesce(btrim(requested_public_message), ''),
    true
  );

  update public.quote_requests
  set status = requested_status
  where id = request_id
  returning * into current_record;

  return current_record;
end;
$$;

create function public.archive_quote_request(request_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_active_admin(array['administrador'::public.admin_role]) then
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

alter table public.quote_requests enable row level security;
alter table public.quote_request_status_history enable row level security;
alter table public.quote_request_notes enable row level security;
alter table public.quote_request_attachments enable row level security;
alter table public.admin_users enable row level security;

create policy quote_requests_admin_select
on public.quote_requests
for select
to authenticated
using ((select public.is_active_admin()));

create policy status_history_admin_select
on public.quote_request_status_history
for select
to authenticated
using ((select public.is_active_admin()));

create policy notes_admin_select
on public.quote_request_notes
for select
to authenticated
using ((select public.is_active_admin()));

create policy notes_admin_insert
on public.quote_request_notes
for insert
to authenticated
with check (
  (select public.is_active_admin())
  and author_id = (select auth.uid())
);

create policy notes_author_or_administrator_update
on public.quote_request_notes
for update
to authenticated
using (
  author_id = (select auth.uid())
  or (select public.is_active_admin(array['administrador'::public.admin_role]))
)
with check (
  author_id = (select auth.uid())
  or (select public.is_active_admin(array['administrador'::public.admin_role]))
);

create policy attachments_admin_select
on public.quote_request_attachments
for select
to authenticated
using ((select public.is_active_admin()));

create policy admin_users_read_self
on public.admin_users
for select
to authenticated
using (user_id = (select auth.uid()));

revoke all on table public.quote_requests from anon, authenticated;
revoke all on table public.quote_request_status_history from anon, authenticated;
revoke all on table public.quote_request_notes from anon, authenticated;
revoke all on table public.quote_request_attachments from anon, authenticated;
revoke all on table public.admin_users from anon, authenticated;

grant usage on schema public to anon, authenticated;
grant select on table public.quote_requests to authenticated;
grant select on table public.quote_request_status_history to authenticated;
grant select, insert, update on table public.quote_request_notes to authenticated;
grant select on table public.quote_request_attachments to authenticated;
grant select on table public.admin_users to authenticated;

revoke all on function public.is_active_admin(public.admin_role[]) from public, anon;
revoke all on function public.update_quote_request_status(uuid, public.quote_request_status, text) from public, anon;
revoke all on function public.archive_quote_request(uuid) from public, anon;
grant execute on function public.is_active_admin(public.admin_role[]) to authenticated;
grant execute on function public.update_quote_request_status(uuid, public.quote_request_status, text) to authenticated;
grant execute on function public.archive_quote_request(uuid) to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'quote-attachments',
  'quote-attachments',
  false,
  8388608,
  array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create policy quote_attachments_storage_admin_select
on storage.objects
for select
to authenticated
using (
  bucket_id = 'quote-attachments'
  and (select public.is_active_admin())
);
