'use client'

import { useSession, signIn, signOut } from 'next-auth/react'
import { useState, useEffect, Suspense } from 'react'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

function TestAuthContent() {
  const { data: session, status } = useSession()
  const [testResult, setTestResult] = useState<string>('')

  const testDatabaseConnection = async () => {
    try {
      const response = await fetch('/api/test-db')
      const data = await response.json()
      
      if (response.ok) {
        setTestResult(`✅ Database connection successful! Users in database: ${data.userCount}`)
      } else {
        setTestResult(`❌ Database error: ${data.error}\nDetails: ${data.details}`)
      }
    } catch (error) {
      setTestResult(`❌ Connection failed: ${error}`)
    }
  }

  const testUserAPI = async () => {
    try {
      const response = await fetch('/api/users')
      const data = await response.json()
      
      if (response.ok) {
        setTestResult(`✅ User API successful! User: ${data.user.email}`)
      } else {
        setTestResult(`❌ User API error: ${data.error}`)
      }
    } catch (error) {
      setTestResult(`❌ User API failed: ${error}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Authentication Test Page</h1>
        
        <div className="bg-white rounded-lg p-6 shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">Session Status</h2>
          <p><strong>Status:</strong> {status}</p>
          {session ? (
            <div className="mt-4">
              <p><strong>User:</strong> {session.user?.name}</p>
              <p><strong>Email:</strong> {session.user?.email}</p>
              <p><strong>ID:</strong> {session.user?.id}</p>
              {session.user?.image && (
                <img src={session.user.image} alt="Profile" className="w-12 h-12 rounded-full mt-2" />
              )}
            </div>
          ) : (
            <p className="mt-4 text-gray-600">Not signed in</p>
          )}
        </div>

        <div className="bg-white rounded-lg p-6 shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">Actions</h2>
          <div className="space-y-4">
            {!session ? (
                <button
                onClick={() => window.location.href = '/auth/signin'}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Go to Sign In
              </button>
            ) : (
              <div className="space-y-2">
                <button
                  onClick={() => signOut()}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors mr-2"
                >
                  Sign out
                </button>
                <div className="space-x-2">
                  <button
                    onClick={testDatabaseConnection}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Test Database
                  </button>
                  <button
                    onClick={testUserAPI}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Test User API
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {testResult && (
          <div className="bg-white rounded-lg p-6 shadow-md">
            <h2 className="text-xl font-semibold mb-4">Test Result</h2>
            <p className="whitespace-pre-wrap">{testResult}</p>
          </div>
        )}

        <div className="mt-8 text-center">
          <a
            href="/"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            ← Back to Calendar
          </a>
        </div>
      </div>
    </div>
  )
}

export default function TestAuth() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <TestAuthContent />
    </Suspense>
  )
}