import { COMPLAINTS_BOOK_URL } from '@/lib/support';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Instagram, Facebook, Linkedin, Heart } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Logo } from '@/components/branding/Logo';
import { SHOW_SOCIAL_LINKS, SOCIAL_LINKS } from '@/lib/landingFlags';
import { scrollToLandingSection, selectPricingTab, type PricingTab } from '@/lib/landingNav';

export function LandingFooter() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  // Only render accounts whose URL the owner has filled in (see landingFlags).
  const socials = (SHOW_SOCIAL_LINKS
    ? [
        { key: 'instagram' as const, name: 'Instagram', Icon: Instagram },
        { key: 'facebook' as const, name: 'Facebook', Icon: Facebook },
        { key: 'linkedin' as const, name: 'LinkedIn', Icon: Linkedin },
        { key: 'x' as const, name: 'X', Icon: null },
      ]
    : []
  )
    .map((s) => ({ ...s, href: SOCIAL_LINKS[s.key].trim() }))
    .filter((s) => s.href !== '');

  type InPageLink = { label: string; section: string; title: string; tab?: PricingTab };
  const productLinks: InPageLink[] = [
    { label: t('landing.footer.home'), section: 'inicio', title: 'inicio' },
    { label: t('landing.footer.features'), section: 'funcionalidades', title: 'funcionalidades-title' },
    { label: t('landing.footer.plansAndPricing'), section: 'planos', title: 'planos-title' },
    { label: t('landing.footer.teleconsultations'), section: 'teleconsultas', title: 'teleconsultas-title' },
    { label: t('landing.footer.forDentists'), section: 'planos', title: 'planos-title', tab: 'dentist' },
    { label: t('landing.footer.forClinics'), section: 'planos', title: 'planos-title', tab: 'clinic' },
  ];
  const supportLinks: InPageLink[] = [
    { label: t('landing.footer.faq'), section: 'faq', title: 'faq-title' },
    { label: t('landing.footer.contact'), section: 'contacto', title: 'contacto-title' },
    { label: t('landing.footer.helpCenter'), section: 'faq', title: 'faq-title' },
  ];
  const linkCls = 'text-sm text-muted-foreground hover:text-primary transition-colors [.light_&]:text-muted-foreground [.light_&]:hover:text-primary';
  const renderInPage = (l: InPageLink) => (
    <li key={l.label}>
      <a
        href={`#${l.section}`}
        className={linkCls}
        onClick={(e) => {
          e.preventDefault();
          if (l.section === 'inicio') { window.scrollTo({ top: 0, behavior: 'smooth' }); history.replaceState(null, '', '/'); return; }
          if (l.tab) selectPricingTab(l.tab);
          requestAnimationFrame(() => scrollToLandingSection(l.section, l.title));
        }}
      >{l.label}</a>
    </li>
  );

  return (
    <>
      {/* CTA Banner */}
      <section className="py-8 sm:py-10 md:py-12 px-6 md:px-10 bg-background" id="contacto">
        <div className="max-w-4xl mx-auto text-center">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-primary/80 p-8 sm:p-10 md:p-12 shadow-2xl shadow-primary/20">
            <div className="sc-particles" aria-hidden="true">
              {Array.from({ length: 14 }).map((_, i) => (
                <span
                  key={i}
                  style={{
                    left: `${(i * 7 + 5) % 100}%`,
                    animationDuration: `${6 + (i % 5)}s`,
                    animationDelay: `${(i % 7) * 0.6}s`,
                    opacity: 0.4,
                  }}
                />
              ))}
            </div>
            <h2 id="contacto-title" key={i18n.language} data-reveal="words" className="relative text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-4">{t('landing.ctaFinal.title')}</h2>
            <p data-reveal="up" className="relative text-white/85 text-base sm:text-lg font-light mb-6 sm:mb-8 max-w-[90%] sm:max-w-xl mx-auto">{t('landing.ctaFinal.subtitle')}</p>
            <Button size="lg" className="sc-pulse-cta relative rounded-full bg-white text-primary hover:bg-white/95 hover:-translate-y-0.5 text-base font-semibold w-full sm:w-auto px-10 h-12 shadow-xl transition-[transform,background-color,border-color,color,box-shadow]" onClick={() => navigate('/signup')}>
              {t('landing.ctaFinal.cta')}
            </Button>
            <p className="relative text-sm text-white/75 mt-4">{t('landing.ctaFinal.noCommitment')}</p>
          </div>
        </div>
      </section>

      {/* Footer — theme-aware: dark navy (dark mode) / light blue (light mode) */}
      <footer className="text-white border-t border-border [.light_&]:text-foreground [.light_&]:border-border bg-background">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-10 sm:py-12">

          {/* Top: Brand block */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="sc-footer-glow inline-flex"><Logo variant="horizontal" size={220} lazy /></span>
            </div>
            <p className="text-base text-muted-foreground max-w-md [.light_&]:text-muted-foreground">{t('landing.footer.tagline')}</p>
            {socials.length > 0 && (
            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
              {socials.map(({ name, Icon, href }) => (
                <a
                  key={name}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={name}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: '#2196F3',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'background 0.2s ease',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#1565C0'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = '#2196F3'; }}
                >
                  {Icon ? <Icon size={20} color="#FFFFFF" /> : <span style={{ color: '#FFFFFF', fontSize: '16px', fontWeight: 'bold' }}>𝕏</span>}
                </a>
              ))}
            </div>
          </div>

          <div className="border-t border-border mb-8 [.light_&]:border-border" />

          {/* Link columns */}
          <div data-reveal="stagger" className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10 max-w-3xl mx-auto text-center md:text-left">
            <div>
              <h4 className="font-semibold text-white text-sm mb-4 uppercase tracking-wide [.light_&]:text-primary">{t('landing.footer.product')}</h4>
              <ul className="space-y-3">
                {productLinks.map(renderInPage)}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white text-sm mb-4 uppercase tracking-wide [.light_&]:text-primary">{t('landing.footer.support')}</h4>
              <ul className="space-y-3">
                {supportLinks.map(renderInPage)}
              </ul>
            </div>

            <div className="md:col-span-1">
              <h4 className="font-semibold text-white text-sm mb-4 uppercase tracking-wide [.light_&]:text-primary">{t('landing.footer.legal')}</h4>
              <ul className="space-y-3">
                <li><a href="/termos" className="text-sm text-muted-foreground hover:text-primary transition-colors [.light_&]:text-muted-foreground [.light_&]:hover:text-primary">{t('landing.footer.termsOfService')}</a></li>
                <li><a href="/privacidade" className="text-sm text-muted-foreground hover:text-primary transition-colors [.light_&]:text-muted-foreground [.light_&]:hover:text-primary">{t('landing.footer.privacyPolicy')}</a></li>
                <li><a href="/privacidade#direitos" className="text-sm text-muted-foreground hover:text-primary transition-colors [.light_&]:text-muted-foreground [.light_&]:hover:text-primary">{t('landing.footer.gdpr')}</a></li>
                <li><a href="/privacidade#cookies" className="text-sm text-muted-foreground hover:text-primary transition-colors [.light_&]:text-muted-foreground [.light_&]:hover:text-primary">{t('landing.footer.cookies')}</a></li>
                <li><a href="/acessibilidade" className="text-sm text-muted-foreground hover:text-primary transition-colors [.light_&]:text-muted-foreground [.light_&]:hover:text-primary">{t('landing.footer.accessibility')}</a></li>
                <li><a href="/termos-profissionais" className="text-sm text-muted-foreground hover:text-primary transition-colors [.light_&]:text-muted-foreground [.light_&]:hover:text-primary">{t('legal.proTermsTitle')}</a></li>
                <li><a href="/app?tab=plano" className="text-sm text-muted-foreground hover:text-primary transition-colors [.light_&]:text-muted-foreground [.light_&]:hover:text-primary">{t('landing.footer.manageSubscription')}</a></li>
                <li><a href="/termos#litigios" className="text-sm text-muted-foreground hover:text-primary transition-colors [.light_&]:text-muted-foreground [.light_&]:hover:text-primary">{t('landing.footer.disputes')}</a></li>
                <li><a href={COMPLAINTS_BOOK_URL} target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-primary transition-colors [.light_&]:text-muted-foreground [.light_&]:hover:text-primary">{t('landing.footer.complaintsBook')}</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border mt-8 pt-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground [.light_&]:border-border [.light_&]:text-muted-foreground">
            <span>© 2026 SmileCheck. {t('landing.footer.copyright')}.</span>
            <span className="inline-flex items-center gap-1"><Heart className="w-3.5 h-3.5 text-red-400 fill-red-400" />{t('landing.footer.madeWith')}</span>
          </div>
        </div>
      </footer>
    </>
  );
}
