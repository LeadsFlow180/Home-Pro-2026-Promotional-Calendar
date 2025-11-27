'use client';

import { MonthlyData, CalendarEvent } from '@/types/calendar';
import { parseDayFromDate, formatMonthName, getMonthImagePath } from '@/lib/utils/calendar-data';
import { useState, useEffect } from 'react';
import CampaignModal from './CampaignModal';

interface MonthCardProps {
  monthData: MonthlyData;
  promotionalEvents: CalendarEvent[];
  isCompact?: boolean;
  onClick?: () => void;
}

interface CampaignIdea {
  title: string;
  description: string;
  channels: string[];
  targetDate?: string | null;
}

export default function MonthCard({ monthData, promotionalEvents, isCompact = false, onClick }: MonthCardProps) {
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
    console.log('🔵 Button clicked - handleGenerateCampaigns called');
    
    // Prevent multiple simultaneous requests
    if (isGenerating) {
      console.log('⚠️ Already generating, ignoring click');
      return;
    }

    console.log('✅ Starting campaign generation...');
    setIsGenerating(true);
    setShowCampaignModal(true);
    setCampaignIdeas([]); // Clear previous results
    console.log('✅ Modal state set to show');
    
    try {
      // Safely serialize events - only include serializable properties
      const serializableEvents = dailyEvents.map(event => ({
        date: event.date || '',
        event: event.event || '',
        type: event.type || 'daily',
      }));

      const serializableHighlightedDates = highlightedEvents.map(event => ({
        date: event.date || '',
        event: event.event || '',
        type: event.type || 'highlighted',
      }));

      // Validate data before stringifying
      let requestBody;
      try {
        requestBody = JSON.stringify({
          month: monthName,
          themes: Array.isArray(monthData.themes) ? monthData.themes : [],
          events: serializableEvents,
          highlightedDates: serializableHighlightedDates,
        });
      } catch (serializationError: any) {
        throw new Error(`Failed to prepare request data: ${serializationError.message}`);
      }

      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout
      
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

  return (
    <div 
      className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow duration-200 cursor-pointer"
      onClick={onClick}
    >
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
          <h3 className="text-xl font-bold text-white">{monthName}</h3>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Export & Share Button */}
        <div className="flex justify-end mb-2">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              // TODO: Implement export & share functionality
            }}
            className="text-sm text-gray-600 hover:text-gray-900 font-medium px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            Export & Share
          </button>
        </div>

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
          type="button"
          onClick={(e) => {
            console.log('🟢 Button onClick handler fired');
            e.preventDefault();
            e.stopPropagation();
            console.log('🟢 Calling handleGenerateCampaigns...');
            handleGenerateCampaigns();
          }}
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
          onClose={() => {
            console.log('🔴 Closing modal');
            setShowCampaignModal(false);
          }}
        />
      )}
    </div>
  );
}

