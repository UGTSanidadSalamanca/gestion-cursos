"use client"

import { useState } from "react"
import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FinancialReports } from "@/components/reports/financial-reports"
import { AcademicReports } from "@/components/reports/academic-reports"
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  BookOpen, 
  CreditCard, 
  Calendar,
  Download,
  FileText,
  PieChart,
  Activity,
  DollarSign,
  Target,
  GraduationCap,
  Award
} from "lucide-react"

export default function ReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("month")

  const stats = {
    totalStudents: 156,
    activeStudents: 142,
    newStudents: 24,
    totalCourses: 24,
    activeCourses: 18,
    totalRevenue: 45670,
    averageRevenue: 3806,
    completionRate: 78,
    occupancyRate: 82
  }

  const getCompletionBadge = (rate: number) => {
    if (rate >= 90) return <Badge className="bg-green-500 hover:bg-green-600">{rate}%</Badge>
    if (rate >= 80) return <Badge className="bg-blue-500 hover:bg-blue-600">{rate}%</Badge>
    if (rate >= 70) return <Badge className="bg-yellow-500 hover:bg-yellow-600">{rate}%</Badge>
    return <Badge variant="destructive">{rate}%</Badge>
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Reportes y Estadísticas</h1>
            <p className="text-muted-foreground">
              Análisis detallado del rendimiento del centro educativo
            </p>
          </div>
          <div className="mt-4 flex items-center space-x-2 md:mt-0">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Exportar PDF
            </Button>
            <Button variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              Exportar Excel
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Alumnos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalStudents}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+{stats.newStudents}</span> nuevos este mes
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tasa de Ocupación</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.occupancyRate}%</div>
              <p className="text-xs text-muted-foreground">
                Promedio de todos los cursos
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">€{stats.totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Promedio mensual: €{stats.averageRevenue.toLocaleString()}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tasa de Finalización</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completionRate}%</div>
              <p className="text-xs text-muted-foreground">
                Alumnos que completaron sus cursos
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Advanced Reports */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Resumen General</TabsTrigger>
            <TabsTrigger value="financial">Reportes Financieros</TabsTrigger>
            <TabsTrigger value="academic">Reportes Académicos</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <PieChart className="mr-2 h-5 w-5" />
                    Distribución por Nivel
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Principiante</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 h-2 bg-green-500 rounded-full" />
                        <span className="text-sm font-medium">35%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Intermedio</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 h-2 bg-blue-500 rounded-full" />
                        <span className="text-sm font-medium">28%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Avanzado</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-12 h-2 bg-purple-500 rounded-full" />
                        <span className="text-sm font-medium">22%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Experto</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-2 bg-red-500 rounded-full" />
                        <span className="text-sm font-medium">15%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="mr-2 h-5 w-5" />
                    Actividad Reciente
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Nuevas inscripciones</span>
                      <span className="text-sm font-medium">24</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Cursos completados</span>
                      <span className="text-sm font-medium">18</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Pagos recibidos</span>
                      <span className="text-sm font-medium">156</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Certificados emitidos</span>
                      <span className="text-sm font-medium">15</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="mr-2 h-5 w-5" />
                    Proyecciones
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Alumnos próximos mes</span>
                      <div className="flex items-center space-x-1">
                        <span className="text-sm font-medium">32</span>
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Ingresos estimados</span>
                      <div className="flex items-center space-x-1">
                        <span className="text-sm font-medium">€9,200</span>
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Nuevos cursos</span>
                      <div className="flex items-center space-x-1">
                        <span className="text-sm font-medium">4</span>
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Ocupación proyectada</span>
                      <div className="flex items-center space-x-1">
                        <span className="text-sm font-medium">85%</span>
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="financial" className="space-y-4">
            <FinancialReports />
          </TabsContent>

          <TabsContent value="academic" className="space-y-4">
            <AcademicReports />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}