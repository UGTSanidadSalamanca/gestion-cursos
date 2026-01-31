import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const userId = searchParams.get('userId')

        if (!userId) {
            return NextResponse.json({ error: 'User ID required' }, { status: 400 })
        }

        // Find teacher profile linked to this user
        const teacher = await db.teacher.findFirst({
            where: { userId: userId }
        })

        if (!teacher) {
            return NextResponse.json({ error: 'Teacher profile not found' }, { status: 404 })
        }

        // Fetch all schedules for courses where this teacher has at least one scheduled session
        const schedules = await db.schedule.findMany({
            where: {
                course: {
                    schedules: {
                        some: {
                            teacherId: teacher.id
                        }
                    }
                }
            },
            include: {
                course: true,
                teacher: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            },
            orderBy: { startTime: 'asc' }
        })

        // Identify which schedules belong to the current teacher for the frontend to highlight
        const schedulesWithOwnership = schedules.map(s => ({
            ...s,
            isOwn: s.teacherId === teacher.id
        }))

        return NextResponse.json(schedulesWithOwnership)
    } catch (error) {
        console.error('Error fetching teacher schedule:', error)
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        )
    }
}

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json()
        const { id, userId, startTime, endTime, classroom, subject, notes } = body

        if (!id || !userId) {
            return NextResponse.json({ error: 'ID and User ID required' }, { status: 400 })
        }

        // Find teacher profile
        const teacher = await db.teacher.findFirst({
            where: { userId: userId }
        })

        if (!teacher) {
            return NextResponse.json({ error: 'Teacher profile not found' }, { status: 404 })
        }

        // Find schedule and verify ownership
        const schedule = await db.schedule.findUnique({
            where: { id: id }
        })

        if (!schedule) {
            return NextResponse.json({ error: 'Schedule not found' }, { status: 404 })
        }

        if (schedule.teacherId !== teacher.id) {
            return NextResponse.json({ error: 'Unauthorized: You do not own this schedule' }, { status: 403 })
        }

        // Update schedule
        const updatedSchedule = await db.schedule.update({
            where: { id: id },
            data: {
                startTime: startTime ? new Date(startTime) : undefined,
                endTime: endTime ? new Date(endTime) : undefined,
                classroom: classroom !== undefined ? classroom : undefined,
                subject: subject !== undefined ? subject : undefined,
                notes: notes !== undefined ? notes : undefined
            }
        })

        return NextResponse.json(updatedSchedule)
    } catch (error) {
        console.error('Error updating teacher schedule:', error)
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        )
    }
}
