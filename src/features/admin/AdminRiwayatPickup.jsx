import {
  CheckCircle2,
  Scale,
  Clock3,
  ImageIcon,
  MapPin,
  Building2,
  Recycle,
} from "lucide-react";

import { Card, IconBadge, SectionTitle } from "../shared/ui";
import { useAdminPickupHistory } from "./hooks";

export function AdminRiwayatPickup() {
  const { history, loading } = useAdminPickupHistory();

  if (loading) {
    return (
      <p className="text-sm ink-soft">
        Memuat riwayat pickup…
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <SectionTitle
        eyebrow={`${history.length} pickup tercatat`}
        title="Riwayat Pickup"
      />

      {history.length === 0 ? (
        <Card>
          <p className="text-sm ink-soft">
            Belum ada pickup yang tercatat.
          </p>
        </Card>
      ) : (
        history.map((pickup) => {
          const compositions = pickup.pickup_compositions ?? [];

          return (
            <Card key={pickup.id} hoverable>
              <div className="flex items-start gap-4">
                {/* Icon */}
                <IconBadge
                  icon={CheckCircle2}
                  tone="primary"
                  size={48}
                  iconSize={20}
                />

                <div className="flex-1 min-w-0">
                  {/* Header */}
                  <div>
                    <p className="font-semibold ink text-base">
                      {pickup.nama_penghasil || "Penghasil Sampah"}
                    </p>

                    {pickup.alamat && (
                      <div className="flex items-start gap-1.5 mt-1">
                        <MapPin
                          size={13}
                          className="ink-soft mt-0.5 shrink-0"
                        />

                        <p className="text-sm ink-soft">
                          {pickup.alamat}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Main information */}
                  <div className="grid md:grid-cols-2 gap-3 mt-4">
                    {/* Berat Aktual */}
                    <div className="border border-line rounded-xl p-3">
                      <div className="flex items-center gap-1.5">
                        <Scale
                          size={13}
                          className="text-primary"
                        />

                        <p className="text-xs ink-soft">
                          Berat Aktual
                        </p>
                      </div>

                      <p className="font-display font-bold text-lg text-primary mt-1">
                        {pickup.berat_actual ?? "—"}

                        {pickup.berat_actual != null && (
                          <span className="text-xs font-medium ink-soft ml-1">
                            kg
                          </span>
                        )}
                      </p>
                    </div>

                    {/* Sumber Sampah */}
                    <div className="border border-line rounded-xl p-3">
                      <div className="flex items-center gap-1.5">
                        <Building2
                          size={13}
                          className="text-primary"
                        />

                        <p className="text-xs ink-soft">
                          Sumber Sampah
                        </p>
                      </div>

                      <p className="font-semibold ink mt-1">
                        {pickup.sumber_sampah || "—"}
                      </p>
                    </div>
                  </div>

                  {/* Pickup time */}
                  <div className="flex items-center gap-1.5 mt-3 text-xs ink-soft">
                    <Clock3 size={13} />

                    {pickup.completed_at ? (
                      <span>
                        Pickup{" "}
                        {new Date(
                          pickup.completed_at
                        ).toLocaleString("id-ID", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </span>
                    ) : (
                      <span>
                        Waktu pickup belum tercatat
                      </span>
                    )}
                  </div>

                  {/* Composition */}
                  {compositions.length > 0 && (
                    <div className="mt-4">
                      <div className="flex items-center gap-1.5 mb-2">
                        <Recycle
                          size={13}
                          className="text-primary"
                        />

                        <p className="text-xs font-semibold ink">
                          Komposisi Sampah
                        </p>
                      </div>

                      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2">
                        {compositions
                          .filter(
                            (composition) =>
                              Number(composition.percentage) > 0
                          )
                          .sort(
                            (a, b) =>
                              Number(b.percentage) -
                              Number(a.percentage)
                          )
                          .map((composition) => (
                            <div
                              key={composition.id}
                              className="flex items-center justify-between gap-3 border border-line rounded-xl px-3 py-2.5"
                            >
                              <span className="text-xs ink-soft">
                                {composition.category}
                              </span>

                              <span className="text-sm font-semibold text-primary shrink-0">
                                {Number(
                                  composition.percentage
                                ).toLocaleString("id-ID")}
                                %
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Result photo */}
                  {pickup.result_photo_url && (
                    <div className="mt-4">
                      <div className="flex items-center gap-1.5 mb-2">
                        <ImageIcon
                          size={13}
                          className="text-primary"
                        />

                        <p className="text-xs font-semibold ink">
                          Dokumentasi
                        </p>
                      </div>

                      <a
                        href={pickup.result_photo_url}
                        target="_blank"
                        rel="noreferrer"
                        className="tap inline-block"
                      >
                        <div className="space-y-1.5">
                          <img
                            src={pickup.result_photo_url}
                            alt="Foto hasil pickup"
                            className="w-24 h-24 rounded-xl object-cover border border-line"
                          />

                          <p className="text-[11px] text-primary font-semibold text-center">
                            Lihat foto
                          </p>
                        </div>
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          );
        })
      )}
    </div>
  );
}