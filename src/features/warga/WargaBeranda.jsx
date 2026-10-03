import { CheckCircle2, Bell, Sparkles, Recycle, Star } from "lucide-react";
import { Card, IconBadge, SectionTitle, StatusChip } from "../shared/ui";
import { useAuth } from "../../context/AuthContext";
import { useNotifications, useWargaPickups } from "./hooks";

const NOTIF_ICONS = { bell: Bell, check: CheckCircle2, sparkles: Sparkles };

function timeAgo(iso) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diffMs / 3_600_000);
  if (hours < 1) return "Baru saja";
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  return days === 1 ? "Kemarin" : `${days} hari lalu`;
}

export function WargaBeranda() {
  const { profile } = useAuth();
  const notifications = useNotifications(profile?.id);
  const { pickups } = useWargaPickups(profile?.id);

  const activePickups = pickups.filter(
    (p) =>
      p.status === "Dijadwalkan" ||
      p.status === "Dalam Perjalanan"
  );

  return (
    <div className="space-y-6">
      <div className="radiance rounded-3xl p-7 text-white relative overflow-hidden shadow-lift">
        <div className="relative z-10">
          <div className="chip opacity-80 uppercase mb-2 tracking-wider">Halo, selamat datang</div>
          <h1 className="font-display text-3xl font-bold">{profile?.full_name ?? "Warga"}</h1>
          <p className="text-sm opacity-90 mt-2 max-w-xs leading-relaxed">
            {profile?.address ?? profile?.kelurahan ?? "Lengkapi alamat di profil Anda"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-2" hoverable>
          <SectionTitle eyebrow="Pickup" title="Pickup Aktif" />

          {activePickups.length > 0 ? (
            <div className="divide-y divide-line">
              {activePickups.map((pickup) => (
                <div
                  key={pickup.id}
                  className="flex items-center gap-4 py-4 first:pt-0 last:pb-0"
                >
                  <IconBadge
                    icon={Recycle}
                    tone="primary"
                    size={48}
                    iconSize={21}
                  />

                  <div className="flex-1">
                    <p className="font-semibold ink">
                      {pickup.jenis} — estimasi {pickup.volume_kg ?? "?"} kg
                    </p>
                    <p className="text-sm ink-soft mt-0.5">
                      {pickup.alamat}
                    </p>
                  </div>

                  <StatusChip status={pickup.status} />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm ink-soft">
              Belum ada pickup aktif.
            </p>
          )}
        </Card>
        <Card hoverable>
          <SectionTitle eyebrow="Poin" title="Badge" />
          <div className="flex items-center gap-3">
            <IconBadge icon={Star} tone="gold" size={48} iconSize={21} />
            <div>
              <p className="font-mono font-bold ink text-lg">{profile?.poin ?? 0} poin</p>
              <p className="text-xs ink-soft mt-0.5">Pemilah Konsisten</p>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <SectionTitle eyebrow="Notifikasi" title="Terbaru" />
        {notifications.length === 0 ? (
          <p className="text-sm ink-soft">Belum ada notifikasi.</p>
        ) : (
          <ul className="divide-y divide-line">
            {notifications.map((n) => {
              const Icon = NOTIF_ICONS[n.icon] ?? Bell;
              return (
                <li key={n.id} className="flex items-start gap-3 py-3.5">
                  <IconBadge icon={Icon} tone="primary" size={36} iconSize={16} />
                  <div className="flex-1 pt-1">
                    <p className="text-sm ink leading-snug">{n.message}</p>
                    <p className="chip ink-soft mt-1.5">{timeAgo(n.created_at)}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}
