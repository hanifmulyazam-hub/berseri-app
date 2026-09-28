import { useState } from "react";
import { UserCog } from "lucide-react";
import { Card, IconBadge, SectionTitle } from "../shared/ui";
import { ROLES } from "../shared/tokens";
import { useAuth } from "../../context/AuthContext";
import { setProfileRole, useProfilesAdmin } from "./hooks";

export function AdminPengguna() {
  const { role: myRole } = useAuth();
  const { profiles, reload } = useProfilesAdmin();
  const [savingId, setSavingId] = useState(null);
  // Only a superadmin can hand out the superadmin role itself.
  const assignableRoles = ROLES.filter((r) => r.id !== "superadmin" || myRole === "superadmin");

  const changeRole = async (id, role) => {
    setSavingId(id);
    try {
      await setProfileRole(id, role);
      reload();
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <SectionTitle eyebrow="Kelembagaan" title="Kelola Pengguna & Peran" />
      {profiles.length === 0 ? (
        <p className="text-sm ink-soft">Belum ada pengguna terdaftar.</p>
      ) : (
        profiles.map((p) => (
          <Card key={p.id} className="flex items-center gap-4" hoverable>
            <IconBadge icon={UserCog} tone="primary" size={44} iconSize={18} />
            <div className="flex-1 min-w-0">
              <p className="font-semibold ink text-sm truncate">{p.full_name}</p>
              <p className="chip ink-soft mt-1">{p.phone || p.id}</p>
            </div>
            <select
              value={p.role}
              disabled={savingId === p.id}
              onChange={(e) => changeRole(p.id, e.target.value)}
              className="tap border border-line rounded-xl px-3 py-2 text-sm font-semibold bg-surface disabled:opacity-60"
            >
              {assignableRoles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </select>
          </Card>
        ))
      )}
    </div>
  );
}
