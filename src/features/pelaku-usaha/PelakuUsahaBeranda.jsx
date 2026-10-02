import { Building2, ClipboardList, History, Recycle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export function PelakuUsahaBeranda() {
  const { profile } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <p className="chip ink-soft uppercase font-semibold mb-1">
          Pelaku Usaha
        </p>

        <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight">
          Selamat datang, {profile?.full_name || "Pelaku Usaha"}
        </h1>

        <p className="ink-soft text-sm mt-2 max-w-2xl">
          Catat dan pantau data pengelolaan sampah usaha atau instansi Anda
          melalui BERSERI.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-surface border border-line rounded-2xl p-5 shadow-soft">
          <div className="w-10 h-10 rounded-xl bg-primary-tint flex items-center justify-center mb-4">
            <Recycle size={19} className="text-primary" />
          </div>

          <p className="font-display font-bold text-lg">
            Input Data
          </p>

          <p className="text-sm ink-soft mt-1">
            Catat sampah tertangani dan tidak tertangani berdasarkan kategori.
          </p>
        </div>

        <div className="bg-surface border border-line rounded-2xl p-5 shadow-soft">
          <div className="w-10 h-10 rounded-xl bg-teal-tint flex items-center justify-center mb-4">
            <History size={19} className="text-teal" />
          </div>

          <p className="font-display font-bold text-lg">
            Riwayat Pencatatan
          </p>

          <p className="text-sm ink-soft mt-1">
            Lihat kembali data pengelolaan sampah yang telah dicatat.
          </p>
        </div>

        <div className="bg-surface border border-line rounded-2xl p-5 shadow-soft">
          <div className="w-10 h-10 rounded-xl bg-gold-tint flex items-center justify-center mb-4">
            <Building2 size={19} className="text-gold" />
          </div>

          <p className="font-display font-bold text-lg">
            Pelaporan Terintegrasi
          </p>

          <p className="text-sm ink-soft mt-1">
            Data pencatatan tersimpan untuk kebutuhan pelaporan pengelolaan
            sampah.
          </p>
        </div>
      </div>

      <div className="bg-surface border border-line rounded-2xl p-5">
        <div className="flex items-start gap-3">
          <ClipboardList size={20} className="text-primary shrink-0 mt-0.5" />

          <div>
            <p className="font-semibold">Alur pencatatan</p>
            <p className="text-sm ink-soft mt-1">
              Pilih tanggal pencatatan, masukkan berat sampah tertangani dan
              tidak tertangani pada setiap kategori, lalu simpan data.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}