"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { CalendarDays, Clock, User, BookOpen } from 'lucide-react'

interface RecentActivity {
  id: string
  type: 'enrollment' | 'payment' | 'course' | 'material'
  title: string
  description: string
  user: string
  date: string
  status: 'completed' | 'pending' | 'in-progress'
}

const recentActivities: RecentActivity[] = [
  {
    id: '1',
    type: 'enrollment',
    title: 'Nueva inscripción',
    description: 'Juan Pérez se inscribió en Curso de JavaScript',
    user: 'Juan Pérez',
    date: '2024-01-15',
    status: 'completed'
  },
  {
    id: '2',
    type: 'payment',
    title: 'Pago recibido',
    description: 'María García pagó la mensualidad del curso',
    user: 'María García',
    date: '2024-01-15',
    status: 'completed'
  },
  {
    id: '3',
    type: 'course',
    title: 'Nuevo curso creado',
    description: 'Curso Avanzado de React fue creado',
    user: 'Admin',
    date: '2024-01-14',
    status: 'completed'
  },
  {
    id: '4',
    type: 'material',
    title: 'Material actualizado',
    description: 'Libros de programación actualizados',
    user: 'Admin',
    date: '2024-01-14',
    status: 'in-progress'
  }
]

const getStatusBadge = (status: RecentActivity['status']) => {
  switch (status) {
    case 'completed':
      return <Badge variant="default">Completado</Badge>
    case 'pending':
      return <Badge variant="secondary">Pendiente</Badge>
    case 'in-progress':
      return <Badge variant="outline">En progreso</Badge>
    default:
      return null
  }
}

const getActivityIcon = (type: RecentActivity['type']) => {
  switch (type) {
    case 'enrollment':
      return <User className="h-4 w-4" />
    case 'payment':
      return <CalendarDays className="h-4 w-4" />
    case 'course':
      return <BookOpen className="h-4 w-4" />
    case 'material':
      return <Clock className="h-4 w-4" />
    default:
      return null
  }
}

export function RecentActivities() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Actividad Reciente</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Actividad</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Usuario</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentActivities.map((activity) => (
              <TableRow key={activity.id}>
                <TableCell className="flex items-center gap-2">
                  {getActivityIcon(activity.type)}
                  {activity.title}
                </TableCell>
                <TableCell>{activity.description}</TableCell>
                <TableCell>{activity.user}</TableCell>
                <TableCell>{activity.date}</TableCell>
                <TableCell>{getStatusBadge(activity.status)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="mt-4">
          <Button variant="outline" size="sm" className="w-full">
            Ver todas las actividades
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}