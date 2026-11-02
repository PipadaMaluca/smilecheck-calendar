/**
 * Portuguese SNS dental vouchers (cheque-dentista / cheque-prótese).
 * Only clinics in Portugal can accept them (enforced server-side by trg_guard_clinic_cheques).
 * Demo/mock clinics keyed by mock id; real clinics read the clinics.accepts_cheque_* columns.
 */
export type ClinicCountry = 'PT' | 'FR';

export interface ClinicCheques { country: ClinicCountry; dentista: boolean; protese: boolean }

export const DEMO_CLINIC_CHEQUES: Record<string, ClinicCheques> = {
  '1': { country: 'PT', dentista: true, protese: true },   // Clínica SmileCheck (Lisboa)
  '2': { country: 'FR', dentista: false, protese: false }, // Mitry-Mory
  '3': { country: 'FR', dentista: false, protese: false }, // Montfermeil
};

export const chequesForClinic = (id: string): ClinicCheques =>
  DEMO_CLINIC_CHEQUES[id] ?? { country: 'FR', dentista: false, protese: false };

/** Cheque-prótese is accepted from January 2027 onwards. */
export const CHEQUE_PROTESE_START = new Date(2027, 0, 1);

export const countryFromTimezone = (tz: string | null | undefined): ClinicCountry =>
  tz === 'Europe/Paris' ? 'FR' : 'PT';
