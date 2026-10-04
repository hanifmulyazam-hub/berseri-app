-- Add handled/unhandled outcome weights to admin pickup compositions.
-- Keep percentage for compatibility with legacy pickup data.

alter table public.pickup_compositions
add column if not exists handled_kg numeric not null default 0
check (handled_kg >= 0);

alter table public.pickup_compositions
add column if not exists unhandled_kg numeric not null default 0
check (unhandled_kg >= 0);