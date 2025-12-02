'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function DevSignIn() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleDevSignIn = async () => {
    setIsLoading(true)
    setError('')
    
    try {
      // Create a development user directly in the database
      const response = await fetch('/api/auth/dev-signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Development User',
          email: 'dev@example.com',
          image: null,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Refresh to update session
        router.push('/')
        router.refresh()
      } else {
        setError(data.error || 'Development sign-in failed')
      }
    } catch (error) {
      setError('Network error occurred')
      console.error('Dev sign-in error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    router.push('/auth/signin')
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 relative overflow-hidden">
      <div className="relative flex flex-col justify-center py-12 sm:px-6 lg:px-8 min-h-screen">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Development Mode
          </h1>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-white/20 mb-8">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800 mb-2">
                    Google OAuth Not Configured
                  </h3>
                  <p className="text-sm text-yellow-700">
                    This is a development fallback. Configure Google OAuth credentials to enable proper authentication.
                  </p>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <button
                onClick={handleDevSignIn}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Signing in...
                  </>
                ) : (
                  'Sign In (Development Only)'
                )}
              </button>
              
              <button
                onClick={() => router.push('/')}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-3 px-6 rounded-lg transition-colors duration-200"
              >
                Back to Calendar
              </button>
            </div>
          </div>

          <div className="text-sm text-gray-600">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">To enable Google OAuth:</h4>
              <ol className="text-left space-y-1 text-blue-800">
                <li>1. Go to <a href="https://console.cloud.google.com" target="_blank" className="underline">Google Cloud Console</a></li>
                <li>2. Create a new project or select existing</li>
                <li>3. Enable Google+ API</li>
                <li>4. Create OAuth 2.0 credentials</li>
                <li>5. Add redirect URI: <code className="bg-blue-100 px-1 rounded">http://localhost:3000/api/auth/callback/google</code></li>
                <li>6. Update your .env.local with GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}