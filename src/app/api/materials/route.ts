import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const search = searchParams.get('search')
        const type = searchParams.get('type')

        let whereClause: any = {}

        if (search) {
            whereClause.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } }
            ]
        }

        if (type && type !== 'all') {
            whereClause.type = type
        }

        const materials = await db.material.findMany({
            where: whereClause,
            include: {
                provider: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        return NextResponse.json(materials)
    } catch (error) {
        console.error('Error fetching materials:', error)
        return NextResponse.json(
            { error: 'Error fetching materials' },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
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
            isAvailable = true
        } = body

        const materialData = {
            name,
            description,
            type,
            quantity: typeof quantity === 'string' ? parseInt(quantity) : quantity,
            unitPrice: typeof unitPrice === 'string' ? parseFloat(unitPrice) : unitPrice,
            location,
            providerId: providerId || null,
            isAvailable: isAvailable !== undefined ? isAvailable : true
        }

        const material = body.id
            ? await db.material.upsert({
                where: { id: body.id },
                update: materialData,
                create: { id: body.id, ...materialData },
                include: { provider: true }
            })
            : await db.material.create({
                data: materialData,
                include: { provider: true }
            })

        return NextResponse.json(material, { status: 201 })
    } catch (error) {
        console.error('Error creating material:', error)
        return NextResponse.json(
            { error: 'Error creating material' },
            { status: 500 }
        )
    }
}
