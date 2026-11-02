import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { sendGroupEmail } from '@/lib/email-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { enrollmentIds, subject, message, replyTo } = body

    if (!subject || typeof subject !== 'string' || !subject.trim()) {
      return NextResponse.json(
        { error: 'El asunto del correo es obligatorio' },
        { status: 400 }
      )
    }

    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json(
        { error: 'El mensaje del correo es obligatorio' },
        { status: 400 }
      )
    }

    if (!enrollmentIds || !Array.isArray(enrollmentIds) || enrollmentIds.length === 0) {
      return NextResponse.json(
        { error: 'Debes seleccionar al menos una matrícula' },
        { status: 400 }
      )
    }

    // Buscar las matrículas y los estudiantes correspondientes
    const enrollments = await db.enrollment.findMany({
      where: {
        id: { in: enrollmentIds }
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        course: {
          select: {
            id: true,
            title: true,
            code: true
          }
        }
      }
    })

    if (enrollments.length === 0) {
      return NextResponse.json(
        { error: 'No se encontraron las matrículas seleccionadas en la base de datos' },
        { status: 404 }
      )
    }

    // Filtrar emails únicos válidos y detectar alumnos sin email
    const emailToStudentMap = new Map<string, string>()
    const studentsWithoutEmail: string[] = []

    for (const item of enrollments) {
      const email = item.student?.email?.trim()
      const studentName = item.student?.name || 'Alumno'

      if (email && email.includes('@')) {
        const normalized = email.toLowerCase()
        if (!emailToStudentMap.has(normalized)) {
          emailToStudentMap.set(normalized, studentName)
        }
      } else {
        if (!studentsWithoutEmail.includes(studentName)) {
          studentsWithoutEmail.push(studentName)
        }
      }
    }

    const uniqueEmails = Array.from(emailToStudentMap.keys())

    if (uniqueEmails.length === 0) {
      return NextResponse.json(
        {
          error: 'Ninguno de los alumnos seleccionados tiene una dirección de email válida registrada',
          studentsWithoutEmail
        },
        { status: 400 }
      )
    }

    // Enviar el correo electrónico
    const result = await sendGroupEmail(uniqueEmails, subject.trim(), message.trim(), replyTo)

    if (result.success) {
      return NextResponse.json({
        success: true,
        sentCount: uniqueEmails.length,
        skippedCount: studentsWithoutEmail.length,
        skippedStudents: studentsWithoutEmail,
        message: `Correo enviado correctamente a ${uniqueEmails.length} alumno${uniqueEmails.length !== 1 ? 's' : ''}.`
      })
    } else {
      return NextResponse.json(
        {
          error: 'Error al enviar el correo',
          details: result.message || (result as any).error?.message || 'Error en el servidor de correo'
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error en /api/enrollments/email:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor al enviar el correo' },
      { status: 500 }
    )
  }
}
