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
                },
                schedules: {
                    include: {
                        teacher: true
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
            paymentFrequency,
            affiliatePrice,
            isActive,
            startDate,
            endDate,
            publicDescription,
            benefits,
            features,
            callUrl,
            hasMaterials,
            modules = [],
            schedules = []
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
                paymentFrequency,
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
                modules: {
                    deleteMany: {},
                    create: modules.map((m: any) => ({
                        title: m.title,
                        description: m.description,
                        teacherId: m.teacherId || null
                    }))
                },
                schedules: {
                    deleteMany: {},
                    create: schedules.map((s: any) => ({
                        dayOfWeek: s.dayOfWeek,
                        startTime: new Date(s.startTime),
                        endTime: new Date(s.endTime),
                        classroom: s.classroom,
                        teacherId: s.teacherId || null,
                        notes: s.notes,
                        isRecurring: s.isRecurring !== undefined ? s.isRecurring : true
                    }))
                }
            },
            include: {
                modules: {
                    include: {
                        teacher: true
                    }
                },
                schedules: {
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
