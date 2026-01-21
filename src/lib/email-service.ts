import nodemailer from 'nodemailer'

// Configuración de transporte
// Estos valores deberían venir de variables de entorno en producción
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
    secure: process.env.EMAIL_SERVER_SECURE === 'true', // true para 465, false para otros
    auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
    },
})

interface EmailOptions {
    to: string
    subject: string
    text: string
    html?: string
}

export async function sendEmail({ to, subject, text, html }: EmailOptions) {
    // Si no hay credenciales configuradas, informamos en consola
    if (!process.env.EMAIL_SERVER_USER || !process.env.EMAIL_SERVER_PASSWORD) {
        console.warn('⚠️ EMAIL_SERVER_USER o EMAIL_SERVER_PASSWORD no configurados. Saltando envío de email.')
        console.log('--- EMAIL SIMULADO ---')
        console.log(`Para: ${to}`)
        console.log(`Asunto: ${subject}`)
        console.log(`Mensaje: ${text}`)
        console.log('----------------------')
        return { success: false, message: 'Falta configuración de correo' }
    }

    try {
        const info = await transporter.sendMail({
            from: process.env.EMAIL_FROM || '"Gestión Cursos UGT" <formacion.salamanca@ugt-sp.ugt.org>',
            to,
            subject,
            text,
            html: html || text,
        })

        console.log('Email enviado: %s', info.messageId)
        return { success: true, messageId: info.messageId }
    } catch (error) {
        console.error('Error enviando email:', error)
        return { success: false, error }
    }
}

export async function notifyNewEnrollment(data: {
    studentName: string
    studentDni: string
    courseName: string
    isAffiliated: boolean
    phone?: string
    email?: string
}) {
    const adminEmail = 'fespugtsalamanca@gmail.com'

    const subject = `🚀 Nueva Pre-inscripción: ${data.studentName} - ${data.courseName}`

    const text = `
    Se ha recibido una nueva pre-inscripción a través de la web.
    
    DETALLES DEL ALUMNO:
    - Nombre: ${data.studentName}
    - DNI: ${data.studentDni}
    - Teléfono: ${data.phone || 'No facilitado'}
    - Email: ${data.email || 'No facilitado'}
    - Afiliado UGT: ${data.isAffiliated ? 'SÍ' : 'NO'}
    
    CURSO:
    - Nombre: ${data.courseName}
    
    Estado: PENDIENTE DE PAGO
    
    Puedes ver más detalles en el panel de administración:
    http://localhost:3000/enrollments
  `

    const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 12px; overflow: hidden;">
      <div style="background-color: #2563eb; color: white; padding: 20px; text-align: center;">
        <h1 style="margin: 0; font-size: 20px;">Nueva Pre-inscripción Web</h1>
      </div>
      <div style="padding: 20px; color: #334155;">
        <p>Se ha recibido una nueva pre-inscripción para un curso.</p>
        
        <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h2 style="margin-top: 0; font-size: 16px; color: #1e293b; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">Detalles del Alumno</h2>
          <p style="margin: 8px 0;"><strong>Nombre:</strong> ${data.studentName}</p>
          <p style="margin: 8px 0;"><strong>DNI:</strong> ${data.studentDni}</p>
          <p style="margin: 8px 0;"><strong>Teléfono:</strong> ${data.phone || '---'}</p>
          <p style="margin: 8px 0;"><strong>Email:</strong> ${data.email || '---'}</p>
          <p style="margin: 8px 0;"><strong>Afiliado UGT:</strong> ${data.isAffiliated ? '<span style="color: #16a34a; font-weight: bold;">SÍ</span>' : '<span style="color: #64748b;">NO</span>'}</p>
        </div>
        
        <div style="background-color: #eff6ff; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #dbeafe;">
          <h2 style="margin-top: 0; font-size: 16px; color: #1e40af;">Curso Seleccionado</h2>
          <p style="margin: 8px 0; font-size: 18px; font-weight: bold; color: #1e3a8a;">${data.courseName}</p>
          <p style="margin: 8px 0; color: #3b82f6;"><strong>Estado:</strong> PAGO PENDIENTE</p>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
          <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/enrollments" style="background-color: #2563eb; color: white; padding: 12px 25px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
            Ver en el Panel de Administración
          </a>
        </div>
      </div>
      <div style="background-color: #f1f5f9; color: #94a3b8; padding: 15px; text-align: center; font-size: 12px;">
        Este es un mensaje automático del sistema de Gestión de Cursos - UGT Sanidad Salamanca.
      </div>
    </div>
  `

    return sendEmail({ to: adminEmail, subject, text, html })
}
