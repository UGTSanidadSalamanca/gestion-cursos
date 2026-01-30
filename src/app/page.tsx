"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MainLayout } from "@/components/layout/main-layout"
import {
  AcademicModule,
  FinancialModule,
  OperationsModule,
  PriceModule
} from "@/components/modules"

export default function Home() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/dashboard/stats')
        const data = await response.json()
        setStats(data.stats)
      } catch (error) {
        console.error('Error fetching dashboard stats:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  return (
    <MainLayout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-white p-2 rounded-xl shadow-md border border-slate-100 hidden md:block">
              <img src="/ugt-logo.png" alt="Logo UGT" className="h-12 w-auto object-contain" />
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight">Sistema de Gestión Integral</h1>
              <p className="text-xl text-muted-foreground mt-2">
                Plataforma completa para la administración de centros educativos
              </p>
            </div>
          </div>
          <div className="mt-4 md:mt-0">
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="text-sm">
                v2.0.1
              </Badge>
              <Badge className="bg-green-500 hover:bg-green-600">
                Sistema Activo
              </Badge>
            </div>
          </div>
        </div>

        {/* Stats Generales */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Alumnos Activos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? '...' : stats?.totalStudents || 0}</div>
              <p className="text-xs text-muted-foreground">
                Registrados en el sistema
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cursos Activos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? '...' : stats?.activeCourses || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.activeEnrollments || 0} inscripciones activas
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ingresos Mensuales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">€{loading ? '...' : (stats?.monthlyRevenue || 0).toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Previsto: €{stats?.expectedRevenue ? Math.round(stats.expectedRevenue).toLocaleString() : '0'}
                {stats?.expectedRevenue > 0 && stats?.monthlyRevenue
                  ? ` (${Math.round((stats.monthlyRevenue / stats.expectedRevenue) * 100)}% cobrado)`
                  : ''}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Satisfacción</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? '...' : stats?.satisfaction || '4.8'}/5</div>
              <p className="text-xs text-muted-foreground">
                Calificación promedio
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Módulos Principales */}
        <Tabs defaultValue="academic" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="academic" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
              Módulo Académico
            </TabsTrigger>
            <TabsTrigger value="financial" className="data-[state=active]:bg-green-500 data-[state=active]:text-white">
              Módulo Financiero
            </TabsTrigger>
            <TabsTrigger value="operations" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
              Módulo Operaciones
            </TabsTrigger>
          </TabsList>

          <TabsContent value="academic" className="space-y-4">
            <AcademicModule stats={stats} />
          </TabsContent>

          <TabsContent value="financial" className="space-y-4">
            <FinancialModule stats={stats} />
          </TabsContent>

          <TabsContent value="operations" className="space-y-4">
            <OperationsModule stats={stats} />
          </TabsContent>
        </Tabs>
        <div className="mt-16 bg-slate-50/50 -mx-6 px-6 py-16 border-y border-slate-100">
          <PriceModule />
        </div>
      </div>
    </MainLayout>
  )
}