import { Building2, Check, X } from "lucide-react";
import { Card, IconBadge, SectionTitle, StatusChip } from "../shared/ui";
import { setBankUnitStatus, useBankUnitsAdmin } from "./hooks";

export function AdminKelembagaan() {
  const { units, reload } = useBankUnitsAdmin();

  const decide = async (id, status) => {
    await setBankUnitStatus(id, status);
    reload();
  };

  return (
    <div className="space-y-4">
      <SectionTitle eyebrow="Verifikasi" title="Kelola Kelembagaan Bank Sampah" />
      {units.length === 0 ? (
        <p className="text-sm ink-soft">Belum ada unit bank sampah terdaftar.</p>
      ) : (
        units.map((u) => (
          <Card key={u.id} className="flex items-center gap-4" hoverable>
            <IconBadge icon={Building2} tone="primary" size={44} iconSize={18} />
            <div className="flex-1">
              <p className="font-semibold ink text-sm">{u.name}</p>
              <p className="chip ink-soft mt-1">{u.kelurahan}</p>
            </div>
            {u.status === "Menunggu" ? (
              <div className="flex gap-2">
                <button
                  onClick={() => decide(u.id, "Selesai")}
                  className="tap w-9 h-9 rounded-full bg-primary-tint text-primary flex items-center justify-center"
                >
                  <Check size={16} />
                </button>
                <button
                  onClick={() => decide(u.id, "Ditolak")}
                  className="tap w-9 h-9 rounded-full bg-clay-tint text-clay flex items-center justify-center"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <StatusChip status={u.status} />
            )}
          </Card>
        ))
      )}
    </div>
  );
}
