'use client';

import { MonthlyData, CalendarEvent } from '@/types/calendar';
import { parseDayFromDate, formatMonthName, getMonthImagePath } from '@/lib/utils/calendar-data';
import { useState, useEffect } from 'react';

interface MonthCardProps {
  monthData: MonthlyData;
  promotionalEvents: CalendarEvent[];
  isCompact?: boolean;
}

export default function MonthCard({ monthData, promotionalEvents, isCompact = false }: MonthCardProps) {
  const monthName = formatMonthName(monthData.month);
  const imagePath = monthData.imagePath || getMonthImagePath(monthData.month);
  const [imageError, setImageError] = useState(false);
  
  useEffect(() => {
    setImageError(false);
  }, [monthData.month]);
  
  // Separate events by type
  const highlightedEvents = [
    ...monthData.highlightedDates,
    ...promotionalEvents.filter(e => e.type === 'highlighted')
  ];
  
  const dailyEvents = [
    ...monthData.events,
    ...promotionalEvents.filter(e => e.type === 'daily' || e.type === 'promotional')
  ].sort((a, b) => {
    const dayA = parseDayFromDate(a.date) || 0;
    const dayB = parseDayFromDate(b.date) || 0;
    return dayA - dayB;
  });

  // Extract just the event name (remove date prefix)
  const getEventName = (event: CalendarEvent) => {
    const dateMatch = event.date.match(/\d+(st|nd|rd|th)\s*-\s*(.+)/);
    if (dateMatch) {
      return dateMatch[2];
    }
    return event.event.replace(event.date, '').trim() || event.event;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow duration-200">
      {/* Month Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold">{monthName}</h3>
          <button className="text-sm text-white/80 hover:text-white underline">
            Export & Share
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Monthly Themes */}
        {monthData.themes.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Monthly Themes
            </h4>
            <div className="flex flex-wrap gap-2">
              {monthData.themes.map((theme, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium"
                >
                  {theme}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Key Dates */}
        {highlightedEvents.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Key Dates
            </h4>
            <div className="flex flex-wrap gap-2">
              {highlightedEvents.map((event, index) => (
                <div
                  key={index}
                  className="flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-900 rounded-full text-xs font-medium"
                >
                  <span>{event.date}</span>
                  <button className="text-yellow-700 hover:text-yellow-900">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Daily Opportunities */}
        {dailyEvents.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Daily Opportunities
            </h4>
            <div className="max-h-48 overflow-y-auto space-y-1 pr-2">
              {dailyEvents.map((event, index) => (
                <div
                  key={index}
                  className="text-sm text-gray-700 py-1 hover:text-gray-900"
                >
                  {event.date} {getEventName(event)}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Campaign Button */}
        <button className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
          Generate AI Campaign Ideas
        </button>
      </div>
    </div>
  );
}

