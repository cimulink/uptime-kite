/**
 * Simple test script to verify HTTP checking functionality
 */

import https from 'https';

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

// Test the function
async function runTest() {
  console.log('Testing HTTP endpoint check...');
  
  try {
    const result = await checkHttpEndpoint('https://httpbin.org/status/200');
    console.log('Result:', result);
  } catch (error) {
    console.error('Test failed with error:', error);
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  runTest();
}

export default checkHttpEndpoint;
