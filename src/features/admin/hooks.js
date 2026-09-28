import { useCallback, useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

function startOfMonth() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString();
}

export function useAdminStats() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    async function load() {
      const monthStart = startOfMonth();

      const [{ count: wargaCount }, { data: setoran }, { count: pickupSelesai }] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "warga"),
        supabase
          .from("bank_transactions")
          .select("berat_kg, nilai_rp, bank_unit_id, bank_units(kelurahan)")
          .eq("jenis", "Setor")
          .gte("created_at", monthStart),
        supabase
          .from("pickup_requests")
          .select("id", { count: "exact", head: true })
          .eq("status", "Selesai")
          .gte("created_at", monthStart),
      ]);

      const volumeKg = (setoran ?? []).reduce((sum, t) => sum + Number(t.berat_kg ?? 0), 0);
      const nilaiRp = (setoran ?? []).reduce((sum, t) => sum + Number(t.nilai_rp ?? 0), 0);

      const byWilayah = {};
      for (const t of setoran ?? []) {
        const kel = t.bank_units?.kelurahan ?? "Tidak diketahui";
        byWilayah[kel] = (byWilayah[kel] ?? 0) + Number(t.berat_kg ?? 0);
      }

      setStats({
        wargaCount: wargaCount ?? 0,
        volumeKg,
        nilaiRp,
        pickupSelesai: pickupSelesai ?? 0,
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
