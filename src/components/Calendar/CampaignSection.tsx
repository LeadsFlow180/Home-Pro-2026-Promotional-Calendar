'use client';

import { CalendarEvent } from '@/types/calendar';

interface CampaignIdea {
  title: string;
  description: string;
  channels: string[];
  targetDate?: string | null;
}

interface CampaignSectionProps {
  month: string;
  campaigns: CampaignIdea[];
  isGenerating: boolean;
  onGenerate: () => void;
}

export default function CampaignSection({ month, campaigns, isGenerating, onGenerate }: CampaignSectionProps) {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-gray-900">
          AI Campaign Ideas for {month}
        </h3>
        {campaigns.length === 0 && !isGenerating && (
          <button
            onClick={onGenerate}
            disabled={isGenerating}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg transition-colors duration-200 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            Generate Ideas
          </button>
        )}
      </div>

      {isGenerating ? (
        <div className="py-12 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mb-4"></div>
          <p className="text-gray-600">Generating creative campaign ideas...</p>
        </div>
      ) : campaigns.length === 0 ? (
        <div className="py-12 text-center border-2 border-dashed border-gray-300 rounded-lg">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <p className="text-gray-600 mb-2">No campaign ideas generated yet.</p>
          <p className="text-sm text-gray-500">Click "Generate Ideas" above to get started.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {campaigns.map((campaign, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow bg-gradient-to-br from-blue-50 to-indigo-50"
            >
              <div className="flex items-start justify-between mb-3">
                <h4 className="text-lg font-semibold text-gray-900">
                  {campaign.title}
                </h4>
                {campaign.targetDate && (
                  <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded">
                    {campaign.targetDate}
                  </span>
                )}
              </div>
              <p className="text-gray-700 mb-4 leading-relaxed">{campaign.description}</p>
              {campaign.channels && campaign.channels.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {campaign.channels.map((channel, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium"
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
  );
}

