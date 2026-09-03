import { useNavigate } from 'react-router-dom';
import { Printer } from 'lucide-react';
import { useWatermarkSrc } from '@/hooks/useWatermarkSrc';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const logoSrc = '/assets/smilecheck-logo-horizontal.png';

const sections = [
  { id: 'introducao', title: '1. Introdução', content: 'O SmileCheck é uma plataforma de gestão de saúde oral que conecta pacientes, dentistas e clínicas. Ao utilizar os nossos serviços, concorda com os presentes termos.' },
  { id: 'definicoes', title: '2. Definições', content: `• "Utilizador": qualquer pessoa registada na plataforma
• "Paciente": utilizador que procura serviços dentários
• "Dentista": profissional de saúde oral registado
• "Clínica": estabelecimento de saúde oral registado
• "Teleconsulta": consulta realizada por videochamada através da plataforma` },
  { id: 'registo', title: '3. Registo e Conta', content: `• Veracidade dos dados fornecidos
• Verificação telefónica obrigatória
• Responsabilidade pela segurança da conta
• Uma conta por pessoa/entidade` },
  { id: 'pontos', title: '4. Sistema de Pontos e Recompensas', content: `• XP (Experiência): pontos permanentes que definem o nível
• Pontos de Recompensa: podem ser trocados na Loja
• Plano Free: reset anual a 1 de janeiro
• Plano Pro/Premium: sem reset
• O SmileCheck reserva-se o direito de ajustar valores de pontos` },
  { id: 'avaliacoes', title: '5. Avaliações e Feedback', content: `• Limite de 40 avaliações por dia
• Avaliações devem ser honestas e baseadas em experiências reais
• Contestação disponível até 24h após visualização
• 3 contestações rejeitadas resultam em penalização de -5 pontos
• Avaliações editáveis até 24h após submissão` },
  { id: 'teleconsultas', title: '6. Teleconsultas', content: `• Custo: €20 por sessão
• Não substituem consultas presenciais de emergência
• Requerem conexão estável à internet
• Gravação não permitida sem consentimento` },
  { id: 'trabalho', title: '7. Propostas de Trabalho', content: `• Informações de emprego visíveis apenas entre dentistas e clínicas
• Pacientes nunca têm acesso a informações de recrutamento
• O SmileCheck não é responsável por acordos laborais` },
  { id: 'cancelamentos', title: '8. Cancelamentos e Faltas', content: `• Cancelamento com >24h antecedência: sem penalização
• Cancelamento com <24h: penalização de pontos
• Falta não justificada: penalização máxima
• Falta justificada: sem penalização` },
  { id: 'propriedade', title: '9. Propriedade Intelectual', content: `• Conteúdo da plataforma pertence ao SmileCheck
• Dados clínicos pertencem aos respetivos profissionais` },
  { id: 'responsabilidade', title: '10. Limitação de Responsabilidade', content: `• A plataforma facilita a ligação entre utilizadores
• Não substitui diagnóstico ou tratamento médico` },
  { id: 'modificacoes', title: '11. Modificações', content: 'O SmileCheck pode alterar estes termos com aviso prévio de 30 dias.' },
  { id: 'contacto', title: '12. Contacto', content: `Email: legal@smilecheck.pt
Morada: Av. da Liberdade 123, Lisboa, Portugal` },
];

export default function Termos() {
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
              <h1 className="text-lg font-bold text-foreground">Termos de Serviço</h1>
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
                <Printer className="w-4 h-4 mr-2 inline" /> Imprimir documento
              </Button>
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
