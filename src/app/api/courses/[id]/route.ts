import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const course = await db.course.findUnique({
            where: { id: params.id },
            include: {
                teacher: true,
                _count: {
                    select: { enrollments: true }
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

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const body = await request.json()
        const {
            title,
            description,
            code,
            level,
            duration,
            maxStudents,
            price,
            affiliatePrice,
            isActive,
            startDate,
            endDate,
            publicDescription,
            benefits,
            hasCertificate,
            hasMaterials,
            teacherId
        } = body

        const course = await db.course.update({
            where: { id: params.id },
            data: {
                title,
                description,
                code,
                level,
                duration: typeof duration === 'string' ? parseInt(duration) : duration,
                maxStudents: typeof maxStudents === 'string' ? parseInt(maxStudents) : maxStudents,
                price: typeof price === 'string' ? parseFloat(price) : price,
                affiliatePrice: affiliatePrice ? parseFloat(affiliatePrice) : null,
                isActive,
                startDate: startDate ? new Date(startDate) : null,
                endDate: endDate ? new Date(endDate) : null,
                publicDescription,
                benefits,
                hasCertificate,
                hasMaterials,
                teacherId: teacherId || null
            }
        })

        return NextResponse.json(course)
    } catch (error) {
        console.error('Error updating course:', error)
        return NextResponse.json({ error: 'Error updating course' }, { status: 500 })
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await db.course.delete({
            where: { id: params.id }
        })
        return NextResponse.json({ message: 'Course deleted successfully' })
    } catch (error) {
        return NextResponse.json({ error: 'Error deleting course' }, { status: 500 })
    }
}
