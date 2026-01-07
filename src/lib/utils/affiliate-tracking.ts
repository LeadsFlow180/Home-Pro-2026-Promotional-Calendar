/**
 * Affiliate tracking utility for LeadsFlow affiliate manager
 */

export interface UserTrackingData {
  firstName: string;
  lastName: string;
  email: string;
  uid?: string; // Stripe customer ID (optional)
}

/**
 * Track a lead with the affiliate manager
 * This function can be called from both server and client side
 */
export function trackLead(userData: UserTrackingData): Promise<void> {
  return new Promise((resolve, reject) => {
    // Check if we're in the browser
    if (typeof window === "undefined") {
      console.log("Affiliate tracking: Not in browser, skipping");
      resolve();
      return;
    }

    // Check if affiliate manager is loaded
    if (typeof (window as any).affiliateManager === "undefined") {
      console.warn("Affiliate Manager not loaded yet, retrying...");
      // Retry after a short delay
      setTimeout(() => {
        trackLead(userData).then(resolve).catch(reject);
      }, 500);
      return;
    }

    try {
      // Parse full name into first and last name
      const nameParts = userData.firstName.split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || userData.lastName || "";

      (window as any).affiliateManager.trackLead(
        {
          firstName: firstName,
          lastName: lastName,
          email: userData.email,
          uid: userData.uid || "", // Stripe customer ID if available
        },
        function () {
          console.log("Lead created successfully in affiliate manager");
          resolve();
        }
      );
    } catch (error) {
      console.error("Error tracking lead:", error);
      reject(error);
    }
  });
}

/**
 * Parse a full name into firstName and lastName
 */
export function parseFullName(fullName: string): {
  firstName: string;
  lastName: string;
} {
  const nameParts = fullName.trim().split(" ");
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ") || "";

  return { firstName, lastName };
}
