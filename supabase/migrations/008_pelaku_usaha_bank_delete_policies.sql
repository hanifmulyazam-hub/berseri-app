-- Same gap as 006, but for the tables added in 007: no DELETE policy
-- existed on any of them, so superadmin had no way to clean up
-- erroneous or test data (confirmed live when a QA test deposit
-- in bank_manual_records could not be removed via the app).

create policy "pelaku_usaha_delete_superadmin" on pelaku_usaha
  for delete to authenticated
  using (current_role_is('superadmin'));

create policy "waste_management_records_delete_superadmin" on waste_management_records
  for delete to authenticated
  using (current_role_is('superadmin'));

create policy "waste_management_details_delete_superadmin" on waste_management_details
  for delete to authenticated
  using (current_role_is('superadmin'));

create policy "bank_waste_records_delete_superadmin" on bank_waste_records
  for delete to authenticated
  using (current_role_is('superadmin'));

create policy "bank_waste_details_delete_superadmin" on bank_waste_details
  for delete to authenticated
  using (current_role_is('superadmin'));

create policy "bank_manual_records_delete_superadmin" on bank_manual_records
  for delete to authenticated
  using (current_role_is('superadmin'));
