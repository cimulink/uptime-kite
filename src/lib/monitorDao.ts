import { db } from './db'
import { Monitor, MonitorStatus, MonitorType } from '@prisma/client'

// Create a new monitor
export async function createMonitor(monitorData: {
  userId: string
  name: string
  type: MonitorType
  target: string
  intervalSeconds: number
}): Promise<Monitor> {
  return await db.monitor.create({
    data: {
      user_id: monitorData.userId,
      name: monitorData.name,
      type: monitorData.type,
      target: monitorData.target,
      interval_seconds: monitorData.intervalSeconds,
      status: MonitorStatus.pending,
    },
  })
}

// Get all monitors for a user
export async function getMonitorsByUserId(userId: string): Promise<Monitor[]> {
  return await db.monitor.findMany({
    where: {
      user_id: userId,
    },
    orderBy: {
      created_at: 'desc',
    },
  })
}

// Get a monitor by ID
export async function getMonitorById(monitorId: string): Promise<Monitor | null> {
  return await db.monitor.findUnique({
    where: {
      id: monitorId,
    },
  })
}

// Update a monitor's status
export async function updateMonitorStatus(
  monitorId: string,
  status: MonitorStatus
): Promise<Monitor> {
  return await db.monitor.update({
    where: {
      id: monitorId,
    },
    data: {
      status: status,
    },
  })
}

// Update a monitor
export async function updateMonitor(
  monitorId: string,
  monitorData: {
    name?: string
    type?: MonitorType
    target?: string
    intervalSeconds?: number
    status?: MonitorStatus
    lastCheckedAt?: Date
  }
): Promise<Monitor> {
  return await db.monitor.update({
    where: {
      id: monitorId,
    },
    data: {
      name: monitorData.name,
      type: monitorData.type,
      target: monitorData.target,
      interval_seconds: monitorData.intervalSeconds,
      status: monitorData.status,
      last_checked_at: monitorData.lastCheckedAt,
    },
  })
}

// Delete a monitor
export async function deleteMonitor(monitorId: string): Promise<Monitor> {
  return await db.monitor.delete({
    where: {
      id: monitorId,
    },
  })
}
