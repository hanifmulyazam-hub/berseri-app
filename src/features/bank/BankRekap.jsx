import { Wallet, Package, Clock } from "lucide-react";
import { Card, IconBadge, SectionTitle } from "../shared/ui";
import { useAuth } from "../../context/AuthContext";
import { useBankUnit, useUnitTransactions } from "./hooks";

function startOfMonth() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export function BankRekap() {
  const { profile } = useAuth();
  const unit = useBankUnit(profile?.bank_unit_id);
  const transactions = useUnitTransactions(profile?.bank_unit_id);

  const monthStart = startOfMonth();
  const thisMonth = transactions.filter((t) => new Date(t.created_at) >= monthStart);
  const setoranBulanIni = thisMonth
    .filter((t) => t.jenis === "Setor")
    .reduce((sum, t) => sum + Number(t.berat_kg ?? 0), 0);

  const byKategori = {};
  for (const t of transactions) {
    byKategori[t.kategori] = (byKategori[t.kategori] ?? 0) + Number(t.berat_kg ?? 0);
  }
  const maxKategori = Math.max(1, ...Object.values(byKategori));

  // bank_units.saldo_unit is never written to anywhere — compute the real
  // balance from transactions instead, same way warga_saldo does.
  const saldoUnit = transactions.reduce(
    (sum, t) => sum + (t.jenis === "Setor" ? Number(t.nilai_rp ?? 0) : -Number(t.nilai_rp ?? 0)),
    0
  );

  const stats = [
    { l: "Saldo Unit", v: `Rp${saldoUnit.toLocaleString("id-ID")}`, icon: Wallet, tone: "primary" },
    { l: "Setoran Bulan Ini", v: `${setoranBulanIni.toFixed(1)} kg`, icon: Package, tone: "teal" },
    { l: "Total Transaksi", v: `${transactions.length}`, icon: Clock, tone: "gold" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-3 gap-4">
        {stats.map((s) => (
          <Card key={s.l} hoverable>
            <IconBadge icon={s.icon} tone={s.tone} size={40} iconSize={18} />
            <p className="chip ink-soft uppercase mt-3.5">{s.l}</p>
            <p className="font-display text-xl font-bold ink mt-1">{s.v}</p>
          </Card>
        ))}
      </div>
      <Card>
        <SectionTitle eyebrow={unit?.name ?? "Unit"} title="Laporan Setoran per Kategori" />
        {Object.keys(byKategori).length === 0 ? (
          <p className="text-sm ink-soft">Belum ada transaksi.</p>
        ) : (
          <div className="flex items-end gap-4 h-40">
            {Object.entries(byKategori).map(([k, v]) => (
              <div key={k} className="flex-1 flex flex-col items-center gap-2.5">
                <div
                  className="w-full rounded-t-lg"
                  style={{
                    height: `${(v / maxKategori) * 100}%`,
                    background: "linear-gradient(180deg, var(--primary), var(--primary-dark))",
                  }}
                />
                <span className="chip ink-soft">{k}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
