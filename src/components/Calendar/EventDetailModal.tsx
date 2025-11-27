'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CalendarEvent } from '@/types/calendar';
import eventDescriptions from '@/data/event-descriptions.json';

interface EventDetailModalProps {
  event: CalendarEvent | null;
  onClose: () => void;
}

export default function EventDetailModal({ event, onClose }: EventDetailModalProps) {
  useEffect(() => {
    if (!event) return;
    
    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    
    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    
    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
      document.removeEventListener('keydown', handleEscape);
    };
  }, [event, onClose]);

  if (!event) return null;

  if (typeof window === 'undefined' || !document.body) {
    return null;
  }

  // Extract event name from the event string
  const getEventName = (event: CalendarEvent): string => {
    const dateMatch = event.event.match(/\d+(st|nd|rd|th)\s*-\s*(.+)/);
    if (dateMatch) {
      return dateMatch[2].trim();
    }
    // Try to extract just the event name without date
    const parts = event.event.split('-');
    if (parts.length > 1) {
      return parts.slice(1).join('-').trim();
    }
    return event.event.replace(event.date, '').trim() || event.event;
  };

  const eventName = getEventName(event);
  
  // Try to find matching description - check various keys
  const findEventDescription = (name: string) => {
    // Try exact match first
    if (eventDescriptions[name as keyof typeof eventDescriptions]) {
      return eventDescriptions[name as keyof typeof eventDescriptions];
    }
    
    // Try partial matches
    for (const key in eventDescriptions) {
      if (name.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(name.toLowerCase())) {
        return eventDescriptions[key as keyof typeof eventDescriptions];
      }
    }
    
    // Try matching by removing common suffixes/prefixes
    const normalizedName = name.toLowerCase().replace(/\s*(day|month|week)\s*$/i, '').trim();
    for (const key in eventDescriptions) {
      const normalizedKey = key.toLowerCase().replace(/\s*(day|month|week)\s*$/i, '').trim();
      if (normalizedName === normalizedKey) {
        return eventDescriptions[key as keyof typeof eventDescriptions];
      }
    }
    
    return null;
  };

  const description = findEventDescription(eventName);

  const modalContent = (
    <div 
      className="fixed inset-0 overflow-y-auto z-50" 
      aria-labelledby="modal-title" 
      role="dialog" 
      aria-modal="true"
      style={{ 
        backgroundColor: 'rgba(0, 0, 0, 0.5)'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="relative w-full max-w-2xl mx-auto my-8 px-4">
        <div 
          className="bg-white rounded-lg shadow-xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
          style={{
            maxHeight: '90vh',
            overflowY: 'auto'
          }}
        >
          <div className="px-6 pt-6 pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-gray-900">
                {eventName}
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-4">
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                event.type === 'highlighted' 
                  ? 'bg-yellow-100 text-yellow-800' 
                  : event.type === 'promotional'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {event.type.toUpperCase()}
              </span>
              <span className="ml-3 text-gray-600 font-medium">{event.date}</span>
            </div>

            {description ? (
              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">About</h4>
                  <p className="text-gray-700 leading-relaxed">{description.description}</p>
                </div>

                {description.origin && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">History & Origin</h4>
                    <p className="text-gray-700 leading-relaxed">{description.origin}</p>
                  </div>
                )}

                {description.marketingTips && description.marketingTips.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Marketing Ideas</h4>
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                      {description.marketingTips.map((tip, index) => (
                        <li key={index}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-8 text-center">
                <p className="text-gray-600 mb-2">Information about this event is coming soon!</p>
                <p className="text-sm text-gray-500">
                  We're working on adding detailed information about "{eventName}" and how it came about.
                </p>
              </div>
            )}
          </div>

          <div className="bg-gray-50 px-6 py-4 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

