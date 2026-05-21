import { useNavigate } from 'react-router-dom';
import { useWatermarkSrc } from '@/hooks/useWatermarkSrc';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const logoSrc = '/assets/smilecheck-logo-horizontal.png';

const sections = [
  { id: 'responsavel', title: '1. Responsável pelo Tratamento', content: 'SmileCheck, Lda. — NIF: 509 123 456' },
  { id: 'dados-recolhidos', title: '2. Dados Recolhidos', content: `• Dados de identificação (nome, email, telefone, data nascimento)
• Dados profissionais (nº ordem, especialidades — dentistas)
• Dados de saúde (alergias, medicação, condições — pacientes)
• Dados de utilização (consultas, pontos, avaliações)
• Dados técnicos (IP, dispositivo, browser)` },
  { id: 'finalidade', title: '3. Finalidade do Tratamento', content: `• Gestão de conta e perfil
• Agendamento de consultas e teleconsultas
• Sistema de pontos e recompensas
• Comunicação entre utilizadores
• Melhoria dos serviços` },
  { id: 'base-legal', title: '4. Base Legal', content: `• Consentimento do utilizador
• Execução de contrato
• Interesse legítimo
• Obrigação legal` },
  { id: 'partilha', title: '5. Partilha de Dados', content: `• Dados de saúde: partilhados apenas com dentistas/clínicas do paciente
• Dados profissionais: visíveis conforme configuração de privacidade
• Propostas de trabalho: visíveis apenas entre dentistas e clínicas
• Nunca vendemos dados a terceiros` },
  { id: 'retencao', title: '6. Retenção de Dados', content: `• Dados de conta: enquanto a conta estiver ativa
• Dados clínicos: 10 anos (obrigação legal)
• Dados de utilização: 3 anos após última atividade` },
  { id: 'direitos', title: '7. Direitos do Utilizador (RGPD)', content: `• Direito de acesso
• Direito de retificação
• Direito de eliminação
• Direito de portabilidade
• Direito de oposição

Contacto DPO: dpo@smilecheck.pt` },
  { id: 'seguranca', title: '8. Segurança', content: `• Encriptação de dados em trânsito e em repouso
• Autenticação de dois fatores
• Verificação telefónica obrigatória
• Monitorização de acessos` },
  { id: 'cookies', title: '9. Cookies', content: `• Cookies essenciais (sessão, autenticação)
• Cookies de preferência (tema, idioma)
• Sem cookies de publicidade` },
  { id: 'alteracoes', title: '10. Alterações', content: 'Notificação por email em caso de alterações significativas.' },
];

export default function Privacidade() {
  const navigate = useNavigate();
  const watermarkSrc = useWatermarkSrc();

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Watermark */}
      <div
        className="fixed inset-0 pointer-events-none flex items-center justify-center z-0"
        style={{ opacity: 0.05 }}
      >
        <img src={watermarkSrc} alt="" className="w-[600px] h-[600px] object-contain" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="sticky top-0 bg-background/95 backdrop-blur border-b border-border z-20">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <img src={logoSrc} alt="SmileCheck" className="h-8 rounded-lg" />
            <div className="flex-1">
              <h1 className="text-lg font-bold text-foreground">Política de Privacidade</h1>
              <p className="text-xs text-muted-foreground">Última atualização: 1 de janeiro de 2026</p>
            </div>
          </div>
        </header>

        <ScrollArea className="h-[calc(100vh-73px)]">
          <div className="max-w-4xl mx-auto px-4 py-8 pb-32">
            {/* Table of Contents */}
            <nav className="mb-8 p-4 bg-card/80 rounded-xl border border-border">
              <h2 className="text-sm font-semibold text-foreground mb-3">Índice</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className="text-left text-sm text-primary hover:underline truncate"
                  >
                    {section.title}
                  </button>
                ))}
              </div>
            </nav>

            {/* Content */}
            <Accordion type="multiple" defaultValue={sections.map(s => s.id)} className="space-y-3">
              {sections.map((section) => (
                <AccordionItem
                  key={section.id}
                  value={section.id}
                  id={section.id}
                  className="bg-card/80 rounded-xl border border-border px-4"
                >
                  <AccordionTrigger className="text-left font-semibold text-foreground hover:no-underline py-4">
                    {section.title}
                  </AccordionTrigger>
                  <AccordionContent className="pb-4">
                    <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                      {section.content}
                    </p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            {/* Print button */}
            <div className="mt-8 text-center">
              <Button variant="outline" onClick={() => window.print()}>
                🖨️ Imprimir documento
              </Button>
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
