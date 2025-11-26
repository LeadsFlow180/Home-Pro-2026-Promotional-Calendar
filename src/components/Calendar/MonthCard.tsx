'use client';

import { MonthlyData, CalendarEvent } from '@/types/calendar';
import { parseDayFromDate, formatMonthName, getMonthImagePath } from '@/lib/utils/calendar-data';
import { useState, useEffect } from 'react';
import CampaignModal from './CampaignModal';

interface MonthCardProps {
  monthData: MonthlyData;
  promotionalEvents: CalendarEvent[];
  isCompact?: boolean;
}

interface CampaignIdea {
  title: string;
  description: string;
  channels: string[];
  targetDate?: string | null;
}

export default function MonthCard({ monthData, promotionalEvents, isCompact = false }: MonthCardProps) {
  const monthName = formatMonthName(monthData.month);
  const imagePath = monthData.imagePath || getMonthImagePath(monthData.month);
  const [imageError, setImageError] = useState(false);
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [campaignIdeas, setCampaignIdeas] = useState<CampaignIdea[]>([]);
  
  useEffect(() => {
    setImageError(false);
  }, [monthData.month]);
  
  // Helper function to create a unique key for an event
  const getEventKey = (event: CalendarEvent) => {
    // Normalize the date and event name for comparison
    const normalizedDate = event.date.toLowerCase().trim();
    const normalizedEvent = event.event.toLowerCase().trim();
    return `${normalizedDate}|${normalizedEvent}`;
  };

  // Separate events by type and deduplicate
  const highlightedEventsMap = new Map<string, CalendarEvent>();
  
  // Add highlighted dates from monthData
  monthData.highlightedDates.forEach(event => {
    highlightedEventsMap.set(getEventKey(event), event);
  });
  
  // Add highlighted events from promotionalEvents (2026 data)
  promotionalEvents
    .filter(e => e.type === 'highlighted')
    .forEach(event => {
      if (!highlightedEventsMap.has(getEventKey(event))) {
        highlightedEventsMap.set(getEventKey(event), event);
      }
    });
  
  const highlightedEvents = Array.from(highlightedEventsMap.values());
  
  // Deduplicate daily events
  const dailyEventsMap = new Map<string, CalendarEvent>();
  
  // Add events from monthData (2024 data)
  monthData.events.forEach(event => {
    dailyEventsMap.set(getEventKey(event), event);
  });
  
  // Add promotional events from 2026 data (only if not already present)
  promotionalEvents
    .filter(e => e.type === 'daily' || e.type === 'promotional')
    .forEach(event => {
      if (!dailyEventsMap.has(getEventKey(event))) {
        dailyEventsMap.set(getEventKey(event), event);
      }
    });
  
  const dailyEvents = Array.from(dailyEventsMap.values()).sort((a, b) => {
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

  const handleGenerateCampaigns = async () => {
    setIsGenerating(true);
    setShowCampaignModal(true);
    
    try {
      const response = await fetch('/api/generate-campaign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          month: monthName,
          themes: monthData.themes,
          events: dailyEvents,
          highlightedDates: highlightedEvents,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to generate campaigns: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      setCampaignIdeas(data.campaigns || []);
    } catch (error: any) {
      console.error('Error generating campaigns:', error);
      setCampaignIdeas([{
        title: 'Error',
        description: error.message || 'Failed to generate campaign ideas. Please check your OpenAI API key configuration and try again.',
        channels: [],
      }]);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow duration-200">
      {/* Month Image */}
      <div className="relative h-48 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
        {!imageError && imagePath ? (
          <img
            src={imagePath}
            alt={`${monthName} promotional image`}
            className="w-full h-full object-cover"
            style={{ objectPosition: monthName === 'June' ? 'center 30%' : 'center center' }}
            onError={() => setImageError(true)}
            onLoad={() => setImageError(false)}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-white/80">
              <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
              <p className="text-sm font-semibold">{monthName}</p>
            </div>
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white">{monthName}</h3>
            <button className="text-xs text-white/80 hover:text-white underline">
              Export & Share
            </button>
          </div>
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
        <button 
          onClick={handleGenerateCampaigns}
          disabled={isGenerating}
          className="w-full mt-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              Generating...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
              Generate AI Campaign Ideas
            </>
          )}
        </button>
      </div>

      {/* Campaign Modal */}
      {showCampaignModal && (
        <CampaignModal
          month={monthName}
          campaigns={campaignIdeas}
          isGenerating={isGenerating}
          onClose={() => setShowCampaignModal(false)}
        />
      )}
    </div>
  );
}

