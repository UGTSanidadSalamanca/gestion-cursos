"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { NotificationPanel } from "@/components/notifications/notification-panel"
import { Bell, Settings, Plus, Filter, Download } from "lucide-react"

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState("all")

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notificaciones</h1>
          <p className="text-muted-foreground mt-2">
            Gestiona todas las alertas y notificaciones del sistema
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filtrar
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Nueva Notificación
          </Button>
        </div>
      </div>

      {/* Estadísticas Rápidas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Notificaciones</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">
              +3 desde ayer
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">No Leídas</CardTitle>
            <Badge variant="destructive" className="h-6 w-6 rounded-full p-0 flex items-center justify-center">
              8
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              Requieren atención
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Urgentes</CardTitle>
            <Badge variant="destructive" className="text-xs">
              Urgente
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">
              Acción inmediata
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hoy</CardTitle>
            <Badge variant="secondary" className="text-xs">
              Hoy
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              Nuevas hoy
            </p>
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