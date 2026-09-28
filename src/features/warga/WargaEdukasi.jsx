import { BookOpen, Star, ChevronRight } from "lucide-react";
import { Card, IconBadge, SectionTitle } from "../shared/ui";
import { useAuth } from "../../context/AuthContext";
import { useEducationModules } from "./hooks";

export function WargaEdukasi() {
  const { profile } = useAuth();
  const modules = useEducationModules(profile?.id);

  return (
    <div className="space-y-4">
      <SectionTitle eyebrow="Belajar" title="Modul Edukasi & Kuis" />
      {modules.length === 0 ? (
        <p className="text-sm ink-soft">Belum ada modul edukasi.</p>
      ) : (
        modules.map((m) => (
          <Card key={m.id} className="flex items-center gap-4" hoverable>
            <IconBadge icon={BookOpen} tone="teal" size={48} iconSize={20} />
            <div className="flex-1">
              <p className="font-semibold ink">{m.title}</p>
              <div className="w-full h-1.5 bg-paper rounded-full mt-2.5 overflow-hidden">
                <div className="h-full spectrum rounded-full" style={{ width: `${m.percent}%` }} />
              </div>
            </div>
            {m.percent >= 100 && <IconBadge icon={Star} tone="gold" size={32} iconSize={14} />}
            <ChevronRight size={18} className="ink-soft shrink-0" />
          </Card>
        ))
      )}
    </div>
  );
}
