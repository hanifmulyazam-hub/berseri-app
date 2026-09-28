import { useCallback, useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

const TASK_SELECT = "*, warga:profiles!pickup_requests_warga_id_fkey(full_name)";

export function usePetugasTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(() => {
    setLoading(true);
    supabase
      .from("pickup_requests")
      .select(TASK_SELECT)
      .in("status", ["Dijadwalkan", "Dalam Perjalanan"])
      .order("scheduled_at", { ascending: true, nullsFirst: false })
      .then(({ data }) => {
        setTasks(data ?? []);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { tasks, loading, reload };
}

export async function advanceTask(task, petugasId) {
  const nextStatus = task.status === "Dijadwalkan" ? "Dalam Perjalanan" : "Selesai";
  const { error } = await supabase
    .from("pickup_requests")
    .update({ status: nextStatus, petugas_id: petugasId })
    .eq("id", task.id);
  if (error) throw error;
}

export function usePetugasHistory(petugasId) {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (!petugasId) return;
    supabase
      .from("pickup_requests")
      .select(TASK_SELECT)
      .eq("status", "Selesai")
      .eq("petugas_id", petugasId)
      .order("created_at", { ascending: false })
      .then(({ data }) => setHistory(data ?? []));
  }, [petugasId]);

  return history;
}
