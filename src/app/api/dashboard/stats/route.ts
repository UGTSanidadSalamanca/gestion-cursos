import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
    try {
        // 1. Estudiantes totales y alumnos inscritos
        const totalStudents = await db.student.count({
            where: { status: 'ACTIVE' }
        })

        // 2. Cursos activos
        const activeCourses = await db.course.count({
            where: { isActive: true }
        })

        // 3. Alumnos inscritos (matrículas activas)
        const activeEnrollments = await db.enrollment.count({
            where: {
                OR: [
                    { status: 'ENROLLED' },
                    { status: 'IN_PROGRESS' }
                ]
            }
        })

        // 4. Ingresos y Morosidad
        const now = new Date()
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

        // Pagos cobrados este mes (Cálculo normalizado MRR)
        const monthlyPayments = await db.payment.findMany({
            where: {
                status: 'PAID',
                paidDate: { gte: firstDayOfMonth }
            },
            include: {
                course: {
                    select: {
                        priceUnit: true
                    }
                }
            }
        })

        let monthlyRevenue = 0
        monthlyPayments.forEach(payment => {
            const amount = payment.amount
            const unit = payment.course?.priceUnit?.toUpperCase() || 'MONTH'

            if (unit.includes('TRIMESTR') || unit.includes('QUARTER')) {
                monthlyRevenue += amount / 3
            } else if (unit.includes('YEAR') || unit.includes('AÑ') || unit.includes('ANUAL')) {
                monthlyRevenue += amount / 12
            } else if (unit.includes('SEMESTR')) {
                monthlyRevenue += amount / 6
            } else {
                monthlyRevenue += amount
            }
        })

        // Pagos pendientes totales
        const pendingRevenueData = await db.payment.aggregate({
            where: { status: 'PENDING' },
            _sum: { amount: true }
        })

        // Pagos vencidos/morosidad
        const overdueRevenueData = await db.payment.aggregate({
            where: { status: 'OVERDUE' },
            _sum: { amount: true }
        })

        const pendingRevenue = pendingRevenueData._sum.amount || 0
        const overdueRevenue = overdueRevenueData._sum.amount || 0

        // 5. Profesores y personal
        const totalTeachers = await db.teacher.count({ where: { status: 'ACTIVE' } })

        // 6. Otros datos
        const totalMaterials = await db.material.count({ where: { isAvailable: true } })
        const totalSuppliers = await db.provider.count({ where: { status: 'ACTIVE' } })
        const totalSchedules = await db.schedule.count()

        // 7. Ingresos Previstos (Cálculo basado en matrículas activas)
        const activeEnrollmentsData = await db.enrollment.findMany({
            where: {
                OR: [
                    { status: 'ENROLLED' },
                    { status: 'IN_PROGRESS' }
                ]
            },
            include: {
                course: {
                    select: {
                        price: true,
                        priceUnit: true
                    }
                }
            }
        })

        let expectedRevenue = 0
        activeEnrollmentsData.forEach(enrollment => {
            const price = enrollment.course.price || 0
            const unit = enrollment.course.priceUnit?.toUpperCase() || 'MONTH'

            if (unit.includes('TRIMESTR') || unit.includes('QUARTER')) {
                expectedRevenue += price / 3
            } else if (unit.includes('YEAR') || unit.includes('AÑ') || unit.includes('ANUAL')) {
                expectedRevenue += price / 12
            } else if (unit.includes('SEMESTR')) {
                expectedRevenue += price / 6
            } else {
                expectedRevenue += price
            }
        })

        // 7. Comparativa mes anterior
        const firstDayOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        const lastDayOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

        const lastMonthPayments = await db.payment.findMany({
            where: {
                status: 'PAID',
                paidDate: { gte: firstDayOfLastMonth, lte: lastDayOfLastMonth }
            },
            include: {
                course: {
                    select: {
                        priceUnit: true
                    }
                }
            }
        })

        let lastMonthRevenue = 0
        lastMonthPayments.forEach(payment => {
            const amount = payment.amount
            const unit = payment.course?.priceUnit?.toUpperCase() || 'MONTH'

            if (unit.includes('TRIMESTR') || unit.includes('QUARTER')) {
                lastMonthRevenue += amount / 3
            } else if (unit.includes('YEAR') || unit.includes('AÑ') || unit.includes('ANUAL')) {
                lastMonthRevenue += amount / 12
            } else if (unit.includes('SEMESTR')) {
                lastMonthRevenue += amount / 6
            } else {
                lastMonthRevenue += amount
            }
        })

        let revenueTrend = 0
        if (lastMonthRevenue > 0) {
            revenueTrend = ((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
        }

        return NextResponse.json({
            stats: {
                totalStudents,
                activeCourses,
                activeEnrollments,
                monthlyRevenue,
                pendingRevenue,
                overdueRevenue,
                totalTeachers,
                totalMaterials,
                totalSuppliers,
                totalSchedules,
                revenueTrend: revenueTrend.toFixed(1),
                satisfaction: 4.8,
                expectedRevenue
            }
        })
    } catch (error) {
        console.error('Error fetching dashboard stats:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
