import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const logoSrc = '/assets/smilecheck-logo-horizontal.png';

export function LandingFooter() {
  const navigate = useNavigate();

  return (
    <>
      {/* CTA Banner */}
      <section className="py-20 px-4" id="contacto">
        <div className="max-w-4xl mx-auto text-center">
          <div className="rounded-2xl bg-primary/5 border border-primary/20 p-10 sm:p-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Pronto para cuidar do seu sorriso?
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Junte-se a milhares de pacientes, dentistas e clínicas
            </p>
            <Button
              size="lg"
              className="text-base px-10 h-12"
              onClick={() => navigate('/signup')}>
              
              Criar Conta Grátis
            </Button>
            <p className="text-sm text-muted-foreground mt-4">
              Sem compromisso. Grátis para sempre.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#121f30] bg-[#121f30]">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-8 py-12 lg:py-16">
          {/* Logo + description + social — centered */}
          <div className="flex flex-col items-center text-center mb-10">
            <img src={logoSrc} alt="SmileCheck" className="h-14 sm:h-16 md:h-20 mb-4 rounded-2xl" />
            <p className="text-sm text-[hsl(215,20%,65%)] mb-5">
              A app que recompensa a sua saúde oral
            </p>
            <div className="flex gap-5">
              {['Instagram', 'Facebook', 'LinkedIn', 'X'].map((s) =>
              <span
                key={s}
                className="text-xs text-[hsl(215,20%,65%)] hover:text-[hsl(210,40%,98%)] cursor-pointer transition-colors">
                  {s}
                </span>
              )}
            </div>
          </div>

          {/* 3 columns side by side */}
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto text-center">
            {/* Produto */}
            <div>
              <h4 className="font-semibold text-[hsl(210,40%,98%)] text-sm mb-4">
                Produto
              </h4>
              <ul className="space-y-2.5">
                {[
                'Funcionalidades',
                'Planos e Preços',
                'Teleconsultas',
                'Para Dentistas',
                'Para Clínicas'].
                map((l) =>
                <li key={l}>
                    <a
                    href="#"
                    className="text-sm text-[hsl(215,20%,65%)] hover:text-[hsl(210,40%,98%)] transition-colors">
                      {l}
                    </a>
                  </li>
                )}
              </ul>
            </div>

            {/* Suporte */}
            <div>
              <h4 className="font-semibold text-[hsl(210,40%,98%)] text-sm mb-4">
                Suporte
              </h4>
              <ul className="space-y-2.5">
                {['FAQ', 'Contacto', 'Centro de Ajuda'].map((l) =>
                <li key={l}>
                    <a
                    href="#"
                    className="text-sm text-[hsl(215,20%,65%)] hover:text-[hsl(210,40%,98%)] transition-colors">
                      {l}
                    </a>
                  </li>
                )}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-semibold text-[hsl(210,40%,98%)] text-sm mb-4">
                Legal
              </h4>
              <ul className="space-y-2.5">
                <li>
                  <a href="/termos" className="text-sm text-[hsl(215,20%,65%)] hover:text-[hsl(210,40%,98%)] transition-colors">
                    Termos de Serviço
                  </a>
                </li>
                <li>
                  <a href="/privacidade" className="text-sm text-[hsl(215,20%,65%)] hover:text-[hsl(210,40%,98%)] transition-colors">
                    Política de Privacidade
                  </a>
                </li>
                <li>
                  <a href="/privacidade#direitos" className="text-sm text-[hsl(215,20%,65%)] hover:text-[hsl(210,40%,98%)] transition-colors">
                    RGPD
                  </a>
                </li>
                <li>
                  <a href="/privacidade#cookies" className="text-sm text-[hsl(215,20%,65%)] hover:text-[hsl(210,40%,98%)] transition-colors">
                    Cookies
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-12 pt-6 border-t border-[hsl(214,30%,20%)] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[hsl(215,20%,65%)]">
            <span>© 2026 SmileCheck. Todos os direitos reservados.</span>
            <span>Feito com ❤️ em Portugal</span>
          </div>
        </div>
      </footer>
    </>);

}