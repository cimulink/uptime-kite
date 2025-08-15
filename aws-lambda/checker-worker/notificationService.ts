import { Pool } from 'pg';
import { AlertType } from '@prisma/client';

// Initialize the database connection pool
const dbPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

/**
 * Send an email notification
 * @param to Recipient email address
 * @param subject Email subject
 * @param body Email body
 */
async function sendEmail(to: string, subject: string, body: string): Promise<void> {
  // In a real implementation, this would integrate with an email service like AWS SES
  console.log(`Sending email to ${to}: ${subject}`);
  // TODO: Implement actual email sending
}

/**
 * Send an SMS notification
 * @param to Recipient phone number
 * @param message SMS message
 */
async function sendSMS(to: string, message: string): Promise<void> {
  // In a real implementation, this would integrate with an SMS service like Twilio
  console.log(`Sending SMS to ${to}: ${message}`);
  // TODO: Implement actual SMS sending
}

/**
 * Send a Slack notification
 * @param webhookUrl Slack webhook URL
 * @param message Notification message
 */
async function sendSlackNotification(webhookUrl: string, message: string): Promise<void> {
  // In a real implementation, this would make an HTTP POST request to the Slack webhook
  console.log(`Sending Slack notification to ${webhookUrl}: ${message}`);
  // TODO: Implement actual Slack notification sending
}

/**
 * Send notifications for monitor status changes
 * @param monitorId The monitor ID
 * @param newStatus The new status
 * @param oldStatus The previous status
 */
export async function sendNotifications(monitorId: string, newStatus: string, oldStatus: string): Promise<void> {
  if (newStatus === oldStatus) {
    return; // No status change, no notification needed
  }
  
  try {
    const client = await dbPool.connect();
    
    try {
      // Get monitor details and user alert integrations
      const result = await client.query(
        `SELECT m.name, m.user_id, u.email 
         FROM "Monitor" m 
         JOIN "User" u ON m.user_id = u.id 
         WHERE m.id = $1`,
        [monitorId]
      );
      
      if (result.rows.length === 0) {
        console.warn(`Monitor ${monitorId} not found`);
        return;
      }
      
      const monitor = result.rows[0];
      const statusChangeMessage = `Monitor "${monitor.name}" status changed from ${oldStatus} to ${newStatus}`;
      
      console.log(`Monitor ${monitorId} status changed from ${oldStatus} to ${newStatus}`);
      
      // Get user's alert integrations
      const alertResult = await client.query(
        `SELECT type, target FROM "AlertIntegration" 
         WHERE user_id = $1 AND is_verified = true`,
        [monitor.user_id]
      );
      
      // Send notifications to all configured channels
      for (const alert of alertResult.rows) {
        try {
          switch (alert.type) {
            case AlertType.sms:
              await sendSMS(alert.target, statusChangeMessage);
              break;
            case AlertType.slack:
              await sendSlackNotification(alert.target, statusChangeMessage);
              break;
            default:
              console.warn(`Unknown alert type: ${alert.type}`);
          }
        } catch (error) {
          console.error(`Error sending ${alert.type} notification to ${alert.target}:`, error);
        }
      }
      
      // Always send an email to the user's registered email address
      try {
        await sendEmail(
          monitor.email,
          `UptimeKite Monitor Status Change: ${monitor.name}`,
          `Hello ${monitor.name},\n\nYour monitor "${monitor.name}" status has changed from ${oldStatus} to ${newStatus}.\n\nBest regards,\nUptimeKite Team`
        );
      } catch (error) {
        console.error(`Error sending email to ${monitor.email}:`, error);
      }
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error sending notifications:', error);
  }
}
