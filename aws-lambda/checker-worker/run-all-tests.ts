/**
 * Script to run all tests for the UptimeKite Checker Worker
 */

import testHttpCheck from './test-http-check';
import testDatabaseConnection from './test-db-connection';
import testSQS from './test-sqs';

async function runAllTests() {
  console.log('Running all tests for UptimeKite Checker Worker...\n');
  
  // Test HTTP checking
  console.log('1. Testing HTTP endpoint check...');
  try {
    const result = await testHttpCheck('https://httpbin.org/status/200');
    console.log('HTTP check result:', result);
    console.log('✓ HTTP endpoint check passed\n');
  } catch (error) {
    console.error('✗ HTTP endpoint check failed:', error);
    console.log();
  }
  
  // Test database connection
  console.log('2. Testing database connection...');
  try {
    await testDatabaseConnection();
    console.log('✓ Database connection test passed\n');
  } catch (error) {
    console.error('✗ Database connection test failed:', error);
    console.log();
  }
  
  // Test SQS integration
  console.log('3. Testing SQS integration...');
  try {
    await testSQS();
    console.log('✓ SQS integration test passed\n');
  } catch (error) {
    console.error('✗ SQS integration test failed:', error);
    console.log();
  }
  
  console.log('All tests completed!');
}

// Run all tests if this file is executed directly
if (require.main === module) {
  runAllTests();
}

export default runAllTests;
