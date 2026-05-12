import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Instagram, Facebook, Linkedin, Twitter } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Logo } from '@/components/branding/Logo';

export function LandingFooter() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const socials = [
    { name: 'Instagram', Icon: Instagram, href: '#' },
    { name: 'Facebook', Icon: Facebook, href: '#' },
    { name: 'LinkedIn', Icon: Linkedin, href: '#' },
    { name: 'X', Icon: Twitter, href: '#' },
  ];

  return (
    <>
      {/* CTA Banner */}
      <section className="py-8 sm:py-10 md:py-12 px-6 md:px-10 bg-white dark:bg-background" id="contacto">
        <div className="max-w-4xl mx-auto text-center">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#2196F3] to-[#1565C0] p-8 sm:p-10 md:p-12 shadow-2xl shadow-[#2196F3]/20 sc-hue-shift">
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
            <h2 data-reveal="words" className="relative text-[28px] sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-4">{t('landing.ctaFinal.title')}</h2>
            <p data-reveal="up" className="relative text-white/85 text-base sm:text-lg font-light mb-6 sm:mb-8 max-w-[90%] sm:max-w-xl mx-auto">{t('landing.ctaFinal.subtitle')}</p>
            <Button size="lg" className="sc-pulse-cta relative rounded-full bg-white text-[#2196F3] hover:bg-white/95 hover:-translate-y-0.5 text-base font-semibold w-full sm:w-auto px-10 h-12 shadow-xl transition-all" onClick={() => navigate('/signup')}>
              {t('landing.ctaFinal.cta')}
            </Button>
            <p className="relative text-sm text-white/75 mt-4">{t('landing.ctaFinal.noCommitment')}</p>
          </div>
        </div>
      </section>

      {/* Footer — theme-aware: dark navy (dark mode) / light blue (light mode) */}
      <footer className="bg-[#0D2137] text-white border-t border-[#1E3A5F] dark:bg-[#0D2137] dark:text-white dark:border-[#1E3A5F] [.light_&]:bg-[#EBF4FF] [.light_&]:text-[#1A202C] [.light_&]:border-[#D6E4F0]">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-10 sm:py-12">

          {/* Top: Brand block */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="sc-footer-glow inline-flex"><Logo variant="horizontal" size={56} /></span>
            </div>
            <p className="text-base text-[#94A3B8] max-w-md mb-6 [.light_&]:text-[#4A5568]">{t('landing.footer.tagline')}</p>
            <div className="flex gap-3 items-center" data-reveal="stagger">
              {socials.map(({ name, Icon, href }) => (
                <a
                  key={name}
                  href={href}
                  aria-label={name}
                  className="w-10 h-10 rounded-full bg-[#1E3A5F] hover:bg-[#2196F3] text-white flex items-center justify-center transition-all hover:-translate-y-0.5 [.light_&]:bg-[#D6E8FF] [.light_&]:text-[#1565C0] [.light_&]:hover:bg-[#2196F3] [.light_&]:hover:text-white"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          <div className="border-t border-[#1E3A5F] mb-8 [.light_&]:border-[#D6E4F0]" />

          {/* Link columns */}
          <div data-reveal="stagger" className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10 max-w-3xl mx-auto text-center md:text-left">
            <div>
              <h4 className="font-semibold text-white text-sm mb-4 uppercase tracking-wide [.light_&]:text-[#1565C0]">{t('landing.footer.product')}</h4>
              <ul className="space-y-3">
                {[t('landing.footer.features'), t('landing.footer.plansAndPricing'), t('landing.footer.teleconsultations'), t('landing.footer.forDentists'), t('landing.footer.forClinics')].map((l) => (
                  <li key={l}><a href="#" className="text-sm text-[#94A3B8] hover:text-[#64B5F6] transition-colors [.light_&]:text-[#4A5568] [.light_&]:hover:text-[#1565C0]">{l}</a></li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white text-sm mb-4 uppercase tracking-wide [.light_&]:text-[#1565C0]">{t('landing.footer.support')}</h4>
              <ul className="space-y-3">
                {[t('landing.footer.faq'), t('landing.footer.contact'), t('landing.footer.helpCenter')].map((l) => (
                  <li key={l}><a href="#" className="text-sm text-[#94A3B8] hover:text-[#64B5F6] transition-colors [.light_&]:text-[#4A5568] [.light_&]:hover:text-[#1565C0]">{l}</a></li>
                ))}
              </ul>
            </div>

            <div className="md:col-span-1">
              <h4 className="font-semibold text-white text-sm mb-4 uppercase tracking-wide [.light_&]:text-[#1565C0]">{t('landing.footer.legal')}</h4>
              <ul className="space-y-3">
                <li><a href="/termos" className="text-sm text-[#94A3B8] hover:text-[#64B5F6] transition-colors [.light_&]:text-[#4A5568] [.light_&]:hover:text-[#1565C0]">{t('landing.footer.termsOfService')}</a></li>
                <li><a href="/privacidade" className="text-sm text-[#94A3B8] hover:text-[#64B5F6] transition-colors [.light_&]:text-[#4A5568] [.light_&]:hover:text-[#1565C0]">{t('landing.footer.privacyPolicy')}</a></li>
                <li><a href="/privacidade#direitos" className="text-sm text-[#94A3B8] hover:text-[#64B5F6] transition-colors [.light_&]:text-[#4A5568] [.light_&]:hover:text-[#1565C0]">{t('landing.footer.gdpr')}</a></li>
                <li><a href="/privacidade#cookies" className="text-sm text-[#94A3B8] hover:text-[#64B5F6] transition-colors [.light_&]:text-[#4A5568] [.light_&]:hover:text-[#1565C0]">{t('landing.footer.cookies')}</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-[#1E3A5F] mt-8 pt-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#94A3B8] [.light_&]:border-[#D6E4F0] [.light_&]:text-[#4A5568]">
            <span>© 2026 SmileCheck. {t('landing.footer.copyright')}.</span>
            <span>{t('landing.footer.madeWith')}</span>
          </div>
        </div>
      </footer>
    </>
  );
}
