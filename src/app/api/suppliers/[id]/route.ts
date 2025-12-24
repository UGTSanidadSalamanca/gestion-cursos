import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supplier = await db.provider.findUnique({
      where: { id: params.id },
      include: {
        materials: true,
        contacts: true
      }
    })

    if (!supplier) {
      return NextResponse.json(
        { error: 'Supplier not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(supplier)
  } catch (error) {
    console.error('Error fetching supplier:', error)
    return NextResponse.json(
      { error: 'Error fetching supplier' },
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
      taxId,
      category,
      description,
      website,
      status
    } = body

    // Check if another supplier with same name, email or tax ID exists
    const existingSupplier = await db.provider.findFirst({
      where: {
        OR: [
          { name: name },
          { email: email },
          { taxId: taxId }
        ],
        NOT: {
          id: params.id
        }
      }
    })

    if (existingSupplier) {
      return NextResponse.json(
        { error: 'Another supplier with this name, email or tax ID already exists' },
        { status: 400 }
      )
    }

    const supplier = await db.provider.update({
      where: { id: params.id },
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

    return NextResponse.json(supplier)
  } catch (error) {
    console.error('Error updating supplier:', error)
    return NextResponse.json(
      { error: 'Error updating supplier' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if supplier has associated materials
    const materialsCount = await db.material.count({
      where: { providerId: params.id }
    })

    if (materialsCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete supplier with associated materials' },
        { status: 400 }
      )
    }

    // Delete related contacts
    await db.supplierContact.deleteMany({
      where: { supplierId: params.id }
    })

    // Then delete the supplier
    await db.provider.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Supplier deleted successfully' })
  } catch (error) {
    console.error('Error deleting supplier:', error)
    return NextResponse.json(
      { error: 'Error deleting supplier' },
      { status: 500 }
    )
  }
}