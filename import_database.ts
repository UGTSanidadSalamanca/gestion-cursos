import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function importDatabase(backupFile?: string) {
    try {
        console.log('📦 Importando información a la base de datos...\n');

        let filepath = backupFile;

        // Si no se especifica archivo, buscar el más reciente en backups/
        if (!filepath) {
            const backupDir = path.join(process.cwd(), 'backups');
            if (fs.existsSync(backupDir)) {
                const files = fs.readdirSync(backupDir)
                    .filter(f => f.startsWith('backup_') && f.endsWith('.json'))
                    .sort().reverse();

                if (files.length > 0) {
                    filepath = path.join(backupDir, files[0]);
                }
            }
        }

        if (!filepath || !fs.existsSync(filepath)) {
            console.error('❌ No se encontró archivo de backup valido');
            return;
        }

        console.log(`📁 Leyendo backup: ${filepath}`);
        const dataStr = fs.readFileSync(filepath, 'utf-8');
        const backup = JSON.parse(dataStr);

        console.log(`📅 Fecha backup: ${backup.exportDate}`);
        console.log(`VERSION: ${backup.version}`);

        // Confirmar con el usuario (en un script real)
        // Aquí asumimos que si se ejecuta es intencional

        // Limpieza de datos existentes (CUIDADO: Borra todo para evitar conflictos, o intentar upsert)
        // Para una recuperación segura, usaremos upsert o create donde no exista.

        // 1. Usuarios (Users)
        console.log('restoring users...');
        for (const user of backup.data.users || []) {
            try {
                await prisma.user.upsert({
                    where: { id: user.id },
                    update: {
                        email: user.email,
                        name: user.name,
                        role: user.role,
                        createdAt: user.createdAt, // createdAt might not be updateable easily depending on schema
                        updatedAt: new Date(),
                        password: user.password,
                        username: user.username
                    },
                    create: {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        role: user.role,
                        createdAt: user.createdAt,
                        updatedAt: new Date(user.updatedAt), // Fix: ensure Date conversion
                        password: user.password,
                        username: user.username
                    }
                });
            } catch (e) {
                console.log(`Skipping user ${user.email} (error or duplicate)`);
            }
        }

        // 2. Teachers (Linked to Users sometimes)
        console.log('restoring teachers...');
        for (const teacher of backup.data.teachers || []) {
            await prisma.teacher.upsert({
                where: { id: teacher.id },
                update: {
                    name: teacher.name,
                    email: teacher.email,
                    phone: teacher.phone,
                    dni: teacher.dni,
                    status: teacher.status,
                    userId: teacher.userId
                },
                create: {
                    id: teacher.id,
                    name: teacher.name,
                    email: teacher.email,
                    phone: teacher.phone,
                    dni: teacher.dni,
                    specialty: teacher.specialty,
                    status: teacher.status,
                    userId: teacher.userId,
                    createdAt: teacher.createdAt,
                    updatedAt: new Date(teacher.updatedAt)
                }
            });
        }

        // 3. Courses
        console.log('restoring courses...');
        for (const course of backup.data.courses || []) {
            await prisma.course.upsert({
                where: { id: course.id },
                update: {
                    title: course.title,
                    description: course.description,
                    code: course.code,
                    isActive: course.isActive,
                    // Map other fields...
                    level: course.level
                },
                create: {
                    id: course.id,
                    title: course.title,
                    description: course.description,
                    code: course.code,
                    level: course.level,
                    duration: course.duration,
                    maxStudents: course.maxStudents,
                    price: course.price,
                    isActive: course.isActive,
                    startDate: course.startDate,
                    endDate: course.endDate,
                    createdAt: course.createdAt,
                    updatedAt: new Date(course.updatedAt),
                    hasCertificate: course.hasCertificate,
                    hasMaterials: course.hasMaterials,
                    // Add other fields as necessary from the schema
                }
            });

            // Schedules for course
            if (course.schedules && course.schedules.length > 0) {
                // Delete existing schedules to avoid duplicates? Or try to upsert?
                // Safer to delete and recreate for schedules as they don't have many dependencies usually
                await prisma.schedule.deleteMany({ where: { courseId: course.id } });
                for (const schedule of course.schedules) {
                    await prisma.schedule.create({
                        data: {
                            id: schedule.id,
                            dayOfWeek: schedule.dayOfWeek,
                            startTime: schedule.startTime,
                            endTime: schedule.endTime,
                            classroom: schedule.classroom,
                            teacherId: schedule.teacherId,
                            courseId: course.id,
                            notes: schedule.notes
                        }
                    });
                }
            }
        }

        // ... (Implement other entities similarly if needed: Students, Enrollments, etc)
        // For now, focus on Courses/Schedules as requested.

        console.log('✅ Importación parcial completada (Usuarios, Profesores, Cursos, Horarios)');

    } catch (error) {
        console.error('❌ Error al importar:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Ejecutar si se llama directamente
const backupArg = process.argv[2];
importDatabase(backupArg);
