import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import AuthProvider from "@/components/AuthProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Promotional Calendar 2026 - Marketing Opportunities for Small Businesses",
  description: "Find the best times to create marketing promotions for your small business with our comprehensive promotional calendar",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        {/* Global marketing banner - shown on all pages */}
        <div className="bg-gradient-to-r from-sky-600 via-emerald-500 to-lime-400">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <a
              href="https://leadsflow180.com/leadspowerpro/"
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-transform duration-200 hover:scale-[1.01]"
            >
              <div className="bg-gradient-to-r from-sky-700/90 via-emerald-600/90 to-lime-500/90 px-6 sm:px-10 py-4 sm:py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full bg-white/10 border border-white/30">
                    <span className="text-white text-2xl">📅</span>
                  </div>
                  <div className="text-white text-left">
                    <p className="text-xs sm:text-sm font-semibold uppercase tracking-wide text-white/80">
                      For Home Service Professionals
                    </p>
                    <p className="text-base sm:text-lg md:text-xl font-bold leading-snug">
                      Turn Your Marketing Calendar into Booked Jobs
                    </p>
                    <p className="hidden sm:block text-xs sm:text-sm text-white/90 mt-1">
                      LeadsPower Pro runs your marketing, AI follow-up, and scheduling so no lead slips through.
                    </p>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center justify-center px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-lime-300 text-slate-900 text-xs sm:text-sm font-bold shadow-md border border-lime-400">
                    Book Your FREE Consultation Now →
                  </span>
                </div>
              </div>
            </a>
          </div>
        </div>

        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
