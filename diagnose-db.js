const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const students = await prisma.student.count()
    const courses = await prisma.course.count()
    const enrollments = await prisma.enrollment.count()
    const teachers = await prisma.teacher.count()

    console.log('--- DB Status ---')
    console.log('Students:', students)
    console.log('Courses:', courses)
    console.log('Enrollments:', enrollments)
    console.log('Teachers:', teachers)
    console.log('-----------------')
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
