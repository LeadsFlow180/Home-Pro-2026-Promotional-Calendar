'use client';

import { useState, useEffect } from 'react';
import { MonthlyData, CalendarEvent } from '@/types/calendar';
import { parseDayFromDate, formatMonthName, getMonthImagePath } from '@/lib/utils/calendar-data';

interface MonthViewProps {
  monthData: MonthlyData;
  promotionalEvents: CalendarEvent[];
}

export default function MonthView({ monthData, promotionalEvents }: MonthViewProps) {
  const monthName = formatMonthName(monthData.month);
  const imagePath = monthData.imagePath || getMonthImagePath(monthData.month);
  const [imageError, setImageError] = useState(false);
  
  // Reset image error when month changes
  useEffect(() => {
    setImageError(false);
  }, [monthData.month]);
  
  // Combine all events and sort by day
  const allEvents = [
    ...monthData.highlightedDates,
    ...monthData.events,
    ...promotionalEvents,
  ].sort((a, b) => {
    const dayA = parseDayFromDate(a.date) || 0;
    const dayB = parseDayFromDate(b.date) || 0;
    return dayA - dayB;
  });

  // Get days in month (simplified - assumes 31 days max)
  const daysInMonth = 31;
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Group events by day
  const eventsByDay = new Map<number, CalendarEvent[]>();
  allEvents.forEach(event => {
    const day = parseDayFromDate(event.date);
    if (day) {
      if (!eventsByDay.has(day)) {
        eventsByDay.set(day, []);
      }
      eventsByDay.get(day)!.push(event);
    }
  });

  return (
    <div className="w-full space-y-6">
      {/* Hero Section with Image and Month Name */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="relative h-64 sm:h-80 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
          {!imageError ? (
            <img
              src={imagePath}
              alt={`${monthName} promotional image`}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
              onLoad={() => setImageError(false)}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-white/80">
                <svg className="w-20 h-20 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                <p className="text-lg font-semibold">{monthName}</p>
              </div>
            </div>
          )}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6">
            <h2 className="text-4xl sm:text-5xl font-bold text-white">{monthName}</h2>
          </div>
        </div>
        
        {/* Monthly Themes */}
        {monthData.themes.length > 0 && (
          <div className="p-6 border-t border-gray-100">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Monthly Themes</h3>
            <div className="flex flex-wrap gap-2">
              {monthData.themes.map((theme, index) => (
                <span
                  key={index}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-800 rounded-full text-sm font-medium shadow-sm hover:shadow-md transition-shadow"
                >
                  {theme}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Calendar Grid - Modern Card Design */}
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Calendar View</h3>
        <div className="grid grid-cols-7 gap-2 mb-4">
          {/* Day headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center font-bold text-gray-500 text-xs sm:text-sm py-2">
              {day}
            </div>
          ))}

          {/* Calendar days */}
          {days.map(day => {
            const dayEvents = eventsByDay.get(day) || [];
            const hasHighlighted = dayEvents.some(e => e.type === 'highlighted');
            const hasPromotional = dayEvents.some(e => e.type === 'promotional');
            
            return (
              <div
                key={day}
                className={`
                  min-h-20 sm:min-h-24 p-2 rounded-xl border-2 transition-all duration-200
                  ${hasHighlighted 
                    ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-300 shadow-md' 
                    : hasPromotional 
                    ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-300 shadow-md'
                    : dayEvents.length > 0
                    ? 'bg-blue-50 border-blue-200'
                    : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                  }
                `}
              >
                <div className={`font-bold text-sm mb-1 ${dayEvents.length > 0 ? 'text-gray-900' : 'text-gray-500'}`}>
                  {day}
                </div>
                <div className="space-y-1">
                  {dayEvents.slice(0, 2).map((event, idx) => (
                    <div
                      key={idx}
                      className={`
                        text-xs p-1.5 rounded-lg font-medium truncate shadow-sm
                        ${event.type === 'highlighted' ? 'bg-yellow-200 text-yellow-900' : ''}
                        ${event.type === 'promotional' ? 'bg-green-200 text-green-900' : ''}
                        ${event.type === 'daily' ? 'bg-blue-200 text-blue-900' : ''}
                      `}
                      title={event.event}
                    >
                      {event.event.length > 15 ? event.event.substring(0, 15) + '...' : event.event}
                    </div>
                  ))}
                  {dayEvents.length > 2 && (
                    <div className="text-xs text-gray-500 font-semibold">+{dayEvents.length - 2} more</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Event List - Card Design */}
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900">All Events for {monthName}</h3>
          <div className="flex gap-2">
            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">Highlighted</span>
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">Promotional</span>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">Daily</span>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {allEvents.map((event, index) => (
            <div
              key={index}
              className={`
                p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-lg hover:scale-105
                ${event.type === 'highlighted' 
                  ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-300' 
                  : event.type === 'promotional'
                  ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-300'
                  : 'bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-300'
                }
              `}
            >
              <div className="flex items-start gap-3">
                <span className={`
                  px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap
                  ${event.type === 'highlighted' ? 'bg-yellow-200 text-yellow-900' : ''}
                  ${event.type === 'promotional' ? 'bg-green-200 text-green-900' : ''}
                  ${event.type === 'daily' ? 'bg-blue-200 text-blue-900' : ''}
                `}>
                  {event.type.toUpperCase()}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-gray-900 text-sm mb-1">{event.date}</div>
                  <div className="text-gray-700 text-sm">{event.event.replace(event.date, '').trim() || event.event}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
