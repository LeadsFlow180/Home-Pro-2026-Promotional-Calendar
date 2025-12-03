"use client";

import { useState, useEffect } from "react";
import {
  loadCalendarData,
  getEventsForMonth,
  getAvailableMonths,
} from "@/lib/utils/calendar-data";
import MonthCard from "./MonthCard";
import MonthView from "./MonthView";
import UserDashboard from "@/components/UserDashboard";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function CalendarView() {
  const [mounted, setMounted] = useState(false);
  const [viewMode, setViewMode] = useState<"all" | string>("all");
  const [calendarData, setCalendarData] = useState<ReturnType<
    typeof loadCalendarData
  > | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const handleReset = () => {
      setViewMode("all");
      setSearchQuery("");
    };

    if (typeof window !== "undefined") {
      window.addEventListener("resetCalendarView", handleReset);
    }

    setMounted(true);
    try {
      const data = loadCalendarData();
      setCalendarData(data);
    } catch (error) {
      console.error("Error loading calendar data:", error);
      // Keep calendarData as null to show loading/error state
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("resetCalendarView", handleReset);
      }
    };
  }, []);

  if (!mounted || !calendarData) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading calendar...</p>
        </div>
      </div>
    );
  }

  const months = getAvailableMonths(calendarData);
  const allMonthsData = calendarData.monthlyData;

  // Filter months based on view mode
  const displayMonths =
    viewMode === "all"
      ? allMonthsData
      : allMonthsData.filter(
          (m) => m.month.toLowerCase() === viewMode.toLowerCase()
        );

  // Filter by search query
  const filteredMonths = searchQuery
    ? displayMonths.filter((month) => {
        const searchLower = searchQuery.toLowerCase();
        return (
          month.month.toLowerCase().includes(searchLower) ||
          month.themes.some((theme) =>
            theme.toLowerCase().includes(searchLower)
          ) ||
          month.events.some((e) =>
            e.event.toLowerCase().includes(searchLower)
          ) ||
          month.highlightedDates.some((e) =>
            e.event.toLowerCase().includes(searchLower)
          )
        );
      })
    : displayMonths;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* User Dashboard - shown when authenticated */}
      <UserDashboard />

      {/* Search Bar - only show in "All Months" view */}
      {viewMode === "all" && (
        <div className="mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search for holidays, events, or themes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            />
          </div>
        </div>
      )}

      {/* Month Selector Tabs */}
      <div className="mb-6 bg-white rounded-xl shadow-md p-2">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setViewMode("all")}
            className={`
              px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200
              ${
                viewMode === "all"
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }
            `}
          >
            All Months
          </button>
          {MONTH_NAMES.map((month) => {
            const hasData = months.some(
              (m) => m.toLowerCase() === month.toLowerCase()
            );
            const isSelected = viewMode === month.toLowerCase();
            return (
              <button
                key={month}
                onClick={() => hasData && setViewMode(month.toLowerCase())}
                disabled={!hasData}
                className={`
                  px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200
                  ${
                    isSelected
                      ? "bg-blue-600 text-white shadow-md"
                      : hasData
                      ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      : "bg-gray-50 text-gray-400 cursor-not-allowed opacity-50"
                  }
                `}
              >
                {month}
              </button>
            );
          })}
        </div>
      </div>

      {/* Show MonthView for single month, MonthCard grid for all months */}
      {viewMode !== "all" && filteredMonths.length === 1 ? (
        <div>
          {filteredMonths.map((monthData) => {
            const monthEvents = getEventsForMonth(
              monthData.month,
              calendarData
            );
            return (
              <MonthView
                key={monthData.month}
                monthData={monthData}
                promotionalEvents={monthEvents.promotionalEvents}
              />
            );
          })}
        </div>
      ) : (
        <>
          {/* Month Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMonths.map((monthData) => {
              const monthEvents = getEventsForMonth(
                monthData.month,
                calendarData
              );
              return (
                <MonthCard
                  key={monthData.month}
                  monthData={monthData}
                  promotionalEvents={monthEvents.promotionalEvents}
                  onClick={() => setViewMode(monthData.month.toLowerCase())}
                />
              );
            })}
          </div>

          {filteredMonths.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">
                No months found matching your search.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
