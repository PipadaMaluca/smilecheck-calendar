import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from '@/components/landing/LanguageSwitcher';
import { useTranslation } from 'react-i18next';

const logoSrc = '/assets/smilecheck-logo-horizontal.png';

export function LandingFooter() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <>
      {/* CTA Banner */}
      <section className="py-24 sm:py-32 px-4 bg-white dark:bg-background" id="contacto">
        <div className="max-w-4xl mx-auto text-center">
          <div className="rounded-3xl bg-gradient-to-br from-[#2196F3] to-[#1565C0] p-12 sm:p-20 shadow-2xl shadow-[#2196F3]/20">
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-5">{t('landing.ctaFinal.title')}</h2>
            <p className="text-white/85 text-lg sm:text-xl font-light mb-10 max-w-xl mx-auto">{t('landing.ctaFinal.subtitle')}</p>
            <Button size="lg" className="rounded-full bg-white text-[#2196F3] hover:bg-white/95 hover:-translate-y-0.5 text-base font-semibold px-10 h-12 shadow-xl transition-all" onClick={() => navigate('/signup')}>
              {t('landing.ctaFinal.cta')}
            </Button>
            <p className="text-sm text-white/75 mt-5">{t('landing.ctaFinal.noCommitment')}</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#121f30] bg-[#121f30]">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-8 py-12 lg:py-16">
          <div className="flex flex-col items-center text-center mb-10">
            <img src={logoSrc} alt="SmileCheck" className="h-14 sm:h-16 md:h-20 mb-4 rounded-2xl" />
            <p className="text-sm text-[hsl(215,20%,65%)] mb-5">{t('landing.footer.tagline')}</p>
            <div className="flex gap-5 items-center">
              {['Instagram', 'Facebook', 'LinkedIn', 'X'].map((s) => (
                <span key={s} className="text-xs text-[hsl(215,20%,65%)] hover:text-[hsl(210,40%,98%)] cursor-pointer transition-colors">{s}</span>
              ))}
            </div>
            <LanguageSwitcher className="mt-4" size="md" />
          </div>

          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto text-center">
            <div>
              <h4 className="font-semibold text-[hsl(210,40%,98%)] text-sm mb-4">{t('landing.footer.product')}</h4>
              <ul className="space-y-2.5">
                {[t('landing.footer.features'), t('landing.footer.plansAndPricing'), t('landing.footer.teleconsultations'), t('landing.footer.forDentists'), t('landing.footer.forClinics')].map((l) => (
                  <li key={l}><a href="#" className="text-sm text-[hsl(215,20%,65%)] hover:text-[hsl(210,40%,98%)] transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-[hsl(210,40%,98%)] text-sm mb-4">{t('landing.footer.support')}</h4>
              <ul className="space-y-2.5">
                {[t('landing.footer.faq'), t('landing.footer.contact'), t('landing.footer.helpCenter')].map((l) => (
                  <li key={l}><a href="#" className="text-sm text-[hsl(215,20%,65%)] hover:text-[hsl(210,40%,98%)] transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-[hsl(210,40%,98%)] text-sm mb-4">{t('landing.footer.legal')}</h4>
              <ul className="space-y-2.5">
                <li><a href="/termos" className="text-sm text-[hsl(215,20%,65%)] hover:text-[hsl(210,40%,98%)] transition-colors">{t('landing.footer.termsOfService')}</a></li>
                <li><a href="/privacidade" className="text-sm text-[hsl(215,20%,65%)] hover:text-[hsl(210,40%,98%)] transition-colors">{t('landing.footer.privacyPolicy')}</a></li>
                <li><a href="/privacidade#direitos" className="text-sm text-[hsl(215,20%,65%)] hover:text-[hsl(210,40%,98%)] transition-colors">{t('landing.footer.gdpr')}</a></li>
                <li><a href="/privacidade#cookies" className="text-sm text-[hsl(215,20%,65%)] hover:text-[hsl(210,40%,98%)] transition-colors">{t('landing.footer.cookies')}</a></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-6 border-t border-[hsl(214,30%,20%)] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[hsl(215,20%,65%)]">
            <span>© 2026 SmileCheck. {t('landing.footer.copyright')}.</span>
            <span>{t('landing.footer.madeWith')}</span>
          </div>
        </div>
      </footer>
    </>
  );
}