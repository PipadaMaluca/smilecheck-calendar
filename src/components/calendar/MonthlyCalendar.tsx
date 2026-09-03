import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { pt } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useSyncedMonth } from '@/hooks/useSyncedMonth';

interface MonthlyCalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  appointmentDates: Date[];
}

export function MonthlyCalendar({
  selectedDate,
  onDateSelect,
  appointmentDates
}: MonthlyCalendarProps) {
  const [currentMonth, setCurrentMonth] = useSyncedMonth(selectedDate);
  const today = new Date();

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const rows: Date[][] = [];
  let days: Date[] = [];
  let day = startDate;

  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      days.push(day);
      day = addDays(day, 1);
    }
    rows.push(days);
    days = [];
  }

  const hasAppointment = (date: Date) => appointmentDates.some(d => isSameDay(d, date));
  const weekDays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

  return (
    <div className="px-4">
      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <span className="text-sm font-semibold capitalize">
          {format(currentMonth, 'MMMM yyyy', { locale: pt })}
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Week Days Header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map(d => (
          <div key={d} className="text-center text-xs font-medium text-muted-foreground py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {rows.flat().map((date, idx) => {
          const isCurrentMonth = isSameMonth(date, currentMonth);
          const isToday = isSameDay(date, today);
          const isSelected = isSameDay(date, selectedDate);
          const hasAppt = hasAppointment(date);

          return (
            <button
              key={idx}
              onClick={() => onDateSelect(date)}
              className={cn(
                'relative flex flex-col items-center justify-center w-10 h-10 rounded-lg text-sm transition-all',
                !isCurrentMonth && 'text-muted-foreground/40',
                isCurrentMonth && 'text-foreground hover:bg-secondary/50',
                isToday && 'bg-primary text-primary-foreground font-semibold',
                isSelected && !isToday && 'bg-primary/20 text-primary ring-1 ring-primary'
              )}
            >
              {format(date, 'd')}
              {hasAppt && !isToday && (
                <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-primary" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
