"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MainLayout } from "@/components/layout/main-layout"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { EnrollmentForm } from "@/components/enrollment/enrollment-form"
import { CertificateGenerator } from "@/components/certificates/certificate-generator"
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
  Eye
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

  const handleDownloadPaymentPdf = (enrollment: Enrollment) => {
    const basePrice = enrollment.course.price || 0;
    const discount = enrollment.discountPercentage || 0;
    const amountPaid = basePrice * (1 - discount / 100);

    const data = {
      studentName: enrollment.studentName,
      dni: enrollment.student.dni || '',
      email: enrollment.student.email || '',
      phone: enrollment.student.phone || '',
      isAffiliated: !!enrollment.student.isAffiliated,
      courseTitle: enrollment.courseName,
      courseCode: enrollment.course.code || '',
      courseLevel: enrollment.course.level,
      totalAmount: basePrice,
      amountPaid: amountPaid,
      discountApplied: discount > 0 ? `${discount}% (${enrollment.discountReason || 'Beca / Descuento'})` : undefined,
      enrollmentDate: enrollment.enrollmentDate,
      confirmationDate: enrollment.updatedAt,
      referenceId: enrollment.id.slice(0, 8).toUpperCase()
    };

    const doc = generatePaymentConfirmationPdf(data);
    doc.save(`Confirmacion-Pago-${enrollment.studentName.replace(/\s+/g, '-')}-${enrollment.course.code || 'Curso'}.pdf`);
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
                        onClick={() => handleDownloadPaymentPdf(selectedEnrollment)}
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
            <CardTitle>Matrículas Recientes</CardTitle>
            <CardDescription>
              Listado de todas las matrículas registradas
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-sm text-muted-foreground">Cargando matrículas...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {enrollments.map((enrollment) => (
                  <div key={enrollment.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        {getStatusIcon(enrollment.status)}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium">{enrollment.studentName}</h3>
                          {getStatusBadge(enrollment.status)}
                          {enrollment.discountPercentage && (
                            <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
                              -{enrollment.discountPercentage}%
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{enrollment.courseName}</p>
                        <p className="text-xs text-muted-foreground">
                          Matriculado el {new Date(enrollment.enrollmentDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-sm font-medium">{enrollment.progress}%</div>
                        <div className="w-20 bg-slate-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${enrollment.status === 'COMPLETED' ? 'bg-green-500' :
                              enrollment.status === 'IN_PROGRESS' || enrollment.status === 'ENROLLED' ? 'bg-blue-500' :
                                enrollment.status === 'PENDING' ? 'bg-yellow-400' :
                                  enrollment.status === 'CANCELLED' ? 'bg-slate-300' : 'bg-red-500'
                              }`}
                            style={{ width: `${enrollment.progress}%` }}
                          ></div>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-500 hover:bg-red-50 border-red-100"
                        onClick={async () => {
                          if (confirm('¿Estás seguro de que deseas eliminar esta matriculación?')) {
                            try {
                              const res = await fetch(`/api/enrollments/${enrollment.id}`, { method: 'DELETE' })
                              if (res.ok) fetchEnrollments()
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
                        onClick={() => setSelectedEnrollment(enrollment)}
                      >
                        <Eye className="h-4 w-4" />
                        Ver Detalles
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}