import { useEffect, useState, useCallback } from "react";
import { supabase } from "../../lib/supabaseClient";

export function useNotifications(userId) {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!userId) return;
    supabase
      .from("notifications")
      .select("*")
      .eq("warga_id", userId)
      .order("created_at", { ascending: false })
      .limit(10)
      .then(({ data }) => setNotifications(data ?? []));
  }, [userId]);

  return notifications;
}

export function useWargaPickups(userId) {
  const [pickups, setPickups] = useState([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(() => {
    if (!userId) return;
    setLoading(true);
    supabase
      .from("pickup_requests")
      .select("*")
      .eq("warga_id", userId)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setPickups(data ?? []);
        setLoading(false);
      });
  }, [userId]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { pickups, loading, reload };
}

export async function submitPickupRequest({ warga_id, jenis, volume_kg, alamat, foto }) {
  let foto_url = null;
  if (foto) {
    const path = `${warga_id}/${Date.now()}-${foto.name}`;
    const { error: uploadError } = await supabase.storage.from("pickup-photos").upload(path, foto);
    if (!uploadError) {
      foto_url = supabase.storage.from("pickup-photos").getPublicUrl(path).data.publicUrl;
    }
  }
  const { error } = await supabase
    .from("pickup_requests")
    .insert({ warga_id, jenis, volume_kg, alamat, foto_url });
  if (error) throw error;
}

export function useEducationModules(userId) {
  const [modules, setModules] = useState([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const { data: moduleRows } = await supabase
        .from("education_modules")
        .select("*")
        .order("created_at", { ascending: true });

      let progressByModule = {};
      if (userId) {
        const { data: progressRows } = await supabase
          .from("education_progress")
          .select("*")
          .eq("warga_id", userId);
        progressByModule = Object.fromEntries((progressRows ?? []).map((p) => [p.module_id, p]));
      }

      if (!cancelled) {
        setModules(
          (moduleRows ?? []).map((m) => ({
            ...m,
            percent: progressByModule[m.id]?.percent ?? 0,
          }))
        );
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  return modules;
}

export function useBankUnits() {
  const [units, setUnits] = useState([]);

  useEffect(() => {
    supabase
      .from("bank_units")
      .select("*")
      .order("name", { ascending: true })
      .then(({ data }) => setUnits(data ?? []));
  }, []);

  return units;
}
