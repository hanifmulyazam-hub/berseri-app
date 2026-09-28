import { Navigation } from "lucide-react";
import { Card, SectionTitle, StatusChip } from "../shared/ui";
import { useAuth } from "../../context/AuthContext";
import { advanceTask, usePetugasTasks } from "./hooks";

export function PetugasTugas() {
  const { profile } = useAuth();
  const { tasks, reload } = usePetugasTasks();

  const handleAdvance = async (task) => {
    await advanceTask(task, profile.id);
    reload();
  };

  return (
    <div className="space-y-4">
      <SectionTitle eyebrow={`${tasks.length} tugas tersisa`} title="Tugas Hari Ini" />
      {tasks.length === 0 ? (
        <p className="text-sm ink-soft">Tidak ada tugas pickup saat ini.</p>
      ) : (
        tasks.map((t) => (
          <Card key={t.id} hoverable>
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl bg-primary-tint flex items-center justify-center shrink-0 font-mono font-bold text-primary text-xs text-center">
                {t.scheduled_at
                  ? new Date(t.scheduled_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
                  : "—"}
              </div>
              <div className="flex-1">
                <p className="font-semibold ink">{t.warga?.full_name ?? "Warga"}</p>
                <p className="text-sm ink-soft mt-0.5">{t.alamat}</p>
                <p className="chip ink-soft mt-1.5">
                  {t.jenis} · {t.volume_kg ?? "?"} kg (est.)
                </p>
              </div>
              {t.foto_url && (
                <a href={t.foto_url} target="_blank" rel="noreferrer" className="tap shrink-0">
                  <img
                    src={t.foto_url}
                    alt="Foto sampah"
                    className="w-14 h-14 rounded-xl object-cover border border-line"
                  />
                </a>
              )}
              <StatusChip status={t.status} />
            </div>
            <div className="flex gap-2 mt-4">
              <button className="tap flex-1 border border-line rounded-lg py-2.5 text-sm font-semibold ink flex items-center justify-center gap-2 hover:bg-paper">
                <Navigation size={15} /> Navigasi
              </button>
              <button
                onClick={() => handleAdvance(t)}
                className="tap btn-primary flex-1 text-white rounded-lg py-2.5 text-sm font-semibold"
              >
                {t.status === "Dijadwalkan" ? "Mulai Perjalanan" : "Input Hasil Pickup"}
              </button>
            </div>
          </Card>
        ))
      )}
    </div>
  );
}
