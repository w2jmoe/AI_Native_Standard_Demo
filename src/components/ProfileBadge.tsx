import { normalizeProfileId, type ProfileId } from "@/lib/evaluation/profiles";

const PROFILE_SYMBOLS: Record<ProfileId, string> = {
  "AI Strategist": "🧭",
  "AI Explorer": "🔍",
  "AI Operator": "⚙️",
  "AI Architect": "🏗️",
  "Balanced AI Native": "✨",
};

type ProfileBadgeProps = {
  profileId: string;
  size?: "sm" | "md";
  className?: string;
};

export function getProfileSymbol(profileId: string): string {
  return PROFILE_SYMBOLS[normalizeProfileId(profileId)];
}

/** Small semantic badge — LinkedIn / skill-badge style, not a giant emoji. */
export function ProfileBadge({
  profileId,
  size = "md",
  className = "",
}: ProfileBadgeProps) {
  const symbol = getProfileSymbol(profileId);
  const dim = size === "sm" ? "h-8 w-8 text-[14px]" : "h-11 w-11 text-[18px]";

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full bg-[color:var(--brand-muted)] text-[color:var(--brand)] ring-1 ring-[color:var(--brand)]/10 ${dim} ${className}`}
      aria-hidden
    >
      <span className="leading-none">{symbol}</span>
    </span>
  );
}
