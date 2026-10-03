import {
  Home, Recycle, Wallet, BookOpen, MapPin, ClipboardList, Clock,
  QrCode, BarChart3, Building2, FileDown, Truck, ShieldCheck, Leaf, Store, UserCog, Crown,
} from "lucide-react";

export const TOKENS = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700;800&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap');
  :root{
    --ink:#12201A; --ink-soft:#57685C;
    --paper:#F5F6EE; --surface:#FFFFFF; --line:#E4E7D9;
    --primary:#1F6B4A; --primary-dark:#123C29; --primary-tint:#E4F0E8;
    --teal:#0F7E96; --teal-tint:#DFF1F4;
    --gold:#F2B705; --gold-tint:#FCF0CC; --gold-ink:#8A6A02;
    --clay:#C4552B; --clay-tint:#F6E4DA;
  }
  *{box-sizing:border-box;}
  .bg-paper{
    background-color:var(--paper);
    background-image: radial-gradient(circle, rgba(18,32,26,0.06) 1px, transparent 1px);
    background-size: 20px 20px;
  }
  .bg-surface{background:var(--surface);}
  .ink{color:var(--ink);} .ink-soft{color:var(--ink-soft);}
  .bg-primary{background:var(--primary);} .text-primary{color:var(--primary);}
  .bg-primary-tint{background:var(--primary-tint);}
  .bg-teal{background:var(--teal);} .text-teal{color:var(--teal);} .bg-teal-tint{background:var(--teal-tint);}
  .bg-gold{background:var(--gold);} .text-gold{color:var(--gold-ink);} .bg-gold-tint{background:var(--gold-tint);}
  .bg-clay{background:var(--clay);} .text-clay{color:var(--clay);} .bg-clay-tint{background:var(--clay-tint);}
  .border-line{border-color:var(--line);}
  .font-display{font-family:'Space Grotesk',sans-serif; letter-spacing:-0.01em;}
  .font-body{font-family:'Inter',sans-serif;}
  .font-mono{font-family:'IBM Plex Mono',monospace;}

  .spectrum{background:linear-gradient(90deg, var(--primary), var(--gold), var(--teal));}
  .spectrum-underline{height:3px; width:26px; border-radius:99px;}

  .shadow-soft{box-shadow: 0 1px 2px rgba(18,32,26,0.05), 0 10px 26px -16px rgba(18,32,26,0.22);}
  .shadow-lift{box-shadow: 0 14px 30px -16px rgba(18,32,26,0.28);}
  .card-hover{transition: transform .18s ease, box-shadow .18s ease;}
  .card-hover:hover{transform: translateY(-3px); box-shadow: 0 16px 34px -16px rgba(18,32,26,0.24);}

  .btn-primary{
    background: linear-gradient(135deg, var(--primary), var(--primary-dark));
    box-shadow: 0 10px 22px -10px rgba(18,60,41,0.55);
    transition: transform .15s ease, box-shadow .15s ease;
  }
  .btn-primary:hover{ transform: translateY(-1px); box-shadow: 0 14px 26px -10px rgba(18,60,41,0.6); }
  .btn-primary:active{ transform: translateY(0px) scale(0.98); }

  .tap{transition:transform .15s ease, box-shadow .15s ease, background .15s ease;}
  .tap:active{transform:scale(0.97);}

  .chip{font-family:'IBM Plex Mono',monospace; font-size:11px; letter-spacing:.03em;}

  .ring-track{background:conic-gradient(var(--gold) var(--pct), rgba(255,255,255,0.16) var(--pct));
    box-shadow: 0 0 0 8px rgba(242,183,5,0.10);}

  .radiance{
    background:
      radial-gradient(circle at 26% 22%, rgba(242,183,5,0.40), transparent 42%),
      radial-gradient(circle at 82% 70%, rgba(15,126,150,0.35), transparent 45%),
      linear-gradient(160deg, var(--primary), var(--primary-dark) 75%);
    background-size: 160% 160%;
    animation: drift 14s ease-in-out infinite alternate;
    position:relative;
  }
  @keyframes drift{ from{background-position:0% 0%;} to{background-position:100% 55%;} }

  @keyframes fadeUp{ from{opacity:0; transform:translateY(10px);} to{opacity:1; transform:translateY(0);} }
  .fade-up{ animation: fadeUp .38s cubic-bezier(.2,.7,.3,1) both; }

  ::selection{background:var(--gold-tint);}
  ::-webkit-scrollbar{height:8px; width:8px;}
  ::-webkit-scrollbar-thumb{background:var(--line); border-radius:99px;}

  .login-shell{ display:flex; flex-direction:column; }
  .login-brand{ display:none; flex-direction:column; justify-content:space-between; min-height:440px; }
  .login-form{ width:100%; }
  @media (min-width:768px){
    .login-shell{ flex-direction:row; }
    .login-brand{ display:flex; width:50%; flex-shrink:0; }
    .login-form{ width:50%; }
  }
`;

export const ROLES = [
  { id: "warga", label: "Warga", icon: Leaf },
  { id: "pelaku_usaha", label: "Pelaku Usaha", icon: Building2 },
  { id: "petugas", label: "Petugas", icon: Truck },
  { id: "bank", label: "Bank Sampah", icon: Store },
  { id: "admin", label: "Admin Dinas LH", icon: ShieldCheck },
  { id: "superadmin", label: "Super Admin", icon: Crown },
];

export const NAV = {
  pelaku_usaha: [
    { id: "beranda", label: "Beranda", icon: Home },
    { id: "pengelolaan", label: "Input Data", icon: Recycle },
    { id: "riwayat", label: "Riwayat", icon: ClipboardList },
  ],
  warga: [
    { id: "beranda", label: "Beranda", icon: Home },
    // { id: "pickup", label: "Request Pickup", icon: Recycle },
    { id: "banksampah", label: "Bank Sampah", icon: Wallet },
    { id: "edukasi", label: "Edukasi", icon: BookOpen },
    { id: "peta", label: "Peta Unit", icon: MapPin },
  ],
  petugas: [
    { id: "tugas", label: "Tugas Hari Ini", icon: ClipboardList },
    { id: "riwayat", label: "Riwayat Tugas", icon: Clock },
  ],
  bank: [
    // Legacy operasional Bank Sampah — dipertahankan untuk rollback
    // { id: "scan", label: "Scan Member", icon: QrCode },

    { id: "rekap", label: "Beranda", icon: Home },
    { id: "pengelolaan", label: "Input Data", icon: Recycle },
    { id: "riwayat", label: "Riwayat", icon: ClipboardList },
  ],
  admin: [
    { id: "monitoring", label: "Monitoring", icon: BarChart3 },
    // { id: "pickup", label: "Kelola Pickup", icon: ClipboardList },
    { id: "pickup-manual", label: "Input Data Sampah", icon: Truck },
    // { id: "riwayat-pickup", label: "Riwayat Pickup", icon: Clock },
    { id: "kelembagaan", label: "Kelembagaan", icon: Building2 },
    { id: "sop", label: "SOP & Edukasi", icon: BookOpen },
    { id: "laporan", label: "Laporan", icon: FileDown },
  ],
  superadmin: [
    { id: "monitoring", label: "Monitoring", icon: BarChart3 },
    { id: "kelembagaan", label: "Kelembagaan", icon: Building2 },
    { id: "pengguna", label: "Kelola Pengguna", icon: UserCog },
    { id: "sop", label: "SOP & Edukasi", icon: BookOpen },
    { id: "laporan", label: "Laporan", icon: FileDown },
  ],
};
