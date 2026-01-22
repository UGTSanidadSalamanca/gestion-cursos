import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { sendEmail } from '@/lib/email-service'

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id: studentId } = params
        const { subject, message } = await request.json()

        if (!subject || !message) {
            return NextResponse.json(
                { error: 'Asunto y mensaje son requeridos' },
                { status: 400 }
            )
        }

        // Buscar el estudiante
        const student = await db.student.findUnique({
            where: { id: studentId },
            select: {
                email: true,
                name: true
            }
        })

        if (!student || !student.email) {
            return NextResponse.json(
                { error: 'El estudiante no tiene un email registrado' },
                { status: 404 }
            )
        }

        // Enviar el email individual
        const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 12px; overflow: hidden;">
        <div style="background-color: #ef4444; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 20px;">UGT Formación Salamanca</h1>
        </div>
        <div style="padding: 20px; color: #334155; line-height: 1.6;">
          <p>Estimado/a ${student.name},</p>
          <p style="white-space: pre-wrap;">${message}</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 14px; color: #64748b;">
            <p>Cordialmente,</p>
            <p><strong>UGT Formación Salamanca</strong><br/>
            Secretaría de Formación</p>
          </div>
        </div>
        <div style="background-color: #f1f5f9; color: #94a3b8; padding: 15px; text-align: center; font-size: 11px;">
          Este es un mensaje enviado desde el centro de formación UGT Salamanca.
        </div>
      </div>
    `

        const result = await sendEmail({
            to: student.email,
            subject: subject,
            text: message,
            html
        })

        if (result.success) {
            return NextResponse.json({
                success: true,
                message: `Email enviado correctamente a ${student.name}.`
            })
        } else {
            return NextResponse.json(
                { error: 'Error al enviar el email', details: result.message },
                { status: 500 }
            )
        }
    } catch (error) {
        console.error('Error en API individual student email:', error)
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        )
    }
}
