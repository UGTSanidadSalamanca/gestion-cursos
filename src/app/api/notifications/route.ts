import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { NotificationType, NotificationPriority, NotificationCategory } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const unread = searchParams.get('unread') === 'true'
    const category = searchParams.get('category')
    const priority = searchParams.get('priority')

    const skip = (page - 1) * limit

    const where: any = {}
    
    if (unread) {
      where.isRead = false
    }
    
    if (category && Object.values(NotificationCategory).includes(category as NotificationCategory)) {
      where.category = category as NotificationCategory
    }
    
    if (priority && Object.values(NotificationPriority).includes(priority as NotificationPriority)) {
      where.priority = priority as NotificationPriority
    }

    const [notifications, total] = await Promise.all([
      db.notification.findMany({
        where,
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'desc' }
        ],
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      }),
      db.notification.count({ where })
    ])

    return NextResponse.json({
      notifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json(
      { error: 'Error fetching notifications' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      title,
      message,
      type,
      priority,
      category,
      targetUser,
      targetRole,
      actionUrl,
      expiresAt
    } = body

    // Validar campos requeridos
    if (!title || !message || !type || !priority || !category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validar enums
    if (!Object.values(NotificationType).includes(type)) {
      return NextResponse.json(
        { error: 'Invalid notification type' },
        { status: 400 }
      )
    }

    if (!Object.values(NotificationPriority).includes(priority)) {
      return NextResponse.json(
        { error: 'Invalid notification priority' },
        { status: 400 }
      )
    }

    if (!Object.values(NotificationCategory).includes(category)) {
      return NextResponse.json(
        { error: 'Invalid notification category' },
        { status: 400 }
      )
    }

    const notification = await db.notification.create({
      data: {
        title,
        message,
        type,
        priority,
        category,
        targetUser,
        targetRole,
        actionUrl,
        expiresAt: expiresAt ? new Date(expiresAt) : null
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json(notification, { status: 201 })
  } catch (error) {
    console.error('Error creating notification:', error)
    return NextResponse.json(
      { error: 'Error creating notification' },
      { status: 500 }
    )
  }
}