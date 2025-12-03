"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useRef } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export default function UserDashboard() {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showWelcome, setShowWelcome] = useState(false);
  const previousStatus = useRef(status);
  const hasShownWelcome = useRef(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/users");

        if (!response.ok) {
          if (response.status === 401) {
            return; // User not authenticated
          }
          throw new Error("Failed to fetch user");
        }

        const data = await response.json();
        setUser(data.user);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [session]);

  // Show welcome banner only when user just logged in
  useEffect(() => {
    const welcomeShown =
      typeof window !== "undefined" &&
      sessionStorage.getItem("dashboardWelcomeShown");

    if (
      status === "authenticated" &&
      previousStatus.current !== "authenticated" &&
      !hasShownWelcome.current &&
      !welcomeShown
    ) {
      hasShownWelcome.current = true;

      if (typeof window !== "undefined") {
        sessionStorage.setItem("dashboardWelcomeShown", "true");
      }

      setShowWelcome(true);

      // Auto-hide after 5 seconds
      const timer = setTimeout(() => {
        setShowWelcome(false);
      }, 5000);

      return () => clearTimeout(timer);
    }

    previousStatus.current = status;
  }, [status]);

  // Clear welcome flag on logout
  useEffect(() => {
    if (status === "unauthenticated" && typeof window !== "undefined") {
      sessionStorage.removeItem("dashboardWelcomeShown");
      hasShownWelcome.current = false;
      setShowWelcome(false);
    }
  }, [status]);

  if (!session) {
    return null;
  }

  if (!showWelcome) {
    return null;
  }

  if (loading) {
    return null; // Don't show loading state for welcome banner
  }

  if (error) {
    return null; // Don't show error for welcome banner
  }

  return (
    <div
      className={`bg-green-50 border border-green-200 rounded-lg p-4 mb-6 transition-all duration-500 ${
        showWelcome
          ? "opacity-100 transform translate-y-0"
          : "opacity-0 transform -translate-y-2"
      }`}
    >
      <div className="flex items-center">
        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
          <svg
            className="w-4 h-4 text-green-600"
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
        </div>
        <div className="flex-1">
          <h4 className="text-green-900 font-semibold">
            Welcome back, {session.user?.name}!
          </h4>
          <p className="text-green-700 text-sm">
            You now have access to AI Campaign Ideas and "Do This For Me"
            services.
            {user &&
              ` Member since ${new Date(user.createdAt).toLocaleDateString()}.`}
          </p>
        </div>
        <button
          onClick={() => setShowWelcome(false)}
          className="ml-2 text-green-600 hover:text-green-800 transition-colors p-1"
          aria-label="Close"
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
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
