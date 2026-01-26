import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const teacher = await db.teacher.findUnique({
      where: { id: params.id },
      include: {
        contacts: true
      }
    })

    if (!teacher) {
      return NextResponse.json(
        { error: 'Teacher not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(teacher)
  } catch (error) {
    console.error('Error fetching teacher:', error)
    return NextResponse.json(
      { error: 'Error fetching teacher' },
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
      specialty,
      experience,
      cv,
      contractType,
      hourlyRate,
      status
    } = body

    // Check if another teacher with same email or DNI exists (only if values are provided)
    const orClauses = []
    if (email) orClauses.push({ email })
    if (dni) orClauses.push({ dni })

    if (orClauses.length > 0) {
      const existingTeacher = await db.teacher.findFirst({
        where: {
          OR: orClauses,
          NOT: {
            id: params.id
          }
        }
      })

      if (existingTeacher) {
        return NextResponse.json(
          { error: 'Another teacher with this email or DNI already exists' },
          { status: 400 }
        )
      }
    }

    // Limpieza de datos antes de actualizar
    const cleanData = {
      name: name || null,
      email: email || null,
      phone: phone || null,
      address: address || null,
      dni: dni || null,
      specialty: specialty || null,
      experience: experience || null,
      cv: cv || null,
      contractType: contractType,
      hourlyRate: (hourlyRate && !isNaN(parseFloat(hourlyRate))) ? parseFloat(hourlyRate) : null,
      status: status
    }

    const teacher = await db.teacher.update({
      where: { id: params.id },
      data: {
        ...cleanData
      },
      include: {
        contacts: true
      }
    })

    return NextResponse.json(teacher)
  } catch (error) {
    console.error('Error updating teacher:', error)
    return NextResponse.json(
      { error: 'Error updating teacher' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // First, check if teacher has active assignments in modules
    const activeModules = await db.courseModule.findMany({
      where: {
        teacherId: params.id,
        course: {
          isActive: true
        }
      }
    })

    if (activeModules.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete teacher with assignments in active courses' },
        { status: 400 }
      )
    }

    // Delete related records (teacherContact if it exists, or contact)
    // Looking at schema.prisma, Teacher has contacts Contact[]
    await db.contact.deleteMany({
      where: { teacherId: params.id }
    })

    // Update modules to remove teacher reference
    await db.courseModule.updateMany({
      where: { teacherId: params.id },
      data: { teacherId: null }
    })

    // Then delete the teacher
    await db.teacher.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Teacher deleted successfully' })
  } catch (error) {
    console.error('Error deleting teacher:', error)
    return NextResponse.json(
      { error: 'Error deleting teacher' },
      { status: 500 }
    )
  }
}