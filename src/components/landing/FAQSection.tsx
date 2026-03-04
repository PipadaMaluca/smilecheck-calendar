import { useRef, useState, useEffect } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { cn } from '@/lib/utils';

const faqs = [
  {
    q: 'O SmileCheck é gratuito?',
    a: 'Sim! O plano Free é gratuito para sempre. Pode fazer upgrade para Pro ou Premium a qualquer momento para desbloquear funcionalidades adicionais.',
  },
  {
    q: 'Como funcionam os pontos?',
    a: 'Ganha pontos ao confirmar consultas, chegar a horas, manter boa higiene oral e muito mais. 100 pontos = €10 que pode trocar na Loja de Recompensas.',
  },
  {
    q: 'As teleconsultas são seguras?',
    a: 'Sim. As teleconsultas são realizadas através de videochamada encriptada diretamente na plataforma. Custa apenas €20 por consulta.',
  },
  {
    q: 'Posso usar o SmileCheck em vários dispositivos?',
    a: 'Sim! O SmileCheck funciona em qualquer dispositivo — computador, tablet ou telemóvel.',
  },
  {
    q: 'Como funciona o sistema de níveis?',
    a: 'Existem 7 níveis: Lata, Bronze, Prata, Ouro, Platina, Diamante e Adamantino. Quanto mais pontos acumular, mais alto o seu nível e maiores os benefícios.',
  },
  {
    q: 'O SmileCheck substitui o Doctolib?',
    a: 'Não. O SmileCheck complementa o Doctolib, adicionando gamificação, teleconsultas integradas, gestão de saúde oral e um sistema de recompensas único.',
  },
  {
    q: 'Os meus dados estão protegidos?',
    a: 'Sim. Cumprimos o RGPD e todos os dados são encriptados e armazenados de forma segura.',
  },
];

export function FAQSection() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section id="faq" className="py-20 px-4" ref={ref}>
      <div
        className={cn(
          'max-w-3xl mx-auto transition-all duration-700',
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        )}
      >
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">
          Perguntas Frequentes
        </h2>

        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger className="text-left text-foreground">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
