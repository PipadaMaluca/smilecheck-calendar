import i18n from '@/i18n';
import { demoText } from '@/lib/demoText';

/**
 * `points_rules.label` / `points_ledger.reason` are stored in PT by the server.
 * The UI never prints them as-is: each known label maps to its `action_key`
 * and is shown through i18n `pointsRules.<action_key>`.
 */
const LABEL_TO_ACTION: Record<string, string> = {
  '10 anúncios vistos': 'anuncios_10',
  'Avaliação 1★': 'avaliacao_1',
  'Avaliação 2★': 'avaliacao_2',
  'Avaliação 3★': 'avaliacao_3',
  'Avaliação 4★': 'avaliacao_4',
  'Avaliação 5★': 'avaliacao_5',
  'Deixar avaliação': 'deixar_avaliacao',
  'Cancelamento tardio': 'cancelamento_tardio',
  'Cancelamento de consulta tardio': 'cancelamento_tardio_dentista',
  'Carta de referência': 'carta_referencia',
  'Check-in diário': 'checkin_diario',
  'Chegou a horas': 'chegou_a_horas',
  'Colaborou durante consulta': 'colaborou',
  'Compareceu': 'compareceu',
  'Confirmação 1h': 'confirmacao_1h',
  'Confirmação 24h': 'confirmacao_24h',
  'Consulta concluída': 'consulta_concluida',
  'Consulta na clínica': 'consulta_clinica',
  'Convidar amigo': 'convidar_amigo',
  'Convite de um convidado': 'convite_nivel2',
  'Emitir receita': 'emitir_receita',
  'Falta não justificada': 'falta',
  'Falta não justificada (base)': 'falta_base',
  'Higiene oral adequada': 'higiene_oral',
  'Responder mensagem em 24h': 'mensagem_24h',
  'Não responder mensagem 48h': 'mensagem_48h_sem_resposta',
  'Novo dentista ativo': 'novo_dentista_ativo',
  'Penalização por confirmação': 'penalizacao_confirmacao',
  'Reclamação não resolvida': 'reclamacao_nao_resolvida',
  'Seguiu recomendações': 'seguiu_recomendacoes',
  'Streak 30 dias': 'streak_30',
  'Streak 7 dias': 'streak_7',
  'Taxa confirmação >90% (semanal)': 'taxa_confirmacao_90',
  'Teleconsulta': 'teleconsulta',
};

const SUFFIX_KEYS: Record<string, string> = {
  '(Dentista)': 'pointsRules.suffixDentist',
  '(Clínica)': 'pointsRules.suffixClinic',
};

export function pointsActionKeyForLabel(label: string): string | undefined {
  return LABEL_TO_ACTION[label];
}

/** Localised label for a points rule / ledger reason (unknown text passes through demoText). */
export function pointsRuleLabel(label: string | null | undefined): string {
  if (!label) return label ?? '';
  const action = LABEL_TO_ACTION[label];
  if (action) return i18n.t(`pointsRules.${action}`);
  const ach = /^Conquista: (.+)$/.exec(label);
  if (ach) return i18n.t('pointsRules.achievement');
  const suffix = /^(.*) (\((?:Dentista|Clínica)\))$/.exec(label);
  if (suffix && LABEL_TO_ACTION[suffix[1]]) {
    return `${i18n.t(`pointsRules.${LABEL_TO_ACTION[suffix[1]]}`)} ${i18n.t(SUFFIX_KEYS[suffix[2]])}`;
  }
  return demoText(label);
}
