import { useState } from "react";
import { BookOpen, ChevronRight, Plus } from "lucide-react";
import { Card, IconBadge, SectionTitle } from "../shared/ui";
import { addEducationModule, useEducationModulesAdmin } from "./hooks";

export function AdminSOP() {
  const { modules, reload } = useEducationModulesAdmin();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState("Dokumen SOP");
  const [saving, setSaving] = useState(false);

  const handleAdd = async () => {
    if (!title) return;
    setSaving(true);
    try {
      await addEducationModule({ title, kind, content_url: null });
      setTitle("");
      setShowForm(false);
      reload();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <SectionTitle
        eyebrow="Konten"
        title="Kelola SOP & Modul Edukasi"
        action={
          <button
            onClick={() => setShowForm((v) => !v)}
            className="tap btn-primary text-white chip font-semibold px-4 py-2.5 rounded-full flex items-center gap-1.5"
          >
            <Plus size={13} /> Unggah Materi
          </button>
        }
      />
      {showForm && (
        <Card className="space-y-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Judul materi"
            className="w-full border border-line rounded-xl px-4 py-2.5 text-sm"
          />
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value)}
            className="w-full border border-line rounded-xl px-4 py-2.5 text-sm"
          >
            <option>Dokumen SOP</option>
            <option>Video Edukasi</option>
            <option>Infografis + Kuis</option>
          </select>
          <button
            onClick={handleAdd}
            disabled={saving}
            className="tap btn-primary text-white font-semibold rounded-xl py-2.5 px-5 text-sm disabled:opacity-60"
          >
            {saving ? "Menyimpan…" : "Simpan Materi"}
          </button>
        </Card>
      )}
      {modules.length === 0 ? (
        <p className="text-sm ink-soft">Belum ada materi.</p>
      ) : (
        modules.map((it) => (
          <Card key={it.id} className="flex items-center gap-4" hoverable>
            <IconBadge icon={BookOpen} tone="teal" size={44} iconSize={18} />
            <div className="flex-1">
              <p className="font-semibold ink text-sm">{it.title}</p>
              <p className="chip ink-soft mt-1">{it.kind}</p>
            </div>
            <ChevronRight size={16} className="ink-soft" />
          </Card>
        ))
      )}
    </div>
  );
}
