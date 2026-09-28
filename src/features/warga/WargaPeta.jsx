import { MapPin, Store } from "lucide-react";
import { Card, IconBadge, SectionTitle } from "../shared/ui";
import { useBankUnits } from "./hooks";

export function WargaPeta() {
  const units = useBankUnits();

  return (
    <div className="space-y-4">
      <SectionTitle eyebrow="Terdekat" title="Peta Titik Bank Sampah" />
      <Card className="h-48 flex items-center justify-center bg-primary-tint">
        <div className="text-center ink-soft">
          <IconBadge icon={MapPin} tone="primary" size={48} iconSize={22} />
          <p className="chip mt-3">Tampilan peta interaktif (Google Maps)</p>
        </div>
      </Card>
      {units.length === 0 ? (
        <p className="text-sm ink-soft">Belum ada unit bank sampah terdaftar.</p>
      ) : (
        units.map((u) => (
          <Card key={u.id} className="flex items-center gap-4" hoverable>
            <IconBadge icon={Store} tone="primary" size={40} iconSize={16} />
            <div className="flex-1">
              <p className="font-semibold ink text-sm">{u.name}</p>
              <p className="chip ink-soft mt-1">Buka {u.open_hours ?? "—"}</p>
            </div>
            <span className="chip text-teal font-semibold">{u.kelurahan}</span>
          </Card>
        ))
      )}
    </div>
  );
}
