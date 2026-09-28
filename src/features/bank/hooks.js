import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export async function findWargaMember(query) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "warga")
    .ilike("full_name", `%${query}%`)
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function submitTransaction({ warga_id, bank_unit_id, kategori, berat_kg, nilai_rp }) {
  const { error } = await supabase
    .from("bank_transactions")
    .insert({ warga_id, bank_unit_id, kategori, berat_kg, nilai_rp, jenis: "Setor" });
  if (error) throw error;
}

export function useBankUnit(bankUnitId) {
  const [unit, setUnit] = useState(null);

  useEffect(() => {
    if (!bankUnitId) return;
    supabase
      .from("bank_units")
      .select("*")
      .eq("id", bankUnitId)
      .single()
      .then(({ data }) => setUnit(data ?? null));
  }, [bankUnitId]);

  return unit;
}

export function useUnitTransactions(bankUnitId) {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    if (!bankUnitId) return;
    supabase
      .from("bank_transactions")
      .select("*")
      .eq("bank_unit_id", bankUnitId)
      .order("created_at", { ascending: false })
      .then(({ data }) => setTransactions(data ?? []));
  }, [bankUnitId]);

  return transactions;
}
