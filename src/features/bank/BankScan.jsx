import { useState } from "react";
import { ScanLine, User } from "lucide-react";
import { Card, IconBadge, SectionTitle } from "../shared/ui";
import { useAuth } from "../../context/AuthContext";
import { findWargaMember, submitTransaction } from "./hooks";

const HARGA = { "Plastik PET": 3000, Kardus: 1800, Logam: 8000, Kaca: 500 };

export function BankScan() {
  const { profile } = useAuth();
  const [query, setQuery] = useState("");
  const [member, setMember] = useState(null);
  const [error, setError] = useState("");
  const [kategori, setKategori] = useState("Plastik PET");
  const [berat, setBerat] = useState(2.0);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const nilai = Math.round(berat * HARGA[kategori]);

  const handleSearch = async () => {
    setError("");
    try {
      const found = await findWargaMember(query);
      if (!found) {
        setError("Member tidak ditemukan.");
        return;
      }
      setMember(found);
      setSaved(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSubmit = async () => {
    setSaving(true);
    setError("");
    try {
      await submitTransaction({
        warga_id: member.id,
        bank_unit_id: profile.bank_unit_id,
        kategori,
        berat_kg: berat,
        nilai_rp: nilai,
      });
      setSaved(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card className="flex flex-col items-center justify-center text-center py-12">
        {!member ? (
          <>
            <div className="w-28 h-28 rounded-2xl bg-primary-tint flex items-center justify-center mb-5">
              <ScanLine size={38} className="text-primary" />
            </div>
            <p className="font-display font-bold ink mb-1.5">Cari Member</p>
            <p className="text-sm ink-soft mb-6 max-w-xs">Kamera QR belum tersedia — cari member berdasarkan nama.</p>
            {error && <div className="chip bg-clay-tint text-clay px-3.5 py-2.5 rounded-xl mb-3">{error}</div>}
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Nama warga"
              className="w-full max-w-xs border border-line rounded-xl px-4 py-3 text-sm mb-3"
            />
            <button onClick={handleSearch} className="tap btn-primary text-white font-semibold px-6 py-3 rounded-full text-sm">
              Cari Member
            </button>
          </>
        ) : (
          <>
            <IconBadge icon={User} tone="primary" size={64} iconSize={28} />
            <p className="font-display font-bold ink mt-3">{member.full_name}</p>
            <p className="chip ink-soft mt-1.5">{member.phone ?? "—"}</p>
            <button onClick={() => { setMember(null); setQuery(""); }} className="tap chip text-clay mt-5 font-semibold">
              Cari ulang
            </button>
          </>
        )}
      </Card>

      <Card>
        <SectionTitle eyebrow="Setoran" title="Input Transaksi" />
        <div className="space-y-4">
          <div>
            <label className="chip ink-soft uppercase block mb-2 font-semibold">Kategori</label>
            <div className="flex gap-2 flex-wrap">
              {Object.keys(HARGA).map((k) => (
                <button
                  key={k}
                  onClick={() => setKategori(k)}
                  className={`tap px-3.5 py-2 rounded-full text-xs font-semibold border ${
                    kategori === k ? "btn-primary text-white border-transparent" : "border-line ink-soft"
                  }`}
                >
                  {k}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="chip ink-soft uppercase block mb-2 font-semibold">Berat (kg)</label>
            <input
              type="number"
              step="0.1"
              value={berat}
              onChange={(e) => setBerat(parseFloat(e.target.value) || 0)}
              className="w-full border border-line rounded-xl px-4 py-3 font-mono"
            />
          </div>
          <div className="rounded-xl bg-gold-tint p-4 flex items-center justify-between">
            <span className="text-sm font-medium ink">Nilai Otomatis</span>
            <span className="font-mono font-bold text-gold text-lg">Rp{nilai.toLocaleString("id-ID")}</span>
          </div>
          {saved ? (
            <p className="chip text-primary text-center font-semibold">Setoran tersimpan & saldo bertambah.</p>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!member || saving}
              className={`tap w-full font-semibold rounded-xl py-3.5 ${
                member ? "btn-primary text-white" : "bg-paper ink-soft cursor-not-allowed"
              }`}
            >
              {saving ? "Menyimpan…" : member ? "Simpan Setoran & Tambah Saldo" : "Cari member terlebih dahulu"}
            </button>
          )}
        </div>
      </Card>
    </div>
  );
}
