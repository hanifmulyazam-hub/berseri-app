# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.

## Backend (Supabase)

1. Copy `.env.example` to `.env` and fill in your Supabase project's `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (Project Settings > API).
2. Run [supabase/schema.sql](supabase/schema.sql) in the Supabase SQL Editor. This creates all tables, the `warga_saldo` view, the `handle_new_user` trigger, and RLS policies.
3. Create a Storage bucket named `pickup-photos` (Storage > New bucket, public) — used for pickup request photos.
4. **Warga** accounts self-register from the login screen (email + password).
5. **Petugas / Bank / Admin** accounts are not self-serve — create them manually in Supabase Dashboard > Authentication > Add user:
   - Email: `<ID atau kode unit, lowercase>@staff.berseri.internal` (e.g. `dlh-001@staff.berseri.internal`, `bs-melati-01@staff.berseri.internal`)
   - Set a password, and under "User Metadata" add:
     ```json
     { "role": "petugas", "full_name": "Nama Petugas" }
     ```
     (`role` must be `petugas`, `bank`, or `admin`). For `bank` accounts, also set `profiles.bank_unit_id` afterwards (SQL Editor or Table Editor) to link the staff account to a row in `bank_units`.
   - The login screen for these roles takes the ID/kode unit (without the domain) + password.
