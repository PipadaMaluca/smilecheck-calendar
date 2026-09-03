export type NotificationType =
  'lembrete_24h' | 'lembrete_1h' | 'feedback' | 'receita' | 'referencia' |
  'consulta_alterada' | 'consulta_cancelada' | 'pontos' | 'mensagem' | 'referral_usado' |
  'novo_agendamento' | 'paciente_confirmou' | 'paciente_cancelou' | 'sala_espera' |
  'feedback_recebido' | 'conquista' | 'resumo_diario' | 'novo_dentista' | 'referenciou_paciente';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  time: string;
  read: boolean;
  actionLabel?: string;
  linkedScoreId?: string;
  action?: string;
}
