import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const TAB_KEYS: Record<string, string> = {
  home: 'nav.home', agenda: 'nav.agenda', team: 'nav.team', estatisticas: 'nav.statistics',
  conquistas: 'nav.achievements', pontuacoes: 'nav.scores', loja: 'nav.rewardsStore',
  faturacao: 'nav.billing', pesquisa: 'nav.search', conversas: 'nav.conversations',
  convidar: 'nav.invite', settings: 'nav.settings', configuracoes: 'nav.settings',
};

/** Keeps document.title in sync with the current screen and the active language: "Agenda · SmileCheck". */
export function useDocumentTitle(screen?: string | null) {
  const { t, i18n } = useTranslation();
  useEffect(() => {
    if (!screen) { document.title = t('meta.defaultTitle'); return; }
    const key = TAB_KEYS[screen] ?? screen;
    const label = t(key, { defaultValue: '' });
    document.title = label ? `${label} · SmileCheck` : t('meta.defaultTitle');
  }, [screen, t, i18n.language]);
}
