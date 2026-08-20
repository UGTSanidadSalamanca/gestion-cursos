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
import { Switch } from "@/components/ui/switch"
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
  UserCheck,
  Printer,
  Mail,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  CalendarX,
  RefreshCw,
  SlidersHorizontal,
  Check,
  Copy
} from "lucide-react"
import * as XLSX from "xlsx"
import { GroupEmailDialog } from "@/components/courses/group-email-dialog"
import { EnrollmentForm } from "@/components/enrollment/enrollment-form"
import { toast } from "sonner"
import { jsPDF } from "jspdf"
import html2canvas from "html2canvas"
import { QRCodeSVG } from "qrcode.react"
import { isCourseExpired } from "@/lib/utils"

interface Course {
  id: string
  title: string
  description?: string
  code: string
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT' | 'PREPARACION_OPOSICIONES'
  duration?: number
  durationSessions?: number
  sessionDuration?: number
  durationMonths?: number
  durationPeriod?: string
  syllabusUrl?: string
  maxStudents: number
  price?: number
  priceUnit?: string
  paymentFrequency?: string
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
  modules?: CourseModule[]
  enrollments?: {
    id: string
    status: string
    createdAt: string
    student: {
      name: string
      dni?: string
      phone?: string
      email?: string
      address?: string
      isAffiliated: boolean
      affiliateNumber?: string
      status: string
    }
  }[]
  _count?: {
    enrollments: number
  }
  schedules?: {
    id: string
    dayOfWeek: string
    startTime: string
    endTime: string
    classroom?: string
    teacherId?: string
    notes?: string
    teacher?: {
      name: string
    }
  }[]
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
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false)
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
    priceUnit: '',
    paymentFrequency: '',
    affiliatePrice: '',
    startDate: '',
    endDate: '',
    description: '',
    publicDescription: '',
    benefits: '',
    features: '',
    callUrl: '',
    isActive: true,
    hasCertificate: true,
    hasMaterials: true,
    maxStudents: '30',
    modules: [] as { title: string; description: string; teacherId: string }[],
    schedules: [] as { dayOfWeek: string; startTime: string; endTime: string; classroom: string; teacherId: string }[]
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

  const [filterStatus, setFilterStatus] = useState("all")
  const [isTogglingId, setIsTogglingId] = useState<string | null>(null)
  const [isSyncingExpired, setIsSyncingExpired] = useState(false)
  const [reactivateDialogCourse, setReactivateDialogCourse] = useState<Course | null>(null)
  const [reactivateEndDate, setReactivateEndDate] = useState("")
  const [reactivateAction, setReactivateAction] = useState<'extend' | 'no-limit'>('extend')
  const [duplicateDialogCourse, setDuplicateDialogCourse] = useState<Course | null>(null)
  const [isDuplicating, setIsDuplicating] = useState(false)

  const getPaymentFrequencyLabel = (freq?: string, short = false) => {
    if (!freq) return ''
    switch (freq) {
      case 'SINGLE': return short ? 'P. Único' : 'Pago Único'
      case '2_PAYMENTS': return short ? '2 Pagos' : '2 Pagos (Fraccionado)'
      case '3_PAYMENTS': return short ? '3 Pagos' : '3 Pagos (Fraccionado)'
      case '4_PAYMENTS': return short ? '4 Pagos' : '4 Pagos (Fraccionado)'
      case '5_PAYMENTS': return short ? '5 Pagos' : '5 Pagos (Fraccionado)'
      case '6_PAYMENTS': return short ? '6 Pagos' : '6 Pagos (Fraccionado)'
      case 'MONTHLY': return short ? 'Mensual' : 'Mensual'
      case 'BIMONTHLY': return short ? 'Bimestral' : 'Bimestral'
      case 'TRIMESTER': return short ? 'Trimestral' : 'Trimestral'
      case 'SEMESTER': return short ? 'Semestral' : 'Semestral'
      case 'ANNUAL': return short ? 'Anual' : 'Anual'
      default: return freq
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

  const handleToggleActive = async (course: Course, newChecked: boolean) => {
    if (!newChecked) {
      setIsTogglingId(course.id)
      try {
        const res = await fetch(`/api/courses/${course.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isActive: false })
        })
        if (res.ok) {
          toast.success(`Curso "${course.title}" desactivado`)
          setCourses(prev => prev.map(c => c.id === course.id ? { ...c, isActive: false } : c))
        } else {
          toast.error('Error al desactivar el curso')
        }
      } catch (e) {
        toast.error('Error de conexión al desactivar el curso')
      } finally {
        setIsTogglingId(null)
      }
      return
    }

    // Comprobar si el curso está vencido al intentar activarlo
    const isExpired = isCourseExpired(course.endDate)
    if (isExpired) {
      setReactivateDialogCourse(course)
      const nextMonth = new Date()
      nextMonth.setDate(nextMonth.getDate() + 30)
      setReactivateEndDate(nextMonth.toISOString().split('T')[0])
      setReactivateAction('extend')
      return
    }

    setIsTogglingId(course.id)
    try {
      const res = await fetch(`/api/courses/${course.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: true })
      })
      if (res.ok) {
        toast.success(`Curso "${course.title}" activado con éxito`)
        setCourses(prev => prev.map(c => c.id === course.id ? { ...c, isActive: true } : c))
      } else {
        toast.error('Error al activar el curso')
      }
    } catch (e) {
      toast.error('Error de conexión al activar el curso')
    } finally {
      setIsTogglingId(null)
    }
  }

  const handleConfirmReactivation = async () => {
    if (!reactivateDialogCourse) return
    setIsTogglingId(reactivateDialogCourse.id)

    try {
      let bodyData: any = { isActive: true }
      if (reactivateAction === 'extend') {
        if (!reactivateEndDate) {
          toast.error('Por favor, selecciona una fecha de finalización válida')
          setIsTogglingId(null)
          return
        }
        bodyData.endDate = reactivateEndDate
      } else if (reactivateAction === 'no-limit') {
        bodyData.endDate = null
      }

      const res = await fetch(`/api/courses/${reactivateDialogCourse.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData)
      })

      if (res.ok) {
        toast.success(
          reactivateAction === 'extend'
            ? `Curso "${reactivateDialogCourse.title}" reactivado hasta el ${new Date(reactivateEndDate).toLocaleDateString('es-ES')}`
            : `Curso "${reactivateDialogCourse.title}" reactivado sin fecha límite`
        )
        setCourses(prev => prev.map(c => c.id === reactivateDialogCourse.id ? { ...c, isActive: true, endDate: bodyData.endDate } : c))
        setReactivateDialogCourse(null)
      } else {
        toast.error('Error al reactivar el curso')
      }
    } catch (error) {
      toast.error('Error técnico al reactivar el curso')
    } finally {
      setIsTogglingId(null)
    }
  }

  const handleSyncExpired = async () => {
    setIsSyncingExpired(true)
    try {
      const res = await fetch('/api/courses/sync-expired', { method: 'POST' })
      if (res.ok) {
        const data = await res.json()
        toast.success(data.message)
        await fetchCourses()
      } else {
        toast.error('Error al sincronizar cursos vencidos')
      }
    } catch (e) {
      toast.error('Error de conexión')
    } finally {
      setIsSyncingExpired(false)
    }
  }

  const handleDuplicateCourse = async () => {
    if (!duplicateDialogCourse) return
    setIsDuplicating(true)
    try {
      const res = await fetch(`/api/courses/${duplicateDialogCourse.id}/duplicate`, { method: 'POST' })
      if (res.ok) {
        const newCourse: Course = await res.json()
        toast.success(`Copia de "${duplicateDialogCourse.title}" creada como borrador. Ahora puedes editarla.`)
        setDuplicateDialogCourse(null)
        await fetchCourses()
        // Abrir directamente el formulario de edición del curso duplicado
        handleEditClick(newCourse)
      } else {
        const err = await res.json()
        toast.error(err.error || 'Error al duplicar el curso')
      }
    } catch (e) {
      toast.error('Error de conexión al duplicar el curso')
    } finally {
      setIsDuplicating(false)
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
          duration: courseFormData.duration ? parseInt(courseFormData.duration) : null,
          durationSessions: courseFormData.durationSessions ? parseInt(courseFormData.durationSessions) : null,
          sessionDuration: courseFormData.sessionDuration ? parseFloat(courseFormData.sessionDuration) : null,
          durationMonths: courseFormData.durationMonths ? parseInt(courseFormData.durationMonths) : null,
          price: courseFormData.price ? parseFloat(courseFormData.price) : null,
          priceUnit: courseFormData.priceUnit,
          paymentFrequency: courseFormData.paymentFrequency,
          affiliatePrice: courseFormData.affiliatePrice ? parseFloat(courseFormData.affiliatePrice) : null,
          maxStudents: courseFormData.maxStudents ? parseInt(courseFormData.maxStudents) : 0,
          schedules: courseFormData.schedules.map(s => ({
            ...s,
            startTime: `1970-01-01T${s.startTime}:00Z`,
            endTime: `1970-01-01T${s.endTime}:00Z`
          }))
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
          duration: courseFormData.duration ? parseInt(courseFormData.duration) : null,
          durationSessions: courseFormData.durationSessions ? parseInt(courseFormData.durationSessions) : null,
          sessionDuration: courseFormData.sessionDuration ? parseFloat(courseFormData.sessionDuration) : null,
          durationMonths: courseFormData.durationMonths ? parseInt(courseFormData.durationMonths) : null,
          price: courseFormData.price ? parseFloat(courseFormData.price) : null,
          priceUnit: courseFormData.priceUnit,
          paymentFrequency: courseFormData.paymentFrequency,
          affiliatePrice: courseFormData.affiliatePrice ? parseFloat(courseFormData.affiliatePrice) : null,
          maxStudents: courseFormData.maxStudents ? parseInt(courseFormData.maxStudents) : 0,
          schedules: courseFormData.schedules.map(s => ({
            ...s,
            startTime: `1970-01-01T${s.startTime}:00Z`,
            endTime: `1970-01-01T${s.endTime}:00Z`
          }))
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

  const addSchedule = () => {
    setCourseFormData({
      ...courseFormData,
      schedules: [...courseFormData.schedules, { dayOfWeek: 'Lunes', startTime: '09:00', endTime: '12:00', classroom: '', teacherId: '' }]
    })
  }

  const removeModule = (index: number) => {
    const nextModules = [...courseFormData.modules]
    nextModules.splice(index, 1)
    setCourseFormData({ ...courseFormData, modules: nextModules })
  }

  const removeSchedule = (index: number) => {
    const nextSchedules = [...courseFormData.schedules]
    nextSchedules.splice(index, 1)
    setCourseFormData({ ...courseFormData, schedules: nextSchedules })
  }

  const updateModule = (index: number, field: string, value: string) => {
    const nextModules = [...courseFormData.modules]
    nextModules[index] = { ...nextModules[index], [field]: value } as any
    setCourseFormData({ ...courseFormData, modules: nextModules })
  }

  const updateSchedule = (index: number, field: string, value: string) => {
    const nextSchedules = [...courseFormData.schedules]
    nextSchedules[index] = { ...nextSchedules[index], [field]: value } as any
    setCourseFormData({ ...courseFormData, schedules: nextSchedules })
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
      priceUnit: '',
      paymentFrequency: '',
      affiliatePrice: '',
      startDate: '',
      endDate: '',
      description: '',
      publicDescription: '',
      benefits: '',
      features: '',
      callUrl: '',
      isActive: true,
      hasCertificate: true,
      hasMaterials: true,
      maxStudents: '30',
      modules: [],
      schedules: []
    })
  }

  const handleEditClick = (course: Course) => {
    setSelectedCourse(course)

    // Safely format dates
    const formatDate = (dateValue: string | Date | undefined | null) => {
      if (!dateValue) return ''
      try {
        // If it's already a string in YYYY-MM-DD format, just return it
        if (typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
          return dateValue
        }

        // Otherwise try to parse it
        const d = new Date(dateValue)
        if (isNaN(d.getTime())) return ''
        return d.toISOString().split('T')[0]
      } catch (e) {
        return ''
      }
    }

    setCourseFormData({
      title: course.title || '',
      code: course.code || '',
      level: course.level,
      duration: course.duration != null ? course.duration.toString() : '',
      durationSessions: course.durationSessions != null ? course.durationSessions.toString() : '',
      sessionDuration: course.sessionDuration != null ? course.sessionDuration.toString() : '',
      durationMonths: course.durationMonths != null ? course.durationMonths.toString() : '',
      durationPeriod: course.durationPeriod || '',
      syllabusUrl: course.syllabusUrl || '',
      price: course.price != null ? course.price.toString() : '',
      priceUnit: course.priceUnit || '',
      paymentFrequency: course.paymentFrequency || '',
      affiliatePrice: course.affiliatePrice != null ? course.affiliatePrice.toString() : '',
      startDate: course.startDate ? (typeof course.startDate === 'string' ? course.startDate.split('T')[0] : (course.startDate as any).toISOString().split('T')[0]) : '',
      endDate: course.endDate ? (typeof course.endDate === 'string' ? course.endDate.split('T')[0] : (course.endDate as any).toISOString().split('T')[0]) : '',
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
        title: m.title || '',
        description: m.description || '',
        teacherId: m.teacherId || ''
      })),
      schedules: (course.schedules || []).map(s => ({
        dayOfWeek: s.dayOfWeek || 'Lunes',
        startTime: s.startTime ? (typeof s.startTime === 'string' ? s.startTime.substring(11, 16) : s.startTime.toISOString().substring(11, 16)) : '',
        endTime: s.endTime ? (typeof s.endTime === 'string' ? s.endTime.substring(11, 16) : s.endTime.toISOString().substring(11, 16)) : '',
        classroom: s.classroom || '',
        teacherId: s.teacherId || ''
      }))
    })
    setIsEditDialogOpen(true)
  }

  const handleViewClick = async (course: Course) => {
    setSelectedCourse(course)
    setIsViewDialogOpen(true)

    // Fetch full details including students
    try {
      const response = await fetch(`/api/courses/${course.id}`)
      if (response.ok) {
        const fullCourse = await response.json()
        setSelectedCourse(fullCourse)
      }
    } catch (error) {
      console.error('Error fetching full course details:', error)
    }
  }
  const handleEmailClick = (course: Course) => {
    setSelectedCourse(course)
    setIsEmailDialogOpen(true)
  }

  const handlePrint = () => {
    window.print()
  }

  const handleExportPDF = async (course: Course) => {
    const toastId = toast.loading("Preparando ficha técnica...")

    try {
      // Forzar un pequeño delay para asegurar que el DOM esté listo y las fuentes cargadas
      await new Promise(resolve => setTimeout(resolve, 800))

      const element = document.getElementById('course-details-print')
      if (!element) {
        toast.error("Error: Abre primero la ficha completa del curso", { id: toastId })
        return
      }

      toast.loading("Generando captura de alta resolución...", { id: toastId })

      const canvas = await html2canvas(element, {
        scale: 4,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
        height: element.scrollHeight + 50, // Capturar altura completa con margen
        windowHeight: element.scrollHeight + 100,
        onclone: (clonedDoc) => {
          const el = clonedDoc.getElementById('course-details-print')
          if (el) {
            // Eliminar restricciones de scroll y altura para la captura
            el.style.height = 'auto'
            el.style.maxHeight = 'none'
            el.style.overflow = 'visible'
            el.style.backgroundColor = '#ffffff'
            el.style.width = '700px'
            el.style.display = 'block'
            el.style.padding = '0'
            el.style.margin = '0'

            // Asegurar que el contenedor interno tenga espacio al final
            const inner = el.querySelector('.pb-16') as HTMLElement
            if (inner) inner.style.paddingBottom = '100px'

            const allElements = el.getElementsByTagName('*')
            for (let i = 0; i < allElements.length; i++) {
              const item = allElements[i] as HTMLElement
              const inlineStyles = item.getAttribute('style') || ''
              if (inlineStyles.includes('ok')) {
                item.setAttribute('style', inlineStyles.replace(/ok(lch|lab)\([^)]+\)/g, '#1e293b'))
              }

              try {
                const computed = clonedDoc.defaultView?.getComputedStyle(item)
                if (computed) {
                  if (computed.color?.includes('ok')) item.style.color = '#1e293b'
                  if (computed.backgroundColor?.includes('ok')) {
                    item.style.backgroundColor = (item.tagName === 'DIV' || item.tagName === 'SECTION') ? '#ffffff' : 'transparent'
                  }
                  if (computed.borderColor?.includes('ok')) item.style.borderColor = '#e2e8f0'

                  if (item instanceof SVGElement) {
                    const fill = item.getAttribute('fill')
                    if (fill?.includes('ok')) item.setAttribute('fill', 'currentColor')
                    const stroke = item.getAttribute('stroke')
                    if (stroke?.includes('ok')) item.setAttribute('stroke', 'currentColor')
                  }
                }
              } catch (e) { }
            }
          }
        }
      })

      const imgData = canvas.toDataURL('image/jpeg', 1.0)
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      })

      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const margin = 10
      const contentWidth = pageWidth - (margin * 2)

      // Calcular altura proporcional
      const imgProps = pdf.getImageProperties(imgData)
      const contentHeight = (imgProps.height * contentWidth) / imgProps.width

      // Cabecera decorativa del PDF
      pdf.setFillColor(220, 38, 38) // UGT Red (red-600)
      pdf.rect(0, 0, pageWidth, 25, 'F')

      // Intentar añadir el logo al PDF
      try {
        pdf.addImage('/ugt-logo.png', 'PNG', margin, 5, 15, 15)
      } catch (e) {
        console.warn("Could not add logo to PDF:", e)
      }

      pdf.setTextColor(255, 255, 255)
      pdf.setFontSize(14)
      pdf.setFont('helvetica', 'bold')
      pdf.text("UGT SERVICIOS PÚBLICOS SALAMANCA", margin + 18, 12)
      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'normal')
      pdf.text("DEPARTAMENTO DE FORMACIÓN", margin + 18, 18)

      // Añadir la imagen capturada
      pdf.addImage(imgData, 'JPEG', margin, 30, contentWidth, contentHeight, undefined, 'FAST')

      // Pie de página
      pdf.setFontSize(8)
      pdf.setTextColor(100, 100, 100)
      pdf.setFont('helvetica', 'normal')
      const dateStr = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })
      pdf.text(`Ficha técnica generada el ${dateStr}. Este documento tiene carácter informativo.`, margin, pageHeight - 10)
      pdf.text("Página 1 de 1", pageWidth - 30, pageHeight - 10)

      const fileName = `FICHA_CURSO_${course.code.replace(/[^a-z0-9]/gi, '_')}.pdf`
      pdf.save(fileName)

      toast.success("¡Ficha descargada con éxito!", { id: toastId })
    } catch (error) {
      console.error("PDF Export Error:", error)
      toast.error(`Error al generar: ${error instanceof Error ? error.message : "Error técnico"}`, { id: toastId })
    }
  }

  const handleExportStudents = async (course: Course) => {
    let fullCourse = course
    if (!course.enrollments) {
      const toastId = toast.loading("Cargando datos de alumnos...")
      try {
        const response = await fetch(`/api/courses/${course.id}`)
        if (response.ok) {
          fullCourse = await response.json()
          toast.dismiss(toastId)
        } else {
          toast.error("Error al cargar alumnos", { id: toastId })
          return
        }
      } catch (error) {
        toast.error("Error técnico", { id: toastId })
        return
      }
    }

    if (!fullCourse.enrollments || fullCourse.enrollments.length === 0) {
      toast.error("No hay alumnos inscritos en este curso")
      return
    }

    const data = fullCourse.enrollments.map(e => ({
      'Nombre Completo': e.student.name,
      'DNI': e.student.dni || '',
      'Email': e.student.email || '',
      'Teléfono': e.student.phone || '',
      'Dirección': e.student.address || '',
      'Afiliado': e.student.isAffiliated ? 'SÍ' : 'NO',
      'Nº Afiliado': e.student.affiliateNumber || '',
      'Estado Alumno': e.student.status === 'ACTIVE' ? 'Activo' : e.student.status === 'INACTIVE' ? 'Inactivo' : e.student.status,
      'Estado Matrícula': e.status === 'ENROLLED' ? 'Matriculado' : e.status === 'PENDING' ? 'Pendiente' : e.status,
      'Fecha Inscripción': new Date(e.createdAt).toLocaleDateString('es-ES')
    }))

    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Alumnos")
    XLSX.writeFile(wb, `Alumnos_${fullCourse.code}_${fullCourse.title.replace(/[^a-z0-9]/gi, '_')}.xlsx`)
    toast.success("Excel generado correctamente")
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

  const totalCount = courses.length
  const activeCount = courses.filter(c => c.isActive && !isCourseExpired(c.endDate)).length
  const expiredCount = courses.filter(c => isCourseExpired(c.endDate)).length
  const inactiveCount = courses.filter(c => !c.isActive && !isCourseExpired(c.endDate)).length

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.code.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesLevel = filterLevel === "all" || course.level === filterLevel

    const isExpired = isCourseExpired(course.endDate)
    let matchesStatus = true
    if (filterStatus === "active") {
      matchesStatus = course.isActive && !isExpired
    } else if (filterStatus === "expired") {
      matchesStatus = isExpired
    } else if (filterStatus === "inactive") {
      matchesStatus = !course.isActive && !isExpired
    }

    return matchesSearch && matchesLevel && matchesStatus
  })

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-white p-2 rounded-xl shadow-md border border-slate-100 hidden md:block">
              <img src="/ugt-logo.png" alt="Logo UGT" className="h-10 w-auto object-contain" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Gestión de Cursos</h1>
              <p className="text-muted-foreground">
                Administra todos los cursos y asignaturas del centro educativo
              </p>
            </div>
          </div>
          <div className="mt-4 flex items-center space-x-2 md:mt-0">
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Nuevo Curso
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[850px] h-[90vh] flex flex-col p-0 border-none shadow-2xl overflow-hidden">
                <form onSubmit={handleCreateCourse} className="flex flex-col h-full overflow-hidden">
                  <DialogHeader className="p-6 bg-slate-50 border-b shrink-0">
                    <DialogTitle className="text-2xl font-bold text-slate-900">Crear Nuevo Curso</DialogTitle>
                    <DialogDescription>Configura los detalles del nuevo programa educativo de forma profesional.</DialogDescription>
                  </DialogHeader>

                  <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar bg-white">
                    {/* Sección 1: Información Básica */}
                    <div className="space-y-4 text-left">
                      <h3 className="text-sm font-black text-blue-600 uppercase tracking-[0.2em] flex items-center gap-2">
                        <BookOpen className="h-4 w-4" /> Datos de Identificación
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="title" className="text-xs font-bold text-slate-500 uppercase">Título del Curso</Label>
                          <Input
                            id="title"
                            value={courseFormData.title}
                            onChange={(e) => setCourseFormData({ ...courseFormData, title: e.target.value })}
                            required
                            className="bg-white border-slate-200 h-11"
                            placeholder="Nombre completo del curso..."
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="code" className="text-xs font-bold text-slate-500 uppercase">Código Interno</Label>
                          <Input
                            id="code"
                            value={courseFormData.code}
                            onChange={(e) => setCourseFormData({ ...courseFormData, code: e.target.value })}
                            required
                            placeholder="Ej: ESC-2024-X"
                            className="bg-white border-slate-200 h-11"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="level" className="text-xs font-bold text-slate-500 uppercase">Nivel Académico</Label>
                          <Select
                            value={courseFormData.level}
                            onValueChange={(value) => setCourseFormData({ ...courseFormData, level: value })}
                          >
                            <SelectTrigger className="bg-white border-slate-200 h-11">
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
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="duration" className="text-xs font-bold text-slate-500 uppercase">Horas Totales</Label>
                          <Input id="duration" type="number" value={courseFormData.duration} onChange={(e) => setCourseFormData({ ...courseFormData, duration: e.target.value })} className="bg-white border-slate-200 h-11" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="durationSessions" className="text-xs font-bold text-slate-500 uppercase">Nº Sesiones</Label>
                          <Input id="durationSessions" type="number" value={courseFormData.durationSessions} onChange={(e) => setCourseFormData({ ...courseFormData, durationSessions: e.target.value })} className="bg-white border-slate-200 h-11" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="sessionDuration" className="text-xs font-bold text-slate-500 uppercase">H/Sesión</Label>
                          <Input id="sessionDuration" type="number" step="0.5" value={courseFormData.sessionDuration} onChange={(e) => setCourseFormData({ ...courseFormData, sessionDuration: e.target.value })} className="bg-white border-slate-200 h-11" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="durationMonths" className="text-xs font-bold text-slate-500 uppercase">Nº Meses</Label>
                          <Input id="durationMonths" type="number" value={courseFormData.durationMonths} onChange={(e) => setCourseFormData({ ...courseFormData, durationMonths: e.target.value })} className="bg-white border-slate-200 h-11" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="durationPeriod" className="text-xs font-bold text-slate-500 uppercase">Periodo</Label>
                          <Input id="durationPeriod" placeholder="Ej: Oct-Dic" value={courseFormData.durationPeriod} onChange={(e) => setCourseFormData({ ...courseFormData, durationPeriod: e.target.value })} className="bg-white border-slate-200 h-11" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="startDate" className="text-xs font-bold text-slate-500 uppercase">Fecha Inicio</Label>
                          <Input id="startDate" type="date" value={courseFormData.startDate} onChange={(e) => setCourseFormData({ ...courseFormData, startDate: e.target.value })} className="bg-white border-slate-200 h-11" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="endDate" className="text-xs font-bold text-slate-500 uppercase">Fecha Fin</Label>
                          <Input id="endDate" type="date" value={courseFormData.endDate} onChange={(e) => setCourseFormData({ ...courseFormData, endDate: e.target.value })} className="bg-white border-slate-200 h-11" />
                        </div>
                      </div>
                    </div>

                    {/* Sección 3: Económico y Profesor */}
                    <div className="space-y-4 pt-6 border-t text-left">
                      <h3 className="text-sm font-black text-blue-600 uppercase tracking-[0.2em] flex items-center gap-2">
                        <Euro className="h-4 w-4" /> Costes y Docencia
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="price" className="text-xs font-bold text-slate-500 uppercase">Precio Base (€)</Label>
                          <div className="flex gap-2">
                            <Input id="price" type="number" step="0.01" value={courseFormData.price} onChange={(e) => setCourseFormData({ ...courseFormData, price: e.target.value })} className="bg-white border-slate-200 h-11 font-bold flex-1" />
                            <Select value={courseFormData.priceUnit} onValueChange={(value) => setCourseFormData({ ...courseFormData, priceUnit: value })}>
                              <SelectTrigger className="w-[110px] bg-slate-50 border-slate-200 h-11">
                                <SelectValue placeholder="Unidad" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="FULL">Total</SelectItem>
                                <SelectItem value="SESSION">Sesión</SelectItem>
                                <SelectItem value="MONTH">Mes</SelectItem>
                                <SelectItem value="TRIMESTER">Trimestre</SelectItem>
                                <SelectItem value="YEAR">Año</SelectItem>
                              </SelectContent>
                            </Select>
                            <Select value={courseFormData.paymentFrequency} onValueChange={(value) => setCourseFormData({ ...courseFormData, paymentFrequency: value })}>
                              <SelectTrigger className="w-[130px] bg-slate-50 border-slate-200 h-11">
                                <SelectValue placeholder="Forma / Plazos" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="SINGLE">Pago Único</SelectItem>
                                <SelectItem value="2_PAYMENTS">2 Pagos</SelectItem>
                                <SelectItem value="3_PAYMENTS">3 Pagos</SelectItem>
                                <SelectItem value="4_PAYMENTS">4 Pagos</SelectItem>
                                <SelectItem value="5_PAYMENTS">5 Pagos</SelectItem>
                                <SelectItem value="6_PAYMENTS">6 Pagos</SelectItem>
                                <SelectItem value="MONTHLY">Mensual</SelectItem>
                                <SelectItem value="BIMONTHLY">Bimestral</SelectItem>
                                <SelectItem value="TRIMESTER">Trimestral</SelectItem>
                                <SelectItem value="SEMESTER">Semestral</SelectItem>
                                <SelectItem value="ANNUAL">Anual</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="affiliatePrice" className="text-xs font-bold text-green-600 uppercase">Precio Afiliado (€)</Label>
                          <Input id="affiliatePrice" type="number" step="0.01" value={courseFormData.affiliatePrice} onChange={(e) => setCourseFormData({ ...courseFormData, affiliatePrice: e.target.value })} className="bg-green-50/30 border-green-100 h-11 font-bold text-green-700" />
                        </div>
                        <div className="space-y-2 col-span-1 md:col-span-1">
                          {/* Campo teacherId eliminado para favorecer docentes por módulo */}
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
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase text-slate-500 text-left block">Título</Label>
                                <Input placeholder="Nombre del tema..." className="h-10 text-sm font-bold bg-white" value={module.title} onChange={(e) => updateModule(index, 'title', e.target.value)} />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase text-slate-500 text-left block">Docente</Label>
                                <Select value={module.teacherId} onValueChange={(val) => updateModule(index, 'teacherId', val)}>
                                  <SelectTrigger className="h-10 text-xs bg-white"><SelectValue placeholder="Elegir" /></SelectTrigger>
                                  <SelectContent>
                                    {teachers.map((t) => (<SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="col-span-1 md:col-span-2 space-y-2">
                                <Label className="text-xs font-bold uppercase text-slate-500 text-left block">Descripción breve</Label>
                                <Input placeholder="Resumen del contenido..." className="h-10 text-sm bg-white" value={module.description} onChange={(e) => updateModule(index, 'description', e.target.value)} />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    {/* Sección 5: Horarios */}
                    <div className="space-y-4 pt-6 border-t text-left">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-black text-blue-600 uppercase tracking-[0.2em] flex items-center gap-2">
                          <Calendar className="h-4 w-4" /> Configuración de Horarios
                        </h3>
                        <Button type="button" variant="outline" size="sm" onClick={addSchedule} className="h-8 bg-blue-50 text-blue-700 border-blue-200">
                          <Plus className="h-3 w-3 mr-1" /> Añadir Horario
                        </Button>
                      </div>
                      <div className="grid gap-4">
                        {courseFormData.schedules.length === 0 && (
                          <div className="text-center py-6 border-2 border-dashed rounded-2xl border-slate-100 text-slate-400 text-xs font-bold italic">
                            No hay horarios definidos. Pulsa "Añadir Horario" para empezar.
                          </div>
                        )}
                        {courseFormData.schedules.map((schedule, index) => (
                          <div key={index} className="bg-white p-6 rounded-2xl border border-slate-200 relative group transition-all hover:bg-slate-50 shadow-sm text-left">
                            <Button type="button" variant="ghost" size="icon" className="absolute -right-2 -top-2 h-7 w-7 rounded-full bg-white border shadow-md overflow-hidden text-red-500 hover:bg-red-50 z-10" onClick={() => removeSchedule(index)}>
                              <Plus className="h-4 w-4 rotate-45" />
                            </Button>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                              <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase text-slate-500">Día</Label>
                                <Select value={schedule.dayOfWeek} onValueChange={(val) => updateSchedule(index, 'dayOfWeek', val)}>
                                  <SelectTrigger className="h-10 text-xs bg-white"><SelectValue /></SelectTrigger>
                                  <SelectContent>
                                    {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map(d => (
                                      <SelectItem key={d} value={d}>{d}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase text-slate-500">Entrada</Label>
                                <Input type="time" className="h-10 text-xs" value={schedule.startTime} onChange={(e) => updateSchedule(index, 'startTime', e.target.value)} />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase text-slate-500">Salida</Label>
                                <Input type="time" className="h-10 text-xs" value={schedule.endTime} onChange={(e) => updateSchedule(index, 'endTime', e.target.value)} />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase text-slate-500">Aula</Label>
                                <Input placeholder="Ej: Aula 1" className="h-10 text-xs" value={schedule.classroom} onChange={(e) => updateSchedule(index, 'classroom', e.target.value)} />
                              </div>
                              <div className="space-y-2 col-span-2 md:col-span-1">
                                <Label className="text-xs font-bold uppercase text-slate-500">Docente</Label>
                                <Select value={schedule.teacherId} onValueChange={(val) => updateSchedule(index, 'teacherId', val)}>
                                  <SelectTrigger className="h-10 text-xs bg-white"><SelectValue placeholder="Elegir" /></SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="unassigned">Por asignar</SelectItem>
                                    {/* Mostrar solo docentes asignados a los módulos del curso */}
                                    {(() => {
                                      const courseTeachers = teachers.filter(t => courseFormData.modules.some(m => m.teacherId === t.id))
                                      return (courseTeachers.length > 0 ? courseTeachers : teachers).map((t) => (
                                        <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                                      ))
                                    })()}
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
                            <Label htmlFor="publicDescription" className="text-xs font-bold text-slate-500 uppercase text-left block">Descripción Pública</Label>
                            <Textarea id="publicDescription" className="min-h-[140px] bg-blue-50/10 border-blue-100" value={courseFormData.publicDescription} onChange={(e) => setCourseFormData({ ...courseFormData, publicDescription: e.target.value })} placeholder="Texto descriptivo para los alumnos..." />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="benefits" className="text-xs font-bold text-slate-500 uppercase text-left block">Beneficios (Uno por línea)</Label>
                            <Textarea id="benefits" className="min-h-[100px] bg-blue-50/10 border-blue-100" value={courseFormData.benefits} onChange={(e) => setCourseFormData({ ...courseFormData, benefits: e.target.value })} placeholder="Ej: Certificado oficial, Bolsa de empleo..." />
                          </div>
                        </div>
                        <div className="space-y-6">
                          <div className="space-y-2">
                            <Label htmlFor="featuresFixed" className="text-xs font-bold text-slate-500 uppercase text-left block">Características técnicas</Label>
                            <Textarea id="featuresFixed" className="min-h-[100px] bg-blue-50/10 border-blue-100" value={courseFormData.features} onChange={(e) => setCourseFormData({ ...courseFormData, features: e.target.value })} placeholder="Ej: Material PDF, Clases en directo..." />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="callUrl" className="text-xs font-bold text-slate-500 uppercase text-left block">Link Convocatoria PDF</Label>
                            <Input id="callUrl" placeholder="https://..." className="bg-blue-50/10 border-blue-100 h-11" value={courseFormData.callUrl} onChange={(e) => setCourseFormData({ ...courseFormData, callUrl: e.target.value })} />
                          </div>
                          <div className="space-y-2 bg-slate-50 p-4 rounded-xl border">
                            <div className="flex items-center space-x-3">
                              <input
                                type="checkbox"
                                id="isActive"
                                checked={courseFormData.isActive}
                                onChange={(e) => setCourseFormData({ ...courseFormData, isActive: e.target.checked })}
                                className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                              />
                              <Label htmlFor="isActive" className="text-sm font-bold text-slate-700 cursor-pointer">Activar curso en la web</Label>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-1 pl-8">Si está marcado, el curso aparecerá en la landing page pública.</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Sección 6: Área Interna */}
                    <div className="space-y-4 pt-6 border-t text-left pb-4">
                      <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                        Notas Administrativas
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="syllabusUrl" className="text-xs font-bold text-slate-500 uppercase">Link al Temario (Interno)</Label>
                          <Input id="syllabusUrl" placeholder="URL Drive/Dropbox" value={courseFormData.syllabusUrl} onChange={(e) => setCourseFormData({ ...courseFormData, syllabusUrl: e.target.value })} className="bg-slate-50 h-11" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="description" className="text-xs font-bold text-slate-500 uppercase">Comentarios Internos</Label>
                          <Textarea id="description" className="bg-slate-50" value={courseFormData.description} onChange={(e) => setCourseFormData({ ...courseFormData, description: e.target.value })} placeholder="Notas solo visibles para el personal..." />
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

        {/* Summary Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card
            className={`cursor-pointer transition-all border rounded-2xl shadow-sm ${filterStatus === 'all' ? 'ring-2 ring-blue-500 bg-blue-50/20 border-blue-200' : 'hover:border-slate-300 hover:shadow bg-white'}`}
            onClick={() => setFilterStatus('all')}
          >
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Cursos</p>
                <p className="text-2xl font-black text-slate-900 mt-0.5">{totalCount}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Todos los programas</p>
              </div>
              <div className="h-11 w-11 rounded-2xl bg-blue-100/80 flex items-center justify-center text-blue-600">
                <BookOpen className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card
            className={`cursor-pointer transition-all border rounded-2xl shadow-sm ${filterStatus === 'active' ? 'ring-2 ring-green-500 bg-green-50/20 border-green-200' : 'hover:border-slate-300 hover:shadow bg-white'}`}
            onClick={() => setFilterStatus('active')}
          >
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-green-700 uppercase tracking-wider">Activos (Vigentes)</p>
                <p className="text-2xl font-black text-green-700 mt-0.5">{activeCount}</p>
                <p className="text-[10px] text-green-600/80 mt-0.5">Visibles e inscribibles</p>
              </div>
              <div className="h-11 w-11 rounded-2xl bg-green-100 flex items-center justify-center text-green-600">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card
            className={`cursor-pointer transition-all border rounded-2xl shadow-sm ${filterStatus === 'expired' ? 'ring-2 ring-amber-500 bg-amber-50/20 border-amber-200' : 'hover:border-slate-300 hover:shadow bg-white'}`}
            onClick={() => setFilterStatus('expired')}
          >
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Vencidos / Fin</p>
                <p className="text-2xl font-black text-amber-700 mt-0.5">{expiredCount}</p>
                <p className="text-[10px] text-amber-600/80 mt-0.5">Fecha fin superada</p>
              </div>
              <div className="h-11 w-11 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600">
                <CalendarX className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card
            className={`cursor-pointer transition-all border rounded-2xl shadow-sm ${filterStatus === 'inactive' ? 'ring-2 ring-slate-500 bg-slate-50/50 border-slate-300' : 'hover:border-slate-300 hover:shadow bg-white'}`}
            onClick={() => setFilterStatus('inactive')}
          >
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Inactivos</p>
                <p className="text-2xl font-black text-slate-700 mt-0.5">{inactiveCount}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Borradores o pausados</p>
              </div>
              <div className="h-11 w-11 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500">
                <AlertCircle className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Courses Table */}
        <Card className="shadow-sm rounded-2xl border-slate-200">
          <CardHeader className="pb-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <CardTitle className="text-xl font-bold text-slate-900">Cursos Disponibles</CardTitle>
                <CardDescription className="text-xs text-slate-500 mt-0.5">
                  Visualiza, activa, desactiva y gestiona todos los programas educativos.
                </CardDescription>
              </div>
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar curso..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 w-56 h-10 bg-white"
                  />
                </div>

                <Select value={filterLevel} onValueChange={setFilterLevel}>
                  <SelectTrigger className="w-[140px] h-10 bg-white">
                    <SelectValue placeholder="Nivel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los niveles</SelectItem>
                    <SelectItem value="BEGINNER">Principiante</SelectItem>
                    <SelectItem value="INTERMEDIATE">Intermedio</SelectItem>
                    <SelectItem value="ADVANCED">Avanzado</SelectItem>
                    <SelectItem value="EXPERT">Experto</SelectItem>
                    <SelectItem value="PREPARACION_OPOSICIONES">Oposiciones</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[160px] h-10 bg-white">
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="active">Activos (Vigentes)</SelectItem>
                    <SelectItem value="expired">Vencidos / Fin</SelectItem>
                    <SelectItem value="inactive">Inactivos</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSyncExpired}
                  disabled={isSyncingExpired}
                  className="h-10 px-3 text-xs font-bold text-slate-700 bg-white border-slate-200 hover:bg-slate-50"
                  title="Comprobar y auto-desactivar cursos cuya fecha de fin ya haya pasado"
                >
                  <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isSyncingExpired ? 'animate-spin text-blue-600' : 'text-slate-500'}`} />
                  {isSyncingExpired ? 'Comprobando...' : 'Comprobar Vencidos'}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl border border-slate-200 overflow-hidden">
              <Table>
                <TableHeader className="bg-slate-50/80">
                  <TableRow>
                    <TableHead className="font-bold">Curso</TableHead>
                    <TableHead className="font-bold">Nivel</TableHead>
                    <TableHead className="font-bold">Profesor</TableHead>
                    <TableHead className="font-bold">Duración</TableHead>
                    <TableHead className="font-bold">Precio</TableHead>
                    <TableHead className="font-bold text-center">Inscritos</TableHead>
                    <TableHead className="font-bold">Estado / Visibilidad</TableHead>
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
                        No se encontraron cursos con los filtros seleccionados.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCourses.map((course) => {
                      const isExpired = isCourseExpired(course.endDate)

                      return (
                        <TableRow key={course.id} className="hover:bg-slate-50/50 transition-colors">
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-semibold text-slate-900">{course.title}</span>
                              <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                                <span className="text-[11px] text-slate-500 font-mono font-medium">{course.code}</span>
                                {course.endDate && (
                                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${isExpired ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-slate-100 text-slate-600'}`}>
                                    Fin: {new Date(course.endDate).toLocaleDateString('es-ES')}
                                  </span>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{getLevelBadge(course.level)}</TableCell>
                          <TableCell className="text-slate-600 text-xs">
                            {(() => {
                              const uniqueTeachers = Array.from(new Set((course.modules || []).map(m => m.teacher?.name).filter(Boolean)))
                              if (uniqueTeachers.length === 0) return '---'
                              if (uniqueTeachers.length === 1) return uniqueTeachers[0]
                              return `${uniqueTeachers[0]} (+${uniqueTeachers.length - 1})`
                            })()}
                          </TableCell>
                          <TableCell>
                            <span className="inline-flex items-center px-2 py-1 rounded bg-slate-100 text-slate-700 text-xs font-medium">
                              <Clock className="w-3 h-3 mr-1" />
                              {course.duration}h
                            </span>
                          </TableCell>
                          <TableCell className="font-medium text-slate-900 leading-tight">
                            <div className="flex flex-col gap-1">
                              {course.price && course.price > 0 ? (
                                <span className="text-sm font-bold">{`€${course.price.toFixed(2)}`}</span>
                              ) : (
                                <span className="text-[10px] text-slate-400 italic">Gral: Consultar</span>
                              )}
                              {course.affiliatePrice && course.affiliatePrice > 0 ? (
                                <span className="text-[10px] font-black text-green-600 bg-green-50 px-1.5 py-0.5 rounded w-fit">
                                  Afi: €{course.affiliatePrice.toFixed(2)}
                                </span>
                              ) : (
                                <span className="text-[10px] text-slate-400 italic">Afi: Consultar</span>
                              )}
                              {(course.price || course.affiliatePrice) && (
                                <span className="text-[9px] text-slate-500 font-normal uppercase tracking-tighter">
                                  {course.priceUnit === 'MONTH' ? 'p/ Mes' :
                                    course.priceUnit === 'SESSION' ? 'p/ Sesión' :
                                      course.priceUnit === 'TRIMESTER' ? 'p/ Trimestre' :
                                        course.priceUnit === 'YEAR' ? 'p/ Año' : ''}
                                  {course.paymentFrequency && ` (${getPaymentFrequencyLabel(course.paymentFrequency, true)})`}
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="font-bold text-blue-600">{course._count?.enrollments || 0}</span>
                            <span className="text-slate-400"> / {course.maxStudents}</span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2.5">
                              <div className="min-w-[85px]">
                                {isExpired ? (
                                  <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-300 shadow-none font-bold text-[10px] py-0.5">
                                    <CalendarX className="w-2.5 h-2.5 mr-1" />
                                    Vencido
                                  </Badge>
                                ) : course.isActive ? (
                                  <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100 shadow-none font-bold text-[10px] py-0.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5 animate-pulse" />
                                    Activo
                                  </Badge>
                                ) : (
                                  <Badge variant="secondary" className="bg-slate-100 text-slate-500 border-slate-200 shadow-none font-bold text-[10px] py-0.5">
                                    Inactivo
                                  </Badge>
                                )}
                              </div>

                              <div className="flex items-center" title={course.isActive ? "Desactivar curso" : (isExpired ? "Reactivar curso vencido" : "Activar curso")}>
                                {isTogglingId === course.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                                ) : (
                                  <Switch
                                    checked={course.isActive}
                                    onCheckedChange={(checked) => handleToggleActive(course, checked)}
                                    className="data-[state=checked]:bg-green-600 scale-90"
                                  />
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-blue-600" onClick={() => handleViewClick(course)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-orange-600" onClick={() => handleEditClick(course)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-slate-500 hover:text-violet-600"
                                title="Duplicar curso como plantilla"
                                onClick={() => setDuplicateDialogCourse(course)}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-slate-500 hover:text-red-500"
                                title="Enviar email grupal"
                                onClick={() => handleEmailClick(course)}
                              >
                                <Mail className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-slate-500 hover:text-green-600"
                                title="Exportar Alumnos (Excel)"
                                onClick={() => handleExportStudents(course)}
                              >
                                <FileSpreadsheet className="h-4 w-4" />
                              </Button>
                              <EnrollmentForm courseId={course.id} onSuccess={fetchCourses} />
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Dialog for Reactivating Expired Course */}
        <Dialog open={!!reactivateDialogCourse} onOpenChange={(open) => { if (!open) setReactivateDialogCourse(null) }}>
          <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden border-none shadow-2xl">
            <DialogHeader className="p-6 bg-amber-50/60 border-b border-amber-100">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700">
                  <CalendarX className="h-5 w-5" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold text-slate-900">Reactivar Curso Vencido</DialogTitle>
                  <DialogDescription className="text-slate-600 text-xs mt-0.5">
                    {reactivateDialogCourse?.title} ({reactivateDialogCourse?.code})
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="p-6 space-y-5 bg-white">
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 leading-relaxed">
                Este curso finalizó el <b>{reactivateDialogCourse?.endDate ? new Date(reactivateDialogCourse.endDate).toLocaleDateString('es-ES') : ''}</b>. Para mantenerlo activo y visible sin que vuelva a auto-desactivarse, selecciona una opción:
              </div>

              <div className="space-y-3">
                <div
                  className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${reactivateAction === 'extend' ? 'border-blue-600 bg-blue-50/40 ring-1 ring-blue-600' : 'border-slate-200 hover:bg-slate-50'}`}
                  onClick={() => setReactivateAction('extend')}
                >
                  <input
                    type="radio"
                    name="reactivateAction"
                    checked={reactivateAction === 'extend'}
                    onChange={() => setReactivateAction('extend')}
                    className="mt-1 text-blue-600"
                  />
                  <div className="flex-1 space-y-2">
                    <div>
                      <p className="text-sm font-bold text-slate-800">Ampliar Fecha de Finalización</p>
                      <p className="text-xs text-slate-500">Establece una nueva fecha límite en el futuro para este curso.</p>
                    </div>
                    {reactivateAction === 'extend' && (
                      <div className="pt-2">
                        <Label className="text-[10px] font-bold text-slate-500 uppercase">Nueva Fecha Fin</Label>
                        <Input
                          type="date"
                          value={reactivateEndDate}
                          onChange={(e) => setReactivateEndDate(e.target.value)}
                          className="mt-1 bg-white border-slate-200 h-10 text-sm font-medium"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div
                  className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${reactivateAction === 'no-limit' ? 'border-blue-600 bg-blue-50/40 ring-1 ring-blue-600' : 'border-slate-200 hover:bg-slate-50'}`}
                  onClick={() => setReactivateAction('no-limit')}
                >
                  <input
                    type="radio"
                    name="reactivateAction"
                    checked={reactivateAction === 'no-limit'}
                    onChange={() => setReactivateAction('no-limit')}
                    className="mt-1 text-blue-600"
                  />
                  <div>
                    <p className="text-sm font-bold text-slate-800">Activar Sin Fecha Límite</p>
                    <p className="text-xs text-slate-500">Elimina la fecha de fin. El curso permanecerá activo indefinidamente hasta que lo desactives de forma manual.</p>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="p-4 bg-slate-50 border-t flex items-center justify-end gap-2 shrink-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setReactivateDialogCourse(null)}
                className="h-10 text-xs font-bold"
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={handleConfirmReactivation}
                disabled={isTogglingId !== null}
                className="h-10 px-5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md"
              >
                {isTogglingId ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <Check className="h-4 w-4 mr-1.5" />}
                Reactivar Curso
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialogs */}

        {/* Dialog: Confirmar Duplicado de Curso */}
        <Dialog open={!!duplicateDialogCourse} onOpenChange={(open) => { if (!open) setDuplicateDialogCourse(null) }}>
          <DialogContent className="sm:max-w-[460px] p-0 overflow-hidden border-none shadow-2xl">
            <DialogHeader className="p-6 bg-violet-50/60 border-b border-violet-100">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-violet-100 border border-violet-200 flex items-center justify-center text-violet-700">
                  <Copy className="h-5 w-5" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold text-slate-900">Duplicar Curso</DialogTitle>
                  <DialogDescription className="text-slate-600 text-xs mt-0.5">
                    Crear una copia como borrador para usar de plantilla
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="p-6 space-y-4 bg-white">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
                <div className="flex items-start gap-2.5">
                  <BookOpen className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Curso original</p>
                    <p className="text-sm font-bold text-slate-900 leading-snug">{duplicateDialogCourse?.title}</p>
                    <p className="text-[11px] font-mono text-slate-500 mt-0.5">{duplicateDialogCourse?.code}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-violet-50/50 border border-violet-200 rounded-xl space-y-2 text-xs text-slate-700 leading-relaxed">
                <p className="font-bold text-violet-800 text-sm">¿Qué incluye la copia?</p>
                <ul className="space-y-1 text-slate-600">
                  <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-green-600 shrink-0" /> Título, descripción, nivel y módulos</li>
                  <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-green-600 shrink-0" /> Precios, duración y parámetros de pago</li>
                  <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-green-600 shrink-0" /> Descripción pública, beneficios y características</li>
                  <li className="flex items-center gap-1.5 text-slate-400"><span className="text-slate-400 font-bold text-[13px] leading-none mr-0.5">—</span> Sin fechas de inicio / fin (para configurar)</li>
                  <li className="flex items-center gap-1.5 text-slate-400"><span className="text-slate-400 font-bold text-[13px] leading-none mr-0.5">—</span> Sin alumnos ni matrículas</li>
                  <li className="flex items-center gap-1.5 text-slate-400"><span className="text-slate-400 font-bold text-[13px] leading-none mr-0.5">—</span> Se crea como <b className="text-slate-600">borrador (inactivo)</b></li>
                </ul>
              </div>

              <p className="text-xs text-slate-500 text-center">
                Al confirmar, se abrirá el formulario de edición del nuevo curso para que puedas ajustarlo antes de publicarlo.
              </p>
            </div>

            <DialogFooter className="p-4 bg-slate-50 border-t flex items-center justify-end gap-2 shrink-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDuplicateDialogCourse(null)}
                className="h-10 text-xs font-bold"
                disabled={isDuplicating}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={handleDuplicateCourse}
                disabled={isDuplicating}
                className="h-10 px-5 bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs shadow-md"
              >
                {isDuplicating
                  ? <><Loader2 className="h-4 w-4 animate-spin mr-1.5" />Duplicando...</>
                  : <><Copy className="h-4 w-4 mr-1.5" />Crear Copia</>
                }
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>

          <DialogContent className="sm:max-w-[700px] border-none shadow-2xl overflow-hidden p-0 max-h-[95vh] flex flex-col">
            {selectedCourse && (
              <>
                <div id="course-details-print" className="bg-white flex-1 overflow-y-auto custom-scrollbar">
                  <div className="bg-blue-600 h-2 w-full no-print" />
                  <div className="p-6 md:p-8 pb-16">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex-1">
                        <h2 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight tracking-tight uppercase">
                          {selectedCourse.title}
                        </h2>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="bg-slate-100 text-slate-600 font-mono text-xs px-2 py-0.5 rounded border border-slate-200 uppercase font-bold">
                            {selectedCourse.code}
                          </span>
                          <Badge className={selectedCourse.isActive ? 'bg-green-500/10 text-green-700 border-green-200 shadow-none' : 'bg-slate-100 text-slate-500 border-slate-200 shadow-none'}>
                            {selectedCourse.isActive ? 'Visible en Web' : 'Borrador'}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Nivel</p>
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-blue-600" />
                          <span className="text-xs font-bold text-slate-700">{selectedCourse.level}</span>
                        </div>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Duración</p>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-blue-600" />
                          <span className="text-xs font-bold text-slate-700">{selectedCourse.duration}h</span>
                        </div>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Precio Gral.</p>
                        <div className="flex items-center gap-2">
                          <Euro className="h-4 w-4 text-slate-600" />
                          <span className="text-xs font-bold text-slate-700">
                            {selectedCourse.price && selectedCourse.price > 0 ? `€${selectedCourse.price.toFixed(2)}` : 'Consultar'}
                            {selectedCourse.priceUnit && selectedCourse.price && selectedCourse.price > 0 && (
                              <span className="text-[10px] text-slate-500 ml-1">
                                {selectedCourse.priceUnit === 'FULL' ? '' :
                                  selectedCourse.priceUnit === 'SESSION' ? '/ Sesión' :
                                    selectedCourse.priceUnit === 'MONTH' ? '/ Mes' :
                                      selectedCourse.priceUnit === 'TRIMESTER' ? '/ Trimestre' :
                                        selectedCourse.priceUnit === 'YEAR' ? '/ Año' : ''}
                                {selectedCourse.paymentFrequency && ` (${getPaymentFrequencyLabel(selectedCourse.paymentFrequency)})`}
                              </span>
                            )}
                          </span>
                        </div>
                      </div>
                      <div className="p-4 bg-green-50 rounded-2xl border border-green-100">
                        <p className="text-[10px] font-black text-green-600 uppercase mb-1">Afiliados</p>
                        <div className="flex items-center gap-2">
                          <Euro className="h-4 w-4 text-green-700" />
                          <span className="text-xs font-bold text-green-700">
                            {selectedCourse.affiliatePrice && selectedCourse.affiliatePrice > 0 ? `€${selectedCourse.affiliatePrice.toFixed(2)}` : 'Consultar'}
                            {selectedCourse.priceUnit && selectedCourse.affiliatePrice && selectedCourse.affiliatePrice > 0 && (
                              <span className="text-[10px] text-green-600/70 ml-1">
                                {selectedCourse.priceUnit === 'FULL' ? '' :
                                  selectedCourse.priceUnit === 'SESSION' ? '/ Sesión' :
                                    selectedCourse.priceUnit === 'MONTH' ? '/ Mes' :
                                      selectedCourse.priceUnit === 'TRIMESTER' ? '/ Trimestre' :
                                        selectedCourse.priceUnit === 'YEAR' ? '/ Año' : ''}
                                {selectedCourse.paymentFrequency && ` (${getPaymentFrequencyLabel(selectedCourse.paymentFrequency)})`}
                              </span>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      {selectedCourse.startDate && (
                        <div className="flex items-start gap-3">
                          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                            <Calendar className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase">Calendario</p>
                            <p className="text-sm font-bold text-slate-800">Inicio: {new Date(selectedCourse.startDate).toLocaleDateString()}</p>
                            {selectedCourse.durationPeriod && <p className="text-[10px] text-slate-500 italic">{selectedCourse.durationPeriod}</p>}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 flex flex-col gap-1">
                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest pl-1">Equipo Docente</p>
                        <p className="text-sm font-bold text-blue-900">
                          {(() => {
                            const uniqueTeachers = Array.from(new Set((selectedCourse.modules || []).map(m => m.teacher?.name).filter(Boolean)))
                            if (uniqueTeachers.length === 0) return 'Por asignar'
                            return uniqueTeachers.join(', ')
                          })()}
                        </p>
                      </div>
                      <div className="space-y-3">
                        {selectedCourse.syllabusUrl && (
                          <a href={selectedCourse.syllabusUrl} target="_blank" className="flex items-center justify-between p-3 bg-amber-50 rounded-xl border border-amber-200 group transition-all no-print">
                            <div className="flex items-center gap-3">
                              <ExternalLink className="h-4 w-4 text-amber-600" />
                              <span className="text-xs font-bold text-amber-800 uppercase tracking-tighter">Material Didáctico</span>
                            </div>
                            <div className="text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded font-black italic">DRIVE</div>
                          </a>
                        )}
                        <div className="p-3 bg-slate-100/50 rounded-xl border border-slate-200">
                          <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Inscripción actual</p>
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-bold text-slate-700">{selectedCourse._count?.enrollments || 0} / {selectedCourse.maxStudents}</span>
                            <div className="h-1.5 w-24 bg-slate-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-600"
                                style={{ width: `${Math.min(((selectedCourse._count?.enrollments || 0) / selectedCourse.maxStudents) * 100, 100)}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Temario Compacto */}
                      {selectedCourse.modules && selectedCourse.modules.length > 0 && (
                        <div className="mb-6">
                          <h3 className="text-[10px] font-black text-slate-400 uppercase mb-3 tracking-widest pl-1">Bloques de contenido</h3>
                          <div className="space-y-2">
                            {selectedCourse.modules.map((module, idx) => (
                              <div key={idx} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
                                <span className="text-xs font-black text-blue-600 bg-blue-50 w-6 h-6 flex items-center justify-center rounded-lg border border-blue-100">{idx + 1}</span>
                                <div className="flex-1">
                                  <p className="text-xs font-bold text-slate-800 uppercase">{module.title}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Alumnos Inscritos */}
                      {selectedCourse.enrollments && selectedCourse.enrollments.length > 0 && (
                        <div className="mb-6">
                          <h3 className="text-[10px] font-black text-slate-400 uppercase mb-3 tracking-widest pl-1 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <Users className="h-3 w-3" /> Listado de Alumnos ({selectedCourse.enrollments.length})
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 text-[9px] font-bold uppercase text-green-600 hover:text-green-700 hover:bg-green-50 px-2"
                              onClick={() => handleExportStudents(selectedCourse)}
                            >
                              <FileSpreadsheet className="h-3 w-3 mr-1" />
                              Exportar Excel
                            </Button>
                          </h3>
                          <div className="rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                            <Table>
                              <TableHeader className="bg-slate-50">
                                <TableRow className="h-8">
                                  <TableHead className="text-[9px] font-black uppercase text-slate-500 py-0">Alumno</TableHead>
                                  <TableHead className="text-[9px] font-black uppercase text-slate-500 py-0">DNI</TableHead>
                                  <TableHead className="text-[9px] font-black uppercase text-slate-500 py-0">Tipo</TableHead>
                                  <TableHead className="text-[9px] font-black uppercase text-slate-500 py-0">Estado</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {selectedCourse.enrollments.map((enr) => (
                                  <TableRow key={enr.id} className="h-10 hover:bg-slate-50/50">
                                    <TableCell className="py-2">
                                      <div className="flex flex-col">
                                        <span className="text-[11px] font-bold text-slate-700">{enr.student.name}</span>
                                        <span className="text-[9px] text-slate-400">{enr.student.phone || '--'}</span>
                                      </div>
                                    </TableCell>
                                    <TableCell className="py-2 text-[10px] font-mono text-slate-600">{enr.student.dni || '--'}</TableCell>
                                    <TableCell className="py-2">
                                      <Badge variant="outline" className={`text-[8px] font-black h-4 px-1 ${enr.student.isAffiliated ? 'border-green-200 text-green-700 bg-green-50' : 'border-slate-200 text-slate-500 bg-slate-50'}`}>
                                        {enr.student.isAffiliated ? 'AFILIADO' : 'GENERAL'}
                                      </Badge>
                                    </TableCell>
                                    <TableCell className="py-2">
                                      <div className="flex items-center gap-2">
                                        <span className={`text-[9px] font-bold ${enr.status === 'PENDING' ? 'text-amber-600' : 'text-blue-600'}`}>
                                          {enr.status === 'PENDING' ? 'PAG. PEND.' : 'INSCRITO'}
                                        </span>
                                        {enr.status === 'ENROLLED' && (
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 text-slate-400 hover:text-amber-600"
                                            title="Revertir a Pendiente"
                                            onClick={async (e) => {
                                              e.stopPropagation();
                                              if (confirm('¿Revertir estado a Pago Pendiente?')) {
                                                const res = await fetch(`/api/enrollments/${enr.id}`, {
                                                  method: 'PATCH',
                                                  headers: { 'Content-Type': 'application/json' },
                                                  body: JSON.stringify({ status: 'PENDING' })
                                                })
                                                if (res.ok) {
                                                  toast.success("Estado revertido")
                                                  handleViewClick(selectedCourse) // Refresh full data
                                                }
                                              }
                                            }}
                                          >
                                            <Clock className="h-3 w-3" />
                                          </Button>
                                        )}
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </div>
                      )}

                      <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 mb-6">
                        <p className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest text-center">Resumen del programa</p>
                        <p className="text-xs text-slate-600 leading-relaxed italic text-center">
                          "{selectedCourse.description || 'Consulta los detalles específicos con el departamento de formación.'}"
                        </p>
                      </div>

                      <div className="flex flex-col md:flex-row items-center justify-between gap-6 opacity-80 pt-4 border-t border-dashed">
                        <div className="flex items-center gap-4">
                          <QRCodeSVG
                            value={typeof window !== 'undefined' ? `${window.location.origin}/p/${selectedCourse.id}` : ''}
                            size={64}
                            className="bg-white p-1 rounded-lg border shadow-sm"
                          />
                          <div className="text-left">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Enlace Público</p>
                            <a
                              href={`${typeof window !== 'undefined' ? window.location.origin : ''}/p/${selectedCourse.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] font-bold text-blue-600 hover:underline block mb-1"
                            >
                              {`${typeof window !== 'undefined' ? window.location.origin : ''}/p/${selectedCourse.id}`}
                            </a>
                            <p className="text-[9px] text-slate-500 italic">Disponible para inscripción online</p>
                          </div>
                        </div>
                        <div className="text-right hidden md:block">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Información Oficial</p>
                          <p className="text-[10px] font-bold text-slate-800">UGT Servicios Públicos Salamanca</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-slate-50 px-8 py-5 flex items-center justify-end gap-3 no-print border-t shrink-0">
                    <Button variant="outline" className="h-11 rounded-xl font-bold uppercase text-[10px] tracking-widest border-slate-300" onClick={handlePrint}>
                      <Printer className="mr-2 h-4 w-4" /> Imprimir / PDF
                    </Button>
                    <Button variant="outline" className="h-11 rounded-xl font-bold uppercase text-[10px] tracking-widest border-slate-300" onClick={() => handleExportPDF(selectedCourse)}>
                      <Download className="mr-2 h-4 w-4" /> Descargar Imagen PDF
                    </Button>
                    <Button className="h-11 bg-slate-900 hover:bg-black rounded-xl font-bold uppercase text-[10px] tracking-widest px-8" onClick={() => setIsViewDialogOpen(false)}>
                      Cerrar
                    </Button>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[850px] h-[90vh] flex flex-col p-0 border-none shadow-2xl overflow-hidden">
            <form onSubmit={handleUpdateCourse} className="flex flex-col h-full overflow-hidden">
              <DialogHeader className="p-6 bg-slate-50 border-b shrink-0">
                <div className="flex justify-between items-start">
                  <div>
                    <DialogTitle className="text-2xl font-bold text-slate-900">Editar Curso</DialogTitle>
                    <DialogDescription>Actualiza los detalles del programa de forma organizada.</DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar bg-white">
                {/* Sección 1: Datos de Identificación */}
                <div className="space-y-4 text-left">
                  <h3 className="text-sm font-black text-blue-600 uppercase tracking-[0.2em] flex items-center gap-2">
                    <BookOpen className="h-4 w-4" /> Datos de Identificación
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="edit-title" className="text-xs font-bold text-slate-500 uppercase">Título del Curso</Label>
                      <Input
                        id="edit-title"
                        value={courseFormData.title}
                        onChange={(e) => setCourseFormData({ ...courseFormData, title: e.target.value })}
                        required
                        className="bg-white border-slate-200 h-11 focus:border-blue-500 transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-code" className="text-xs font-bold text-slate-500 uppercase">Código / Expediente</Label>
                      <Input
                        id="edit-code"
                        value={courseFormData.code}
                        onChange={(e) => setCourseFormData({ ...courseFormData, code: e.target.value })}
                        required
                        placeholder="Ej: EXP-2024-01"
                        className="bg-white border-slate-200 h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-level" className="text-xs font-bold text-slate-500 uppercase">Categoría Académica</Label>
                      <Select
                        value={courseFormData.level}
                        onValueChange={(value) => setCourseFormData({ ...courseFormData, level: value as any })}
                      >
                        <SelectTrigger className="bg-white border-slate-200 h-11">
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
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="edit-duration" className="text-xs font-bold text-slate-500 uppercase">Total Horas</Label>
                      <Input id="edit-duration" type="number" value={courseFormData.duration} onChange={(e) => setCourseFormData({ ...courseFormData, duration: e.target.value })} className="bg-white border-slate-200 h-11" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-durationSessions" className="text-xs font-bold text-slate-500 uppercase">Nº Sesiones</Label>
                      <Input id="edit-durationSessions" type="number" value={courseFormData.durationSessions} onChange={(e) => setCourseFormData({ ...courseFormData, durationSessions: e.target.value })} className="bg-white border-slate-200 h-11" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-sessionDuration" className="text-xs font-bold text-slate-500 uppercase">Horas p/ Sesión</Label>
                      <Input id="edit-sessionDuration" type="number" step="0.5" value={courseFormData.sessionDuration} onChange={(e) => setCourseFormData({ ...courseFormData, sessionDuration: e.target.value })} className="bg-white border-slate-200 h-11" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-durationMonths" className="text-xs font-bold text-slate-500 uppercase">Meses</Label>
                      <Input id="edit-durationMonths" type="number" value={courseFormData.durationMonths} onChange={(e) => setCourseFormData({ ...courseFormData, durationMonths: e.target.value })} className="bg-white border-slate-200 h-11" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-durationPeriod" className="text-xs font-bold text-slate-500 uppercase">Periodo</Label>
                      <Input id="edit-durationPeriod" placeholder="Ej: Oct-Dic" value={courseFormData.durationPeriod} onChange={(e) => setCourseFormData({ ...courseFormData, durationPeriod: e.target.value })} className="bg-white border-slate-200 h-11" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-startDate" className="text-xs font-bold text-slate-500 uppercase">Fecha Inicio</Label>
                      <Input id="edit-startDate" type="date" value={courseFormData.startDate} onChange={(e) => setCourseFormData({ ...courseFormData, startDate: e.target.value })} className="bg-white border-slate-200 h-11" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-endDate" className="text-xs font-bold text-slate-500 uppercase">Fecha Fin</Label>
                      <Input id="edit-endDate" type="date" value={courseFormData.endDate} onChange={(e) => setCourseFormData({ ...courseFormData, endDate: e.target.value })} className="bg-white border-slate-200 h-11" />
                    </div>
                  </div>
                </div>

                {/* Sección 3: Económico y Personal */}
                <div className="space-y-4 pt-6 border-t text-left">
                  <h3 className="text-sm font-black text-blue-600 uppercase tracking-[0.2em] flex items-center gap-2">
                    <Euro className="h-4 w-4" /> Costes y Responsable
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="edit-price" className="text-xs font-bold text-slate-500 uppercase">Precio General (€)</Label>
                      <div className="flex gap-2">
                        <Input id="edit-price" type="number" step="0.01" value={courseFormData.price} onChange={(e) => setCourseFormData({ ...courseFormData, price: e.target.value })} className="bg-white border-slate-200 h-11 font-bold flex-1" />
                        <Select value={courseFormData.priceUnit} onValueChange={(value) => setCourseFormData({ ...courseFormData, priceUnit: value })}>
                          <SelectTrigger className="w-[110px] bg-slate-50 border-slate-200 h-11">
                            <SelectValue placeholder="Unidad" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="FULL">Total</SelectItem>
                            <SelectItem value="SESSION">Sesión</SelectItem>
                            <SelectItem value="MONTH">Mes</SelectItem>
                            <SelectItem value="TRIMESTER">Trimestre</SelectItem>
                            <SelectItem value="YEAR">Año</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select value={courseFormData.paymentFrequency} onValueChange={(value) => setCourseFormData({ ...courseFormData, paymentFrequency: value })}>
                          <SelectTrigger className="w-[130px] bg-slate-50 border-slate-200 h-11">
                            <SelectValue placeholder="Forma / Plazos" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="SINGLE">Pago Único</SelectItem>
                            <SelectItem value="2_PAYMENTS">2 Pagos</SelectItem>
                            <SelectItem value="3_PAYMENTS">3 Pagos</SelectItem>
                            <SelectItem value="4_PAYMENTS">4 Pagos</SelectItem>
                            <SelectItem value="5_PAYMENTS">5 Pagos</SelectItem>
                            <SelectItem value="6_PAYMENTS">6 Pagos</SelectItem>
                            <SelectItem value="MONTHLY">Mensual</SelectItem>
                            <SelectItem value="BIMONTHLY">Bimestral</SelectItem>
                            <SelectItem value="TRIMESTER">Trimestral</SelectItem>
                            <SelectItem value="SEMESTER">Semestral</SelectItem>
                            <SelectItem value="ANNUAL">Anual</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-affiliatePrice" className="text-xs font-bold text-green-600 uppercase">Precio Afiliado (€)</Label>
                      <Input id="edit-affiliatePrice" type="number" step="0.01" value={courseFormData.affiliatePrice} onChange={(e) => setCourseFormData({ ...courseFormData, affiliatePrice: e.target.value })} className="bg-green-50/30 border-green-100 h-11 font-bold text-green-700" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-maxStudents" className="text-xs font-bold text-slate-500 uppercase">Cupo Máximo</Label>
                      <Input id="edit-maxStudents" type="number" value={courseFormData.maxStudents} onChange={(e) => setCourseFormData({ ...courseFormData, maxStudents: e.target.value })} className="bg-white border-slate-200 h-11" />
                    </div>
                    <div className="space-y-2">
                    </div>
                  </div>
                </div>

                {/* Sección 4: Desglose del Temario */}
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase text-slate-500 text-left block">Título</Label>
                            <Input placeholder="Título del apartado..." className="h-10 text-sm font-bold bg-white" value={module.title} onChange={(e) => updateModule(index, 'title', e.target.value)} />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase text-slate-500 text-left block">Profesor Asignado</Label>
                            <Select value={module.teacherId} onValueChange={(val) => updateModule(index, 'teacherId', val)}>
                              <SelectTrigger className="h-10 text-xs bg-white"><SelectValue placeholder="Elegir docente" /></SelectTrigger>
                              <SelectContent>
                                {teachers.map((t) => (<SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="col-span-1 md:col-span-2 space-y-2">
                            <Label className="text-xs font-bold uppercase text-slate-500 text-left block">Resumen del contenido</Label>
                            <Input placeholder="Descripción breve..." className="h-10 text-sm bg-white" value={module.description} onChange={(e) => updateModule(index, 'description', e.target.value)} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sección 5: Configuración de Horarios */}
                <div className="space-y-4 pt-6 border-t text-left">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black text-blue-600 uppercase tracking-[0.2em] flex items-center gap-2">
                      <Calendar className="h-4 w-4" /> Configuración de Horarios
                    </h3>
                    <Button type="button" variant="outline" size="sm" onClick={addSchedule} className="h-8 bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100">
                      <Plus className="h-3 w-3 mr-1" /> Añadir Horario
                    </Button>
                  </div>
                  <div className="grid gap-4">
                    {courseFormData.schedules.length === 0 && (
                      <div className="text-center py-6 border-2 border-dashed rounded-2xl border-slate-100 text-slate-400 text-xs font-bold italic">
                        No hay horarios definidos. Pulsa "Añadir Horario" para empezar.
                      </div>
                    )}
                    {courseFormData.schedules.map((schedule, index) => (
                      <div key={index} className="bg-white p-6 rounded-2xl border border-slate-200 relative group transition-all hover:bg-slate-50 shadow-sm text-left">
                        <Button type="button" variant="ghost" size="icon" className="absolute -right-2 -top-2 h-7 w-7 rounded-full bg-white border shadow-md overflow-hidden text-red-500 hover:bg-red-50 z-10" onClick={() => removeSchedule(index)}>
                          <Plus className="h-4 w-4 rotate-45" />
                        </Button>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                          <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase text-slate-500">Día</Label>
                            <Select value={schedule.dayOfWeek} onValueChange={(val) => updateSchedule(index, 'dayOfWeek', val)}>
                              <SelectTrigger className="h-10 text-xs bg-white"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map(d => (
                                  <SelectItem key={d} value={d}>{d}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase text-slate-500">Entrada</Label>
                            <Input type="time" className="h-10 text-xs" value={schedule.startTime} onChange={(e) => updateSchedule(index, 'startTime', e.target.value)} />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase text-slate-500">Salida</Label>
                            <Input type="time" className="h-10 text-xs" value={schedule.endTime} onChange={(e) => updateSchedule(index, 'endTime', e.target.value)} />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase text-slate-500">Aula</Label>
                            <Input placeholder="Ej: Aula 1" className="h-10 text-xs" value={schedule.classroom} onChange={(e) => updateSchedule(index, 'classroom', e.target.value)} />
                          </div>
                          <div className="space-y-2 col-span-2 md:col-span-1">
                            <Label className="text-xs font-bold uppercase text-slate-500">Docente</Label>
                            <Select value={schedule.teacherId} onValueChange={(val) => updateSchedule(index, 'teacherId', val)}>
                              <SelectTrigger className="h-10 text-xs bg-white"><SelectValue placeholder="Elegir" /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="unassigned">Por asignar</SelectItem>
                                {/* Mostrar solo docentes asignados a los módulos del curso */}
                                {(() => {
                                  const courseTeachers = teachers.filter(t => courseFormData.modules.some(m => m.teacherId === t.id))
                                  return (courseTeachers.length > 0 ? courseTeachers : teachers).map((t) => (
                                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                                  ))
                                })()}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sección 6: Presencia Online */}
                <div className="space-y-4 pt-6 border-t text-left">
                  <h3 className="text-sm font-black text-blue-600 uppercase tracking-[0.2em] flex items-center gap-2">
                    <ExternalLink className="h-4 w-4" /> Marketing y Landing Page
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="edit-publicDescription" className="text-xs font-bold text-slate-500 uppercase text-left block">Resumen Comercial (Web)</Label>
                        <Textarea id="edit-publicDescription" className="min-h-[140px] bg-blue-50/10 border-blue-100 focus:border-blue-500" value={courseFormData.publicDescription} onChange={(e) => setCourseFormData({ ...courseFormData, publicDescription: e.target.value })} placeholder="Escribe aquí la descripción..." />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-benefits" className="text-xs font-bold text-slate-500 uppercase text-left block">Puntos Clave / Beneficios</Label>
                        <Textarea id="edit-benefits" className="min-h-[100px] bg-blue-50/10 border-blue-100" value={courseFormData.benefits} onChange={(e) => setCourseFormData({ ...courseFormData, benefits: e.target.value })} placeholder="Ej: Bolsa de empleo, Tutorías..." />
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="edit-features" className="text-xs font-bold text-slate-500 uppercase text-left block">Características técnicas</Label>
                        <Textarea id="edit-features" className="min-h-[100px] bg-blue-50/10 border-blue-100" value={courseFormData.features} onChange={(e) => setCourseFormData({ ...courseFormData, features: e.target.value })} placeholder="Ej: Material incluido..." />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-callUrl" className="text-xs font-bold text-slate-500 uppercase text-left block">Link Convocatoria / Info</Label>
                        <Input id="edit-callUrl" placeholder="https://..." className="bg-blue-50/10 border-blue-100 h-11" value={courseFormData.callUrl} onChange={(e) => setCourseFormData({ ...courseFormData, callUrl: e.target.value })} />
                      </div>
                      <div className="space-y-2 bg-slate-50 p-4 rounded-xl border">
                        <div className="flex items-center gap-3">
                          <input type="checkbox" id="edit-isActive" checked={courseFormData.isActive} onChange={(e) => setCourseFormData({ ...courseFormData, isActive: e.target.checked })} className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                          <Label htmlFor="edit-isActive" className="text-sm font-bold text-slate-700 cursor-pointer uppercase">Curso Visible en Web</Label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sección 7: Área Privada */}
                <div className="space-y-4 pt-6 border-t text-left pb-4">
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] text-left">Gestión administrativa</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <Label htmlFor="edit-syllabusUrl" className="text-xs font-bold text-slate-500 uppercase text-left block">Material didáctico (Drive)</Label>
                      <Input id="edit-syllabusUrl" placeholder="Link interno" value={courseFormData.syllabusUrl} onChange={(e) => setCourseFormData({ ...courseFormData, syllabusUrl: e.target.value })} className="bg-slate-50 h-11" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-description" className="text-xs font-bold text-slate-500 uppercase text-left block">Notas Internas</Label>
                      <Textarea id="edit-description" className="bg-slate-50" value={courseFormData.description} onChange={(e) => setCourseFormData({ ...courseFormData, description: e.target.value })} placeholder="Solo administrativo..." />
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

        {selectedCourse && (
          <GroupEmailDialog
            courseId={selectedCourse.id}
            courseTitle={selectedCourse.title}
            isOpen={isEmailDialogOpen}
            onOpenChange={setIsEmailDialogOpen}
          />
        )}
      </div>
    </MainLayout >
  )
}