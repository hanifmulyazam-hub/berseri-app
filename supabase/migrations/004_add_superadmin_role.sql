-- Add a "superadmin" tier above "admin". Regular admins keep all their
-- existing powers (bank units, education content, pickup/transaction
-- oversight); only superadmin can change anyone's role or edit another
-- user's profile — that's what "Kelola Pengguna" gates on.

-- ---------------------------------------------------------------------------
-- 0. Drop policies that reference current_role_is('admin') so we can widen
--    the role check constraint safely.
-- ---------------------------------------------------------------------------

drop policy if exists "bank_units_write_admin" on bank_units;
drop policy if exists "pickup_select_own_or_staff" on pickup_requests;
drop policy if exists "pickup_update_staff" on pickup_requests;
drop policy if exists "transactions_select_own_or_staff" on bank_transactions;
drop policy if exists "education_modules_write_admin" on education_modules;
drop policy if exists "profiles_update_own_or_admin" on profiles;

alter table profiles drop constraint if exists profiles_role_check;
alter table profiles add constraint profiles_role_check
  check (role in ('warga', 'petugas', 'bank', 'admin', 'superadmin'));

-- ---------------------------------------------------------------------------
-- 1. New helper: true for both "admin" and "superadmin" — used everywhere
--    the old code meant "any Dinas LH staff", not specifically role-management.
-- ---------------------------------------------------------------------------

create or replace function is_admin_tier()
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from profiles
    where id = (select auth.jwt() ->> 'sub')
    and role in ('admin', 'superadmin')
  );
$$;

-- ---------------------------------------------------------------------------
-- 2. Recreate the admin-tier policies using is_admin_tier() instead of the
--    old exact current_role_is('admin') check.
-- ---------------------------------------------------------------------------

create policy "bank_units_write_admin" on bank_units
  for all to authenticated
  using (is_admin_tier())
  with check (is_admin_tier());

create policy "pickup_select_own_or_staff" on pickup_requests
  for select to authenticated
  using (
    warga_id = (select auth.jwt() ->> 'sub')
    or current_role_is('petugas')
    or is_admin_tier()
  );

create policy "pickup_update_staff" on pickup_requests
  for update to authenticated
  using (current_role_is('petugas') or is_admin_tier());

create policy "transactions_select_own_or_staff" on bank_transactions
  for select to authenticated
  using (
    warga_id = (select auth.jwt() ->> 'sub')
    or current_role_is('bank')
    or is_admin_tier()
  );

create policy "education_modules_write_admin" on education_modules
  for all to authenticated
  using (is_admin_tier())
  with check (is_admin_tier());

-- ---------------------------------------------------------------------------
-- 3. profiles: only superadmin may touch someone else's row or change a
--    role (including their own). A plain admin can only edit their own
--    profile, same as everyone else, and can't change their own role.
-- ---------------------------------------------------------------------------

create policy "profiles_update_own_or_admin" on profiles
  for update to authenticated
  using (id = (select auth.jwt() ->> 'sub') or current_role_is('superadmin'))
  with check (
    current_role_is('superadmin')
    or (
      id = (select auth.jwt() ->> 'sub')
      and role = (select role from profiles where id = (select auth.jwt() ->> 'sub'))
    )
  );
