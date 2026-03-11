export const ADMIN_COOKIE_NAME = "vc_admin_session";

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export function getConfiguredAdminEmails() {
  const raw =
    process.env.NEXT_PUBLIC_ADMIN_EMAILS ||
    process.env.NEXT_PUBLIC_ADMIN_EMAIL ||
    "";

  return raw
    .split(",")
    .map((item) => normalizeEmail(item))
    .filter(Boolean);
}

export function isAllowedAdminEmail(email?: string | null) {
  if (!email) return false;

  const normalized = normalizeEmail(email);
  const allowedEmails = getConfiguredAdminEmails();

  if (allowedEmails.length === 0) return false;

  return allowedEmails.includes(normalized);
}

export function setAdminCookie() {
  if (typeof document === "undefined") return;

  document.cookie = `${ADMIN_COOKIE_NAME}=ok; path=/; max-age=${60 * 60 * 8}; samesite=lax`;
}

export function clearAdminCookie() {
  if (typeof document === "undefined") return;

  document.cookie = `${ADMIN_COOKIE_NAME}=; path=/; max-age=0; samesite=lax`;
}