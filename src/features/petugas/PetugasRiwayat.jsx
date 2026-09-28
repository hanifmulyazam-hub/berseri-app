import { CheckCircle2 } from "lucide-react";
import { Card, IconBadge, SectionTitle } from "../shared/ui";
import { useAuth } from "../../context/AuthContext";
import { usePetugasHistory } from "./hooks";

export function PetugasRiwayat() {
  const { profile } = useAuth();
  const history = usePetugasHistory(profile?.id);

  return (
    <div className="space-y-4">
      <SectionTitle eyebrow="Selesai" title="Riwayat Tugas" />
      {history.length === 0 ? (
        <p className="text-sm ink-soft">Belum ada tugas yang diselesaikan.</p>
      ) : (
        history.map((r) => (
          <Card key={r.id} className="flex items-center gap-4" hoverable>
            <IconBadge icon={CheckCircle2} tone="primary" size={40} iconSize={18} />
            <div className="flex-1">
              <p className="font-semibold ink text-sm">{r.warga?.full_name ?? "Warga"}</p>
              <p className="chip ink-soft mt-1">
                {r.jenis} · {r.volume_kg ?? "?"} kg
              </p>
            </div>
            <span className="chip ink-soft">
              {new Date(r.created_at).toLocaleString("id-ID", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
            </span>
          </Card>
        ))
      )}
    </div>
  );
}
