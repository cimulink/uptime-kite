import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { MonitorStatus, MonitorType } from '@prisma/client';
import { sendMessage } from '@/lib/sqsClient';

export async function GET(request: Request) {
  // Check for authorization header
  const authHeader = request.headers.get('Authorization');
  const expectedAuthHeader = `Bearer ${process.env.CRON_SECRET}`;
  
  if (authHeader !== expectedAuthHeader) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get all active monitors
    const monitors = await db.monitor.findMany({
      where: {
        status: {
          not: MonitorStatus.paused,
        },
      },
    });

    // Filter monitors to only those that are actually due for checking
    const dueMonitors = monitors.filter(monitor => {
      if (!monitor.last_checked_at) {
        return true; // Never checked, so it's due
      }
      
      const timeSinceLastCheck = Date.now() - monitor.last_checked_at.getTime();
      const intervalMs = monitor.interval_seconds * 1000;
      
      return timeSinceLastCheck >= intervalMs;
    });

    console.log(`Found ${dueMonitors.length} monitors due for checking`);

    // Push each due monitor to the SQS queue
    const results = await Promise.allSettled(
      dueMonitors.map(async (monitor) => {
        // Create a job message for the monitor
        const jobMessage = {
          monitorId: monitor.id,
          type: monitor.type,
          target: monitor.target,
          timestamp: new Date().toISOString(),
        };

        // Send the job message to SQS
        const messageId = await sendMessage(JSON.stringify(jobMessage));
        console.log(`Sent monitor ${monitor.id} to queue with message ID: ${messageId}`);

        // Update the monitor's last_checked_at timestamp
        await db.monitor.update({
          where: {
            id: monitor.id,
          },
          data: {
            last_checked_at: new Date(),
          },
        });

        return { monitorId: monitor.id, messageId };
      })
    );

    // Count successful and failed operations
    const successful = results.filter((result) => result.status === 'fulfilled').length;
    const failed = results.filter((result) => result.status === 'rejected').length;

    console.log(`Successfully queued ${successful} monitors, failed to queue ${failed} monitors`);

    return NextResponse.json({
      success: true,
      message: `Processed ${dueMonitors.length} monitors`,
      queued: successful,
      failed,
    });
  } catch (error) {
    console.error('Error in cron job:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
