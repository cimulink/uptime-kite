import { db } from './db'
import { CheckResult } from '@prisma/client'

// Create a new check result
export async function createCheckResult(checkData: {
  monitorId: string
  statusCode?: number
  responseTimeMs?: number
  wasSuccessful: boolean
  errorMessage?: string
}): Promise<CheckResult> {
  return await db.checkResult.create({
    data: {
      monitor_id: checkData.monitorId,
      status_code: checkData.statusCode,
      response_time_ms: checkData.responseTimeMs,
      was_successful: checkData.wasSuccessful,
      error_message: checkData.errorMessage,
    },
  })
}

// Get all check results for a monitor
export async function getCheckResultsByMonitorId(monitorId: string, limit: number = 50): Promise<CheckResult[]> {
  return await db.checkResult.findMany({
    where: {
      monitor_id: monitorId,
    },
    orderBy: {
      checked_at: 'desc',
    },
    take: limit,
  })
}

// Get a check result by ID
export async function getCheckResultById(id: bigint): Promise<CheckResult | null> {
  return await db.checkResult.findUnique({
    where: {
      id: id,
    },
  })
}

// Get recent check results for a user (across all monitors)
export async function getRecentCheckResultsByUserId(userId: string, limit: number = 100): Promise<CheckResult[]> {
  return await db.checkResult.findMany({
    where: {
      monitor: {
        user_id: userId,
      },
    },
    orderBy: {
      checked_at: 'desc',
    },
    take: limit,
    include: {
      monitor: {
        select: {
          name: true,
          target: true,
        },
      },
    },
  })
}
