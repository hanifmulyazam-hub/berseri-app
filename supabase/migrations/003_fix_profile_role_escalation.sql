-- profiles_update_own_or_admin (from 002_clerk_auth.sql) let any signed-in
-- user update every column of their own row, including `role` — meaning a
-- Warga could silently promote themselves to admin. This restricts a
-- non-admin's update to leaving `role` unchanged; only an admin can change
-- someone's role (including their own).

drop policy if exists "profiles_update_own_or_admin" on profiles;
create policy "profiles_update_own_or_admin" on profiles
  for update to authenticated
  using (id = (select auth.jwt() ->> 'sub') or current_role_is('admin'))
  with check (
    current_role_is('admin')
    or (
      id = (select auth.jwt() ->> 'sub')
      and role = (select role from profiles where id = (select auth.jwt() ->> 'sub'))
    )
  );
