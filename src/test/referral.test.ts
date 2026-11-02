import { describe, it, expect } from 'vitest';
import { buildReferralCode } from '@/lib/referral';

describe('referral code', () => {
  it('is generated from the current user (João Silva → SMILE-JOAO-…), not a fixed code', () => {
    const code = buildReferralCode('João Silva', 'user-1');
    expect(code.startsWith('SMILE-JOAO-')).toBe(true);
    expect(code).not.toContain('GONCALO');
  });
  it('differs between users', () => {
    expect(buildReferralCode('João Silva', 'a')).not.toBe(buildReferralCode('João Silva', 'b'));
  });
});
