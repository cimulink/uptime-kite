import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

// Define the Supabase client types
declare global {
  interface Window {
    supabase: ReturnType<typeof createClient<Database>>
  }
}

// Get the Supabase URL and anon key from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Validate that we have the required environment variables
if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
}

if (!supabaseAnonKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable')
}

// Create the Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// For server-side operations, you might want to use the service role key
// which has full access to your Supabase project
export const getSupabaseServiceClient = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!serviceRoleKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable')
  }
  
  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}
