import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const status = searchParams.get('status')
    const isAffiliated = searchParams.get('isAffiliated')

    let whereClause: any = {}

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { dni: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (status && status !== 'all') {
      whereClause.status = status
    }

    if (isAffiliated !== null && isAffiliated !== undefined) {
      whereClause.isAffiliated = isAffiliated === 'true'
    }

    const students = await db.student.findMany({
      where: whereClause,
      include: {
        enrollments: {
          include: {
            course: true
          }
        },
        payments: true,
        contacts: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(students)
  } catch (error) {
    console.error('Error fetching students:', error)
    return NextResponse.json(
      { error: 'Error fetching students' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
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
      status = 'ACTIVE'
    } = body

    // Check if student with email or DNI already exists
    const existingStudent = await db.student.findFirst({
      where: {
        OR: [
          { email: email },
          { dni: dni }
        ]
      }
    })

    if (existingStudent) {
      return NextResponse.json(
        { error: 'Student with this email or DNI already exists' },
        { status: 400 }
      )
    }

    const student = await db.student.create({
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

    return NextResponse.json(student, { status: 201 })
  } catch (error) {
    console.error('Error creating student:', error)
    return NextResponse.json(
      { error: 'Error creating student' },
      { status: 500 }
    )
  }
}