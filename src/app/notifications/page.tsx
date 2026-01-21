"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { NotificationPanel } from "@/components/notifications/notification-panel"
import { Bell, Settings, Plus, Filter, Download, RefreshCw } from "lucide-react"

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState("all")
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/notifications?limit=100')
        const data = await res.json()
        setNotifications(data.notifications || [])
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  const unreadCount = notifications.filter(n => !n.isRead).length
  const urgentCount = notifications.filter(n => n.priority === 'HIGH' || n.priority === 'URGENT').length
  const todayCount = notifications.filter(n => {
    const today = new Date().toDateString()
    return new Date(n.createdAt).toDateString() === today
  }).length

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notificaciones</h1>
          <p className="text-muted-foreground mt-2">
            Gestiona todas las alertas y notificaciones reales del sistema
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Estadísticas Rápidas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card shadow-sm>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium uppercase tracking-tighter text-slate-500">Total Histórico</CardTitle>
            <Bell className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notifications.length}</div>
            <p className="text-[10px] text-slate-400">Notificaciones registradas</p>
          </CardContent>
        </Card>

        <Card shadow-sm className={unreadCount > 0 ? "border-red-100 bg-red-50/30" : ""}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium uppercase tracking-tighter text-slate-500">No Leídas</CardTitle>
            <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold ${unreadCount > 0 ? "bg-red-500 text-white animate-pulse" : "bg-slate-100 text-slate-400"}`}>
              {unreadCount}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unreadCount}</div>
            <p className="text-[10px] text-slate-400">Pendientes de revisión</p>
          </CardContent>
        </Card>

        <Card shadow-sm>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium uppercase tracking-tighter text-slate-500">Urgentes</CardTitle>
            <Badge variant={urgentCount > 0 ? "destructive" : "outline"} className="text-[10px] uppercase">
              {urgentCount > 0 ? 'Atención' : 'Normal'}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{urgentCount}</div>
            <p className="text-[10px] text-slate-400">Prioridad alta o urgente</p>
          </CardContent>
        </Card>

        <Card shadow-sm>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium uppercase tracking-tighter text-slate-500">Hoy</CardTitle>
            <Badge variant="secondary" className="text-[10px] uppercase bg-blue-100 text-blue-700">
              Nuevas
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayCount}</div>
            <p className="text-[10px] text-slate-400">Recibidas en las últimas 24h</p>
          </CardContent>
        </Card>
      </div>

      {/* Panel de Notificaciones */}
      <NotificationPanel />

      {/* Configuración de Notificaciones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Configuración de Notificaciones</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="preferences" className="space-y-4">
            <TabsList>
              <TabsTrigger value="preferences">Preferencias</TabsTrigger>
              <TabsTrigger value="templates">Plantillas</TabsTrigger>
              <TabsTrigger value="automation">Automatización</TabsTrigger>
            </TabsList>

            <TabsContent value="preferences" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Notificaciones por Categoría</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      { category: "Pagos", color: "bg-green-100 text-green-800", enabled: true },
                      { category: "Cursos", color: "bg-blue-100 text-blue-800", enabled: true },
                      { category: "Estudiantes", color: "bg-purple-100 text-purple-800", enabled: true },
                      { category: "Instructores", color: "bg-indigo-100 text-indigo-800", enabled: true },
                      { category: "Sistema", color: "bg-gray-100 text-gray-800", enabled: true },
                      { category: "Seguridad", color: "bg-red-100 text-red-800", enabled: true }
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className={item.color}>
                            {item.category}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-muted-foreground">Email</span>
                          <span className="text-sm text-muted-foreground">App</span>
                          <span className="text-sm text-muted-foreground">Push</span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Frecuencia de Notificaciones</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Resumen diario</label>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" defaultChecked className="rounded" />
                        <span className="text-sm">Enviar resumen diario a las 6:00 PM</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Resumen semanal</label>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" defaultChecked className="rounded" />
                        <span className="text-sm">Enviar resumen semanal los lunes</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Notificaciones urgentes</label>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" defaultChecked className="rounded" />
                        <span className="text-sm">Recibir inmediatamente</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="templates">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-muted-foreground">Plantillas de notificaciones predefinidas...</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="automation">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-muted-foreground">Reglas de automatización de notificaciones...</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}