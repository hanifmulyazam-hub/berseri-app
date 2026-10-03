import { Users, Package, Wallet } from "lucide-react";
import { Card, IconBadge, SectionTitle } from "../shared/ui";
import { useAdminStats } from "./hooks";

export function AdminMonitoring() {
  const stats = useAdminStats();

  const cards = stats
    ? [
        { l: "Warga Terdaftar", v: stats.wargaCount.toLocaleString("id-ID"), icon: Users, tone: "primary" },
        { l: "Volume Terkelola / Hari", v: `${stats.volumeKg.toFixed(1)} kg`, icon: Package, tone: "teal" },
        { l: "Nilai Ekonomi Tersalur", v: `Rp${stats.nilaiRp.toLocaleString("id-ID")}`, icon: Wallet, tone: "gold" },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((s) => (
          <Card key={s.l} hoverable>
            <IconBadge icon={s.icon} tone={s.tone} size={38} iconSize={16} />
            <p className="font-display text-2xl font-bold ink mt-3.5">{s.v}</p>
            <p className="chip ink-soft uppercase mt-1.5">{s.l}</p>
          </Card>
        ))}
      </div>

      <Card>
        <SectionTitle eyebrow="Per Wilayah" title="Volume Hari Ini" />
        {!stats || stats.wilayah.length === 0 ? (
          <p className="text-sm ink-soft">Belum ada setoran hari ini.</p>
        ) : (
          <ul className="space-y-3.5">
            {stats.wilayah.map((w) => (
              <li key={w.kelurahan} className="flex items-center justify-between text-sm">
                <span className="ink font-medium">{w.kelurahan}</span>
                <span className="font-mono ink-soft">{w.kg.toFixed(1)} kg</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
