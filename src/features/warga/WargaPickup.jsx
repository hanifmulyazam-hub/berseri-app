import { useState } from "react";
import { CheckCircle2, Camera, MapPin } from "lucide-react";
import { Card, IconBadge, SectionTitle } from "../shared/ui";
import { useAuth } from "../../context/AuthContext";
import { submitPickupRequest, useWargaPickups } from "./hooks";

export function WargaPickup() {
  const { profile } = useAuth();
  const { reload } = useWargaPickups(profile?.id);
  const [jenis, setJenis] = useState("Anorganik");
  const [volume, setVolume] = useState(4);
  const [alamat, setAlamat] = useState(profile?.address ?? "");
  const [foto, setFoto] = useState(null);
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!alamat) {
      setError("Alamat penjemputan wajib diisi.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await submitPickupRequest({
        warga_id: profile.id,
        jenis,
        volume_kg: Number(volume) || null,
        alamat,
        foto,
      });
      setSent(true);
      reload();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="max-w-2xl">
      <SectionTitle eyebrow="Form" title="Request Pickup Sampah" />
      {sent ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-primary-tint flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={30} className="text-primary" />
          </div>
          <p className="font-display font-bold text-lg ink">Permintaan terkirim</p>
          <p className="text-sm ink-soft mt-1.5">Petugas terdekat akan segera mengonfirmasi.</p>
          <button
            onClick={() => setSent(false)}
            className="tap mt-6 chip bg-primary-tint text-primary px-5 py-2.5 rounded-full font-semibold"
          >
            Buat permintaan lain
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {error && <div className="chip bg-clay-tint text-clay px-3.5 py-2.5 rounded-xl">{error}</div>}
          <div>
            <label className="chip ink-soft uppercase block mb-2 font-semibold">Jenis Sampah</label>
            <div className="flex gap-2 flex-wrap">
              {["Organik", "Anorganik", "B3"].map((j) => (
                <button
                  key={j}
                  onClick={() => setJenis(j)}
                  className={`tap px-4 py-2 rounded-full text-sm font-semibold border ${
                    jenis === j ? "btn-primary text-white border-transparent" : "border-line ink-soft"
                  }`}
                >
                  {j}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="chip ink-soft uppercase block mb-2 font-semibold">Estimasi Volume (kg)</label>
            <input
              type="number"
              value={volume}
              onChange={(e) => setVolume(e.target.value)}
              className="w-full border border-line rounded-xl px-4 py-3 font-mono focus:outline-none focus:ring-2"
              style={{ outlineColor: "var(--primary)" }}
            />
          </div>
          <div>
            <label className="chip ink-soft uppercase block mb-2 font-semibold">Foto Sampah</label>
            <label className="tap w-full border-2 border-dashed border-line rounded-xl py-9 flex flex-col items-center gap-2.5 ink-soft hover:bg-paper cursor-pointer">
              <IconBadge icon={Camera} tone="primary" size={40} iconSize={17} />
              <span className="text-sm">{foto ? foto.name : "Ambil foto dari kamera atau unggah"}</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setFoto(e.target.files?.[0] ?? null)}
              />
            </label>
          </div>
          <div>
            <label className="chip ink-soft uppercase block mb-2 font-semibold">Lokasi Penjemputan</label>
            <div className="rounded-xl bg-paper border border-line p-4 flex items-center gap-3">
              <IconBadge icon={MapPin} tone="primary" size={36} iconSize={16} />
              <input
                value={alamat}
                onChange={(e) => setAlamat(e.target.value)}
                placeholder="Alamat lengkap penjemputan"
                className="w-full outline-none text-sm bg-transparent"
              />
            </div>
          </div>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="tap btn-primary w-full text-white font-semibold rounded-xl py-3.5 disabled:opacity-60"
          >
            {submitting ? "Mengirim…" : "Kirim Permintaan Pickup"}
          </button>
        </div>
      )}
    </Card>
  );
}
