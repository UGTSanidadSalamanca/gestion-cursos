import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
    try {
        const schedules = await db.schedule.findMany({
            include: {
                course: true,
                teacher: true
            },
            orderBy: { startTime: 'asc' }
        })
        return NextResponse.json(schedules)
    } catch (error) {
        return NextResponse.json({ error: 'Error fetching schedules' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { courseId, teacherId, dayOfWeek, startTime, endTime, classroom, isRecurring, notes, id } = body

        if (!courseId || !dayOfWeek || !startTime || !endTime) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const schedule = await db.schedule.create({
            data: {
                id: id || undefined,
                courseId,
                teacherId: teacherId || null,
                dayOfWeek,
                startTime: new Date(startTime),
                endTime: new Date(endTime),
                classroom,
                isRecurring: isRecurring !== undefined ? isRecurring : true,
                notes,
            },
        })

        return NextResponse.json(schedule)
    } catch (error) {
        console.error('Error creating schedule:', error)
        return NextResponse.json({ error: 'Error creating schedule' }, { status: 500 })
    }
}
