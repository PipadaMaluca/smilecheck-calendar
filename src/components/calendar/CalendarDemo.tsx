import { useState, useEffect, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PatientCalendar } from './PatientCalendar';
import { DentistCalendar } from './DentistCalendar';
import { ClinicCalendar } from './ClinicCalendar';
import { DesktopCalendarView } from './desktop/DesktopCalendarView';
import { SplashScreen } from '@/components/splash/SplashScreen';
import { User, Stethoscope, Building2 } from 'lucide-react';

export function CalendarDemo() {
  const [activeView, setActiveView] = useState('patient');
  const [isDesktop, setIsDesktop] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  const handleSplashFinish = useCallback(() => {
    setShowSplash(false);
  }, []);

  // Determine role for splash (desktop uses 'clinic' as default, mobile uses activeView)
  const splashRole = isDesktop ? 'clinic' : (activeView as 'patient' | 'dentist' | 'clinic');

  // On desktop (>= 1024px), show the Doctolib-style layout
  if (isDesktop) {
    return (
      <>
        {showSplash && <SplashScreen userRole={splashRole} onFinish={handleSplashFinish} />}
        <DesktopCalendarView />
      </>
    );
  }

  // On mobile/tablet, show the original tabbed interface
  return (
    <div className="min-h-screen bg-background">
      {showSplash && <SplashScreen userRole={splashRole} onFinish={handleSplashFinish} />}

      {/* View Selector */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <Tabs value={activeView} onValueChange={setActiveView} className="w-full">
          <TabsList className="w-full h-14 bg-card/50 rounded-none grid grid-cols-3">
            <TabsTrigger
              value="patient"
              className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Paciente</span>
            </TabsTrigger>
            <TabsTrigger
              value="dentist"
              className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Stethoscope className="w-4 h-4" />
              <span className="hidden sm:inline">Dentista</span>
            </TabsTrigger>
            <TabsTrigger
              value="clinic"
              className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Building2 className="w-4 h-4" />
              <span className="hidden sm:inline">Clínica</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="patient" className="mt-0">
            <PatientCalendar />
          </TabsContent>

          <TabsContent value="dentist" className="mt-0">
            <DentistCalendar />
          </TabsContent>

          <TabsContent value="clinic" className="mt-0">
            <ClinicCalendar />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}