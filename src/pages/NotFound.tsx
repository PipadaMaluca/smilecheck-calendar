import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useTranslation } from "react-i18next";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Watermark */}
      <img
        src="/assets/smilecheck-icon-watermark.png"
        alt=""
        aria-hidden="true"
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] max-w-none opacity-[0.05] pointer-events-none z-0 object-contain"
      />

      <div className="relative z-10 text-center max-w-md mx-auto space-y-6">
        {/* Illustration */}
        <div className="flex items-center justify-center">
          <div className="relative">
            <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center">
              <Search className="w-16 h-16 text-primary/60" />
            </div>
            <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-5xl font-extrabold text-primary/80 font-['Russo_One']">
              404
            </span>
          </div>
        </div>

        <div className="pt-6 space-y-2">
          <h1 className="text-2xl font-bold text-foreground">{t('errors.404title')}</h1>
          <p className="text-sm text-muted-foreground">
            {t('errors.404subtitle')}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={() => navigate("/")} className="gap-2 min-h-[44px]">
            🏠 {t('errors.goHome')}
          </Button>
          <Button variant="outline" onClick={() => navigate(-1)} className="gap-2 min-h-[44px]">
            ← {t('errors.goBack')}
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          {t('errors.needHelp')}{" "}
          <button
            onClick={() => window.open("mailto:suporte@smilecheck.pt")}
            className="text-primary hover:underline"
          >
            {t('errors.contactUs')}
          </button>
        </p>
      </div>
    </div>
  );
};

export default NotFound;
