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

export const ONBOARDING_SLIDES: Record<UserRole, OnboardingSlide[]> = {
  patient: [
    { emoji: '🎉', title: 'Bem-vindo ao SmileCheck!', description: 'A sua saúde oral numa só app. Gerir consultas, acumular pontos e cuidar do seu sorriso nunca foi tão fácil.' },
    { emoji: '📅', title: 'As suas consultas', description: 'Marque, confirme e acompanhe todas as suas consultas presenciais e teleconsultas num só lugar.' },
    { emoji: '⭐', title: 'Ganhe pontos', description: 'Confirme consultas, chegue a horas e cuide da sua higiene oral para acumular pontos. 100 pontos = €10 em recompensas!' },
    { emoji: '❤️', title: 'A sua saúde oral', description: 'Mantenha o seu perfil de saúde atualizado: alergias, medicação, vacinas e documentos médicos sempre acessíveis.' },
    { emoji: '📱', title: 'Teleconsultas', description: 'Consulte o seu dentista por videochamada sem sair de casa. Rápido, seguro e a apenas €20.' },
    { emoji: '🏆', title: 'Desbloqueie conquistas', description: 'Complete desafios, suba de nível e desbloqueie conquistas secretas. 35 conquistas à sua espera!' },
    { emoji: '🎁', title: 'Loja de recompensas', description: 'Troque os seus pontos por descontos em consultas, produtos de higiene oral e muito mais.' },
    { emoji: '🚀', title: 'Tudo pronto!', description: 'O seu sorriso agradece. Vamos começar?' },
  ],
  dentist: [
    { emoji: '🎉', title: 'Bem-vindo ao SmileCheck Pro!', description: 'A plataforma que simplifica a sua prática clínica. Agenda, pacientes e teleconsultas num só lugar.' },
    { emoji: '📅', title: 'A sua agenda inteligente', description: 'Visualize o dia, semana ou mês. Arraste consultas, filtre por clínica e nunca perca um compromisso.' },
    { emoji: '✅', title: 'Confirmações automáticas', description: 'Acompanhe as confirmações dos pacientes a 24h e 1h em tempo real. Menos faltas, mais eficiência.' },
    { emoji: '👤', title: 'Gestão de pacientes', description: 'Aceda ao dossier completo: saúde, alergias, histórico, receitas e cartas de referência.' },
    { emoji: '📱', title: 'Teleconsultas integradas', description: 'Realize consultas por videochamada diretamente na plataforma. Prescreva receitas e envie cartas de referência.' },
    { emoji: '📊', title: 'Estatísticas detalhadas', description: 'Acompanhe o seu desempenho: confirmações, lista de espera e evolução dos seus resultados.' },
    { emoji: '🏆', title: 'Pontos e conquistas', description: 'Acumule pontos, suba nos rankings e desbloqueie 35 conquistas profissionais.' },
    { emoji: '🚀', title: 'Vamos começar!', description: 'A sua prática clínica acaba de ser simplificada.' },
  ],
  clinic: [
    { emoji: '🎉', title: 'Bem-vindo ao SmileCheck Clínica!', description: 'Gerir a sua clínica nunca foi tão simples. Equipa, operações e estatísticas centralizadas.' },
    { emoji: '📋', title: 'Visão geral da clínica', description: 'Acompanhe consultas de hoje, confirmações e lista de espera de toda a equipa num só ecrã.' },
    { emoji: '👥', title: 'Gestão de equipa', description: 'Visualize a agenda de cada dentista, acompanhe desempenho e gerir disponibilidades.' },
    { emoji: '✅', title: 'Confirmações por dentista', description: 'Monitorize as confirmações de cada profissional. Identifique padrões e reduza faltas.' },
    { emoji: '📊', title: 'Estatísticas da clínica', description: 'Dados detalhados de volume, confirmações e lista de espera. Exporte relatórios em PDF ou Excel.' },
    { emoji: '📱', title: 'Teleconsultas da equipa', description: 'Acompanhe as teleconsultas realizadas por cada dentista da sua equipa.' },
    { emoji: '🏆', title: 'Rankings e conquistas', description: 'Suba no ranking nacional, desbloqueie conquistas de clínica e destaque-se no SmileCheck.' },
    { emoji: '🚀', title: 'A sua clínica está pronta!', description: 'Simplifique operações e foque-se no que importa: o sorriso dos seus pacientes.' },
  ],
};

export const TOOLTIP_STEPS: Record<UserRole, TooltipStep[]> = {
  patient: [
    { targetId: 'onboarding-consultas-hoje', title: 'Consultas de Hoje', description: 'Aqui vê as suas próximas consultas e o estado de cada uma.' },
    { targetId: 'onboarding-nav-agenda', title: 'Consultas', description: 'Aceda ao calendário completo das suas consultas.' },
    { targetId: 'onboarding-nav-saude', title: 'Saúde', description: 'Gerir alergias, medicação, vacinas e documentos médicos.' },
    { targetId: 'onboarding-nav-conquistas', title: 'Conquistas', description: 'Acompanhe o seu progresso e desbloqueie conquistas.' },
    { targetId: 'onboarding-nav-loja', title: 'Loja de Recompensas', description: 'Troque pontos por recompensas aqui.' },
    { targetId: 'onboarding-pontuacao-card', title: 'Pontos', description: 'Os seus pontos acumulados. Clique para ir à Loja de Recompensas. 100 pontos = €10!' },
    { targetId: 'onboarding-nav-conversas', title: 'Conversas', description: 'Comunique diretamente com os seus dentistas.' },
  ],
  dentist: [
    { targetId: 'onboarding-consultas-hoje', title: 'Consultas de Hoje', description: 'Veja todas as consultas do dia com estados em tempo real.' },
    { targetId: 'onboarding-confirmacoes', title: 'Confirmações', description: 'Acompanhe quem confirmou a 24h e 1h.' },
    { targetId: 'onboarding-lista-espera', title: 'Lista de Espera', description: 'Pacientes que querem antecipar ou alterar consultas.' },
    { targetId: 'onboarding-historico', title: 'Histórico', description: 'Pontos atribuídos aos pacientes e feedback das consultas.' },
    { targetId: 'onboarding-nav-estatisticas', title: 'Estatísticas', description: 'Dados detalhados do seu desempenho.' },
    { targetId: 'onboarding-nav-conversas', title: 'Conversas', description: 'Mensagens dos seus pacientes.' },
    { targetId: 'onboarding-level-points', title: 'Nível e Pontos', description: 'O seu nível e pontos profissionais.' },
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
