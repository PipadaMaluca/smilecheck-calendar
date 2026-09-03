import type { AuthError } from '@supabase/supabase-js';

/**
 * Supabase rejects passwords found in the HaveIBeenPwned corpus when the
 * leaked-password protection (HIBP) is enabled. The error surfaces either as
 * the `weak_password` code or as a message mentioning a known/pwned password.
 */
export function isLeakedPasswordError(error: Pick<AuthError, 'message'> & { code?: string | null }): boolean {
  const code = (error as { code?: string | null }).code ?? '';
  if (code === 'weak_password') return true;
  const msg = error.message?.toLowerCase() ?? '';
  return (
    msg.includes('pwned') ||
    msg.includes('data breach') ||
    msg.includes('known to be weak') ||
    (msg.includes('password') && msg.includes('easy to guess'))
  );
}

/**
 * Maps a Supabase auth error to a user-facing message.
 * Returns `{ field }` so callers can render it inline next to the right input.
 */
export function mapAuthError(
  error: Pick<AuthError, 'message'> & { code?: string | null },
  t: (key: string, opts?: Record<string, unknown>) => string
): { field: 'password' | 'email' | 'general'; message: string } {
  if (isLeakedPasswordError(error)) {
    return { field: 'password', message: t('auth.passwordLeaked') };
  }
  if (/already registered|user already/i.test(error.message ?? '')) {
    return { field: 'email', message: t('auth.emailInUse', { defaultValue: 'Este email já está registado.' }) };
  }
  return { field: 'general', message: error.message ?? '' };
}
