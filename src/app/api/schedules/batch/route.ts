import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { DayOfWeek } from '@prisma/client'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { schedules } = body

        if (!Array.isArray(schedules) || schedules.length === 0) {
            return NextResponse.json({ error: 'No schedules provided' }, { status: 400 })
        }

        // Create many schedules
        // Note: We need to convert strings to Dates and validate DayOfWeek enum
        const createdSchedules = await Promise.all(
            schedules.map(async (s: any) => {
                return db.schedule.create({
                    data: {
                        courseId: s.courseId,
                        teacherId: s.teacherId || null,
                        dayOfWeek: s.dayOfWeek as DayOfWeek,
                        startTime: new Date(s.startTime),
                        endTime: new Date(s.endTime),
                        classroom: s.classroom,
                        isRecurring: s.isRecurring !== undefined ? s.isRecurring : true,
                        subject: s.subject,
                        notes: s.notes,
                    }
                })
            })
        )

        return NextResponse.json({ count: createdSchedules.length })
    } catch (error) {
        console.error('Error importing schedules:', error)
        return NextResponse.json({ error: 'Error importing schedules' }, { status: 500 })
    }
}
