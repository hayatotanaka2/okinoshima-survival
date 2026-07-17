import type { ReactNode } from "react";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-md border border-white/10 bg-white/[0.06] p-4 shadow-glow ${className}`}>{children}</section>;
}

export function Stat({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-md bg-slate-950/50 p-3">
      <p className="text-xs text-slate-400">{label}</p>
      <div className="mt-1 text-lg font-black">{value}</div>
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
      className="min-h-11 rounded-md bg-lagoon px-4 py-2 text-sm font-black text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {children}
    </button>
  );
}

export function Field({ children }: { children: ReactNode }) {
  return <label className="grid gap-1 text-sm font-bold text-slate-200">{children}</label>;
}

export const inputClass =
  "min-h-11 rounded-md border border-white/10 bg-slate-950/70 px-3 py-2 text-base text-white outline-none focus:border-lagoon";
