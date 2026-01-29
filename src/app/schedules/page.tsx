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
  Filter,
  FileDown,
  FileUp,
  AlertCircle,
  CheckCircle2
} from "lucide-react"
import * as XLSX from 'xlsx'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Schedule {
  id: string
  courseId: string
  teacherId?: string
  dayOfWeek: string
  startTime: string
  endTime: string
  classroom?: string
  isRecurring: boolean
  notes?: string
  course: {
    title: string
    maxStudents: number
    isActive: boolean
    _count?: {
      enrollments: number
    }
  }
  teacher?: {
    name: string
  }
}

interface ScheduleGroup {
  day: string
  schedules: Schedule[]
}

export default function SchedulesPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDay, setSelectedDay] = useState<string>('all')
  const [courses, setCourses] = useState<any[]>([])
  const [teachers, setTeachers] = useState<any[]>([])
  const [isImportOpen, setIsImportOpen] = useState(false)
  const [importLoading, setImportLoading] = useState(false)

  useEffect(() => {
    fetchSchedules()
    fetchMetadata()
  }, [])

  const fetchMetadata = async () => {
    try {
      const [coursesRes, teachersRes] = await Promise.all([
        fetch('/api/courses'),
        fetch('/api/teachers')
      ])
      if (coursesRes.ok) setCourses(await coursesRes.json())
      if (teachersRes.ok) setTeachers(await teachersRes.json())
    } catch (error) {
      console.error('Error fetching metadata:', error)
    }
  }

  const fetchSchedules = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/schedules')
      if (response.ok) {
        const data = await response.json()
        setSchedules(data)
      }
    } catch (error) {
      console.error('Error fetching schedules:', error)
    } finally {
      setLoading(false)
    }
  }

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
    active: schedules.filter(s => s.course.isActive).length,
    totalStudents: schedules.reduce((sum, s) => sum + (s.course._count?.enrollments || 0), 0),
    avgCapacity: schedules.length > 0 ? Math.round(schedules.reduce((sum, s) => sum + ((s.course._count?.enrollments || 0) / s.course.maxStudents), 0) / schedules.length * 100) : 0
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setImportLoading(true)
    const reader = new FileReader()

    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result
        const wb = XLSX.read(bstr, { type: 'binary' })
        const wsname = wb.SheetNames[0]
        const ws = wb.Sheets[wsname]
        const data = XLSX.utils.sheet_to_json(ws) as any[]

        // Simple mapping attempt
        const processedSchedules = data.map(item => {
          const course = courses.find(c =>
            c.title.toLowerCase() === (item.Curso || '').toLowerCase() ||
            c.code.toLowerCase() === (item.Código || '').toLowerCase()
          )
          const teacher = teachers.find(t =>
            t.name?.toLowerCase() === (item.Profesor || '').toLowerCase()
          )

          if (!course) return null

          // Handle time (expecting string like "09:00" or Excel time)
          const parseTime = (timeVal: any) => {
            if (!timeVal) return null
            const d = new Date()
            if (typeof timeVal === 'number') {
              // Excel serial time
              const hours = Math.floor(timeVal * 24)
              const minutes = Math.round((timeVal * 24 - hours) * 60)
              d.setHours(hours, minutes, 0, 0)
            } else {
              const [h, m] = timeVal.split(':')
              d.setHours(parseInt(h), parseInt(m), 0, 0)
            }
            return d.toISOString()
          }

          const dayMap: Record<string, string> = {
            'Lunes': 'MONDAY', 'Martes': 'TUESDAY', 'Miércoles': 'WEDNESDAY',
            'Jueves': 'THURSDAY', 'Viernes': 'FRIDAY', 'Sábado': 'SATURDAY', 'Domingo': 'SUNDAY',
            'Monday': 'MONDAY', 'Tuesday': 'TUESDAY', 'Wednesday': 'WEDNESDAY',
            'Thursday': 'THURSDAY', 'Friday': 'FRIDAY', 'Saturday': 'SATURDAY', 'Sunday': 'SUNDAY'
          }

          return {
            courseId: course.id,
            teacherId: teacher?.id,
            dayOfWeek: dayMap[item.Dia] || dayMap[item.Día] || 'MONDAY',
            startTime: parseTime(item.Inicio),
            endTime: parseTime(item.Fin),
            classroom: item.Aula || '',
            notes: item.Notas || '',
          }
        }).filter(s => s !== null && s.startTime && s.endTime)

        if (processedSchedules.length === 0) {
          toast.error("No se encontraron datos válidos en el Excel. Asegúrate de que los nombres de los cursos coincidan.")
          setImportLoading(false)
          return
        }

        const response = await fetch('/api/schedules/batch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ schedules: processedSchedules })
        })

        if (response.ok) {
          toast.success(`${processedSchedules.length} horarios importados correctamente`)
          fetchSchedules()
          setIsImportOpen(false)
        } else {
          toast.error("Error al guardar los horarios en la base de datos")
        }
      } catch (error) {
        console.error("Error processing Excel:", error)
        toast.error("Error al procesar el archivo Excel")
      } finally {
        setImportLoading(false)
      }
    }

    reader.readAsBinaryString(file)
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
          <div className="mt-4 md:mt-0 flex gap-2">
            <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <FileUp className="h-4 w-4 mr-2" />
                  Importar Excel
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Importar Horarios</DialogTitle>
                  <DialogDescription>
                    Sube un archivo Excel (.xlsx) con las columnas: <br />
                    <span className="font-mono text-xs">Curso, Profesor, Día, Inicio, Fin, Aula, Notas</span>
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="excel-file">Archivo Excel</Label>
                    <Input
                      id="excel-file"
                      type="file"
                      accept=".xlsx, .xls"
                      onChange={handleFileUpload}
                      disabled={importLoading}
                    />
                  </div>
                  {importLoading && (
                    <div className="flex items-center gap-2 text-sm text-blue-600 animate-pulse">
                      <div className="h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      Procesando e importando datos...
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button variant="ghost" onClick={() => setIsImportOpen(false)}>Cancelar</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

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
                              <h3 className="font-medium">{schedule.course.title}</h3>
                              {schedule.course.isActive ? (
                                <Badge className="bg-green-500 hover:bg-green-600">Activo</Badge>
                              ) : (
                                <Badge variant="secondary">Inactivo</Badge>
                              )}
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                              <div className="flex items-center space-x-1">
                                <User className="h-4 w-4" />
                                <span>{schedule.teacher?.name || 'Por asignar'}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Clock className="h-4 w-4" />
                                <span>{new Date(schedule.startTime).toISOString().substring(11, 16)} - {new Date(schedule.endTime).toISOString().substring(11, 16)}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <MapPin className="h-4 w-4" />
                                <span>{schedule.classroom}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">
                            {schedule.course._count?.enrollments || 0}/{schedule.course.maxStudents}
                          </div>
                          <div className="w-20 bg-slate-200 rounded-full h-2 mt-1">
                            <div
                              className={`h-2 rounded-full ${((schedule.course._count?.enrollments || 0) / (schedule.course.maxStudents || 1)) >= 1 ? 'bg-red-500' :
                                ((schedule.course._count?.enrollments || 0) / (schedule.course.maxStudents || 1)) >= 0.8 ? 'bg-orange-500' :
                                  ((schedule.course._count?.enrollments || 0) / (schedule.course.maxStudents || 1)) >= 0.5 ? 'bg-yellow-500' : 'bg-green-500'
                                }`}
                              style={{ width: `${Math.min(((schedule.course._count?.enrollments || 0) / (schedule.course.maxStudents || 1)) * 100, 100)}%` }}
                            ></div>
                          </div>
                          {getCapacityBadge(schedule.course._count?.enrollments || 0, schedule.course.maxStudents)}
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
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MainLayout >
  )
}