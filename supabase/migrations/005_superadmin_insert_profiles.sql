-- Superadmin needs to be able to create a profiles row for a brand-new
-- staff member (Petugas/Bank Sampah/Admin) who was created directly in
-- Clerk and has never logged in — the only existing insert policy only
-- allows a signed-in user to insert their OWN row with role='warga'
-- (self-service signup), so a superadmin-driven "add this staff member"
-- flow had no policy to allow it at all.

create policy "profiles_insert_superadmin" on profiles
  for insert to authenticated
  with check (current_role_is('superadmin'));
