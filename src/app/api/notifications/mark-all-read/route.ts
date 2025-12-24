import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, userRole } = body

    const where: any = { isRead: false }
    
    // Si se proporciona userId, actualizar solo notificaciones de ese usuario
    if (userId) {
      where.targetUser = userId
    }
    
    // Si se proporciona userRole, actualizar notificaciones para ese rol
    if (userRole) {
      where.targetRole = userRole
    }

    const result = await db.notification.updateMany({
      where,
      data: {
        isRead: true
      }
    })

    return NextResponse.json({
      message: 'Notifications marked as read successfully',
      count: result.count
    })
  } catch (error) {
    console.error('Error marking notifications as read:', error)
    return NextResponse.json(
      { error: 'Error marking notifications as read' },
      { status: 500 }
    )
  }
}