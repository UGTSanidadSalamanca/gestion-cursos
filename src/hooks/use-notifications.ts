'use client'

import { useState, useEffect, useCallback } from 'react'
import { Notification } from '@/types'

interface UseNotificationsOptions {
  autoRefresh?: boolean
  refreshInterval?: number
  userId?: string
  userRole?: string
}

export function useNotifications(options: UseNotificationsOptions = {}) {
  const {
    autoRefresh = true,
    refreshInterval = 30000, // 30 segundos
    userId,
    userRole
  } = options

  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams()
      if (userId) params.append('userId', userId)
      if (userRole) params.append('userRole', userRole)
      
      const response = await fetch(`/api/notifications?${params}`)
      
      if (!response.ok) {
        throw new Error('Error fetching notifications')
      }
      
      const data = await response.json()
      setNotifications(data.notifications || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      console.error('Error fetching notifications:', err)
    } finally {
      setLoading(false)
    }
  }, [userId, userRole])

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isRead: true })
      })

      if (!response.ok) {
        throw new Error('Error marking notification as read')
      }

      // Actualizar el estado local
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId
            ? { ...notification, isRead: true }
            : notification
        )
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      console.error('Error marking notification as read:', err)
    }
  }, [])

  const markAllAsRead = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId, userRole })
      })

      if (!response.ok) {
        throw new Error('Error marking all notifications as read')
      }

      // Actualizar el estado local
      setNotifications(prev =>
        prev.map(notification => ({ ...notification, isRead: true }))
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      console.error('Error marking all notifications as read:', err)
    }
  }, [userId, userRole])

  const dismissNotification = useCallback(async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Error dismissing notification')
      }

      // Actualizar el estado local
      setNotifications(prev =>
        prev.filter(notification => notification.id !== notificationId)
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      console.error('Error dismissing notification:', err)
    }
  }, [])

  const createNotification = useCallback(async (data: {
    title: string
    message: string
    type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' | 'ALERT'
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
    category: 'PAYMENT' | 'COURSE' | 'STUDENT' | 'TEACHER' | 'SYSTEM' | 'SECURITY' | 'MAINTENANCE'
    targetUser?: string
    targetRole?: string
    actionUrl?: string
    expiresAt?: string
  }) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        throw new Error('Error creating notification')
      }

      const newNotification = await response.json()
      
      // Agregar la nueva notificación al estado local
      setNotifications(prev => [newNotification, ...prev])
      
      return newNotification
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      console.error('Error creating notification:', err)
      throw err
    }
  }, [])

  // Contador de notificaciones no leídas
  const unreadCount = notifications.filter(n => !n.isRead).length

  // Obtener notificaciones por categoría
  const getNotificationsByCategory = useCallback((category: string) => {
    return notifications.filter(n => n.category === category)
  }, [notifications])

  // Obtener notificaciones por prioridad
  const getNotificationsByPriority = useCallback((priority: string) => {
    return notifications.filter(n => n.priority === priority)
  }, [notifications])

  // Efecto para cargar notificaciones iniciales
  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  // Efecto para auto-refresco
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      fetchNotifications()
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, fetchNotifications])

  return {
    notifications,
    loading,
    error,
    unreadCount,
    markAsRead,
    markAllAsRead,
    dismissNotification,
    createNotification,
    getNotificationsByCategory,
    getNotificationsByPriority,
    refetch: fetchNotifications
  }
}