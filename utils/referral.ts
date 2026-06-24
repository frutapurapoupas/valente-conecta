export function sanitizeForCode(value: string) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase();
}

export function getStableReferralCode(user: any, isAdmin?: boolean) {
  if (isAdmin) return 'ADMIN_VALENTE_2026';

  const dbCode = String(user?.codigo_indicacao || '').trim();
  if (dbCode) return dbCode;

  const base = sanitizeForCode(user?.id || user?.whatsapp || user?.email || user?.nome || 'VALENTE');
  const short = base.slice(-10) || 'USUARIO';
  return `VC_${short}`;
}