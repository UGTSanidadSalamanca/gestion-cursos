"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MainLayout } from "@/components/layout/main-layout"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { EnrollmentForm } from "@/components/enrollment/enrollment-form"
import { CertificateGenerator } from "@/components/certificates/certificate-generator"
import { BatchEmailDialog } from "@/components/enrollment/batch-email-dialog"
import { generatePaymentConfirmationPdf } from "@/lib/payment-pdf"
import {
  Users,
  BookOpen,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  TrendingUp,
  FileText,
  Plus,
  Award,
  Eye,
  Mail,
  Search,
  Filter,
  CheckSquare
} from "lucide-react"

interface Enrollment {
  id: string
  studentName: string
  courseName: string
  enrollmentDate: string
  status: 'PENDING' | 'ENROLLED' | 'IN_PROGRESS' | 'COMPLETED' | 'DROPPED' | 'FAILED' | 'CANCELLED'
  progress: number
  grade?: number
  certificate?: string
  discountPercentage?: number
  discountReason?: string
  student: { name: string; dni?: string; email?: string; phone?: string; isAffiliated?: boolean }
  course: {
    title: string
    duration: number
    teacher?: { name: string }
    code?: string
    level?: string
    price?: number
  }
  updatedAt: string
}

export default function EnrollmentsPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selectedEnrollment, setSelectedEnrollment] = useState<Enrollment | null>(null)
  const [paymentPdfDialog, setPaymentPdfDialog] = useState<{ open: boolean; enrollment: Enrollment | null; amount: string; totalAmount: string }>({
    open: false, enrollment: null, amount: '', totalAmount: ''
  })
  const [selectedEnrollmentIds, setSelectedEnrollmentIds] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [isBatchEmailOpen, setIsBatchEmailOpen] = useState(false)

  // Filtrado de matrículas
  const filteredEnrollments = enrollments.filter(e => {
    const matchesStatus = statusFilter === 'ALL' || e.status === statusFilter
    const term = searchTerm.toLowerCase().trim()
    if (!term) return matchesStatus

    const matchesSearch =
      (e.studentName && e.studentName.toLowerCase().includes(term)) ||
      (e.courseName && e.courseName.toLowerCase().includes(term)) ||
      (e.student?.dni && e.student.dni.toLowerCase().includes(term)) ||
      (e.student?.email && e.student.email.toLowerCase().includes(term)) ||
      (e.course?.code && e.course.code.toLowerCase().includes(term))

    return matchesStatus && matchesSearch
  })

  // Matrículas seleccionadas completas
  const selectedEnrollmentsList = enrollments.filter(e => selectedEnrollmentIds.includes(e.id))

  // Cantidad de destinatarios con correo único entre los seleccionados
  const selectedStudentEmailsCount = new Set(
    selectedEnrollmentsList
      .map(e => e.student?.email?.trim().toLowerCase())
      .filter((email): email is string => !!email && email.includes('@'))
  ).size

  const handleToggleSelectAll = () => {
    const currentFilteredIds = filteredEnrollments.map(e => e.id)
    const allFilteredSelected = currentFilteredIds.length > 0 && currentFilteredIds.every(id => selectedEnrollmentIds.includes(id))

    if (allFilteredSelected) {
      setSelectedEnrollmentIds(prev => prev.filter(id => !currentFilteredIds.includes(id)))
    } else {
      setSelectedEnrollmentIds(prev => Array.from(new Set([...prev, ...currentFilteredIds])))
    }
  }

  const handleToggleSelect = (id: string, checked: boolean) => {
    setSelectedEnrollmentIds(prev =>
      checked ? [...prev, id] : prev.filter(item => item !== id)
    )
  }

  useEffect(() => {
    fetchEnrollments()
  }, [])

  const fetchEnrollments = async () => {
    try {
      const response = await fetch('/api/enrollments')
      if (response.ok) {
        const data = await response.json()
        // Transformar datos si es necesario para compatibilidad con la interfaz
        const formattedData = data.map((e: any) => ({
          ...e,
          studentName: e.student.name,
          courseName: e.course.title
        }))
        setEnrollments(formattedData)
      }
    } catch (error) {
      console.error('Error fetching enrollments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenPaymentPdfDialog = (enrollment: Enrollment) => {
    const basePrice = enrollment.course.price || 0;
    const discount = enrollment.discountPercentage || 0;
    const amountPaid = basePrice > 0 ? Math.round(basePrice * (1 - discount / 100) * 100) / 100 : 0;
    setPaymentPdfDialog({
      open: true,
      enrollment,
      amount: amountPaid > 0 ? String(amountPaid) : '',
      totalAmount: basePrice > 0 ? String(basePrice) : ''
    });
  }

  const handleConfirmPaymentPdf = () => {
    const { enrollment, amount, totalAmount } = paymentPdfDialog;
    if (!enrollment) return;
    const amountPaid = parseFloat(amount) || 0;
    const total = parseFloat(totalAmount) || amountPaid;
    const discount = enrollment.discountPercentage || 0;

    const data = {
      studentName: enrollment.studentName,
      dni: enrollment.student.dni || '',
      email: enrollment.student.email || '',
      phone: enrollment.student.phone || '',
      isAffiliated: !!enrollment.student.isAffiliated,
      courseTitle: enrollment.courseName,
      courseCode: enrollment.course.code || '',
      courseLevel: enrollment.course.level,
      totalAmount: total,
      amountPaid: amountPaid,
      discountApplied: discount > 0 ? `${discount}% (${enrollment.discountReason || 'Beca / Descuento'})` : undefined,
      enrollmentDate: enrollment.enrollmentDate,
      confirmationDate: enrollment.updatedAt,
      referenceId: enrollment.id.slice(0, 8).toUpperCase()
    };

    const doc = generatePaymentConfirmationPdf(data);
    doc.save(`Confirmacion-Pago-${enrollment.studentName.replace(/\s+/g, '-')}-${enrollment.course.code || 'Curso'}.pdf`);
    setPaymentPdfDialog({ open: false, enrollment: null, amount: '', totalAmount: '' });
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-600 bg-yellow-50">Pago Pendiente</Badge>
      case 'ENROLLED':
        return <Badge className="bg-blue-500">Inscrito</Badge>
      case 'IN_PROGRESS':
        return <Badge className="bg-yellow-500">En Progreso</Badge>
      case 'COMPLETED':
        return <Badge className="bg-green-500">Completado</Badge>
      case 'DROPPED':
        return <Badge className="bg-red-500">Abandonado</Badge>
      case 'FAILED':
        return <Badge className="bg-red-600">Reprobado</Badge>
      case 'CANCELLED':
        return <Badge variant="secondary" className="bg-slate-200 text-slate-600">Cancelado</Badge>
      default:
        return <Badge variant="outline">Desconocido</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-4 w-4 text-yellow-500 animate-pulse" />
      case 'ENROLLED':
        return <FileText className="h-4 w-4 text-blue-500" />
      case 'IN_PROGRESS':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'DROPPED':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'FAILED':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'CANCELLED':
        return <XCircle className="h-4 w-4 text-slate-400" />
      default:
        return <FileText className="h-4 w-4 text-gray-500" />
    }
  }

  const stats = {
    total: enrollments.length,
    pending: enrollments.filter(e => e.status === 'PENDING').length,
    enrolled: enrollments.filter(e => e.status === 'ENROLLED').length,
    inProgress: enrollments.filter(e => e.status === 'IN_PROGRESS').length,
    completed: enrollments.filter(e => e.status === 'COMPLETED').length
  }

  return (
    <>
    <MainLayout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gestión de Matrículas</h1>
            <p className="text-muted-foreground mt-2">
              Administración de inscripciones y seguimiento de estudiantes
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Matrícula
            </Button>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Matrículas</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                Matrículas registradas
              </p>
            </CardContent>
          </Card>
          <Card className="border-yellow-200 bg-yellow-50/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-yellow-800">Pagos Pendientes</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-700">{stats.pending}</div>
              <p className="text-xs text-yellow-600/70">
                Inscripciones web esperando pago
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inscritos</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.enrolled}</div>
              <p className="text-xs text-muted-foreground">
                Recién inscritos
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En Progreso</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.inProgress}</div>
              <p className="text-xs text-muted-foreground">
                En curso actualmente
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completados</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completed}</div>
              <p className="text-xs text-muted-foreground">
                Con certificado disponible
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Formulario de Nueva Matrícula */}
        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>Nueva Matrícula</CardTitle>
              <CardDescription>
                Registre un nuevo estudiante en un curso
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EnrollmentForm
                onSuccess={() => {
                  setShowForm(false)
                  fetchEnrollments()
                }}
                onCancel={() => setShowForm(false)}
              />
            </CardContent>
          </Card>
        )}

        {/* Detalles de Matrícula Seleccionada */}
        {selectedEnrollment && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Detalles de Matrícula
                  </CardTitle>
                  <CardDescription>
                    {selectedEnrollment.studentName} - {selectedEnrollment.courseName}
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setSelectedEnrollment(null)}
                >
                  Cerrar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Información básica */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Estudiante</Label>
                    <p className="font-medium">{selectedEnrollment.studentName}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Curso</Label>
                    <p className="font-medium">{selectedEnrollment.courseName}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Estado</Label>
                    {getStatusBadge(selectedEnrollment.status)}
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Progreso</Label>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-slate-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${selectedEnrollment.status === 'COMPLETED' ? 'bg-green-500' :
                            selectedEnrollment.status === 'IN_PROGRESS' || selectedEnrollment.status === 'ENROLLED' ? 'bg-blue-500' :
                              selectedEnrollment.status === 'PENDING' ? 'bg-yellow-400' :
                                selectedEnrollment.status === 'CANCELLED' ? 'bg-slate-300' : 'bg-red-500'
                            }`}
                          style={{ width: `${selectedEnrollment.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-sm">{selectedEnrollment.progress}%</span>
                    </div>
                  </div>
                  {selectedEnrollment.grade && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Calificación</Label>
                      <p className="font-medium">{selectedEnrollment.grade}/10</p>
                    </div>
                  )}
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Fecha de Matrícula</Label>
                    <p className="font-medium">{new Date(selectedEnrollment.enrollmentDate).toLocaleDateString()}</p>
                  </div>
                  {selectedEnrollment.discountPercentage && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Descuento Aplicado</Label>
                      <p className="font-medium text-emerald-600">
                        {selectedEnrollment.discountPercentage}% ({selectedEnrollment.discountReason || 'Sin especificar'})
                      </p>
                    </div>
                  )}
                </div>

                {/* Descuentos aplicados */}
                <div className="p-4 bg-emerald-50/30 rounded-2xl border border-emerald-100/80 space-y-4">
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-emerald-600" />
                    <Label className="text-[10px] font-black uppercase text-emerald-800 tracking-wider">Descuento Aplicado</Label>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-slate-600">Porcentaje de Descuento</Label>
                      <Select
                        value={selectedEnrollment.discountPercentage?.toString() || 'none'}
                        onValueChange={(val) => {
                          const percentage = val === 'none' ? undefined : parseInt(val);
                          setSelectedEnrollment({ ...selectedEnrollment, discountPercentage: percentage });
                        }}
                      >
                        <SelectTrigger className="bg-white border-slate-200">
                          <SelectValue placeholder="Sin descuento" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Sin descuento (0%)</SelectItem>
                          {Array.from({ length: 10 }, (_, i) => (i + 1) * 5).map(pct => (
                            <SelectItem key={pct} value={pct.toString()}>{pct}%</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-slate-600">Motivo del Descuento</Label>
                      <Select
                        value={selectedEnrollment.discountReason || 'none'}
                        onValueChange={(val) => {
                          const reason = val === 'none' ? undefined : val;
                          setSelectedEnrollment({ ...selectedEnrollment, discountReason: reason });
                        }}
                      >
                        <SelectTrigger className="bg-white border-slate-200 text-xs">
                          <SelectValue placeholder="Selecciona motivo" />
                        </SelectTrigger>
                        <SelectContent className="max-h-60">
                          <SelectItem value="none">Sin especificar</SelectItem>
                          <SelectItem value="Haber cursado previamente este curso (Alumno repetidor)">Haber cursado previamente este curso (Alumno repetidor)</SelectItem>
                          <SelectItem value="Antigüedad de afiliación a UGT (+ 2 años)">Antigüedad de afiliación a UGT (+ 2 años)</SelectItem>
                          <SelectItem value="Antigüedad de afiliación a UGT (+ 5 años)">Antigüedad de afiliación a UGT (+ 5 años)</SelectItem>
                          <SelectItem value="Situación de desempleo / Demanda de empleo">Situación de desempleo / Demanda de empleo</SelectItem>
                          <SelectItem value="Matriculación en 2 o más cursos simultáneos">Matriculación en 2 o más cursos simultáneos</SelectItem>
                          <SelectItem value="Jubilado / Pensionista afiliado">Jubilado / Pensionista afiliado</SelectItem>
                          <SelectItem value="Fidelidad formativa (3 o más cursos completados)">Fidelidad formativa (3 o más cursos completados)</SelectItem>
                          <SelectItem value="Delegado/a o representante sindical">Delegado/a o representante sindical</SelectItem>
                          <SelectItem value="Personal sanitario / sociosanitario en formación continua">Personal sanitario / sociosanitario en formación continua</SelectItem>
                          <SelectItem value="Personal de refuerzo / Interino">Personal de refuerzo / Interino</SelectItem>
                          <SelectItem value="Otros conceptos">Otros conceptos</SelectItem>
                          {selectedEnrollment.discountReason && 
                            !['Haber cursado previamente este curso (Alumno repetidor)', 'Antigüedad de afiliación a UGT (+ 2 años)', 'Antigüedad de afiliación a UGT (+ 5 años)', 'Situación de desempleo / Demanda de empleo', 'Matriculación en 2 o más cursos simultáneos', 'Jubilado / Pensionista afiliado', 'Fidelidad formativa (3 o más cursos completados)', 'Delegado/a o representante sindical', 'Personal sanitario / sociosanitario en formación continua', 'Personal de refuerzo / Interino', 'Otros conceptos'].includes(selectedEnrollment.discountReason) && (
                              <SelectItem value={selectedEnrollment.discountReason}>{selectedEnrollment.discountReason}</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                      onClick={async () => {
                        const pct = selectedEnrollment.discountPercentage;
                        const reason = selectedEnrollment.discountReason;
                        try {
                          const res = await fetch(`/api/enrollments/${selectedEnrollment.id}`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              discountPercentage: pct === undefined ? null : pct,
                              discountReason: reason || null
                            })
                          })
                          if (res.ok) {
                            alert('Descuento actualizado con éxito')
                            fetchEnrollments()
                          } else {
                            alert('Error al actualizar el descuento')
                          }
                        } catch (e) {
                          console.error(e)
                          alert('Error al actualizar el descuento')
                        }
                      }}
                    >
                      Guardar Descuento
                    </Button>
                  </div>
                </div>

                {/* Acciones de gestión */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                  <Label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Acciones de Gestión</Label>
                  <div className="flex flex-wrap gap-2">
                    {selectedEnrollment.status === 'PENDING' && (
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={async () => {
                          const res = await fetch(`/api/enrollments/${selectedEnrollment.id}`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ status: 'ENROLLED' })
                          })
                          if (res.ok) {
                            setSelectedEnrollment({ ...selectedEnrollment, status: 'ENROLLED' })
                            fetchEnrollments()
                          }
                        }}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Confirmar Pago
                      </Button>
                    )}
                    {selectedEnrollment.status !== 'PENDING' && selectedEnrollment.status !== 'CANCELLED' && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                        onClick={() => handleOpenPaymentPdfDialog(selectedEnrollment)}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Descargar Justificante de Pago
                      </Button>
                    )}
                    {selectedEnrollment.status !== 'CANCELLED' && (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-amber-600 border-amber-200 hover:bg-amber-50"
                          onClick={async () => {
                            if (confirm('¿Revertir esta matrícula a Pago Pendiente?')) {
                              const res = await fetch(`/api/enrollments/${selectedEnrollment.id}`, {
                                method: 'PATCH',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ status: 'PENDING' })
                              })
                              if (res.ok) {
                                toast.success("Matrícula revertida a pago pendiente")
                                setSelectedEnrollment({ ...selectedEnrollment, status: 'PENDING' })
                                fetchEnrollments()
                              }
                            }
                          }}
                        >
                          <Clock className="h-4 w-4 mr-2" />
                          Revertir a Pendiente
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 border-red-200 hover:bg-red-50"
                          onClick={async () => {
                            if (confirm('¿Marcar esta matrícula como cancelada?')) {
                              const res = await fetch(`/api/enrollments/${selectedEnrollment.id}`, {
                                method: 'PATCH',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ status: 'CANCELLED' })
                              })
                              if (res.ok) {
                                setSelectedEnrollment({ ...selectedEnrollment, status: 'CANCELLED' })
                                fetchEnrollments()
                              }
                            }
                          }}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Cancelar Matrícula
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {/* Generador de Certificados */}
                <CertificateGenerator
                  enrollment={selectedEnrollment}
                  onCertificateGenerated={() => {
                    // Actualizar la matrícula en la lista
                    setEnrollments(prev => prev.map(e =>
                      e.id === selectedEnrollment.id
                        ? { ...e, certificate: 'CERT-GENERATED' }
                        : e
                    ))
                  }}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Lista de Matrículas */}
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle>Matrículas Recientes</CardTitle>
                <CardDescription>
                  Listado de todas las matrículas registradas ({filteredEnrollments.length} de {enrollments.length})
                </CardDescription>
              </div>

              {/* Barra de Filtros y Búsqueda */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <div className="relative min-w-[220px]">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar alumno, DNI o curso..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 text-sm h-9"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-2.5 top-2.5 text-xs text-muted-foreground hover:text-foreground"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[170px] text-xs h-9">
                    <SelectValue placeholder="Filtrar por estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Todos los estados</SelectItem>
                    <SelectItem value="PENDING">Pago Pendiente</SelectItem>
                    <SelectItem value="ENROLLED">Inscrito</SelectItem>
                    <SelectItem value="IN_PROGRESS">En Progreso</SelectItem>
                    <SelectItem value="COMPLETED">Completado</SelectItem>
                    <SelectItem value="CANCELLED">Cancelado</SelectItem>
                    <SelectItem value="DROPPED">Abandonado</SelectItem>
                    <SelectItem value="FAILED">Reprobado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Barra de Selección y Acción Masiva */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 mt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="select-all-enrollments"
                  checked={
                    filteredEnrollments.length > 0 &&
                    filteredEnrollments.every(e => selectedEnrollmentIds.includes(e.id))
                  }
                  onCheckedChange={handleToggleSelectAll}
                  disabled={filteredEnrollments.length === 0}
                />
                <Label
                  htmlFor="select-all-enrollments"
                  className="text-xs font-medium cursor-pointer select-none text-slate-700 dark:text-slate-300"
                >
                  Seleccionar todas ({filteredEnrollments.length})
                </Label>
              </div>

              {selectedEnrollmentIds.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 animate-in fade-in duration-200">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 px-2.5 py-1 text-xs">
                    {selectedEnrollmentIds.length} seleccionada{selectedEnrollmentIds.length !== 1 ? 's' : ''}
                  </Badge>

                  <Button
                    size="sm"
                    onClick={() => setIsBatchEmailOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xs h-8 text-xs"
                  >
                    <Mail className="h-3.5 w-3.5 mr-1.5" />
                    Enviar Correo a Seleccionados ({selectedStudentEmailsCount})
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setSelectedEnrollmentIds([])}
                    className="h-8 text-xs text-slate-500 hover:text-slate-900"
                  >
                    Deseleccionar
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-sm text-muted-foreground">Cargando matrículas...</p>
              </div>
            ) : filteredEnrollments.length === 0 ? (
              <div className="text-center py-12 border border-dashed rounded-lg">
                <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-2 opacity-40" />
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">No se encontraron matrículas</p>
                <p className="text-xs text-muted-foreground mt-1">Prueba a cambiar el término de búsqueda o el filtro de estado.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredEnrollments.map((enrollment) => {
                  const isSelected = selectedEnrollmentIds.includes(enrollment.id)
                  const hasEmail = Boolean(enrollment.student?.email && enrollment.student.email.includes('@'))

                  return (
                    <div
                      key={enrollment.id}
                      className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg transition-colors gap-3 ${
                        isSelected
                          ? 'border-blue-400 bg-blue-50/40 dark:bg-blue-950/20 shadow-xs'
                          : 'hover:bg-slate-50/60 dark:hover:bg-slate-900/40'
                      }`}
                    >
                      <div className="flex items-center space-x-3.5 min-w-0">
                        {/* Casilla de Selección */}
                        <div className="flex items-center">
                          <Checkbox
                            id={`enrollment-check-${enrollment.id}`}
                            checked={isSelected}
                            onCheckedChange={(checked) => handleToggleSelect(enrollment.id, !!checked)}
                            aria-label={`Seleccionar matrícula de ${enrollment.studentName}`}
                          />
                        </div>

                        <div className="flex-shrink-0">
                          {getStatusIcon(enrollment.status)}
                        </div>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <label
                              htmlFor={`enrollment-check-${enrollment.id}`}
                              className="font-medium cursor-pointer hover:text-blue-600 truncate"
                            >
                              {enrollment.studentName}
                            </label>
                            {getStatusBadge(enrollment.status)}
                            {enrollment.discountPercentage && (
                              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-[11px] py-0">
                                -{enrollment.discountPercentage}%
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground truncate">{enrollment.courseName}</p>
                          <div className="flex flex-wrap items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                            <span>Matriculado el {new Date(enrollment.enrollmentDate).toLocaleDateString()}</span>
                            {hasEmail ? (
                              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1 font-mono text-[11px]">
                                • <Mail className="h-3 w-3 inline text-slate-400" />
                                {enrollment.student?.email}
                              </span>
                            ) : (
                              <span className="text-[10px] text-amber-700 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.2 rounded border border-amber-200 dark:border-amber-900">
                                Sin email
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end space-x-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-slate-100">
                        <div className="text-right">
                          <div className="text-xs font-medium">{enrollment.progress}%</div>
                          <div className="w-16 bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
                            <div
                              className={`h-1.5 rounded-full ${enrollment.status === 'COMPLETED' ? 'bg-green-500' :
                                enrollment.status === 'IN_PROGRESS' || enrollment.status === 'ENROLLED' ? 'bg-blue-500' :
                                  enrollment.status === 'PENDING' ? 'bg-yellow-400' :
                                    enrollment.status === 'CANCELLED' ? 'bg-slate-300' : 'bg-red-500'
                                }`}
                              style={{ width: `${enrollment.progress}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* Botón rápido para enviar correo a este alumno */}
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0 text-blue-600 border-blue-200 hover:bg-blue-50 dark:hover:bg-blue-950"
                          title="Enviar correo a este alumno"
                          onClick={() => {
                            setSelectedEnrollmentIds([enrollment.id])
                            setIsBatchEmailOpen(true)
                          }}
                        >
                          <Mail className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-500 hover:bg-red-50 border-red-100"
                          title="Eliminar matrícula"
                          onClick={async () => {
                            if (confirm('¿Estás seguro de que deseas eliminar esta matriculación?')) {
                              try {
                                const res = await fetch(`/api/enrollments/${enrollment.id}`, { method: 'DELETE' })
                                if (res.ok) {
                                  setSelectedEnrollmentIds(prev => prev.filter(id => id !== enrollment.id))
                                  fetchEnrollments()
                                }
                              } catch (e) {
                                console.error(e)
                              }
                            }
                          }}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs"
                          onClick={() => setSelectedEnrollment(enrollment)}
                        >
                          <Eye className="h-3.5 w-3.5 mr-1" />
                          Ver Detalles
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>

    {/* Diálogo de edición de importe para el justificante de pago */}
    <Dialog open={paymentPdfDialog.open} onOpenChange={(open) => !open && setPaymentPdfDialog({ open: false, enrollment: null, amount: '', totalAmount: '' })}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-emerald-600" />
            Justificante de Pago
          </DialogTitle>
          <DialogDescription>
            Revisa y edita el importe antes de generar el PDF.
            {paymentPdfDialog.enrollment && (
              <span className="block mt-1 font-medium text-slate-700">
                {paymentPdfDialog.enrollment.studentName} — {paymentPdfDialog.enrollment.courseName}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="pdf-amount-paid" className="text-xs font-bold text-slate-700">
              Importe abonado (€) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="pdf-amount-paid"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={paymentPdfDialog.amount}
              onChange={(e) => setPaymentPdfDialog({ ...paymentPdfDialog, amount: e.target.value })}
              className="text-lg font-bold"
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pdf-total-amount" className="text-xs font-bold text-slate-700">
              Importe total del curso (€)
            </Label>
            <Input
              id="pdf-total-amount"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={paymentPdfDialog.totalAmount}
              onChange={(e) => setPaymentPdfDialog({ ...paymentPdfDialog, totalAmount: e.target.value })}
            />
            <p className="text-[11px] text-slate-400">Opcional. Si se deja vacío, se usará el importe abonado como total.</p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => setPaymentPdfDialog({ open: false, enrollment: null, amount: '', totalAmount: '' })}
          >
            Cancelar
          </Button>
          <Button
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
            onClick={handleConfirmPaymentPdf}
            disabled={!paymentPdfDialog.amount || parseFloat(paymentPdfDialog.amount) <= 0}
          >
            <FileText className="h-4 w-4 mr-2" />
            Generar PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    {/* Diálogo para envío masivo de correos a seleccionados */}
    <BatchEmailDialog
      isOpen={isBatchEmailOpen}
      onOpenChange={setIsBatchEmailOpen}
      selectedEnrollments={selectedEnrollmentsList}
      onSuccess={() => {
        setSelectedEnrollmentIds([])
      }}
    />
    </>
  )
}