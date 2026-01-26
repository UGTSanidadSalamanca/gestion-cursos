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
        course: true
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

    const enrollmentData = {
      studentId,
      courseId,
      status: body.status || 'ENROLLED',
      enrollmentDate: body.enrollmentDate ? new Date(body.enrollmentDate) : new Date()
    }

    const enrollment = body.id
      ? await db.enrollment.upsert({
        where: { id: body.id },
        update: enrollmentData,
        create: { id: body.id, ...enrollmentData },
        include: { student: true, course: true }
      })
      : await db.enrollment.upsert({
        where: { studentId_courseId: { studentId, courseId } },
        update: enrollmentData,
        create: enrollmentData,
        include: { student: true, course: true }
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