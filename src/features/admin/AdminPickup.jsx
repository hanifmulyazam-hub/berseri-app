import { useState } from "react";
import { Navigation, X, Scale, Camera } from "lucide-react";
import { Card, SectionTitle, StatusChip } from "../shared/ui";
import { useAuth } from "../../context/AuthContext";
import {
  saveAdminPickupResult,
  markAdminPickupCollected,
  startAdminPickup,
  useAdminPickupTasks,
} from "./hooks";

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

export function AdminPickup() {
  const { profile } = useAuth();
  const { tasks, reload } = useAdminPickupTasks();

  const [selectedPickup, setSelectedPickup] = useState(null);
  const [actualVolumeKg, setActualVolumeKg] = useState("");
  const [resultPhoto, setResultPhoto] = useState(null);
  const [wasteSource, setWasteSource] = useState("");
  const [composition, setComposition] = useState({});
  const [formStep, setFormStep] = useState(1);
  const compositionTotal = WASTE_COMPOSITION_CATEGORIES.reduce(
    (total, category) => total + Number(composition[category] || 0),
    0
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleStart = async (task) => {
    try {
      await startAdminPickup(task.id, profile.id);
      reload();
    } catch (err) {
      console.error("Gagal memulai pickup:", err);
    }
  };

  const handleCollected = async (task) => {
    try {
        await markAdminPickupCollected(task.id, profile.id);
        reload();
    } catch (err) {
        console.error("Gagal menandai pickup telah dijemput:", err);
    }
  };

  const openCompletionForm = (task) => {
    setSelectedPickup(task);
    setActualVolumeKg("");
    setResultPhoto(null);
    setWasteSource("");
    setComposition({});
    setFormStep(1);
    setError("");
  };

  const closeCompletionForm = () => {
    if (saving) return;

    setSelectedPickup(null);
    setActualVolumeKg("");
    setResultPhoto(null);
    setWasteSource("");
    setComposition({});
    setFormStep(1);
    setError("");
  };

  const handleComplete = async (event) => {
    event.preventDefault();

    const weight = Number(actualVolumeKg);

    if (!Number.isFinite(weight) || weight <= 0) {
      setError("Berat aktual harus lebih dari 0 kg.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      await saveAdminPickupResult({
        pickupId: selectedPickup.id,
        actualVolumeKg: weight,
        wasteSource,
        compositions: composition,
        resultPhoto,
        adminId: profile.id,
      });

      setSelectedPickup(null);
        setActualVolumeKg("");
        setResultPhoto(null);
        reload();
    } catch (err) {
      console.error("Gagal menyelesaikan pickup:", err);
      setError("Pickup gagal diselesaikan. Coba lagi.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <SectionTitle
        eyebrow={`${tasks.length} tugas tersisa`}
        title="Kelola Pickup"
      />

      {tasks.length === 0 ? (
        <p className="text-sm ink-soft">
          Tidak ada pickup aktif saat ini.
        </p>
      ) : (
        tasks.map((t) => (
          <Card key={t.id} hoverable>
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl bg-primary-tint flex items-center justify-center shrink-0 font-mono font-bold text-primary text-xs text-center">
                {t.scheduled_at
                  ? new Date(t.scheduled_at).toLocaleTimeString("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "—"}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-semibold ink">
                  {t.warga?.full_name ?? "Warga"}
                </p>

                <p className="text-sm ink-soft mt-0.5">
                  {t.alamat}
                </p>

                <p className="chip ink-soft mt-1.5">
                  {t.jenis} · {t.volume_kg ?? "?"} kg (est.)
                </p>
              </div>

              {t.foto_url && (
                <a
                  href={t.foto_url}
                  target="_blank"
                  rel="noreferrer"
                  className="tap shrink-0"
                >
                  <img
                    src={t.foto_url}
                    alt="Foto sampah"
                    className="w-14 h-14 rounded-xl object-cover border border-line"
                  />
                </a>
              )}

              <StatusChip status={t.status} />
            </div>

            <div className="flex gap-2 mt-4">
              <button
                type="button"
                className="tap flex-1 border border-line rounded-lg py-2.5 text-sm font-semibold ink flex items-center justify-center gap-2 hover:bg-paper"
              >
                <Navigation size={15} />
                Navigasi
              </button>

              {t.status === "Dijadwalkan" ? (
                <button
                  type="button"
                  onClick={() => handleStart(t)}
                  className="tap btn-primary flex-1 text-white rounded-lg py-2.5 text-sm font-semibold"
                >
                  Mulai Perjalanan
                </button>
              ) : t.status === "Dalam Perjalanan" ? (
                <button
                  type="button"
                  onClick={() => handleCollected(t)}
                  className="tap btn-primary flex-1 text-white rounded-lg py-2.5 text-sm font-semibold"
                >
                  Tandai Telah Dijemput
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => openCompletionForm(t)}
                  className="tap btn-primary flex-1 text-white rounded-lg py-2.5 text-sm font-semibold"
                >
                  Isi Hasil Pickup
                </button>
              )}
            </div>
          </Card>
        ))
      )}

      {selectedPickup && (
        <div
          className="
            fixed inset-0 z-50
            bg-black/25 backdrop-blur-[3px]
            flex items-start justify-center
            px-4 py-8 pt-[12vh]
          "
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeCompletionForm();
            }
          }}
        >
          <div
            className="
              w-full max-w-lg
              bg-surface
              border border-line
              rounded-3xl
              shadow-[0_24px_80px_rgba(0,0,0,0.18)]
              overflow-hidden
              fade-up
            "
          >
            {/* Header */}
            <div className="px-6 pt-6 pb-5 border-b border-line">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="chip text-primary font-semibold uppercase">
                    Hasil Pickup
                  </p>

                  <h2 className="font-display font-bold text-2xl ink mt-1">
                    Selesaikan Pickup
                  </h2>

                  <p className="text-sm ink-soft mt-1">
                    Masukkan hasil aktual setelah sampah diambil.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeCompletionForm}
                  disabled={saving}
                  className="
                    tap w-9 h-9 rounded-full
                    bg-paper hover:bg-primary-tint
                    flex items-center justify-center
                    shrink-0
                    disabled:opacity-50
                  "
                  aria-label="Tutup"
                >
                  <X size={17} />
                </button>
              </div>
            </div>

            <form onSubmit={handleComplete}>
              <div className="px-6 py-5 space-y-5">
                {/* Pickup summary */}
                <div className="bg-paper rounded-2xl p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-semibold ink">
                        {selectedPickup.warga?.full_name ?? "Warga"}
                      </p>

                      <p className="text-sm ink-soft mt-0.5">
                        {selectedPickup.alamat}
                      </p>

                      <p className="chip ink-soft mt-2">
                        {selectedPickup.jenis}
                      </p>
                    </div>

                    <StatusChip status={selectedPickup.status} />
                  </div>
                </div>
                
                {formStep === 1 && (
                <>
                {/* Weight comparison */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="border border-line rounded-2xl p-4">
                    <p className="text-xs ink-soft">
                      Estimasi Warga
                    </p>

                    <p className="font-display font-bold text-xl ink mt-1">
                      {selectedPickup.volume_kg ?? "?"}
                      <span className="text-sm font-medium ink-soft ml-1">
                        kg
                      </span>
                    </p>
                  </div>

                  <div className="border border-line rounded-2xl p-4">
                    <div className="flex items-center gap-1.5">
                      <Scale size={14} className="text-primary" />
                      <p className="text-xs ink-soft">
                        Berat Aktual
                      </p>
                    </div>

                    <p className="font-display font-bold text-xl text-primary mt-1">
                      {actualVolumeKg || "—"}
                      {actualVolumeKg && (
                        <span className="text-sm font-medium ink-soft ml-1">
                          kg
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Actual weight input */}
                <div>
                  <label
                    htmlFor="actual-volume"
                    className="text-sm font-semibold ink"
                  >
                    Berat aktual
                  </label>

                  <p className="text-xs ink-soft mt-1">
                    Masukkan berat berdasarkan hasil penimbangan.
                  </p>

                  <div className="relative mt-2">
                    <input
                      id="actual-volume"
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={actualVolumeKg}
                      onChange={(event) => {
                        setActualVolumeKg(event.target.value);
                        setError("");
                      }}
                      placeholder="Contoh: 3.75"
                      className="
                        w-full
                        border border-line
                        bg-surface
                        rounded-xl
                        px-4 py-3.5 pr-14
                        text-sm ink
                        outline-none
                        focus:border-primary
                      "
                      autoFocus
                      required
                    />

                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold ink-soft pointer-events-none">
                      kg
                    </span>
                  </div>
                </div>
                {/* Waste source */}
                <div>
                  <label className="text-sm font-semibold ink">
                    Sumber sampah
                  </label>

                  <p className="text-xs ink-soft mt-1">
                    Pilih sumber utama sampah yang dijemput.
                  </p>

                  <select
                    value={wasteSource}
                    onChange={(event) => {
                      setWasteSource(event.target.value);
                      setError("");
                    }}
                    className="
                      w-full
                      border border-line
                      bg-surface
                      rounded-xl
                      px-4 py-3.5
                      mt-2
                      text-sm ink
                      outline-none
                      focus:border-primary
                    "
                    required
                  >
                    <option value="">Pilih sumber sampah</option>
                    <option value="Rumah Tangga">Rumah Tangga</option>
                    <option value="Perkantoran">Perkantoran</option>
                    <option value="Pasar">Pasar</option>
                    <option value="Pusat Perniagaan">Pusat Perniagaan</option>
                    <option value="Fasilitas Publik">Fasilitas Publik</option>
                    <option value="Kawasan">Kawasan</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
                {/* Result photo */}
                <div>
                    <label className="text-sm font-semibold ink">
                        Foto hasil pickup
                    </label>

                    <p className="text-xs ink-soft mt-1">
                        Opsional. Unggah foto kondisi setelah pickup selesai.
                    </p>

                    <label
                        className="
                        tap mt-2
                        w-full
                        border-2 border-dashed border-line
                        rounded-2xl
                        p-4
                        flex items-center gap-4
                        cursor-pointer
                        hover:bg-paper
                        "
                    >
                        {resultPhoto ? (
                        <>
                            <img
                            src={URL.createObjectURL(resultPhoto)}
                            alt="Preview hasil pickup"
                            className="w-16 h-16 rounded-xl object-cover border border-line shrink-0"
                            />

                            <div className="min-w-0">
                            <p className="text-sm font-semibold ink">
                                Foto dipilih
                            </p>

                            <p className="text-xs ink-soft mt-1 truncate">
                                {resultPhoto.name}
                            </p>

                            <p className="text-xs text-primary font-semibold mt-1">
                                Klik untuk ganti foto
                            </p>
                            </div>
                        </>
                        ) : (
                        <>
                            <div className="w-12 h-12 rounded-xl bg-primary-tint flex items-center justify-center shrink-0">
                            <Camera size={19} className="text-primary" />
                            </div>

                            <div>
                            <p className="text-sm font-semibold ink">
                                Tambah foto hasil
                            </p>

                            <p className="text-xs ink-soft mt-1">
                                Ambil dari kamera atau pilih dari perangkat
                            </p>
                            </div>
                        </>
                        )}

                        <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(event) => {
                            setResultPhoto(event.target.files?.[0] ?? null);
                            setError("");
                        }}
                        />
                    </label>
                </div>
                  </>
                )}
                {formStep === 2 && (
                  <>
                    {/* Waste composition */}
                    <div>
                      <label className="text-sm font-semibold ink">
                        Komposisi sampah
                      </label>

                      <p className="text-xs ink-soft mt-1">
                        Masukkan persentase tiap jenis sampah. Total harus 100%.
                      </p>

                      <div className="mt-3 space-y-2">
                        {WASTE_COMPOSITION_CATEGORIES.map((category) => (
                          <div
                            key={category}
                            className="flex items-center justify-between gap-4"
                          >
                            <span className="text-sm ink">
                              {category}
                            </span>

                            <div className="relative w-28 shrink-0">
                              <input
                                type="number"
                                min="0"
                                max="100"
                                step="0.01"
                                value={composition[category] ?? ""}
                                onChange={(event) => {
                                  const value = event.target.value;

                                  if (value === "") {
                                    setComposition((current) => ({
                                      ...current,
                                      [category]: "",
                                    }));
                                    setError("");
                                    return;
                                  }

                                  const numberValue = Number(value);

                                  if (numberValue < 0 || numberValue > 100) {
                                    return;
                                  }

                                  setComposition((current) => ({
                                    ...current,
                                    [category]: value,
                                  }));

                                  setError("");
                                }}
                                placeholder="0"
                                className="
                                  w-full
                                  border border-line
                                  bg-surface
                                  rounded-xl
                                  px-3 py-2.5 pr-8
                                  text-sm ink
                                  outline-none
                                  focus:border-primary
                                "
                              />

                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs ink-soft pointer-events-none">
                                %
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 pt-4 border-t border-line flex items-center justify-between">
                        <span className="text-sm font-semibold ink">
                          Total komposisi
                        </span>

                        <span
                          className={`text-sm font-bold ${
                            Math.abs(compositionTotal - 100) < 0.001
                              ? "text-primary"
                              : "text-clay"
                          }`}
                        >
                          {compositionTotal.toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  </>
                )}

                {error && (
                  <p className="text-sm text-clay bg-clay-tint rounded-xl px-3.5 py-2.5">
                    {error}
                  </p>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-paper border-t border-line flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={closeCompletionForm}
                  disabled={saving}
                  className="
                    tap border border-line
                    bg-surface
                    rounded-xl
                    px-5 py-2.5
                    text-sm font-semibold ink
                    hover:bg-primary-tint
                    disabled:opacity-50
                  "
                >
                  Batal
                </button>

                {formStep === 1 ? (
                  <button
                    type="button"
                    disabled={
                      !Number.isFinite(Number(actualVolumeKg)) ||
                      Number(actualVolumeKg) <= 0 ||
                      !wasteSource
                    }
                    onClick={() => {
                      setError("");
                      setFormStep(2);
                    }}
                    className="
                      tap btn-primary
                      text-white
                      rounded-xl
                      px-5 py-2.5
                      text-sm font-semibold
                      disabled:opacity-50
                      disabled:cursor-not-allowed
                    "
                  >
                    Lanjut
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setError("");
                        setFormStep(1);
                      }}
                      disabled={saving}
                      className="
                        tap border border-line
                        bg-surface
                        rounded-xl
                        px-5 py-2.5
                        text-sm font-semibold ink
                        hover:bg-primary-tint
                        disabled:opacity-50
                      "
                    >
                      Kembali
                    </button>

                    <button
                      type="submit"
                      disabled={
                        saving ||
                        Math.abs(compositionTotal - 100) >= 0.001
                      }
                      className="
                        tap btn-primary
                        text-white
                        rounded-xl
                        px-5 py-2.5
                        text-sm font-semibold
                        disabled:opacity-50
                        disabled:cursor-not-allowed
                      "
                    >
                      {saving ? "Menyimpan…" : "Konfirmasi Selesai"}
                    </button>
                  </>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}