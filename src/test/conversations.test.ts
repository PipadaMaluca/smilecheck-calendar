import { describe, it, expect, vi } from 'vitest';
vi.mock('@/integrations/supabase/client', () => ({ supabase: {} }));
import { canVoid, VOID_WINDOW_MS } from '@/data/conversationsSource';
import { fitWithin, AVATAR_MAX_PX, AVATAR_MAX_BYTES } from '@/lib/avatarImage';
import { savePendingTriage, takePendingTriage } from '@/lib/pendingTriage';
import { initialTriageData } from '@/types/triage';

describe('Conversations, avatars, triage hand-off', () => {
  const now = Date.parse('2026-11-05T10:00:00Z');
  it('author may withdraw a message only within 5 minutes', () => {
    expect(VOID_WINDOW_MS).toBe(5 * 60 * 1000);
    expect(canVoid({ sender_id: 'me', created_at: '2026-11-05T09:56:00Z', voided_at: null }, 'me', now)).toBe(true);
    expect(canVoid({ sender_id: 'me', created_at: '2026-11-05T09:54:59Z', voided_at: null }, 'me', now)).toBe(false);
    expect(canVoid({ sender_id: 'other', created_at: '2026-11-05T09:59:00Z', voided_at: null }, 'me', now)).toBe(false);
  });
  it('avatars are resized to at most 512 px and 2 MB', () => {
    expect(AVATAR_MAX_PX).toBe(512);
    expect(AVATAR_MAX_BYTES).toBe(2 * 1024 * 1024);
    expect(fitWithin(2000, 1000)).toEqual({ width: 512, height: 256 });
    expect(fitWithin(300, 200)).toEqual({ width: 300, height: 200 });
  });
  it('triage answers are handed to the next booking once, without photos', () => {
    savePendingTriage({ ...initialTriageData, symptoms: ['dor_dente'], photos: [new File(['x'], 'a.jpg')] }, now);
    const a = takePendingTriage(now + 1000);
    expect(a?.symptoms).toEqual(['dor_dente']);
    expect(a?.photos).toBe(1);
    expect(takePendingTriage(now + 2000)).toBeNull();
  });
  it('stale triage answers (over 2 h) are not attached', () => {
    savePendingTriage({ ...initialTriageData, symptoms: ['x'] }, now);
    expect(takePendingTriage(now + 2 * 60 * 60 * 1000 + 1)).toBeNull();
  });
});
