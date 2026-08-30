import { CalendarDemo } from '@/components/calendar/CalendarDemo';
import { AgendaDataProvider } from '@/data/agendaSource';
import { AppointmentActionsProvider } from '@/data/appointmentActions';
import { PointsDataProvider } from '@/data/pointsSource';

export default function AppPage() {
  return (
    <AgendaDataProvider>
      <PointsDataProvider>
      <AppointmentActionsProvider>
        <CalendarDemo />
      </AppointmentActionsProvider>
      </PointsDataProvider>
    </AgendaDataProvider>
  );
}
