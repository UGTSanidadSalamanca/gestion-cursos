
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('--- COURSES ---')
    const courses = await prisma.course.findMany({
        // where: { isActive: true },
        select: { id: true, code: true, title: true, price: true, priceUnit: true }
    })
    console.log(JSON.stringify(courses, null, 2))

    console.log('\n--- ENROLLMENTS ---')
    const enrollments = await prisma.enrollment.findMany({
        // where: { status: 'ENROLLED' },
        include: { student: { select: { name: true } }, course: { select: { title: true } } }
    })
    console.log(`Count: ${enrollments.length}`)
    enrollments.forEach(e => {
        console.log(`${e.student.name} -> ${e.course.title} (${e.status})`)
    })

    console.log('\n--- ALL PAYMENTS ---')
    const payments = await prisma.payment.findMany({
        select: { id: true, amount: true, status: true, paidDate: true, paymentDate: true, course: { select: { title: true } } }
    })
    console.log(JSON.stringify(payments, null, 2))
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
