import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        await db.enrollment.delete({
            where: { id }
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
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const body = await request.json()
        const { status, discountPercentage, discountReason } = body

        const enrollment = await db.enrollment.update({
            where: { id },
            data: { 
                status,
                discountPercentage: discountPercentage !== undefined ? (discountPercentage === null ? null : parseInt(discountPercentage)) : undefined,
                discountReason: discountReason !== undefined ? discountReason : undefined
            },
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
