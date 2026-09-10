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

        return NextResponse.json(course)
    } catch (error) {
        return NextResponse.json({ error: 'Error fetching course' }, { status: 500 })
    }
}
