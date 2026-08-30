import { CalendarDemo } from '@/components/calendar/CalendarDemo';
import { AgendaDataProvider } from '@/data/agendaSource';

export default function AppPage() {
  return (
    <AgendaDataProvider>
      <CalendarDemo />
    </AgendaDataProvider>
  );
}
