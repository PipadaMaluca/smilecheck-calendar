import { describe, it, expect, vi } from 'vitest';

const rpcMock = vi.fn();
vi.mock('@/integrations/supabase/client', () => ({ supabase: { rpc: (...a: unknown[]) => rpcMock(...a) } }));

import { wasEdited, toothToEntry, buildOdontogram, validateDocFile, docPath, fetchMyPlans, mergeSafetySources, parseSelfDeclared, DOC_MAX_BYTES, SIGNED_URL_SECONDS } from '@/data/dossierSource';
import { getDefaultOdontogram } from '@/components/odontogram/odontogramData';

describe('Clinical dossier rules', () => {
  it('a note shows "edited" only after a correction version', () => {
    expect(wasEdited({ version: 1 })).toBe(false);
    expect(wasEdited({ version: 2 })).toBe(true);
  });

  it('documents: only PDF/JPG/PNG/WebP up to 15 MB', () => {
    expect(validateDocFile({ type: 'application/pdf', size: 1000 })).toBeNull();
    expect(validateDocFile({ type: 'image/webp', size: DOC_MAX_BYTES })).toBeNull();
    expect(validateDocFile({ type: 'image/gif', size: 1000 })).toBe('dossierReal.docs.badType');
    expect(validateDocFile({ type: 'image/png', size: 15 * 1024 * 1024 + 1 })).toBe('dossierReal.docs.tooBig');
  });

  it('documents live in the patient folder and signed URLs are short-lived', () => {
    expect(docPath('pat-1', 'image/jpeg', 'x').startsWith('pat-1/')).toBe(true);
    expect(SIGNED_URL_SECONDS).toBeLessThanOrEqual(300);
  });

  it('patient plan view never carries internal notes', async () => {
    rpcMock.mockResolvedValueOnce({ data: [{ id: 'p', title: 'T', internal_notes: 'SECRET', items: [], created_at: '', updated_at: '' }], error: null });
    const plans = await fetchMyPlans();
    expect(plans[0]).not.toHaveProperty('internal_notes');
  });

  it('odontogram keeps the latest entry per tooth', () => {
    const t16 = getDefaultOdontogram()['16'];
    const cav = { ...t16, surfaces: { ...t16.surfaces, O: { status: 'cavity' as const } } };
    const e = toothToEntry(cav);
    expect(e.faces).toEqual(['O']);
    expect(e.status).toBe('carie');
    const state = buildOdontogram([
      { id: '2', tooth: 16, faces: [], status: 'saudavel', surfaces: { O: 'healthy' }, notes: null, author_id: 'a', created_at: '2026-02-01' },
      { id: '1', tooth: 16, faces: ['O'], status: 'carie', surfaces: { O: 'cavity' }, notes: null, author_id: 'a', created_at: '2026-01-01' },
    ]);
    expect(state['16'].surfaces.O.status).toBe('healthy');
  });

  it('safety alerts combine self-declared and professional sources', () => {
    const self = parseSelfDeclared({ allergies: ['Penicilina'], medications: [{ name: 'Omeprazol' }], conditions: ['Diabetes'] });
    const m = mergeSafetySources(self, { allergies: ['penicilina', 'Látex'], medications: [{ name: 'Varfarina' }] });
    expect(m.allergies).toHaveLength(2);
    expect(m.medications.map((x) => x.name).sort()).toEqual(['Omeprazol', 'Varfarina']);
  });
});
