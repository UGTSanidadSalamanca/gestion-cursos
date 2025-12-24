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
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  CreditCard, 
  AlertCircle,
  Calendar,
  Users,
  FileText
} from "lucide-react"

interface FinancialData {
  totalRevenue: number
  totalExpenses: number
  netProfit: number
  pendingPayments: number
  overduePayments: number
  monthlyData: Array<{
    month: string
    revenue: number
    expenses: number
    profit: number
  }>
  paymentMethods: Array<{
    method: string
    count: number
    amount: number
  }>
  topCourses: Array<{
    name: string
    revenue: number
    students: number
  }>
}

export function FinancialReports() {
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    end: new Date()
  })
  const [financialData, setFinancialData] = useState<FinancialData | null>(null)
  const [loading, setLoading] = useState(true)

  // Mock data para demostración
  const mockFinancialData: FinancialData = {
    totalRevenue: 24580,
    totalExpenses: 12340,
    netProfit: 12240,
    pendingPayments: 8420,
    overduePayments: 2150,
    monthlyData: [
      { month: 'Ene', revenue: 18000, expenses: 9000, profit: 9000 },
      { month: 'Feb', revenue: 22000, expenses: 11000, profit: 11000 },
      { month: 'Mar', revenue: 20000, expenses: 10000, profit: 10000 },
      { month: 'Abr', revenue: 24000, expenses: 12000, profit: 12000 },
      { month: 'May', revenue: 26000, expenses: 13000, profit: 13000 },
      { month: 'Jun', revenue: 24580, expenses: 12340, profit: 12240 }
    ],
    paymentMethods: [
      { method: 'Transferencia', count: 45, amount: 15000 },
      { method: 'Tarjeta', count: 32, amount: 8580 },
      { method: 'Efectivo', count: 12, amount: 1000 }
    ],
    topCourses: [
      { name: 'JavaScript Avanzado', revenue: 8500, students: 28 },
      { name: 'React Native', revenue: 6200, students: 22 },
      { name: 'Diseño Web', revenue: 4800, students: 18 },
      { name: 'Python Backend', revenue: 5080, students: 20 }
    ]
  }

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      // Aquí iría la llamada a la API
      setTimeout(() => {
        setFinancialData(mockFinancialData)
        setLoading(false)
      }, 1000)
    }

    loadData()
  }, [dateRange])

  const handleDateRangeChange = (start: Date, end: Date) => {
    setDateRange({ start, end })
  }

  const handleExport = (format: 'pdf' | 'excel') => {
    console.log(`Exporting report as ${format}`)
    // Aquí iría la lógica de exportación
  }

  if (loading || !financialData) {
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
          title="Resumen Financiero"
          metrics={[
            {
              label: "Ingresos Totales",
              value: `€${financialData.totalRevenue.toLocaleString()}`,
              change: 8,
              changeType: 'positive',
              icon: <DollarSign className="h-4 w-4" />
            },
            {
              label: "Gastos Totales",
              value: `€${financialData.totalExpenses.toLocaleString()}`,
              change: 5,
              changeType: 'positive',
              icon: <TrendingDown className="h-4 w-4" />
            },
            {
              label: "Beneficio Neto",
              value: `€${financialData.netProfit.toLocaleString()}`,
              change: 12,
              changeType: 'positive',
              icon: <TrendingUp className="h-4 w-4" />
            },
            {
              label: "Pagos Pendientes",
              value: `€${financialData.pendingPayments.toLocaleString()}`,
              change: -3,
              changeType: 'negative',
              icon: <AlertCircle className="h-4 w-4" />
            }
          ]}
          className="md:col-span-3"
        />
      </div>

      {/* Gráficos y Reportes */}
      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="revenue">Ingresos</TabsTrigger>
          <TabsTrigger value="payments">Pagos</TabsTrigger>
          <TabsTrigger value="courses">Cursos</TabsTrigger>
          <TabsTrigger value="trends">Tendencias</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <ReportChart
              title="Ingresos vs Gastos Mensuales"
              description="Comparativa de ingresos y gastos por mes"
              type="line"
              data={financialData.monthlyData}
              categories={["Ingresos", "Gastos", "Beneficio"]}
              xAxisKey="month"
              yAxisKey="revenue"
              color="#10b981"
            />
            
            <ReportChart
              title="Distribución de Ingresos"
              description="Ingresos por método de pago"
              type="pie"
              data={financialData.paymentMethods}
              categories={["Monto"]}
              xAxisKey="method"
              yAxisKey="amount"
              color="#3b82f6"
            />
          </div>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CreditCard className="h-5 w-5" />
                  <span>Estado de Pagos</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Pagos al día</span>
                    <Badge className="bg-green-100 text-green-800">€16,160</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Pagos pendientes</span>
                    <Badge className="bg-yellow-100 text-yellow-800">€8,420</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Pagos vencidos</span>
                    <Badge className="bg-red-100 text-red-800">€2,150</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Total recaudado</span>
                    <Badge className="bg-blue-100 text-blue-800">€24,580</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <ReportChart
              title="Métodos de Pago"
              description="Cantidad y monto por método de pago"
              type="bar"
              data={financialData.paymentMethods}
              categories={["Cantidad", "Monto"]}
              xAxisKey="method"
              yAxisKey="count"
              color="#8b5cf6"
            />
          </div>
        </TabsContent>

        <TabsContent value="courses" className="space-y-4">
          <ReportChart
            title="Ingresos por Curso"
            description="Cursos con mayores ingresos"
            type="bar"
            data={financialData.topCourses}
            categories={["Ingresos", "Estudiantes"]}
            xAxisKey="name"
            yAxisKey="revenue"
            color="#f59e0b"
          />
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <ReportChart
              title="Tendencia de Beneficios"
              description="Evolución de beneficios mensuales"
              type="area"
              data={financialData.monthlyData}
              categories={["Beneficio"]}
              xAxisKey="month"
              yAxisKey="profit"
              color="#10b981"
            />
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Análisis de Tendencias</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Crecimiento mensual</span>
                      <Badge className="bg-green-100 text-green-800">+12%</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Tendencia de ingresos</span>
                      <Badge className="bg-green-100 text-green-800">Alcista</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Eficiencia de costos</span>
                      <Badge className="bg-blue-100 text-blue-800">50%</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Proyección anual</span>
                      <Badge className="bg-purple-100 text-purple-800">€294,960</Badge>
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