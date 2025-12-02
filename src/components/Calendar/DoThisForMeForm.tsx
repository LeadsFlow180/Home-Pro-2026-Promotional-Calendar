"use client";

import { useEffect } from "react";

interface DoThisForMeFormProps {
  campaignTitle: string;
}

export default function DoThisForMeForm({
  campaignTitle,
}: DoThisForMeFormProps) {
  useEffect(() => {
    // Load the form embed script
    const script = document.createElement("script");
    script.src = "https://link.leadsflow180.com/js/form_embed.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Remove script on cleanup
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  return (
    <div className="mt-4 pt-4 border-t border-gray-300">
      <h5 className="text-sm font-semibold text-gray-700 mb-3">
        Do This For Me - {campaignTitle}
      </h5>
      <div
        style={{
          width: "100%",
          height: "857px",
          borderRadius: "3px",
          overflow: "hidden",
        }}
      >
        <iframe
          src="https://link.leadsflow180.com/widget/form/5rGk8UynC6zxKpg56QdQ"
          style={{
            width: "100%",
            height: "100%",
            border: "none",
            borderRadius: "3px",
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
  );
}
