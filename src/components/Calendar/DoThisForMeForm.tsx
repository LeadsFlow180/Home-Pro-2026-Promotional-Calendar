"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

interface DoThisForMeFormProps {
  campaignTitle: string;
}

interface InteractionStatus {
  hasOpened: boolean;
  hasBooked: boolean;
  firstOpenedAt?: string;
  lastOpenedAt?: string;
  bookedAt?: string;
}

export default function DoThisForMeForm({
  campaignTitle,
}: DoThisForMeFormProps) {
  const { data: session } = useSession();
  const [showDialog, setShowDialog] = useState(false);
  const [interactionStatus, setInteractionStatus] = useState<InteractionStatus>(
    {
      hasOpened: false,
      hasBooked: false,
    }
  );
  const [hasAnyOpened, setHasAnyOpened] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Fetch interaction status on component mount
  useEffect(() => {
    if (session?.user?.id) {
      fetchInteractionStatus();
      fetchGlobalStatus();
    }
  }, [session, campaignTitle]);

  const fetchInteractionStatus = async () => {
    try {
      const encodedTitle = encodeURIComponent(campaignTitle);
      const response = await fetch(`/api/do-this-for-me/${encodedTitle}`);

      if (response.ok) {
        const data = await response.json();
        setInteractionStatus(data);
      }
    } catch (error) {
      console.error("Error fetching interaction status:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGlobalStatus = async () => {
    try {
      const response = await fetch('/api/do-this-for-me/global');

      if (response.ok) {
        const data = await response.json();
        setHasAnyOpened(data.hasAnyOpened);
      }
    } catch (error) {
      console.error("Error fetching global status:", error);
    }
  };

  const updateInteraction = async (action: "opened" | "booked") => {
    if (!session?.user?.id) return;

    setUpdating(true);
    try {
      const encodedTitle = encodeURIComponent(campaignTitle);
      const response = await fetch(`/api/do-this-for-me/${encodedTitle}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action }),
      });

      if (response.ok) {
        const data = await response.json();
        setInteractionStatus(data);
      }
    } catch (error) {
      console.error("Error updating interaction:", error);
    } finally {
      setUpdating(false);
    }
  };

  const handleDoThisForMe = () => {
    setShowDialog(true);
  };

  const handleOpenBooking = () => {
    updateInteraction("opened");
    const bookingUrl =
      "https://link.leadsflow180.com/widget/booking/n3yVhlfBXDj4H87RnJUV";
    window.open(bookingUrl, "_blank", "noopener,noreferrer");
    setShowDialog(false);
  };

  const handleCancel = () => {
    setShowDialog(false);
  };

  if (loading) {
    return (
      <div className="mt-4 pt-4 border-t border-gray-300">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 pt-4 border-t border-gray-300">
      <h5 className="text-sm font-semibold text-gray-700 mb-3">
        Do This For Me - {campaignTitle}
      </h5>
      <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg p-4">
        <p className="text-sm text-gray-700 mb-4">
          Ready to turn this campaign into real results? Let our experts handle
          the implementation for you.
        </p>
        <button
          onClick={handleDoThisForMe}
          disabled={updating}
          className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105 disabled:opacity-50"
        >
          <svg
            className="w-5 h-5"
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
          {updating ? "Loading..." : "Do This For Me"}
        </button>
      </div>

      {/* Interaction Dialog */}
      {showDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-6 h-6 text-orange-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Open Booking Page{campaignTitle ? ` - ${campaignTitle}` : ""}?
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                {interactionStatus.hasBooked
                  ? "You've already booked a meeting for this campaign. Would you like to open the booking page again?"
                  : hasAnyOpened
                  ? <>You've already opened the booking page for one of your campaigns, which applies to all your promotional needs. <strong>Apply once - covers all your campaigns.</strong> Our team will contact you shortly to discuss and handle all your requirements comprehensively. <strong>Be patient for a good meeting.</strong> Would you like to open the page again?</>
                  : "Would you like to open the booking page for this campaign?"}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleCancel}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleOpenBooking}
                  disabled={updating}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                >
                  {updating ? "Opening..." : "Open Booking Page"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
