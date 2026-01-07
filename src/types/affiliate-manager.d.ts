// Type definitions for affiliate manager
interface AffiliateManager {
  trackLead: (
    data: {
      firstName: string;
      lastName: string;
      email: string;
      uid: string;
    },
    callback: () => void
  ) => void;
  init: (key: string, backend: string, domain: string) => void;
}

interface Window {
  affiliateManager: AffiliateManager;
}
