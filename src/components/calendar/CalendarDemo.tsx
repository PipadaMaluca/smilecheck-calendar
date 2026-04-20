import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PatientCalendar } from './PatientCalendar';
import { DentistCalendar } from './DentistCalendar';
import { ClinicCalendar } from './ClinicCalendar';
import { DesktopCalendarView } from './desktop/DesktopCalendarView';
import { VideoSplashScreen, hasSeenVideoSplash } from '@/components/splash/VideoSplashScreen';
import { User, Stethoscope, Building2 } from 'lucide-react';

export function CalendarDemo() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const roleParam = searchParams.get('role');
  const initialRole = (roleParam === 'patient' || roleParam === 'dentist' || roleParam === 'clinic') ? roleParam : 'patient';
  const isDemoMode = searchParams.get('demo') === 'true';
  const [activeView, setActiveView] = useState(initialRole);
  const [isDesktop, setIsDesktop] = useState(false);

  // Video splash — only on first login per role
  const splashRole = initialRole;
  const [showVideoSplash, setShowVideoSplash] = useState(() => !hasSeenVideoSplash(splashRole));

  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  const handleVideoFinish = useCallback(() => {
    setShowVideoSplash(false);
  }, []);

  // On desktop (>= 1024px), show the Doctolib-style layout
  if (isDesktop) {
    return (
      <>
        {showVideoSplash && <VideoSplashScreen role={splashRole} onFinish={handleVideoFinish} />}
        <DesktopCalendarView />
      </>
    );
  }

  // When NOT in demo mode, render only the role-specific calendar (no switcher).
  if (!isDemoMode) {
    return (
      <div className="min-h-screen bg-background overflow-x-hidden max-w-[100vw]">
        {showVideoSplash && <VideoSplashScreen role={splashRole} onFinish={handleVideoFinish} />}
        {initialRole === 'patient' && <PatientCalendar />}
        {initialRole === 'dentist' && <DentistCalendar />}
        {initialRole === 'clinic' && <ClinicCalendar />}
      </div>
    );
  }

  // On mobile/tablet, show the original tabbed interface
  return (
    <div className="min-h-screen bg-background overflow-x-hidden max-w-[100vw]">
      {showVideoSplash && <VideoSplashScreen role={splashRole} onFinish={handleVideoFinish} />}

      {/* View Selector */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <Tabs value={activeView} onValueChange={setActiveView} className="w-full max-w-full overflow-x-hidden">
          <TabsList className="w-full h-14 bg-card/50 rounded-none grid grid-cols-3">
            <TabsTrigger
              value="patient"
              className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">{t('demo.patientLabel')}</span>
            </TabsTrigger>
            <TabsTrigger
              value="dentist"
              className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Stethoscope className="w-4 h-4" />
              <span className="hidden sm:inline">{t('demo.dentistLabel')}</span>
            </TabsTrigger>
            <TabsTrigger
              value="clinic"
              className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Building2 className="w-4 h-4" />
              <span className="hidden sm:inline">{t('demo.clinicLabel')}</span>
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
