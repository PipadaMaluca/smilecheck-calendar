import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { OnboardingProvider } from "@/contexts/OnboardingContext";
import { OnboardingCarousel } from "@/components/onboarding/OnboardingCarousel";
import { OnboardingTooltips } from "@/components/onboarding/OnboardingTooltips";
import Index from "./pages/Index";
import Triagem from "./pages/Triagem";
import NotFound from "./pages/NotFound";
import { LoginScreen } from "./components/auth/LoginScreen";
import { SignUpScreen } from "./components/auth/SignUpScreen";
import { ForgotPasswordScreen } from "./components/auth/ForgotPasswordScreen";
import { DemoSelector } from "./components/auth/DemoSelector";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <OnboardingProvider>
      <Toaster />
      <Sonner />
      <OnboardingCarousel />
      <OnboardingTooltips />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/signup" element={<SignUpScreen />} />
          <Route path="/forgot-password" element={<ForgotPasswordScreen />} />
          <Route path="/demo" element={<DemoSelector />} />
          <Route path="/" element={<Index />} />
          <Route path="/triagem" element={<Triagem />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      </OnboardingProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
