"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  CreditCard, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Users,
  Calendar
} from "lucide-react"

export function FinancialModule() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Gestión de Pagos */}
      <Card className="border-l-4 border-l-green-500">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CreditCard className="h-6 w-6 text-green-500" />
              <CardTitle className="text-xl">Gestión de Pagos</CardTitle>
            </div>
            <Badge className="bg-green-100 text-green-800">Financiero</Badge>
          </div>
          <CardDescription>
            Control de pagos de estudiantes, facturación y reportes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Estadísticas Grid 2x2 */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Ingresos</span>
              </div>
              <div className="text-2xl font-bold text-green-600">€24,580</div>
              <div className="text-xs text-green-500">Total mensual</div>
            </div>
            <div className="bg-yellow-50 p-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-medium">Pendientes</span>
              </div>
              <div className="text-2xl font-bold text-yellow-600">€8,420</div>
              <div className="text-xs text-yellow-500">Por cobrar</div>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Instructores</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">€12,340</div>
              <div className="text-xs text-blue-500">Total pagado</div>
            </div>
            <div className="bg-red-50 p-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <TrendingDown className="h-4 w-4 text-red-600" />
                <span className="text-sm font-medium">Morosidad</span>
              </div>
              <div className="text-2xl font-bold text-red-600">€2,150</div>
              <div className="text-xs text-red-500">Vencidos</div>
            </div>
          </div>

          {/* Funcionalidades */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Control de pagos de estudiantes</span>
              <Badge variant="outline">Activo</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Gestión de morosidad</span>
              <Badge variant="outline">Activo</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Generación de facturas</span>
              <Badge variant="outline">Activo</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Reportes financieros</span>
              <Badge variant="outline">Activo</Badge>
            </div>
          </div>

          <Button className="w-full bg-green-500 hover:bg-green-600" asChild>
            <a href="/payments">Acceder a Gestión de Pagos</a>
          </Button>
        </CardContent>
      </Card>

      {/* Pagos a Instructores */}
      <Card className="border-l-4 border-l-yellow-500">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-6 w-6 text-yellow-500" />
              <CardTitle className="text-xl">Pagos a Instructores</CardTitle>
            </div>
            <Badge className="bg-yellow-100 text-yellow-800">Financiero</Badge>
          </div>
          <CardDescription>
            Nóminas, programación de pagos y gestión de contratos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Estadísticas Grid 2x2 */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-yellow-50 p-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-medium">Total Pagado</span>
              </div>
              <div className="text-2xl font-bold text-yellow-600">€12,340</div>
              <div className="text-xs text-yellow-500">Este período</div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Instructores</span>
              </div>
              <div className="text-2xl font-bold text-green-600">18</div>
              <div className="text-xs text-green-600">Pagados</div>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Promedio</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">€685</div>
              <div className="text-xs text-blue-600">Por instructor</div>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium">Al Día</span>
              </div>
              <div className="text-2xl font-bold text-purple-600">100%</div>
              <div className="text-xs text-purple-600">Pagos puntuales</div>
            </div>
          </div>

          {/* Funcionalidades */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Gestión de nóminas</span>
              <Badge variant="outline">Activo</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Programación de pagos</span>
              <Badge variant="outline">Activo</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Gestión de contratos</span>
              <Badge variant="outline">Activo</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Reportes de pagos</span>
              <Badge variant="outline">Activo</Badge>
            </div>
          </div>

          <Button className="w-full bg-yellow-500 hover:bg-yellow-600" asChild>
            <a href="/payments">Acceder a Pagos a Instructores</a>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}