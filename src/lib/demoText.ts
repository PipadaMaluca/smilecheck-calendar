import i18n from '@/i18n';
import pt from '@/i18n/locales/pt.json';

/**
 * Demo/mock free-text (consultation notes, triage answers, waiting-list
 * observations) is authored in PT. The PT copy lives in `demoText.*` of every
 * locale; this maps a PT source string to its key and returns the active
 * language's version. Unknown strings (real user input) pass through unchanged.
 */
const PT_TO_KEY: Record<string, string> = Object.fromEntries(
  Object.entries((pt as { demoText: Record<string, string> }).demoText).map(([k, v]) => [v, k]),
);

export function demoText(value: string | undefined | null): string {
  if (!value) return value ?? '';
  const key = PT_TO_KEY[value];
  return key ? i18n.t(`demoText.${key}`) : value;
}

type Localizable = Record<string, unknown>;
const ORIGINALS = new WeakMap<Localizable, Record<string, string>>();
const REGISTERED: Array<{ items: Localizable[]; fields: string[] }> = [];

function apply(items: Localizable[], fields: string[]) {
  for (const item of items) {
    let orig = ORIGINALS.get(item);
    if (!orig) {
      orig = {};
      for (const f of fields) {
        const parts = f.split('.');
        const v = parts.reduce<unknown>((o, p) => (o as Localizable | undefined)?.[p], item);
        if (typeof v === 'string') orig[f] = v;
      }
      ORIGINALS.set(item, orig);
    }
    for (const [f, v] of Object.entries(orig)) {
      const parts = f.split('.');
      const last = parts.pop()!;
      const target = parts.reduce<unknown>((o, p) => (o as Localizable | undefined)?.[p], item) as Localizable | undefined;
      if (target) target[last] = demoText(v);
    }
  }
}

/** Keeps the given mock objects' text fields in the active language (re-applied on language change). */
export function localizeDemoObjects<T extends object>(items: T[], fields: string[]): T[] {
  const list = items as unknown as Localizable[];
  REGISTERED.push({ items: list, fields });
  apply(list, fields);
  return items;
}

i18n.on('languageChanged', () => REGISTERED.forEach(({ items, fields }) => apply(items, fields)));
