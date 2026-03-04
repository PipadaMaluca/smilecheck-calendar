// Shared avatar utilities for consistent initials/photos across the app

const TITLE_PREFIXES = ['dr.', 'dr', 'dra.', 'dra'];

/**
 * Get initials for a dentist name, stripping Dr./Dra. prefix
 * "Dr. Gonçalo Pipo" → "GP"
 */
export function getDentistInitials(name: string): string {
  const parts = name.split(' ').filter(n => !TITLE_PREFIXES.includes(n.toLowerCase()));
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0][0]?.toUpperCase() || '?';
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Get initials for a clinic name
 * "SmileCheck" → "CS" (C + first letter)
 * "Clínica SmileCheck" → "CS"
 * "Clínica Mitry-Mory" → "CM"
 */
export function getClinicInitials(name: string): string {
  const words = name.split(/[\s-]+/).filter(Boolean);
  if (words.length === 0) return '?';
  if (words.length === 1) return ('C' + words[0][0]).toUpperCase();
  return words.map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

/**
 * Get initials for a patient name (first + last)
 */
export function getPatientInitials(name: string): string {
  const parts = name.split(' ').filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0][0]?.toUpperCase() || '?';
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Avatar photo map for dentists that have profile photos
import avatarGoncalo from '@/assets/avatars/dentist-goncalo.jpg';
import avatarAlexandre from '@/assets/avatars/dentist-alexandre.jpg';
import avatarGil from '@/assets/avatars/dentist-gil.jpg';

export const DENTIST_AVATAR_PHOTOS: Record<string, string> = {
  '1': avatarGoncalo,    // Dr. Gonçalo Pipo
  '2': avatarAlexandre,  // Dr. Alexandre Bernardo
  '3': avatarGil,        // Dr. Gil Santos
};
