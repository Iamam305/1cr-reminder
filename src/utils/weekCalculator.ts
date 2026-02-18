import type { WeekData } from '../types';

const START_DATE = new Date('2026-02-16T00:00:00.000Z');
const END_DATE = new Date('2028-03-31T23:59:59.999Z'); // End of March 2028

/**
 * Calculate the start of a week (Monday) for a given date
 */
function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getUTCDay();
  const diff = d.getUTCDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), diff));
}

/**
 * Calculate the end of a week (Sunday) for a given date
 */
function getWeekEnd(weekStart: Date): Date {
  const weekEnd = new Date(weekStart);
  weekEnd.setUTCDate(weekEnd.getUTCDate() + 6);
  weekEnd.setUTCHours(23, 59, 59, 999);
  return weekEnd;
}

/**
 * Calculate all weeks from start date to end date
 */
export function calculateWeeks(): WeekData[] {
  const weeks: WeekData[] = [];
  const now = new Date();
  const currentWeekStart = getWeekStart(now);
  
  let currentDate = new Date(START_DATE);
  let weekNumber = 1;

  while (currentDate < END_DATE) {
    const weekStart = getWeekStart(currentDate);
    const weekEnd = getWeekEnd(weekStart);
    
    // Determine status
    let status: 'past' | 'current' | 'future';
    if (weekEnd < currentWeekStart) {
      status = 'past';
    } else if (weekStart <= currentWeekStart && weekEnd >= currentWeekStart) {
      status = 'current';
    } else {
      status = 'future';
    }

    weeks.push({
      weekNumber,
      startDate: weekStart,
      endDate: weekEnd,
      status,
    });

    // Move to next week
    currentDate = new Date(weekEnd);
    currentDate.setUTCDate(currentDate.getUTCDate() + 1);
    weekNumber++;
  }

  return weeks;
}

/**
 * Get the current week number (1-indexed)
 */
export function getCurrentWeekNumber(): number {
  const weeks = calculateWeeks();
  const currentWeek = weeks.find(w => w.status === 'current');
  return currentWeek ? currentWeek.weekNumber : 1;
}

/**
 * Calculate weeks remaining until March 2028
 */
export function getWeeksRemaining(): number {
  const weeks = calculateWeeks();
  const currentWeekIndex = weeks.findIndex(w => w.status === 'current');
  
  if (currentWeekIndex === -1) {
    // If we're past all weeks, return 0
    return 0;
  }
  
  return weeks.length - currentWeekIndex;
}

/**
 * Format date for display (e.g., "16 Feb 2025")
 */
export function formatDate(date: Date): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const day = date.getUTCDate().toString().padStart(2, '0');
  const month = months[date.getUTCMonth()];
  const year = date.getUTCFullYear();
  return `${day} ${month} ${year}`;
}
