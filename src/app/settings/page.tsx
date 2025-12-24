"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MainLayout } from "@/components/layout/main-layout"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  Database,
  Palette,
  Globe,
  Mail,
  Phone,
  MapPin,
  Save,
  RefreshCw
} from "lucide-react"

interface SystemSettings {
  siteName: string
  siteDescription: string
  adminEmail: string
  adminPhone: string
  adminAddress: string
  language: string
  timezone: string
  currency: string
  theme: string
  notifications: {
    email: boolean
    push: boolean
    sms: boolean
  }
  security: {
    twoFactor: boolean
    sessionTimeout: number
    passwordMinLength: number
  }
  features: {
    enrollments: boolean
    payments: boolean
    reports: boolean
    notifications: boolean
  }
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SystemSettings>({
    siteName: "Sistema de Gestión de Cursos",
    siteDescription: "Plataforma integral para la administración de centros educativos",
    adminEmail: "admin@centroeducativo.com",
    adminPhone: "+34 900 123 456",
    adminAddress: "Calle Principal 123, Madrid, España",
    language: "es",
    timezone: "Europe/Madrid",
    currency: "EUR",
    theme: "light",
    notifications: {
      email: true,
      push: true,
      sms: false
    },
    security: {
      twoFactor: true,
      sessionTimeout: 30,
      passwordMinLength: 8
    },
    features: {
      enrollments: true,
      payments: true,
      reports: true,
      notifications: true
    }
  })

  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    setLoading(true)
    // Simular guardado
    setTimeout(() => {
      setLoading(false)
      alert('Configuración guardada exitosamente')
    }, 1500)
  }

  const handleReset = () => {
    if (confirm('¿Estás seguro de que deseas restablecer la configuración a los valores predeterminados?')) {
      // Aquí iría la lógica para restablecer la configuración
      alert('Configuración restablecida a los valores predeterminados')
    }
  }

  return (
    <MainLayout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Configuración del Sistema</h1>
            <p className="text-muted-foreground mt-2">
              Administra la configuración general, seguridad y preferencias del sistema
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-2">
            <Button variant="outline" onClick={handleReset}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Restablecer
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>
        </div>

        {/* Tabs de Configuración */}
        <Tabs defaultValue="general" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="general" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              General
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notificaciones
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Seguridad
            </TabsTrigger>
            <TabsTrigger value="features" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Funcionalidades
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Apariencia
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Información del Sitio
                  </CardTitle>
                  <CardDescription>
                    Configura la información básica de tu institución
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="siteName">Nombre del Sitio</Label>
                    <Input
                      id="siteName"
                      value={settings.siteName}
                      onChange={(e) => setSettings({...settings, siteName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="siteDescription">Descripción</Label>
                    <Input
                      id="siteDescription"
                      value={settings.siteDescription}
                      onChange={(e) => setSettings({...settings, siteDescription: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="language">Idioma</Label>
                    <Select value={settings.language} onValueChange={(value) => setSettings({...settings, language: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="es">Español</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="pt">Português</SelectItem>
                        <SelectItem value="fr">Français</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Zona Horaria</Label>
                    <Select value={settings.timezone} onValueChange={(value) => setSettings({...settings, timezone: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Europe/Madrid">Madrid, España</SelectItem>
                        <SelectItem value="Europe/London">Londres, Reino Unido</SelectItem>
                        <SelectItem value="America/Mexico_City">Ciudad de México, México</SelectItem>
                        <SelectItem value="America/Argentina/Buenos_Aires">Buenos Aires, Argentina</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currency">Moneda</Label>
                    <Select value={settings.currency} onValueChange={(value) => setSettings({...settings, currency: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EUR">Euro (€)</SelectItem>
                        <SelectItem value="USD">Dolar Americano ($)</SelectItem>
                        <SelectItem value="MXN">Peso Mexicano ($)</SelectItem>
                        <SelectItem value="ARS">Peso Argentino ($)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Información de Contacto
                  </CardTitle>
                  <CardDescription>
                    Datos de contacto del administrador
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="adminEmail">Email del Administrador</Label>
                    <Input
                      id="adminEmail"
                      type="email"
                      value={settings.adminEmail}
                      onChange={(e) => setSettings({...settings, adminEmail: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="adminPhone">Teléfono del Administrador</Label>
                    <Input
                      id="adminPhone"
                      value={settings.adminPhone}
                      onChange={(e) => setSettings({...settings, adminPhone: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="adminAddress">Dirección del Administrador</Label>
                    <Input
                      id="adminAddress"
                      value={settings.adminAddress}
                      onChange={(e) => setSettings({...settings, adminAddress: e.target.value})}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Configuración de Notificaciones
                </CardTitle>
                <CardDescription>
                  Configura cómo y cuándo recibir notificaciones
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Notificaciones por Email</Label>
                    <p className="text-sm text-muted-foreground">
                      Recibir notificaciones importantes por correo electrónico
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.email}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      notifications: {...settings.notifications, email: checked}
                    })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Notificaciones Push</Label>
                    <p className="text-sm text-muted-foreground">
                      Recibir notificaciones en tiempo real en el navegador
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.push}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      notifications: {...settings.notifications, push: checked}
                    })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Notificaciones por SMS</Label>
                    <p className="text-sm text-muted-foreground">
                      Recibir alertas importantes por mensaje de texto
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.sms}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      notifications: {...settings.notifications, sms: checked}
                    })}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Configuración de Seguridad
                </CardTitle>
                <CardDescription>
                  Configura las opciones de seguridad del sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Autenticación de Dos Factores</Label>
                    <p className="text-sm text-muted-foreground">
                      Requerir verificación en dos pasos para el acceso
                    </p>
                  </div>
                  <Switch
                    checked={settings.security.twoFactor}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      security: {...settings.security, twoFactor: checked}
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Tiempo de Espera de Sesión (minutos)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={settings.security.sessionTimeout}
                    onChange={(e) => setSettings({
                      ...settings,
                      security: {...settings.security, sessionTimeout: parseInt(e.target.value)}
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="passwordMinLength">Longitud Mínima de Contraseña</Label>
                  <Input
                    id="passwordMinLength"
                    type="number"
                    value={settings.security.passwordMinLength}
                    onChange={(e) => setSettings({
                      ...settings,
                      security: {...settings.security, passwordMinLength: parseInt(e.target.value)}
                    })}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="features" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Funcionalidades del Sistema
                </CardTitle>
                <CardDescription>
                  Habilita o deshabilita las funcionalidades del sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Gestión de Matrículas</Label>
                    <p className="text-sm text-muted-foreground">
                      Permitir la inscripción de estudiantes en cursos
                    </p>
                  </div>
                  <Switch
                    checked={settings.features.enrollments}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      features: {...settings.features, enrollments: checked}
                    })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Gestión de Pagos</Label>
                    <p className="text-sm text-muted-foreground">
                      Procesar pagos y gestionar facturas
                    </p>
                  </div>
                  <Switch
                    checked={settings.features.payments}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      features: {...settings.features, payments: checked}
                    })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Reportes y Estadísticas</Label>
                    <p className="text-sm text-muted-foreground">
                      Generar reportes y ver estadísticas del sistema
                    </p>
                  </div>
                  <Switch
                    checked={settings.features.reports}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      features: {...settings.features, reports: checked}
                    })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Sistema de Notificaciones</Label>
                    <p className="text-sm text-muted-foreground">
                      Enviar notificaciones a usuarios y administradores
                    </p>
                  </div>
                  <Switch
                    checked={settings.features.notifications}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      features: {...settings.features, notifications: checked}
                    })}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Apariencia del Sistema
                </CardTitle>
                <CardDescription>
                  Configura el tema y la apariencia visual del sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="theme">Tema del Sistema</Label>
                  <Select value={settings.theme} onValueChange={(value) => setSettings({...settings, theme: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Claro</SelectItem>
                      <SelectItem value="dark">Oscuro</SelectItem>
                      <SelectItem value="system">Seguir Sistema</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <Card className="cursor-pointer border-2 border-primary">
                    <CardContent className="p-4 text-center">
                      <div className="w-full h-20 bg-white border rounded mb-2"></div>
                      <p className="text-sm font-medium">Claro</p>
                    </CardContent>
                  </Card>
                  <Card className="cursor-pointer">
                    <CardContent className="p-4 text-center">
                      <div className="w-full h-20 bg-slate-900 border rounded mb-2"></div>
                      <p className="text-sm font-medium">Oscuro</p>
                    </CardContent>
                  </Card>
                  <Card className="cursor-pointer">
                    <CardContent className="p-4 text-center">
                      <div className="w-full h-20 bg-gradient-to-r from-white to-slate-900 border rounded mb-2"></div>
                      <p className="text-sm font-medium">Automático</p>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}