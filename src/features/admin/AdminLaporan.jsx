import { useState } from "react";
import { FileDown } from "lucide-react";
import { Card, SectionTitle } from "../shared/ui";
import { useBankUnitsAdmin } from "./hooks";

function recentPeriods() {
  const now = new Date();
  return Array.from({ length: 3 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    return d.toLocaleDateString("id-ID", { month: "long", year: "numeric" });
  });
}

export function AdminLaporan() {
  const { units } = useBankUnitsAdmin();
  const [note, setNote] = useState("");
  const wilayah = [...new Set(units.map((u) => u.kelurahan))];

  return (
    <Card className="max-w-xl">
      <SectionTitle eyebrow="Ekspor" title="Laporan Periodik" />
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="chip ink-soft uppercase block mb-2 font-semibold">Periode</label>
            <select className="w-full border border-line rounded-xl px-3 py-2.5 text-sm">
              {recentPeriods().map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="chip ink-soft uppercase block mb-2 font-semibold">Wilayah</label>
            <select className="w-full border border-line rounded-xl px-3 py-2.5 text-sm">
              <option>Semua Wilayah</option>
              {wilayah.map((w) => (
                <option key={w}>{w}</option>
              ))}
            </select>
          </div>
        </div>
        {note && <p className="chip ink-soft">{note}</p>}
        <div className="flex gap-3">
          <button
            onClick={() => setNote("Ekspor PDF belum tersedia di versi ini.")}
            className="tap flex-1 btn-primary text-white font-semibold rounded-xl py-3.5 flex items-center justify-center gap-2"
          >
            <FileDown size={16} /> Ekspor PDF
          </button>
          <button
            onClick={() => setNote("Ekspor Excel belum tersedia di versi ini.")}
            className="tap flex-1 border border-line ink font-semibold rounded-xl py-3.5 flex items-center justify-center gap-2 hover:bg-paper"
          >
            <FileDown size={16} /> Ekspor Excel
          </button>
        </div>
      </div>
    </Card>
  );
}
