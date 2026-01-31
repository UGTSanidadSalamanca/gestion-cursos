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

  const [pendingSchedules, setPendingSchedules] = useState<any[]>([])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

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

        console.log("Excel Data Raw:", json);

        if (json.length === 0) {
          toast.error("El archivo está vacío")
          setImportLoading(false)
          return
        }

        // Helper para buscar columnas sin importar mayúsculas/acentos
        const findVal = (row: any, keywords: string[]) => {
          const key = Object.keys(row).find(k =>
            keywords.some(kw => k.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(kw))
          )
          return key ? row[key] : null
        }

        const processed = json.map((item, index) => {
          const cursoVal = findVal(item, ['curso', 'nombre', 'asignatura'])
          const codigoVal = findVal(item, ['codigo', 'code', 'id'])
          const profesorVal = findVal(item, ['profesor', 'docente', 'teacher'])
          const diaVal = findVal(item, ['dia', 'day', 'fecha'])
          const inicioVal = findVal(item, ['inicio', 'start', 'hora'])
          const finVal = findVal(item, ['fin', 'end'])
          const aulaVal = findVal(item, ['aula', 'clase', 'classroom', 'room'])
          const notasVal = findVal(item, ['notas', 'observaciones', 'notes'])

          const course = courses.find(c =>
            (cursoVal && c.title.toLowerCase() === String(cursoVal).toLowerCase()) ||
            (codigoVal && c.code.toLowerCase() === String(codigoVal).toLowerCase())
          )

          const teacher = teachers.find(t =>
            profesorVal && t.name?.toLowerCase().includes(String(profesorVal).toLowerCase())
          )

          if (!course) {
            console.warn(`Fila ${index + 1}: No se encontró el curso "${cursoVal || codigoVal}"`);
            return null;
          }

          const parseTime = (timeVal: any) => {
            if (timeVal === null || timeVal === undefined) return null
            const d = new Date()
            if (typeof timeVal === 'number') {
              const totalMinutes = Math.round(timeVal * 1440)
              const hours = Math.floor(totalMinutes / 60)
              const minutes = totalMinutes % 60
              d.setHours(hours, minutes, 0, 0)
            } else {
              const timeStr = String(timeVal).replace('.', ':')
              const match = timeStr.match(/(\d{1,2})[:](\d{2})/)
              if (match) {
                d.setHours(parseInt(match[1]), parseInt(match[2]), 0, 0)
              } else {
                return null
              }
            }
            return d.toISOString()
          }

          const normalizeDay = (val: any) => {
            const s = String(val || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            if (s.includes('lun')) return 'MONDAY'
            if (s.includes('mar')) return 'TUESDAY'
            if (s.includes('mie')) return 'WEDNESDAY'
            if (s.includes('jue')) return 'THURSDAY'
            if (s.includes('vie')) return 'FRIDAY'
            if (s.includes('sab')) return 'SATURDAY'
            if (s.includes('dom')) return 'SUNDAY'
            return 'MONDAY'
          }

          const start = parseTime(inicioVal)
          const end = parseTime(finVal)

          if (!start || !end) {
            console.warn(`Fila ${index + 1}: Horas inválidas para ${course.title}`);
            return null;
          }

          return {
            courseId: course.id,
            teacherId: teacher?.id,
            dayOfWeek: normalizeDay(diaVal),
            startTime: start,
            endTime: end,
            classroom: String(aulaVal || ''),
            notes: String(notasVal || ''),
            courseTitle: course.title
          }
        }).filter(s => s !== null)

        console.log("Processed Schedules:", processed);

        if (processed.length === 0) {
          toast.error("No se pudo vincular ninguna fila. Revisa los nombres de los cursos.")
        } else {
          setPendingSchedules(processed)
          toast.success(`${processed.length} registros listos. Revisa y pulsa "Ejecutar Subida".`)
        }
      } catch (error) {
        console.error("Error processing Excel:", error)
        toast.error("Error al procesar el archivo Excel")
      } finally {
        setImportLoading(false)
      }
    }
    reader.readAsArrayBuffer(file)
  }

  const executeImport = async () => {
    if (pendingSchedules.length === 0) return

    setImportLoading(true)
    const toastId = toast.loading("Importando horarios...")

    try {
      console.log("Sending to API:", pendingSchedules);
      const response = await fetch('/api/schedules/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ schedules: pendingSchedules })
      })

      const result = await response.json()

      if (response.ok) {
        toast.success(`${result.count || pendingSchedules.length} horarios importados correctamente`, { id: toastId })
        fetchSchedules()
        setIsImportOpen(false)
        setPendingSchedules([])
      } else {
        console.error("API Error:", result);
        toast.error(result.error || "Error al guardar los horarios", { id: toastId })
      }
    } catch (e) {
      console.error("Fetch Error:", e);
      toast.error("Error técnico: No se pudo conectar con el servidor", { id: toastId })
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
                    Sube un archivo Excel (.xlsx) con columnas como: <br />
                    <span className="font-mono text-[10px] bg-slate-100 p-1 rounded">Curso, Profesor, Día, Inicio, Fin, Aula</span>
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
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 space-y-2 animate-in fade-in slide-in-from-top-2">
                      <p className="text-xs font-black text-blue-800 flex items-center gap-2 uppercase tracking-tighter">
                        <CheckCircle2 className="h-4 w-4 text-blue-600" />
                        {pendingSchedules.length} registros listos para subir
                      </p>
                      <div className="max-h-32 overflow-y-auto pr-2">
                        {pendingSchedules.slice(0, 5).map((s, i) => (
                          <div key={i} className="text-[10px] text-blue-600/70 border-b border-blue-100 py-1 last:border-0 italic">
                            • {s.courseTitle} ({s.dayOfWeek})
                          </div>
                        ))}
                        {pendingSchedules.length > 5 && <p className="text-[10px] text-blue-400 mt-1">... y {pendingSchedules.length - 5} más</p>}
                      </div>
                    </div>
                  )}

                  {importLoading && (
                    <div className="flex items-center justify-center p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                      <div className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                        <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                        Procesando...
                      </div>
                    </div>
                  )}
                </div>
                <DialogFooter className="flex flex-col sm:flex-row gap-3">
                  <Button variant="ghost" onClick={() => setIsImportOpen(false)} className="sm:flex-1">Cancelar</Button>
                  <Button
                    onClick={executeImport}
                    disabled={importLoading || pendingSchedules.length === 0}
                    className="sm:flex-1 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-100"
                  >
                    {importLoading ? "Subiendo..." : "Ejecutar Subida"}
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