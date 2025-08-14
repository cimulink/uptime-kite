import { db } from './db'
import { User } from '@prisma/client'
import bcrypt from 'bcrypt'

// Create a new user
export async function createUser(userData: {
  name: string
  email: string
  password: string
}): Promise<User> {
  // Hash the password
  const hashedPassword = await bcrypt.hash(userData.password, 10)
  
  // Create the user in the database
  const user = await db.user.create({
    data: {
      name: userData.name,
      email: userData.email,
      password_hash: hashedPassword,
    },
  })
  
  return user
}

// Get a user by email
export async function getUserByEmail(email: string): Promise<User | null> {
  return await db.user.findUnique({
    where: {
      email: email,
    },
  })
}

// Get a user by ID
export async function getUserById(id: string): Promise<User | null> {
  return await db.user.findUnique({
    where: {
      id: id,
    },
  })
}

// Update a user's plan
export async function updateUserPlan(userId: string, plan: string): Promise<User> {
  return await db.user.update({
    where: {
      id: userId,
    },
    data: {
      plan: plan,
    },
  })
}
