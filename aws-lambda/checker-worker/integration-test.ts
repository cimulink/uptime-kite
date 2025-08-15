/**
 * Integration test script for UptimeKite Checker Worker
 */

import { handler } from './index';
import { SQSClient, SendMessageCommand, ReceiveMessageCommand, DeleteMessageCommand } from '@aws-sdk/client-sqs';
import { Pool } from 'pg';

async function runIntegrationTest() {
  console.log('Running integration test for UptimeKite Checker Worker...\n');
  
  // Set environment variables for testing
  process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://localhost:5432/uptimekite';
  process.env.AWS_REGION = process.env.AWS_REGION || 'ap-south-1';
  process.env.AWS_SQS_URL = process.env.AWS_SQS_URL || 'https://sqs.ap-south-1.amazonaws.com/123456789012/test-queue';
  
  // Test 1: Database connection
  console.log('1. Testing database connection...');
  try {
    const dbPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false,
      },
    });
    
    const client = await dbPool.connect();
    await client.query('SELECT NOW() as now');
    client.release();
    await dbPool.end();
    
    console.log('✓ Database connection successful\n');
  } catch (error) {
    console.error('✗ Database connection failed:', error);
    console.log();
  }
  
  // Test 2: SQS integration
  console.log('2. Testing SQS integration...');
  try {
    const sqsClient = new SQSClient({
      region: process.env.AWS_REGION,
    });
    
    // Send a test message
    const sendMessageCommand = new SendMessageCommand({
      QueueUrl: process.env.AWS_SQS_URL,
      MessageBody: JSON.stringify({
        monitorId: 'integration-test-monitor',
        type: 'http',
        target: 'https://httpbin.org/status/200',
        timestamp: new Date().toISOString()
      }),
    });
    
    const sendResponse = await sqsClient.send(sendMessageCommand);
    console.log('✓ SQS message sent successfully');
    console.log('  Message ID:', sendResponse.MessageId);
    
    // Receive the message
    const receiveMessageCommand = new ReceiveMessageCommand({
      QueueUrl: process.env.AWS_SQS_URL,
      MaxNumberOfMessages: 1,
      WaitTimeSeconds: 1,
    });
    
    const receiveResponse = await sqsClient.send(receiveMessageCommand);
    if (receiveResponse.Messages && receiveResponse.Messages.length > 0) {
      console.log('✓ SQS message received successfully');
      
      // Delete the message
      const deleteMessageCommand = new DeleteMessageCommand({
        QueueUrl: process.env.AWS_SQS_URL,
        ReceiptHandle: receiveResponse.Messages[0].ReceiptHandle,
      });
      
      await sqsClient.send(deleteMessageCommand);
      console.log('✓ SQS message deleted successfully\n');
    } else {
      console.log('⚠ No messages received from SQS\n');
    }
  } catch (error) {
    console.error('✗ SQS integration failed:', error);
    console.log();
  }
  
  // Test 3: HTTP endpoint checking
  console.log('3. Testing HTTP endpoint checking...');
  try {
    // Mock SQS event with a real HTTP endpoint
    const mockEvent: any = {
      Records: [
        {
          attributes: {
            ApproximateReceiveCount: '1',
            SentTimestamp: Date.now().toString(),
            SenderId: 'integration-test',
            ApproximateFirstReceiveTimestamp: Date.now().toString()
          },
          awsRegion: process.env.AWS_REGION,
          body: JSON.stringify({
            monitorId: 'integration-test-http-monitor',
            type: 'http',
            target: 'https://httpbin.org/status/200',
            timestamp: new Date().toISOString()
          }),
          eventSource: 'aws:sqs',
          eventSourceARN: 'arn:aws:sqs:ap-south-1:123456789012:test-queue',
          md5OfBody: 'md5',
          messageAttributes: {},
          messageId: 'integration-test-message-id',
          receiptHandle: 'integration-test-receipt-handle'
        }
      ]
    };
    
    // Test the handler
    await handler(mockEvent);
    console.log('✓ HTTP endpoint check completed\n');
  } catch (error) {
    console.error('✗ HTTP endpoint check failed:', error);
    console.log();
  }
  
  console.log('Integration test completed!');
}

// Run the integration test if this file is executed directly
if (require.main === module) {
  runIntegrationTest();
}

export default runIntegrationTest;
