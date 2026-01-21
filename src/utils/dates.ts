import { format, startOfWeek, addDays, eachDayOfInterval, isSameDay, parseISO } from 'date-fns';

export const formatDate = (date: Date | string): string => {
  let dateObj: Date;
  
  if (typeof date === 'string') {
    // If it's already in YYYY-MM-DD format, return as is
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return date;
    }
    dateObj = parseISO(date);
  } else {
    dateObj = date;
  }
  
  // Always use local date components to avoid UTC conversion issues
  // This ensures that if user is on Jan 22, it stays Jan 22 regardless of timezone
  const year = dateObj.getFullYear();
  const month = dateObj.getMonth();
  const day = dateObj.getDate();
  
  // Create a new date object using local components (no time, no timezone)
  const localDate = new Date(year, month, day);
  
  return format(localDate, 'yyyy-MM-dd');
};

export const getWeekDates = (date: Date = new Date()): Date[] => {
  const weekStart = startOfWeek(date, { weekStartsOn: 1 }); // Monday
  return eachDayOfInterval({
    start: weekStart,
    end: addDays(weekStart, 6),
  });
};

export const getDaysInMonth = (date: Date = new Date()): Date[] => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  return eachDayOfInterval({ start: firstDay, end: lastDay });
};

export const isToday = (date: Date | string): boolean => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  const today = new Date();
  // Use local date components to avoid UTC issues
  const todayLocal = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const dateLocal = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
  return isSameDay(dateLocal, todayLocal);
};

export const getDayName = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'EEE');
};

export const getDayNumber = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'd');
};

export const getMonthName = (date: Date = new Date()): string => {
  return format(date, 'MMMM');
};

