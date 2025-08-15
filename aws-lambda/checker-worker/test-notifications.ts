/**
 * Simple test script to verify notification service
 */

import { sendNotifications } from './notificationService';

async function testNotifications() {
  console.log('Testing notification service...');
  
  try {
    // Test sending notifications
    // Note: This will only log the notifications since we haven't implemented actual sending
    await sendNotifications('test-monitor-id', 'down', 'up');
    console.log('Notification service test completed!');
  } catch (error) {
    console.error('Notification service test failed:', error);
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testNotifications();
}

export default testNotifications;
