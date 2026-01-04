import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
    try {
        // Extraer todos los datos de todas las tablas
        const [
            users,
            students,
            teachers,
            providers,
            courses,
            materials,
            enrollments,
            payments,
            schedules,
            contacts,
            software,
            notifications,
            notificationPreferences
        ] = await Promise.all([
            db.user.findMany({
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                    createdAt: true,
                }
            }),
            db.student.findMany({
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                    address: true,
                    dni: true,
                    birthDate: true,
                    isAffiliated: true,
                    affiliateNumber: true,
                    emergencyContact: true,
                    emergencyPhone: true,
                    medicalInfo: true,
                    status: true,
                    createdAt: true,
                }
            }),
            db.teacher.findMany({
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                    address: true,
                    dni: true,
                    specialty: true,
                    experience: true,
                    cv: true,
                    contractType: true,
                    hourlyRate: true,
                    status: true,
                    createdAt: true,
                }
            }),
            db.provider.findMany({
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                    address: true,
                    taxId: true,
                    category: true,
                    description: true,
                    website: true,
                    status: true,
                    createdAt: true,
                }
            }),
            db.course.findMany({
                select: {
                    id: true,
                    title: true,
                    description: true,
                    code: true,
                    level: true,
                    duration: true,
                    maxStudents: true,
                    price: true,
                    isActive: true,
                    startDate: true,
                    endDate: true,
                    teacherId: true,
                    createdAt: true,
                }
            }),
            db.material.findMany({
                select: {
                    id: true,
                    name: true,
                    description: true,
                    type: true,
                    quantity: true,
                    unitPrice: true,
                    location: true,
                    providerId: true,
                    isAvailable: true,
                    createdAt: true,
                }
            }),
            db.enrollment.findMany({
                select: {
                    id: true,
                    studentId: true,
                    courseId: true,
                    enrollmentDate: true,
                    status: true,
                    progress: true,
                    grade: true,
                    certificate: true,
                    notes: true,
                    createdAt: true,
                }
            }),
            db.payment.findMany({
                select: {
                    id: true,
                    studentId: true,
                    courseId: true,
                    amount: true,
                    currency: true,
                    paymentDate: true,
                    paymentMethod: true,
                    reference: true,
                    description: true,
                    status: true,
                    dueDate: true,
                    paidDate: true,
                    invoiceNumber: true,
                    createdAt: true,
                }
            }),
            db.schedule.findMany({
                select: {
                    id: true,
                    courseId: true,
                    dayOfWeek: true,
                    startTime: true,
                    endTime: true,
                    classroom: true,
                    isRecurring: true,
                    notes: true,
                    createdAt: true,
                }
            }),
            db.contact.findMany({
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                    mobile: true,
                    address: true,
                    company: true,
                    position: true,
                    category: true,
                    notes: true,
                    isPrimary: true,
                    studentId: true,
                    teacherId: true,
                    providerId: true,
                    userId: true,
                    createdAt: true,
                }
            }),
            db.software.findMany({
                select: {
                    id: true,
                    name: true,
                    version: true,
                    type: true,
                    license: true,
                    licenseKey: true,
                    expiryDate: true,
                    provider: true,
                    description: true,
                    isActive: true,
                    maxUsers: true,
                    currentUsers: true,
                    url: true,
                    createdAt: true,
                }
            }),
            db.notification.findMany({
                select: {
                    id: true,
                    title: true,
                    message: true,
                    type: true,
                    priority: true,
                    category: true,
                    isRead: true,
                    targetUser: true,
                    targetRole: true,
                    actionUrl: true,
                    expiresAt: true,
                    createdAt: true,
                }
            }),
            db.notificationPreference.findMany({
                select: {
                    id: true,
                    userId: true,
                    category: true,
                    enabled: true,
                    email: true,
                    inApp: true,
                    push: true,
                    createdAt: true,
                }
            })
        ])

        // Formatear fechas para Excel
        const formatData = (data: any[]) => {
            return data.map(item => {
                const formatted: any = {}
                Object.keys(item).forEach(key => {
                    if (item[key] instanceof Date) {
                        formatted[key] = item[key].toISOString().split('T')[0]
                    } else if (typeof item[key] === 'boolean') {
                        formatted[key] = item[key] ? 'SI' : 'NO'
                    } else {
                        formatted[key] = item[key]
                    }
                })
                return formatted
            })
        }

        const exportData = {
            users: formatData(users),
            students: formatData(students),
            teachers: formatData(teachers),
            providers: formatData(providers),
            courses: formatData(courses),
            materials: formatData(materials),
            enrollments: formatData(enrollments),
            payments: formatData(payments),
            schedules: formatData(schedules),
            contacts: formatData(contacts),
            software: formatData(software),
            notifications: formatData(notifications),
            notificationPreferences: formatData(notificationPreferences),
            metadata: {
                exportDate: new Date().toISOString(),
                totalRecords: {
                    users: users.length,
                    students: students.length,
                    teachers: teachers.length,
                    providers: providers.length,
                    courses: courses.length,
                    materials: materials.length,
                    enrollments: enrollments.length,
                    payments: payments.length,
                    schedules: schedules.length,
                    contacts: contacts.length,
                    software: software.length,
                    notifications: notifications.length,
                    notificationPreferences: notificationPreferences.length,
                }
            }
        }

        return NextResponse.json(exportData)
    } catch (error) {
        console.error('Error exporting data:', error)
        return NextResponse.json(
            { error: 'Error al exportar datos' },
            { status: 500 }
        )
    }
}
