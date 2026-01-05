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
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT'
  duration: number
  maxStudents: number
  price: number
  affiliatePrice?: number
  isActive: boolean
  startDate?: string
  endDate?: string
  publicDescription?: string
  benefits?: string
  teacher?: {
    id: string
    name: string
  }
  _count?: {
    enrollments: number
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
    price: '',
    affiliatePrice: '',
    startDate: '',
    teacherId: '',
    description: '',
    publicDescription: '',
    benefits: '',
    isActive: true,
    maxStudents: '30'
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

  const resetForm = () => {
    setCourseFormData({
      title: '',
      code: '',
      level: 'BEGINNER',
      duration: '',
      price: '',
      affiliatePrice: '',
      startDate: '',
      teacherId: '',
      description: '',
      publicDescription: '',
      benefits: '',
      isActive: true,
      maxStudents: '30'
    })
  }

  const handleEditClick = (course: Course) => {
    setSelectedCourse(course)
    setCourseFormData({
      title: course.title,
      code: course.code,
      level: course.level,
      duration: course.duration.toString(),
      price: course.price.toString(),
      affiliatePrice: course.affiliatePrice?.toString() || '',
      startDate: course.startDate ? (typeof course.startDate === 'string' ? course.startDate.split('T')[0] : (course.startDate as any).toISOString().split('T')[0]) : '',
      teacherId: (course as any).teacherId || (course.teacher?.id) || '',
      description: course.description || '',
      publicDescription: course.publicDescription || '',
      benefits: course.benefits || '',
      isActive: course.isActive,
      maxStudents: (course.maxStudents || 0).toString()
    })
    setIsEditDialogOpen(true)
  }

  const handleViewClick = (course: Course) => {
    setSelectedCourse(course)
    setIsViewDialogOpen(true)
  }

  const handleExportPDF = async (course: Course) => {
    const toastId = toast.loading("Preparando ficha técnica...")

    // Pequeño retardo para asegurar que el DOM está estable
    await new Promise(resolve => setTimeout(resolve, 800))

    const element = document.getElementById('course-details-print')
    if (!element) {
      toast.error("Error: Elemento visual no encontrado", { id: toastId })
      return
    }

    try {
      toast.loading("Capturando diseño (evitando oklch)...", { id: toastId })
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        onclone: (clonedDoc) => {
          const el = clonedDoc.getElementById('course-details-print')
          if (el) {
            // Forzamos colores estándar en el clon para evitar errores con oklch
            const allElements = el.getElementsByTagName('*')
            for (let i = 0; i < allElements.length; i++) {
              const target = allElements[i] as HTMLElement
              target.style.color = '#1e293b'
              if (target.classList.contains('bg-blue-600')) target.style.backgroundColor = '#2563eb'
              if (target.classList.contains('text-blue-600')) target.style.color = '#2563eb'
            }
          }
        }
      })

      const imgData = canvas.toDataURL('image/png')
      if (imgData === 'data:,') {
        throw new Error("Imagen generada vacía")
      }

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      })

      const imgProps = pdf.getImageProperties(imgData)
      const pdfWidth = pdf.internal.pageSize.getWidth() - 20
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width

      pdf.setFontSize(22)
      pdf.setTextColor(30, 41, 59)
      pdf.text('FICHA DEL CURSO', 10, 20)
      pdf.addImage(imgData, 'PNG', 10, 30, pdfWidth, pdfHeight)

      pdf.setFontSize(10)
      pdf.setTextColor(128, 128, 128)
      pdf.text(`Generado el: ${new Date().toLocaleString()} - Formación UGT Salamanca`, 10, 285)

      pdf.save(`FICHA-${course.code}.pdf`)
      toast.success("PDF descargado correctamente", { id: toastId })
    } catch (error) {
      console.error("Error al generar PDF:", error)
      toast.error("Error técnico: Problema de compatibilidad de colores. Inténtalo de nuevo.", { id: toastId })
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
              <DialogContent className="sm:max-w-[525px]">
                <form onSubmit={handleCreateCourse}>
                  <DialogHeader>
                    <DialogTitle>Crear Nuevo Curso</DialogTitle>
                    <DialogDescription>
                      Completa los datos del nuevo curso para agregarlo al sistema.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="title" className="text-right">Título</Label>
                      <Input
                        id="title"
                        className="col-span-3"
                        value={courseFormData.title}
                        onChange={(e) => setCourseFormData({ ...courseFormData, title: e.target.value })}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="code" className="text-right">Código</Label>
                      <Input
                        id="code"
                        className="col-span-3"
                        value={courseFormData.code}
                        onChange={(e) => setCourseFormData({ ...courseFormData, code: e.target.value })}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="level" className="text-right">Nivel</Label>
                      <Select
                        value={courseFormData.level}
                        onValueChange={(value) => setCourseFormData({ ...courseFormData, level: value })}
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Seleccionar nivel" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="BEGINNER">Principiante</SelectItem>
                          <SelectItem value="INTERMEDIATE">Intermedio</SelectItem>
                          <SelectItem value="ADVANCED">Avanzado</SelectItem>
                          <SelectItem value="EXPERT">Experto</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="duration" className="text-right">Duración (h)</Label>
                      <Input
                        id="duration"
                        type="number"
                        className="col-span-3"
                        value={courseFormData.duration}
                        onChange={(e) => setCourseFormData({ ...courseFormData, duration: e.target.value })}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="price" className="text-right whitespace-nowrap">Precio No Afiliado</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        className="col-span-3"
                        value={courseFormData.price}
                        onChange={(e) => setCourseFormData({ ...courseFormData, price: e.target.value })}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="affiliatePrice" className="text-right whitespace-nowrap">Precio Afiliado</Label>
                      <Input
                        id="affiliatePrice"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        className="col-span-3"
                        value={courseFormData.affiliatePrice}
                        onChange={(e) => setCourseFormData({ ...courseFormData, affiliatePrice: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="teacher" className="text-right">Profesor</Label>
                      <Select
                        value={courseFormData.teacherId}
                        onValueChange={(value) => setCourseFormData({ ...courseFormData, teacherId: value })}
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Seleccionar profesor" />
                        </SelectTrigger>
                        <SelectContent>
                          {teachers.map((teacher) => (
                            <SelectItem key={teacher.id} value={teacher.id}>
                              {teacher.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="startDate" className="text-right">Fecha Inicio</Label>
                      <Input
                        id="startDate"
                        type="date"
                        className="col-span-3"
                        value={courseFormData.startDate}
                        onChange={(e) => setCourseFormData({ ...courseFormData, startDate: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="description" className="text-right">Descripción Interna</Label>
                      <Textarea
                        id="description"
                        className="col-span-3 h-20"
                        value={courseFormData.description}
                        onChange={(e) => setCourseFormData({ ...courseFormData, description: e.target.value })}
                        placeholder="Solo visible para el personal"
                      />
                    </div>
                    <div className="border-t pt-4 mt-2">
                      <p className="text-sm font-bold text-blue-600 mb-4 px-2 uppercase tracking-wider">Información para Landing Page</p>
                      <div className="grid grid-cols-4 items-center gap-4 mb-4">
                        <Label htmlFor="publicDescription" className="text-right">Desc. Pública</Label>
                        <Textarea
                          id="publicDescription"
                          className="col-span-3 h-24 bg-blue-50/30"
                          value={courseFormData.publicDescription}
                          onChange={(e) => setCourseFormData({ ...courseFormData, publicDescription: e.target.value })}
                          placeholder="Esta descripción aparecerá en el enlace público"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="benefits" className="text-right">Beneficios</Label>
                        <Textarea
                          id="benefits"
                          className="col-span-3 h-20 bg-blue-50/30"
                          value={courseFormData.benefits}
                          onChange={(e) => setCourseFormData({ ...courseFormData, benefits: e.target.value })}
                          placeholder="Ej: Certificado oficial, Prácticas en empresa, Material incluido (separar por comas)"
                        />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancelar</Button>
                    <Button type="submit">Guardar</Button>
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
                        </div>
                      </div>
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
                    <div className="mb-8 flex items-center gap-2 bg-blue-50 p-3 rounded-xl border border-blue-100">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-bold text-blue-800">Fecha de inicio: {new Date(selectedCourse.startDate).toLocaleDateString()}</span>
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
          <DialogContent className="sm:max-w-[525px]">
            <form onSubmit={handleUpdateCourse}>
              <DialogHeader>
                <DialogTitle>Editar Curso</DialogTitle>
                <DialogDescription>Actualiza los detalles del programa informativo.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-title" className="text-right">Título</Label>
                  <Input
                    id="edit-title"
                    className="col-span-3"
                    value={courseFormData.title}
                    onChange={(e) => setCourseFormData({ ...courseFormData, title: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-code" className="text-right">Código</Label>
                  <Input
                    id="edit-code"
                    className="col-span-3"
                    value={courseFormData.code}
                    onChange={(e) => setCourseFormData({ ...courseFormData, code: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-level" className="text-right">Nivel</Label>
                  <Select
                    value={courseFormData.level}
                    onValueChange={(value) => setCourseFormData({ ...courseFormData, level: value as any })}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BEGINNER">Principiante</SelectItem>
                      <SelectItem value="INTERMEDIATE">Intermedio</SelectItem>
                      <SelectItem value="ADVANCED">Avanzado</SelectItem>
                      <SelectItem value="EXPERT">Experto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-duration" className="text-right">Duración (h)</Label>
                  <Input
                    id="edit-duration"
                    type="number"
                    className="col-span-3"
                    value={courseFormData.duration}
                    onChange={(e) => setCourseFormData({ ...courseFormData, duration: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-price" className="text-right whitespace-nowrap">Precio No Afiliado</Label>
                  <Input
                    id="edit-price"
                    type="number"
                    step="0.01"
                    className="col-span-3"
                    value={courseFormData.price}
                    onChange={(e) => setCourseFormData({ ...courseFormData, price: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-affiliatePrice" className="text-right whitespace-nowrap">Precio Afiliado</Label>
                  <Input
                    id="edit-affiliatePrice"
                    type="number"
                    step="0.01"
                    className="col-span-3"
                    value={courseFormData.affiliatePrice}
                    onChange={(e) => setCourseFormData({ ...courseFormData, affiliatePrice: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-price" className="text-right">Cupo Máx.</Label>
                  <Input
                    type="number"
                    className="col-span-3"
                    value={courseFormData.maxStudents}
                    onChange={(e) => setCourseFormData({ ...courseFormData, maxStudents: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-teacher" className="text-right">Profesor</Label>
                  <Select
                    value={courseFormData.teacherId}
                    onValueChange={(value) => setCourseFormData({ ...courseFormData, teacherId: value })}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      {teachers.map((t) => (
                        <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-startDate" className="text-right">Fecha Inicio</Label>
                  <Input
                    id="edit-startDate"
                    type="date"
                    className="col-span-3"
                    value={courseFormData.startDate}
                    onChange={(e) => setCourseFormData({ ...courseFormData, startDate: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Estado</Label>
                  <div className="col-span-3 flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="edit-isActive"
                      checked={courseFormData.isActive}
                      onChange={(e) => setCourseFormData({ ...courseFormData, isActive: e.target.checked })}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Label htmlFor="edit-isActive" className="text-sm font-normal">Curso Activo</Label>
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-description" className="text-right">Descripción Interna</Label>
                  <Textarea
                    id="edit-description"
                    className="col-span-3 h-20"
                    value={courseFormData.description}
                    onChange={(e) => setCourseFormData({ ...courseFormData, description: e.target.value })}
                  />
                </div>
                <div className="border-t pt-4 mt-2">
                  <p className="text-sm font-bold text-blue-600 mb-4 px-2 uppercase tracking-wider">Información para Landing Page</p>
                  <div className="grid grid-cols-4 items-center gap-4 mb-4">
                    <Label htmlFor="edit-publicDescription" className="text-right">Desc. Pública</Label>
                    <Textarea
                      id="edit-publicDescription"
                      className="col-span-3 h-24 bg-blue-50/20"
                      value={courseFormData.publicDescription}
                      onChange={(e) => setCourseFormData({ ...courseFormData, publicDescription: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit-benefits" className="text-right">Beneficios</Label>
                    <Textarea
                      id="edit-benefits"
                      className="col-span-3 h-20 bg-blue-50/20"
                      value={courseFormData.benefits}
                      onChange={(e) => setCourseFormData({ ...courseFormData, benefits: e.target.value })}
                      placeholder="Separar beneficios por comas"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancelar</Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">Guardar Cambios</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  )
}