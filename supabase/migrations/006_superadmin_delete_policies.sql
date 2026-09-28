-- No DELETE policy existed on any operational table (profiles included) —
-- RLS defaults to deny, so nothing could ever be deleted via the app,
-- even by a superadmin. This adds DELETE for superadmin only on the
-- operational/business tables (deliberately NOT on profiles — accounts
-- should stay even when their activity data is cleared).

create policy "bank_units_delete_superadmin" on bank_units
  for delete to authenticated
  using (current_role_is('superadmin'));

create policy "pickup_requests_delete_superadmin" on pickup_requests
  for delete to authenticated
  using (current_role_is('superadmin'));

create policy "bank_transactions_delete_superadmin" on bank_transactions
  for delete to authenticated
  using (current_role_is('superadmin'));

create policy "education_modules_delete_superadmin" on education_modules
  for delete to authenticated
  using (current_role_is('superadmin'));

create policy "education_progress_delete_superadmin" on education_progress
  for delete to authenticated
  using (current_role_is('superadmin'));

create policy "notifications_delete_superadmin" on notifications
  for delete to authenticated
  using (current_role_is('superadmin'));
