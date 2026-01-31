import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
    try {
        const enrollments = await db.enrollment.findMany({
            where: {
                OR: [
                    { status: 'ENROLLED' },
                    { status: 'IN_PROGRESS' }
                ]
            },
            include: {
                student: true,
                course: {
                    include: {
                        payments: {
                            where: {
                                status: 'PAID'
                            }
                        }
                    }
                }
            }
        })

        const tracking = enrollments.map(enrollment => {
            const studentPayments = enrollment.course.payments.filter(p => p.studentId === enrollment.studentId)
            const paidTotal = studentPayments.reduce((sum, p) => sum + p.amount, 0)

            const price = enrollment.course.price || 0
            const priceUnit = enrollment.course.priceUnit?.toUpperCase() || 'MONTH'
            const paymentFrequency = enrollment.course.paymentFrequency?.toUpperCase() || 'MONTHLY'

            // Calculate how many periods have passed since enrollment or course start
            const startDate = enrollment.course.startDate || enrollment.enrollmentDate
            const now = new Date()
            const monthsDiff = (now.getFullYear() - startDate.getFullYear()) * 12 + (now.getMonth() - startDate.getMonth()) + 1

            let expectedToDate = 0
            if (priceUnit.includes('MONTH')) {
                expectedToDate = price * monthsDiff
            } else if (priceUnit.includes('TRIMESTR') || priceUnit.includes('QUARTER')) {
                const trimesters = Math.ceil(monthsDiff / 3)
                expectedToDate = price * trimesters
            } else if (priceUnit.includes('YEAR') || priceUnit.includes('ANUAL')) {
                const years = Math.ceil(monthsDiff / 12)
                expectedToDate = price * years
            } else {
                expectedToDate = price // Default to single payment if FULL or unknown
            }

            return {
                id: enrollment.id,
                studentId: enrollment.studentId,
                studentName: enrollment.student.name,
                studentEmail: enrollment.student.email,
                courseId: enrollment.courseId,
                courseTitle: enrollment.course.title,
                coursePrice: price,
                priceUnit,
                paymentFrequency,
                paidTotal,
                expectedToDate,
                pendingAmount: Math.max(0, expectedToDate - paidTotal),
                status: paidTotal >= expectedToDate ? 'PAID' : (paidTotal > 0 ? 'PARTIAL' : 'PENDING'),
                enrollmentDate: enrollment.enrollmentDate,
                lastPaymentDate: studentPayments.length > 0
                    ? new Date(Math.max(...studentPayments.map(p => new Date(p.paymentDate).getTime()))).toISOString()
                    : null
            }
        })

        return NextResponse.json(tracking)
    } catch (error) {
        console.error('Error in payment tracking API:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
