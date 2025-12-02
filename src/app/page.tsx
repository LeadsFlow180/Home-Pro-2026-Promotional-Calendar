import CalendarView from '@/components/Calendar/CalendarView';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import AuthHeader from '@/components/Calendar/AuthHeader';

//Deployment 
export default function Home() {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        <AuthHeader />
        <main className="py-8">
          <CalendarView />
        </main>
        <footer className="bg-white border-t border-gray-200 mt-3">
          <div className="max-w-7xl mx-auto px-2 sm:px-3 lg:px-4 py-[0.03125rem]">
            <div className="flex flex-col items-center gap-[0.03125rem]">
              <div className="flex items-center justify-center gap-2 flex-wrap">
                <img 
                  src="/images/Dr. HOME FIXER LOGO-02.png" 
                  alt="Dr. Home Fixer Logo" 
                  className="h-48 max-w-[400px] object-contain"
                />
                <img 
                  src="/images/LeadsFlow180 Logo.png" 
                  alt="LeadsFlow180 Logo" 
                  className="h-[33px] max-w-[400px] object-contain"
                />
              </div>
              <div className="text-sm text-gray-500 text-center">
                © 2025 <a href="https://drhomefixer.com/" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-700 underline">Dr. Home Fixer</a> & <a href="https://leadsflow180.com/" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-700 underline">LeadsFlow180</a>. Powered by promotional excellence.
              </div>
            </div>
          </div>
        </footer>
      </div>
    </ErrorBoundary>
  );
}
