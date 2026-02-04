import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const course = await db.course.findUnique({
            where: { id },
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

const dayMapping: Record<string, 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY'> = {
    'Lunes': 'MONDAY', 'Martes': 'TUESDAY', 'Miércoles': 'WEDNESDAY', 'Jueves': 'THURSDAY', 'Viernes': 'FRIDAY', 'Sábado': 'SATURDAY', 'Domingo': 'SUNDAY',
    'MONDAY': 'MONDAY', 'TUESDAY': 'TUESDAY', 'WEDNESDAY': 'WEDNESDAY', 'THURSDAY': 'THURSDAY', 'FRIDAY': 'FRIDAY', 'SATURDAY': 'SATURDAY', 'SUNDAY': 'SUNDAY',
    'LUNES': 'MONDAY', 'MARTES': 'TUESDAY', 'MIERCOLES': 'WEDNESDAY', 'JUEVES': 'THURSDAY', 'VIERNES': 'FRIDAY', 'SABADO': 'SATURDAY', 'DOMINGO': 'SUNDAY',
}

function parseTime(timeStr: string | Date): Date {
    if (timeStr instanceof Date) return timeStr;
    if (!timeStr) return new Date();

    // Si viene en formato ISO completo
    if (timeStr.includes('T')) return new Date(timeStr);

    // Si viene solo hora HH:mm
    const [hours, minutes] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setUTCHours(hours || 0, minutes || 0, 0, 0);
    date.setFullYear(1970, 0, 1);
    return date;
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
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
            hasCertificate,
            hasMaterials,
            // @ts-ignore
            modules = [],
            // @ts-ignore
            schedules = []
        } = body

        console.log('Updating course:', id);

        const course = await db.course.update({
            where: { id },
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
                    create: schedules.map((s: any) => {
                        const dayKey = s.dayOfWeek || s.day || 'Lunes';
                        const normalizedDay = dayKey.charAt(0).toUpperCase() + dayKey.slice(1).toLowerCase();
                        let mappedDay = dayMapping[dayKey] || dayMapping[normalizedDay];

                        if (!mappedDay) {
                            if (dayKey.toUpperCase() === 'MIERCOLES') mappedDay = 'WEDNESDAY';
                            if (dayKey.toUpperCase() === 'SABADO') mappedDay = 'SATURDAY';
                        }

                        return {
                            dayOfWeek: mappedDay || 'MONDAY',
                            startTime: parseTime(s.startTime),
                            endTime: parseTime(s.endTime),
                            classroom: s.classroom,
                            teacherId: s.teacherId || null,
                            notes: s.notes,
                            isRecurring: s.isRecurring !== undefined ? s.isRecurring : true
                        }
                    })
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
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        await db.course.delete({
            where: { id }
        })
        return NextResponse.json({ message: 'Course deleted successfully' })
    } catch (error) {
        return NextResponse.json({ error: 'Error deleting course' }, { status: 500 })
    }
}
