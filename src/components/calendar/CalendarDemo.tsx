import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PatientCalendar } from './PatientCalendar';
import { DentistCalendar } from './DentistCalendar';
import { ClinicCalendar } from './ClinicCalendar';
import { DesktopCalendarView } from './desktop/DesktopCalendarView';
import { VideoSplashScreen, hasSeenVideoSplash } from '@/components/splash/VideoSplashScreen';

export function CalendarDemo() {
  const [searchParams] = useSearchParams();
  const roleParam = searchParams.get('role');
  const initialRole = (roleParam === 'patient' || roleParam === 'dentist' || roleParam === 'clinic') ? roleParam : 'patient';
  const [activeView, setActiveView] = useState(initialRole);
  const [isDesktop, setIsDesktop] = useState(false);

  // Video splash — only on first login ever (single first-run gate).
  const splashRole = initialRole;
  const [showVideoSplash, setShowVideoSplash] = useState(() => {
    if (typeof localStorage !== 'undefined' && localStorage.getItem('sc:first-run-done') === '1') return false;
    return !hasSeenVideoSplash(splashRole);
  });

  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  // Listen to role-change events from DemoControlsPanel
  useEffect(() => {
    const handler = (e: Event) => {
      const next = (e as CustomEvent<string>).detail;
      if (next === 'patient' || next === 'dentist' || next === 'clinic') {
        setActiveView(next);
      }
    };
    window.addEventListener('smilecheck:set-role', handler);
    return () => window.removeEventListener('smilecheck:set-role', handler);
  }, []);

  // Sync when URL role param changes
  useEffect(() => {
    if (roleParam === 'patient' || roleParam === 'dentist' || roleParam === 'clinic') {
      setActiveView(roleParam);
    }
  }, [roleParam]);

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

  // Mobile/tablet: render active role calendar; role switching now lives inside the hamburger menu's DemoControlsPanel
  return (
    <div className="min-h-screen bg-background overflow-x-hidden max-w-[100vw]">
      {showVideoSplash && <VideoSplashScreen role={splashRole} onFinish={handleVideoFinish} />}
      {activeView === 'patient' && <PatientCalendar />}
      {activeView === 'dentist' && <DentistCalendar />}
      {activeView === 'clinic' && <ClinicCalendar />}
    </div>
  );
}
