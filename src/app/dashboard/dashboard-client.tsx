"use client"

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { SessionProvider } from 'next-auth/react'

export function DashboardClient() {
  return (
    <SessionProvider>
      <DashboardContent />
    </SessionProvider>
  )
}

function DashboardContent() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Redirect to signin if not authenticated
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (status === 'authenticated') {
      setLoading(false)
    }
  }, [status, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-gray-900">UptimeKite</h1>
              </div>
            </div>
            <div className="flex items-center">
              <div className="ml-3 relative">
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-700">
                    Welcome, {session?.user?.name}
                  </span>
                  <button
                    onClick={() => signOut({ callbackUrl: '/auth/signin' })}
                    className="text-sm text-gray-700 hover:text-gray-900"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Welcome to your Dashboard
              </h2>
              <p className="text-gray-600">
                You are successfully logged in as {session?.user?.email}
              </p>
              <div className="mt-6">
                <p className="text-sm text-gray-500">
                  User ID: {session?.user?.id}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
