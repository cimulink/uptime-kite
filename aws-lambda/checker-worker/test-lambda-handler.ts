/**
 * Simple test script to verify Lambda handler
 */

import { handler } from './index';

async function testLambdaHandler() {
  console.log('Testing Lambda handler...');
  
  // Mock SQS event with sample monitor jobs
  const mockEvent: any = {
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
      }
    ]
  };
  
  try {
    // Test the handler
    await handler(mockEvent);
    console.log('Lambda handler test completed!');
  } catch (error) {
    console.error('Lambda handler test failed:', error);
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testLambdaHandler();
}

export default testLambdaHandler;
