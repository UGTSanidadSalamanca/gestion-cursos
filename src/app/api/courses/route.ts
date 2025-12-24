import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const level = searchParams.get('level')
    const isActive = searchParams.get('isActive')

    let whereClause: any = {}

    if (level && level !== 'all') {
      whereClause.level = level
    }

    if (isActive !== null && isActive !== undefined) {
      whereClause.isActive = isActive === 'true'
    }

    const courses = await db.course.findMany({
      where: whereClause,
      include: {
        teacher: true,
        _count: {
          select: { enrollments: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(courses)
  } catch (error) {
    console.error('Error fetching courses:', error)
    return NextResponse.json(
      { error: 'Error fetching courses' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      title,
      description,
      code,
      level,
      duration,
      maxStudents,
      price,
      isActive = true,
      startDate,
      endDate,
      teacherId
    } = body

    // Check if course with same code already exists
    const existingCourse = await db.course.findFirst({
      where: {
        OR: [
          { code: code },
          { title: title }
        ]
      }
    })

    if (existingCourse) {
      return NextResponse.json(
        { error: 'Course with this title or code already exists' },
        { status: 400 }
      )
    }

    const course = await db.course.create({
      data: {
        title,
        description,
        code,
        level,
        duration,
        maxStudents,
        price,
        isActive,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        teacherId: teacherId || null
      },
      include: {
        teacher: true,
        _count: {
          select: { enrollments: true }
        }
      }
    })

    return NextResponse.json(course, { status: 201 })
  } catch (error) {
    console.error('Error creating course:', error)
    return NextResponse.json(
      { error: 'Error creating course' },
      { status: 500 }
    )
  }
}