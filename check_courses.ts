import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkCourses() {
    try {
        console.log('🔍 Verificando estado de la base de datos...\n');

        // Contar cursos
        const coursesCount = await prisma.course.count();
        console.log(`📚 Total de cursos: ${coursesCount}`);

        if (coursesCount > 0) {
            const courses = await prisma.course.findMany({
                select: {
                    id: true,
                    title: true,
                    code: true,
                    isActive: true,
                    startDate: true,
                    endDate: true,
                    maxStudents: true,
                    price: true,
                    createdAt: true,
                    _count: {
                        select: {
                            enrollments: true,
                            schedules: true,
                            modules: true
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });

            console.log('\n📋 Cursos encontrados:\n');
            courses.forEach((course, index) => {
                console.log(`${index + 1}. ${course.title} (${course.code})`);
                console.log(`   - Estado: ${course.isActive ? '✅ Activo' : '❌ Inactivo'}`);
                console.log(`   - ID: ${course.id}`);
                console.log(`   - Precio: ${course.price ? `${course.price}€` : 'No especificado'}`);
                console.log(`   - Fecha inicio: ${course.startDate ? course.startDate.toLocaleDateString() : 'No especificado'}`);
                console.log(`   - Fecha fin: ${course.endDate ? course.endDate.toLocaleDateString() : 'No especificado'}`);
                console.log(`   - Matriculaciones: ${course._count.enrollments}`);
                console.log(`   - Horarios: ${course._count.schedules}`);
                console.log(`   - Módulos: ${course._count.modules}`);
                console.log(`   - Creado: ${course.createdAt.toLocaleDateString()}\n`);
            });
        }

        // Contar estudiantes
        const studentsCount = await prisma.student.count();
        console.log(`👥 Total de estudiantes: ${studentsCount}`);

        // Contar matriculaciones
        const enrollmentsCount = await prisma.enrollment.count();
        console.log(`📝 Total de matriculaciones: ${enrollmentsCount}`);

        // Contar pagos
        const paymentsCount = await prisma.payment.count();
        console.log(`💰 Total de pagos: ${paymentsCount}`);

        // Contar profesores
        const teachersCount = await prisma.teacher.count();
        console.log(`👨‍🏫 Total de profesores: ${teachersCount}`);

        console.log('\n✅ Verificación completada');

    } catch (error) {
        console.error('❌ Error al verificar la base de datos:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkCourses();
