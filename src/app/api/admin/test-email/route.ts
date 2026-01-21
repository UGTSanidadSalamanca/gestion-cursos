import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email-service'
import { getServerSession } from 'next-auth'
// Importar authOptions si existe, o usar una versión simplificada para el test

export async function GET(request: NextRequest) {
    try {
        // En un entorno real verificaríamos sesión, pero para este test rápido 
        // vamos a intentar enviar el correo directamente a la dirección configurada

        const testResult = await sendEmail({
            to: 'fespugtsalamanca@gmail.com',
            subject: '🔔 Prueba de Configuración de Email',
            text: 'Si estás recibiendo esto, ¡tu configuración de Google y Vercel es CORRECTA!',
            html: `
                <div style="font-family: sans-serif; padding: 20px; border: 2px solid #2563eb; border-radius: 10px;">
                    <h1 style="color: #2563eb;">✅ ¡Configuración Correcta!</h1>
                    <p>Este es un correo de prueba para verificar que el sistema de notificaciones está funcionando.</p>
                    <p><strong>Detalles técnicos:</strong></p>
                    <ul>
                        <li>Servidor: SMTP Gmail</li>
                        <li>Puerto: 587</li>
                    </ul>
                    <p>Ya puedes estar tranquilo/a, recibirás un aviso cada vez que alguien se inscriba.</p>
                </div>
            `
        })

        if (testResult.success) {
            return NextResponse.json({ message: 'Email de prueba enviado con éxito. Revisa tu bandeja de entrada.' })
        } else {
            return NextResponse.json({
                error: 'Error al enviar el email',
                details: testResult.error,
                warning: 'Asegúrate de haber quitado los espacios en la contraseña y de haber hecho "Redeploy" en Vercel.'
            }, { status: 500 })
        }
    } catch (error) {
        console.error('Test email error:', error)
        return NextResponse.json({ error: 'Excepción técnica al probar el email' }, { status: 500 })
    }
}
