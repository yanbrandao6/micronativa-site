alter table public.quote_requests
  add column submission_completed_at timestamptz;

drop index public.quote_requests_status_created_at_idx;
drop index public.quote_requests_service_created_at_idx;
drop index public.quote_requests_city_idx;

create index quote_requests_status_created_at_idx
  on public.quote_requests (status, created_at desc)
  where archived_at is null and submission_completed_at is not null;

create index quote_requests_service_created_at_idx
  on public.quote_requests (service, created_at desc)
  where archived_at is null and submission_completed_at is not null;

create index quote_requests_city_idx
  on public.quote_requests (city)
  where archived_at is null and submission_completed_at is not null;

drop policy quote_requests_admin_select on public.quote_requests;
create policy quote_requests_admin_select
on public.quote_requests
for select
to authenticated
using (
  submission_completed_at is not null
  and (select public.is_active_admin())
);
