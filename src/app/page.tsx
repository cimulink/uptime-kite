import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'

export default async function Home() {
  const user = await getCurrentUser()
  
  // Redirect authenticated users to dashboard
  if (user) {
    redirect('/dashboard')
  }
  
  // Redirect unauthenticated users to signin
  redirect('/auth/signin')
}
