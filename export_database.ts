import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function exportDatabase() {
    try {
        console.log('📦 Exportando información de la base de datos...\n');

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupDir = path.join(process.cwd(), 'backups');

        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir);
        }

        // Exportar cursos
        const courses = await prisma.course.findMany({
            include: {
                modules: {
                    include: {
                        teacher: true
                    }
                },
                enrollments: {
                    include: {
                        student: true
                    }
                },
                schedules: {
                    include: {
                        teacher: true
                    }
                },
                payments: {
                    include: {
                        student: true
                    }
                },
                materials: {
                    include: {
                        material: true
                    }
                }
            }
        });

        // Exportar estudiantes
        const students = await prisma.student.findMany({
            include: {
                enrollments: {
                    include: {
                        course: true
                    }
                },
                payments: {
                    include: {
                        course: true
                    }
                },
                contacts: true
            }
        });

        // Exportar profesores
        const teachers = await prisma.teacher.findMany({
            include: {
                modules: {
                    include: {
                        course: true
                    }
                },
                schedules: {
                    include: {
                        course: true
                    }
                },
                contacts: true,
                user: true
            }
        });

        // Exportar usuarios
        const users = await prisma.user.findMany({
            include: {
                teacher: true,
                notifications: true,
                notificationPreferences: true
            }
        });

        // Exportar proveedores
        const providers = await prisma.provider.findMany({
            include: {
                contacts: true,
                materials: true
            }
        });

        // Exportar materiales
        const materials = await prisma.material.findMany({
            include: {
                provider: true,
                courses: {
                    include: {
                        course: true
                    }
                }
            }
        });

        // Exportar software
        const software = await prisma.software.findMany();

        // Exportar contactos
        const contacts = await prisma.contact.findMany({
            include: {
                student: true,
                teacher: true,
                provider: true,
                user: true
            }
        });

        // Exportar notificaciones
        const notifications = await prisma.notification.findMany({
            include: {
                user: true
            }
        });

        const exportData = {
            exportDate: new Date().toISOString(),
            version: '1.0',
            statistics: {
                courses: courses.length,
                students: students.length,
                teachers: teachers.length,
                users: users.length,
                providers: providers.length,
                materials: materials.length,
                software: software.length,
                contacts: contacts.length,
                notifications: notifications.length
            },
            data: {
                courses,
                students,
                teachers,
                users,
                providers,
                materials,
                software,
                contacts,
                notifications
            }
        };

        const filename = `backup_${timestamp}.json`;
        const filepath = path.join(backupDir, filename);

        fs.writeFileSync(filepath, JSON.stringify(exportData, null, 2));

        console.log('✅ Exportación completada');
        console.log(`📁 Archivo: ${filepath}`);
        console.log(`📊 Tamaño: ${(fs.statSync(filepath).size / 1024).toFixed(2)} KB\n`);

        console.log('📈 Estadísticas:');
        console.log(`   - Cursos: ${courses.length}`);
        console.log(`   - Estudiantes: ${students.length}`);
        console.log(`   - Profesores: ${teachers.length}`);
        console.log(`   - Usuarios: ${users.length}`);
        console.log(`   - Proveedores: ${providers.length}`);
        console.log(`   - Materiales: ${materials.length}`);
        console.log(`   - Software: ${software.length}`);
        console.log(`   - Contactos: ${contacts.length}`);
        console.log(`   - Notificaciones: ${notifications.length}\n`);

        return filepath;

    } catch (error) {
        console.error('❌ Error al exportar la base de datos:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

exportDatabase();
