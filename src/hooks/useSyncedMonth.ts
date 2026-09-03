import { useEffect, useState } from 'react';
import { isSameMonth, startOfMonth } from 'date-fns';

/**
 * Mini-calendar month state that stays in sync with the agenda's selected date.
 * Initialises on the selected date (instead of "now") and follows it whenever the
 * user navigates the agenda, while still allowing free month browsing.
 */
export function useSyncedMonth(selectedDate: Date) {
  const [currentMonth, setCurrentMonth] = useState(() => startOfMonth(selectedDate));

  useEffect(() => {
    setCurrentMonth((prev) => (isSameMonth(prev, selectedDate) ? prev : startOfMonth(selectedDate)));
  }, [selectedDate]);

  return [currentMonth, setCurrentMonth] as const;
}
