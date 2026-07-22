create type public.quote_request_status as enum (
  'recebido',
  'em_analise',
  'contato_realizado',
  'aguardando_cliente',
  'visita_agendada',
  'proposta_enviada',
  'em_execucao',
  'concluido',
  'cancelado'
);

create type public.admin_role as enum (
  'administrador',
  'comercial',
  'tecnico'
);

create table public.quote_requests (
  id uuid primary key default gen_random_uuid(),
  idempotency_key uuid not null unique,
  protocol_sequence bigint generated always as identity,
  protocol_year smallint not null,
  protocol text not null unique,
  status public.quote_request_status not null default 'recebido',
  service text not null check (service in (
    'energia-solar',
    'cftv-seguranca',
    'automacao-portoes',
    'controle-acesso',
    'projeto-integrado',
    'manutencao'
  )),
  additional_services text[] not null default '{}',
  property_type text not null check (char_length(property_type) between 2 and 80),
  purpose text not null check (char_length(purpose) between 2 and 80),
  city text not null check (char_length(city) between 2 and 120),
  state text not null default 'PR' check (state ~ '^[A-Z]{2}$'),
  project_details jsonb not null default '{}'::jsonb check (jsonb_typeof(project_details) = 'object'),
  customer_name text not null check (char_length(customer_name) between 3 and 160),
  customer_phone text not null check (char_length(customer_phone) between 10 and 40),
  customer_phone_normalized text not null check (customer_phone_normalized ~ '^[0-9]{10,13}$'),
  customer_whatsapp text,
  customer_whatsapp_normalized text check (
    customer_whatsapp_normalized is null or customer_whatsapp_normalized ~ '^[0-9]{10,13}$'
  ),
  customer_email text not null check (char_length(customer_email) between 5 and 254),
  customer_email_normalized text not null check (
    customer_email_normalized = lower(customer_email_normalized)
    and char_length(customer_email_normalized) between 5 and 254
  ),
  preferred_contact_method text not null check (preferred_contact_method in ('WhatsApp', 'Telefone', 'E-mail')),
  privacy_consent_at timestamptz not null,
  source_page text not null default 'direct' check (char_length(source_page) between 1 and 100),
  project_reference text check (project_reference is null or char_length(project_reference) <= 160),
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint quote_requests_protocol_format check (protocol ~ '^MN-[0-9]{4}-[0-9]{6,}$')
);

create table public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role public.admin_role not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.quote_request_status_history (
  id uuid primary key default gen_random_uuid(),
  quote_request_id uuid not null references public.quote_requests(id) on delete cascade,
  previous_status public.quote_request_status,
  new_status public.quote_request_status not null,
  changed_by uuid references auth.users(id) on delete set null,
  public_message text not null check (char_length(public_message) between 1 and 500),
  created_at timestamptz not null default now()
);

create table public.quote_request_notes (
  id uuid primary key default gen_random_uuid(),
  quote_request_id uuid not null references public.quote_requests(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete restrict,
  content text not null check (char_length(btrim(content)) between 1 and 5000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.quote_request_attachments (
  id uuid primary key default gen_random_uuid(),
  quote_request_id uuid not null references public.quote_requests(id) on delete cascade,
  attachment_index smallint not null check (attachment_index between 1 and 6),
  storage_bucket text not null default 'quote-attachments' check (storage_bucket = 'quote-attachments'),
  storage_path text not null unique check (char_length(storage_path) between 3 and 500),
  original_name text not null check (char_length(original_name) between 1 and 255),
  mime_type text not null check (mime_type in ('image/jpeg', 'image/png', 'image/webp', 'application/pdf')),
  size_bytes bigint not null check (size_bytes between 1 and 8388608),
  created_at timestamptz not null default now(),
  unique (quote_request_id, attachment_index)
);

create index quote_requests_created_at_idx on public.quote_requests (created_at desc);
create index quote_requests_status_created_at_idx on public.quote_requests (status, created_at desc) where archived_at is null;
create index quote_requests_service_created_at_idx on public.quote_requests (service, created_at desc) where archived_at is null;
create index quote_requests_city_idx on public.quote_requests (city) where archived_at is null;
create index quote_requests_email_normalized_idx on public.quote_requests (customer_email_normalized);
create index quote_requests_phone_normalized_idx on public.quote_requests (customer_phone_normalized);
create index quote_request_status_history_request_idx on public.quote_request_status_history (quote_request_id, created_at);
create index quote_request_notes_request_idx on public.quote_request_notes (quote_request_id, created_at desc);
create index quote_request_attachments_request_idx on public.quote_request_attachments (quote_request_id, attachment_index);

create function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create function public.default_public_status_message(status_value public.quote_request_status)
returns text
language sql
immutable
set search_path = ''
as $$
  select case status_value
    when 'recebido' then 'Recebemos sua solicitação.'
    when 'em_analise' then 'A solicitação está sendo analisada pela equipe.'
    when 'contato_realizado' then 'Nossa equipe realizou uma tentativa de contato.'
    when 'aguardando_cliente' then 'A solicitação aguarda um retorno do cliente.'
    when 'visita_agendada' then 'Uma visita técnica foi agendada.'
    when 'proposta_enviada' then 'A proposta foi preparada.'
    when 'em_execucao' then 'O serviço está em execução.'
    when 'concluido' then 'O serviço foi concluído.'
    when 'cancelado' then 'A solicitação foi cancelada.'
  end;
$$;

create function public.prepare_quote_request()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.status := 'recebido'::public.quote_request_status;
  new.protocol_year := extract(year from coalesce(new.created_at, now()))::smallint;
  new.protocol := format(
    'MN-%s-%s',
    new.protocol_year,
    lpad(new.protocol_sequence::text, 6, '0')
  );
  return new;
end;
$$;

create function public.record_initial_quote_status()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  insert into public.quote_request_status_history (
    quote_request_id,
    previous_status,
    new_status,
    changed_by,
    public_message
  ) values (
    new.id,
    null,
    new.status,
    null,
    public.default_public_status_message(new.status)
  );
  return new;
end;
$$;

create function public.record_quote_status_change()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  requested_message text;
begin
  if new.status is distinct from old.status then
    requested_message := nullif(btrim(current_setting('micronativa.public_status_message', true)), '');
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
      auth.uid(),
      coalesce(requested_message, public.default_public_status_message(new.status))
    );
  end if;
  return new;
end;
$$;

create trigger quote_requests_prepare_before_insert
before insert on public.quote_requests
for each row execute function public.prepare_quote_request();

create trigger quote_requests_initial_status_after_insert
after insert on public.quote_requests
for each row execute function public.record_initial_quote_status();

create trigger quote_requests_status_after_update
after update of status on public.quote_requests
for each row execute function public.record_quote_status_change();

create trigger quote_requests_touch_updated_at
before update on public.quote_requests
for each row execute function public.touch_updated_at();

create trigger quote_request_notes_touch_updated_at
before update on public.quote_request_notes
for each row execute function public.touch_updated_at();
