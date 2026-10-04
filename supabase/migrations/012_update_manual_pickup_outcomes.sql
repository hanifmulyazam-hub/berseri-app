create or replace function public.complete_manual_pickup(
  p_producer_name text,
  p_address text,
  p_pickup_date timestamptz,
  p_actual_volume_kg numeric,
  p_waste_source text,
  p_compositions jsonb,
  p_result_photo_url text,
  p_admin_id text
)
returns uuid
language plpgsql
set search_path to 'public'
as $function$
declare
  v_result_id uuid;
  v_total_weight numeric;
begin
  -- Hanya admin yang boleh mencatat pickup manual.
  if not public.is_admin_tier() then
    raise exception 'Akses ditolak. Hanya admin yang dapat mencatat pickup manual.';
  end if;

  -- Data utama wajib valid.
  if trim(coalesce(p_producer_name, '')) = '' then
    raise exception 'Nama penghasil sampah wajib diisi.';
  end if;

  if trim(coalesce(p_address, '')) = '' then
    raise exception 'Alamat wajib diisi.';
  end if;

  if p_pickup_date is null then
    raise exception 'Tanggal pickup wajib diisi.';
  end if;

  if p_actual_volume_kg is null or p_actual_volume_kg <= 0 then
    raise exception 'Berat aktual harus lebih dari 0 kg.';
  end if;

  if trim(coalesce(p_waste_source, '')) = '' then
    raise exception 'Sumber sampah wajib diisi.';
  end if;

  -- Berat tertangani/tidak tertangani tidak boleh negatif.
  if exists (
    select 1
    from jsonb_each(p_compositions)
    where coalesce((value ->> 'handled')::numeric, 0) < 0
       or coalesce((value ->> 'unhandled')::numeric, 0) < 0
  ) then
    raise exception 'Berat komposisi tidak boleh negatif.';
  end if;

  -- Total seluruh kategori harus sama dengan berat aktual.
  select coalesce(
    sum(
      coalesce((value ->> 'handled')::numeric, 0) +
      coalesce((value ->> 'unhandled')::numeric, 0)
    ),
    0
  )
  into v_total_weight
  from jsonb_each(p_compositions);

  if abs(v_total_weight - p_actual_volume_kg) >= 0.001 then
    raise exception
      'Total komposisi sampah harus sama dengan berat aktual.';
  end if;

  -- Simpan hasil pickup manual.
  insert into public.pickup_results (
    pickup_id,
    pickup_source,
    berat_actual,
    sumber_sampah,
    result_photo_url,
    completed_at,
    created_by,
    nama_penghasil,
    alamat
  )
  values (
    null,
    'manual',
    p_actual_volume_kg,
    p_waste_source,
    p_result_photo_url,
    p_pickup_date,
    p_admin_id,
    trim(p_producer_name),
    trim(p_address)
  )
  returning id into v_result_id;

  -- Simpan komposisi.
  -- Percentage tetap dipertahankan untuk compatibility,
  -- tetapi sekarang dihitung otomatis dari berat kategori.
  insert into public.pickup_compositions (
    pickup_result_id,
    category,
    percentage,
    handled_kg,
    unhandled_kg
  )
  select
    v_result_id,
    key,
    (
      (
        coalesce((value ->> 'handled')::numeric, 0) +
        coalesce((value ->> 'unhandled')::numeric, 0)
      ) / p_actual_volume_kg
    ) * 100,
    coalesce((value ->> 'handled')::numeric, 0),
    coalesce((value ->> 'unhandled')::numeric, 0)
  from jsonb_each(p_compositions)
  where
    coalesce((value ->> 'handled')::numeric, 0) > 0
    or coalesce((value ->> 'unhandled')::numeric, 0) > 0;

  return v_result_id;
end;
$function$;