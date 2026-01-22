import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { sendGroupEmail } from '@/lib/email-service'

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id: courseId } = params
        const { subject, message } = await request.json()

        if (!subject || !message) {
            return NextResponse.json(
                { error: 'Asunto y mensaje son requeridos' },
                { status: 400 }
            )
        }

        // Buscar el curso y obtener los emails de los alumnos inscritos
        const enrollments = await db.enrollment.findMany({
            where: {
                courseId,
                status: {
                    in: ['ENROLLED', 'IN_PROGRESS']
                }
            },
            include: {
                student: {
                    select: {
                        email: true
                    }
                }
            }
        })

        const emails = enrollments
            .map(e => e.student.email)
            .filter((email): email is string => !!email)

        if (emails.length === 0) {
            return NextResponse.json(
                { error: 'No hay alumnos con email inscritos en este curso' },
                { status: 404 }
            )
        }

        // Enviar el email grupal
        const result = await sendGroupEmail(emails, subject, message)

        if (result.success) {
            return NextResponse.json({
                success: true,
                count: emails.length,
                message: `Email enviado correctamente a ${emails.length} alumnos.`
            })
        } else {
            return NextResponse.json(
                { error: 'Error al enviar el email', details: result.message },
                { status: 500 }
            )
        }
    } catch (error) {
        console.error('Error en API group-email:', error)
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        )
    }
}
