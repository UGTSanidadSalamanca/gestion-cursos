import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const status = searchParams.get('status')
    const category = searchParams.get('category')

    let whereClause: any = {}

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { taxId: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (status && status !== 'all') {
      whereClause.status = status
    }

    if (category && category !== 'all') {
      whereClause.category = category
    }

    const suppliers = await db.provider.findMany({
      where: whereClause,
      include: {
        materials: true,
        contacts: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(suppliers)
  } catch (error) {
    console.error('Error fetching suppliers:', error)
    return NextResponse.json(
      { error: 'Error fetching suppliers' },
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
      taxId,
      category,
      description,
      website,
      status = 'ACTIVE'
    } = body

    // Check if supplier with name, email or tax ID already exists
    const existingSupplier = await db.provider.findFirst({
      where: {
        OR: [
          { name: name },
          { email: email },
          { taxId: taxId }
        ]
      }
    })

    if (existingSupplier) {
      return NextResponse.json(
        { error: 'Supplier with this name, email or tax ID already exists' },
        { status: 400 }
      )
    }

    const supplier = await db.provider.create({
      data: {
        name,
        email,
        phone,
        address,
        taxId,
        category,
        description,
        website,
        status
      },
      include: {
        materials: true,
        contacts: true
      }
    })

    return NextResponse.json(supplier, { status: 201 })
  } catch (error) {
    console.error('Error creating supplier:', error)
    return NextResponse.json(
      { error: 'Error creating supplier' },
      { status: 500 }
    )
  }
}