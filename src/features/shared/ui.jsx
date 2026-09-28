export function Ring({ pct, size = 108, children }) {
  return (
    <div
      className="ring-track rounded-full flex items-center justify-center"
      style={{ "--pct": `${pct}%`, width: size, height: size, padding: 6 }}
    >
      <div
        className="rounded-full flex flex-col items-center justify-center w-full h-full"
        style={{ background: "var(--primary-dark)" }}
      >
        {children}
      </div>
    </div>
  );
}

export function StatusChip({ status }) {
  const map = {
    Dijadwalkan: ["bg-gold-tint", "text-gold"],
    "Dalam Perjalanan": ["bg-teal-tint", "text-teal"],
    Selesai: ["bg-primary-tint", "text-primary"],
    Menunggu: ["bg-clay-tint", "text-clay"],
    Ditolak: ["bg-clay-tint", "text-clay"],
  };
  const [bg, txt] = map[status] || ["bg-primary-tint", "text-primary"];
  return (
    <span className={`chip ${bg} ${txt} px-2.5 py-1 rounded-full font-semibold whitespace-nowrap`}>
      {status}
    </span>
  );
}

export function IconBadge({ icon: Icon, tone = "primary", size = 44, iconSize = 18 }) {
  const tones = {
    primary: ["bg-primary-tint", "text-primary"],
    teal: ["bg-teal-tint", "text-teal"],
    gold: ["bg-gold-tint", "text-gold"],
    clay: ["bg-clay-tint", "text-clay"],
  };
  const [bg, txt] = tones[tone];
  return (
    <div
      className={`${bg} ${txt} rounded-xl flex items-center justify-center shrink-0`}
      style={{ width: size, height: size }}
    >
      <Icon size={iconSize} />
    </div>
  );
}

export function Card({ children, className = "", hoverable = false }) {
  return (
    <div
      className={`bg-surface border border-line shadow-soft rounded-2xl p-5 ${
        hoverable ? "card-hover" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}

export function SectionTitle({ eyebrow, title, action }) {
  return (
    <div className="flex items-end justify-between mb-4 gap-3">
      <div>
        {eyebrow && (
          <div className="flex items-center gap-2 mb-2">
            <div className="spectrum-underline spectrum" />
            <span className="chip text-primary uppercase font-semibold">{eyebrow}</span>
          </div>
        )}
        <h2 className="font-display text-xl font-bold ink">{title}</h2>
      </div>
      {action}
    </div>
  );
}
