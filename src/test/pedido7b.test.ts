import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { TERMS_VERSION } from '@/lib/support';

describe('Pedido 7b — segurança', () => {
  it('server terms version matches the app terms version', () => {
    const sql = readFileSync('drizzle/migrations/0012_terms_enforcement_and_deletion_retry.sql', 'utf8');
    expect(sql).toContain(`SELECT '${TERMS_VERSION}'::text`);
  });

  it('professional rankings never contain other professionals', () => {
    const src = readFileSync('src/components/rankings/RankingsView.tsx', 'utf8');
    expect(src).not.toMatch(/leaderboard/i);
    expect(src).not.toContain('Ricardo Mendes');
  });
});
