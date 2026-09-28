-- Migrate profiles/RLS from Supabase Auth to Clerk (Third-Party Auth).
-- Run this once in the Supabase SQL editor AFTER enabling Clerk under
-- Authentication > Sign In / Providers > Third Party Auth.
--
-- Existing rows created under the old Supabase Auth system are kept as-is,
-- but they won't match any Clerk user id going forward — anyone who needs
-- access again (including staff/admin) must be re-created under Clerk and
-- get a fresh profiles row (see README note on staff provisioning).

-- ---------------------------------------------------------------------------
-- 0. Drop everything that depends on the columns we're about to retype:
--    the old Supabase-Auth trigger, every RLS policy on the affected
--    tables, and the current_role_is() helper (a `language sql` function,
--    which — like a view — registers a hard dependency on the columns it
--    reads, so it blocks ALTER COLUMN TYPE just like a policy would).
-- ---------------------------------------------------------------------------

drop trigger if exists on_auth_user_created on auth.users;
drop function if exists handle_new_user();

drop policy if exists "profiles_select_authenticated" on profiles;
drop policy if exists "profiles_update_own_or_admin" on profiles;
drop policy if exists "bank_units_select_authenticated" on bank_units;
drop policy if exists "bank_units_write_admin" on bank_units;
drop policy if exists "pickup_select_own_or_staff" on pickup_requests;
drop policy if exists "pickup_insert_own" on pickup_requests;
drop policy if exists "pickup_update_staff" on pickup_requests;
drop policy if exists "transactions_select_own_or_staff" on bank_transactions;
drop policy if exists "transactions_insert_bank_staff" on bank_transactions;
drop policy if exists "education_modules_select_authenticated" on education_modules;
drop policy if exists "education_modules_write_admin" on education_modules;
drop policy if exists "education_progress_own" on education_progress;
drop policy if exists "notifications_own" on notifications;

drop function if exists current_role_is(text);

-- warga_saldo reads bank_transactions.warga_id, so it blocks that column's
-- type change the same way a policy would.
drop view if exists warga_saldo;

-- ---------------------------------------------------------------------------
-- 1. Drop the foreign keys that point at profiles(id) — you can't change
--    profiles.id's type while another table's column still references it
--    with a mismatched type.
-- ---------------------------------------------------------------------------

alter table profiles drop constraint if exists profiles_id_fkey;
alter table pickup_requests drop constraint if exists pickup_requests_warga_id_fkey;
alter table pickup_requests drop constraint if exists pickup_requests_petugas_id_fkey;
alter table bank_transactions drop constraint if exists bank_transactions_warga_id_fkey;
alter table education_progress drop constraint if exists education_progress_warga_id_fkey;
alter table notifications drop constraint if exists notifications_warga_id_fkey;

-- ---------------------------------------------------------------------------
-- 2. profiles.id switches from a Supabase auth.users uuid to Clerk's user id
--    (a string like "user_2abc..."); every column that references it follows.
-- ---------------------------------------------------------------------------

alter table profiles alter column id type text using id::text;
alter table pickup_requests alter column warga_id type text using warga_id::text;
alter table pickup_requests alter column petugas_id type text using petugas_id::text;
alter table bank_transactions alter column warga_id type text using warga_id::text;
alter table education_progress alter column warga_id type text using warga_id::text;
alter table notifications alter column warga_id type text using warga_id::text;

-- ---------------------------------------------------------------------------
-- 3. Re-add the foreign keys now that both sides are `text`.
-- ---------------------------------------------------------------------------

alter table pickup_requests add constraint pickup_requests_warga_id_fkey foreign key (warga_id) references profiles (id);
alter table pickup_requests add constraint pickup_requests_petugas_id_fkey foreign key (petugas_id) references profiles (id);
alter table bank_transactions add constraint bank_transactions_warga_id_fkey foreign key (warga_id) references profiles (id);
alter table education_progress add constraint education_progress_warga_id_fkey foreign key (warga_id) references profiles (id);
alter table notifications add constraint notifications_warga_id_fkey foreign key (warga_id) references profiles (id);

create or replace view warga_saldo as
select
  warga_id,
  coalesce(sum(case when jenis = 'Setor' then nilai_rp else -nilai_rp end), 0) as saldo
from bank_transactions
group by warga_id;

-- ---------------------------------------------------------------------------
-- 4. Recreate the role helper against Clerk's JWT "sub" claim.
-- ---------------------------------------------------------------------------

create function current_role_is(target_role text)
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from profiles
    where id = (select auth.jwt() ->> 'sub')
    and role = target_role
  );
$$;

-- ---------------------------------------------------------------------------
-- 5. Recreate every policy, pointed at Clerk's JWT "sub" instead of auth.uid().
-- ---------------------------------------------------------------------------

create policy "profiles_select_authenticated" on profiles
  for select to authenticated using (true);
create policy "profiles_update_own_or_admin" on profiles
  for update to authenticated
  using (id = (select auth.jwt() ->> 'sub') or current_role_is('admin'));
-- New: lets a freshly signed-up Warga create their own profile row
-- client-side (the app does this on first login; there's no DB trigger now).
create policy "profiles_insert_self_warga" on profiles
  for insert to authenticated
  with check (id = (select auth.jwt() ->> 'sub') and role = 'warga');

create policy "bank_units_select_authenticated" on bank_units
  for select to authenticated using (true);
create policy "bank_units_write_admin" on bank_units
  for all to authenticated
  using (current_role_is('admin'))
  with check (current_role_is('admin'));

create policy "pickup_select_own_or_staff" on pickup_requests
  for select to authenticated
  using (
    warga_id = (select auth.jwt() ->> 'sub')
    or current_role_is('petugas')
    or current_role_is('admin')
  );
create policy "pickup_insert_own" on pickup_requests
  for insert to authenticated
  with check (warga_id = (select auth.jwt() ->> 'sub'));
create policy "pickup_update_staff" on pickup_requests
  for update to authenticated
  using (current_role_is('petugas') or current_role_is('admin'));

create policy "transactions_select_own_or_staff" on bank_transactions
  for select to authenticated
  using (
    warga_id = (select auth.jwt() ->> 'sub')
    or current_role_is('bank')
    or current_role_is('admin')
  );
create policy "transactions_insert_bank_staff" on bank_transactions
  for insert to authenticated
  with check (
    current_role_is('bank')
    and bank_unit_id = (select bank_unit_id from profiles where id = (select auth.jwt() ->> 'sub'))
  );

create policy "education_modules_select_authenticated" on education_modules
  for select to authenticated using (true);
create policy "education_modules_write_admin" on education_modules
  for all to authenticated
  using (current_role_is('admin'))
  with check (current_role_is('admin'));

create policy "education_progress_own" on education_progress
  for all to authenticated
  using (warga_id = (select auth.jwt() ->> 'sub'))
  with check (warga_id = (select auth.jwt() ->> 'sub'));

create policy "notifications_own" on notifications
  for select to authenticated
  using (warga_id = (select auth.jwt() ->> 'sub'));
