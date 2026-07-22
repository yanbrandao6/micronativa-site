alter table public.quote_requests
  alter column protocol_year set default extract(year from now())::smallint,
  alter column protocol set default 'MN-0000-000000';

comment on column public.quote_requests.protocol is
  'Placeholder default for generated API types; prepare_quote_request always replaces it atomically before insert.';
