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
  CheckCircle2,
  Loader2
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
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null)

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
  const handleDeleteSchedule = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este horario?')) return

    const tid = toast.loading("Eliminando horario...")
    try {
      const res = await fetch(`/api/schedules/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success("Horario eliminado", { id: tid })
        fetchSchedules()
      } else {
        toast.error("Error al eliminar", { id: tid })
      }
    } catch (e) {
      toast.error("Error técnico", { id: tid })
    }
  }

  const handleSaveSchedule = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const data = {
      courseId: formData.get('courseId'),
      teacherId: formData.get('teacherId') || null,
      dayOfWeek: formData.get('dayOfWeek'),
      startTime: `1970-01-01T${formData.get('startTime')}:00.000Z`,
      endTime: `1970-01-01T${formData.get('endTime')}:00.000Z`,
      classroom: formData.get('classroom'),
      notes: formData.get('notes'),
      isRecurring: true
    }

    const tid = toast.loading(editingSchedule ? "Actualizando..." : "Guardando...")
    try {
      const url = editingSchedule ? `/api/schedules/${editingSchedule.id}` : '/api/schedules'
      const method = editingSchedule ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (res.ok) {
        toast.success(editingSchedule ? "Actualizado" : "Guardado", { id: tid })
        setIsFormOpen(false)
        setEditingSchedule(null)
        fetchSchedules()
      } else {
        toast.error("Error al guardar", { id: tid })
      }
    } catch (e) {
      toast.error("Error de conexión", { id: tid })
    }
  }
  const groupSchedulesByDay = (): ScheduleGroup[] => {
    const daysMap: Record<string, string> = {
      'MONDAY': 'Lunes', 'TUESDAY': 'Martes', 'WEDNESDAY': 'Miércoles',
      'THURSDAY': 'Jueves', 'FRIDAY': 'Viernes', 'SATURDAY': 'Sábado', 'SUNDAY': 'Domingo'
    }

    const daysOrder = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']

    if (selectedDay === 'all') {
      return daysOrder.map(dayKey => ({
        day: daysMap[dayKey],
        schedules: schedules.filter(s => s.dayOfWeek === dayKey)
      })).filter(group => group.schedules.length > 0)
    } else {
      // Find the key for the selected Spanish day
      const selectedKey = Object.keys(daysMap).find(key => daysMap[key] === selectedDay)
      return [{
        day: selectedDay,
        schedules: schedules.filter(s => s.dayOfWeek === selectedKey)
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

  const [pendingSchedules, setPendingSchedules] = useState<any[]>([])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (courses.length === 0) {
      toast.error("No se han cargado los cursos. Recarga la página.")
      return
    }

    setImportLoading(true)
    const reader = new FileReader()

    reader.onload = async (evt) => {
      try {
        const dataBuffer = evt.target?.result
        if (!dataBuffer) return

        const wb = XLSX.read(dataBuffer, { type: 'array' })
        const wsname = wb.SheetNames[0]
        const ws = wb.Sheets[wsname]
        const json = XLSX.utils.sheet_to_json(ws) as any[]

        console.log("Excel Raw:", json);

        const findVal = (row: any, keywords: string[]) => {
          const key = Object.keys(row).find(k =>
            keywords.some(kw => k.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(kw))
          )
          return key ? row[key] : null
        }

        const monthsMap: Record<string, number> = {
          'enero': 0, 'febrero': 1, 'marzo': 2, 'abril': 3, 'mayo': 4, 'junio': 5,
          'julio': 6, 'agosto': 7, 'septiembre': 8, 'octubre': 9, 'noviembre': 10, 'diciembre': 11
        }

        const processed = json.map((item, index) => {
          const cursoVal = String(findVal(item, ['curso', 'nombre', 'codigo']) || '').trim()
          const profesorVal = String(findVal(item, ['profesor', 'docente', 'teacher']) || '').trim()
          const diaVal = String(findVal(item, ['dia', 'day', 'fecha']) || '').trim()
          const inicioVal = findVal(item, ['inicio', 'start', 'hora'])
          const finVal = findVal(item, ['fin', 'end'])
          const aulaVal = String(findVal(item, ['aula', 'clase', 'classroom', 'room']) || '').trim()
          const notasVal = String(findVal(item, ['notas', 'observaciones', 'notes']) || '').trim()

          // 1. Vincular Curso (por título o por código tipo CURSO002)
          const course = courses.find(c =>
            c.code.toLowerCase() === cursoVal.toLowerCase() ||
            c.title.toLowerCase() === cursoVal.toLowerCase()
          )

          if (!course) {
            console.warn(`Fila ${index + 2}: No existe el curso ${cursoVal}`);
            return null;
          }

          // 2. Vincular Profesor
          const teacher = teachers.find(t =>
            profesorVal && t.name?.toLowerCase().includes(profesorVal.toLowerCase())
          )

          // 3. Obtener Día de la Semana desde el texto (ej: "04 de febrero")
          const normalizeToDayOfWeek = (val: string) => {
            const s = val.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")

            // Si ya es un día de la semana
            if (s.includes('lun')) return 'MONDAY'
            if (s.includes('mar')) return 'TUESDAY'
            if (s.includes('mie')) return 'WEDNESDAY'
            if (s.includes('jue')) return 'THURSDAY'
            if (s.includes('vie')) return 'FRIDAY'
            if (s.includes('sab')) return 'SATURDAY'
            if (s.includes('dom')) return 'SUNDAY'

            // Si es una fecha tipo "04 de febrero"
            const dateMatch = val.match(/(\d{1,2})\s*(?:de)?\s*([a-z]+)/i)
            if (dateMatch) {
              const dayNum = parseInt(dateMatch[1])
              const monthName = dateMatch[2].toLowerCase()
              const monthNum = monthsMap[monthName]
              if (monthNum !== undefined) {
                const year = new Date().getFullYear() // O 2026 según tu calendario
                const date = new Date(year, monthNum, dayNum)
                const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']
                return days[date.getDay()]
              }
            }
            return 'MONDAY'
          }

          // 4. Parsear Horas
          const parseTime = (timeVal: any) => {
            if (timeVal === null || timeVal === undefined) return null
            const d = new Date()
            d.setFullYear(1970, 0, 1) // Base fija para horas
            if (typeof timeVal === 'number') {
              const totalMinutes = Math.round(timeVal * 1440)
              d.setHours(Math.floor(totalMinutes / 60), totalMinutes % 60, 0, 0)
            } else {
              const match = String(timeVal).match(/(\d{1,2})[:.](\d{2})/)
              if (match) d.setHours(parseInt(match[1]), parseInt(match[2]), 0, 0)
              else return null
            }
            return d.toISOString()
          }

          const start = parseTime(inicioVal)
          const end = parseTime(finVal) || parseTime("20:00")

          if (!start) return null

          return {
            courseId: course.id,
            teacherId: teacher?.id,
            dayOfWeek: normalizeToDayOfWeek(diaVal),
            startTime: start,
            endTime: end,
            classroom: aulaVal || 'Online',
            notes: notasVal,
            courseTitle: course.title
          }
        }).filter(s => s !== null)

        // Eliminar duplicados de horarios semanales (misma hora, mismo día, mismo curso)
        const uniqueSchedules = processed.reduce((acc: any[], curr: any) => {
          const isDuplicate = acc.some(item =>
            item.courseId === curr.courseId &&
            item.dayOfWeek === curr.dayOfWeek &&
            item.startTime === curr.startTime &&
            item.teacherId === curr.teacherId
          )
          if (!isDuplicate) acc.push(curr)
          return acc
        }, [])

        if (uniqueSchedules.length === 0) {
          toast.error("No se pudo procesar ninguna fila. Comprueba los nombres de los cursos.")
        } else {
          setPendingSchedules(uniqueSchedules)
          toast.success(`${uniqueSchedules.length} clases configuradas correctamente.`)
        }
      } catch (error) {
        console.error(error)
        toast.error("Error al leer el Excel.")
      } finally {
        setImportLoading(false)
      }
    }
    reader.readAsArrayBuffer(file)
  }

  const executeImport = async () => {
    if (pendingSchedules.length === 0) return
    setImportLoading(true)
    const tid = toast.loading("Guardando calendario...")
    try {
      const res = await fetch('/api/schedules/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ schedules: pendingSchedules })
      })
      if (res.ok) {
        toast.success("Calendario actualizado con éxito", { id: tid })
        fetchSchedules()
        setIsImportOpen(false)
        setPendingSchedules([])
      } else {
        toast.error("Error al guardar en base de datos", { id: tid })
      }
    } catch (e) {
      toast.error("Error técnico", { id: tid })
    } finally {
      setImportLoading(false)
    }
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
            <Button onClick={() => { setEditingSchedule(null); setIsFormOpen(true); }} className="bg-red-600 hover:bg-red-700">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Horario
            </Button>
            <Dialog open={isImportOpen} onOpenChange={(open) => {
              setIsImportOpen(open)
              if (!open) setPendingSchedules([])
            }}>
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
                    Sube tu Excel de calendario (soporta fechas como "04 de febrero")
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="excel-file" className="text-xs font-bold uppercase tracking-wider text-slate-500">1. Seleccionar Archivo</Label>
                    <Input
                      id="excel-file"
                      type="file"
                      accept=".xlsx, .xls, .csv"
                      onChange={handleFileUpload}
                      disabled={importLoading}
                      className="cursor-pointer"
                    />
                  </div>

                  {pendingSchedules.length > 0 && (
                    <div className="bg-blue-600 p-4 rounded-xl border border-blue-500 space-y-2 animate-in fade-in slide-in-from-top-2 shadow-inner">
                      <p className="text-xs font-black text-white flex items-center gap-2 uppercase tracking-tighter">
                        <CheckCircle2 className="h-4 w-4 text-blue-100" />
                        {pendingSchedules.length} horarios listos
                      </p>
                      <div className="max-h-32 overflow-y-auto pr-2">
                        {pendingSchedules.slice(0, 5).map((s, i) => (
                          <div key={i} className="text-[10px] text-blue-50 border-b border-blue-400/30 py-1 last:border-0 italic">
                            • {s.courseTitle} ({s.dayOfWeek})
                          </div>
                        ))}
                        {pendingSchedules.length > 5 && <p className="text-[10px] text-blue-200 mt-1">... y {pendingSchedules.length - 5} más</p>}
                      </div>
                    </div>
                  )}

                  {importLoading && (
                    <div className="flex items-center justify-center p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                      <div className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                        <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                        Trabajando...
                      </div>
                    </div>
                  )}
                </div>
                <DialogFooter className="flex flex-col sm:flex-row gap-3">
                  <Button variant="ghost" onClick={() => setIsImportOpen(false)} className="sm:flex-1">Cancelar</Button>
                  <Button
                    onClick={executeImport}
                    disabled={importLoading || pendingSchedules.length === 0}
                    className="sm:flex-1 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 font-bold"
                  >
                    {importLoading ? "Trabajando..." : "Ejecutar Subida"}
                  </Button>
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
                          <Button variant="outline" size="sm" onClick={() => { setEditingSchedule(schedule); setIsFormOpen(true); }}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" className="text-red-500 hover:bg-red-50" onClick={() => handleDeleteSchedule(schedule.id)}>
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
      {/* Modal para Crear/Editar */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingSchedule ? 'Editar Horario' : 'Nuevo Horario'}</DialogTitle>
            <DialogDescription>
              Completa los datos del horario de clase.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveSchedule} className="space-y-4 py-4">
            <div className="grid gap-2">
              <Label>Curso</Label>
              <Select name="courseId" defaultValue={editingSchedule?.courseId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un curso" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Profesor</Label>
              <Select name="teacherId" defaultValue={editingSchedule?.teacherId || "none"}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un profesor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin asignar</SelectItem>
                  {teachers.map(t => (
                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Día</Label>
                <Select name="dayOfWeek" defaultValue={editingSchedule?.dayOfWeek} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Día" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MONDAY">Lunes</SelectItem>
                    <SelectItem value="TUESDAY">Martes</SelectItem>
                    <SelectItem value="WEDNESDAY">Miércoles</SelectItem>
                    <SelectItem value="THURSDAY">Jueves</SelectItem>
                    <SelectItem value="FRIDAY">Viernes</SelectItem>
                    <SelectItem value="SATURDAY">Sábado</SelectItem>
                    <SelectItem value="SUNDAY">Domingo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Aula</Label>
                <Input name="classroom" defaultValue={editingSchedule?.classroom} placeholder="Ej: Online, A1" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Hora Inicio</Label>
                <Input name="startTime" type="time" defaultValue={editingSchedule ? new Date(editingSchedule.startTime).toISOString().substring(11, 16) : ""} required />
              </div>
              <div className="grid gap-2">
                <Label>Hora Fin</Label>
                <Input name="endTime" type="time" defaultValue={editingSchedule ? new Date(editingSchedule.endTime).toISOString().substring(11, 16) : ""} required />
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Notas</Label>
              <Input name="notes" defaultValue={editingSchedule?.notes} placeholder="Opcional..." />
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="ghost" onClick={() => setIsFormOpen(false)}>Cancelar</Button>
              <Button type="submit" className="bg-red-600 hover:bg-red-700">
                {editingSchedule ? 'Actualizar' : 'Guardar Horario'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

    </div>
    </MainLayout >
  )
}