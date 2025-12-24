"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  UserCheck, 
  MessageSquare, 
  Star, 
  TrendingUp,
  Calendar,
  Clock,
  Users,
  Award
} from "lucide-react"

export function InstructorsModule() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Gestión de Instructores */}
      <Card className="border-l-4 border-l-purple-500">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <UserCheck className="h-6 w-6 text-purple-500" />
              <CardTitle className="text-xl">Gestión de Instructores</CardTitle>
            </div>
            <Badge className="bg-purple-100 text-purple-800">Instructores</Badge>
          </div>
          <CardDescription>
            Registro, perfiles y asignación de instructores a cursos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Estadísticas Grid 2x2 */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-purple-50 p-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <UserCheck className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium">Instructores</span>
              </div>
              <div className="text-2xl font-bold text-purple-600">18</div>
              <div className="text-xs text-purple-500">Total activos</div>
            </div>
            <div className="bg-yellow-50 p-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <Star className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-medium">Calificación</span>
              </div>
              <div className="text-2xl font-bold text-yellow-600">4.8</div>
              <div className="text-xs text-yellow-500">Promedio</div>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Cursos Asignados</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">24</div>
              <div className="text-xs text-blue-500">Total cursos</div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Disponibilidad</span>
              </div>
              <div className="text-2xl font-bold text-green-600">95%</div>
              <div className="text-xs text-green-500">Disponibles</div>
            </div>
          </div>

          {/* Funcionalidades */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Registro de nuevos instructores</span>
              <Badge variant="outline">Activo</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Gestión de perfiles y calificaciones</span>
              <Badge variant="outline">Activo</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Asignación de cursos</span>
              <Badge variant="outline">Activo</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Evaluación de desempeño</span>
              <Badge variant="outline">Activo</Badge>
            </div>
          </div>

          <Button className="w-full bg-purple-500 hover:bg-purple-600" asChild>
            <a href="/teachers">Acceder a Gestión de Instructores</a>
          </Button>
        </CardContent>
      </Card>

      {/* Contacto y Comunicación */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-6 w-6 text-blue-500" />
              <CardTitle className="text-xl">Contacto y Comunicación</CardTitle>
            </div>
            <Badge className="bg-blue-100 text-blue-800">Instructores</Badge>
          </div>
          <CardDescription>
            Gestión de contactos, mensajería interna y agenda
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Estadísticas Grid 2x2 */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Contactos</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">18</div>
              <div className="text-xs text-blue-500">Total registrados</div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Tasa Respuesta</span>
              </div>
              <div className="text-2xl font-bold text-green-600">95%</div>
              <div className="text-xs text-green-500">Respuestas</div>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium">Mensajes/Día</span>
              </div>
              <div className="text-2xl font-bold text-purple-600">24</div>
              <div className="text-xs text-purple-500">Promedio</div>
            </div>
            <div className="bg-orange-50 p-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium">Tiempo Respuesta</span>
              </div>
              <div className="text-2xl font-bold text-orange-600">2h</div>
              <div className="text-xs text-orange-500">Promedio</div>
            </div>
          </div>

          {/* Funcionalidades */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Gestión de datos de contacto</span>
              <Badge variant="outline">Activo</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Sistema de mensajería interna</span>
              <Badge variant="outline">Activo</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Agenda y programación</span>
              <Badge variant="outline">Activo</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Notificaciones automáticas</span>
              <Badge variant="outline">Activo</Badge>
            </div>
          </div>

          <Button className="w-full bg-blue-500 hover:bg-blue-600" asChild>
            <a href="/teachers">Acceder a Contacto y Comunicación</a>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}