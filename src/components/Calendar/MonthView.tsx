'use client';

import { useState, useEffect } from 'react';
import { MonthlyData, CalendarEvent } from '@/types/calendar';
import { parseDayFromDate, formatMonthName, getMonthImagePath } from '@/lib/utils/calendar-data';
import EventDetailModal from './EventDetailModal';
import CampaignSection from './CampaignSection';

interface CampaignIdea {
  title: string;
  description: string;
  channels: string[];
  targetDate?: string | null;
}

interface MonthViewProps {
  monthData: MonthlyData;
  promotionalEvents: CalendarEvent[];
}

export default function MonthView({ monthData, promotionalEvents }: MonthViewProps) {
  const monthName = formatMonthName(monthData.month);
  const imagePath = monthData.imagePath || getMonthImagePath(monthData.month);
  const [imageError, setImageError] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [campaignIdeas, setCampaignIdeas] = useState<CampaignIdea[]>([]);
  const [isEventsListExpanded, setIsEventsListExpanded] = useState(true);
  const [eventFilter, setEventFilter] = useState<'all' | 'highlighted' | 'promotional' | 'daily'>('all');

  // Control how the hero image is cropped for each month
  const getHeroObjectPosition = (name: string): string => {
    switch (name) {
      case 'January':
        // January looked better fully centered before
        return 'center center';
      case 'May':
        // May should also use the original centered framing
        return 'center center';
      case 'August':
        // August back to original centered framing
        return 'center center';
      case 'September':
        // September back to original centered framing
        return 'center center';
      case 'December':
        // December back to original centered framing
        return 'center center';
      default:
        // Bias upward a bit so faces are more visible
        return 'center 25%';
    }
  };
  
  // Reset image error when month changes
  useEffect(() => {
    setImageError(false);
    setSelectedEvent(null);
    setCampaignIdeas([]);
  }, [monthData.month]);

  // Get month index (0-11) for date calculations
  const getMonthIndex = (monthName: string): number => {
    const months = ['january', 'february', 'march', 'april', 'may', 'june', 
                   'july', 'august', 'september', 'october', 'november', 'december'];
    return months.indexOf(monthName.toLowerCase());
  };

  // Get days in month and first day of week
  const getCalendarDays = () => {
    const year = 2026; // Using 2026 as base year
    const monthIndex = getMonthIndex(monthData.month);
    const firstDay = new Date(year, monthIndex, 1);
    const lastDay = new Date(year, monthIndex + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    return { daysInMonth, startingDayOfWeek };
  };

  const { daysInMonth, startingDayOfWeek } = getCalendarDays();
  
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

  /**
   * For both the calendar grid and the \"All Events\" list we want to avoid
   * showing the same event twice (for example once as DAILY and once as PROMOTIONAL).
   * Instead, we group by date + event name and keep a list of types, then
   * render one row with small colored dots/blocks for each type.
   */
  type EventType = CalendarEvent['type'];

  interface CombinedEvent {
    event: CalendarEvent;
    types: EventType[];
  }

  // Group events by day for the calendar grid
  const eventsByDay = new Map<number, CombinedEvent[]>();
  // Group events globally (date + name) for the All Events list
  const combinedEventsMap = new Map<string, CombinedEvent>();

  allEvents.forEach(event => {
    const day = parseDayFromDate(event.date);
    const normalizedName = event.event.toLowerCase().trim();

    // ----- Per-day grouping for calendar grid -----
    if (day) {
      if (!eventsByDay.has(day)) {
        eventsByDay.set(day, []);
      }

      const dayEvents = eventsByDay.get(day)!;
      const existingDay = dayEvents.find(
        e => e.event.event.toLowerCase().trim() === normalizedName
      );

      if (existingDay) {
        if (!existingDay.types.includes(event.type)) {
          existingDay.types.push(event.type);
        }
      } else {
        dayEvents.push({
          event,
          types: [event.type],
        });
      }
    }

    // ----- Global grouping for All Events list (date + name) -----
    const key = `${event.date}|${normalizedName}`;
    const existingGlobal = combinedEventsMap.get(key);

    if (existingGlobal) {
      if (!existingGlobal.types.includes(event.type)) {
        existingGlobal.types.push(event.type);
      }
    } else {
      combinedEventsMap.set(key, {
        event,
        types: [event.type],
      });
    }
  });

  const combinedEventsList = Array.from(combinedEventsMap.values());

  // Extract just the event name (remove date prefix)
  const getEventName = (event: CalendarEvent) => {
    const dateMatch = event.date.match(/\d+(st|nd|rd|th)\s*-\s*(.+)/);
    if (dateMatch) {
      return dateMatch[2];
    }
    return event.event.replace(event.date, '').trim() || event.event;
  };

  const handleGenerateCampaigns = async () => {
    if (isGenerating) return;

    setIsGenerating(true);
    setCampaignIdeas([]);
    
    try {
      const serializableEvents = allEvents
        .filter(e => e.type === 'daily' || e.type === 'promotional')
        .map(event => ({
          date: event.date || '',
          event: event.event || '',
          type: event.type || 'daily',
        }));

      const serializableHighlightedDates = allEvents
        .filter(e => e.type === 'highlighted')
        .map(event => ({
          date: event.date || '',
          event: event.event || '',
          type: event.type || 'highlighted',
        }));

      const requestBody = JSON.stringify({
        month: monthName,
        themes: Array.isArray(monthData.themes) ? monthData.themes : [],
        events: serializableEvents,
        highlightedDates: serializableHighlightedDates,
      });

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);
      
      const response = await fetch('/api/generate-campaign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: requestBody,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        let errorData = {};
        try {
          errorData = await response.json();
        } catch {
          // If response isn't JSON, use status text
        }
        throw new Error(errorData.error || `Failed to generate campaigns: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      if (data && Array.isArray(data.campaigns)) {
        setCampaignIdeas(data.campaigns);
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (error: any) {
      console.error('Error generating campaigns:', error);
      
      let errorMessage = 'Failed to generate campaign ideas. Please check your OpenAI API key configuration and try again.';
      
      if (error.name === 'AbortError') {
        errorMessage = 'Request timed out. The AI is taking too long to respond. Please try again.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setCampaignIdeas([{
        title: 'Error',
        description: errorMessage,
        channels: [],
      }]);
    } finally {
      setIsGenerating(false);
    }
  };

  // Create calendar grid with empty cells for days before month starts
  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i);
  }

  return (
    <div className="w-full space-y-6">
      {/* Hero Section with Image and Month Name */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="relative h-64 sm:h-80 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center overflow-hidden">
          {!imageError ? (
            <img
              src={imagePath}
              alt={`${monthName} promotional image`}
              className="w-full h-full object-cover"
              style={{ objectPosition: getHeroObjectPosition(monthName) }}
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
        
        {/* Export & Share Button */}
        <div className="p-6 border-t border-gray-100 flex justify-end">
          <button className="text-sm text-gray-600 hover:text-gray-900 font-medium px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            Export & Share
          </button>
        </div>

        {/* Monthly Themes */}
        {monthData.themes.length > 0 && (
          <div className="px-6 pb-6 border-t border-gray-100">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 pt-6">Monthly Themes</h3>
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

      {/* Campaign Ideas Section - placed above Calendar View */}
      <CampaignSection
        month={monthName}
        campaigns={campaignIdeas}
        isGenerating={isGenerating}
        onGenerate={handleGenerateCampaigns}
      />

      {/* Calendar Grid - Modern Card Design */}
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <div className="flex items-center justify-between mb-4 gap-4">
          <h3 className="text-2xl font-bold text-gray-900">Calendar View</h3>

          {/* Calendar View Legend - matches Event Type Legend styling but with circles */}
          <div className="hidden sm:block">
            <div className="px-4 py-2 bg-gray-50 rounded-lg">
              <h4 className="text-xs font-semibold text-gray-700 mb-2">
                Event Type Legend:
              </h4>
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full bg-yellow-200 border-2 border-yellow-300"></span>
                  <span className="text-xs text-gray-700">
                    <span className="font-semibold">Yellow</span> = Highlighted (major holidays)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full bg-green-200 border-2 border-green-300"></span>
                  <span className="text-xs text-gray-700">
                    <span className="font-semibold">Green</span> = Promotional (marketing opportunities)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full bg-purple-200 border-2 border-purple-300"></span>
                  <span className="text-xs text-gray-700">
                    <span className="font-semibold">Purple</span> = Daily (fun/unofficial holidays)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-2 mb-4">
          {/* Day headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center font-bold text-gray-500 text-xs sm:text-sm py-2">
              {day}
            </div>
          ))}

          {/* Calendar days */}
          {calendarDays.map((day, index) => {
            if (day === null) {
              return <div key={`empty-${index}`} className="min-h-20 sm:min-h-24"></div>;
            }

            const dayEvents = eventsByDay.get(day) || [];
            return (
              <div
                key={day}
                className={`
                  min-h-20 sm:min-h-24 p-2 rounded-xl border-2 transition-all duration-200
                  ${dayEvents.length > 0
                    ? 'bg-white border-gray-200 cursor-pointer hover:shadow-md'
                    : 'bg-white border-gray-200 hover:border-gray-300'
                  }
                `}
                onClick={() => {
                  if (dayEvents.length > 0) {
                    // Show first event when clicking on day
                    setSelectedEvent(dayEvents[0]);
                  }
                }}
              >
                <div className={`font-bold text-sm mb-1 ${dayEvents.length > 0 ? 'text-gray-900' : 'text-gray-500'}`}>
                  {day}
                </div>
                <div className="space-y-1">
                  {dayEvents.slice(0, 2).map((combined, idx) => {
                    const event = combined.event;
                    const types = combined.types;

                    const isHighlighted = types.includes('highlighted');
                    const isPromotional = types.includes('promotional');
                    const isDaily = types.includes('daily');

                    return (
                    <div
                      key={idx}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedEvent(event);
                      }}
                      className={`
                        text-xs p-1.5 rounded-lg font-medium truncate shadow-sm hover:shadow-md transition-shadow
                        bg-white/70 border border-gray-200
                      `}
                      title={getEventName(event)}
                    >
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate text-gray-800">
                            {getEventName(event).length > 18
                              ? getEventName(event).substring(0, 18) + '...'
                              : getEventName(event)}
                          </span>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {isHighlighted && (
                              <span
                                className="w-2.5 h-2.5 rounded-full bg-yellow-400 border border-yellow-500"
                                aria-label="Highlighted"
                              ></span>
                            )}
                            {isPromotional && (
                              <span
                                className="w-2.5 h-2.5 rounded-full bg-green-400 border border-green-500"
                                aria-label="Promotional"
                              ></span>
                            )}
                            {isDaily && (
                              <span
                                className="w-2.5 h-2.5 rounded-full bg-purple-400 border border-purple-500"
                                aria-label="Daily"
                              ></span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {dayEvents.length > 2 && (
                    <div 
                      className="text-xs text-gray-500 font-semibold cursor-pointer hover:text-gray-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (dayEvents.length > 0) {
                          setSelectedEvent(dayEvents[0]);
                        }
                      }}
                    >
                      +{dayEvents.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Event List - Card Design */}
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-bold text-gray-900">All Events for {monthName}</h3>
          <button
            onClick={() => setIsEventsListExpanded(!isEventsListExpanded)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <span className="text-sm font-medium">
              {isEventsListExpanded ? 'Collapse' : 'Expand'}
            </span>
            <svg 
              className={`w-5 h-5 transition-transform ${isEventsListExpanded ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* Legend */}
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Event Type Legend:</h4>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-yellow-200 border-2 border-yellow-300"></div>
              <span className="text-sm text-gray-700">
                <span className="font-semibold">Yellow</span> = Highlighted (major holidays)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-200 border-2 border-green-300"></div>
              <span className="text-sm text-gray-700">
                <span className="font-semibold">Green</span> = Promotional (marketing opportunities)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-purple-200 border-2 border-purple-300"></div>
              <span className="text-sm text-gray-700">
                <span className="font-semibold">Purple</span> = Daily (fun/unofficial holidays)
              </span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-4 flex flex-wrap gap-2">
          <button
            onClick={() => setEventFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              eventFilter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Events
          </button>
          <button
            onClick={() => setEventFilter('highlighted')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              eventFilter === 'highlighted'
                ? 'bg-yellow-500 text-white'
                : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
            }`}
          >
            Highlighted
          </button>
          <button
            onClick={() => setEventFilter('promotional')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              eventFilter === 'promotional'
                ? 'bg-green-500 text-white'
                : 'bg-green-100 text-green-800 hover:bg-green-200'
            }`}
          >
            Promotional
          </button>
          <button
            onClick={() => setEventFilter('daily')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              eventFilter === 'daily'
                ? 'bg-purple-500 text-white'
                : 'bg-purple-100 text-purple-800 hover:bg-purple-200'
            }`}
          >
            Daily
          </button>
        </div>

        {/* Events Grid - Collapsible */}
        {isEventsListExpanded && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {combinedEventsList
              .filter(({ types }) => eventFilter === 'all' || types.includes(eventFilter))
              .map(({ event, types }, index) => {
                const isHighlighted = types.includes('highlighted');
                const isPromotional = types.includes('promotional');
                const isDaily = types.includes('daily');

                return (
                  <div
                    key={index}
                    onClick={() => setSelectedEvent(event)}
                    className="p-4 rounded-xl border border-gray-200 bg-white transition-all duration-200 hover:shadow-lg hover:scale-105 cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-gray-900 text-sm mb-1">{event.date}</div>
                        <div className="text-gray-700 text-sm">
                          {getEventName(event)}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <div className="flex items-center gap-1">
                          {isHighlighted && (
                            <span
                              className="w-3.5 h-3.5 rounded-sm bg-yellow-400 border border-yellow-500"
                              aria-label="Highlighted"
                            ></span>
                          )}
                          {isPromotional && (
                            <span
                              className="w-3.5 h-3.5 rounded-sm bg-green-400 border border-green-500"
                              aria-label="Promotional"
                            ></span>
                          )}
                          {isDaily && (
                            <span
                              className="w-3.5 h-3.5 rounded-sm bg-purple-400 border border-purple-500"
                              aria-label="Daily"
                            ></span>
                          )}
                        </div>
                        <span className="text-[10px] uppercase tracking-wide text-gray-500">
                          {types
                            .map(t =>
                              t === 'highlighted'
                                ? 'Highlight'
                                : t === 'promotional'
                                ? 'Promo'
                                : 'Daily',
                            )
                            .join(' • ')}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            {combinedEventsList.filter(({ types }) => eventFilter === 'all' || types.includes(eventFilter)).length === 0 && (
              <div className="col-span-full text-center py-8 text-gray-500">
                No events found for the selected filter.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </div>
  );
}
