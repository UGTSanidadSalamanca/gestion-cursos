"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MainLayout } from "@/components/layout/main-layout"
import {
  Calendar,
  Clock,
  Users,
  BookOpen,
  MapPin,
  User,
  Plus,
  Edit,
  Trash2,
  Filter
} from "lucide-react"

interface Schedule {
  id: string
  courseName: string
  teacherName: string
  dayOfWeek: string
  startTime: string
  endTime: string
  classroom: string
  capacity: number
  enrolled: number
  isActive: boolean
}

interface ScheduleGroup {
  day: string
  schedules: Schedule[]
}

export default function SchedulesPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDay, setSelectedDay] = useState<string>('all')

  useEffect(() => {
    // Simular carga de datos
    const mockSchedules: Schedule[] = [
      {
        id: "1",
        courseName: "JavaScript Avanzado",
        teacherName: "Juan Pérez",
        dayOfWeek: "Lunes",
        startTime: "09:00",
        endTime: "12:00",
        classroom: "Aula 101",
        capacity: 25,
        enrolled: 22,
        isActive: true
      },
      {
        id: "2",
        courseName: "UI/UX Design",
        teacherName: "María García",
        dayOfWeek: "Lunes",
        startTime: "14:00",
        endTime: "17:00",
        classroom: "Lab Design",
        capacity: 20,
        enrolled: 18,
        isActive: true
      },
      {
        id: "3",
        courseName: "Marketing Digital",
        teacherName: "Carlos López",
        dayOfWeek: "Martes",
        startTime: "10:00",
        endTime: "13:00",
        classroom: "Aula 205",
        capacity: 30,
        enrolled: 25,
        isActive: true
      },
      {
        id: "4",
        courseName: "Inglés Empresarial",
        teacherName: "Ana Martínez",
        dayOfWeek: "Martes",
        startTime: "16:00",
        endTime: "18:00",
        classroom: "Aula 301",
        capacity: 15,
        enrolled: 12,
        isActive: true
      },
      {
        id: "5",
        courseName: "React Framework",
        teacherName: "Juan Pérez",
        dayOfWeek: "Miércoles",
        startTime: "09:00",
        endTime: "12:00",
        classroom: "Aula 101",
        capacity: 25,
        enrolled: 20,
        isActive: true
      },
      {
        id: "6",
        courseName: "Base de Datos",
        teacherName: "Pedro Sánchez",
        dayOfWeek: "Jueves",
        startTime: "14:00",
        endTime: "17:00",
        classroom: "Lab Informática",
        capacity: 22,
        enrolled: 19,
        isActive: true
      },
      {
        id: "7",
        courseName: "Photoshop Avanzado",
        teacherName: "Laura Rodríguez",
        dayOfWeek: "Viernes",
        startTime: "10:00",
        endTime: "13:00",
        classroom: "Lab Design",
        capacity: 18,
        enrolled: 16,
        isActive: true
      },
      {
        id: "8",
        courseName: "Excel Empresarial",
        teacherName: "Miguel Ángel",
        dayOfWeek: "Viernes",
        startTime: "16:00",
        endTime: "19:00",
        classroom: "Aula 402",
        capacity: 20,
        enrolled: 15,
        isActive: true
      }
    ]

    setTimeout(() => {
      setSchedules(mockSchedules)
      setLoading(false)
    }, 1000)
  }, [])

  const groupSchedulesByDay = (): ScheduleGroup[] => {
    const daysOrder = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

    if (selectedDay === 'all') {
      return daysOrder.map(day => ({
        day,
        schedules: schedules.filter(s => s.dayOfWeek === day)
      })).filter(group => group.schedules.length > 0)
    } else {
      return [{
        day: selectedDay,
        schedules: schedules.filter(s => s.dayOfWeek === selectedDay)
      }]
    }
  }

  const getCapacityBadge = (enrolled: number, capacity: number) => {
    const percentage = (enrolled / capacity) * 100
    if (percentage >= 100) {
      return <Badge className="bg-red-500">Completo</Badge>
    } else if (percentage >= 80) {
      return <Badge className="bg-orange-500">Casi lleno</Badge>
    } else if (percentage >= 50) {
      return <Badge className="bg-yellow-500">Medio lleno</Badge>
    } else {
      return <Badge className="bg-green-500">Disponible</Badge>
    }
  }

  const stats = {
    total: schedules.length,
    active: schedules.filter(s => s.isActive).length,
    totalStudents: schedules.reduce((sum, s) => sum + s.enrolled, 0),
    avgCapacity: schedules.length > 0 ? Math.round(schedules.reduce((sum, s) => sum + (s.enrolled / s.capacity), 0) / schedules.length * 100) : 0
  }

  return (
    <MainLayout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gestión de Horarios</h1>
            <p className="text-muted-foreground mt-2">
              Administración de horarios de clases y asignación de aulas
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Horario
            </Button>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Horarios</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                Horarios programados
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Activos</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.active}</div>
              <p className="text-xs text-muted-foreground">
                Horarios activos
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Alumnos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalStudents}</div>
              <p className="text-xs text-muted-foreground">
                Alumnos inscritos
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ocupación Promedio</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avgCapacity}%</div>
              <p className="text-xs text-muted-foreground">
                Porcentaje de ocupación
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filtro por día */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtrar por Día
            </CardTitle>
            <CardDescription>
              Selecciona un día específico o ver todos los horarios
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={selectedDay} onValueChange={setSelectedDay} className="w-full">
              <TabsList className="grid w-full grid-cols-8">
                <TabsTrigger value="all">Todos</TabsTrigger>
                <TabsTrigger value="Lunes">Lunes</TabsTrigger>
                <TabsTrigger value="Martes">Martes</TabsTrigger>
                <TabsTrigger value="Miércoles">Miérc</TabsTrigger>
                <TabsTrigger value="Jueves">Jueves</TabsTrigger>
                <TabsTrigger value="Viernes">Viernes</TabsTrigger>
                <TabsTrigger value="Sábado">Sáb</TabsTrigger>
                <TabsTrigger value="Domingo">Dom</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardContent>
        </Card>

        {/* Lista de Horarios */}
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">Cargando horarios...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {groupSchedulesByDay().map((group) => (
              <Card key={group.day}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    {group.day}
                  </CardTitle>
                  <CardDescription>
                    {group.schedules.length} horario(s) programado(s)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {group.schedules.map((schedule) => (
                      <div key={schedule.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            <div className="p-2 bg-primary/10 rounded-full">
                              <BookOpen className="h-5 w-5 text-primary" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h3 className="font-medium">{schedule.courseName}</h3>
                              {schedule.isActive ? (
                                <Badge className="bg-green-500">Activo</Badge>
                              ) : (
                                <Badge variant="secondary">Inactivo</Badge>
                              )}
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                              <div className="flex items-center space-x-1">
                                <User className="h-4 w-4" />
                                <span>{schedule.teacherName}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Clock className="h-4 w-4" />
                                <span>{schedule.startTime} - {schedule.endTime}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <MapPin className="h-4 w-4" />
                                <span>{schedule.classroom}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <div className="text-sm font-medium">
                              {schedule.enrolled}/{schedule.capacity}
                            </div>
                            <div className="w-20 bg-slate-200 rounded-full h-2 mt-1">
                              <div
                                className={`h-2 rounded-full ${(schedule.enrolled / schedule.capacity) >= 1 ? 'bg-red-500' :
                                    (schedule.enrolled / schedule.capacity) >= 0.8 ? 'bg-orange-500' :
                                      (schedule.enrolled / schedule.capacity) >= 0.5 ? 'bg-yellow-500' : 'bg-green-500'
                                  }`}
                                style={{ width: `${Math.min((schedule.enrolled / schedule.capacity) * 100, 100)}%` }}
                              ></div>
                            </div>
                            {getCapacityBadge(schedule.enrolled, schedule.capacity)}
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  )
}