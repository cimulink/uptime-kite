// Database configuration based on environment
export const getDatabaseUrl = () => {
  const nodeEnv = process.env.NODE_ENV || 'development';
  
  // In production, use the Supabase connection pool
  if (nodeEnv === 'production') {
    return process.env.DATABASE_URL || process.env.DATABASE_URL_LOCAL;
  }
  
  // In development, use the local database
  return process.env.DATABASE_URL_LOCAL || process.env.DATABASE_URL;
};

// Export the database URL
export const DATABASE_URL = getDatabaseUrl();
