import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await db.enrollment.delete({
            where: { id: params.id }
        })

        return NextResponse.json({ message: 'Matrícula eliminada correctamente' })
    } catch (error) {
        console.error('Error deleting enrollment:', error)
        return NextResponse.json(
            { error: 'Error al eliminar la matrícula' },
            { status: 500 }
        )
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const body = await request.json()
        const { status } = body

        const enrollment = await db.enrollment.update({
            where: { id: params.id },
            data: { status },
            include: { student: true, course: true }
        })

        return NextResponse.json(enrollment)
    } catch (error) {
        console.error('Error updating enrollment:', error)
        return NextResponse.json(
            { error: 'Error al actualizar la matrícula' },
            { status: 500 }
        )
    }
}
