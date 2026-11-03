import { describe, it, expect } from 'vitest';
import { resolveTargetUrl, prepareNavigation, TYPE_TARGETS } from '@/lib/notificationTargets';
import { actionFromUrl } from '@/data/notificationsSource';
import { consumeDeepLink } from '@/lib/deepLink';

describe('notification destinations', () => {
  it('every type has a concrete destination', () => {
    for (const url of Object.values(TYPE_TARGETS)) expect(url).toMatch(/^\/app\?tab=[a-z_]+/);
  });

  it('generic "/app" falls back to the type destination', () => {
    expect(actionFromUrl('/app', 'achievement')).toBe('/app?tab=conquistas');
    expect(actionFromUrl(null, 'message')).toBe('/app?tab=conversas');
    expect(actionFromUrl('/app?tab=unknown', 'feedback_received')).toBe('/app?tab=pontuacoes&section=avaliacoes');
  });

  it('a specific appointment URL opens that appointment', () => {
    const url = resolveTargetUrl('novo_agendamento', '/app?tab=agenda&appointment=abc');
    expect(prepareNavigation(url)).toBe('consulta-detalhe:abc');
  });

  it('prescription notification opens Health › Prescriptions', () => {
    expect(prepareNavigation(TYPE_TARGETS.receita)).toBe('saude');
    expect(consumeDeepLink('saude')?.section).toBe('receitas');
  });
});
