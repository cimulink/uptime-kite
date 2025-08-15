/**
 * Simple test script to verify SQS integration
 */

import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';

async function testSQS() {
  console.log('Testing SQS integration...');
  
  // Initialize the SQS client
  const sqsClient = new SQSClient({
    region: process.env.AWS_REGION || 'ap-south-1',
  });
  
  try {
    // Send a test message
    const command = new SendMessageCommand({
      QueueUrl: process.env.AWS_SQS_URL || 'https://sqs.ap-south-1.amazonaws.com/123456789012/test-queue',
      MessageBody: JSON.stringify({
        test: true,
        timestamp: new Date().toISOString(),
        message: 'Test message from UptimeKite'
      }),
    });
    
    const response = await sqsClient.send(command);
    console.log('SQS message sent successfully!');
    console.log('Message ID:', response.MessageId);
  } catch (error) {
    console.error('SQS test failed:', error);
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testSQS();
}

export default testSQS;
