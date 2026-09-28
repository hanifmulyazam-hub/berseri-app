-- Berseri App schema
-- Run this once in the Supabase SQL editor (Dashboard > SQL Editor > New query).

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists bank_units (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text unique not null,
  kelurahan text not null,
  address text,
  open_hours text,
  lat double precision,
  lng double precision,
  saldo_unit numeric not null default 0,
  status text not null default 'Menunggu' check (status in ('Menunggu', 'Selesai', 'Ditolak')),
  created_at timestamptz not null default now()
);

create table if not exists profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null check (role in ('warga', 'petugas', 'bank', 'admin')),
  full_name text not null,
  phone text,
  address text,
  kelurahan text,
  bank_unit_id uuid references bank_units (id),
  poin integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists pickup_requests (
  id uuid primary key default gen_random_uuid(),
  warga_id uuid not null references profiles (id),
  jenis text not null check (jenis in ('Organik', 'Anorganik', 'B3')),
  volume_kg numeric,
  foto_url text,
  alamat text not null,
  lat double precision,
  lng double precision,
  status text not null default 'Dijadwalkan' check (status in ('Dijadwalkan', 'Dalam Perjalanan', 'Selesai', 'Ditolak')),
  petugas_id uuid references profiles (id),
  scheduled_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists bank_transactions (
  id uuid primary key default gen_random_uuid(),
  warga_id uuid not null references profiles (id),
  bank_unit_id uuid not null references bank_units (id),
  kategori text not null,
  berat_kg numeric,
  nilai_rp numeric not null,
  jenis text not null check (jenis in ('Setor', 'Tarik')),
  created_at timestamptz not null default now()
);

create or replace view warga_saldo as
select
  warga_id,
  coalesce(sum(case when jenis = 'Setor' then nilai_rp else -nilai_rp end), 0) as saldo
from bank_transactions
group by warga_id;

create table if not exists education_modules (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  kind text not null,
  content_url text,
  created_at timestamptz not null default now()
);

create table if not exists education_progress (
  id uuid primary key default gen_random_uuid(),
  warga_id uuid not null references profiles (id),
  module_id uuid not null references education_modules (id),
  percent integer not null default 0,
  completed_at timestamptz,
  unique (warga_id, module_id)
);

create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  warga_id uuid not null references profiles (id),
  icon text not null default 'bell',
  message text not null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- New-user trigger: mirrors auth.users into profiles using signup metadata
-- ---------------------------------------------------------------------------

create or replace function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, role, full_name, phone, address, kelurahan)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'role', 'warga'),
    coalesce(new.raw_user_meta_data ->> 'full_name', new.email),
    new.raw_user_meta_data ->> 'phone',
    new.raw_user_meta_data ->> 'address',
    new.raw_user_meta_data ->> 'kelurahan'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table profiles enable row level security;
alter table bank_units enable row level security;
alter table pickup_requests enable row level security;
alter table bank_transactions enable row level security;
alter table education_modules enable row level security;
alter table education_progress enable row level security;
alter table notifications enable row level security;

create or replace function current_role_is(target_role text)
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = target_role
  );
$$;

-- profiles
create policy "profiles_select_authenticated" on profiles
  for select to authenticated using (true);
create policy "profiles_update_own_or_admin" on profiles
  for update to authenticated
  using (id = auth.uid() or current_role_is('admin'));

-- bank_units
create policy "bank_units_select_authenticated" on bank_units
  for select to authenticated using (true);
create policy "bank_units_write_admin" on bank_units
  for all to authenticated
  using (current_role_is('admin'))
  with check (current_role_is('admin'));

-- pickup_requests
create policy "pickup_select_own_or_staff" on pickup_requests
  for select to authenticated
  using (
    warga_id = auth.uid()
    or current_role_is('petugas')
    or current_role_is('admin')
  );
create policy "pickup_insert_own" on pickup_requests
  for insert to authenticated
  with check (warga_id = auth.uid());
create policy "pickup_update_staff" on pickup_requests
  for update to authenticated
  using (current_role_is('petugas') or current_role_is('admin'));

-- bank_transactions
create policy "transactions_select_own_or_staff" on bank_transactions
  for select to authenticated
  using (
    warga_id = auth.uid()
    or current_role_is('bank')
    or current_role_is('admin')
  );
create policy "transactions_insert_bank_staff" on bank_transactions
  for insert to authenticated
  with check (
    current_role_is('bank')
    and bank_unit_id = (select bank_unit_id from profiles where id = auth.uid())
  );

-- education_modules
create policy "education_modules_select_authenticated" on education_modules
  for select to authenticated using (true);
create policy "education_modules_write_admin" on education_modules
  for all to authenticated
  using (current_role_is('admin'))
  with check (current_role_is('admin'));

-- education_progress
create policy "education_progress_own" on education_progress
  for all to authenticated
  using (warga_id = auth.uid())
  with check (warga_id = auth.uid());

-- notifications
create policy "notifications_own" on notifications
  for select to authenticated
  using (warga_id = auth.uid());
