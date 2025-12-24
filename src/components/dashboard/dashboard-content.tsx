"use client"

import { StatsCard } from '@/components/dashboard/stats-card'
import { RecentActivities } from '@/components/dashboard/recent-activities'
import { UpcomingCourses } from '@/components/dashboard/upcoming-courses'
import { 
  Users, 
  UserCheck, 
  BookOpen, 
  CreditCard, 
  TrendingUp,
  Calendar,
  AlertCircle
} from 'lucide-react'

export function DashboardContent() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Bienvenido al sistema de gestión integral de cursos
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Alumnos"
          value="156"
          description="Alumnos activos"
          icon={Users}
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title="Docentes"
          value="12"
          description="Docentes activos"
          icon={UserCheck}
          trend={{ value: 8, isPositive: true }}
        />
        <StatsCard
          title="Cursos Activos"
          value="24"
          description="Cursos en progreso"
          icon={BookOpen}
          trend={{ value: 15, isPositive: true }}
        />
        <StatsCard
          title="Ingresos Mes"
          value="€12,450"
          description="Pagos recibidos"
          icon={CreditCard}
          trend={{ value: 23, isPositive: true }}
        />
      </div>

      {/* Additional Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatsCard
          title="Tasa de Ocupación"
          value="78%"
          description="Promedio de cursos"
          icon={TrendingUp}
          trend={{ value: 5, isPositive: true }}
        />
        <StatsCard
          title="Próximos Cursos"
          value="8"
          description="Inician esta semana"
          icon={Calendar}
          trend={{ value: 3, isPositive: true }}
        />
        <StatsCard
          title="Pagos Pendientes"
          value="23"
          description="Por cobrar"
          icon={AlertCircle}
          trend={{ value: 10, isPositive: false }}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        <UpcomingCourses />
        <RecentActivities />
      </div>
    </div>
  )
}