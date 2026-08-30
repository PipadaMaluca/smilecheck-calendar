import { CalendarDemo } from '@/components/calendar/CalendarDemo';
import { AgendaDataProvider } from '@/data/agendaSource';
import { AppointmentActionsProvider } from '@/data/appointmentActions';

export default function AppPage() {
  return (
    <AgendaDataProvider>
      <AppointmentActionsProvider>
        <CalendarDemo />
      </AppointmentActionsProvider>
    </AgendaDataProvider>
  );
}
