
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function restoreCoursesOnly() {
    try {
        console.log('📦 Restaurando SOLO información de CURSOS desde backup...\n');

        const backupDir = path.join(process.cwd(), 'backups');
        // Usar el backup específico mencionado
        const backupFile = 'backup_2026-01-27T20-04-27-139Z.json';
        const filepath = path.join(backupDir, backupFile);

        if (!fs.existsSync(filepath)) {
            console.error(`❌ No se encontró el archivo de backup: ${filepath}`);
            return;
        }

        console.log(`📁 Leyendo backup: ${backupFile}`);
        const dataStr = fs.readFileSync(filepath, 'utf-8');
        const backup = JSON.parse(dataStr);

        console.log(`📅 Fecha del datos: ${backup.exportDate}`);

        const courses = backup.data.courses || [];
        console.log(`🔍 Encontrados ${courses.length} cursos en el backup.`);

        for (const course of courses) {
            console.log(`\n🔄 Procesando curso: ${course.title} (${course.code})`);

            // 1. Restaurar el Curso base
            // Usamos upsert para actualizar si existe o crear si no
            await prisma.course.upsert({
                where: { id: course.id },
                update: {
                    title: course.title,
                    description: course.description,
                    code: course.code,
                    level: course.level,
                    duration: course.duration,
                    durationSessions: course.durationSessions,
                    sessionDuration: course.sessionDuration,
                    durationMonths: course.durationMonths,
                    durationPeriod: course.durationPeriod,
                    startDate: course.startDate ? new Date(course.startDate) : null,
                    endDate: course.endDate ? new Date(course.endDate) : null,
                    price: course.price,
                    priceUnit: course.priceUnit,
                    paymentFrequency: course.paymentFrequency,
                    hasRegistrationFee: course.hasRegistrationFee,
                    registrationFee: course.registrationFee,
                    affiliateRegistrationFee: course.affiliateRegistrationFee,
                    affiliatePrice: course.affiliatePrice,
                    publicDescription: course.publicDescription,
                    benefits: course.benefits,
                    features: course.features,
                    callUrl: course.callUrl,
                    syllabusUrl: course.syllabusUrl,
                    hasCertificate: course.hasCertificate,
                    hasMaterials: course.hasMaterials,
                    maxStudents: course.maxStudents,
                    isActive: course.isActive,
                    // No tocamos matriculaciones ni pagos aquí
                },
                create: {
                    id: course.id,
                    title: course.title,
                    description: course.description,
                    code: course.code,
                    level: course.level,
                    duration: course.duration,
                    durationSessions: course.durationSessions,
                    sessionDuration: course.sessionDuration,
                    durationMonths: course.durationMonths,
                    durationPeriod: course.durationPeriod,
                    startDate: course.startDate ? new Date(course.startDate) : null,
                    endDate: course.endDate ? new Date(course.endDate) : null,
                    price: course.price,
                    priceUnit: course.priceUnit,
                    paymentFrequency: course.paymentFrequency,
                    hasRegistrationFee: course.hasRegistrationFee,
                    registrationFee: course.registrationFee,
                    affiliateRegistrationFee: course.affiliateRegistrationFee,
                    affiliatePrice: course.affiliatePrice,
                    publicDescription: course.publicDescription,
                    benefits: course.benefits,
                    features: course.features,
                    callUrl: course.callUrl,
                    syllabusUrl: course.syllabusUrl,
                    hasCertificate: course.hasCertificate,
                    hasMaterials: course.hasMaterials,
                    maxStudents: course.maxStudents,
                    isActive: course.isActive,
                    createdAt: course.createdAt ? new Date(course.createdAt) : new Date(),
                }
            });
            console.log('   ✅ Datos básicos actualizados');

            // 2. Restaurar Módulos (Modules)
            // Primero borramos los existentes para evitar duplicados o desorden, y re-creamos los del backup
            if (course.modules && course.modules.length > 0) {
                // Borrar módulos existentes de este curso
                await prisma.courseModule.deleteMany({ where: { courseId: course.id } });

                for (const mod of course.modules) {
                    await prisma.courseModule.create({
                        data: {
                            id: mod.id,
                            title: mod.title,
                            description: mod.description,
                            courseId: course.id,
                            teacherId: mod.teacherId, // Asumimos que el profesor existe (ya que no se borraron profesores)
                        }
                    });
                }
                console.log(`   ✅ ${course.modules.length} módulos restaurados`);
            }

            // 3. Restaurar Horarios (Schedules)
            if (course.schedules && course.schedules.length > 0) {
                // Borrar horarios existentes
                await prisma.schedule.deleteMany({ where: { courseId: course.id } });

                for (const sch of course.schedules) {
                    await prisma.schedule.create({
                        data: {
                            id: sch.id,
                            dayOfWeek: sch.dayOfWeek,
                            startTime: sch.startTime ? new Date(sch.startTime) : new Date(),
                            endTime: sch.endTime ? new Date(sch.endTime) : new Date(),
                            classroom: sch.classroom,
                            teacherId: sch.teacherId,
                            courseId: course.id,
                            notes: sch.notes,
                            isRecurring: sch.isRecurring
                        }
                    });
                }
                console.log(`   ✅ ${course.schedules.length} horarios restaurados`);
            }
        }

        console.log('\n✅ Restauración de cursos completada con éxito.');

    } catch (error) {
        console.error('❌ Error durante la restauración:', error);
    } finally {
        await prisma.$disconnect();
    }
}

restoreCoursesOnly();
