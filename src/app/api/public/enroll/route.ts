import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { NotificationService } from '@/lib/notification-service'
import { notifyNewEnrollment } from '@/lib/email-service'

export async function POST(request: NextRequest) {
    let body;
    try {
        body = await request.json()
    } catch (e) {
        return NextResponse.json({ error: 'Formato de datos inválido' }, { status: 400 })
    }

    const { name, email, phone, dni, isAffiliated, courseId } = body

    try {
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
                isAffiliated: !!isAffiliated,
            },
            create: {
                name: name,
                dni: dni,
                email: email || undefined,
                phone: phone || undefined,
                isAffiliated: !!isAffiliated,
            }
        })

        // 2. Comprobar si ya está matriculado en este curso
        const existingEnrollment = await db.enrollment.findUnique({
            where: {
                studentId_courseId: {
                    studentId: student.id,
                    courseId: courseId
                }
            },
            include: { course: true }
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

        // 4. Notificaciones (Interna y Email) - AHORA AWAIT para asegurar envío en Vercel
        try {
            await NotificationService.create({
                title: 'Nueva Pre-inscripción Web',
                message: `${name} se ha inscrito en ${enrollment.course.title}`,
                type: 'INFO',
                priority: 'HIGH',
                category: 'STUDENT',
                actionUrl: '/enrollments'
            })

            await notifyNewEnrollment({
                studentName: name,
                studentDni: dni,
                courseName: enrollment.course.title,
                isAffiliated: !!isAffiliated,
                phone: phone,
                email: email,
                price: !!isAffiliated ? enrollment.course.affiliatePrice : enrollment.course.price,
                priceUnit: enrollment.course.priceUnit
            })
        } catch (notifyError) {
            console.error('Error disparando notificaciones:', notifyError)
            // No bloqueamos la respuesta al usuario si fallan las notificaciones
        }

        return NextResponse.json({
            message: 'Inscripción realizada con éxito',
            enrollment
        }, { status: 201 })

    } catch (error) {
        console.error('CRITICAL ERROR in public enroll API:', error)
        return NextResponse.json({
            error: 'Error técnico al procesar la inscripción',
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 })
    }
}
