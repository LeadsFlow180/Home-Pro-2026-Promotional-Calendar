'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';

interface DoThisForMeModalProps {
  campaignTitle: string;
  onClose: () => void;
}

export default function DoThisForMeModal({ campaignTitle, onClose }: DoThisForMeModalProps) {
  // Prevent body scroll when modal is open
  useEffect(() => {
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
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    
    // Load the form embed script
    const script = document.createElement('script');
    script.src = 'https://link.leadsflow180.com/js/form_embed.js';
    script.async = true;
    document.body.appendChild(script);
    
    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
      document.removeEventListener('keydown', handleEscape);
      // Remove script on cleanup
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [onClose]);

  // Only render portal on client side
  if (typeof window === 'undefined' || !document.body) {
    return null;
  }

  const modalContent = (
    <div 
      className="fixed inset-0 overflow-y-auto" 
      aria-labelledby="modal-title" 
      role="dialog" 
      aria-modal="true"
      style={{ 
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 100001
      }}
      onClick={(e) => {
        // Close modal when clicking the backdrop
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="flex min-h-full items-center justify-center p-4">
        <div 
          className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl"
          onClick={(e) => e.stopPropagation()}
          style={{
            maxHeight: '90vh',
            overflowY: 'auto'
          }}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
            <h3 className="text-xl font-bold text-gray-900">
              Do This For Me - {campaignTitle}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 transition-colors"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Form iframe */}
          <div className="p-6">
            <div style={{ width: '100%', height: '857px', borderRadius: '3px', overflow: 'hidden' }}>
              <iframe
                src="https://link.leadsflow180.com/widget/form/5rGk8UynC6zxKpg56QdQ"
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  borderRadius: '3px'
                }}
                id="inline-5rGk8UynC6zxKpg56QdQ"
                data-layout="{'id':'INLINE'}"
                data-trigger-type="alwaysShow"
                data-trigger-value=""
                data-activation-type="alwaysActivated"
                data-activation-value=""
                data-deactivation-type="neverDeactivate"
                data-deactivation-value=""
                data-form-name="Do This For Me - Promotional Calendar"
                data-height="857"
                data-layout-iframe-id="inline-5rGk8UynC6zxKpg56QdQ"
                data-form-id="5rGk8UynC6zxKpg56QdQ"
                title="Do This For Me - Promotional Calendar"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Render modal using portal to body
  return createPortal(modalContent, document.body);
}

