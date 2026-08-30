import { UserRole } from '@/types/calendar';

export interface OnboardingSlide {
  emoji: string;
  title: string;
  description: string;
}

export interface TooltipStep {
  targetId: string;
  title: string;
  description: string;
}

export const TOOLTIP_STEPS: Record<UserRole, TooltipStep[]> = {
  patient: [
    { targetId: 'onboarding-consultas-hoje', title: 'Consultas de Hoje', description: 'Aqui vê as suas próximas consultas e o estado de cada uma.' },
    { targetId: 'onboarding-nav-agenda', title: 'Consultas', description: 'Aceda ao calendário completo das suas consultas.' },
    { targetId: 'onboarding-nav-saude', title: 'Saúde', description: 'Gerir alergias, medicação, vacinas e documentos médicos.' },
    { targetId: 'onboarding-nav-conquistas', title: 'Conquistas', description: 'Acompanhe o seu progresso e desbloqueie conquistas.' },
    { targetId: 'onboarding-nav-loja', title: 'Loja de Recompensas', description: 'Troque pontos por recompensas aqui.' },
    { targetId: 'onboarding-pontuacao-card', title: 'Pontos Disponíveis', description: 'Os seus pontos de recompensa. Clique para ir à Loja de Recompensas!' },
    { targetId: 'onboarding-nav-conversas', title: 'Conversas', description: 'Comunique diretamente com os seus dentistas.' },
  ],
  dentist: [
    { targetId: 'onboarding-consultas-hoje', title: 'Consultas de Hoje', description: 'Veja todas as consultas do dia com estados em tempo real.' },
    { targetId: 'onboarding-confirmacoes', title: 'Confirmações', description: 'Acompanhe quem confirmou a 24h e 1h.' },
    { targetId: 'onboarding-lista-espera', title: 'Lista de Espera', description: 'Pacientes que querem antecipar ou alterar consultas.' },
    { targetId: 'onboarding-historico', title: 'Histórico', description: 'Pontos atribuídos aos pacientes e feedback das consultas.' },
    { targetId: 'onboarding-nav-estatisticas', title: 'Estatísticas', description: 'Dados detalhados do seu desempenho.' },
    { targetId: 'onboarding-nav-conversas', title: 'Conversas', description: 'Mensagens dos seus pacientes.' },
    { targetId: 'onboarding-level-points', title: 'Nível e Pontos', description: 'O seu nível (XP) e pontos de recompensa disponíveis.' },
  ],
  clinic: [
    { targetId: 'onboarding-consultas-hoje', title: 'Consultas de Hoje', description: 'Resumo de consultas de toda a equipa.' },
    { targetId: 'onboarding-confirmacoes', title: 'Confirmações', description: 'Confirmações agrupadas por dentista.' },
    { targetId: 'onboarding-lista-espera', title: 'Lista de Espera', description: 'Pacientes prioritários de cada dentista.' },
    { targetId: 'onboarding-dentistas-hoje', title: 'Dentistas a Trabalhar Hoje', description: 'Visão rápida da equipa e volume de trabalho.' },
    { targetId: 'onboarding-nav-team', title: 'Equipa', description: 'Gerir dentistas, horários e disponibilidades.' },
    { targetId: 'onboarding-nav-estatisticas', title: 'Estatísticas', description: 'Relatórios completos da clínica.' },
    { targetId: 'onboarding-nav-configuracoes', title: 'Configurações', description: 'Personalizar a clínica, planos e preferências.' },
  ],
};
