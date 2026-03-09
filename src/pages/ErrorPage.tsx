import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface ErrorPageProps {
  errorCode?: number | string;
  onRetry?: () => void;
}

export default function ErrorPage({ errorCode = 500, onRetry }: ErrorPageProps) {
  const navigate = useNavigate();

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

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
          <div className="w-32 h-32 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="w-16 h-16 text-destructive/60" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">Algo correu mal</h1>
          <p className="text-sm text-muted-foreground">
            Ocorreu um erro inesperado. Tente novamente.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={handleRetry} className="gap-2 min-h-[44px]">
            🔄 Tentar novamente
          </Button>
          <Button variant="outline" onClick={() => navigate("/")} className="gap-2 min-h-[44px]">
            🏠 Voltar ao Início
          </Button>
        </div>

        <p className="text-xs text-muted-foreground/60">Erro: {errorCode}</p>
      </div>
    </div>
  );
}
