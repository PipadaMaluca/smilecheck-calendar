import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { Logo } from "@/components/branding/Logo";

const ToothSearchSVG = () => (
  <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto">
    {/* Tooth */}
    <path
      d="M40 30C40 20 50 12 60 12C70 12 80 20 80 30C80 40 82 55 78 68C74 81 72 95 68 95C64 95 63 80 60 80C57 80 56 95 52 95C48 95 46 81 42 68C38 55 40 40 40 30Z"
      fill="hsl(var(--muted))"
      stroke="hsl(var(--muted-foreground))"
      strokeWidth="2"
      opacity="0.6"
    />
    {/* Question mark on tooth */}
    <text x="54" y="52" fontSize="24" fontWeight="bold" fill="hsl(var(--muted-foreground))" opacity="0.8">?</text>
    {/* Magnifying glass */}
    <circle cx="85" cy="80" r="16" stroke="hsl(var(--primary))" strokeWidth="3" fill="none" opacity="0.8" />
    <line x1="96" y1="92" x2="108" y2="104" stroke="hsl(var(--primary))" strokeWidth="3" strokeLinecap="round" opacity="0.8" />
  </svg>
);

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
        {/* Logo */}
        <div className="flex justify-center">
          <span className="block sm:hidden"><Logo variant="full" size={260} /></span>
          <span className="hidden sm:block lg:hidden"><Logo variant="full" size={280} /></span>
          <span className="hidden lg:block"><Logo variant="full" size={300} /></span>
        </div>

        {/* Illustration */}
        <ToothSearchSVG />

        {/* 404 number */}
        <p className="text-[64px] font-extrabold leading-none text-foreground/90 tracking-tight">
          404
        </p>

        <div className="space-y-2">
          <h1 className="text-lg font-bold text-foreground">{t('errors.404title')}</h1>
          <p className="text-sm text-muted-foreground">
            {t('errors.404subtitle')}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
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
