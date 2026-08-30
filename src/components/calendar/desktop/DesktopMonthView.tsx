import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay } from 'date-fns';
import { Consultation, CATEGORY_COLORS } from '@/types/calendar';
import { mockConsultations } from '@/data/mockData';
import { cn } from '@/lib/utils';

interface DesktopMonthViewProps {
  selectedDate: Date;
  selectedDentistKey: string; // composite clinicId-dentistId
  onDateSelect: (date: Date) => void;
  onSwitchToDay: (date: Date) => void;
}

export function DesktopMonthView({
  selectedDate,
  selectedDentistKey,
  onDateSelect,
  onSwitchToDay,
}: DesktopMonthViewProps) {
  const { t } = useTranslation();
  const [clinicId, dentistId] = useMemo(() => {
    const parts = selectedDentistKey.split('-');
    return [parts[0], parts.slice(1).join('-') || parts[0]];
  }, [selectedDentistKey]);

  const today = new Date();
  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(monthStart);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  // Build weeks
  const weeks: Date[][] = [];
  let day = calStart;
  while (day <= calEnd) {
    const week: Date[] = [];
    for (let i = 0; i < 7; i++) {
      week.push(day);
      day = addDays(day, 1);
    }
    weeks.push(week);
  }

  // Count consultations per day for this dentist
  const consultationsByDay = useMemo(() => {
    const map: Record<string, Consultation[]> = {};
    mockConsultations.forEach(c => {
      if (c.dentist.id === dentistId && c.clinic.id === clinicId) {
        const key = format(c.date, 'yyyy-MM-dd');
        if (!map[key]) map[key] = [];
        map[key].push(c);
      }
    });
    return map;
  }, [selectedDentistKey]);

  const weekDays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

  return (
    <div className="flex-1 overflow-auto p-4">
      {/* Week day headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map(d => (
          <div key={d} className="text-center text-xs font-medium text-muted-foreground py-2">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {weeks.flat().map((date, idx) => {
          const isCurrentMonth = isSameMonth(date, selectedDate);
          const isToday = isSameDay(date, today);
          const dayKey = format(date, 'yyyy-MM-dd');
          const dayConsults = consultationsByDay[dayKey] || [];
          const hasUrgent = dayConsults.some(c => c.category === 'urgencia');
          const count = dayConsults.length;

          return (
            <button
              key={idx}
              onClick={() => onSwitchToDay(date)}
              className={cn(
                'relative rounded-lg p-2 min-h-[80px] text-left transition-all border',
                !isCurrentMonth && 'opacity-40 border-transparent',
                isCurrentMonth && count > 0 && 'bg-primary/5 border-primary/20 hover:bg-primary/10',
                isCurrentMonth && count === 0 && 'bg-secondary/20 border-transparent hover:bg-secondary/40',
                isToday && 'ring-2 ring-primary border-primary/40',
              )}
            >
              <div className={cn(
                'text-sm font-semibold mb-1',
                isToday && 'text-primary',
                !isCurrentMonth && 'text-muted-foreground'
              )}>
                {format(date, 'd')}
              </div>
              
              {count > 0 && isCurrentMonth && (
                <div className="space-y-0.5">
                  <div className="text-[11px] text-muted-foreground font-medium">
                    {count} consulta{count !== 1 ? 's' : ''}
                  </div>
                  {/* Mini category dots */}
                  <div className="flex flex-wrap gap-0.5">
                    {dayConsults.slice(0, 5).map((c, i) => {
                      const cat = c.category || 'restauracao';
                      const colors = CATEGORY_COLORS[cat];
                      return (
                        <span
                          key={i}
                          className={cn('w-2 h-2 rounded-full', colors.bg)}
                        />
                      );
                    })}
                    {count > 5 && (
                      <span className="text-[11px] text-muted-foreground">+{count - 5}</span>
                    )}
                  </div>
                  {hasUrgent && (
                    <div className="text-[11px] text-destructive font-medium">⚠ {t('agenda.urgency')}</div>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
