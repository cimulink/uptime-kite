import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/authConfig'
import { 
  getMonitorById, 
  updateMonitor, 
  updateMonitorStatus,
  deleteMonitor 
} from '@/lib/monitorDao'
import { MonitorStatus, MonitorType } from '@prisma/client'

// GET /api/monitors/[id] - Get a specific monitor by ID
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params;
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const monitor = await getMonitorById(id)
    
    // Check if monitor exists and belongs to the user
    if (!monitor) {
      return NextResponse.json(
        { error: 'Monitor not found' },
        { status: 404 }
      )
    }
    
    if (monitor.user_id !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }
    
    return NextResponse.json(monitor)
  } catch (error) {
    console.error('Error fetching monitor:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/monitors/[id] - Update a monitor
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params;
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const monitor = await getMonitorById(id)
    
    // Check if monitor exists and belongs to the user
    if (!monitor) {
      return NextResponse.json(
        { error: 'Monitor not found' },
        { status: 404 }
      )
    }
    
    if (monitor.user_id !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const body = await req.json()
    
    // Validate monitor type if provided
    if (body.type && !Object.values(MonitorType).includes(body.type)) {
      return NextResponse.json(
        { error: 'Invalid monitor type' },
        { status: 400 }
      )
    }

    // Validate interval if provided
    if (body.intervalSeconds !== undefined && (typeof body.intervalSeconds !== 'number' || body.intervalSeconds <= 0)) {
      return NextResponse.json(
        { error: 'Invalid interval seconds' },
        { status: 400 }
      )
    }

    // Prepare update data
    const updateData: any = {}
    
    if (body.name !== undefined) updateData.name = body.name
    if (body.type !== undefined) updateData.type = body.type
    if (body.target !== undefined) updateData.target = body.target
    if (body.intervalSeconds !== undefined) updateData.intervalSeconds = body.intervalSeconds
    if (body.status && Object.values(MonitorStatus).includes(body.status)) {
      updateData.status = body.status
    }
    
    // Update monitor with provided data
    const updatedMonitor = await updateMonitor(id, updateData)
    
    return NextResponse.json(updatedMonitor)
  } catch (error) {
    console.error('Error updating monitor:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/monitors/[id] - Delete a monitor
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params;
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const monitor = await getMonitorById(id)
    
    // Check if monitor exists and belongs to the user
    if (!monitor) {
      return NextResponse.json(
        { error: 'Monitor not found' },
        { status: 404 }
      )
    }
    
    if (monitor.user_id !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const deletedMonitor = await deleteMonitor(id)
    
    return NextResponse.json(deletedMonitor)
  } catch (error) {
    console.error('Error deleting monitor:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
