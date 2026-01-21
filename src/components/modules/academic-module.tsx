"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  BookOpen,
  TrendingUp,
  Star,
  GraduationCap,
  MessageSquare,
  Award,
  Clock
} from "lucide-react"

interface AcademicModuleProps {
  stats?: {
    totalStudents: number
    activeCourses: number
    activeEnrollments: number
    totalTeachers: number
  }
}

export function AcademicModule({ stats }: AcademicModuleProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Gestión de Alumnos */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="h-6 w-6 text-blue-500" />
              <CardTitle className="text-xl">Gestión de Alumnos</CardTitle>
            </div>
            <Badge className="bg-blue-100 text-blue-800">Académico</Badge>
          </div>
          <CardDescription>
            Matrícula, seguimiento académico y comunicación con estudiantes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Estadísticas Grid 2x2 */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Alumnos Totales</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">{stats?.totalStudents || 0}</div>
              <div className="text-xs text-blue-500">Alumnos activos</div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Retención</span>
              </div>
              <div className="text-2xl font-bold text-green-600">89%</div>
              <div className="text-xs text-green-500">Por encima del objetivo</div>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <Star className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium">Satisfacción</span>
              </div>
              <div className="text-2xl font-bold text-purple-600">4.7</div>
              <div className="text-xs text-purple-500">Calificación promedio</div>
            </div>
            <div className="bg-orange-50 p-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <GraduationCap className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium">Certificados</span>
              </div>
              <div className="text-2xl font-bold text-orange-600">342</div>
              <div className="text-xs text-orange-500">Emitidos este año</div>
            </div>
          </div>

          {/* Funcionalidades */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Matrícula de nuevos estudiantes</span>
              <Badge variant="outline">Activo</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Seguimiento del progreso académico</span>
              <Badge variant="outline">Activo</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Generación de certificados</span>
              <Badge variant="outline">Activo</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Comunicación con estudiantes</span>
              <Badge variant="outline">Activo</Badge>
            </div>
          </div>

          <Button className="w-full bg-blue-500 hover:bg-blue-600" asChild>
            <a href="/students">Acceder a Gestión de Alumnos</a>
          </Button>
        </CardContent>
      </Card>

      {/* Gestión de Cursos */}
      <Card className="border-l-4 border-l-green-500">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-6 w-6 text-green-500" />
              <CardTitle className="text-xl">Gestión de Cursos</CardTitle>
            </div>
            <Badge className="bg-green-100 text-green-800">Académico</Badge>
          </div>
          <CardDescription>
            Creación, edición y administración de cursos y horarios
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Estadísticas Grid 2x2 */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <BookOpen className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Cursos Activos</span>
              </div>
              <div className="text-2xl font-bold text-green-600">{stats?.activeCourses || 0}</div>
              <div className="text-xs text-green-500">En este período</div>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Alumnos Inscritos</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">{stats?.activeEnrollments || 0}</div>
              <div className="text-xs text-blue-500">Total en cursos</div>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium">Horarios</span>
              </div>
              <div className="text-2xl font-bold text-purple-600">89</div>
              <div className="text-xs text-purple-500">Programados</div>
            </div>
            <div className="bg-orange-50 p-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <Award className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium">Instructores</span>
              </div>
              <div className="text-2xl font-bold text-orange-600">{stats?.totalTeachers || 0}</div>
              <div className="text-xs text-orange-500">En plantilla</div>
            </div>
          </div>

          {/* Funcionalidades */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Creación y edición de cursos</span>
              <Badge variant="outline">Activo</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Gestión de horarios</span>
              <Badge variant="outline">Activo</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Asignación de instructores</span>
              <Badge variant="outline">Activo</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Evaluación y seguimiento</span>
              <Badge variant="outline">Activo</Badge>
            </div>
          </div>

          <Button className="w-full bg-green-500 hover:bg-green-600" asChild>
            <a href="/courses">Acceder a Gestión de Cursos</a>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}