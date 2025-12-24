"use client"

import { useState, useEffect } from "react"
import { Bell, Settings, Filter, RefreshCw } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { NotificationItem } from "./notification-item"
import { Notification } from "@/types"

export function NotificationPanel() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")

  // Mock data para demostración
  const mockNotifications: Notification[] = [
    {
      id: "1",
      title: "Pago Pendiente",
      message: "El alumno Juan Pérez tiene un pago pendiente de €250 por el curso de JavaScript Avanzado",
      type: "WARNING",
      priority: "HIGH",
      category: "PAYMENT",
      isRead: false,
      actionUrl: "/payments",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: "2",
      title: "Nuevo Curso Próximo",
      message: "El curso 'React Native para Móviles' comienza el próximo lunes. Quedan 5 plazas disponibles.",
      type: "INFO",
      priority: "MEDIUM",
      category: "COURSE",
      isRead: false,
      actionUrl: "/courses",
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      updatedAt: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: "3",
      title: "Certificado Generado",
      message: "Se ha generado el certificado para María García por completar el curso de Diseño Web",
      type: "SUCCESS",
      priority: "LOW",
      category: "STUDENT",
      isRead: true,
      actionUrl: "/students",
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      updatedAt: new Date(Date.now() - 7200000).toISOString()
    },
    {
      id: "4",
      title: "Mantenimiento Programado",
      message: "El sistema estará en mantenimiento este sábado de 02:00 a 04:00 AM",
      type: "ALERT",
      priority: "MEDIUM",
      category: "MAINTENANCE",
      isRead: false,
      createdAt: new Date(Date.now() - 10800000).toISOString(),
      updatedAt: new Date(Date.now() - 10800000).toISOString()
    }
  ]

  useEffect(() => {
    // Simular carga de datos
    const loadData = async () => {
      setLoading(true)
      // Aquí iría la llamada a la API
      setTimeout(() => {
        setNotifications(mockNotifications)
        setLoading(false)
      }, 1000)
    }

    loadData()
  }, [])

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, isRead: true }
          : notification
      )
    )
  }

  const handleDismiss = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id))
  }

  const handleMarkAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    )
  }

  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === "all") return true
    if (activeTab === "unread") return !notification.isRead
    return notification.category.toLowerCase() === activeTab.toLowerCase()
  })

  const unreadCount = notifications.filter(n => !n.isRead).length

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>Notificaciones</span>
            <Badge variant="secondary">Cargando...</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-200 animate-pulse rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>Notificaciones</span>
            {unreadCount > 0 && (
              <Badge variant="destructive">{unreadCount}</Badge>
            )}
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              disabled={unreadCount === 0}
            >
              Marcar todas como leídas
            </Button>
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">Todas ({notifications.length})</TabsTrigger>
            <TabsTrigger value="unread">No leídas ({unreadCount})</TabsTrigger>
            <TabsTrigger value="payment">Pagos</TabsTrigger>
            <TabsTrigger value="course">Cursos</TabsTrigger>
            <TabsTrigger value="student">Estudiantes</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="mt-4">
            <ScrollArea className="h-96">
              {filteredNotifications.length > 0 ? (
                <div className="space-y-3">
                  {filteredNotifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onMarkAsRead={handleMarkAsRead}
                      onDismiss={handleDismiss}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No hay notificaciones en esta categoría</p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}