import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const faq = await db.faq.findUnique({
      where: { id },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            code: true
          }
        }
      }
    })

    if (!faq) {
      return NextResponse.json({ error: 'Pregunta frecuente no encontrada' }, { status: 404 })
    }

    return NextResponse.json(faq)
  } catch (error) {
    console.error('Error fetching FAQ:', error)
    return NextResponse.json({ error: 'Error al obtener la pregunta frecuente' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { question, answer, category, order, isActive, courseId } = body

    const existingFaq = await db.faq.findUnique({ where: { id } })
    if (!existingFaq) {
      return NextResponse.json({ error: 'Pregunta frecuente no encontrada' }, { status: 404 })
    }

    const updateData: any = {}
    if (question !== undefined) updateData.question = question.trim()
    if (answer !== undefined) updateData.answer = answer.trim()
    if (category !== undefined) updateData.category = category.trim()
    if (order !== undefined) updateData.order = Number(order)
    if (isActive !== undefined) updateData.isActive = Boolean(isActive)
    if (courseId !== undefined) updateData.courseId = courseId ? String(courseId) : null

    const updated = await db.faq.update({
      where: { id },
      data: updateData,
      include: {
        course: {
          select: {
            id: true,
            title: true,
            code: true
          }
        }
      }
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating FAQ:', error)
    return NextResponse.json({ error: 'Error al actualizar la pregunta frecuente' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const existingFaq = await db.faq.findUnique({ where: { id } })
    if (!existingFaq) {
      return NextResponse.json({ error: 'Pregunta frecuente no encontrada' }, { status: 404 })
    }

    await db.faq.delete({ where: { id } })
    return NextResponse.json({ message: 'Pregunta frecuente eliminada correctamente' })
  } catch (error) {
    console.error('Error deleting FAQ:', error)
    return NextResponse.json({ error: 'Error al eliminar la pregunta frecuente' }, { status: 500 })
  }
}
