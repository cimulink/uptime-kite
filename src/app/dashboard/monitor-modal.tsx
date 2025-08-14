"use client"

import { useState } from 'react'
import { MonitorType } from '@prisma/client'

interface MonitorModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (monitorData: {
    name: string
    type: MonitorType
    target: string
    intervalSeconds: number
  }) => void
  initialData?: {
    id?: string
    name: string
    type: MonitorType
    target: string
    intervalSeconds: number
  }
}

export default function MonitorModal({ 
  isOpen, 
  onClose, 
  onSubmit,
  initialData 
}: MonitorModalProps) {
  const [name, setName] = useState(initialData?.name || '')
  const [type, setType] = useState<MonitorType>(initialData?.type || MonitorType.http)
  const [target, setTarget] = useState(initialData?.target || '')
  const [intervalMinutes, setIntervalMinutes] = useState(initialData?.intervalSeconds ? Math.round(initialData.intervalSeconds / 60) : 1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      await onSubmit({
        name,
        type,
        target,
        intervalSeconds: intervalMinutes * 60
      })
      
      // Reset form
      setName('')
      setType(MonitorType.http)
      setTarget('')
      setIntervalMinutes(1)
      onClose()
    } catch (error) {
      console.error('Error submitting monitor:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            {initialData?.id ? 'Edit Monitor' : 'Add New Monitor'}
          </h3>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-4 space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                required
              />
            </div>
            
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                Type
              </label>
              <select
                id="type"
                value={type}
                onChange={(e) => setType(e.target.value as MonitorType)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
              >
                <option value={MonitorType.http}>HTTP</option>
                <option value={MonitorType.cron}>Cron</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="target" className="block text-sm font-medium text-gray-700">
                Target URL
              </label>
              <input
                type="text"
                id="target"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                placeholder="https://example.com"
                required
              />
            </div>
            
            <div>
              <label htmlFor="interval" className="block text-sm font-medium text-gray-700">
                Check Interval (minutes)
              </label>
              <input
                type="number"
                id="interval"
                value={intervalMinutes}
                onChange={(e) => setIntervalMinutes(Number(e.target.value))}
                min="1"
                step="1"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                required
              />
              <p className="mt-1 text-sm text-gray-500">
                Minimum interval is 1 minute
              </p>
            </div>
          </div>
          
          <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : initialData?.id ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
