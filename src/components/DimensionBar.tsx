"use client";

type DimensionBarProps = {
  label: string;
  score: number;
};

export function DimensionBar({ label, score }: DimensionBarProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-4">
        <span className="text-[15px] text-black/70">{label}</span>
        <span className="tabular-nums text-[15px] font-semibold text-[color:var(--brand)]">
          {score}
        </span>
      </div>
      <div className="h-[3px] overflow-hidden rounded-full bg-[color:var(--brand-muted)]">
        <div
          className="h-full rounded-full bg-[color:var(--brand)] transition-[width] duration-700 ease-out"
          style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
        />
      </div>
    </div>
  );
}
