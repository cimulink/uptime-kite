import { db } from './db'
import { AlertIntegration, AlertType } from '@prisma/client'

// Create a new alert integration
export async function createAlertIntegration(alertData: {
  userId: string
  type: AlertType
  target: string
}): Promise<AlertIntegration> {
  return await db.alertIntegration.create({
    data: {
      user_id: alertData.userId,
      type: alertData.type,
      target: alertData.target,
    },
  })
}

// Get all alert integrations for a user
export async function getAlertIntegrationsByUserId(userId: string): Promise<AlertIntegration[]> {
  return await db.alertIntegration.findMany({
    where: {
      user_id: userId,
    },
  })
}

// Get an alert integration by ID
export async function getAlertIntegrationById(alertId: string): Promise<AlertIntegration | null> {
  return await db.alertIntegration.findUnique({
    where: {
      id: alertId,
    },
  })
}

// Update an alert integration's verification status
export async function verifyAlertIntegration(alertId: string): Promise<AlertIntegration> {
  return await db.alertIntegration.update({
    where: {
      id: alertId,
    },
    data: {
      is_verified: true,
    },
  })
}

// Delete an alert integration
export async function deleteAlertIntegration(alertId: string): Promise<AlertIntegration> {
  return await db.alertIntegration.delete({
    where: {
      id: alertId,
    },
  })
}
