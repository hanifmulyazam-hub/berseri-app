import { useEffect, useState } from "react";
import { CalendarDays, History } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../context/AuthContext";

export function PelakuUsahaRiwayat() {
  const { profile } = useAuth();

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadRecords() {
      if (!profile?.id) return;

      setLoading(true);
      setError("");

      const { data: business, error: businessError } = await supabase
        .from("pelaku_usaha")
        .select("id")
        .eq("profile_id", profile.id)
        .single();

      if (businessError || !business) {
        console.error(
          "[PelakuUsahaRiwayat] business lookup failed:",
          businessError
        );
        setError("Profil pelaku usaha tidak ditemukan.");
        setLoading(false);
        return;
      }

      const { data, error: recordsError } = await supabase
        .from("waste_management_records")
        .select(`
          id,
          tanggal,
          created_at,
          waste_management_details (
            id,
            category,
            handled_kg,
            unhandled_kg
          )
        `)
        .eq("pelaku_usaha_id", business.id)
        .order("tanggal", { ascending: false })
        .order("created_at", { ascending: false });

      if (recordsError) {
        console.error(
          "[PelakuUsahaRiwayat] records query failed:",
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
  }, [profile?.id]);

  const formatDate = (date) => {
    if (!date) return "-";

    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }).format(new Date(`${date}T00:00:00Z`));
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="chip ink-soft uppercase font-semibold mb-1">
          Pengelolaan Sampah
        </p>

        <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight">
          Riwayat Pencatatan
        </h1>

        <p className="text-sm ink-soft mt-2">
          Data pengelolaan sampah yang telah Anda simpan.
        </p>
      </div>

      {error && (
        <div className="bg-clay-tint text-clay rounded-xl px-4 py-3 text-sm font-medium">
          {error}
        </div>
      )}

      {loading ? (
        <div className="bg-surface border border-line rounded-2xl p-6">
          <p className="text-sm ink-soft">Memuat riwayat…</p>
        </div>
      ) : records.length === 0 ? (
        <div className="bg-surface border border-line rounded-2xl p-8 text-center">
          <History size={28} className="ink-soft mx-auto mb-3" />

          <p className="font-semibold">Belum ada pencatatan</p>

          <p className="text-sm ink-soft mt-1">
            Data yang disimpan melalui menu Input Data akan muncul di sini.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {records.map((record) => {
            const details = record.waste_management_details || [];

            const totalHandled = details.reduce(
              (total, item) => total + Number(item.handled_kg || 0),
              0
            );

            const totalUnhandled = details.reduce(
              (total, item) => total + Number(item.unhandled_kg || 0),
              0
            );

            return (
              <div
                key={record.id}
                className="bg-surface border border-line rounded-2xl overflow-hidden shadow-soft"
              >
                <div className="px-5 py-4 border-b border-line flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <CalendarDays size={17} className="text-primary" />

                    <p className="font-semibold">
                      {formatDate(record.tanggal)}
                    </p>
                  </div>

                  <div className="flex gap-2 text-xs">
                    <span className="bg-primary-tint text-primary rounded-full px-3 py-1.5 font-semibold">
                      Tertangani {totalHandled.toFixed(2)} kg
                    </span>

                    <span className="bg-clay-tint text-clay rounded-full px-3 py-1.5 font-semibold">
                      Tidak tertangani {totalUnhandled.toFixed(2)} kg
                    </span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-paper">
                        <th className="text-left px-5 py-3 font-semibold">
                          Kategori
                        </th>

                        <th className="text-right px-4 py-3 font-semibold">
                          Tertangani
                        </th>

                        <th className="text-right px-5 py-3 font-semibold">
                          Tidak Tertangani
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {details.map((detail) => (
                        <tr
                          key={detail.id}
                          className="border-t border-line"
                        >
                          <td className="px-5 py-3">
                            {detail.category}
                          </td>

                          <td className="px-4 py-3 text-right font-mono">
                            {Number(detail.handled_kg || 0).toFixed(2)} kg
                          </td>

                          <td className="px-5 py-3 text-right font-mono">
                            {Number(detail.unhandled_kg || 0).toFixed(2)} kg
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}