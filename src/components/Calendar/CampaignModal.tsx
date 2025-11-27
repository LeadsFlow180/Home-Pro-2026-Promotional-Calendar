'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';

interface CampaignIdea {
  title: string;
  description: string;
  channels: string[];
  targetDate?: string | null;
}

interface CampaignModalProps {
  month: string;
  campaigns: CampaignIdea[];
  isGenerating: boolean;
  onClose: () => void;
}

export default function CampaignModal({ month, campaigns, isGenerating, onClose }: CampaignModalProps) {
  console.log('🎨 CampaignModal rendering - month:', month, 'isGenerating:', isGenerating, 'campaigns:', campaigns.length);
  
  // Prevent body scroll when modal is open
  useEffect(() => {
    console.log('🎨 CampaignModal useEffect - setting up modal');
    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    
    // Calculate scrollbar width to prevent layout shift
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    
    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
    
    // Prevent ESC key from closing
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isGenerating) {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    
    return () => {
      console.log('🎨 CampaignModal cleanup');
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose, isGenerating]);

  // Only render portal on client side
  if (typeof window === 'undefined') {
    console.log('⚠️ CampaignModal - window is undefined, returning null');
    return null;
  }

  if (!document.body) {
    console.error('❌ CampaignModal - document.body is not available');
    return null;
  }

  console.log('✅ CampaignModal - creating portal to document.body');
  
  const modalContent = (
    <div 
      className="fixed inset-0 overflow-y-auto" 
      aria-labelledby="modal-title" 
      role="dialog" 
      aria-modal="true"
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)'
      }}
      onClick={(e) => {
        // Close modal when clicking the backdrop
        if (e.target === e.currentTarget && !isGenerating) {
          onClose();
        }
      }}
    >
      <div className="relative w-full max-w-4xl mx-auto my-8 px-4">
        {/* Modal panel */}
        <div 
          className="bg-white rounded-lg shadow-xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'relative',
            zIndex: 100000,
            maxHeight: '90vh',
            overflowY: 'auto'
          }}
        >
          <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-gray-900">
                AI Campaign Ideas for {month}
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {isGenerating ? (
              <div className="py-12 text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mb-4"></div>
                <p className="text-gray-600">Generating creative campaign ideas...</p>
              </div>
            ) : campaigns.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-gray-600">No campaign ideas generated yet.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {campaigns.map((campaign, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-lg font-semibold text-gray-900">
                        {campaign.title}
                      </h4>
                      {campaign.targetDate && (
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {campaign.targetDate}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-700 mb-3">{campaign.description}</p>
                    {campaign.channels && campaign.channels.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {campaign.channels.map((channel, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium"
                          >
                            {channel}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={onClose}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Render modal using portal to body to avoid z-index and rendering issues
  return createPortal(modalContent, document.body);
}

