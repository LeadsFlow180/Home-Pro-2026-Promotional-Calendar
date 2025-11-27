import CalendarView from '@/components/Calendar/CalendarView';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function Home() {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-blue-600 text-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold">
                    2026 Promotional Calendar
                  </h1>
                  <p className="text-blue-100 text-sm sm:text-base mt-1">
                    Plan your marketing campaigns with confidence. Discover the best promotional opportunities throughout the year.
                  </p>
                </div>
              </div>
              <button className="hidden sm:block px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors">
                Sign in
              </button>
            </div>
          </div>
        </header>
        <main className="py-8">
          <CalendarView />
        </main>
        <footer className="bg-white border-t border-gray-200 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold text-gray-900">LEADSFLOW180</div>
                <div className="text-sm text-gray-600">THE ZEN OF LEAD GEN</div>
              </div>
              <div className="text-sm text-gray-500">
                © 2025 Dr. Home Hiker & LeadsFlow180. Powered by promotional excellence.
              </div>
            </div>
          </div>
        </footer>
      </div>
    </ErrorBoundary>
  );
}
