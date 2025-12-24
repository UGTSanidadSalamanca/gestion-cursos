"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MainLayout } from "@/components/layout/main-layout"
import { EnrollmentForm } from "@/components/enrollment/enrollment-form"
import { CertificateGenerator } from "@/components/certificates/certificate-generator"
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
  status: 'ENROLLED' | 'IN_PROGRESS' | 'COMPLETED' | 'DROPPED' | 'FAILED'
  progress: number
  grade?: number
  certificate?: string
  student: { name: string }
  course: { 
    title: string
    duration: number
    teacher?: { name: string }
  }
}

export default function EnrollmentsPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selectedEnrollment, setSelectedEnrollment] = useState<Enrollment | null>(null)

  useEffect(() => {
    // Simular carga de datos con información completa
    const mockEnrollments: Enrollment[] = [
      {
        id: "1",
        studentName: "Juan Pérez",
        courseName: "JavaScript Avanzado",
        enrollmentDate: "2024-01-15",
        status: "IN_PROGRESS",
        progress: 75,
        grade: 8.5,
        student: { name: "Juan Pérez" },
        course: { 
          title: "JavaScript Avanzado",
          duration: 40,
          teacher: { name: "Carlos Rodríguez" }
        }
      },
      {
        id: "2",
        studentName: "María García",
        courseName: "UI/UX Design",
        enrollmentDate: "2024-01-20",
        status: "IN_PROGRESS",
        progress: 60,
        student: { name: "María García" },
        course: { 
          title: "UI/UX Design",
          duration: 30,
          teacher: { name: "Ana López" }
        }
      },
      {
        id: "3",
        studentName: "Carlos López",
        courseName: "Marketing Digital",
        enrollmentDate: "2023-12-10",
        status: "COMPLETED",
        progress: 100,
        grade: 9.2,
        certificate: "CERT-2024-001",
        student: { name: "Carlos López" },
        course: { 
          title: "Marketing Digital",
          duration: 35,
          teacher: { name: "Laura Martínez" }
        }
      },
      {
        id: "4",
        studentName: "Ana Martínez",
        courseName: "Inglés Empresarial",
        enrollmentDate: "2024-02-01",
        status: "DROPPED",
        progress: 20,
        student: { name: "Ana Martínez" },
        course: { 
          title: "Inglés Empresarial",
          duration: 50,
          teacher: { name: "John Smith" }
        }
      }
    ]
    
    setTimeout(() => {
      setEnrollments(mockEnrollments)
      setLoading(false)
    }, 1000)
  }, [])

  const getStatusBadge = (status: string) => {
    switch (status) {
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
      default:
        return <Badge variant="outline">Desconocido</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
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
      default:
        return <FileText className="h-4 w-4 text-gray-500" />
    }
  }

  const stats = {
    total: enrollments.length,
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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
                  // Aquí podrías recargar los datos
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
                          className={`h-2 rounded-full ${
                            selectedEnrollment.status === 'COMPLETED' ? 'bg-green-500' : 
                            selectedEnrollment.status === 'IN_PROGRESS' ? 'bg-blue-500' : 'bg-red-500'
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
                            className={`h-2 rounded-full ${
                              enrollment.status === 'COMPLETED' ? 'bg-green-500' : 
                              enrollment.status === 'IN_PROGRESS' ? 'bg-blue-500' : 'bg-red-500'
                            }`} 
                            style={{ width: `${enrollment.progress}%` }}
                          ></div>
                        </div>
                      </div>
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