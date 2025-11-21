import { MonthlyData, CalendarEvent } from '@/types/calendar';
import monthlyData2024 from '@/data/2024-calendar.json';
import promotionalEvents2026 from '@/data/2026-calendar.json';

/**
 * Load and combine calendar data from 2024 and 2026 files
 */
export function loadCalendarData() {
  return {
    monthlyData: monthlyData2024 as MonthlyData[],
    promotionalEvents: promotionalEvents2026 as CalendarEvent[],
  };
}

/**
 * Get events for a specific month
 */
export function getEventsForMonth(month: string, data: { monthlyData: MonthlyData[]; promotionalEvents: CalendarEvent[] }) {
  const monthData = data.monthlyData.find(m => m.month.toLowerCase() === month.toLowerCase());
  const promotionalEvents = data.promotionalEvents.filter(e => e.month.toLowerCase() === month.toLowerCase());
  
  return {
    themes: monthData?.themes || [],
    events: monthData?.events || [],
    highlightedDates: monthData?.highlightedDates || [],
    promotionalEvents,
  };
}

/**
 * Get all months available in the calendar
 */
export function getAvailableMonths(data: { monthlyData: MonthlyData[] }) {
  return data.monthlyData.map(m => m.month);
}

/**
 * Parse date string to extract day number
 */
export function parseDayFromDate(dateStr: string): number | null {
  const match = dateStr.match(/(\d+)(st|nd|rd|th)/);
  if (match) {
    return parseInt(match[1], 10);
  }
  return null;
}

/**
 * Format month name for display
 */
export function formatMonthName(month: string): string {
  return month.charAt(0).toUpperCase() + month.slice(1).toLowerCase();
}

/**
 * Get image path for a month
 * Checks for image in public/images/months/ folder
 */
export function getMonthImagePath(month: string): string | undefined {
  const monthLower = month.toLowerCase();
  // Common image extensions to check
  const extensions = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
  
  // Try to find image - in a real app, we'd check if file exists
  // For now, return a path that should work if images are added
  return `/images/months/${monthLower}.jpg`;
}

