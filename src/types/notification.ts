export interface Notification {
  id: string
  title: string
  message: string
  type: "INFO" | "SUCCESS" | "WARNING" | "ERROR" | "ALERT"
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT"
  category: "PAYMENT" | "COURSE" | "STUDENT" | "TEACHER" | "SYSTEM" | "SECURITY" | "MAINTENANCE"
  isRead: boolean
  targetUser?: string
  targetRole?: "ADMIN" | "TEACHER" | "STAFF"
  actionUrl?: string
  expiresAt?: string
  createdAt: string
  updatedAt: string
}

export interface NotificationPreference {
  id: string
  userId: string
  category: "PAYMENT" | "COURSE" | "STUDENT" | "TEACHER" | "SYSTEM" | "SECURITY" | "MAINTENANCE"
  enabled: boolean
  email: boolean
  inApp: boolean
  push: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateNotificationRequest {
  title: string
  message: string
  type: "INFO" | "SUCCESS" | "WARNING" | "ERROR" | "ALERT"
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT"
  category: "PAYMENT" | "COURSE" | "STUDENT" | "TEACHER" | "SYSTEM" | "SECURITY" | "MAINTENANCE"
  targetUser?: string
  targetRole?: "ADMIN" | "TEACHER" | "STAFF"
  actionUrl?: string
  expiresAt?: string
}

export interface UpdateNotificationRequest {
  isRead?: boolean
}