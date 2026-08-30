import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { OnboardingProvider } from "@/contexts/OnboardingContext";
import { NotificationBadgeProvider } from "@/contexts/NotificationBadgeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { OnboardingCarousel } from "@/components/onboarding/OnboardingCarousel";
import { OnboardingTooltips } from "@/components/onboarding/OnboardingTooltips";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DemoModeBadge } from "@/components/demo/DemoModeBadge";
import Index from "./pages/Index";
import AppPage from "./pages/AppPage";
import Landing from "./pages/Landing";
import Triagem from "./pages/Triagem";
import Termos from "./pages/Termos";
import Privacidade from "./pages/Privacidade";
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
          <DemoModeBadge />
          <Routes>
            <Route path="/login" element={<LoginScreen />} />
            <Route path="/signup" element={<SignUpScreen />} />
            <Route path="/forgot-password" element={<ForgotPasswordScreen />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/demo" element={<DemoSelector />} />
            <Route path="/termos" element={<Termos />} />
            <Route path="/privacidade" element={<Privacidade />} />
            <Route path="/" element={<Index />} />
            <Route path="/landing" element={<Landing />} />
            <Route path="/app" element={<ProtectedRoute><AppPage /></ProtectedRoute>} />
            <Route path="/triagem" element={<ProtectedRoute><Triagem /></ProtectedRoute>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
      </OnboardingProvider>
      </NotificationBadgeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
