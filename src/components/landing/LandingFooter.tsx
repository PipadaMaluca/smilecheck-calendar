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
              onClick={() => navigate('/signup')}
            >
              Criar Conta Grátis
            </Button>
            <p className="text-sm text-muted-foreground mt-4">
              Sem compromisso. Grátis para sempre.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[hsl(214,30%,20%)] bg-[hsl(222,47%,11%)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {/* Column 1 */}
            <div className="col-span-2 md:col-span-1">
              <img src={logoSrc} alt="SmileCheck" className="h-10 mb-3" />
              <p className="text-sm text-[hsl(215,20%,65%)] mb-4">
                A app que recompensa a sua saúde oral
              </p>
              <div className="flex gap-3">
                {['Instagram', 'Facebook', 'LinkedIn', 'X'].map((s) => (
                  <span
                    key={s}
                    className="text-xs text-[hsl(215,20%,65%)] hover:text-[hsl(210,40%,98%)] cursor-pointer transition-colors"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Column 2 */}
            <div>
              <h4 className="font-semibold text-[hsl(210,40%,98%)] text-sm mb-3">
                Produto
              </h4>
              <ul className="space-y-2">
                {[
                  'Funcionalidades',
                  'Planos e Preços',
                  'Teleconsultas',
                  'Para Dentistas',
                  'Para Clínicas',
                ].map((l) => (
                  <li key={l}>
                    <a
                      href="#"
                      className="text-sm text-[hsl(215,20%,65%)] hover:text-[hsl(210,40%,98%)] transition-colors"
                    >
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3 */}
            <div>
              <h4 className="font-semibold text-[hsl(210,40%,98%)] text-sm mb-3">
                Suporte
              </h4>
              <ul className="space-y-2">
                {['FAQ', 'Contacto', 'Centro de Ajuda'].map((l) => (
                  <li key={l}>
                    <a
                      href="#"
                      className="text-sm text-[hsl(215,20%,65%)] hover:text-[hsl(210,40%,98%)] transition-colors"
                    >
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 4 */}
            <div>
              <h4 className="font-semibold text-[hsl(210,40%,98%)] text-sm mb-3">
                Legal
              </h4>
              <ul className="space-y-2">
                {[
                  'Termos de Serviço',
                  'Política de Privacidade',
                  'RGPD',
                  'Cookies',
                ].map((l) => (
                  <li key={l}>
                    <a
                      href="#"
                      className="text-sm text-[hsl(215,20%,65%)] hover:text-[hsl(210,40%,98%)] transition-colors"
                    >
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-10 pt-6 border-t border-[hsl(214,30%,20%)] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[hsl(215,20%,65%)]">
            <span>© 2026 SmileCheck. Todos os direitos reservados.</span>
            <span>Feito com ❤️ em Portugal</span>
          </div>
        </div>
      </footer>
    </>
  );
}
