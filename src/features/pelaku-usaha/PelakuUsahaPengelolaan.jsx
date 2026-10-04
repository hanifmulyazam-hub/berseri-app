import { useState } from "react";
import { Save, Recycle } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../context/AuthContext";

const CATEGORIES = [
  "Sisa bahan penyiapan makanan",
  "Sisa makanan",
  "Kertas/Karton",
  "Plastik",
  "Kaca",
  "Kain",
  "Karet",
  "Residu",
  "B3",
  "Lainnya",
];

const createEmptyValues = () =>
  Object.fromEntries(
    CATEGORIES.map((category) => [
      category,
      {
        handled: "",
        unhandled: "",
      },
    ])
  );

export function PelakuUsahaPengelolaan() {
  const { profile } = useAuth();

  const [tanggal, setTanggal] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [values, setValues] = useState(createEmptyValues);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const updateValue = (category, field, value) => {
    setValues((current) => ({
      ...current,
      [category]: {
        ...current[category],
        [field]: value,
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    const details = CATEGORIES.map((category) => ({
      category,
      handled_kg: Number(values[category].handled || 0),
      unhandled_kg: Number(values[category].unhandled || 0),
    }));

    const hasData = details.some(
      (item) => item.handled_kg > 0 || item.unhandled_kg > 0
    );

    if (!hasData) {
      setError("Isi minimal satu data berat sampah.");
      return;
    }

    setSubmitting(true);

    const { data: business, error: businessError } = await supabase
      .from("pelaku_usaha")
      .select("id")
      .eq("profile_id", profile.id)
      .single();

    if (businessError || !business) {
      console.error(
        "[PelakuUsahaPengelolaan] business lookup failed:",
        businessError
      );
      setError("Profil pelaku usaha tidak ditemukan.");
      setSubmitting(false);
      return;
    }

    const { data: record, error: recordError } = await supabase
      .from("waste_management_records")
      .insert({
        pelaku_usaha_id: business.id,
        tanggal,
      })
      .select()
      .single();

    if (recordError) {
      console.error(
        "[PelakuUsahaPengelolaan] record insert failed:",
        recordError
      );
      setError(recordError.message);
      setSubmitting(false);
      return;
    }

    const rows = details.map((item) => ({
      record_id: record.id,
      category: item.category,
      handled_kg: item.handled_kg,
      unhandled_kg: item.unhandled_kg,
    }));

    const { error: detailError } = await supabase
      .from("waste_management_details")
      .insert(rows);

    if (detailError) {
      console.error(
        "[PelakuUsahaPengelolaan] detail insert failed:",
        detailError
      );

      setError(
        "Pencatatan utama tersimpan, tetapi detail sampah gagal disimpan. Jangan input ulang dulu."
      );
      setSubmitting(false);
      return;
    }

    setValues(createEmptyValues());
    setMessage("Data pengelolaan sampah berhasil disimpan.");
    setSubmitting(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="chip ink-soft uppercase font-semibold mb-1">
          Pengelolaan Sampah
        </p>

        <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight">
          Input Data Pengelolaan
        </h1>

        <p className="text-sm ink-soft mt-2 max-w-2xl">
          Catat berat sampah yang tertangani dan tidak tertangani berdasarkan
          kategori sampah.
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
          <label className="chip ink-soft uppercase block mb-2 font-semibold">
            Tanggal Pencatatan
          </label>

          <input
            type="date"
            value={tanggal}
            onChange={(e) => setTanggal(e.target.value)}
            className="border border-line rounded-xl px-4 py-3 text-sm bg-transparent outline-none"
            required
          />
        </div>

        <div className="bg-surface border border-line rounded-2xl overflow-hidden shadow-soft">
          <div className="px-5 py-4 border-b border-line flex items-center gap-2">
            <Recycle size={18} className="text-primary" />

            <div>
              <p className="font-semibold">Data Sampah</p>
              <p className="text-xs ink-soft mt-0.5">
                Berat dalam kilogram (kg)
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-paper">
                  <th className="text-left px-5 py-3 font-semibold">
                    Kategori Sampah
                  </th>

                  <th className="text-left px-4 py-3 font-semibold min-w-[160px]">
                    Tertangani (kg)
                  </th>

                  <th className="text-left px-4 py-3 font-semibold min-w-[180px]">
                    Tidak Tertangani (kg)
                  </th>
                </tr>
              </thead>

              <tbody>
                {CATEGORIES.map((category) => (
                  <tr
                    key={category}
                    className="border-t border-line first:border-t-0"
                  >
                    <td className="px-5 py-3 font-medium">
                      {category}
                    </td>

                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={values[category].handled}
                        onChange={(e) =>
                          updateValue(
                            category,
                            "handled",
                            e.target.value
                          )
                        }
                        placeholder="0"
                        className="w-full border border-line rounded-lg px-3 py-2 bg-transparent outline-none"
                      />
                    </td>

                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={values[category].unhandled}
                        onChange={(e) =>
                          updateValue(
                            category,
                            "unhandled",
                            e.target.value
                          )
                        }
                        placeholder="0"
                        className="w-full border border-line rounded-lg px-3 py-2 bg-transparent outline-none"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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