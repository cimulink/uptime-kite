// Utility function to get the current session
export async function getCurrentUser() {
  // For now, return null since we're using client-side auth
  return null
}

// Utility function to require authentication for server-side pages
export async function requireAuthentication() {
  // For now, return a redirect since we're using client-side auth
  return {
    redirect: {
      destination: '/auth/signin',
      permanent: false,
    },
  }
}

// Utility function to check if user is authenticated
export function isAuthenticated(session: any): boolean {
  return !!session?.user?.id
}
