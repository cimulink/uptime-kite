/**
 * Simple test script to verify database connection
 */

import { Pool } from 'pg';

async function testDatabaseConnection() {
  console.log('Testing database connection...');
  
  // Initialize the database connection pool
  const dbPool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/uptimekite',
    ssl: {
      rejectUnauthorized: false,
    },
  });
  
  try {
    // Test the connection
    const client = await dbPool.connect();
    
    try {
      // Run a simple query
      const result = await client.query('SELECT NOW() as now');
      console.log('Database connection successful!');
      console.log('Current time from database:', result.rows[0].now);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Database connection failed:', error);
  } finally {
    await dbPool.end();
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testDatabaseConnection();
}

export default testDatabaseConnection;
