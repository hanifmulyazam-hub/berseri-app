import { useEffect, useState } from "react";
import { CalendarDays, History } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../context/AuthContext";

export function BankRiwayat() {
  const { profile } = useAuth();

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadRecords() {
      if (!profile?.bank_unit_id) {
        setError("Unit Bank Sampah tidak ditemukan pada profil akun.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      const { data, error: recordsError } = await supabase
        .from("bank_manual_records")
        .select(`
          id,
          tanggal,
          category,
          weight_kg,
          price,
          deposit_amount,
          withdrawal_amount,
          balance,
          officer,
          created_at
        `)
        .eq("bank_unit_id", profile.bank_unit_id)
        .order("tanggal", { ascending: false })
        .order("created_at", { ascending: false });

      if (recordsError) {
        console.error(
          "[BankRiwayat] records query failed:",
          recordsError
        );

        setError(recordsError.message);
        setLoading(false);
        return;
      }

      setRecords(data || []);
      setLoading(false);
    }

    loadRecords();
  }, [profile?.bank_unit_id]);

  const formatDate = (date) => {
    if (!date) return "-";

    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }).format(new Date(`${date}T00:00:00Z`));
  };

  const formatRupiah = (value) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(Number(value || 0));

  return (
    <div className="space-y-6">
      <div>
        <p className="chip ink-soft uppercase font-semibold mb-1">
          Bank Sampah
        </p>

        <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight">
          Riwayat Pencatatan
        </h1>

        <p className="text-sm ink-soft mt-2">
          Data kegiatan Bank Sampah yang telah Anda simpan.
        </p>
      </div>

      {error && (
        <div className="bg-clay-tint text-clay rounded-xl px-4 py-3 text-sm font-medium">
          {error}
        </div>
      )}

      {loading ? (
        <div className="bg-surface border border-line rounded-2xl p-6">
          <p className="text-sm ink-soft">
            Memuat riwayat…
          </p>
        </div>
      ) : records.length === 0 ? (
        <div className="bg-surface border border-line rounded-2xl p-8 text-center">
          <History
            size={28}
            className="ink-soft mx-auto mb-3"
          />

          <p className="font-semibold">
            Belum ada pencatatan
          </p>

          <p className="text-sm ink-soft mt-1">
            Data yang disimpan melalui menu Input Data akan muncul di sini.
          </p>
        </div>
      ) : (
        <div className="bg-surface border border-line rounded-2xl overflow-hidden shadow-soft">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-paper">
                  <th className="text-left px-5 py-3 font-semibold min-w-[170px]">
                    Tanggal
                  </th>

                  <th className="text-left px-4 py-3 font-semibold min-w-[150px]">
                    Jenis Sampah
                  </th>

                  <th className="text-right px-4 py-3 font-semibold min-w-[110px]">
                    Berat
                  </th>

                  <th className="text-right px-4 py-3 font-semibold min-w-[130px]">
                    Harga
                  </th>

                  <th className="text-right px-4 py-3 font-semibold min-w-[130px]">
                    Setor
                  </th>

                  <th className="text-right px-4 py-3 font-semibold min-w-[130px]">
                    Tarik
                  </th>

                  <th className="text-right px-4 py-3 font-semibold min-w-[130px]">
                    Saldo
                  </th>

                  <th className="text-left px-4 py-3 font-semibold min-w-[150px]">
                    Petugas
                  </th>
                </tr>
              </thead>

              <tbody>
                {records.map((record) => (
                  <tr
                    key={record.id}
                    className="border-t border-line"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <CalendarDays
                          size={16}
                          className="text-primary shrink-0"
                        />

                        <span className="font-semibold">
                          {formatDate(record.tanggal)}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-4 font-medium">
                      {record.category}
                    </td>

                    <td className="px-4 py-4 text-right font-mono">
                      {Number(record.weight_kg || 0).toFixed(2)} kg
                    </td>

                    <td className="px-4 py-4 text-right font-mono">
                      {formatRupiah(record.price)}
                    </td>

                    <td className="px-4 py-4 text-right font-mono">
                      {formatRupiah(record.deposit_amount)}
                    </td>

                    <td className="px-4 py-4 text-right font-mono">
                      {formatRupiah(record.withdrawal_amount)}
                    </td>

                    <td className="px-4 py-4 text-right font-mono">
                      {formatRupiah(record.balance)}
                    </td>

                    <td className="px-4 py-4">
                      {record.officer}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}