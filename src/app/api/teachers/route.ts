import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const status = searchParams.get('status')
    const contractType = searchParams.get('contractType')

    let whereClause: any = {}

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { specialty: { contains: search, mode: 'insensitive' } },
        { dni: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (status && status !== 'all') {
      whereClause.status = status
    }

    if (contractType && contractType !== 'all') {
      whereClause.contractType = contractType
    }

    const teachers = await db.teacher.findMany({
      where: whereClause,
      include: {
        courses: true,
        contacts: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(teachers)
  } catch (error) {
    console.error('Error fetching teachers:', error)
    return NextResponse.json(
      { error: 'Error fetching teachers' },
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
      specialty,
      experience,
      cv,
      contractType = 'FREELANCE',
      hourlyRate,
      status = 'ACTIVE'
    } = body

    // Si no hay email, creamos directamente para evitar problemas con upsert y campos únicos nulos
    if (!email) {
      const teacher = await db.teacher.create({
        data: {
          id: body.id || undefined,
          name,
          phone,
          address,
          dni,
          specialty,
          experience,
          cv,
          contractType,
          hourlyRate,
          status: status || 'ACTIVE'
        },
        include: {
          courses: true,
          contacts: true
        }
      })
      return NextResponse.json(teacher, { status: 201 })
    }

    const teacher = await db.teacher.upsert({
      where: {
        email: email
      },
      update: {
        name,
        phone,
        address,
        dni,
        specialty,
        experience,
        cv,
        contractType,
        hourlyRate,
        status: status || 'ACTIVE'
      },
      create: {
        id: body.id || undefined,
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
        status: status || 'ACTIVE'
      },
      include: {
        courses: true,
        contacts: true
      }
    })

    return NextResponse.json(teacher, { status: 201 })
  } catch (error) {
    console.error('Error creating teacher:', error)
    return NextResponse.json(
      { error: 'Error creating teacher' },
      { status: 500 }
    )
  }
}