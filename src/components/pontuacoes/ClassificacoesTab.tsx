import { RankingsView } from '@/components/rankings/RankingsView';
import { UserRole } from '@/types/calendar';

interface ClassificacoesTabProps {
  userRole: UserRole;
}

export function ClassificacoesTab({ userRole }: ClassificacoesTabProps) {
  // Re-use existing RankingsView content but inline (no outer scroll/padding)
  return <RankingsView userRole={userRole} inline />;
}
