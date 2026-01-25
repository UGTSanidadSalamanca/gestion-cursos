"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MainLayout } from "@/components/layout/main-layout"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Calendar,
  Clock,
  Users,
  BookOpen,
  MapPin,
  User,
  Plus,
  Trash2,
  Filter,
  Loader2
} from "lucide-react"
import { toast } from "sonner"

interface Course {
  id: string
  title: string
  code: string
}

interface Schedule {
  id: string
  courseId: string
  dayOfWeek: string
  startTime: string
  endTime: string
  classroom: string
  isRecurring: boolean
  notes?: string
  course: {
    title: string
    code: string
    maxStudents: number
    teacher?: {
      name: string
    }
    _count?: {
      enrollments: number
    }
  }
}

interface ScheduleGroup {
  day: string
  schedules: Schedule[]
}

const dayMapping: Record<string, string> = {
  MONDAY: "Lunes",
  TUESDAY: "Martes",
  WEDNESDAY: "Miércoles",
  THURSDAY: "Jueves",
  FRIDAY: "Viernes",
  SATURDAY: "Sábado",
  SUNDAY: "Domingo"
}

const dayOrder = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']

export default function SchedulesPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDay, setSelectedDay] = useState<string>('all')
  const [ischkDialogOpen, setIsDialogOpen] = useState(false)
  const [newSchedule, setNewSchedule] = useState({
    courseId: "",
    dayOfWeek: "MONDAY",
    startTime: "",
    endTime: "",
    classroom: "",
    notes: ""
  })

  useEffect(() => {
    fetchSchedules()
    fetchCourses()
  }, [])

  const fetchSchedules = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/schedules')
      if (response.ok) {
        const data = await response.json()
        setSchedules(data)
      }
    } catch (error) {
      console.error("Error fetching schedules:", error)
      toast.error("Error al cargar horarios")
    } finally {
      setLoading(false)
    }
  }

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/courses')
      if (response.ok) {
        const data = await response.json()
        // Only active courses? Maybe. For now all.
        setCourses(data)
      }
    } catch (error) {
      console.error("Error fetching courses:", error)
    }
  }

  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault()

    // Convert HH:mm to ISO Date (using current date as base, backend only cares about time)
    const today = new Date().toISOString().split('T')[0]
    const startDateTime = new Date(`${today}T${newSchedule.startTime}:00`).toISOString()
    const endDateTime = new Date(`${today}T${newSchedule.endTime}:00`).toISOString()

    try {
      const response = await fetch('/api/schedules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newSchedule,
          startTime: startDateTime,
          endTime: endDateTime
        }),
      })

      if (response.ok) {
        toast.success("Horario creado con éxito")
        fetchSchedules()
        setIsDialogOpen(false)
        setNewSchedule({
          courseId: "",
          dayOfWeek: "MONDAY",
          startTime: "",
          endTime: "",
          classroom: "",
          notes: ""
        })
      } else {
        const error = await response.json()
        toast.error(error.error || "Error al crear horario")
      }
    } catch (error) {
      toast.error("Error al crear horario")
    }
  }

  const handleDeleteSchedule = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este horario?")) return

    try {
      const response = await fetch(`/api/schedules/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success("Horario eliminado")
        fetchSchedules()
      } else {
        toast.error("Error al eliminar")
      }
    } catch (error) {
      toast.error("Error al eliminar")
    }
  }

  const getDayName = (dayCode: string) => dayMapping[dayCode] || dayCode

  const formatTime = (isoString: string) => {
    if (!isoString) return ""
    const date = new Date(isoString)
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false })
  }

  const groupSchedulesByDay = (): ScheduleGroup[] => {
    if (selectedDay === 'all') {
      return dayOrder.map(day => ({
        day: getDayName(day),
        schedules: schedules.filter(s => s.dayOfWeek === day)
      })).filter(group => group.schedules.length > 0)
    } else {
      return [{
        day: getDayName(selectedDay),
        schedules: schedules.filter(s => s.dayOfWeek === selectedDay)
      }]
    }
  }

  const getCapacityBadge = (enrolled: number, capacity: number) => {
    if (!capacity) return <Badge className="bg-slate-500">Sin cupo</Badge>
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
    active: schedules.length, // All fetched are presumably active if existing
    totalStudents: schedules.reduce((sum, s) => sum + (s.course._count?.enrollments || 0), 0),
    avgCapacity: schedules.length > 0 ? Math.round(schedules.reduce((sum, s) => {
      const caps = s.course.maxStudents || 0
      if (caps === 0) return sum
      return sum + ((s.course._count?.enrollments || 0) / caps)
    }, 0) / schedules.length * 100) : 0
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
            <Dialog open={ischkDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Horario
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Añadir Nuevo Horario</DialogTitle>
                  <DialogDescription>
                    Configura una nueva sesión de clase en el calendario.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateSchedule} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="course">Curso</Label>
                    <Select
                      required
                      value={newSchedule.courseId}
                      onValueChange={(val) => setNewSchedule({ ...newSchedule, courseId: val })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar curso" />
                      </SelectTrigger>
                      <SelectContent>
                        {courses.map(course => (
                          <SelectItem key={course.id} value={course.id}>
                            {course.title} ({course.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Día de la semana</Label>
                      <Select
                        value={newSchedule.dayOfWeek}
                        onValueChange={(val) => setNewSchedule({ ...newSchedule, dayOfWeek: val })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {dayOrder.map(day => (
                            <SelectItem key={day} value={day}>{dayMapping[day]}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Aula / Espacio</Label>
                      <Input
                        placeholder="Ej: Aula 101"
                        required
                        value={newSchedule.classroom}
                        onChange={(e) => setNewSchedule({ ...newSchedule, classroom: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Hora Inicio</Label>
                      <Input
                        type="time"
                        required
                        value={newSchedule.startTime}
                        onChange={(e) => setNewSchedule({ ...newSchedule, startTime: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Hora Fin</Label>
                      <Input
                        type="time"
                        required
                        value={newSchedule.endTime}
                        onChange={(e) => setNewSchedule({ ...newSchedule, endTime: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Notas (Opcional)</Label>
                    <Textarea
                      placeholder="Comentarios adicionales..."
                      value={newSchedule.notes}
                      onChange={(e) => setNewSchedule({ ...newSchedule, notes: e.target.value })}
                    />
                  </div>

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                    <Button type="submit">Guardar Horario</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sesiones</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                Clases semanales
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
                Impacto en alumnos
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
                {dayOrder.map(day => (
                  <TabsTrigger key={day} value={day}>{dayMapping[day].substring(0, 3)}</TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </CardContent>
        </Card>

        {/* Lista de Horarios */}
        {loading ? (
          <div className="text-center py-8">
            <Loader2 className="animate-spin h-8 w-8 text-primary mx-auto" />
            <p className="mt-2 text-sm text-muted-foreground">Cargando horarios...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {groupSchedulesByDay().length === 0 ? (
              <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed text-slate-400">
                No hay horarios programados para este criterio.
              </div>
            ) : groupSchedulesByDay().map((group) => (
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
                    {group.schedules.map((schedule) => {
                      const enrolled = schedule.course._count?.enrollments || 0
                      const capacity = schedule.course.maxStudents || 0

                      return (
                        <div key={schedule.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors gap-4">
                          <div className="flex items-center space-x-4">
                            <div className="flex-shrink-0">
                              <div className="p-2 bg-primary/10 rounded-full">
                                <BookOpen className="h-5 w-5 text-primary" />
                              </div>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <h3 className="font-medium">{schedule.course.title}</h3>
                                <Badge variant="outline" className="text-xs">{schedule.course.code}</Badge>
                              </div>
                              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mt-1">
                                <div className="flex items-center space-x-1">
                                  <User className="h-4 w-4" />
                                  <span>{schedule.course.teacher?.name || 'Sin asignar'}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Clock className="h-4 w-4" />
                                  <span>{formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <MapPin className="h-4 w-4" />
                                  <span>{schedule.classroom || 'Sin aula'}</span>
                                </div>
                              </div>
                              {schedule.notes && (
                                <p className="text-xs text-muted-foreground italic mt-1 bg-slate-50 p-1 rounded inline-block">Nota: {schedule.notes}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center justify-between md:justify-end space-x-4 w-full md:w-auto">
                            <div className="text-right mr-4">
                              <div className="text-sm font-medium">
                                {enrolled} / {capacity}
                              </div>
                              <div className="w-20 bg-slate-200 rounded-full h-2 mt-1 hidden md:block">
                                <div
                                  className={`h-2 rounded-full ${(enrolled / capacity) >= 1 ? 'bg-red-500' :
                                      (enrolled / capacity) >= 0.8 ? 'bg-orange-500' :
                                        (enrolled / capacity) >= 0.5 ? 'bg-yellow-500' : 'bg-green-500'
                                    }`}
                                  style={{ width: `${capacity > 0 ? Math.min((enrolled / capacity) * 100, 100) : 0}%` }}
                                ></div>
                              </div>
                              {getCapacityBadge(enrolled, capacity)}
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button variant="ghost" size="icon" className="hover:text-red-500" onClick={() => handleDeleteSchedule(schedule.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
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