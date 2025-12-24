"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { CalendarDays, Clock, Users, BookOpen } from 'lucide-react'

interface UpcomingCourse {
  id: string
  title: string
  teacher: string
  startDate: string
  endDate: string
  enrolled: number
  capacity: number
  progress: number
  status: 'upcoming' | 'in-progress' | 'completed'
}

const upcomingCourses: UpcomingCourse[] = [
  {
    id: '1',
    title: 'JavaScript Básico',
    teacher: 'Carlos Rodríguez',
    startDate: '2024-01-20',
    endDate: '2024-03-20',
    enrolled: 15,
    capacity: 20,
    progress: 0,
    status: 'upcoming'
  },
  {
    id: '2',
    title: 'React Avanzado',
    teacher: 'Ana Martínez',
    startDate: '2024-01-15',
    endDate: '2024-02-15',
    enrolled: 18,
    capacity: 20,
    progress: 35,
    status: 'in-progress'
  },
  {
    id: '3',
    title: 'Diseño UI/UX',
    teacher: 'Laura Sánchez',
    startDate: '2024-01-25',
    endDate: '2024-04-25',
    enrolled: 12,
    capacity: 15,
    progress: 0,
    status: 'upcoming'
  }
]

const getStatusBadge = (status: UpcomingCourse['status']) => {
  switch (status) {
    case 'upcoming':
      return <Badge variant="secondary">Próximo</Badge>
    case 'in-progress':
      return <Badge variant="default">En curso</Badge>
    case 'completed':
      return <Badge variant="outline">Completado</Badge>
    default:
      return null
  }
}

export function UpcomingCourses() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Próximos Cursos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {upcomingCourses.map((course) => (
            <div key={course.id} className="flex items-center space-x-4 p-4 border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">{course.title}</h3>
                  {getStatusBadge(course.status)}
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  Profesor: {course.teacher}
                </p>
                <div className="flex items-center text-sm text-muted-foreground space-x-4">
                  <div className="flex items-center">
                    <CalendarDays className="h-4 w-4 mr-1" />
                    {course.startDate}
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {course.endDate}
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    {course.enrolled}/{course.capacity}
                  </div>
                </div>
                {course.progress > 0 && (
                  <div className="mt-2">
                    <Progress value={course.progress} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">
                      {course.progress}% completado
                    </p>
                  </div>
                )}
              </div>
              <Button variant="outline" size="sm">
                Ver detalles
              </Button>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <Button variant="outline" size="sm" className="w-full">
            Ver todos los cursos
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}