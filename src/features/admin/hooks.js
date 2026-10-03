import { useCallback, useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

function todayDateString() {
  return new Date().toISOString().slice(0, 10);
}

export function useAdminStats() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    async function load() {
      const today = todayDateString();

      const [{ count: wargaCount }, { data: setoran }] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "warga"),
        supabase
          .from("bank_manual_records")
          .select("weight_kg, deposit_amount, bank_unit_id, bank_units(kelurahan)")
          .eq("tanggal", today),
      ]);

      const volumeKg = (setoran ?? []).reduce((sum, t) => sum + Number(t.weight_kg ?? 0), 0);
      const nilaiRp = (setoran ?? []).reduce((sum, t) => sum + Number(t.deposit_amount ?? 0), 0);

      const byWilayah = {};
      for (const t of setoran ?? []) {
        const kel = t.bank_units?.kelurahan ?? "Tidak diketahui";
        byWilayah[kel] = (byWilayah[kel] ?? 0) + Number(t.weight_kg ?? 0);
      }

      setStats({
        wargaCount: wargaCount ?? 0,
        volumeKg,
        nilaiRp,
        wilayah: Object.entries(byWilayah).map(([kelurahan, kg]) => ({ kelurahan, kg })),
      });
    }
    load();
  }, []);

  return stats;
}

export function useBankUnitsAdmin() {
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(() => {
    setLoading(true);
    supabase
      .from("bank_units")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setUnits(data ?? []);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { units, loading, reload };
}

export async function setBankUnitStatus(id, status) {
  const { error } = await supabase.from("bank_units").update({ status }).eq("id", id);
  if (error) throw error;
}

export function useEducationModulesAdmin() {
  const [modules, setModules] = useState([]);

  const reload = useCallback(() => {
    supabase
      .from("education_modules")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => setModules(data ?? []));
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { modules, reload };
}

export async function addEducationModule({ title, kind, content_url }) {
  const { error } = await supabase.from("education_modules").insert({ title, kind, content_url });
  if (error) throw error;
}

export function useProfilesAdmin() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(() => {
    setLoading(true);
    supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setProfiles(data ?? []);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { profiles, loading, reload };
}

export async function setProfileRole(id, role) {
  const { error } = await supabase.from("profiles").update({ role }).eq("id", id);
  if (error) throw error;
}

export function useAdminPickupHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(() => {
    setLoading(true);

    supabase
      .from("pickup_results")
      .select(`
        *,
        pickup_compositions (
          id,
          category,
          percentage
        )
      `)
      .order("completed_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          console.error("Gagal memuat riwayat pickup:", error);
          setHistory([]);
        } else {
          setHistory(data ?? []);
        }

        setLoading(false);
      });
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { history, loading, reload };
}

const ADMIN_PICKUP_SELECT =
  "*, warga:profiles!pickup_requests_warga_id_fkey(full_name)";

export function useAdminPickupTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(() => {
    setLoading(true);

    supabase
      .from("pickup_requests")
      .select(ADMIN_PICKUP_SELECT)
      .in("status", ["Dijadwalkan", "Dalam Perjalanan", "Telah Dijemput"])
      .order("scheduled_at", { ascending: true, nullsFirst: false })
      .then(({ data, error }) => {
        if (error) {
          console.error("Gagal memuat pickup aktif:", error);
          setTasks([]);
        } else {
          setTasks(data ?? []);
        }

        setLoading(false);
      });
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { tasks, loading, reload };
}

export async function startAdminPickup(pickupId, adminId) {
  const { error } = await supabase
    .from("pickup_requests")
    .update({
      status: "Dalam Perjalanan",
      petugas_id: adminId,
    })
    .eq("id", pickupId);

  if (error) throw error;
}

export async function markAdminPickupCollected(pickupId, adminId) {
  const { error } = await supabase
    .from("pickup_requests")
    .update({
      status: "Telah Dijemput",
      petugas_id: adminId,
    })
    .eq("id", pickupId);

  if (error) throw error;
}

export async function completeAdminPickup(
  pickupId,
  actualVolumeKg,
  resultPhoto,
  adminId
) {
  let result_photo_url = null;

  if (resultPhoto) {
    const path = `${adminId}/results/${pickupId}-${Date.now()}-${resultPhoto.name}`;

    const { error: uploadError } = await supabase.storage
      .from("pickup-photos")
      .upload(path, resultPhoto);

    if (uploadError) {
      throw uploadError;
    }

    result_photo_url = supabase.storage
      .from("pickup-photos")
      .getPublicUrl(path).data.publicUrl;
  }

  const { error } = await supabase
    .from("pickup_requests")
    .update({
      status: "Selesai",
      actual_volume_kg: actualVolumeKg,
      result_photo_url,
      completed_at: new Date().toISOString(),
      petugas_id: adminId,
    })
    .eq("id", pickupId);

  if (error) throw error;
}

export async function saveAdminPickupResult({
  pickupId,
  actualVolumeKg,
  wasteSource,
  compositions,
  resultPhoto,
  adminId,
}) {
  const compositionTotal = Object.values(compositions).reduce(
    (total, percentage) => total + Number(percentage || 0),
    0
  );

  if (Math.abs(compositionTotal - 100) >= 0.001) {
    throw new Error("Total komposisi sampah harus 100%.");
  }

  let resultPhotoUrl = null;

  if (resultPhoto) {
    const path = `${adminId}/results/${pickupId}-${Date.now()}-${resultPhoto.name}`;

    const { error: uploadError } = await supabase.storage
      .from("pickup-photos")
      .upload(path, resultPhoto);

    if (uploadError) throw uploadError;

    resultPhotoUrl = supabase.storage
      .from("pickup-photos")
      .getPublicUrl(path).data.publicUrl;
  }

  const { data: resultId, error } = await supabase.rpc(
    "complete_system_pickup",
    {
      p_pickup_id: pickupId,
      p_actual_volume_kg: actualVolumeKg,
      p_waste_source: wasteSource,
      p_compositions: compositions,
      p_result_photo_url: resultPhotoUrl,
      p_admin_id: adminId,
    }
  );

  if (error) throw error;

  console.log("Pickup berhasil diselesaikan:", resultId);

  return resultId;
}