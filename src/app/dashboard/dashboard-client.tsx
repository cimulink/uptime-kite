"use client"

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { SessionProvider } from 'next-auth/react'
import MonitorModal from './monitor-modal'
import { Monitor, MonitorStatus, MonitorType } from '@prisma/client'

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
  const [monitors, setMonitors] = useState<Monitor[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingMonitor, setEditingMonitor] = useState<Monitor | null>(null)
  const [monitorsLoading, setMonitorsLoading] = useState(false)

  useEffect(() => {
    // Redirect to signin if not authenticated
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (status === 'authenticated') {
      setLoading(false)
      fetchMonitors()
    }
  }, [status, router])

  const fetchMonitors = async () => {
    setMonitorsLoading(true)
    try {
      const response = await fetch('/api/monitors')
      if (response.ok) {
        const data = await response.json()
        setMonitors(data)
      } else {
        console.error('Failed to fetch monitors')
      }
    } catch (error) {
      console.error('Error fetching monitors:', error)
    } finally {
      setMonitorsLoading(false)
    }
  }

  const handleCreateMonitor = async (monitorData: {
    name: string
    type: MonitorType
    target: string
    intervalSeconds: number
  }) => {
    try {
      const response = await fetch('/api/monitors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(monitorData),
      })

      if (response.ok) {
        const newMonitor = await response.json()
        setMonitors([newMonitor, ...monitors])
      } else {
        console.error('Failed to create monitor')
      }
    } catch (error) {
      console.error('Error creating monitor:', error)
    }
  }

  const handleUpdateMonitor = async (monitorData: {
    name: string
    type: MonitorType
    target: string
    intervalSeconds: number
  }) => {
    if (!editingMonitor) return

    try {
      const response = await fetch(`/api/monitors/${editingMonitor.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(monitorData),
      })

      if (response.ok) {
        const updatedMonitor = await response.json()
        setMonitors(monitors.map(m => m.id === updatedMonitor.id ? updatedMonitor : m))
        setEditingMonitor(null)
      } else {
        console.error('Failed to update monitor')
      }
    } catch (error) {
      console.error('Error updating monitor:', error)
    }
  }

  const handleUpdateMonitorStatus = async (monitorId: string, status: MonitorStatus) => {
    try {
      const response = await fetch(`/api/monitors/${monitorId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        const updatedMonitor = await response.json()
        setMonitors(monitors.map(m => m.id === updatedMonitor.id ? updatedMonitor : m))
      } else {
        console.error('Failed to update monitor status')
      }
    } catch (error) {
      console.error('Error updating monitor status:', error)
    }
  }

  const handleDeleteMonitor = async (monitorId: string) => {
    if (!confirm('Are you sure you want to delete this monitor?')) return

    try {
      const response = await fetch(`/api/monitors/${monitorId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setMonitors(monitors.filter(m => m.id !== monitorId))
      } else {
        console.error('Failed to delete monitor')
      }
    } catch (error) {
      console.error('Error deleting monitor:', error)
    }
  }

  const handleEditMonitor = (monitor: Monitor) => {
    setEditingMonitor(monitor)
    setIsModalOpen(true)
  }

  const handleModalSubmit = async (monitorData: {
    name: string
    type: MonitorType
    target: string
    intervalSeconds: number
  }) => {
    if (editingMonitor) {
      await handleUpdateMonitor(monitorData)
    } else {
      await handleCreateMonitor(monitorData)
    }
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingMonitor(null)
  }

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
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Monitors</h2>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Add Monitor
            </button>
          </div>

          {monitorsLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
          ) : monitors.length === 0 ? (
            <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex items-center justify-center">
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No monitors yet</h3>
                <p className="text-gray-500 mb-4">Get started by adding your first monitor</p>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Add Your First Monitor
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {monitors.map((monitor) => (
                  <li key={monitor.id}>
                    <div className="px-4 py-4 flex items-center sm:px-6">
                      <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                        <div className="truncate">
                          <div className="flex text-sm">
                            <p className="font-medium text-blue-600 truncate">{monitor.name}</p>
                            <p className="ml-1 flex-shrink-0 font-normal text-gray-500">
                              ({monitor.type.toUpperCase()})
                            </p>
                          </div>
                          <div className="mt-2 flex">
                            <div className="flex items-center text-sm text-gray-500">
                              <span className="truncate">{monitor.target}</span>
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 flex-shrink-0 sm:mt-0 sm:ml-5">
                          <div className="flex items-center">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              monitor.status === MonitorStatus.up 
                                ? 'bg-green-100 text-green-800' 
                                : monitor.status === MonitorStatus.down 
                                ? 'bg-red-100 text-red-800' 
                                : monitor.status === MonitorStatus.paused
                                ? 'bg-gray-100 text-gray-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {monitor.status}
                            </span>
                            <span className="ml-2 text-sm text-gray-500">
                              {Math.round(monitor.interval_seconds / 60)}m
                            </span>
                          </div>
                          <div className="mt-2">
                            {monitor.status === MonitorStatus.paused ? (
                              <button
                                onClick={() => handleUpdateMonitorStatus(monitor.id, MonitorStatus.pending)}
                                className="text-xs text-blue-600 hover:text-blue-900"
                              >
                                Resume
                              </button>
                            ) : (
                              <button
                                onClick={() => handleUpdateMonitorStatus(monitor.id, MonitorStatus.paused)}
                                className="text-xs text-gray-600 hover:text-gray-900"
                              >
                                Pause
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="ml-5 flex-shrink-0 flex space-x-2">
                        <button
                          onClick={() => handleEditMonitor(monitor)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteMonitor(monitor.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </main>

      <MonitorModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={handleModalSubmit}
        initialData={editingMonitor ? {
          id: editingMonitor.id,
          name: editingMonitor.name,
          type: editingMonitor.type,
          target: editingMonitor.target,
          intervalSeconds: editingMonitor.interval_seconds
        } : undefined}
      />
    </div>
  )
}
