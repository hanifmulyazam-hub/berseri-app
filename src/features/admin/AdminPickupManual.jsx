import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../context/AuthContext";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  ClipboardPlus,
  CheckCircle2,
} from "lucide-react";

const WASTE_SOURCES = [
  "Rumah Tangga",
  "Perkantoran",
  "Pasar",
  "Pusat Perniagaan",
  "Fasilitas Publik",
  "Kawasan",
  "Lainnya",
];

const WASTE_COMPOSITION_CATEGORIES = [
  "Sisa Makanan",
  "Kayu/Ranting/Daun",
  "Kertas/Karton",
  "Plastik",
  "Kain/Tekstil",
  "Kaca",
  "Logam",
  "Karet/Kulit",
  "Lainnya",
];

export function AdminPickupManual() {
  const { profile } = useAuth();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [producerName, setProducerName] = useState("");
  const [address, setAddress] = useState("");
  const [pickupDate, setPickupDate] = useState("");
  const [actualVolumeKg, setActualVolumeKg] = useState("");
  const [wasteSource, setWasteSource] = useState("");
  const [resultPhoto, setResultPhoto] = useState(null);

  const [formStep, setFormStep] = useState(1);
  const [composition, setComposition] = useState({});

  const handledTotal = WASTE_COMPOSITION_CATEGORIES.reduce(
    (total, category) =>
      total + Number(composition[category]?.handled || 0),
    0
  );

  const unhandledTotal = WASTE_COMPOSITION_CATEGORIES.reduce(
    (total, category) =>
      total + Number(composition[category]?.unhandled || 0),
    0
  );

  const compositionTotal = handledTotal + unhandledTotal;
  const actualWeight = Number(actualVolumeKg) || 0;
  const weightDifference = actualWeight - compositionTotal;

  const canContinue =
    producerName.trim() &&
    address.trim() &&
    pickupDate &&
    Number(actualVolumeKg) > 0 &&
    wasteSource;

  const compositionIsValid =
    actualWeight > 0 &&
    Math.abs(compositionTotal - actualWeight) < 0.001;

  const handleSave = async () => {
    if (!canContinue || !compositionIsValid || saving) return;

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      let resultPhotoUrl = null;

      // Upload foto jika admin memilih foto
      if (resultPhoto) {
        const filePath = `${profile.id}/manual/${Date.now()}-${resultPhoto.name}`;

        const { error: uploadError } = await supabase.storage
          .from("pickup-photos")
          .upload(filePath, resultPhoto);

        if (uploadError) throw uploadError;

        resultPhotoUrl = supabase.storage
          .from("pickup-photos")
          .getPublicUrl(filePath).data.publicUrl;
      }

      const { data, error: rpcError } = await supabase.rpc(
        "complete_manual_pickup",
        {
          p_producer_name: producerName.trim(),
          p_address: address.trim(),
          p_pickup_date: new Date(pickupDate).toISOString(),
          p_actual_volume_kg: Number(actualVolumeKg),
          p_waste_source: wasteSource,
          p_compositions: composition,
          p_result_photo_url: resultPhotoUrl,
          p_admin_id: profile.id,
        }
      );

      if (rpcError) throw rpcError;

      console.log("Pickup manual berhasil disimpan:", data);

      setProducerName("");
      setAddress("");
      setPickupDate("");
      setActualVolumeKg("");
      setWasteSource("");
      setResultPhoto(null);
      setComposition({});
      setFormStep(1);

      setSuccess("Pickup manual berhasil disimpan.");
    } catch (err) {
      console.error("Gagal menyimpan pickup manual:", err);
      setError(err.message || "Pickup manual gagal disimpan.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="space-y-6">
      <div className="bg-surface border border-line rounded-2xl shadow-soft overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-line">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-tint text-primary flex items-center justify-center shrink-0">
              {formStep === 1 ? (
                <ClipboardPlus size={19} />
              ) : (
                <CheckCircle2 size={19} />
              )}
            </div>

            <div>
              <h2 className="font-display font-bold text-lg">
                {formStep === 1
                  ? "Informasi Pickup"
                  : "Komposisi Sampah"}
              </h2>

              <p className="text-sm ink-soft">
                {formStep === 1
                  ? "Tahap 1 dari 2 · Isi informasi hasil pengambilan sampah."
                  : "Tahap 2 dari 2 · Isi komposisi sampah hasil pickup."}
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="p-6 space-y-5">
          {formStep === 1 ? (
            <>
              {/* Nama Penghasil */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Nama Penghasil Sampah
                </label>

                <input
                  type="text"
                  value={producerName}
                  onChange={(e) => setProducerName(e.target.value)}
                  placeholder="Contoh: Kantor Kecamatan Coblong"
                  className="w-full border border-line rounded-xl px-4 py-3 bg-surface outline-none focus:ring-2 focus:ring-green-700/20"
                />
              </div>

              {/* Alamat */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Alamat
                </label>

                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Masukkan alamat lokasi pickup"
                  rows={3}
                  className="w-full border border-line rounded-xl px-4 py-3 bg-surface outline-none resize-none focus:ring-2 focus:ring-green-700/20"
                />
              </div>

              {/* Tanggal + Berat */}
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Tanggal & Waktu Pickup
                  </label>

                  <input
                    type="datetime-local"
                    value={pickupDate}
                    onChange={(e) => setPickupDate(e.target.value)}
                    className="w-full border border-line rounded-xl px-4 py-3 bg-surface outline-none focus:ring-2 focus:ring-green-700/20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Berat Aktual
                  </label>

                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={actualVolumeKg}
                      onChange={(e) =>
                        setActualVolumeKg(e.target.value)
                      }
                      placeholder="0"
                      className="w-full border border-line rounded-xl px-4 py-3 pr-14 bg-surface outline-none focus:ring-2 focus:ring-green-700/20"
                    />

                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm ink-soft">
                      kg
                    </span>
                  </div>
                </div>
              </div>

              {/* Sumber Sampah */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Sumber Sampah
                </label>

                <select
                  value={wasteSource}
                  onChange={(e) => setWasteSource(e.target.value)}
                  className="w-full border border-line rounded-xl px-4 py-3 bg-surface outline-none focus:ring-2 focus:ring-green-700/20"
                >
                  <option value="">Pilih sumber sampah</option>

                  {WASTE_SOURCES.map((source) => (
                    <option key={source} value={source}>
                      {source}
                    </option>
                  ))}
                </select>
              </div>

              {/* Foto */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Foto Hasil Pickup
                  <span className="ml-2 font-normal ink-soft">
                    (opsional)
                  </span>
                </label>

                <label className="tap border border-dashed border-line rounded-xl px-4 py-5 flex items-center gap-3 cursor-pointer hover:bg-primary-tint">
                  <div className="w-10 h-10 rounded-xl bg-primary-tint text-primary flex items-center justify-center shrink-0">
                    <Camera size={18} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">
                      {resultPhoto
                        ? resultPhoto.name
                        : "Pilih foto"}
                    </p>

                    <p className="text-xs ink-soft mt-0.5">
                      Dokumentasi hasil pickup sampah.
                    </p>
                  </div>

                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) =>
                      setResultPhoto(
                        e.target.files?.[0] ?? null
                      )
                    }
                  />
                </label>
              </div>
            </>
          ) : (
            <>
              {/* Penjelasan */}
              <div className="bg-primary-tint rounded-xl px-4 py-3">
                <p className="text-sm font-semibold text-primary">
                  Komposisi hasil pickup
                </p>

                <p className="text-xs ink-soft mt-1">
                  Masukkan berat sampah tertangani dan tidak tertangani
                  untuk setiap jenis sampah. Total harus sama dengan berat aktual.
                </p>
              </div>

              {/* Composition inputs */}
              <div className="space-y-3">
                <div className="hidden md:grid md:grid-cols-[1fr_180px_180px] gap-4 px-1">
                  <span />
                  <span className="text-xs font-semibold ink-soft">
                    Tertangani (kg)
                  </span>
                  <span className="text-xs font-semibold ink-soft">
                    Tidak Tertangani (kg)
                  </span>
                </div>

                {WASTE_COMPOSITION_CATEGORIES.map((category) => (
                  <div
                    key={category}
                    className="grid md:grid-cols-[1fr_180px_180px] gap-3 md:gap-4 items-center"
                  >
                    <label className="text-sm font-semibold">
                      {category}
                    </label>

                    <div>
                      <label className="md:hidden block text-xs ink-soft mb-1">
                        Tertangani (kg)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={composition[category]?.handled ?? ""}
                        onChange={(e) => {
                          const rawValue = e.target.value;

                          if (rawValue === "") {
                            setComposition((current) => ({
                              ...current,
                              [category]: {
                                ...current[category],
                                handled: "",
                              },
                            }));
                            return;
                          }

                          const value = Math.max(0, Number(rawValue));

                          setComposition((current) => ({
                            ...current,
                            [category]: {
                              ...current[category],
                              handled: value,
                            },
                          }));
                        }}
                        placeholder="0"
                        className="w-full border border-line rounded-xl px-4 py-3 bg-surface outline-none focus:ring-2 focus:ring-green-700/20"
                      />
                    </div>

                    <div>
                      <label className="md:hidden block text-xs ink-soft mb-1">
                        Tidak Tertangani (kg)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={composition[category]?.unhandled ?? ""}
                        onChange={(e) => {
                          const rawValue = e.target.value;

                          if (rawValue === "") {
                            setComposition((current) => ({
                              ...current,
                              [category]: {
                                ...current[category],
                                unhandled: "",
                              },
                            }));
                            return;
                          }

                          const value = Math.max(0, Number(rawValue));

                          setComposition((current) => ({
                            ...current,
                            [category]: {
                              ...current[category],
                              unhandled: value,
                            },
                          }));
                        }}
                        placeholder="0"
                        className="w-full border border-line rounded-xl px-4 py-3 bg-surface outline-none focus:ring-2 focus:ring-green-700/20"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div
                className={`border rounded-xl px-4 py-4 ${
                  compositionIsValid
                    ? "bg-primary-tint border-green-200"
                    : "bg-paper border-line"
                }`}
              >
                <div className="grid sm:grid-cols-2 gap-x-8 gap-y-2 text-sm">
                  <div className="flex justify-between gap-4">
                    <span className="ink-soft">Tertangani</span>
                    <span className="font-semibold">{handledTotal} kg</span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="ink-soft">Tidak Tertangani</span>
                    <span className="font-semibold">{unhandledTotal} kg</span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="ink-soft">Total Komposisi</span>
                    <span className="font-semibold">{compositionTotal} kg</span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="ink-soft">Berat Aktual</span>
                    <span className="font-semibold">{actualWeight} kg</span>
                  </div>
                </div>

                <div className="border-t border-line mt-3 pt-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold">
                      {compositionIsValid
                        ? "Komposisi sudah sesuai."
                        : "Komposisi belum sesuai."}
                    </p>
                    <p className="text-xs ink-soft mt-0.5">
                      Total komposisi harus sama dengan berat aktual.
                    </p>
                  </div>

                  <span
                    className={`font-mono text-lg font-bold ${
                      compositionIsValid ? "text-primary" : "text-clay"
                    }`}
                  >
                    Selisih {Math.abs(weightDifference)} kg
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        {error && (
          <div className="mx-6 mb-4 px-4 py-3 rounded-xl bg-clay-tint text-clay text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mx-6 mb-4 px-4 py-3 rounded-xl bg-primary-tint text-primary text-sm">
            {success}
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-4 border-t border-line flex items-center justify-between">
          {formStep === 2 ? (
            <button
              type="button"
              onClick={() => setFormStep(1)}
              className="tap border border-line bg-surface rounded-xl px-5 py-2.5 text-sm font-semibold flex items-center gap-2 hover:bg-paper"
            >
              <ArrowLeft size={16} />
              Kembali
            </button>
          ) : (
            <div />
          )}

          {formStep === 1 ? (
            <button
              type="button"
              disabled={!canContinue}
              onClick={() => setFormStep(2)}
              className="tap btn-primary text-white rounded-xl px-5 py-2.5 text-sm font-semibold flex items-center gap-2 disabled:opacity-40 disabled:pointer-events-none"
            >
              Lanjut
              <ArrowRight size={16} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSave}
              disabled={!compositionIsValid || saving}
              className="tap btn-primary text-white rounded-xl px-5 py-2.5 text-sm font-semibold flex items-center gap-2 disabled:opacity-40 disabled:pointer-events-none"
            >
              {saving ? "Menyimpan…" : "Simpan Pickup"}
              <CheckCircle2 size={16} />
            </button>
          )}
        </div>
      </div>
    </section>
  );
}