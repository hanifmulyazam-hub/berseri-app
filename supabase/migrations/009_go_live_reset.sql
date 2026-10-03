-- One-time go-live reset: wipe every operational/transactional table, and
-- delete every profile except the two real superadmin accounts that should
-- survive into production. Run once manually in the Supabase SQL Editor —
-- this is destructive and not meant to be part of the normal migration
-- history replay.
--
-- Kept profiles (real superadmin accounts):
--   user_3Jl8GtrEto3ZKOBP8x2FUMUrwIN  (hanifmulyazam2@gmail.com)
--   user_3Jwv45DvFUM6ps3brYajeVdjPI9  (d.radju25@gmail.com)
-- Every other profile row (QA/test accounts, legacy pre-Clerk rows, and
-- any profile whose Clerk account no longer exists) is deleted along with
-- all of its activity data.

-- Children first, respecting foreign keys.
delete from waste_management_details;
delete from waste_management_records;
delete from pickup_compositions;
delete from pickup_results;
delete from pickup_requests;
delete from bank_manual_records;
delete from bank_transactions;
delete from notifications;
delete from education_progress;
delete from pelaku_usaha;

-- Accounts: everyone except the two real superadmins. Must run before
-- bank_units — a deleted profile (QA Bank Sampah) still pointed at it via
-- profiles.bank_unit_id.
delete from profiles
where id not in (
  'user_3Jl8GtrEto3ZKOBP8x2FUMUrwIN',
  'user_3Jwv45DvFUM6ps3brYajeVdjPI9'
);

-- Parent reference tables last.
delete from bank_units;
