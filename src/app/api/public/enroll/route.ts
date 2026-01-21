import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { NotificationService } from '@/lib/notification-service'
import { notifyNewEnrollment } from '@/lib/email-service'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { name, email, phone, dni, isAffiliated, courseId } = body

        if (!name || !dni || !courseId) {
            return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 })
        }

        // 1. Buscar o crear el estudiante por DNI
        const student = await db.student.upsert({
            where: { dni: dni },
            update: {
                name: name,
                email: email || undefined,
                phone: phone || undefined,
                isAffiliated: isAffiliated ?? false,
            },
            create: {
                name: name,
                dni: dni,
                email: email || undefined,
                phone: phone || undefined,
                isAffiliated: isAffiliated ?? false,
            }
        })

        // 2. Comprobar si ya está matriculado en este curso
        const existingEnrollment = await db.enrollment.findUnique({
            where: {
                studentId_courseId: {
                    studentId: student.id,
                    courseId: courseId
                }
            }
        })

        if (existingEnrollment) {
            return NextResponse.json({
                message: 'Ya existe una pre-inscripción para este alumno',
                enrollment: existingEnrollment
            }, { status: 200 })
        }

        // 3. Crear la matricula en estado PENDING
        const enrollment = await db.enrollment.create({
            data: {
                studentId: student.id,
                courseId: courseId,
                status: 'PENDING',
                notes: `Auto-inscripción web. Afiliado: ${isAffiliated ? 'SÍ' : 'NO'}`
            },
            include: {
                course: true
            }
        })

        // 4. Notificaciones (Interna y Email) - Ejecutadas de forma asíncrona pero sin bloquear la respuesta
        // En Next.js App Router (Server Actions/Routes), para asegurar que se ejecuten antes de cerrar la función
        // podemos envolverlas en promesas pero no necesariamente esperar a que terminen si queremos rapidez,
        // aunque en Serverless es mejor esperarlas para evitar que se maten prematuramente.
        // Vamos a esperarlas pero con un try/catch muy robusto.
        try {
            // Notificación interna
            NotificationService.create({
                title: 'Nueva Pre-inscripción Web',
                message: `${name} se ha inscrito en ${enrollment.course.title}`,
                type: 'INFO',
                priority: 'HIGH',
                category: 'STUDENT',
                actionUrl: '/enrollments'
            }).catch(e => console.error('Error notif interna:', e));

            // Notificación por Email
            notifyNewEnrollment({
                studentName: name,
                studentDni: dni,
                courseName: enrollment.course.title,
                isAffiliated: !!isAffiliated,
                phone: phone,
                email: email,
                price: !!isAffiliated ? enrollment.course.affiliatePrice : enrollment.course.price,
                priceUnit: enrollment.course.priceUnit
            }).catch(e => console.error('Error notify email:', e));

        } catch (notifyError) {
            console.error('Error disparando notificaciones:', notifyError)
        }

        console.log(`Inscripción exitosa: ${name} en ${enrollment.course.title}`);

        return NextResponse.json({
            message: 'Inscripción realizada con éxito',
            enrollment
        }, { status: 201 })

    } catch (error) {
        console.error('Error in public enroll:', error)
        return NextResponse.json({ error: 'Error al procesar la inscripción' }, { status: 500 })
    }
}
