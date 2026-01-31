import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id

        if (!id) {
            return NextResponse.json({ error: 'Schedule ID is required' }, { status: 400 })
        }

        await db.schedule.delete({
            where: { id }
        })

        return NextResponse.json({ message: 'Schedule deleted successfully' })
    } catch (error) {
        console.error('Error deleting schedule:', error)
        return NextResponse.json({ error: 'Error deleting schedule' }, { status: 500 })
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id
        const body = await request.json()
        const { courseId, teacherId, dayOfWeek, startTime, endTime, classroom, isRecurring, notes } = body

        if (!id) {
            return NextResponse.json({ error: 'Schedule ID is required' }, { status: 400 })
        }

        const data: any = {}
        if (courseId) data.courseId = courseId
        if (teacherId !== undefined) data.teacherId = (teacherId === 'none' ? null : teacherId)
        if (dayOfWeek) data.dayOfWeek = dayOfWeek
        if (startTime) data.startTime = new Date(startTime)
        if (endTime) data.endTime = new Date(endTime)
        if (classroom !== undefined) data.classroom = classroom
        if (isRecurring !== undefined) data.isRecurring = isRecurring
        if (notes !== undefined) data.notes = notes

        const schedule = await db.schedule.update({
            where: { id },
            data
        })

        return NextResponse.json(schedule)
    } catch (error) {
        console.error('Error updating schedule:', error)
        return NextResponse.json({ error: 'Error updating schedule' }, { status: 500 })
    }
}
