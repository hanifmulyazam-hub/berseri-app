import { MapPin, Users, Package, Wallet, CheckCircle2 } from "lucide-react";
import { Card, IconBadge, SectionTitle } from "../shared/ui";
import { useAdminStats } from "./hooks";

export function AdminMonitoring() {
  const stats = useAdminStats();

  const cards = stats
    ? [
        { l: "Warga Terdaftar", v: stats.wargaCount.toLocaleString("id-ID"), icon: Users, tone: "primary" },
        { l: "Volume Terkelola / Bulan", v: `${stats.volumeKg.toFixed(1)} kg`, icon: Package, tone: "teal" },
        { l: "Nilai Ekonomi Tersalur", v: `Rp${stats.nilaiRp.toLocaleString("id-ID")}`, icon: Wallet, tone: "gold" },
        { l: "Pickup Selesai / Bulan", v: stats.pickupSelesai.toLocaleString("id-ID"), icon: CheckCircle2, tone: "clay" },
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

      <div className="grid lg:grid-cols-5 gap-6">
        <Card className="lg:col-span-3 h-64 flex items-center justify-center bg-primary-tint">
          <div className="text-center ink-soft">
            <IconBadge icon={MapPin} tone="primary" size={48} iconSize={22} />
            <p className="chip mt-3">Peta sebaran volume sampah per wilayah</p>
          </div>
        </Card>
        <Card className="lg:col-span-2">
          <SectionTitle eyebrow="Per Wilayah" title="Volume Bulan Ini" />
          {!stats || stats.wilayah.length === 0 ? (
            <p className="text-sm ink-soft">Belum ada setoran bulan ini.</p>
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
    </div>
  );
}
