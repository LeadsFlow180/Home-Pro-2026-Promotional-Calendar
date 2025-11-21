export interface CalendarEvent {
  date: string;
  event: string;
  type: 'daily' | 'highlighted' | 'promotional';
  month: string;
}

export interface MonthlyData {
  month: string;
  themes: string[];
  events: CalendarEvent[];
  highlightedDates: CalendarEvent[];
  imagePath?: string;
}

export interface CalendarData {
  monthlyData: MonthlyData[];
  promotionalEvents: CalendarEvent[];
}

