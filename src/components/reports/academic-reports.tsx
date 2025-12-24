"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DateRangePicker } from "./date-range-picker"
import { ReportChart } from "./report-chart"
import { MetricsCard } from "./metrics-card"
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  TrendingUp, 
  Award,
  Target,
  Clock,
  Star
} from "lucide-react"

interface AcademicData {
  totalStudents: number
  activeStudents: number
  totalCourses: number
  averageGrade: number
  completionRate: number
  retentionRate: number
  monthlyData: Array<{
    month: string
    enrollments: number
    completions: number
    averageGrade: number
  }>
  coursePerformance: Array<{
    name: string
    students: number
    averageGrade: number
    completionRate: number
  }>
  gradeDistribution: Array<{
    grade: string
    count: number
    percentage: number
  }>
}

export function AcademicReports() {
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    end: new Date()
  })
  const [academicData, setAcademicData] = useState<AcademicData | null>(null)
  const [loading, setLoading] = useState(true)

  // Mock data para demostración
  const mockAcademicData: AcademicData = {
    totalStudents: 156,
    activeStudents: 142,
    totalCourses: 24,
    averageGrade: 85.5,
    completionRate: 89,
    retentionRate: 92,
    monthlyData: [
      { month: 'Ene', enrollments: 25, completions: 20, averageGrade: 82 },
      { month: 'Feb', enrollments: 30, completions: 25, averageGrade: 84 },
      { month: 'Mar', enrollments: 28, completions: 24, averageGrade: 85 },
      { month: 'Abr', enrollments: 32, completions: 28, averageGrade: 86 },
      { month: 'May', enrollments: 35, completions: 31, averageGrade: 87 },
      { month: 'Jun', enrollments: 38, completions: 34, averageGrade: 85.5 }
    ],
    coursePerformance: [
      { name: 'JavaScript Avanzado', students: 28, averageGrade: 88, completionRate: 95 },
      { name: 'React Native', students: 22, averageGrade: 86, completionRate: 91 },
      { name: 'Diseño Web', students: 18, averageGrade: 84, completionRate: 89 },
      { name: 'Python Backend', students: 20, averageGrade: 87, completionRate: 93 }
    ],
    gradeDistribution: [
      { grade: 'A (90-100)', count: 45, percentage: 35 },
      { grade: 'B (80-89)', count: 52, percentage: 40 },
      { grade: 'C (70-79)', count: 25, percentage: 19 },
      { grade: 'D (60-69)', count: 6, percentage: 5 },
      { grade: 'F (<60)', count: 2, percentage: 1 }
    ]
  }

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      // Aquí iría la llamada a la API
      setTimeout(() => {
        setAcademicData(mockAcademicData)
        setLoading(false)
      }, 1000)
    }

    loadData()
  }, [dateRange])

  const handleDateRangeChange = (start: Date, end: Date) => {
    setDateRange({ start, end })
  }

  const handleExport = (format: 'pdf' | 'excel') => {
    console.log(`Exporting academic report as ${format}`)
    // Aquí iría la lógica de exportación
  }

  if (loading || !academicData) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-20 bg-gray-200 animate-pulse rounded-lg" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Controles y Filtros */}
      <div className="grid gap-6 md:grid-cols-4">
        <DateRangePicker 
          onDateRangeChange={handleDateRangeChange}
          onExport={handleExport}
        />
        
        <MetricsCard
          title="Resumen Académico"
          metrics={[
            {
              label: "Total Estudiantes",
              value: academicData.totalStudents,
              change: 12,
              changeType: 'positive',
              icon: <Users className="h-4 w-4" />
            },
            {
              label: "Estudiantes Activos",
              value: academicData.activeStudents,
              change: 8,
              changeType: 'positive',
              icon: <GraduationCap className="h-4 w-4" />
            },
            {
              label: "Cursos Activos",
              value: academicData.totalCourses,
              change: 5,
              changeType: 'positive',
              icon: <BookOpen className="h-4 w-4" />
            },
            {
              label: "Promedio General",
              value: `${academicData.averageGrade}/100`,
              change: 3,
              changeType: 'positive',
              icon: <Target className="h-4 w-4" />
            }
          ]}
          className="md:col-span-3"
        />
      </div>

      {/* Gráficos y Reportes */}
      <Tabs defaultValue="enrollments" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="enrollments">Inscripciones</TabsTrigger>
          <TabsTrigger value="performance">Rendimiento</TabsTrigger>
          <TabsTrigger value="courses">Cursos</TabsTrigger>
          <TabsTrigger value="grades">Calificaciones</TabsTrigger>
        </TabsList>

        <TabsContent value="enrollments" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <ReportChart
              title="Inscripciones y Completaciones Mensuales"
              description="Evolución de inscripciones y completaciones de cursos"
              type="line"
              data={academicData.monthlyData}
              categories={["Inscripciones", "Completaciones", "Promedio"]}
              xAxisKey="month"
              yAxisKey="enrollments"
              color="#3b82f6"
            />
            
            <MetricsCard
              title="Indicadores Clave"
              metrics={[
                {
                  label: "Tasa de Retención",
                  value: `${academicData.retentionRate}%`,
                  change: 2,
                  changeType: 'positive',
                  icon: <TrendingUp className="h-4 w-4" />
                },
                {
                  label: "Tasa de Completación",
                  value: `${academicData.completionRate}%`,
                  change: 4,
                  changeType: 'positive',
                  icon: <Award className="h-4 w-4" />
                },
                {
                  label: "Duración Promedio",
                  value: "6.2 semanas",
                  change: -1,
                  changeType: 'positive',
                  icon: <Clock className="h-4 w-4" />
                },
                {
                  label: "Satisfacción",
                  value: "4.7/5",
                  change: 5,
                  changeType: 'positive',
                  icon: <Star className="h-4 w-4" />
                }
              ]}
            />
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <ReportChart
              title="Rendimiento Académico Mensual"
              description="Evolución del promedio de calificaciones"
              type="area"
              data={academicData.monthlyData}
              categories={["Promedio"]}
              xAxisKey="month"
              yAxisKey="averageGrade"
              color="#10b981"
            />
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5" />
                  <span>Objetivos Académicos</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Tasa de retención objetivo</span>
                    <Badge className="bg-green-100 text-green-800">90% ✓</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Tasa de completación objetivo</span>
                    <Badge className="bg-green-100 text-green-800">85% ✓</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Promedio mínimo objetivo</span>
                    <Badge className="bg-green-100 text-green-800">80% ✓</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Satisfacción estudiantil</span>
                    <Badge className="bg-yellow-100 text-yellow-800">4.5/5 ⚠</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="courses" className="space-y-4">
          <ReportChart
            title="Rendimiento por Curso"
            description="Promedio de calificaciones y tasa de completación por curso"
            type="bar"
            data={academicData.coursePerformance}
            categories={["Estudiantes", "Promedio", "Completación"]}
            xAxisKey="name"
            yAxisKey="averageGrade"
            color="#8b5cf6"
          />
        </TabsContent>

        <TabsContent value="grades" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <ReportChart
              title="Distribución de Calificaciones"
              description="Distribución de calificaciones de todos los estudiantes"
              type="pie"
              data={academicData.gradeDistribution}
              categories={["Porcentaje"]}
              xAxisKey="grade"
              yAxisKey="percentage"
              color="#f59e0b"
            />
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Award className="h-5 w-5" />
                  <span>Estadísticas de Calificaciones</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Calificación más alta</span>
                      <Badge className="bg-green-100 text-green-800">98/100</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Calificación más baja</span>
                      <Badge className="bg-red-100 text-red-800">45/100</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Calificación promedio</span>
                      <Badge className="bg-blue-100 text-blue-800">{academicData.averageGrade}/100</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Estudiantes sobresalientes</span>
                      <Badge className="bg-purple-100 text-purple-800">45 (35%)</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}