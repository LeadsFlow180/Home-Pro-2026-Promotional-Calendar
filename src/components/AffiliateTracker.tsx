"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { trackLead, parseFullName } from "@/lib/utils/affiliate-tracking";

/**
 * Component to handle affiliate tracking for OAuth signups
 * This tracks users who sign up via Google OAuth
 */
export default function AffiliateTracker() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      // Check if we have a pending tracking request (from OAuth signup)
      const shouldTrack = localStorage.getItem("pendingAffiliateTracking");

      if (shouldTrack === "true") {
        // Track the user
        const { firstName, lastName } = parseFullName(
          session.user.name || ""
        );

        trackLead({
          firstName: firstName,
          lastName: lastName,
          email: session.user.email || "",
          uid: "", // Will be added when Stripe is integrated
        })
          .then(() => {
            console.log("OAuth signup tracked successfully");
            // Clear the flag
            localStorage.removeItem("pendingAffiliateTracking");
          })
          .catch((error) => {
            console.error("Failed to track OAuth signup:", error);
            // Clear the flag anyway to avoid repeated attempts
            localStorage.removeItem("pendingAffiliateTracking");
          });
      }
    }
  }, [status, session]);

  return null; // This component doesn't render anything
}
