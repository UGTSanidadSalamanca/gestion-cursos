import { db } from '@/lib/db'
import { NotificationType, NotificationPriority, NotificationCategory } from '@prisma/client'

export interface NotificationData {
  title: string
  message: string
  type: NotificationType
  priority: NotificationPriority
  category: NotificationCategory
  targetUser?: string
  targetRole?: string
  actionUrl?: string
  expiresAt?: Date
}

export class NotificationService {
  /**
   * Crear una nueva notificación
   */
  static async create(data: NotificationData) {
    try {
      const notification = await db.notification.create({
        data: {
          title: data.title,
          message: data.message,
          type: data.type,
          priority: data.priority,
          category: data.category,
          targetUser: data.targetUser,
          targetRole: data.targetRole,
          actionUrl: data.actionUrl,
          expiresAt: data.expiresAt
        }
      })

      // Aquí se podría agregar lógica para enviar email/push notifications
      await this.sendNotification(notification)

      return notification
    } catch (error) {
      console.error('Error creating notification:', error)
      throw error
    }
  }

  /**
   * Enviar notificación (email, push, etc.)
   */
  static async sendNotification(notification: any) {
    // Lógica para enviar notificaciones por diferentes canales
    // Por ahora, solo registramos en consola
    console.log('Sending notification:', {
      id: notification.id,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      priority: notification.priority
    })

    // Aquí se integraría con servicios de email (SendGrid, Mailchimp)
    // o servicios de push notifications
  }

  /**
   * Notificación de pago pendiente
   */
  static async paymentOverdue(studentName: string, amount: number, courseName: string, studentId?: string) {
    return this.create({
      title: 'Pago Pendiente',
      message: `El alumno ${studentName} tiene un pago pendiente de €${amount} por el curso ${courseName}`,
      type: NotificationType.WARNING,
      priority: NotificationPriority.HIGH,
      category: NotificationCategory.PAYMENT,
      targetUser: studentId,
      actionUrl: '/payments'
    })
  }

  /**
   * Notificación de nuevo curso próximo
   */
  static async courseStartingSoon(courseName: string, startDate: Date, availableSpots: number) {
    return this.create({
      title: 'Nuevo Curso Próximo',
      message: `El curso '${courseName}' comienza el ${startDate.toLocaleDateString('es-ES')}. Quedan ${availableSpots} plazas disponibles.`,
      type: NotificationType.INFO,
      priority: NotificationPriority.MEDIUM,
      category: NotificationCategory.COURSE,
      actionUrl: '/courses'
    })
  }

  /**
   * Notificación de certificado generado
   */
  static async certificateGenerated(studentName: string, courseName: string, studentId?: string) {
    return this.create({
      title: 'Certificado Generado',
      message: `Se ha generado el certificado para ${studentName} por completar el curso de ${courseName}`,
      type: NotificationType.SUCCESS,
      priority: NotificationPriority.LOW,
      category: NotificationCategory.STUDENT,
      targetUser: studentId,
      actionUrl: '/students'
    })
  }

  /**
   * Notificación de mantenimiento programado
   */
  static async maintenanceScheduled(startDate: Date, endDate: Date, description?: string) {
    return this.create({
      title: 'Mantenimiento Programado',
      message: `El sistema estará en mantenimiento desde ${startDate.toLocaleString('es-ES')} hasta ${endDate.toLocaleString('es-ES')}. ${description || ''}`,
      type: NotificationType.ALERT,
      priority: NotificationPriority.MEDIUM,
      category: NotificationCategory.MAINTENANCE
    })
  }

  /**
   * Notificación de nuevo estudiante inscrito
   */
  static async newStudentEnrolled(studentName: string, courseName: string) {
    return this.create({
      title: 'Nuevo Estudiante Inscrito',
      message: `${studentName} se ha inscrito en el curso ${courseName}`,
      type: NotificationType.INFO,
      priority: NotificationPriority.LOW,
      category: NotificationCategory.STUDENT,
      actionUrl: '/students'
    })
  }

  /**
   * Notificación de calificación de estudiante
   */
  static async studentGraded(studentName: string, courseName: string, grade: number, studentId?: string) {
    const gradeMessage = grade >= 70 ? 'aprobado' : 'necesita mejorar'
    return this.create({
      title: 'Calificación Registrada',
      message: `Se ha registrado la calificación de ${studentName} en ${courseName}: ${grade}/100 (${gradeMessage})`,
      type: grade >= 70 ? NotificationType.SUCCESS : NotificationType.WARNING,
      priority: NotificationPriority.MEDIUM,
      category: NotificationCategory.STUDENT,
      targetUser: studentId,
      actionUrl: '/students'
    })
  }

  /**
   * Notificación de instructor asignado
   */
  static async instructorAssigned(teacherName: string, courseName: string, teacherId?: string) {
    return this.create({
      title: 'Instructor Asignado',
      message: `${teacherName} ha sido asignado como instructor del curso ${courseName}`,
      type: NotificationType.SUCCESS,
      priority: NotificationPriority.MEDIUM,
      category: NotificationCategory.TEACHER,
      targetUser: teacherId,
      actionUrl: '/teachers'
    })
  }

  /**
   * Notificación de seguridad
   */
  static async securityAlert(message: string, priority: NotificationPriority = NotificationPriority.HIGH) {
    return this.create({
      title: 'Alerta de Seguridad',
      message,
      type: NotificationType.ERROR,
      priority,
      category: NotificationCategory.SECURITY
    })
  }

  /**
   * Notificación de sistema
   */
  static async systemNotification(title: string, message: string, priority: NotificationPriority = NotificationPriority.MEDIUM) {
    return this.create({
      title,
      message,
      type: NotificationType.INFO,
      priority,
      category: NotificationCategory.SYSTEM
    })
  }

  /**
   * Obtener notificaciones no leídas para un usuario
   */
  static async getUnreadNotifications(userId?: string, userRole?: string) {
    const where: any = { isRead: false }
    
    if (userId) {
      where.OR = [
        { targetUser: userId },
        { targetRole: userRole },
        { targetUser: null, targetRole: null } // Notificaciones para todos
      ]
    } else if (userRole) {
      where.OR = [
        { targetRole: userRole },
        { targetUser: null, targetRole: null } // Notificaciones para todos
      ]
    }

    return db.notification.findMany({
      where,
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ],
      take: 50 // Limitar a 50 notificaciones
    })
  }

  /**
   * Marcar notificación como leída
   */
  static async markAsRead(notificationId: string) {
    return db.notification.update({
      where: { id: notificationId },
      data: { isRead: true }
    })
  }

  /**
   * Marcar todas las notificaciones como leídas para un usuario
   */
  static async markAllAsRead(userId?: string, userRole?: string) {
    const where: any = { isRead: false }
    
    if (userId) {
      where.targetUser = userId
    } else if (userRole) {
      where.targetRole = userRole
    }

    return db.notification.updateMany({
      where,
      data: { isRead: true }
    })
  }
}