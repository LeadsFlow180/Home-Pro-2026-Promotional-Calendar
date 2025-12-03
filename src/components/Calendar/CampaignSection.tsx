"use client";

import { useState, useMemo, useCallback } from "react";
import { useSession } from "next-auth/react";
import { CalendarEvent } from "@/types/calendar";
import DoThisForMeForm from "./DoThisForMeForm";
import ServiceSelector, { SERVICES } from "./ServiceSelector";
import { useToast } from "@/components/Toast";

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
  events: CalendarEvent[];
  onGenerate: (
    serviceId: string | null,
    campaignType: "general" | "event-specific",
    selectedEvents: CalendarEvent[]
  ) => void;
  isMonthSpecific?: boolean;
}

export default function CampaignSection({
  month,
  campaigns,
  isGenerating,
  events,
  onGenerate,
  isMonthSpecific = false,
}: CampaignSectionProps) {
  const { data: session } = useSession();
  const { addToast } = useToast();
  const [expandedCampaign, setExpandedCampaign] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<string | null>(
    isMonthSpecific ? "appliance-repair" : null
  );
  const [campaignType, setCampaignType] = useState<
    "general" | "event-specific"
  >("general");
  const [selectedEvents, setSelectedEvents] = useState<CalendarEvent[]>([]);
  const [savingCampaigns, setSavingCampaigns] = useState<Set<string>>(
    new Set()
  );
  const [savedCampaigns, setSavedCampaigns] = useState<Set<string>>(new Set());

  // Extract event name helper
  const getEventName = useCallback((event: CalendarEvent) => {
    const dateMatch = event.date.match(/\d+(st|nd|rd|th)\s*-\s*(.+)/);
    if (dateMatch) {
      return dateMatch[2];
    }
    return event.event.replace(event.date, "").trim() || event.event;
  }, []);

  // Deduplicate events by date and event name
  const uniqueEvents = useMemo(() => {
    const seen = new Map<string, CalendarEvent>();
    events.forEach((event) => {
      const eventName = getEventName(event);
      const key = `${event.date}|${eventName.toLowerCase().trim()}`;
      if (!seen.has(key)) {
        seen.set(key, event);
      }
    });
    return Array.from(seen.values());
  }, [events, getEventName]);

  // Save campaign function
  const saveCampaign = async (campaign: CampaignIdea) => {
    if (!session) return;

    const campaignKey = campaign.title;
    setSavingCampaigns((prev) => new Set(prev.add(campaignKey)));

    try {
      const response = await fetch("/api/saved-campaigns", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: campaign.title,
          description: campaign.description,
          category: "Marketing Campaign",
          month: month,
          day: 1,
          year: new Date().getFullYear(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSavedCampaigns((prev) => new Set(prev.add(campaignKey)));
        addToast({
          type: "success",
          title: "Campaign Saved!",
          message: `"${campaign.title}" has been saved to your collection.`,
          duration: 6000,
          action: {
            label: "View Campaigns",
            onClick: () => (window.location.href = "/saved-campaigns"),
          },
        });
      } else if (response.status === 409) {
        setSavedCampaigns((prev) => new Set(prev.add(campaignKey)));
        addToast({
          type: "info",
          title: "Already Saved",
          message: `"${campaign.title}" is already in your collection.`,
          duration: 3000,
        });
      } else {
        throw new Error(data.error || "Failed to save campaign");
      }
    } catch (error) {
      console.error("Error saving campaign:", error);
      addToast({
        type: "error",
        title: "Save Failed",
        message: "Unable to save campaign. Please try again.",
        duration: 5000,
      });
    } finally {
      setSavingCampaigns((prev) => {
        const newSet = new Set(prev);
        newSet.delete(campaignKey);
        return newSet;
      });
    }
  };

  const handleEventToggle = (event: CalendarEvent) => {
    const isSelected = selectedEvents.some(
      (e) => e.date === event.date && e.event === event.event
    );
    if (isSelected) {
      setSelectedEvents(
        selectedEvents.filter(
          (e) => !(e.date === event.date && e.event === event.event)
        )
      );
    } else {
      if (selectedEvents.length < 4) {
        setSelectedEvents([...selectedEvents, event]);
      }
    }
  };

  const handleGenerate = () => {
    if (campaignType === "event-specific" && selectedEvents.length === 0) {
      alert("Please select at least one event for event-specific campaigns.");
      return;
    }
    onGenerate(
      selectedService,
      campaignType,
      campaignType === "event-specific" ? selectedEvents : []
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-gray-900">
          AI Campaign Ideas for {month}
        </h3>
        {campaigns.length === 0 && !isGenerating && (
          <button
            onClick={handleGenerate}
            disabled={
              isGenerating ||
              (campaignType === "event-specific" && selectedEvents.length === 0)
            }
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors duration-200 flex items-center gap-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
              />
            </svg>
            Generate Ideas
          </button>
        )}
      </div>

      {campaigns.length === 0 && !isGenerating && (
        <div className="space-y-6 mb-6">
          {/* Service Selector */}
          <ServiceSelector
            selectedService={selectedService}
            onServiceSelect={setSelectedService}
            isMonthSpecific={isMonthSpecific}
          />

          {/* Campaign Type Toggle */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Campaign Type
            </label>
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setCampaignType("general");
                  setSelectedEvents([]);
                }}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  campaignType === "general"
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                6 General Campaigns
              </button>
              <button
                onClick={() => setCampaignType("event-specific")}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  campaignType === "event-specific"
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Event-Specific Campaigns
              </button>
            </div>
          </div>

          {/* Event Selection (only for event-specific) */}
          {campaignType === "event-specific" && (
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Select Events (up to 4)
                {selectedEvents.length > 0 && (
                  <span className="ml-2 text-blue-600">
                    ({selectedEvents.length}/4 selected)
                  </span>
                )}
              </label>
              <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-3 bg-gray-50">
                {uniqueEvents.length === 0 ? (
                  <p className="text-gray-500 text-sm">
                    No events available for this month.
                  </p>
                ) : (
                  <div className="grid gap-2">
                    {uniqueEvents.map((event, index) => {
                      const isSelected = selectedEvents.some(
                        (e) => e.date === event.date && e.event === event.event
                      );
                      return (
                        <button
                          key={index}
                          onClick={() => handleEventToggle(event)}
                          disabled={!isSelected && selectedEvents.length >= 4}
                          className={`p-3 rounded-lg text-left transition-colors ${
                            isSelected
                              ? "bg-blue-600 text-white shadow-md"
                              : selectedEvents.length >= 4
                              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                              : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                          }`}
                        >
                          <div className="font-semibold text-sm">
                            {event.date}
                          </div>
                          <div className="text-sm">{getEventName(event)}</div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {isGenerating ? (
        <div className="py-12 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mb-4"></div>
          <p className="text-gray-600">Generating creative campaign ideas...</p>
        </div>
      ) : campaigns.length === 0 ? (
        <div className="py-12 text-center border-2 border-dashed border-gray-300 rounded-lg">
          <svg
            className="w-16 h-16 mx-auto mb-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
          <p className="text-gray-600 mb-2">No campaign ideas generated yet.</p>
          <p className="text-sm text-gray-500">
            Click "Generate Ideas" above to get started.
          </p>
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
              <p className="text-gray-700 mb-4 leading-relaxed">
                {campaign.description}
              </p>
              {campaign.channels && campaign.channels.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
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
              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 mt-3">
                {session ? (
                  <>
                    <button
                      onClick={() => saveCampaign(campaign)}
                      disabled={savingCampaigns.has(campaign.title)}
                      className={`${
                        savedCampaigns.has(campaign.title)
                          ? "bg-green-500 hover:bg-green-600"
                          : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                      } text-white font-semibold py-1 px-2 rounded text-xs shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {savingCampaigns.has(campaign.title) ? (
                        <>
                          <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Saving...
                        </>
                      ) : savedCampaigns.has(campaign.title) ? (
                        <>
                          <svg
                            className="w-3 h-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          Saved
                        </>
                      ) : (
                        <>
                          <svg
                            className="w-3 h-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12"
                            />
                          </svg>
                          Save
                        </>
                      )}
                    </button>
                    <button
                      onClick={() =>
                        setExpandedCampaign(
                          expandedCampaign === campaign.title
                            ? null
                            : campaign.title
                        )
                      }
                      className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-semibold py-1 px-2 rounded text-xs shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-1"
                    >
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                      Do This For Me
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() =>
                      setExpandedCampaign(
                        expandedCampaign === campaign.title
                          ? null
                          : campaign.title
                      )
                    }
                    className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-semibold py-1 px-2 rounded text-xs shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-1"
                  >
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                    Do This For Me
                  </button>
                )}
              </div>

              {/* Inline Form - expands below the card */}
              {expandedCampaign === campaign.title && (
                <DoThisForMeForm campaignTitle={campaign.title} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
