'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'

interface User {
  id: string
  name: string
  email: string
  createdAt: string
  updatedAt: string
}

export default function UserDashboard() {
  const { data: session } = useSession()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/users')
        
        if (!response.ok) {
          if (response.status === 401) {
            return // User not authenticated
          }
          throw new Error('Failed to fetch user')
        }

        const data = await response.json()
        setUser(data.user)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    if (session) {
      fetchUser()
    } else {
      setLoading(false)
    }
  }, [session])

  if (!session) {
    return null
  }

  if (loading) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin mr-3"></div>
          <span className="text-green-800">Loading user data...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Error: {error}</p>
      </div>
    )
  }

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
      <div className="flex items-center">
        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <h4 className="text-green-900 font-semibold">Welcome back, {session.user?.name}!</h4>
          <p className="text-green-700 text-sm">
            You now have access to AI Campaign Ideas and "Do This For Me" services.
            {user && ` Member since ${new Date(user.createdAt).toLocaleDateString()}.`}
          </p>
        </div>
      </div>
    </div>
  )
}