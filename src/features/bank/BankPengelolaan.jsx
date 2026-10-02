import { useState } from "react";
import { Save, Recycle } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../context/AuthContext";

const CATEGORIES = [
  "Organik",
  "Plastik PET",
  "Kertas",
  "Botol & kaca",
  "Logam",
  "Sampah lainnya",
];

const createInitialForm = () => ({
  category: "",
  weightKg: "",
  price: "",
  depositAmount: "",
  withdrawalAmount: "",
  balance: "",
  officer: "",
});

export function BankPengelolaan() {
  const { profile } = useAuth();

  const [tanggal, setTanggal] = useState(
    new Date().toISOString().slice(0, 10)
  );

  const [form, setForm] = useState(createInitialForm);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (!profile?.bank_unit_id) {
      setError("Unit Bank Sampah tidak ditemukan pada profil akun.");
      return;
    }

    if (!form.category) {
      setError("Pilih jenis sampah.");
      return;
    }

    if (!form.officer.trim()) {
      setError("Nama petugas wajib diisi.");
      return;
    }

    const weightKg = Number(form.weightKg || 0);
    const price = Number(form.price || 0);
    const depositAmount = Number(form.depositAmount || 0);
    const withdrawalAmount = Number(form.withdrawalAmount || 0);
    const balance = Number(form.balance || 0);

    if (
      weightKg < 0 ||
      price < 0 ||
      depositAmount < 0 ||
      withdrawalAmount < 0 ||
      balance < 0
    ) {
      setError("Nilai angka tidak boleh kurang dari 0.");
      return;
    }

    setSubmitting(true);

    const { error: insertError } = await supabase
      .from("bank_manual_records")
      .insert({
        bank_unit_id: profile.bank_unit_id,
        tanggal,
        category: form.category,
        weight_kg: weightKg,
        price,
        deposit_amount: depositAmount,
        withdrawal_amount: withdrawalAmount,
        balance,
        officer: form.officer.trim(),
      });

    if (insertError) {
      console.error(
        "[BankPengelolaan] bank manual record insert failed:",
        insertError
      );

      setError(insertError.message);
      setSubmitting(false);
      return;
    }

    setForm(createInitialForm());
    setMessage("Data Bank Sampah berhasil disimpan.");
    setSubmitting(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="chip ink-soft uppercase font-semibold mb-1">
          Bank Sampah
        </p>

        <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight">
          Input Data Bank Sampah
        </h1>

        <p className="text-sm ink-soft mt-2 max-w-2xl">
          Catat data kegiatan Bank Sampah sesuai format pelaporan
          Dinas Lingkungan Hidup.
        </p>
      </div>

      {message && (
        <div className="bg-primary-tint text-primary rounded-xl px-4 py-3 text-sm font-medium">
          {message}
        </div>
      )}

      {error && (
        <div className="bg-clay-tint text-clay rounded-xl px-4 py-3 text-sm font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="bg-surface border border-line rounded-2xl p-5 shadow-soft">
          <div className="flex items-center gap-2 mb-5">
            <Recycle size={18} className="text-primary" />

            <div>
              <p className="font-semibold">Data Pencatatan</p>
              <p className="text-xs ink-soft mt-0.5">
                Masukkan data pencatatan Bank Sampah.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="chip ink-soft uppercase block mb-2 font-semibold">
                Tanggal
              </label>

              <input
                type="date"
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                className="w-full border border-line rounded-xl px-4 py-3 text-sm bg-transparent outline-none"
                required
              />
            </div>

            <div>
              <label className="chip ink-soft uppercase block mb-2 font-semibold">
                Jenis Sampah
              </label>

              <select
                value={form.category}
                onChange={(e) =>
                  updateField("category", e.target.value)
                }
                className="w-full border border-line rounded-xl px-4 py-3 text-sm bg-transparent outline-none"
                required
              >
                <option value="">Pilih jenis sampah</option>

                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="chip ink-soft uppercase block mb-2 font-semibold">
                Berat (kg)
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                value={form.weightKg}
                onChange={(e) =>
                  updateField("weightKg", e.target.value)
                }
                placeholder="0"
                className="w-full border border-line rounded-xl px-4 py-3 text-sm bg-transparent outline-none"
                required
              />
            </div>

            <div>
              <label className="chip ink-soft uppercase block mb-2 font-semibold">
                Harga (Rp)
              </label>

              <input
                type="number"
                min="0"
                step="1"
                value={form.price}
                onChange={(e) =>
                  updateField("price", e.target.value)
                }
                placeholder="0"
                className="w-full border border-line rounded-xl px-4 py-3 text-sm bg-transparent outline-none"
                required
              />
            </div>

            <div>
              <label className="chip ink-soft uppercase block mb-2 font-semibold">
                Setor (Rp)
              </label>

              <input
                type="number"
                min="0"
                step="1"
                value={form.depositAmount}
                onChange={(e) =>
                  updateField("depositAmount", e.target.value)
                }
                placeholder="0"
                className="w-full border border-line rounded-xl px-4 py-3 text-sm bg-transparent outline-none"
                required
              />
            </div>

            <div>
              <label className="chip ink-soft uppercase block mb-2 font-semibold">
                Tarik (Rp)
              </label>

              <input
                type="number"
                min="0"
                step="1"
                value={form.withdrawalAmount}
                onChange={(e) =>
                  updateField("withdrawalAmount", e.target.value)
                }
                placeholder="0"
                className="w-full border border-line rounded-xl px-4 py-3 text-sm bg-transparent outline-none"
                required
              />
            </div>

            <div>
              <label className="chip ink-soft uppercase block mb-2 font-semibold">
                Saldo (Rp)
              </label>

              <input
                type="number"
                min="0"
                step="1"
                value={form.balance}
                onChange={(e) =>
                  updateField("balance", e.target.value)
                }
                placeholder="0"
                className="w-full border border-line rounded-xl px-4 py-3 text-sm bg-transparent outline-none"
                required
              />
            </div>

            <div>
              <label className="chip ink-soft uppercase block mb-2 font-semibold">
                Petugas
              </label>

              <input
                type="text"
                value={form.officer}
                onChange={(e) =>
                  updateField("officer", e.target.value)
                }
                placeholder="Nama petugas"
                className="w-full border border-line rounded-xl px-4 py-3 text-sm bg-transparent outline-none"
                required
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="tap btn-primary text-white font-semibold rounded-xl px-5 py-3 flex items-center gap-2 disabled:opacity-60"
          >
            <Save size={17} />

            {submitting ? "Menyimpan…" : "Simpan Data"}
          </button>
        </div>
      </form>
    </div>
  );
}