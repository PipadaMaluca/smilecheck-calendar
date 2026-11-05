import type * as React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { RouteEnter } from "@/components/motion/ScreenEnter";

function AnimatedRoutes({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  return <RouteEnter pathname={pathname}>{children}</RouteEnter>;
}
import { OnboardingProvider } from "@/contexts/OnboardingContext";
import { NotificationBadgeProvider } from "@/contexts/NotificationBadgeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { DirectoryProvider } from "@/data/directorySource";
import { FavoritesProvider } from "@/data/favoritesSource";
import { ClinicInviteNotifier } from "@/components/team/real/RealTeam";
import { OnboardingCarousel } from "@/components/onboarding/OnboardingCarousel";
import { OnboardingTooltips } from "@/components/onboarding/OnboardingTooltips";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DemoModeBadge } from "@/components/demo/DemoModeBadge";
import Index from "./pages/Index";
import AppPage from "./pages/AppPage";
import Landing from "./pages/Landing";
import Triagem from "./pages/Triagem";
import Termos from "./pages/Termos";
import VerifyDocument from "./pages/VerifyDocument";
import Privacidade from "./pages/Privacidade";
import Acessibilidade from "./pages/Acessibilidade";
import TermosProfissionais from "./pages/TermosProfissionais";
import { ConsentBanner } from "@/components/consent/ConsentBanner";
import { TermsGate } from "@/components/legal/TermsGate";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import { LoginScreen } from "./components/auth/LoginScreen";
import { SignUpScreen } from "./components/auth/SignUpScreen";
import { ForgotPasswordScreen } from "./components/auth/ForgotPasswordScreen";
import { DemoSelector } from "./components/auth/DemoSelector";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <NotificationBadgeProvider>
      <OnboardingProvider>
      <Toaster />
      <Sonner />
      <OnboardingCarousel />
      <OnboardingTooltips />
      <BrowserRouter>
        <AuthProvider>
        <DirectoryProvider>
        <FavoritesProvider>
          <ClinicInviteNotifier />
          <DemoModeBadge />
          <ConsentBanner />
          <TermsGate />
          <AnimatedRoutes>
          <Routes>
            <Route path="/login" element={<LoginScreen />} />
            <Route path="/signup" element={<SignUpScreen />} />
            <Route path="/forgot-password" element={<ForgotPasswordScreen />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/demo" element={<DemoSelector />} />
            <Route path="/verificar/:code" element={<VerifyDocument />} />
            <Route path="/termos" element={<Termos />} />
            <Route path="/privacidade" element={<Privacidade />} />
            <Route path="/acessibilidade" element={<Acessibilidade />} />
            <Route path="/termos-profissionais" element={<TermosProfissionais />} />
            <Route path="/" element={<Index />} />
            <Route path="/landing" element={<Landing />} />
            <Route path="/app" element={<ProtectedRoute><AppPage /></ProtectedRoute>} />
            <Route path="/triagem" element={<ProtectedRoute><Triagem /></ProtectedRoute>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          </AnimatedRoutes>
        </FavoritesProvider>
        </DirectoryProvider>
        </AuthProvider>
      </BrowserRouter>
      </OnboardingProvider>
      </NotificationBadgeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
