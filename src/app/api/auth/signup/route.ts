import { NextResponse } from 'next/server'
import { createUser, getUserByEmail } from '@/lib/userDao'

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json()

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: 'Name, email, and password are required' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await getUserByEmail(email)
    if (existingUser) {
      return NextResponse.json(
        { message: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // Create user (password hashing is handled in createUser)
    const user = await createUser({
      name,
      email,
      password,
    })

    return NextResponse.json(
      { message: 'User created successfully', user: { id: user.id, name: user.name, email: user.email } },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
