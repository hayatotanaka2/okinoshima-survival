import type { ReactNode } from "react";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-md border border-reef/15 bg-white/90 p-4 shadow-glow backdrop-blur-sm ${className}`}>{children}</section>;
}

export function Stat({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-md border border-lagoon/15 bg-gradient-to-br from-white to-cyan-50 p-3">
      <p className="text-xs font-bold text-slate-400">{label}</p>
      <div className="mt-1 text-lg font-black text-ink">{value}</div>
    </div>
  );
}

export function PrimaryButton({
  children,
  type = "button",
  onClick,
  disabled,
}: {
  children: ReactNode;
  type?: "button" | "submit";
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="min-h-11 rounded-md bg-lagoon px-4 py-2 text-sm font-black text-ink shadow-[0_8px_22px_rgba(0,191,214,0.22)] transition hover:-translate-y-0.5 hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
    >
      {children}
    </button>
  );
}

export function Field({ children }: { children: ReactNode }) {
  return <label className="grid gap-1 text-sm font-bold text-ink">{children}</label>;
}

export const inputClass =
  "min-h-11 rounded-md border border-reef/20 bg-white px-3 py-2 text-base text-ink shadow-sm outline-none transition focus:border-lagoon focus:ring-2 focus:ring-lagoon/15";
