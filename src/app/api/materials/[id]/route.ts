import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const material = await db.material.findUnique({
            where: { id: params.id },
            include: {
                provider: true
            }
        })

        if (!material) {
            return NextResponse.json(
                { error: 'Material not found' },
                { status: 404 }
            )
        }

        return NextResponse.json(material)
    } catch (error) {
        console.error('Error fetching material:', error)
        return NextResponse.json(
            { error: 'Error fetching material' },
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
            description,
            type,
            quantity,
            unitPrice,
            location,
            providerId,
            isAvailable
        } = body

        const material = await db.material.update({
            where: { id: params.id },
            data: {
                name,
                description,
                type,
                quantity: parseInt(quantity),
                unitPrice: parseFloat(unitPrice),
                location,
                providerId: providerId || null,
                isAvailable
            },
            include: {
                provider: true
            }
        })

        return NextResponse.json(material)
    } catch (error) {
        console.error('Error updating material:', error)
        return NextResponse.json(
            { error: 'Error updating material' },
            { status: 500 }
        )
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const material = await db.material.delete({
            where: { id: params.id }
        })

        return NextResponse.json({ message: 'Material deleted successfully' })
    } catch (error) {
        console.error('Error deleting material:', error)
        return NextResponse.json(
            { error: 'Error deleting material' },
            { status: 500 }
        )
    }
}
