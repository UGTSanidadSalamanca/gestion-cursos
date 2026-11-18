import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { deactivateExpiredCourses } from '@/lib/course-utils'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await deactivateExpiredCourses()
        const { id } = await params
        const course = await db.course.findUnique({
            where: { id },
            select: {
                id: true,
                title: true,
                description: true,
                code: true,
                level: true,
                duration: true,
                durationPeriod: true,
                minStudents: true,
                maxStudents: true,
                price: true,
                priceUnit: true,
                paymentFrequency: true,
                hasRegistrationFee: true,
                registrationFee: true,
                affiliateRegistrationFee: true,
                affiliatePrice: true,
                isActive: true,
                startDate: true,
                startDateHasDay: true,
                endDate: true,
                publicDescription: true,
                benefits: true,
                features: true,
                callUrl: true,
                hasCertificate: true,
                hasMaterials: true,
                availableForNonMembers: true,
                hasDiscounts: true,
                discountDescription: true,
                discountRules: true,
                hasOffer: true,
                offerTitle: true,
                offerDescription: true,
                offerBadge: true,
                customHtml: true,
                imageUrl: true,
                showFaqs: true,
                includeGlobalFaqs: true,
                modules: {
                    select: {
                        title: true,
                        description: true,
                    }
                },
                schedules: {
                    select: {
                        dayOfWeek: true,
                        startTime: true,
                        endTime: true,
                        classroom: true,
                        isRecurring: true
                    },
                    orderBy: {
                        startTime: 'asc'
                    }
                }
            }
        })

        if (!course) {
            return NextResponse.json({ error: 'Course not found' }, { status: 404 })
        }

        // Obtener preguntas frecuentes si el bloque está activo para este curso
        let faqs: any[] = []
        if (course.showFaqs !== false) {
            const courseFaqs = await db.faq.findMany({
                where: { courseId: id, isActive: true },
                orderBy: [
                    { category: 'asc' },
                    { order: 'asc' },
                    { createdAt: 'asc' }
                ]
            })

            let globalFaqs: any[] = []
            if (course.includeGlobalFaqs !== false) {
                globalFaqs = await db.faq.findMany({
                    where: { courseId: null, isActive: true },
                    orderBy: [
                        { category: 'asc' },
                        { order: 'asc' },
                        { createdAt: 'asc' }
                    ]
                })
            }

            // Si una pregunta específica coincide con una global, prevalece la versión específica del curso
            const specificQuestions = new Set(courseFaqs.map(f => f.question.toLowerCase().trim()))
            const nonDuplicateGlobals = globalFaqs.filter(
                g => !specificQuestions.has(g.question.toLowerCase().trim())
            )

            faqs = [...courseFaqs, ...nonDuplicateGlobals]
        }

        return NextResponse.json({
            ...course,
            faqs
        })
    } catch (error) {
        console.error('Error fetching course:', error)
        return NextResponse.json({ error: 'Error fetching course' }, { status: 500 })
    }
}
