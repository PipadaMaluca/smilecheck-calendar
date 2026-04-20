import { UserRole } from '@/types/calendar';

/**
 * Reads the current viewer role from the URL search params (?role=patient|dentist|clinic).
 * Falls back to 'patient'. Safe for SSR/non-browser environments.
 */
export function getViewerRole(): UserRole {
  if (typeof window === 'undefined') return 'patient';
  const role = new URLSearchParams(window.location.search).get('role');
  if (role === 'dentist' || role === 'clinic' || role === 'patient') return role;
  return 'patient';
}