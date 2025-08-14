import { PrismaClient } from '@prisma/client'

// Declare a global variable for the Prisma client to prevent multiple instances in development
declare global {
  var prisma: PrismaClient | undefined
}

// Create a new Prisma client instance or use the existing one
const client = globalThis.prisma || new PrismaClient()

// In development, store the Prisma client in the global variable to prevent multiple instances
if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = client
}

// Export the Prisma client instance
export const db = client
