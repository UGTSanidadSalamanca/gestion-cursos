import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId')
    const category = searchParams.get('category')
    const isActive = searchParams.get('isActive')
    const search = searchParams.get('search')

    const whereClause: any = {}

    if (courseId === 'global') {
      whereClause.courseId = null
    } else if (courseId && courseId !== 'all') {
      whereClause.courseId = courseId
    }

    if (category && category !== 'all') {
      whereClause.category = category
    }

    if (isActive !== null && isActive !== undefined && isActive !== '') {
      whereClause.isActive = isActive === 'true'
    }

    if (search && search.trim() !== '') {
      whereClause.OR = [
        { question: { contains: search, mode: 'insensitive' } },
        { answer: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } }
      ]
    }

    const faqs = await db.faq.findMany({
      where: whereClause,
      include: {
        course: {
          select: {
            id: true,
            title: true,
            code: true
          }
        }
      },
      orderBy: [
        { category: 'asc' },
        { order: 'asc' },
        { createdAt: 'asc' }
      ]
    })

    return NextResponse.json(faqs)
  } catch (error) {
    console.error('Error fetching FAQs:', error)
    return NextResponse.json({ error: 'Error al obtener preguntas frecuentes' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { question, answer, category = 'General', order, isActive = true, courseId = null } = body

    if (!question || typeof question !== 'string' || question.trim() === '') {
      return NextResponse.json({ error: 'La pregunta es obligatoria' }, { status: 400 })
    }

    if (!answer || typeof answer !== 'string' || answer.trim() === '') {
      return NextResponse.json({ error: 'La respuesta es obligatoria' }, { status: 400 })
    }

    // Calcular orden si no viene especificado
    let calculatedOrder = order
    if (calculatedOrder === undefined || calculatedOrder === null) {
      const lastFaq = await db.faq.findFirst({
        where: { courseId: courseId || null },
        orderBy: { order: 'desc' }
      })
      calculatedOrder = lastFaq ? lastFaq.order + 1 : 1
    }

    const faq = await db.faq.create({
      data: {
        question: question.trim(),
        answer: answer.trim(),
        category: (category || 'General').trim(),
        order: Number(calculatedOrder),
        isActive: Boolean(isActive),
        courseId: courseId ? String(courseId) : null
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

    return NextResponse.json(faq, { status: 201 })
  } catch (error) {
    console.error('Error creating FAQ:', error)
    return NextResponse.json({ error: 'Error al crear la pregunta frecuente' }, { status: 500 })
  }
}
