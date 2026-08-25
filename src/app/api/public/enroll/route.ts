import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { NotificationService } from '@/lib/notification-service'
import { notifyNewEnrollment } from '@/lib/email-service'
import { syncStudentToGoogleContacts } from '@/lib/google-contacts-service'
import { isCourseExpired } from '@/lib/course-utils'

export async function POST(request: NextRequest) {
    let body;
    try {
        body = await request.json()
    } catch (e) {
        return NextResponse.json({ error: 'Formato de datos inválido' }, { status: 400 })
    }

    const { name, email, phone, dni, isAffiliated, courseId, wantsDiscount, requestedDiscountPercentage, requestedDiscountConcept, discountDetails } = body

    try {
        if (!name || !dni || !email || !courseId) {
            return NextResponse.json({ error: 'Faltan campos obligatorios: Nombre, DNI y Correo Electrónico son requeridos' }, { status: 400 })
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email.trim())) {
            return NextResponse.json({ error: 'El formato del correo electrónico no es válido' }, { status: 400 })
        }

        // 0. Verificar si el curso existe, está activo y no está vencido
        const targetCourse = await db.course.findUnique({
            where: { id: courseId }
        })

        if (!targetCourse) {
            return NextResponse.json({ error: 'Curso no encontrado' }, { status: 404 })
        }

        if (!targetCourse.isActive || isCourseExpired(targetCourse.endDate)) {
            return NextResponse.json({
                error: 'El periodo de inscripción para este curso ha concluido o no está disponible actualmente.'
            }, { status: 400 })
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
            // Si ya existe la matrícula, nos aseguramos de que el contacto esté sincronizado en Google Contacts
            try {
                await syncStudentToGoogleContacts({
                    name,
                    email,
                    phone,
                    dni,
                    isAffiliated: !!isAffiliated,
                    courseTitle: existingEnrollment.course.title,
                    courseCode: existingEnrollment.course.code
                })
            } catch (e) {
                console.error("Error sincronizando alumno existente con Google Contacts:", e)
            }

            return NextResponse.json({
                message: 'Ya existe una pre-inscripción para este alumno',
                enrollment: existingEnrollment
            }, { status: 200 })
        }

        // 3. Crear la matricula en estado PENDING con el descuento solicitado
        const discountSummary = wantsDiscount
            ? (requestedDiscountPercentage
                ? `${requestedDiscountPercentage}% - ${requestedDiscountConcept || 'Motivo general'}${discountDetails ? ` (Obs: ${discountDetails})` : ''}`
                : (discountDetails || 'Solicitud de descuento'))
            : null

        const enrollment = await db.enrollment.create({
            data: {
                studentId: student.id,
                courseId: courseId,
                status: 'PENDING',
                discountPercentage: wantsDiscount && requestedDiscountPercentage ? parseInt(requestedDiscountPercentage) : null,
                discountReason: wantsDiscount && requestedDiscountConcept ? requestedDiscountConcept : null,
                notes: `Auto-inscripción web. Afiliado: ${isAffiliated ? 'SÍ' : 'NO'}${discountSummary ? ` | SOLICITA DESCUENTO: ${discountSummary}` : ''}`
            },
            include: {
                course: true
            }
        })

        // 4. Notificaciones y Automatizaciones (Ejecución independiente y segura)
        try {
            await NotificationService.create({
                title: 'Nueva Pre-inscripción Web',
                message: `${name} se ha inscrito en ${enrollment.course.title}`,
                type: 'INFO',
                priority: 'HIGH',
                category: 'STUDENT',
                actionUrl: '/enrollments'
            })
        } catch (notifErr) {
            console.error('Error creando notificación interna:', notifErr)
        }

        try {
            const basePrice = !!isAffiliated ? enrollment.course.affiliatePrice : enrollment.course.price;
            const finalPrice = basePrice !== null && basePrice !== undefined && wantsDiscount && requestedDiscountPercentage
                ? Math.round(basePrice * (1 - (requestedDiscountPercentage / 100)) * 100) / 100
                : basePrice;

            await notifyNewEnrollment({
                studentName: name,
                studentDni: dni,
                courseName: enrollment.course.title,
                isAffiliated: !!isAffiliated,
                phone: phone,
                email: email,
                basePrice: basePrice,
                price: finalPrice,
                discountPercentage: wantsDiscount ? requestedDiscountPercentage : null,
                discountReason: wantsDiscount ? requestedDiscountConcept : null,
                priceUnit: enrollment.course.priceUnit
            })
        } catch (emailErr) {
            console.error('Error enviando email de nueva inscripción:', emailErr)
        }

        try {
            // Sincronizar contacto en Google Contacts con etiqueta del curso
            await syncStudentToGoogleContacts({
                name,
                email,
                phone,
                dni,
                isAffiliated: !!isAffiliated,
                courseTitle: enrollment.course.title,
                courseCode: enrollment.course.code
            })
        } catch (contactsErr) {
            console.error('Error sincronizando con Google Contacts:', contactsErr)
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
