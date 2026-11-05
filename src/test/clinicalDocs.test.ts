import { describe, it, expect, vi } from 'vitest';

const rpcMock = vi.fn();
vi.mock('@/integrations/supabase/client', () => ({ supabase: { rpc: (...a: unknown[]) => rpcMock(...a) } }));

import { verifyDocument, cleanItems, VERIFY_PUBLIC_KEYS, docNumberLabel } from '@/data/clinicalDocs';
import { TYPE_TARGETS } from '@/lib/notificationTargets';
import { mapNotificationType } from '@/data/notificationsSource';

describe('Clinical documents', () => {
  it('public QR check never passes patient data through, even if the server sent it', async () => {
    rpcMock.mockResolvedValueOnce({
      data: { status: 'anulada', kind: 'prescription', issued_on: '2026-11-05', clinic: 'Clínica X', patient: 'Maria', date_of_birth: '1980-01-01' },
      error: null,
    });
    const r = await verifyDocument('ABC');
    expect(Object.keys(r).sort()).toEqual([...VERIFY_PUBLIC_KEYS].sort());
    expect(r).not.toHaveProperty('patient');
    expect(r.status).toBe('anulada');
  });

  it('items without a medicine are dropped before issuing', () => {
    const items = cleanItems([
      { medicamento: ' Amoxicilina ', dosagem: '500mg', posologia: '8/8h', duracao: '7 dias', quantidade: '1' },
      { medicamento: '  ', dosagem: 'x', posologia: '', duracao: '', quantidade: '' },
    ]);
    expect(items).toHaveLength(1);
    expect(items[0].medicamento).toBe('Amoxicilina');
  });

  it('per-clinic sequential number is shown padded', () => {
    expect(docNumberLabel('prescription', 7)).toBe('RX-00007');
    expect(docNumberLabel('referral_letter', 12)).toBe('REF-00012');
  });

  it('letter recipients and job applications open a concrete screen', () => {
    expect(TYPE_TARGETS[mapNotificationType('referral_letter_received')]).toBe('/app?tab=pesquisa&section=cartas');
    expect(TYPE_TARGETS[mapNotificationType('job_application')]).toBe('/app?tab=pesquisa&section=emprego');
  });
});
