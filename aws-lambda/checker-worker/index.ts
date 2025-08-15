import { SQSHandler, SQSRecord } from 'aws-lambda';
import { SQSClient, DeleteMessageCommand } from '@aws-sdk/client-sqs';
import { Pool } from 'pg';
import { MonitorType, MonitorStatus } from '@prisma/client';
import https from 'https';
import { sendNotifications } from './notificationService';

// Initialize the SQS client
const sqsClient = new SQSClient({
  region: process.env.AWS_REGION || 'ap-south-1',
});

// Initialize the database connection pool
const dbPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// Type for the SQS message
interface MonitorJob {
  monitorId: string;
  type: MonitorType;
  target: string;
  timestamp: string;
}

/**
 * Check if an HTTP endpoint is live
 * @param url The URL to check
 * @returns Object with status, response time, and status code
 */
async function checkHttpEndpoint(url: string): Promise<{
  success: boolean;
  responseTimeMs: number;
  statusCode?: number;
  errorMessage?: string;
}> {
  const startTime = Date.now();
  
  try {
    const response = await new Promise<https.IncomingMessage>((resolve, reject) => {
      const req = https.get(url, (res) => {
        res.on('data', () => {}); // Consume response data to free up memory
        res.on('end', () => resolve(res));
      });
      
      req.on('error', (err) => {
        reject(err);
      });
      
      req.setTimeout(10000, () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });
    });
    
    const responseTimeMs = Date.now() - startTime;
    
    return {
      success: response.statusCode !== undefined && response.statusCode < 400,
      responseTimeMs,
      statusCode: response.statusCode,
    };
  } catch (error) {
    const responseTimeMs = Date.now() - startTime;
    
    return {
      success: false,
      responseTimeMs,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Check if a cron job was run
 * @param monitorId The monitor ID to check
 * @returns Object with status and message
 */
async function checkCronJob(monitorId: string): Promise<{
  success: boolean;
  errorMessage?: string;
}> {
  try {
    // For cron jobs, we check if there has been a recent check result
    // In a real implementation, this would check for a heartbeat signal
    const client = await dbPool.connect();
    
    try {
      const result = await client.query(
        `SELECT checked_at FROM "checkResult" 
         WHERE monitor_id = $1 
         ORDER BY checked_at DESC 
         LIMIT 1`,
        [monitorId]
      );
      
      if (result.rows.length === 0) {
        return {
          success: false,
          errorMessage: 'No check results found for cron monitor',
        };
      }
      
      const lastCheck = new Date(result.rows[0].checked_at);
      const now = new Date();
      const timeDiff = now.getTime() - lastCheck.getTime();
      
      // If the last check was within the last 2 minutes, consider it successful
      // (assuming the monitor interval is at least 1 minute)
      return {
        success: timeDiff <= 120000, // 2 minutes
      };
    } finally {
      client.release();
    }
  } catch (error) {
    return {
      success: false,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}


/**
 * Update monitor status in the database
 * @param monitorId The monitor ID
 * @param newStatus The new status
 */
async function updateMonitorStatus(monitorId: string, newStatus: MonitorStatus): Promise<void> {
  try {
    const client = await dbPool.connect();
    
    try {
      // Get current status before updating
      const currentResult = await client.query(
        `SELECT status FROM "Monitor" WHERE id = $1`,
        [monitorId]
      );
      
      if (currentResult.rows.length === 0) {
        console.warn(`Monitor ${monitorId} not found`);
        return;
      }
      
      const oldStatus = currentResult.rows[0].status;
      
      // Update monitor status
      await client.query(
        `UPDATE "Monitor" SET status = $1 WHERE id = $2`,
        [newStatus, monitorId]
      );
      
      console.log(`Updated monitor ${monitorId} status from ${oldStatus} to ${newStatus}`);
      
      // Send notifications if status changed
      if (oldStatus !== newStatus) {
        await sendNotifications(monitorId, newStatus, oldStatus);
      }
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error updating monitor status:', error);
  }
}

/**
 * Save check result to the database
 * @param monitorId The monitor ID
 * @param success Whether the check was successful
 * @param responseTimeMs Response time in milliseconds
 * @param statusCode HTTP status code (if applicable)
 * @param errorMessage Error message (if applicable)
 */
async function saveCheckResult(
  monitorId: string,
  success: boolean,
  responseTimeMs?: number,
  statusCode?: number,
  errorMessage?: string
): Promise<void> {
  try {
    const client = await dbPool.connect();
    
    try {
      await client.query(
        `INSERT INTO "checkResult" 
         (monitor_id, status_code, response_time_ms, was_successful, error_message, checked_at) 
         VALUES ($1, $2, $3, $4, $5, NOW())`,
        [monitorId, statusCode, responseTimeMs, success, errorMessage]
      );
      
      console.log(`Saved check result for monitor ${monitorId}`);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error saving check result:', error);
  }
}

/**
 * Process a single SQS message
 * @param record The SQS record to process
 */
async function processMessage(record: SQSRecord): Promise<void> {
  try {
    // Parse the message body
    const job: MonitorJob = JSON.parse(record.body);
    console.log(`Processing monitor ${job.monitorId} of type ${job.type}`);
    
    let success = false;
    let responseTimeMs: number | undefined;
    let statusCode: number | undefined;
    let errorMessage: string | undefined;
    
    // Perform the appropriate check based on monitor type
    if (job.type === MonitorType.http) {
      const result = await checkHttpEndpoint(job.target);
      success = result.success;
      responseTimeMs = result.responseTimeMs;
      statusCode = result.statusCode;
      errorMessage = result.errorMessage;
    } else if (job.type === MonitorType.cron) {
      const result = await checkCronJob(job.monitorId);
      success = result.success;
      errorMessage = result.errorMessage;
    } else {
      throw new Error(`Unknown monitor type: ${job.type}`);
    }
    
    // Save the check result to the database
    await saveCheckResult(job.monitorId, success, responseTimeMs, statusCode, errorMessage);
    
    // Update monitor status based on check result
    const newStatus = success ? MonitorStatus.up : MonitorStatus.down;
    await updateMonitorStatus(job.monitorId, newStatus);
    
    // Delete the message from the queue
    const deleteCommand = new DeleteMessageCommand({
      QueueUrl: process.env.AWS_SQS_URL,
      ReceiptHandle: record.receiptHandle,
    });
    
    await sqsClient.send(deleteCommand);
    console.log(`Successfully processed and deleted message for monitor ${job.monitorId}`);
  } catch (error) {
    console.error('Error processing message:', error);
    // Note: In a production environment, we might want to implement a dead letter queue
    // for messages that fail to process multiple times
  }
}

/**
 * AWS Lambda handler for processing SQS messages
 * @param event The SQS event
 */
export const handler: SQSHandler = async (event) => {
  console.log(`Received ${event.Records.length} messages from SQS`);
  
  // Process each message in parallel
  const promises = event.Records.map(processMessage);
  await Promise.all(promises);
  
  console.log('Finished processing all messages');
};
