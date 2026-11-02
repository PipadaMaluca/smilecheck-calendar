import { describe, it, expect, beforeEach } from 'vitest';
import { chequesForClinic, countryFromTimezone, CHEQUE_PROTESE_START } from '@/lib/cheques';
import { PLAN_MONTHLY_PRICE, annualTotalPrice } from '@/lib/planRules';
import { planPriceId } from '@/lib/stripe';
import { AVAILABLE_CHANNELS } from '@/components/settings/NotificationSettingsSection';
import { adsArePersonalised, readLocalConsent } from '@/lib/consent';

describe('cheque-dentista / cheque-prótese', () => {
  it('Clínica SmileCheck (Lisboa) accepts both', () => {
    expect(chequesForClinic('1')).toEqual({ country: 'PT', dentista: true, protese: true });
  });
  it('French clinics never accept cheques', () => {
    expect(chequesForClinic('2').dentista || chequesForClinic('2').protese).toBe(false);
    expect(chequesForClinic('3').dentista || chequesForClinic('3').protese).toBe(false);
  });
  it('country follows the clinic timezone', () => {
    expect(countryFromTimezone('Europe/Paris')).toBe('FR');
    expect(countryFromTimezone('Europe/Lisbon')).toBe('PT');
  });
  it('cheque-prótese starts in January 2027', () => {
    expect(CHEQUE_PROTESE_START.getFullYear()).toBe(2027);
    expect(CHEQUE_PROTESE_START.getMonth()).toBe(0);
  });
});

describe('subscription prices match the payment catalogue', () => {
  // Amounts created in the payments test catalogue, in cents.
  const CATALOGUE: Record<string, number> = {
    patient_pro_monthly: 499, patient_pro_yearly: 5088, patient_premium_monthly: 999, patient_premium_yearly: 10188,
    dentist_pro_monthly: 1999, dentist_pro_yearly: 20388, dentist_premium_monthly: 2999, dentist_premium_yearly: 30588,
    clinic_pro_monthly: 3999, clinic_pro_yearly: 40788, clinic_premium_monthly: 4999, clinic_premium_yearly: 50988,
  };
  for (const role of ['patient', 'dentist', 'clinic'] as const) {
    for (const tier of ['pro', 'premium'] as const) {
      it(`${role} ${tier} monthly and annual (−15%)`, () => {
        expect(Math.round(PLAN_MONTHLY_PRICE[role][tier] * 100)).toBe(CATALOGUE[planPriceId(role, tier, false)]);
        expect(Math.round(annualTotalPrice(PLAN_MONTHLY_PRICE[role][tier]) * 100)).toBe(CATALOGUE[planPriceId(role, tier, true)]);
      });
    }
  }
});

describe('notification channels', () => {
  it('only e-mail is available; push, SMS and WhatsApp are coming soon', () => {
    expect([...AVAILABLE_CHANNELS]).toEqual(['email']);
  });
});

describe('consent', () => {
  beforeEach(() => localStorage.clear());
  it('everything except necessary is refused by default', () => {
    expect(readLocalConsent()).toBeNull();
    expect(adsArePersonalised(readLocalConsent())).toBe(false);
  });
});
