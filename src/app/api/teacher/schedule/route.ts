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

        const schedules = await db.schedule.findMany({
            where: {
                teacherId: teacher.id
            },
            include: {
                course: true
            },
            orderBy: { startTime: 'asc' }
        })

        return NextResponse.json(schedules)
    } catch (error) {
        console.error('Error fetching teacher schedule:', error)
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        )
    }
}
