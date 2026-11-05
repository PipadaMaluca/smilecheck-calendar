import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import pt from '@/i18n/locales/pt.json';
import fr from '@/i18n/locales/fr.json';
import en from '@/i18n/locales/en.json';

vi.mock('@/hooks/use-mobile', () => ({ useIsMobile: () => false }));
import { UnderConstructionHost, openUnderConstruction } from '@/components/ui/under-construction';
import { SoonButton } from '@/components/ui/soon-button';

beforeAll(async () => {
  await i18n.use(initReactI18next).init({
    lng: 'pt', fallbackLng: false, resources: { pt: { translation: pt }, fr: { translation: fr }, en: { translation: en } },
  });
});

const EXPECTED = {
  pt: { title: 'Área em fase de construção', body: 'Estamos a preparar isto para si. Volte em breve!' },
  fr: { title: 'Espace en construction', body: 'Nous préparons cela pour vous. Revenez bientôt !' },
  en: { title: 'Under construction', body: "We're getting this ready for you. Check back soon!" },
} as const;

describe('under-construction pop-up', () => {
  for (const lng of ['pt', 'fr', 'en'] as const) {
    it(`shows the title, text and OK in ${lng}`, async () => {
      await i18n.changeLanguage(lng);
      render(<UnderConstructionHost />);
      act(() => openUnderConstruction());
      expect(await screen.findByText(EXPECTED[lng].title)).toBeTruthy();
      expect(screen.getByText(EXPECTED[lng].body)).toBeTruthy();
      fireEvent.click(screen.getByRole('button', { name: 'OK' }));
      expect(screen.queryByText(EXPECTED[lng].title)).toBeNull();
    });
  }

  it('an unbuilt-feature button is enabled and opens the pop-up', async () => {
    await i18n.changeLanguage('pt');
    render(<><UnderConstructionHost /><SoonButton>Apple</SoonButton></>);
    const btn = screen.getByRole('button', { name: 'Apple' });
    expect(btn).not.toBeDisabled();
    fireEvent.click(btn);
    expect(await screen.findByText(EXPECTED.pt.title)).toBeTruthy();
  });
});

function strings(obj: unknown, path = ''): [string, string][] {
  if (typeof obj === 'string') return [[path, obj]];
  if (Array.isArray(obj)) return obj.flatMap((v, i) => strings(v, `${path}[${i}]`));
  if (obj && typeof obj === 'object') return Object.entries(obj).flatMap(([k, v]) => strings(v, path ? `${path}.${k}` : k));
  return [];
}
const SOON = /em breve|bientôt|coming soon/i;

describe('no "coming soon" labels anywhere', () => {
  it('translation files only use it inside the pop-up text', () => {
    for (const loc of [pt, fr, en]) {
      const hits = strings(loc).filter(([k, v]) => SOON.test(v) && k !== 'underConstruction.body');
      expect(hits).toEqual([]);
    }
  });

  it('components never hardcode it', () => {
    const walk = (dir: string): string[] => readdirSync(dir).flatMap((f) => {
      const p = join(dir, f);
      return statSync(p).isDirectory() ? walk(p) : /\.tsx?$/.test(f) ? [p] : [];
    });
    const files = walk(join(process.cwd(), 'src')).filter((f) => !f.includes(`${join('src', 'test')}`));
    const hits = files.filter((f) => /['"`>]\s*(Em breve|Bientôt|Coming soon)/i.test(readFileSync(f, 'utf8')) || /common\.comingSoon|plans\.soon|common\.soon/.test(readFileSync(f, 'utf8')));
    expect(hits).toEqual([]);
  });
});
