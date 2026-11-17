import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { faqId, targetCourseId = null } = body

    if (!faqId) {
      return NextResponse.json({ error: 'ID de pregunta no proporcionado' }, { status: 400 })
    }

    const sourceFaq = await db.faq.findUnique({ where: { id: faqId } })
    if (!sourceFaq) {
      return NextResponse.json({ error: 'Pregunta frecuente de origen no encontrada' }, { status: 404 })
    }

    // Calcular orden para el destino
    const lastFaq = await db.faq.findFirst({
      where: { courseId: targetCourseId ? String(targetCourseId) : null },
      orderBy: { order: 'desc' }
    })
    const newOrder = lastFaq ? lastFaq.order + 1 : 1

    const duplicated = await db.faq.create({
      data: {
        question: targetCourseId && sourceFaq.courseId === null ? sourceFaq.question : `${sourceFaq.question} (Copia)`,
        answer: sourceFaq.answer,
        category: sourceFaq.category,
        order: newOrder,
        isActive: sourceFaq.isActive,
        courseId: targetCourseId ? String(targetCourseId) : null
      },
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

    return NextResponse.json(duplicated, { status: 201 })
  } catch (error) {
    console.error('Error duplicating FAQ:', error)
    return NextResponse.json({ error: 'Error al duplicar la pregunta frecuente' }, { status: 500 })
  }
}
