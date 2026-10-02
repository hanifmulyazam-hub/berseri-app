import { useEffect, useState } from "react";
import { Sparkles, Bell, LogOut } from "lucide-react";
import { TOKENS, ROLES, NAV } from "./features/shared/tokens";
import { LoginScreen } from "./features/auth/LoginScreen";

import { PelakuUsahaOnboarding } from "./features/pelaku-usaha/PelakuUsahaOnboarding";

import { useAuth } from "./context/AuthContext";

import { WargaBeranda } from "./features/warga/WargaBeranda";
import { WargaPickup } from "./features/warga/WargaPickup";
import { WargaBank } from "./features/warga/WargaBank";
import { WargaEdukasi } from "./features/warga/WargaEdukasi";
import { WargaPeta } from "./features/warga/WargaPeta";
// import { PetugasTugas } from "./features/petugas/PetugasTugas";
// import { PetugasRiwayat } from "./features/petugas/PetugasRiwayat";
import { BankScan } from "./features/bank/BankScan";
import { BankRekap } from "./features/bank/BankRekap";
import { BankPengelolaan } from "./features/bank/BankPengelolaan";
import { BankRiwayat } from "./features/bank/BankRiwayat";

import { AdminMonitoring } from "./features/admin/AdminMonitoring";
import { AdminKelembagaan } from "./features/admin/AdminKelembagaan";
import { AdminPengguna } from "./features/admin/AdminPengguna";
import { AdminSOP } from "./features/admin/AdminSOP";
import { AdminLaporan } from "./features/admin/AdminLaporan";
import { AdminPickup } from "./features/admin/AdminPickup";
import { AdminPickupManual } from "./features/admin/AdminPickupManual";
import { AdminRiwayatPickup } from "./features/admin/AdminRiwayatPickup";
import { AdminPickupPage } from "./features/admin/AdminPickupPage";

import { PelakuUsahaBeranda } from "./features/pelaku-usaha/PelakuUsahaBeranda";
import { PelakuUsahaPengelolaan } from "./features/pelaku-usaha/PelakuUsahaPengelolaan";
import { PelakuUsahaRiwayat } from "./features/pelaku-usaha/PelakuUsahaRiwayat";

const CONTENT_MAP = {
  "warga-beranda": WargaBeranda,
  "warga-pickup": WargaPickup,
  "warga-banksampah": WargaBank,
  "warga-edukasi": WargaEdukasi,
  "warga-peta": WargaPeta,
  // "petugas-tugas": PetugasTugas,
  // "petugas-riwayat": PetugasRiwayat,
  "bank-scan": BankScan,
  "bank-rekap": BankRekap,
  "bank-pengelolaan": BankPengelolaan,
  "bank-riwayat": BankRiwayat,

  "admin-monitoring": AdminMonitoring,
  "admin-kelembagaan": AdminKelembagaan,
  "admin-sop": AdminSOP,
  "admin-pickup": AdminPickup,
  "admin-pickup-manual": AdminPickupPage,
  "admin-riwayat-pickup": AdminRiwayatPickup,
  "admin-laporan": AdminLaporan,
  "superadmin-monitoring": AdminMonitoring,
  "superadmin-kelembagaan": AdminKelembagaan,
  "superadmin-pengguna": AdminPengguna,
  "superadmin-sop": AdminSOP,
  "superadmin-laporan": AdminLaporan,

  "pelaku_usaha-beranda": PelakuUsahaBeranda,
  "pelaku_usaha-pengelolaan": PelakuUsahaPengelolaan,
  "pelaku_usaha-riwayat": PelakuUsahaRiwayat,
};

export default function BerseriApp() {
  const { session, profile, profileError, role, loading, signOut } = useAuth();
  const [tab, setTab] = useState(null);
  // Superadmin can browse the app "as" any role, purely a UI switch — data
  // access is still governed by their real role via RLS, not this.
  const [viewRole, setViewRole] = useState(null);
  const isSuperadmin = role === "superadmin";
  const activeRole = isSuperadmin && viewRole ? viewRole : role;

  useEffect(() => {
    if (role) setViewRole(role);
  }, [role]);

  useEffect(() => {
    if (activeRole) setTab(NAV[activeRole][0].id);
  }, [activeRole]);

  if (loading) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <style>{TOKENS}</style>
        <p className="chip ink-soft">Memuat…</p>
      </div>
    );
  }

  // Signed in to Clerk, but no matching profiles row (and none could be
  // auto-created) — surface this instead of silently looping back to login.
  if (session && !role) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center p-6">
        <style>{TOKENS}</style>
        <div className="max-w-md text-center space-y-3">
          <p className="font-semibold">Akun Anda sudah masuk, tapi profilnya belum ada.</p>
          {profileError && (
            <p className="chip bg-clay-tint text-clay px-3.5 py-2.5 rounded-xl inline-block">{profileError}</p>
          )}
          <p className="chip ink-soft">
            Kalau ini akun Bank/Admin, minta Admin Dinas LH menambahkan profil Anda di database.
            Kalau ini seharusnya akun Warga, coba keluar lalu daftar ulang.
          </p>
          <button onClick={signOut} className="tap btn-primary text-white font-semibold rounded-xl px-5 py-2.5">
            Keluar
          </button>
        </div>
      </div>
    );
  }

  if (!session || !tab) {
    return (
      <>
        <style>{TOKENS}</style>
        <LoginScreen />
      </>
    );
  }

  const Content = CONTENT_MAP[`${activeRole}-${tab}`];
  const RoleIcon = ROLES.find((r) => r.id === activeRole).icon;

  return (
    <PelakuUsahaOnboardingGate role={role}>
      <div className="min-h-screen bg-paper font-body ink">
      <style>{TOKENS}</style>

      {/* Top bar */}
      <header className="sticky top-0 z-20 bg-surface relative">
        <div className="max-w-6xl mx-auto px-5 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl radiance flex items-center justify-center shrink-0 shadow-soft">
              <Sparkles size={17} className="text-white" />
            </div>
            <div>
              <p className="font-display font-bold text-lg leading-tight tracking-tight">BERSERI</p>
              <p className="chip ink-soft leading-tight -mt-0.5">Bersih Sampah Setiap Hari</p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2 chip ink-soft font-semibold">
            <RoleIcon size={14} /> {profile?.full_name} · {ROLES.find((r) => r.id === activeRole).label}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isSuperadmin && (
              <select
                value={viewRole ?? role}
                onChange={(e) => setViewRole(e.target.value)}
                title="Lihat sebagai peran lain"
                className="tap chip border border-line rounded-xl px-2.5 py-2 font-semibold bg-surface"
              >
                {ROLES.map((r) => (
                  <option key={r.id} value={r.id}>
                    Lihat sebagai: {r.label}
                  </option>
                ))}
              </select>
            )}
            <button className="tap w-9 h-9 rounded-full bg-paper flex items-center justify-center hover:bg-primary-tint">
              <Bell size={16} className="ink-soft" />
            </button>
            <button
              onClick={signOut}
              className="tap w-9 h-9 rounded-full bg-paper flex items-center justify-center hover:bg-clay-tint hover:text-clay"
              title="Keluar"
            >
              <LogOut size={16} className="ink-soft" />
            </button>
          </div>
        </div>

        <div className="spectrum h-[3px] w-full" />
      </header>

      <div className="max-w-[1440px] mx-auto flex">
        {/* Sidebar */}
        <aside className="hidden md:block w-56 shrink-0 border-r border-line min-h-[calc(100vh-77px)] px-4 py-6">
          <div className="chip ink-soft uppercase px-2 mb-3 flex items-center gap-1.5 font-semibold">
            <RoleIcon size={12} /> Mode {ROLES.find((r) => r.id === activeRole).label}
          </div>
          <nav className="space-y-1">
            {NAV[activeRole].map((item) => (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className={`tap relative w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-medium overflow-hidden ${
                  tab === item.id ? "bg-primary-tint text-primary font-semibold" : "ink-soft hover:bg-paper"
                }`}
              >
                {tab === item.id && <span className="spectrum absolute left-0 top-0 bottom-0 w-[3px]" />}
                <item.icon size={16} />
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 px-5 py-6 pb-24 md:pb-6 min-w-0">
          <div key={`${activeRole}-${tab}`} className="fade-up">
            {Content && <Content />}
          </div>
        </main>
      </div>

      {/* Mobile bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-line flex z-20 px-2 py-1.5 shadow-lift">
        {NAV[activeRole].map((item) => (
          <button
            key={item.id}
            onClick={() => setTab(item.id)}
            className={`tap flex-1 flex flex-col items-center gap-1 py-2 rounded-xl ${
              tab === item.id ? "bg-primary-tint text-primary" : "ink-soft"
            }`}
          >
            <item.icon size={18} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  </PelakuUsahaOnboardingGate>
  );
}

function PelakuUsahaOnboardingGate({ role, children }) {
  if (role !== "pelaku_usaha") {
    return children;
  }

  return (
    <PelakuUsahaOnboarding>
      {children}
    </PelakuUsahaOnboarding>
  );
}
