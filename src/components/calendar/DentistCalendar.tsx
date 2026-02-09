import { useState, useMemo, useEffect } from "react";
import { Plus, PauseCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DateNavigator } from "./DateNavigator";
import { TimeSlotView } from "./TimeSlotView";
import { MultiDentistGrid, DentistColumn } from "./MultiDentistGrid";
import { CategoryLegend } from "./CategoryLegend";
import { DynamicDaySummary } from "./DynamicDaySummary";
import { EditConsultationModal } from "./EditConsultationModal";
import { BottomNavigation } from "./BottomNavigation";
import { MobileHeader } from "./mobile/MobileHeader";
import { MobileSidebar } from "./mobile/MobileSidebar";
import { ThreeDayView } from "./mobile/ThreeDayView";
import { DesktopLayout } from "@/components/desktop/DesktopHeader";
import { Consultation, TimeSlot, ViewMode } from "@/types/calendar";
import {
  mockConsultations,
  mockClinics,
  mockDentists,
  generateTimeSlots,
  getDentistsForClinic,
  dentistWorksOnDemo,
  clinicDentists,
} from "@/data/mockData";
import { useIsMobile } from "@/hooks/use-mobile";
import smileIcon from "@/assets/smilecheck-icon.png";

export function DentistCalendar() {
  const [selectedDate, setSelectedDate] = useState(new Date(2026, 0, 31));
  const [viewMode, setViewMode] = useState<ViewMode>("day");
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
  const [activeTab, setActiveTab] = useState("agenda");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedDentistIds, setSelectedDentistIds] = useState<string[]>([]);
  const [selectedClinics, setSelectedClinics] = useState<string[]>(["1"]);
  const isMobile = useIsMobile();

  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    checkDesktop();
    window.addEventListener("resize", checkDesktop);
    return () => window.removeEventListener("resize", checkDesktop);
  }, []);

  const columns = useMemo<DentistColumn[]>(() => {
    const result: DentistColumn[] = [];
    const showAll = selectedDentistIds.length === 0 || selectedDentistIds.includes("all");
    const clinicsToIterate = showAll
      ? selectedClinics.length === 0
        ? mockClinics
        : mockClinics.filter((c) => selectedClinics.includes(c.id))
      : mockClinics;

    clinicsToIterate.forEach((clinic) => {
      const dentistsInClinic = getDentistsForClinic(clinic.id);
      let dentistsToShow;
      if (showAll) {
        if (selectedClinics.length === 0 || selectedClinics.includes(clinic.id)) {
          dentistsToShow = dentistsInClinic;
        } else {
          dentistsToShow = [];
        }
      } else {
        dentistsToShow = dentistsInClinic.filter((d) => {
          const compositeKey = `${clinic.id}-${d.id}`;
          return selectedDentistIds.includes(compositeKey);
        });
      }

      dentistsToShow.forEach((dentist) => {
        const worksToday = dentistWorksOnDemo(clinic.id, dentist.id);
        const dentistConsultations = mockConsultations.filter(
          (c) => c.dentist.id === dentist.id && c.clinic.id === clinic.id,
        );
        const slots = generateTimeSlots(selectedDate, dentistConsultations);
        result.push({ dentist, clinic, worksToday, slots });
      });
    });

    return result;
  }, [selectedDate, selectedClinics, selectedDentistIds]);

  const myConsultations = useMemo(() => {
    if (selectedDentistIds.length === 0 || selectedDentistIds.includes("all")) {
      return mockConsultations.filter((c) => c.dentist.id === mockDentists[0].id);
    }
    return mockConsultations.filter((c) => {
      const key = `${c.clinic.id}-${c.dentist.id}`;
      return selectedDentistIds.includes(key) || selectedDentistIds.includes(c.dentist.id);
    });
  }, [selectedDentistIds]);

  const slots = generateTimeSlots(selectedDate, myConsultations);

  const dayConsultations = mockConsultations.filter((c) => c.date.toDateString() === selectedDate.toDateString());

  const handleSlotClick = (slot: TimeSlot) => {
    if (slot.consultation) {
      setSelectedConsultation(slot.consultation);
    }
  };

  const handleGridSlotClick = (dentistId: string, clinicId: string, slot: TimeSlot) => {
    if (slot.consultation) {
      setSelectedConsultation(slot.consultation);
    }
  };

  const getSlots = (date: Date) => {
    if (selectedDentistIds.length === 1 && selectedDentistIds[0] !== "all") {
      const parts = selectedDentistIds[0].split("-");
      const clinicId = parts[0];
      const dentistId = parts.slice(1).join("-") || parts[0];
      const consultations = mockConsultations.filter((c) => c.dentist.id === dentistId && c.clinic.id === clinicId);
      return generateTimeSlots(date, consultations);
    }
    const consultations = mockConsultations.filter((c) => c.dentist.id === mockDentists[0].id && c.clinic.id === "1");
    return generateTimeSlots(date, consultations);
  };

  const handleDentistToggle = (dentistId: string | null, isCheckbox: boolean, clinicId?: string) => {
    if (dentistId === null) {
      const presentDentists = clinicDentists
        .filter((cd) => cd.worksOnDemo)
        .map((cd) => `${cd.clinicId}-${cd.dentistId}`);
      setSelectedDentistIds(presentDentists);
    } else if (dentistId === "all") {
      setSelectedDentistIds([]);
    } else {
      const key = clinicId ? `${clinicId}-${dentistId}` : dentistId;
      if (isCheckbox) {
        if (selectedDentistIds.length === 0 || selectedDentistIds.includes("all")) {
          setSelectedDentistIds([key]);
        } else if (selectedDentistIds.includes(key)) {
          const newSelected = selectedDentistIds.filter((id) => id !== key);
          setSelectedDentistIds(newSelected);
        } else {
          setSelectedDentistIds([...selectedDentistIds, key]);
        }
      } else {
        setSelectedDentistIds([key]);
      }
    }
  };

  const handleClinicToggle = (clinicId: string, isCheckbox: boolean) => {
    if (isCheckbox) {
      if (selectedClinics.includes(clinicId)) {
        const newSelected = selectedClinics.filter((id) => id !== clinicId);
        if (newSelected.length === 0) {
          setSelectedClinics(["1"]);
        } else {
          setSelectedClinics(newSelected);
        }
      } else {
        setSelectedClinics([...selectedClinics, clinicId]);
      }
    } else {
      setSelectedClinics([clinicId]);
    }
  };

  const renderContent = () => {
    if (viewMode === "three-day") {
      return <ThreeDayView selectedDate={selectedDate} getSlots={getSlots} onSlotClick={handleSlotClick} />;
    }
    if (viewMode === "list") {
      return <TimeSlotView slots={slots} onSlotClick={handleSlotClick} />;
    }
    return <MultiDentistGrid columns={columns} onSlotClick={handleGridSlotClick} showFullName />;
  };

  useEffect(() => {
    if (viewMode === "three-day" || viewMode === "list") {
      if (selectedDentistIds.length === 0 || selectedDentistIds.includes("all")) {
        setSelectedDentistIds(["1-1"]);
      } else if (selectedDentistIds.length > 1) {
        setSelectedDentistIds([selectedDentistIds[0]]);
      }
    }
  }, [viewMode]);

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
  };

  // ========== DESKTOP ==========
  if (isDesktop) {
    return (
      <DesktopLayout userRole="dentist" activeTab={activeTab} onTabChange={setActiveTab} currentDate={selectedDate}>
        <DateNavigator date={selectedDate} onDateChange={setSelectedDate} />
        <CategoryLegend compact className="my-4 rounded-lg" />
        <div className="mt-4">{renderContent()}</div>
        {viewMode !== "three-day" && (
          <div className="mt-6">
            <DynamicDaySummary
              consultations={dayConsultations}
              selectedDentistIds={selectedDentistIds}
              selectedClinics={selectedClinics}
            />
          </div>
        )}
        <EditConsultationModal
          consultation={selectedConsultation}
          isOpen={!!selectedConsultation}
          onClose={() => setSelectedConsultation(null)}
          isMobile={false}
          onSave={() => {
            setSelectedConsultation(null);
          }}
          onCancel={() => {
            setSelectedConsultation(null);
          }}
        />
      </DesktopLayout>
    );
  }

  // ========== MOBILE/TABLET ==========
  return (
    <div className="min-h-screen bg-background pb-24 relative overflow-x-hidden">
      <div
        className="fixed inset-0 pointer-events-none flex items-center justify-center opacity-5 z-0"
        style={{
          backgroundImage: `url(${smileIcon})`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          backgroundSize: "60%",
        }}
      />

      <div className="relative z-10 w-full max-w-full">
        <MobileHeader
          onMenuClick={() => setSidebarOpen(true)}
          viewMode={viewMode}
          onViewModeChange={handleViewModeChange}
          userRole="dentist"
        />
        <DateNavigator date={selectedDate} onDateChange={setSelectedDate} />
        <CategoryLegend compact className="mx-4 mb-4 rounded-lg" />
        <div className="mt-4 w-full">{renderContent()}</div>
        {viewMode !== "three-day" && (
          <div className="mt-6">
            <DynamicDaySummary
              consultations={dayConsultations}
              selectedDentistIds={selectedDentistIds}
              selectedClinics={selectedClinics}
            />
          </div>
        )}
        <div className="fixed bottom-24 right-4 flex flex-col gap-3 z-20">
          <Button variant="secondary" size="icon" className="w-12 h-12 rounded-full shadow-lg">
            <PauseCircle className="w-5 h-5" />
          </Button>
          <Button className="floating-button animate-pulse-glow" style={{ position: "relative", bottom: 0, right: 0 }}>
            <Plus className="w-6 h-6" />
          </Button>
        </div>
        <BottomNavigation userRole="dentist" activeTab={activeTab} onTabChange={setActiveTab} />
        <MobileSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          userRole="dentist"
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          selectedDentists={selectedDentistIds.length === 0 ? ["all"] : selectedDentistIds}
          onDentistToggle={handleDentistToggle}
          selectedClinics={selectedClinics}
          onClinicToggle={handleClinicToggle}
        />
        <EditConsultationModal
          consultation={selectedConsultation}
          isOpen={!!selectedConsultation}
          onClose={() => setSelectedConsultation(null)}
          isMobile={isMobile}
          onSave={() => {
            setSelectedConsultation(null);
          }}
          onCancel={() => {
            setSelectedConsultation(null);
          }}
        />
      </div>
    </div>
  );
}
