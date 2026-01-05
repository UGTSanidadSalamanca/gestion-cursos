import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const course = await db.course.findUnique({
            where: { id: params.id },
            select: {
                id: true,
                title: true,
                description: true,
                code: true,
                level: true,
                duration: true,
                price: true,
                affiliatePrice: true,
                isActive: true,
                startDate: true,
                endDate: true,
                publicDescription: true,
                benefits: true,
                features: true,
                callUrl: true,
                hasCertificate: true,
                hasMaterials: true,
                teacher: {
                    select: {
                        name: true
                    }
                }
            }
        })

        if (!course) {
            return NextResponse.json({ error: 'Course not found' }, { status: 404 })
        }

        return NextResponse.json(course)
    } catch (error) {
        return NextResponse.json({ error: 'Error fetching course' }, { status: 500 })
    }
}
