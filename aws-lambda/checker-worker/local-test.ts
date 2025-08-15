/**
 * Local test script for the checker worker
 * This script simulates the AWS Lambda environment for local testing
 */

import { handler } from './index';
import { SQSEvent } from 'aws-lambda';

// Mock SQS event with sample monitor jobs
const mockEvent: SQSEvent = {
  Records: [
    {
      attributes: {
        ApproximateReceiveCount: '1',
        SentTimestamp: '1523232000000',
        SenderId: '123456789012',
        ApproximateFirstReceiveTimestamp: '1523232000001'
      },
      awsRegion: 'ap-south-1',
      body: JSON.stringify({
        monitorId: 'test-http-monitor',
        type: 'http',
        target: 'https://httpbin.org/status/200',
        timestamp: new Date().toISOString()
      }),
      eventSource: 'aws:sqs',
      eventSourceARN: 'arn:aws:sqs:ap-south-1:123456789012:test-queue',
      md5OfBody: 'md5',
      messageAttributes: {},
      messageId: '1234567890',
      receiptHandle: 'receipt-handle'
    },
    {
      attributes: {
        ApproximateReceiveCount: '1',
        SentTimestamp: '1523232000000',
        SenderId: '123456789012',
        ApproximateFirstReceiveTimestamp: '1523232000001'
      },
      awsRegion: 'ap-south-1',
      body: JSON.stringify({
        monitorId: 'test-cron-monitor',
        type: 'cron',
        target: 'test-cron-job',
        timestamp: new Date().toISOString()
      }),
      eventSource: 'aws:sqs',
      eventSourceARN: 'arn:aws:sqs:ap-south-1:123456789012:test-queue',
      md5OfBody: 'md5',
      messageAttributes: {},
      messageId: '0987654321',
      receiptHandle: 'receipt-handle-2'
    }
  ]
};

// Set environment variables for local testing
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://localhost:5432/uptimekite';
process.env.AWS_REGION = process.env.AWS_REGION || 'ap-south-1';
process.env.AWS_SQS_URL = process.env.AWS_SQS_URL || 'https://sqs.ap-south-1.amazonaws.com/123456789012/test-queue';

// Run the handler
async function runTest() {
  console.log('Running local test of checker worker...');
  
  try {
    await handler(mockEvent);
    console.log('Test completed successfully');
  } catch (error) {
    console.error('Test failed with error:', error);
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  runTest();
}

export default runTest;
