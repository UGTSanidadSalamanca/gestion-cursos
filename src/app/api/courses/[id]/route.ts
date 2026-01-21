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
                modules: {
                    include: {
                        teacher: true
                    }
                },
                _count: {
                    select: { enrollments: true }
                },
                enrollments: {
                    include: {
                        student: true
                    },
                    orderBy: {
                        createdAt: 'desc'
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
            durationSessions,
            sessionDuration,
            durationMonths,
            durationPeriod,
            syllabusUrl,
            maxStudents,
            price,
            priceUnit,
            affiliatePrice,
            isActive,
            startDate,
            endDate,
            publicDescription,
            benefits,
            features,
            callUrl,
            hasCertificate,
            hasMaterials,
            teacherId,
            modules = []
        } = body

        const course = await db.course.update({
            where: { id: params.id },
            data: {
                title,
                description,
                code,
                level,
                duration: typeof duration === 'string' ? parseInt(duration) : duration,
                durationSessions: typeof durationSessions === 'string' ? parseInt(durationSessions) : durationSessions,
                sessionDuration: typeof sessionDuration === 'string' ? parseFloat(sessionDuration) : sessionDuration,
                durationMonths: typeof durationMonths === 'string' ? parseInt(durationMonths) : durationMonths,
                durationPeriod,
                syllabusUrl,
                maxStudents: typeof maxStudents === 'string' ? parseInt(maxStudents) : maxStudents,
                price: typeof price === 'string' ? parseFloat(price) : price,
                priceUnit,
                affiliatePrice: affiliatePrice ? parseFloat(affiliatePrice) : null,
                isActive,
                startDate: startDate ? new Date(startDate) : null,
                endDate: endDate ? new Date(endDate) : null,
                publicDescription,
                benefits,
                features,
                callUrl,
                hasCertificate,
                hasMaterials,
                teacherId: teacherId || null,
                modules: {
                    deleteMany: {},
                    create: modules.map((m: any) => ({
                        title: m.title,
                        description: m.description,
                        teacherId: m.teacherId || null
                    }))
                }
            },
            include: {
                teacher: true,
                modules: {
                    include: {
                        teacher: true
                    }
                }
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
