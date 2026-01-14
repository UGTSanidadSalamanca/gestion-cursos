"use client"

import { useState, useEffect } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  Edit,
  Eye,
  Clock,
  Users,
  Euro,
  Calendar,
  Download,
  Loader2,
  ExternalLink,
  MessageSquare,
  UserCheck
} from "lucide-react"
import { EnrollmentForm } from "@/components/enrollment/enrollment-form"
import { toast } from "sonner"
import { jsPDF } from "jspdf"
import html2canvas from "html2canvas"
import { QRCodeSVG } from "qrcode.react"

interface Course {
  id: string
  title: string
  description?: string
  code: string
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT' | 'PREPARACION_OPOSICIONES'
  duration: number
  durationSessions?: number
  sessionDuration?: number
  durationMonths?: number
  durationPeriod?: string
  syllabusUrl?: string
  maxStudents: number
  price: number
  affiliatePrice?: number
  isActive: boolean
  startDate?: string
  endDate?: string
  publicDescription?: string
  benefits?: string
  features?: string
  callUrl?: string
  hasCertificate: boolean
  hasMaterials: boolean
  teacher?: {
    id: string
    name: string
  }
  modules?: CourseModule[]
  _count?: {
    enrollments: number
  }
}

interface CourseModule {
  id?: string
  title: string
  description?: string
  teacherId?: string
  teacher?: {
    id: string
    name: string
  }
}

export default function CoursesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterLevel, setFilterLevel] = useState("all")
  const [courses, setCourses] = useState<Course[]>([])
  const [teachers, setTeachers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)

  const [courseFormData, setCourseFormData] = useState({
    title: '',
    code: '',
    level: 'BEGINNER',
    duration: '',
    durationSessions: '',
    sessionDuration: '',
    durationMonths: '',
    durationPeriod: '',
    syllabusUrl: '',
    price: '',
    affiliatePrice: '',
    startDate: '',
    endDate: '',
    teacherId: '',
    description: '',
    publicDescription: '',
    benefits: '',
    features: '',
    callUrl: '',
    isActive: true,
    hasCertificate: true,
    hasMaterials: true,
    maxStudents: '30',
    modules: [] as { title: string; description: string; teacherId: string }[]
  })

  useEffect(() => {
    fetchCourses()
    fetchTeachers()
  }, [])

  const fetchTeachers = async () => {
    try {
      const response = await fetch('/api/teachers')
      if (response.ok) {
        const data = await response.json()
        setTeachers(data)
      }
    } catch (error) {
      console.error('Error fetching teachers:', error)
    }
  }

  const fetchCourses = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/courses')
      if (response.ok) {
        const data = await response.json()
        setCourses(data)
      }
    } catch (error) {
      console.error('Error fetching courses:', error)
      toast.error("Error al cargar los cursos")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...courseFormData,
          duration: courseFormData.duration ? parseInt(courseFormData.duration) : 0,
          durationSessions: courseFormData.durationSessions ? parseInt(courseFormData.durationSessions) : null,
          sessionDuration: courseFormData.sessionDuration ? parseFloat(courseFormData.sessionDuration) : null,
          durationMonths: courseFormData.durationMonths ? parseInt(courseFormData.durationMonths) : null,
          price: courseFormData.price ? parseFloat(courseFormData.price) : 0,
          affiliatePrice: courseFormData.affiliatePrice ? parseFloat(courseFormData.affiliatePrice) : null,
          maxStudents: parseInt(courseFormData.maxStudents),
        }),
      })

      if (response.ok) {
        toast.success("Curso creado con éxito")
        await fetchCourses()
        setIsCreateDialogOpen(false)
        resetForm()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al crear el curso')
      }
    } catch (error) {
      toast.error('Error al crear el curso')
    }
  }

  const handleUpdateCourse = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCourse) return

    try {
      const response = await fetch(`/api/courses/${selectedCourse.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...courseFormData,
          duration: courseFormData.duration ? parseInt(courseFormData.duration) : 0,
          durationSessions: courseFormData.durationSessions ? parseInt(courseFormData.durationSessions) : null,
          sessionDuration: courseFormData.sessionDuration ? parseFloat(courseFormData.sessionDuration) : null,
          durationMonths: courseFormData.durationMonths ? parseInt(courseFormData.durationMonths) : null,
          price: courseFormData.price ? parseFloat(courseFormData.price) : 0,
          affiliatePrice: courseFormData.affiliatePrice ? parseFloat(courseFormData.affiliatePrice) : null,
          maxStudents: parseInt(courseFormData.maxStudents),
        }),
      })

      if (response.ok) {
        toast.success("Curso actualizado con éxito")
        await fetchCourses()
        setIsEditDialogOpen(false)
        setSelectedCourse(null)
        resetForm()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al actualizar el curso')
      }
    } catch (error) {
      toast.error('Error al actualizar el curso')
    }
  }

  const addModule = () => {
    setCourseFormData({
      ...courseFormData,
      modules: [...courseFormData.modules, { title: '', description: '', teacherId: '' }]
    })
  }

  const removeModule = (index: number) => {
    const nextModules = [...courseFormData.modules]
    nextModules.splice(index, 1)
    setCourseFormData({ ...courseFormData, modules: nextModules })
  }

  const updateModule = (index: number, field: string, value: string) => {
    const nextModules = [...courseFormData.modules]
    nextModules[index] = { ...nextModules[index], [field]: value } as any
    setCourseFormData({ ...courseFormData, modules: nextModules })
  }

  const resetForm = () => {
    setCourseFormData({
      title: '',
      code: '',
      level: 'BEGINNER',
      duration: '',
      durationSessions: '',
      sessionDuration: '',
      durationMonths: '',
      durationPeriod: '',
      syllabusUrl: '',
      price: '',
      affiliatePrice: '',
      startDate: '',
      endDate: '',
      teacherId: '',
      description: '',
      publicDescription: '',
      benefits: '',
      features: '',
      callUrl: '',
      isActive: true,
      hasCertificate: true,
      hasMaterials: true,
      maxStudents: '30',
      modules: []
    })
  }

  const handleEditClick = (course: Course) => {
    setSelectedCourse(course)
    setCourseFormData({
      title: course.title,
      code: course.code,
      level: course.level,
      duration: course.duration.toString(),
      durationSessions: course.durationSessions?.toString() || '',
      sessionDuration: course.sessionDuration?.toString() || '',
      durationMonths: course.durationMonths?.toString() || '',
      durationPeriod: course.durationPeriod || '',
      syllabusUrl: course.syllabusUrl || '',
      price: course.price.toString(),
      affiliatePrice: course.affiliatePrice?.toString() || '',
      startDate: course.startDate ? (typeof course.startDate === 'string' ? course.startDate.split('T')[0] : (course.startDate as any).toISOString().split('T')[0]) : '',
      endDate: course.endDate ? (typeof course.endDate === 'string' ? course.endDate.split('T')[0] : (course.endDate as any).toISOString().split('T')[0]) : '',
      teacherId: (course as any).teacherId || (course.teacher?.id) || '',
      description: course.description || '',
      publicDescription: course.publicDescription || '',
      benefits: course.benefits || '',
      features: course.features || '',
      callUrl: course.callUrl || '',
      isActive: course.isActive,
      hasCertificate: course.hasCertificate ?? true,
      hasMaterials: course.hasMaterials ?? true,
      maxStudents: (course.maxStudents || 0).toString(),
      modules: (course.modules || []).map(m => ({
        title: m.title,
        description: m.description || '',
        teacherId: m.teacherId || ''
      }))
    })
    setIsEditDialogOpen(true)
  }

  const handleViewClick = (course: Course) => {
    setSelectedCourse(course)
    setIsViewDialogOpen(true)
  }

  const handleExportPDF = async (course: Course) => {
    const toastId = toast.loading("Preparando ficha técnica...")

    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      const element = document.getElementById('course-details-print')
      if (!element) {
        toast.error("Error: Abre la vista del curso antes de descargar", { id: toastId })
        return
      }

      toast.loading("Capturando diseño...", { id: toastId })
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        onclone: (clonedDoc) => {
          const el = clonedDoc.getElementById('course-details-print')
          if (el) {
            const elements = el.getElementsByTagName('*')
            for (let i = 0; i < elements.length; i++) {
              const item = elements[i] as HTMLElement
              if (window.getComputedStyle(item).color.includes('oklch')) item.style.color = '#1e293b'
            }
          }
        }
      })

      const imgData = canvas.toDataURL('image/jpeg', 0.8)
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      })

      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      const imgProps = pdf.getImageProperties(imgData)
      const targetWidth = pdfWidth - 20
      const targetHeight = (imgProps.height * targetWidth) / imgProps.width

      pdf.setFillColor(37, 99, 235)
      pdf.rect(0, 0, pdfWidth, 15, 'F')
      pdf.setFontSize(10)
      pdf.setTextColor(255, 255, 255)
      pdf.text(`FICHA TÉCNICA: ${course.title}`, 10, 10)

      pdf.addImage(imgData, 'JPEG', 10, 20, targetWidth, targetHeight)
      pdf.setFontSize(8)
      pdf.setTextColor(150, 150, 150)
      pdf.text(`Generado el ${new Date().toLocaleDateString()} - Formación UGT Salamanca`, 10, pdfHeight - 10)

      pdf.save(`FICHA-${course.code.replace(/[^a-z0-9]/gi, '_')}.pdf`)
      toast.success("PDF descargado con éxito", { id: toastId })
    } catch (error) {
      console.error("PDF Export Error:", error)
      toast.error(`Error al generar PDF: ${error instanceof Error ? error.message : "Desconocido"}`, { id: toastId })
    }
  }

  const getLevelBadge = (level: string) => {
    switch (level) {
      case "BEGINNER":
        return <Badge className="bg-green-500 hover:bg-green-600">Principiante</Badge>
      case "INTERMEDIATE":
        return <Badge className="bg-blue-500 hover:bg-blue-600">Intermedio</Badge>
      case "ADVANCED":
        return <Badge className="bg-purple-500 hover:bg-purple-600">Avanzado</Badge>
      case "EXPERT":
        return <Badge className="bg-red-500 hover:bg-red-600">Experto</Badge>
      case "PREPARACION_OPOSICIONES":
        return <Badge className="bg-amber-600 hover:bg-amber-700">Oposiciones</Badge>
      default:
        return <Badge>{level}</Badge>
    }
  }

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.code.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesLevel = filterLevel === "all" || course.level === filterLevel
    return matchesSearch && matchesLevel
  })

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gestión de Cursos</h1>
            <p className="text-muted-foreground">
              Administra todos los cursos y asignaturas del centro educativo
            </p>
          </div>
          <div className="mt-4 flex items-center space-x-2 md:mt-0">
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Nuevo Curso
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[850px] max-h-[90vh] overflow-hidden flex flex-col p-0 border-none shadow-2xl">
                <form onSubmit={handleCreateCourse} className="flex flex-col h-full">
                  <DialogHeader className="p-6 bg-slate-50 border-b shrink-0">
                    <DialogTitle className="text-2xl font-bold text-slate-900">Crear Nuevo Curso</DialogTitle>
                    <DialogDescription>Configura los detalles del nuevo programa educativo de forma profesional.</DialogDescription>
                  </DialogHeader>
                  <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                    {/* Sección 1: Información Básica */}
                    <div className="space-y-4 text-left">
                      <h3 className="text-sm font-black text-blue-600 uppercase tracking-[0.2em] flex items-center gap-2">
                        <BookOpen className="h-4 w-4" /> Datos de Identificación
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="title" className="text-[10px] font-bold text-slate-400 uppercase">Título del Curso</Label>
                          <Input
                            id="title"
                            value={courseFormData.title}
                            onChange={(e) => setCourseFormData({ ...courseFormData, title: e.target.value })}
                            required
                            className="bg-white border-slate-200"
                            placeholder="Nombre del programa..."
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="code" className="text-[10px] font-bold text-slate-400 uppercase">Código Interno</Label>
                          <Input
                            id="code"
                            value={courseFormData.code}
                            onChange={(e) => setCourseFormData({ ...courseFormData, code: e.target.value })}
                            required
                            placeholder="Ej: ESC-2024-X"
                            className="bg-white border-slate-200"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="level" className="text-[10px] font-bold text-slate-400 uppercase">Nivel</Label>
                          <Select
                            value={courseFormData.level}
                            onValueChange={(value) => setCourseFormData({ ...courseFormData, level: value })}
                          >
                            <SelectTrigger className="bg-white border-slate-200">
                              <SelectValue placeholder="Elegir nivel" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="BEGINNER">Principiante</SelectItem>
                              <SelectItem value="INTERMEDIATE">Intermedio</SelectItem>
                              <SelectItem value="ADVANCED">Avanzado</SelectItem>
                              <SelectItem value="EXPERT">Experto</SelectItem>
                              <SelectItem value="PREPARACION_OPOSICIONES">Oposiciones</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    {/* Sección 2: Logística y Horas */}
                    <div className="space-y-4 pt-6 border-t text-left">
                      <h3 className="text-sm font-black text-blue-600 uppercase tracking-[0.2em] flex items-center gap-2">
                        <Clock className="h-4 w-4" /> Duración y Cronograma
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="duration" className="text-[10px] font-bold text-slate-400 uppercase">Horas Totales</Label>
                          <Input id="duration" type="number" value={courseFormData.duration} onChange={(e) => setCourseFormData({ ...courseFormData, duration: e.target.value })} required className="bg-white border-slate-200" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="durationSessions" className="text-[10px] font-bold text-slate-400 uppercase">Nº Sesiones</Label>
                          <Input id="durationSessions" type="number" value={courseFormData.durationSessions} onChange={(e) => setCourseFormData({ ...courseFormData, durationSessions: e.target.value })} className="bg-white border-slate-200" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="sessionDuration" className="text-[10px] font-bold text-slate-400 uppercase">H/Sesión</Label>
                          <Input id="sessionDuration" type="number" step="0.5" value={courseFormData.sessionDuration} onChange={(e) => setCourseFormData({ ...courseFormData, sessionDuration: e.target.value })} className="bg-white border-slate-200" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="durationMonths" className="text-[10px] font-bold text-slate-400 uppercase">Meses</Label>
                          <Input id="durationMonths" type="number" value={courseFormData.durationMonths} onChange={(e) => setCourseFormData({ ...courseFormData, durationMonths: e.target.value })} className="bg-white border-slate-200" />
                        </div>
                        <div className="space-y-2 md:col-span-1 lg:col-span-1">
                          <Label htmlFor="durationPeriod" className="text-[10px] font-bold text-slate-400 uppercase">Periodo</Label>
                          <Input id="durationPeriod" placeholder="Ej: Oct-Dic" value={courseFormData.durationPeriod} onChange={(e) => setCourseFormData({ ...courseFormData, durationPeriod: e.target.value })} className="bg-white border-slate-200" />
                        </div>
                        <div className="space-y-2 col-span-1 md:col-span-2">
                          <Label htmlFor="startDate" className="text-[10px] font-bold text-slate-400 uppercase">Inicio</Label>
                          <Input id="startDate" type="date" value={courseFormData.startDate} onChange={(e) => setCourseFormData({ ...courseFormData, startDate: e.target.value })} className="bg-white border-slate-200" />
                        </div>
                        <div className="space-y-2 col-span-1 md:col-span-2">
                          <Label htmlFor="endDate" className="text-[10px] font-bold text-slate-400 uppercase">Fin</Label>
                          <Input id="endDate" type="date" value={courseFormData.endDate} onChange={(e) => setCourseFormData({ ...courseFormData, endDate: e.target.value })} className="bg-white border-slate-200" />
                        </div>
                      </div>
                    </div>

                    {/* Sección 3: Económico y Profesor */}
                    <div className="space-y-4 pt-6 border-t text-left">
                      <h3 className="text-sm font-black text-blue-600 uppercase tracking-[0.2em] flex items-center gap-2">
                        <Euro className="h-4 w-4" /> Costes y Docencia
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="price" className="text-[10px] font-bold text-slate-400 uppercase">Precio Base (€)</Label>
                          <Input id="price" type="number" step="0.01" value={courseFormData.price} onChange={(e) => setCourseFormData({ ...courseFormData, price: e.target.value })} required className="bg-white border-slate-200 font-bold" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="affiliatePrice" className="text-[10px] font-bold text-green-600 uppercase">Precio Afiliado (€)</Label>
                          <Input id="affiliatePrice" type="number" step="0.01" value={courseFormData.affiliatePrice} onChange={(e) => setCourseFormData({ ...courseFormData, affiliatePrice: e.target.value })} className="bg-green-50/30 border-green-100 font-bold text-green-700" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="teacher" className="text-[10px] font-bold text-slate-400 uppercase">Docente Principal</Label>
                          <Select value={courseFormData.teacherId} onValueChange={(value) => setCourseFormData({ ...courseFormData, teacherId: value })}>
                            <SelectTrigger className="bg-white border-slate-200"><SelectValue placeholder="Elegir" /></SelectTrigger>
                            <SelectContent>
                              {teachers.map((t) => (<SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    {/* Sección 4: Módulos Dinámicos */}
                    <div className="space-y-4 pt-6 border-t text-left">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-black text-blue-600 uppercase tracking-[0.2em] flex items-center gap-2">
                          <Plus className="h-4 w-4" /> Desglose por Temas
                        </h3>
                        <Button type="button" variant="outline" size="sm" onClick={addModule} className="h-8 bg-blue-50 text-blue-700 border-blue-200">
                          <Plus className="h-3 w-3 mr-1" /> Añadir Apartado
                        </Button>
                      </div>
                      <div className="grid gap-4">
                        {courseFormData.modules.map((module, index) => (
                          <div key={index} className="bg-white p-6 rounded-2xl border border-slate-200 relative group transition-all hover:bg-slate-50 shadow-sm text-left">
                            <Button type="button" variant="ghost" size="icon" className="absolute -right-2 -top-2 h-7 w-7 rounded-full bg-white border shadow-md overflow-hidden text-red-500 hover:bg-red-50 z-10" onClick={() => removeModule(index)}>
                              <Plus className="h-4 w-4 rotate-45" />
                            </Button>
                            <div className="grid grid-cols-12 gap-4">
                              <div className="col-span-12 md:col-span-7 space-y-2">
                                <Label className="text-[10px] font-bold uppercase text-slate-400 text-left block">Título</Label>
                                <Input placeholder="Nombre del tema..." className="h-10 text-sm font-bold bg-white" value={module.title} onChange={(e) => updateModule(index, 'title', e.target.value)} />
                              </div>
                              <div className="col-span-12 md:col-span-5 space-y-2">
                                <Label className="text-[10px] font-bold uppercase text-slate-400 text-left block">Docente</Label>
                                <Select value={module.teacherId} onValueChange={(val) => updateModule(index, 'teacherId', val)}>
                                  <SelectTrigger className="h-10 text-xs bg-white"><SelectValue placeholder="Elegir" /></SelectTrigger>
                                  <SelectContent>
                                    {teachers.map((t) => (<SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Sección 5: Presencia Web */}
                    <div className="space-y-4 pt-6 border-t text-left">
                      <h3 className="text-sm font-black text-blue-600 uppercase tracking-[0.2em] flex items-center gap-2">
                        <ExternalLink className="h-4 w-4" /> Marketing y Landing
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                        <div className="space-y-6">
                          <div className="space-y-2">
                            <Label htmlFor="publicDescription" className="text-[10px] font-bold text-slate-400 uppercase text-left block">Descripción Pública</Label>
                            <Textarea id="publicDescription" className="min-h-[140px] bg-blue-50/10 border-blue-100" value={courseFormData.publicDescription} onChange={(e) => setCourseFormData({ ...courseFormData, publicDescription: e.target.value })} placeholder="Texto que verán los alumnos..." />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="benefits" className="text-[10px] font-bold text-slate-400 uppercase text-left block">Beneficios (Uno por línea)</Label>
                            <Textarea id="benefits" className="min-h-[100px] bg-blue-50/10 border-blue-100" value={courseFormData.benefits} onChange={(e) => setCourseFormData({ ...courseFormData, benefits: e.target.value })} placeholder="Ej: Certificado oficial..." />
                          </div>
                        </div>
                        <div className="space-y-6">
                          <div className="space-y-2">
                            <Label htmlFor="featuresFixed" className="text-[10px] font-bold text-slate-400 uppercase text-left block">Características (Checks)</Label>
                            <Textarea id="featuresFixed" className="min-h-[100px] bg-blue-50/10 border-blue-100" value={courseFormData.features} onChange={(e) => setCourseFormData({ ...courseFormData, features: e.target.value })} placeholder="Ej: Material incluido..." />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="callUrl" className="text-[10px] font-bold text-slate-400 uppercase text-left block">Link Convocatoria PDF</Label>
                            <Input id="callUrl" placeholder="https://..." className="bg-blue-50/10 border-blue-100" value={courseFormData.callUrl} onChange={(e) => setCourseFormData({ ...courseFormData, callUrl: e.target.value })} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <DialogFooter className="p-6 bg-slate-50 border-t flex items-center justify-end gap-3 shrink-0">
                    <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)} className="px-8 h-12 rounded-xl font-bold uppercase text-xs">
                      Cancelar
                    </Button>
                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700 px-12 h-12 rounded-xl shadow-xl shadow-blue-200 font-black uppercase text-xs tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98]">
                      Crear Curso
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Courses Table */}
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div>
                <CardTitle>Cursos Disponibles</CardTitle>
                <CardDescription>Visualiza y gestiona todos los programas educativos.</CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar curso..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 w-64"
                  />
                </div>
                <Select value={filterLevel} onValueChange={setFilterLevel}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Nivel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="BEGINNER">Principiante</SelectItem>
                    <SelectItem value="INTERMEDIATE">Intermedio</SelectItem>
                    <SelectItem value="ADVANCED">Avanzado</SelectItem>
                    <SelectItem value="EXPERT">Experto</SelectItem>
                    <SelectItem value="PREPARACION_OPOSICIONES">Oposiciones</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-slate-200">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="font-bold">Curso</TableHead>
                    <TableHead className="font-bold">Nivel</TableHead>
                    <TableHead className="font-bold">Profesor</TableHead>
                    <TableHead className="font-bold">Duración</TableHead>
                    <TableHead className="font-bold">Precio</TableHead>
                    <TableHead className="font-bold text-center">Inscritos</TableHead>
                    <TableHead className="font-bold">Estado</TableHead>
                    <TableHead className="font-bold text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500" />
                      </TableCell>
                    </TableRow>
                  ) : filteredCourses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center text-slate-500">
                        No se encontraron cursos.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCourses.map((course) => (
                      <TableRow key={course.id} className="hover:bg-slate-50/50 transition-colors">
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-900">{course.title}</span>
                            <span className="text-xs text-slate-500">{course.code}</span>
                          </div>
                        </TableCell>
                        <TableCell>{getLevelBadge(course.level)}</TableCell>
                        <TableCell className="text-slate-600">{course.teacher?.name || '---'}</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center px-2 py-1 rounded bg-slate-100 text-slate-700 text-xs font-medium">
                            <Clock className="w-3 h-3 mr-1" />
                            {course.duration}h
                          </span>
                        </TableCell>
                        <TableCell className="font-medium text-slate-900">€{course.price.toFixed(2)}</TableCell>
                        <TableCell className="text-center">
                          <span className="font-bold text-blue-600">{course._count?.enrollments || 0}</span>
                          <span className="text-slate-400"> / {course.maxStudents}</span>
                        </TableCell>
                        <TableCell>
                          {course.isActive ? (
                            <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100 shadow-none">Activo</Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-slate-100 text-slate-500 border-slate-200 shadow-none">Inactivo</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-blue-600" onClick={() => handleViewClick(course)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-orange-600" onClick={() => handleEditClick(course)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <EnrollmentForm courseId={course.id} onSuccess={fetchCourses} />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Dialogs */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="sm:max-w-[600px] border-none shadow-2xl overflow-hidden p-0">
            {selectedCourse && (
              <div id="course-details-print" className="bg-white">
                <div className="bg-blue-600 h-2 w-full" />
                <div className="p-8">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-3xl font-bold text-slate-900 leading-tight">{selectedCourse.title}</h2>
                      <p className="text-slate-500 font-mono mt-1">{selectedCourse.code}</p>
                    </div>
                    <Badge className={selectedCourse.isActive ? 'bg-green-500 px-3 py-1 text-sm' : 'bg-slate-400 px-3 py-1 text-sm'}>
                      {selectedCourse.isActive ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-8 mb-8">
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <div className="p-2 bg-slate-100 rounded-lg"><BookOpen className="h-5 w-5 text-blue-600" /></div>
                        <div>
                          <p className="text-xs font-bold text-slate-400 uppercase">Nivel</p>
                          <p className="font-semibold text-slate-700">{getLevelBadge(selectedCourse.level)}</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="p-2 bg-slate-100 rounded-lg"><Clock className="h-5 w-5 text-blue-600" /></div>
                        <div>
                          <p className="text-xs font-bold text-slate-400 uppercase">Duración</p>
                          <p className="font-semibold text-slate-700">{selectedCourse.duration} horas</p>
                          {(selectedCourse.durationSessions || selectedCourse.durationMonths || selectedCourse.durationPeriod) && (
                            <p className="text-[10px] text-slate-500 mt-1 italic">
                              {selectedCourse.durationPeriod && `Periodo: ${selectedCourse.durationPeriod}. `}
                              {selectedCourse.durationMonths && `${selectedCourse.durationMonths} meses. `}
                              {selectedCourse.durationSessions && `${selectedCourse.durationSessions} sesiones`}
                              {selectedCourse.sessionDuration && ` de ${selectedCourse.sessionDuration}h`}
                            </p>
                          )}
                        </div>
                      </div>
                      {selectedCourse.syllabusUrl && (
                        <div className="flex items-start space-x-3 bg-amber-50 p-2 rounded-lg border border-amber-100">
                          <div className="p-2 bg-amber-100 rounded-lg"><ExternalLink className="h-5 w-5 text-amber-600" /></div>
                          <div>
                            <p className="text-xs font-bold text-amber-500 uppercase">Temario / Drive</p>
                            <a
                              href={selectedCourse.syllabusUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs font-bold text-amber-700 hover:underline flex items-center"
                            >
                              Acceder al material <ExternalLink className="h-3 w-3 ml-1" />
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <div className="p-2 bg-slate-100 rounded-lg"><UserCheck className="h-5 w-5 text-blue-600" /></div>
                        <div>
                          <p className="text-xs font-bold text-slate-400 uppercase">Profesor</p>
                          <p className="font-semibold text-slate-700">{selectedCourse.teacher?.name || 'Por asignar'}</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="p-2 bg-slate-100 rounded-lg"><Euro className="h-5 w-5 text-green-600" /></div>
                        <div className="flex flex-col">
                          <p className="text-xs font-bold text-slate-400 uppercase">Precios</p>
                          <p className="font-semibold text-slate-700 text-sm">Gral: €{selectedCourse.price.toFixed(2)}</p>
                          {selectedCourse.affiliatePrice && (
                            <p className="font-bold text-green-600 text-sm">Afiliado: €{selectedCourse.affiliatePrice.toFixed(2)}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {selectedCourse.startDate && (
                    <div className="mb-6 flex items-center gap-2 bg-blue-50 p-3 rounded-xl border border-blue-100">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-bold text-blue-800">Fecha de inicio: {new Date(selectedCourse.startDate).toLocaleDateString()}</span>
                    </div>
                  )}

                  {/* Sección de Temario por Apartado */}
                  {selectedCourse.modules && selectedCourse.modules.length > 0 && (
                    <div className="mb-8">
                      <p className="text-xs font-bold text-slate-400 uppercase mb-3 px-1">Temario y Profesorado por Módulo</p>
                      <div className="grid gap-3">
                        {selectedCourse.modules.map((module, idx) => (
                          <div key={idx} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:bg-white hover:shadow-md transition-all duration-300">
                            <div className="h-10 w-10 shrink-0 bg-white rounded-xl border flex items-center justify-center text-blue-600 font-bold group-hover:scale-110 transition-transform shadow-sm">
                              {idx + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-slate-900 text-sm truncate">{module.title}</h4>
                              {module.description && <p className="text-[10px] text-slate-500 italic mt-0.5 truncate">{module.description}</p>}
                            </div>
                            <div className="text-right">
                              <div className="inline-flex items-center bg-blue-100/50 px-2 py-1 rounded-lg border border-blue-100">
                                <span className="text-[10px] font-bold text-blue-700">{module.teacher?.name || '---'}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 mb-8">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-3">Descripción del Curso</p>
                    <p className="text-slate-600 leading-relaxed italic">
                      {selectedCourse.description || 'Este curso no dispone de una descripción detallada en este momento.'}
                    </p>
                  </div>

                  <div className="flex items-center justify-between border-t pt-6 text-sm no-print">
                    <div className="flex flex-col gap-3 w-full">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-slate-500">
                          <Users className="h-4 w-4" />
                          <span>{selectedCourse._count?.enrollments || 0} alumnos inscritos de {selectedCourse.maxStudents}</span>
                        </div>
                        <div className="text-slate-400 italic font-medium">Formación UGT Salamanca</div>
                      </div>

                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col md:flex-row items-center gap-6">
                        <div className="flex-1 space-y-2">
                          <p className="font-bold text-slate-700 text-xs uppercase tracking-wider">Herramientas de captación</p>
                          <div className="flex flex-wrap gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100 h-9"
                              onClick={() => {
                                const baseUrl = window.location.origin
                                const publicUrl = `${baseUrl}/p/${selectedCourse.id}`
                                const message = `¡Hola! Mira este curso que te puede interesar: ${selectedCourse.title}. Toda la info aquí: ${publicUrl}`
                                window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank')
                              }}
                            >
                              <MessageSquare className="h-4 w-4 mr-2" /> WhatsApp
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 h-9"
                              onClick={() => {
                                const baseUrl = window.location.origin
                                const publicUrl = `${baseUrl}/p/${selectedCourse.id}`
                                navigator.clipboard.writeText(publicUrl)
                                toast.success("Enlace público copiado")
                              }}
                            >
                              <ExternalLink className="h-4 w-4 mr-2" /> Copiar Enlace
                            </Button>
                          </div>
                        </div>
                        <div className="bg-white p-2 rounded-lg border shadow-sm flex flex-col items-center">
                          <QRCodeSVG
                            value={`${window.location.host}/p/${selectedCourse.id}`}
                            size={64}
                            level="L"
                          />
                          <span className="text-[10px] mt-1 text-slate-400 font-bold uppercase">QR Info</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-slate-50 px-8 py-4 flex justify-end gap-3 no-print">
                  <Button variant="outline" onClick={() => handleExportPDF(selectedCourse)}>
                    <Download className="mr-2 h-4 w-4" /> Descargar Ficha (PDF)
                  </Button>
                  <Button onClick={() => setIsViewDialogOpen(false)}>Cerrar</Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-hidden flex flex-col p-0 border-none shadow-2xl">
            <form onSubmit={handleUpdateCourse} className="flex flex-col h-full">
              <DialogHeader className="p-6 bg-slate-50 border-b shrink-0">
                <DialogTitle className="text-2xl font-bold text-slate-900">Editar Curso</DialogTitle>
                <DialogDescription>Actualiza los detalles del programa de forma organizada.</DialogDescription>
              </DialogHeader>
              <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                {/* Sección 1: Datos de Identificación */}
                <div className="space-y-4 text-left">
                  <h3 className="text-sm font-black text-blue-600 uppercase tracking-[0.2em] flex items-center gap-2">
                    <BookOpen className="h-4 w-4" /> Datos de Identificación
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="edit-title" className="text-[10px] font-bold text-slate-400 uppercase">Título del Curso</Label>
                      <Input
                        id="edit-title"
                        value={courseFormData.title}
                        onChange={(e) => setCourseFormData({ ...courseFormData, title: e.target.value })}
                        required
                        className="bg-white border-slate-200 focus:border-blue-500 transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-code" className="text-[10px] font-bold text-slate-400 uppercase">Código / Expediente</Label>
                      <Input
                        id="edit-code"
                        value={courseFormData.code}
                        onChange={(e) => setCourseFormData({ ...courseFormData, code: e.target.value })}
                        required
                        placeholder="Ej: EXP-2024-01"
                        className="bg-white border-slate-200"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-level" className="text-[10px] font-bold text-slate-400 uppercase">Categoría Académica</Label>
                      <Select
                        value={courseFormData.level}
                        onValueChange={(value) => setCourseFormData({ ...courseFormData, level: value as any })}
                      >
                        <SelectTrigger className="bg-white border-slate-200">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="BEGINNER">Principiante</SelectItem>
                          <SelectItem value="INTERMEDIATE">Intermedio</SelectItem>
                          <SelectItem value="ADVANCED">Avanzado</SelectItem>
                          <SelectItem value="EXPERT">Experto</SelectItem>
                          <SelectItem value="PREPARACION_OPOSICIONES">Oposiciones</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Sección 2: Calendario y Horas */}
                <div className="space-y-4 pt-6 border-t text-left">
                  <h3 className="text-sm font-black text-blue-600 uppercase tracking-[0.2em] flex items-center gap-2">
                    <Clock className="h-4 w-4" /> Horario y Cronograma
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="edit-duration" className="text-[10px] font-bold text-slate-400 uppercase">Total H.</Label>
                      <Input id="edit-duration" type="number" value={courseFormData.duration} onChange={(e) => setCourseFormData({ ...courseFormData, duration: e.target.value })} required className="bg-white border-slate-200" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-durationSessions" className="text-[10px] font-bold text-slate-400 uppercase">Sesiones</Label>
                      <Input id="edit-durationSessions" type="number" value={courseFormData.durationSessions} onChange={(e) => setCourseFormData({ ...courseFormData, durationSessions: e.target.value })} className="bg-white border-slate-200" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-sessionDuration" className="text-[10px] font-bold text-slate-400 uppercase">H/Sesión</Label>
                      <Input id="edit-sessionDuration" type="number" step="0.5" value={courseFormData.sessionDuration} onChange={(e) => setCourseFormData({ ...courseFormData, sessionDuration: e.target.value })} className="bg-white border-slate-200" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-durationMonths" className="text-[10px] font-bold text-slate-400 uppercase">Meses</Label>
                      <Input id="edit-durationMonths" type="number" value={courseFormData.durationMonths} onChange={(e) => setCourseFormData({ ...courseFormData, durationMonths: e.target.value })} className="bg-white border-slate-200" />
                    </div>
                    <div className="space-y-2 md:col-span-2 lg:col-span-1">
                      <Label htmlFor="edit-durationPeriod" className="text-[10px] font-bold text-slate-400 uppercase">Periodo</Label>
                      <Input id="edit-durationPeriod" placeholder="Ej: Oct-Dic" value={courseFormData.durationPeriod} onChange={(e) => setCourseFormData({ ...courseFormData, durationPeriod: e.target.value })} className="bg-white border-slate-200" />
                    </div>
                  </div>
                </div>

                {/* Sección 3: Económico y Personal */}
                <div className="space-y-4 pt-6 border-t text-left">
                  <h3 className="text-sm font-black text-blue-600 uppercase tracking-[0.2em] flex items-center gap-2">
                    <Euro className="h-4 w-4" /> Costes y Responsable
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="edit-price" className="text-[10px] font-bold text-slate-400 uppercase">Precio General (€)</Label>
                      <Input id="edit-price" type="number" step="0.01" value={courseFormData.price} onChange={(e) => setCourseFormData({ ...courseFormData, price: e.target.value })} required className="bg-white border-slate-200 font-bold" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-affiliatePrice" className="text-[10px] font-bold text-green-600 uppercase">Precio Afiliado (€)</Label>
                      <Input id="edit-affiliatePrice" type="number" step="0.01" value={courseFormData.affiliatePrice} onChange={(e) => setCourseFormData({ ...courseFormData, affiliatePrice: e.target.value })} className="bg-green-50/30 border-green-100 font-bold text-green-700" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-maxStudents" className="text-[10px] font-bold text-slate-400 uppercase">Cupo Máximo</Label>
                      <Input id="edit-maxStudents" type="number" value={courseFormData.maxStudents} onChange={(e) => setCourseFormData({ ...courseFormData, maxStudents: e.target.value })} required className="bg-white border-slate-200" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-teacher" className="text-[10px] font-bold text-slate-400 uppercase">Docente Principal</Label>
                      <Select value={courseFormData.teacherId} onValueChange={(value) => setCourseFormData({ ...courseFormData, teacherId: value })}>
                        <SelectTrigger className="bg-white border-slate-200">
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                        <SelectContent>
                          {teachers.map((t) => (
                            <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Sección 4: Módulos Dinámicos */}
                <div className="space-y-4 pt-6 border-t text-left">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black text-blue-600 uppercase tracking-[0.2em] flex items-center gap-2">
                      <Plus className="h-4 w-4" /> Desglose del Temario
                    </h3>
                    <Button type="button" variant="outline" size="sm" onClick={addModule} className="h-8 bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100">
                      <Plus className="h-3 w-3 mr-1" /> Añadir Tema
                    </Button>
                  </div>

                  <div className="grid gap-4">
                    {courseFormData.modules.map((module, index) => (
                      <div key={index} className="bg-white p-6 rounded-2xl border border-slate-200 relative group transition-all hover:bg-slate-50 shadow-sm text-left">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute -right-2 -top-2 h-7 w-7 rounded-full bg-white border shadow-md overflow-hidden text-red-500 hover:bg-red-50 z-10"
                          onClick={() => removeModule(index)}
                        >
                          <Plus className="h-4 w-4 rotate-45" />
                        </Button>
                        <div className="grid grid-cols-12 gap-4">
                          <div className="col-span-12 md:col-span-7 space-y-2">
                            <Label className="text-[9px] font-bold uppercase text-slate-400 text-left block">Título del Apartado</Label>
                            <Input placeholder="Título del tema..." className="h-10 text-sm font-bold bg-white" value={module.title} onChange={(e) => updateModule(index, 'title', e.target.value)} />
                          </div>
                          <div className="col-span-12 md:col-span-5 space-y-2">
                            <Label className="text-[9px] font-bold uppercase text-slate-400 text-left block">Profesor Asignado</Label>
                            <Select value={module.teacherId} onValueChange={(val) => updateModule(index, 'teacherId', val)}>
                              <SelectTrigger className="h-10 text-xs bg-white"><SelectValue placeholder="Elegir docente" /></SelectTrigger>
                              <SelectContent>
                                {teachers.map((t) => (<SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="col-span-12 space-y-2">
                            <Label className="text-[9px] font-bold uppercase text-slate-400 text-left block">Resumen del contenido</Label>
                            <Input placeholder="Descripción breve..." className="h-9 text-xs italic bg-white/50" value={module.description} onChange={(e) => updateModule(index, 'description', e.target.value)} />
                          </div>
                        </div>
                      </div>
                    ))}
                    {courseFormData.modules.length === 0 && (
                      <div className="text-center py-8 bg-slate-50 border border-dashed rounded-3xl">
                        <p className="text-xs text-slate-400 italic">No se han definido apartados. Se asume que el profesor principal imparte todo el curso.</p>
                      </div>
                    )}
                  </div>
                </div>
                {/* Sección 5: Presencia Online */}
                <div className="space-y-4 pt-6 border-t text-left">
                  <h3 className="text-sm font-black text-blue-600 uppercase tracking-[0.2em] flex items-center gap-2">
                    <ExternalLink className="h-4 w-4" /> Marketing y Landing Page
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="edit-publicDescription" className="text-[10px] font-bold text-slate-400 uppercase text-left block">Resumen para la Web</Label>
                        <Textarea id="edit-publicDescription" className="min-h-[140px] bg-blue-50/10 border-blue-100 focus:border-blue-500" value={courseFormData.publicDescription} onChange={(e) => setCourseFormData({ ...courseFormData, publicDescription: e.target.value })} placeholder="Escribe aquí la descripción comercial..." />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-benefits" className="text-[10px] font-bold text-slate-400 uppercase text-left block">Beneficios Clave (Uno por línea o coma)</Label>
                        <Textarea id="edit-benefits" className="min-h-[100px] bg-blue-50/10 border-blue-100" value={courseFormData.benefits} onChange={(e) => setCourseFormData({ ...courseFormData, benefits: e.target.value })} placeholder="Ej: Bolsa de empleo, Tutorías 24/7..." />
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="edit-features" className="text-[10px] font-bold text-slate-400 uppercase text-left block">Prestaciones Incluidas</Label>
                        <Textarea id="edit-features" className="min-h-[100px] bg-blue-50/10 border-blue-100" value={courseFormData.features} onChange={(e) => setCourseFormData({ ...courseFormData, features: e.target.value })} placeholder="Ej: Material impreso, Certificado oficial..." />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-callUrl" className="text-[10px] font-bold text-slate-400 uppercase text-left block">Enlace a Convocatoria PDF/Web</Label>
                        <Input id="edit-callUrl" placeholder="https://..." className="bg-blue-50/10 border-blue-100" value={courseFormData.callUrl} onChange={(e) => setCourseFormData({ ...courseFormData, callUrl: e.target.value })} />
                      </div>
                      <div className="bg-slate-100 p-6 rounded-2xl flex items-center space-x-4 border border-slate-200">
                        <input type="checkbox" id="edit-isActive" checked={courseFormData.isActive} onChange={(e) => setCourseFormData({ ...courseFormData, isActive: e.target.checked })} className="h-6 w-6 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                        <div className="flex flex-col text-left">
                          <Label htmlFor="edit-isActive" className="text-sm font-black text-slate-700 cursor-pointer">CURSO VISIBLE</Label>
                          <p className="text-[10px] text-slate-500 uppercase font-bold text-left">Publicar automáticamente en la web</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sección 6: Área Privada */}
                <div className="space-y-4 pt-6 border-t text-left pb-4">
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] text-left">Gestión administrativa</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <Label htmlFor="edit-syllabusUrl" className="text-[10px] font-bold text-slate-400 uppercase text-left block">Material didáctico (Link Drive)</Label>
                      <Input id="edit-syllabusUrl" placeholder="URL para uso interno" value={courseFormData.syllabusUrl} onChange={(e) => setCourseFormData({ ...courseFormData, syllabusUrl: e.target.value })} className="bg-slate-50" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-description" className="text-[10px] font-bold text-slate-400 uppercase text-left block">Notas y Comentarios Internos</Label>
                      <Textarea id="edit-description" className="min-h-[80px] bg-slate-50" value={courseFormData.description} onChange={(e) => setCourseFormData({ ...courseFormData, description: e.target.value })} placeholder="Solo el personal podrá leer esto..." />
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter className="p-6 bg-slate-50 border-t flex items-center justify-end gap-3 shrink-0">
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)} className="px-8 h-12 rounded-xl font-bold uppercase text-xs">
                  Descartar
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 px-12 h-12 rounded-xl shadow-xl shadow-blue-200 font-black uppercase text-xs tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98]">
                  Actualizar Curso
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div >
    </MainLayout >
  )
}