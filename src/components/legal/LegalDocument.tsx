import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Info, Printer } from 'lucide-react';
import { useWatermarkSrc } from '@/hooks/useWatermarkSrc';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { TELECONSULT_PRICE } from '@/lib/planRules';
import { ACCESSIBILITY_REVIEWED_AT, SUPPORT_EMAIL } from '@/lib/support';

const logoSrc = '/assets/smilecheck-logo-horizontal.webp';
const LAST_UPDATED = new Date(2026, 0, 1);

interface Section { id: string; title: string; content: string }

/** Terms / Privacy page. All text lives in i18n (legal.<doc>.sections) for PT, EN and FR. */
export function LegalDocument({ doc }: { doc: 'terms' | 'privacy' | 'accessibility' }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const watermarkSrc = useWatermarkSrc();
  const titleKey = doc === 'terms' ? 'legal.termsTitle' : doc === 'privacy' ? 'legal.privacyTitle' : 'legal.accessibilityTitle';
  const updated = doc === 'accessibility' ? ACCESSIBILITY_REVIEWED_AT : LAST_UPDATED;
  useDocumentTitle(titleKey);
  const sections = t(`legal.${doc}.sections`, { returnObjects: true, price: formatCurrency(TELECONSULT_PRICE), email: SUPPORT_EMAIL, date: formatDate(ACCESSIBILITY_REVIEWED_AT) }) as Section[];
  const list = Array.isArray(sections) ? sections : [];

  const scrollToSection = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-0" style={{ opacity: 0.05 }}>
        <img src={watermarkSrc} alt="" className="w-[600px] h-[600px] object-contain" />
      </div>
      <div className="relative z-10">
        <header className="sticky top-0 bg-background/95 backdrop-blur border-b border-border z-20">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} aria-label={t('legal.back')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <img src={logoSrc} alt="SmileCheck" className="h-8 rounded-lg" />
            <div className="flex-1">
              <h1 className="text-lg font-bold text-foreground">{t(titleKey)}</h1>
              <p className="text-xs text-muted-foreground">{t('legal.lastUpdated', { date: formatDate(updated) })}</p>
            </div>
          </div>
        </header>
        <ScrollArea className="h-[calc(100vh-73px)]">
          <div className="max-w-4xl mx-auto px-4 py-8 pb-32">
            <p role="note" className="mb-6 flex items-center gap-2 text-xs text-muted-foreground">
              <Info className="w-4 h-4 flex-shrink-0" aria-hidden />
              {t('legal.draftNotice')}
            </p>
            <nav className="mb-8 p-4 bg-card/80 rounded-xl border border-border">
              <h2 className="text-sm font-semibold text-foreground mb-3">{t('legal.toc')}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {list.map((section) => (
                  <button key={section.id} onClick={() => scrollToSection(section.id)} className="text-left text-sm text-primary hover:underline truncate">
                    {section.title}
                  </button>
                ))}
              </div>
            </nav>
            <Accordion type="multiple" defaultValue={list.map(s => s.id)} className="space-y-3">
              {list.map((section) => (
                <AccordionItem key={section.id} value={section.id} id={section.id} className="bg-card/80 rounded-xl border border-border px-4">
                  <AccordionTrigger className="text-left font-semibold text-foreground hover:no-underline py-4">{section.title}</AccordionTrigger>
                  <AccordionContent className="pb-4">
                    <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">{section.content}</p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            <div className="mt-8 text-center">
              <Button variant="outline" onClick={() => window.print()}>
                <Printer className="w-4 h-4 mr-2 inline" /> {t('legal.print')}
              </Button>
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
