/**
 * Resolve the public site origin for persisted profile_url.
 * Prefer env (stable in production); fall back to request headers.
 */
export function resolvePublicOrigin(request?: Request): string | null {
  const fromEnv =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.SITE_URL?.trim();
  if (fromEnv) {
    return fromEnv.replace(/\/$/, "");
  }

  if (!request) return null;

  const origin = request.headers.get("origin")?.trim();
  if (origin) {
    return origin.replace(/\/$/, "");
  }

  const host =
    request.headers.get("x-forwarded-host")?.trim() ||
    request.headers.get("host")?.trim();
  if (!host) return null;

  const proto =
    request.headers.get("x-forwarded-proto")?.trim() || "https";
  return `${proto}://${host}`.replace(/\/$/, "");
}

export function buildProfileUrl(
  origin: string | null | undefined,
  assessmentId: string,
): string {
  const path = `/profile/${assessmentId}`;
  if (!origin) return path;
  return `${origin.replace(/\/$/, "")}${path}`;
}
