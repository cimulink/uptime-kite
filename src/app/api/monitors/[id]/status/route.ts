import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/authConfig'
import { 
  getMonitorById, 
  updateMonitorStatus
} from '@/lib/monitorDao'
import { MonitorStatus } from '@prisma/client'

// PUT /api/monitors/[id]/status - Update a monitor's status
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
    
    // Validate status
    if (!body.status || !Object.values(MonitorStatus).includes(body.status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      )
    }

    const updatedMonitor = await updateMonitorStatus(id, body.status)
    
    return NextResponse.json(updatedMonitor)
  } catch (error) {
    console.error('Error updating monitor status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
