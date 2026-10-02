import { useState } from "react";
import { ClipboardPlus, Clock } from "lucide-react";
import { AdminPickupManual } from "./AdminPickupManual";
import { AdminRiwayatPickup } from "./AdminRiwayatPickup";

export function AdminPickupPage() {
  const [activeTab, setActiveTab] = useState("catat");

  return (
    <section className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold">
          Pickup
        </h1>

        <p className="text-sm ink-soft mt-1">
          Catat hasil pickup dan lihat riwayat pengambilan sampah.
        </p>
      </div>

      {/* Tabs */}
      <div className="inline-flex items-center gap-1 p-1 bg-paper border border-line rounded-xl">
        <button
          type="button"
          onClick={() => setActiveTab("catat")}
          className={`tap flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold ${
            activeTab === "catat"
              ? "bg-surface text-primary shadow-soft"
              : "ink-soft hover:bg-surface"
          }`}
        >
          <ClipboardPlus size={16} />
          Catat Pickup
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("riwayat")}
          className={`tap flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold ${
            activeTab === "riwayat"
              ? "bg-surface text-primary shadow-soft"
              : "ink-soft hover:bg-surface"
          }`}
        >
          <Clock size={16} />
          Riwayat Pickup
        </button>
      </div>

      {/* Content */}
      <div>
        {activeTab === "catat" ? (
          <AdminPickupManual />
        ) : (
          <AdminRiwayatPickup />
        )}
      </div>
    </section>
  );
}