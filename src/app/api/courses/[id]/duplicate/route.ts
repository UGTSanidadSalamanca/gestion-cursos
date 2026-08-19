import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Cargar el curso original con sus módulos
    const original = await db.course.findUnique({
      where: { id },
      include: {
        modules: {
          include: {
            teacher: true
          }
        }
      }
    })

    if (!original) {
      return NextResponse.json({ error: 'Curso no encontrado' }, { status: 404 })
    }

    // Generar un código único para la copia
    // Buscamos cuántas copias ya existen del mismo código base
    const baseCode = original.code.replace(/-COPIA-\d+$/, '')
    const existingCopies = await db.course.findMany({
      where: {
        code: {
          startsWith: `${baseCode}-COPIA-`
        }
      },
      select: { code: true }
    })
    const nextIndex = existingCopies.length + 1
    const newCode = `${baseCode}-COPIA-${nextIndex}`

    // Crear el nuevo curso duplicado
    const duplicated = await db.course.create({
      data: {
        title: `[COPIA] ${original.title}`,
        description: original.description,
        code: newCode,
        level: original.level,
        duration: original.duration,
        durationSessions: original.durationSessions,
        sessionDuration: original.sessionDuration,
        durationMonths: original.durationMonths,
        durationPeriod: original.durationPeriod,
        syllabusUrl: original.syllabusUrl,
        maxStudents: original.maxStudents,
        price: original.price,
        priceUnit: original.priceUnit,
        paymentFrequency: original.paymentFrequency,
        affiliatePrice: original.affiliatePrice,
        publicDescription: original.publicDescription,
        benefits: original.benefits,
        features: original.features,
        callUrl: original.callUrl,
        hasCertificate: original.hasCertificate,
        hasMaterials: original.hasMaterials,
        // La copia nace inactiva y sin fechas (para que el usuario las configure)
        isActive: false,
        startDate: null,
        endDate: null,
        // Duplicar los módulos (sin IDs, se crearán nuevos)
        modules: {
          create: original.modules.map(m => ({
            title: m.title,
            description: m.description,
            teacherId: m.teacherId || null
          }))
        }
      },
      include: {
        modules: {
          include: { teacher: true }
        },
        _count: {
          select: { enrollments: true }
        }
      }
    })

    return NextResponse.json(duplicated, { status: 201 })
  } catch (error: any) {
    console.error('Error duplicating course:', error)
    // Error de código único duplicado
    if (error?.code === 'P2002') {
      return NextResponse.json(
        { error: 'Ya existe un curso con ese código. Inténtalo de nuevo.' },
        { status: 409 }
      )
    }
    return NextResponse.json({ error: 'Error al duplicar el curso' }, { status: 500 })
  }
}
