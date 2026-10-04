-- Add "Lainnya" category to Pelaku Usaha waste management records.

alter table public.waste_management_details
drop constraint if exists waste_management_details_category_check;

alter table public.waste_management_details
add constraint waste_management_details_category_check
check (
  category in (
    'Sisa bahan penyiapan makanan',
    'Sisa makanan',
    'Kertas/Karton',
    'Plastik',
    'Kaca',
    'Kain',
    'Karet',
    'Residu',
    'B3',
    'Lainnya'
  )
);