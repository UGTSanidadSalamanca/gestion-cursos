"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Package, 
  Settings, 
  Server, 
  Shield,
  TrendingUp,
  Clock,
  Globe,
  Database
} from "lucide-react"

export function OperationsModule() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Recursos y Materiales */}
      <Card className="border-l-4 border-l-orange-500">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Package className="h-6 w-6 text-orange-500" />
              <CardTitle className="text-xl">Recursos y Materiales</CardTitle>
            </div>
            <Badge className="bg-orange-100 text-orange-800">Operaciones</Badge>
          </div>
          <CardDescription>
            Inventario de materiales, mantenimiento y gestión de recursos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Estadísticas Grid 2x2 */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-orange-50 p-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <Package className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium">Materiales</span>
              </div>
              <div className="text-2xl font-bold text-orange-600">156</div>
              <div className="text-xs text-orange-600">Total en inventario</div>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <Globe className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Plataformas</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">5</div>
              <div className="text-xs text-blue-600">Activas</div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <Database className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Contactos</span>
              </div>
              <div className="text-2xl font-bold text-green-600">89</div>
              <div className="text-xs text-green-600">Proveedores</div>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium">Disponibles</span>
              </div>
              <div className="text-2xl font-bold text-purple-600">98%</div>
              <div className="text-xs text-purple-600">Operativos</div>
            </div>
          </div>

          {/* Funcionalidades */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Inventario de materiales didácticos</span>
              <Badge variant="outline">Activo</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Mantenimiento de recursos</span>
              <Badge variant="outline">Activo</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Sistema de descargas</span>
              <Badge variant="outline">Activo</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Estadísticas de uso</span>
              <Badge variant="outline">Activo</Badge>
            </div>
          </div>

          <Button className="w-full bg-orange-500 hover:bg-orange-600" asChild>
            <a href="/materials">Acceder a Recursos y Materiales</a>
          </Button>
        </CardContent>
      </Card>

      {/* Gestión Operativa */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Settings className="h-6 w-6 text-blue-500" />
              <CardTitle className="text-xl">Gestión Operativa</CardTitle>
            </div>
            <Badge className="bg-blue-100 text-blue-800">Operaciones</Badge>
          </div>
          <CardDescription>
            Configuración del sistema, permisos, logs y backups
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Estadísticas Grid 2x2 */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Soporte</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">24/7</div>
              <div className="text-xs text-blue-600">Disponible</div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <Server className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Uptime</span>
              </div>
              <div className="text-2xl font-bold text-green-600">99.9%</div>
              <div className="text-xs text-green-600">Este mes</div>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <Globe className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium">Integraciones</span>
              </div>
              <div className="text-2xl font-bold text-purple-600">12</div>
              <div className="text-xs text-purple-600">Activas</div>
            </div>
            <div className="bg-orange-50 p-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <Database className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium">Idiomas</span>
              </div>
              <div className="text-2xl font-bold text-orange-600">5</div>
              <div className="text-xs text-orange-600">Disponibles</div>
            </div>
          </div>

          {/* Funcionalidades */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Configuración del sistema</span>
              <Badge variant="outline">Activo</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Gestión de permisos</span>
              <Badge variant="outline">Activo</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Logs del sistema</span>
              <Badge variant="outline">Activo</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Sistema de backups</span>
              <Badge variant="outline">Activo</Badge>
            </div>
          </div>

          <Button className="w-full bg-blue-500 hover:bg-blue-600" asChild>
            <a href="/suppliers">Acceder a Gestión Operativa</a>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}