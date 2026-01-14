import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const student = await db.student.findUnique({
      where: { id: params.id },
      include: {
        enrollments: {
          include: {
            course: true
          }
        },
        payments: true,
        contacts: true
      }
    })

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(student)
  } catch (error) {
    console.error('Error fetching student:', error)
    return NextResponse.json(
      { error: 'Error fetching student' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const {
      name,
      email,
      phone,
      address,
      dni,
      isAffiliated,
      affiliateNumber,
      emergencyContact,
      emergencyPhone,
      medicalInfo,
      status
    } = body

    // Check if another student with same email or DNI exists (only if values are provided)
    const orClauses = []
    if (email) orClauses.push({ email })
    if (dni) orClauses.push({ dni })

    if (orClauses.length > 0) {
      const existingStudent = await db.student.findFirst({
        where: {
          OR: orClauses,
          NOT: {
            id: params.id
          }
        }
      })

      if (existingStudent) {
        return NextResponse.json(
          { error: 'Another student with this email or DNI already exists' },
          { status: 400 }
        )
      }
    }

    const student = await db.student.update({
      where: { id: params.id },
      data: {
        name,
        email,
        phone,
        address,
        dni,
        isAffiliated: isAffiliated || false,
        affiliateNumber: isAffiliated ? affiliateNumber : null,
        emergencyContact,
        emergencyPhone,
        medicalInfo,
        status
      },
      include: {
        enrollments: {
          include: {
            course: true
          }
        },
        payments: true,
        contacts: true
      }
    })

    return NextResponse.json(student)
  } catch (error) {
    console.error('Error updating student:', error)
    return NextResponse.json(
      { error: 'Error updating student' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // First, delete related records
    await db.contact.deleteMany({
      where: { studentId: params.id }
    })

    await db.payment.deleteMany({
      where: { studentId: params.id }
    })

    await db.enrollment.deleteMany({
      where: { studentId: params.id }
    })

    // Then delete the student
    await db.student.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Student deleted successfully' })
  } catch (error) {
    console.error('Error deleting student:', error)
    return NextResponse.json(
      { error: 'Error deleting student' },
      { status: 500 }
    )
  }
}