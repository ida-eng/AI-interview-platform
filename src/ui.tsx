import { useEffect, useState, type ReactNode } from "react";

// ---------- icons (stroke icons, 24px grid) ----------
const P: Record<string, string> = {
  logo: "M4 12a8 8 0 1 0 16 0 8 8 0 0 0-16 0Zm4 0a4 4 0 1 0 8 0 4 4 0 0 0-8 0",
  home: "M3 11.5 12 4l9 7.5M5 10v10h5v-6h4v6h5V10",
  mic: "M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3Zm-7 9a7 7 0 0 0 14 0M12 19v3",
  micOff: "M3 3l18 18M9 9v3a3 3 0 0 0 5.1 2.1M15 9.3V6a3 3 0 0 0-5.7-1.3M5 12a7 7 0 0 0 11.6 5.3M19 12a7 7 0 0 1-.4 2.3M12 19v3",
  brief: "M4 8h16v11H4zM9 8V5h6v3M4 13h16",
  kanban: "M4 4h4v16H4zM10 4h4v10h-4zM16 4h4v13h-4z",
  users: "M16 19v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1M9.5 10a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM21 19v-1a4 4 0 0 0-3-3.9M15.5 3.2a3.5 3.5 0 0 1 0 6.6",
  plus: "M12 5v14M5 12h14",
  chart: "M4 20V10M10 20V4M16 20v-7M22 20H2",
  search: "M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14Zm9 3-4.3-4.3",
  bell: "M6 8a6 6 0 1 1 12 0c0 7 3 8 3 8H3s3-1 3-8M10.3 21a1.9 1.9 0 0 0 3.4 0",
  bookmark: "M6 3h12v18l-6-4-6 4z",
  pin: "M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11Zm0-8.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z",
  clock: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-13v4l3 2",
  play: "M7 4v16l13-8z",
  check: "M5 12.5 10 17 19 7",
  x: "M6 6l12 12M18 6 6 18",
  arrow: "M5 12h14M13 6l6 6-6 6",
  back: "M19 12H5M11 6l-6 6 6 6",
  spark: "M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z",
  volume: "M4 9v6h4l5 4V5L8 9zm12 0a4 4 0 0 1 0 6m2.5-9a8 8 0 0 1 0 12",
  refresh: "M20 11a8 8 0 1 0-2.3 5.7M20 5v6h-6",
  flame: "M12 22c4 0 7-3 7-7 0-4-3-6-4-10-2 2-3 4-3 6-1-1-2-2-2-4-2 2-5 5-5 8 0 4 3 7 7 7Z",
  trophy: "M8 21h8M12 17v4M7 4h10v4a5 5 0 0 1-10 0V4ZM7 6H4a3 3 0 0 0 3 4M17 6h3a3 3 0 0 1-3 4",
  target: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-4a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0-4a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z",
  send: "M22 2 11 13M22 2l-7 20-4-9-9-4z",
  eye: "M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Zm10 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
  menu: "M4 7h16M4 12h16M4 17h16",
  euro: "M17 6.5A6.5 6.5 0 1 0 17 17.5M4 10h9M4 14h9",
  globe: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM3 12h18M12 3c2.5 2.5 3.8 5.5 3.8 9s-1.3 6.5-3.8 9c-2.5-2.5-3.8-5.5-3.8-9S9.5 5.5 12 3Z",
  lightbulb: "M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2V16h5v-.1c0-.8.4-1.5 1-2A6 6 0 0 0 12 3Z",
  building: "M4 21V5l8-2v18M12 9h8v12M8 8v.01M8 12v.01M8 16v.01M16 13v.01M16 17v.01",
  drag: "M9 6h.01M15 6h.01M9 12h.01M15 12h.01M9 18h.01M15 18h.01",
  code: "M8 8l-4 4 4 4M16 8l4 4-4 4M14 5l-4 14", server: "M4 4h16v6H4zM4 14h16v6H4zM8 7h.01M8 17h.01",
  layers: "M12 3 2 8l10 5 10-5zM2 13l10 5 10-5", cloud: "M7 18a5 5 0 1 1 1-9.9A6 6 0 0 1 19.5 11 3.5 3.5 0 0 1 19 18z",
  compass: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm3.5-12.5-2 5-5 2 2-5z", pen: "M15 4l5 5L9 20H4v-5zM13 6l5 5",
  handshake: "M8 12l3-3 2 1 3-2 4 4-6 6-2-1-2 2-6-6zM2 10l3-3M22 10l-3-3", heart: "M12 20s-8-4.6-8-10.2A4.5 4.5 0 0 1 12 7a4.5 4.5 0 0 1 8 2.8C20 15.4 12 20 12 20Z",
  logout: "M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10",
};
export function Icon({ name, size = 18, stroke = 2, className = "" }: { name: string; size?: number; stroke?: number; className?: string }) {
  return (
    <svg className={`ico ${className}`} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={P[name] || P.spark} />
    </svg>
  );
}

export const initials = (name: string) => name.split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
export function Avatar({ name, color = "#8b6cff", size = 40 }: { name: string; color?: string; size?: number }) {
  return <span className="avatar" style={{ width: size, height: size, background: `linear-gradient(140deg, ${color}, ${color}bb)`, fontSize: size * 0.38 }}>{initials(name)}</span>;
}
export function Logo({ size = 30 }: { size?: number }) {
  return <span className="logo-mark" style={{ width: size, height: size }} aria-hidden="true"><i /></span>;
}

export function Ring({ value, size = 120, stroke = 10, label, color }: { value: number; size?: number; stroke?: number; label?: string; color?: string }) {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r;
  const [v, setV] = useState(0);
  useEffect(() => { const t = requestAnimationFrame(() => setV(value)); return () => cancelAnimationFrame(t); }, [value]);
  const col = color || (value >= 80 ? "var(--mint)" : value >= 60 ? "var(--amber)" : "var(--rose)");
  return (
    <div className="ring" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="var(--track)" strokeWidth={stroke} fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r} stroke={col} strokeWidth={stroke} fill="none" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - v / 100)} style={{ transition: "stroke-dashoffset 1.1s cubic-bezier(.2,.8,.2,1)" }}
          transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      </svg>
      <div className="ring-in"><b style={{ fontSize: size * 0.27 }}>{Math.round(v)}</b>{label && <span>{label}</span>}</div>
    </div>
  );
}

export function Radar({ data, size = 260 }: { data: Record<string, number>; size?: number }) {
  const keys = Object.keys(data), n = keys.length, pad = 70, W = size + pad * 2, cx = W / 2, cy = size / 2 + 6, R = size / 2 - 30;
  const pt = (i: number, v: number) => { const a = (Math.PI * 2 * i) / n - Math.PI / 2; return [cx + Math.cos(a) * R * (v / 100), cy + Math.sin(a) * R * (v / 100)]; };
  const poly = keys.map((k, i) => pt(i, data[k]).join(",")).join(" ");
  return (
    <svg className="radar" viewBox={`0 0 ${W} ${size + 12}`} role="img" aria-label={keys.map((k) => `${k} ${data[k]}`).join(", ")}>
      {[25, 50, 75, 100].map((l) => <polygon key={l} points={keys.map((_, i) => pt(i, l).join(",")).join(" ")} className="radar-grid" />)}
      {keys.map((_, i) => { const [x, y] = pt(i, 100); return <line key={i} x1={cx} y1={cy} x2={x} y2={y} className="radar-grid" />; })}
      <polygon points={poly} className="radar-fill" />
      {keys.map((k, i) => { const [x, y] = pt(i, data[k]); return <circle key={k} cx={x} cy={y} r={4} className="radar-dot" />; })}
      {keys.map((k, i) => { const [x, y] = pt(i, 120); return <text key={k} x={x} y={y} textAnchor={x < cx - 5 ? "end" : x > cx + 5 ? "start" : "middle"} dominantBaseline="middle" className="radar-label">{k}</text>; })}
    </svg>
  );
}

export function Bars({ items }: { items: { label: string; value: number; color?: string }[] }) {
  const [on, setOn] = useState(false);
  useEffect(() => { const t = setTimeout(() => setOn(true), 60); return () => clearTimeout(t); }, []);
  return (
    <div className="bars">
      {items.map((it) => (
        <div className="bar-row" key={it.label}>
          <span>{it.label}</span>
          <div className="bar"><i style={{ width: on ? `${it.value}%` : 0, background: it.color }} /></div>
          <b>{it.value}</b>
        </div>
      ))}
    </div>
  );
}

export function Spark({ values, w = 84, h = 32 }: { values: number[]; w?: number; h?: number }) {
  if (values.length < 2) return null;
  const min = Math.min(...values) - 5, max = Math.max(...values) + 5;
  const pts = values.map((v, i) => [(i / (values.length - 1)) * w, h - ((v - min) / (max - min)) * h]);
  const d = pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  return <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="spark" aria-hidden="true"><path d={`${d} L${w},${h} L0,${h} Z`} className="spark-area" /><path d={d} className="spark-line" /></svg>;
}

// ---------- overlays ----------
export function Modal({ open, onClose, title, children, wide = false }: { open: boolean; onClose: () => void; title: string; children: ReactNode; wide?: boolean }) {
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", k);
    document.body.classList.add("locked");
    return () => { document.removeEventListener("keydown", k); document.body.classList.remove("locked"); };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`modal ${wide ? "wide" : ""}`} role="dialog" aria-modal="true" aria-label={title}>
        <div className="modal-head"><h2>{title}</h2><button className="icon-btn" onClick={onClose} aria-label="Close"><Icon name="x" /></button></div>
        {children}
      </div>
    </div>
  );
}

let pushToast: (t: string) => void = () => {};
export const toast = (t: string) => pushToast(t);
export function Toaster() {
  const [items, setItems] = useState<{ id: number; t: string }[]>([]);
  useEffect(() => {
    pushToast = (t) => {
      const id = Date.now() + Math.random();
      setItems((x) => [...x, { id, t }]);
      setTimeout(() => setItems((x) => x.filter((i) => i.id !== id)), 3200);
    };
  }, []);
  return <div className="toasts" role="status">{items.map((i) => <div className="toast" key={i.id}><Icon name="check" size={16} />{i.t}</div>)}</div>;
}

// ---------- routing ----------
export function useRoute() {
  const get = () => (location.hash.replace(/^#/, "") || "/");
  const [r, setR] = useState(get);
  useEffect(() => {
    const f = () => { setR(get()); window.scrollTo({ top: 0 }); };
    addEventListener("hashchange", f);
    return () => removeEventListener("hashchange", f);
  }, []);
  return r;
}
export const go = (path: string) => { location.hash = path; };

export function timeAgo(t: number) {
  const s = (Date.now() - t) / 1000;
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  const d = Math.floor(s / 86400);
  return d === 1 ? "yesterday" : d < 30 ? `${d} days ago` : new Date(t).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}
export const salary = (a: number, b: number, c = "€") => `${c}${Math.round(a / 1000)}k–${Math.round(b / 1000)}k`;
export const fmtTime = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
