import { Card, SectionTitle } from "../shared/ui";
import { useAuth } from "../../context/AuthContext";
import { useWargaSaldo, useWargaTransactions } from "./hooks";

export function WargaBank() {
  const { profile } = useAuth();
  const saldo = useWargaSaldo(profile?.id);
  const transactions = useWargaTransactions(profile?.id);

  return (
    <div className="space-y-6">
      <div className="radiance rounded-3xl p-7 text-white flex flex-wrap items-center justify-between gap-4 shadow-lift">
        <div>
          <div className="chip opacity-80 uppercase mb-1.5 tracking-wider">Saldo Bank Sampah</div>
          <p className="font-display text-4xl font-bold font-mono">
            Rp{saldo.toLocaleString("id-ID")}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            className="tap bg-white text-primary-dark font-semibold px-4 py-2.5 rounded-full text-sm shadow-soft"
            style={{ color: "var(--primary-dark)" }}
          >
            Tarik Tunai
          </button>
          <button className="tap bg-white/15 text-white font-semibold px-4 py-2.5 rounded-full text-sm border border-white/30">
            Tukar Poin
          </button>
        </div>
      </div>
      <Card>
        <SectionTitle eyebrow="Histori" title="Riwayat Transaksi" />
        {transactions.length === 0 ? (
          <p className="text-sm ink-soft">Belum ada transaksi.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left ink-soft chip uppercase border-b border-line">
                  <th className="py-2.5 pr-4">Tanggal</th>
                  <th className="py-2.5 pr-4">Kategori</th>
                  <th className="py-2.5 pr-4">Berat</th>
                  <th className="py-2.5 pr-4">Nilai</th>
                  <th className="py-2.5">Jenis</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((r) => (
                  <tr key={r.id} className="border-b border-line last:border-0">
                    <td className="py-3.5 pr-4 ink-soft">
                      {new Date(r.created_at).toLocaleDateString("id-ID", { day: "2-digit", month: "short" })}
                    </td>
                    <td className="py-3.5 pr-4 ink font-medium">{r.kategori}</td>
                    <td className="py-3.5 pr-4 font-mono">{r.berat_kg ? `${r.berat_kg} kg` : "—"}</td>
                    <td
                      className={`py-3.5 pr-4 font-mono font-semibold ${
                        r.jenis === "Tarik" ? "text-clay" : "text-primary"
                      }`}
                    >
                      {r.jenis === "Tarik" ? "-" : ""}Rp{Number(r.nilai_rp).toLocaleString("id-ID")}
                    </td>
                    <td className="py-3.5">
                      <span className="chip ink-soft">{r.jenis}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
