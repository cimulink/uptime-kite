import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { createMonitor, getMonitorsByUserId } from '@/lib/monitorDao'
import { MonitorType } from '@prisma/client'
import { authOptions } from '@/lib/authConfig'

// GET /api/monitors - Get all monitors for the authenticated user
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const monitors = await getMonitorsByUserId(session.user.id)
    
    return NextResponse.json(monitors)
  } catch (error) {
    console.error('Error fetching monitors:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/monitors - Create a new monitor
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await req.json()
    
    // Validate required fields
    if (!body.name || !body.type || !body.target || !body.intervalSeconds) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate monitor type
    if (!Object.values(MonitorType).includes(body.type)) {
      return NextResponse.json(
        { error: 'Invalid monitor type' },
        { status: 400 }
      )
    }

    // Validate interval (should be a positive number)
    if (typeof body.intervalSeconds !== 'number' || body.intervalSeconds <= 0) {
      return NextResponse.json(
        { error: 'Invalid interval seconds' },
        { status: 400 }
      )
    }

    const monitor = await createMonitor({
      userId: session.user.id,
      name: body.name,
      type: body.type,
      target: body.target,
      intervalSeconds: body.intervalSeconds,
    })
    
    return NextResponse.json(monitor, { status: 201 })
  } catch (error) {
    console.error('Error creating monitor:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
