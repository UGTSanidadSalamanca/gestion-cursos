import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId')
    const courseId = searchParams.get('courseId')
    const status = searchParams.get('status')

    let whereClause: any = {}

    if (studentId) {
      whereClause.studentId = studentId
    }

    if (courseId) {
      whereClause.courseId = courseId
    }

    if (status && status !== 'all') {
      whereClause.status = status
    }

    const enrollments = await db.enrollment.findMany({
      where: whereClause,
      include: {
        student: true,
        course: {
          include: {
            teacher: true
          }
        }
      },
      orderBy: {
        enrollmentDate: 'desc'
      }
    })

    return NextResponse.json(enrollments)
  } catch (error) {
    console.error('Error fetching enrollments:', error)
    return NextResponse.json(
      { error: 'Error fetching enrollments' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { studentId, courseId } = body

    // Check if student exists
    const student = await db.student.findUnique({
      where: { id: studentId }
    })

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      )
    }

    // Check if course exists
    const course = await db.course.findUnique({
      where: { id: courseId },
      include: {
        _count: {
          select: { enrollments: true }
        }
      }
    })

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      )
    }

    // Check if course is active
    if (!course.isActive) {
      return NextResponse.json(
        { error: 'Course is not active' },
        { status: 400 }
      )
    }

    // Check if course has available slots
    if (course._count.enrollments >= course.maxStudents) {
      return NextResponse.json(
        { error: 'Course is full' },
        { status: 400 }
      )
    }

    // Check if student is already enrolled
    const existingEnrollment = await db.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId,
          courseId
        }
      }
    })

    if (existingEnrollment) {
      return NextResponse.json(
        { error: 'Student is already enrolled in this course' },
        { status: 400 }
      )
    }

    // Create enrollment
    const enrollment = await db.enrollment.create({
      data: {
        studentId,
        courseId,
        status: 'ENROLLED'
      },
      include: {
        student: true,
        course: {
          include: {
            teacher: true
          }
        }
      }
    })

    return NextResponse.json(enrollment, { status: 201 })
  } catch (error) {
    console.error('Error creating enrollment:', error)
    return NextResponse.json(
      { error: 'Error creating enrollment' },
      { status: 500 }
    )
  }
}