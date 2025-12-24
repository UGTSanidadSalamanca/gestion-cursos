"use client"

import { useState } from "react"
import { MainLayout } from '@/components/layout/main-layout'
import { CalendarView } from '@/components/calendar/calendar-view'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  BookOpen,
  Plus,
  Edit,
  Trash2
} from "lucide-react"

interface CalendarEvent {
  id: string
  title: string
  course: string
  date: Date
  startTime: string
  endTime: string
  location?: string
  instructor: string
  students: number
  maxStudents?: number
  type: 'class' | 'exam' | 'meeting' | 'event'
  description?: string
}

export default function CalendarPage() {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event)
    setIsDialogOpen(true)
  }

  const handleDateClick = (date: Date) => {
    console.log('Fecha seleccionada:', date)
    // Aquí podrías abrir un diálogo para crear un nuevo evento
  }

  const getEventTypeColor = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'class':
        return 'bg-blue-100 text-blue-800'
      case 'exam':
        return 'bg-red-100 text-red-800'
      case 'meeting':
        return 'bg-green-100 text-green-800'
      case 'event':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getEventTypeLabel = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'class':
        return 'Clase'
      case 'exam':
        return 'Examen'
      case 'meeting':
        return 'Reunión'
      case 'event':
        return 'Evento'
      default:
        return 'Otro'
    }
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Calendario Académico</h1>
            <p className="text-muted-foreground">
              Gestiona y visualiza todos los cursos, exámenes y eventos
            </p>
          </div>
          <div className="mt-4 flex items-center space-x-2 md:mt-0">
            <Button variant="outline">
              <Calendar className="mr-2 h-4 w-4" />
              Importar Calendario
            </Button>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Evento
            </Button>
          </div>
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Eventos este Mes</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-muted-foreground">
                +4 desde el mes pasado
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clases Programadas</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">18</div>
              <p className="text-xs text-muted-foreground">
                75% del total
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Exámenes</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4</div>
              <p className="text-xs text-muted-foreground">
                Esta semana
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ocupación de Aulas</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">78%</div>
              <p className="text-xs text-muted-foreground">
                Promedio general
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Calendario Principal */}
        <CalendarView 
          onEventClick={handleEventClick}
          onDateClick={handleDateClick}
        />

        {/* Próximos Eventos */}
        <Card>
          <CardHeader>
            <CardTitle>Próximos Eventos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                {
                  id: "1",
                  title: "JavaScript Avanzado - Clase 1",
                  date: new Date(2024, 5, 15),
                  startTime: "09:00",
                  location: "Aula 101",
                  type: "class" as const
                },
                {
                  id: "2",
                  title: "React Native - Clase 3",
                  date: new Date(2024, 5, 15),
                  startTime: "14:00",
                  location: "Aula 205",
                  type: "class" as const
                },
                {
                  id: "3",
                  title: "Examen Final - Diseño Web",
                  date: new Date(2024, 5, 16),
                  startTime: "10:00",
                  location: "Aula 301",
                  type: "exam" as const
                }
              ].map((event) => (
                <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className={`w-2 h-12 rounded-full ${
                        event.type === 'class' ? 'bg-blue-500' : 
                        event.type === 'exam' ? 'bg-red-500' : 'bg-green-500'
                      }`} />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">{event.title}</h4>
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        <span>{event.date.toLocaleDateString('es-ES')}</span>
                        <span>•</span>
                        <span>{event.startTime}</span>
                        <span>•</span>
                        <span>{event.location}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className={getEventTypeColor(event.type)}>
                      {getEventTypeLabel(event.type)}
                    </Badge>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialog para detalles del evento */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          {selectedEvent && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>{selectedEvent.title}</span>
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Tipo</span>
                  <Badge variant="outline" className={getEventTypeColor(selectedEvent.type)}>
                    {getEventTypeLabel(selectedEvent.type)}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Curso</span>
                  <span className="text-sm">{selectedEvent.course}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Fecha</span>
                  <span className="text-sm">
                    {selectedEvent.date.toLocaleDateString('es-ES', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Horario</span>
                  <span className="text-sm">{selectedEvent.startTime} - {selectedEvent.endTime}</span>
                </div>
                
                {selectedEvent.location && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Ubicación</span>
                    <span className="text-sm">{selectedEvent.location}</span>
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Instructor</span>
                  <span className="text-sm">{selectedEvent.instructor}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Alumnos</span>
                  <span className="text-sm">
                    {selectedEvent.students}
                    {selectedEvent.maxStudents && `/${selectedEvent.maxStudents}`}
                  </span>
                </div>
                
                {selectedEvent.description && (
                  <div>
                    <span className="text-sm font-medium">Descripción</span>
                    <p className="text-sm text-muted-foreground mt-1">
                      {selectedEvent.description}
                    </p>
                  </div>
                )}
                
                <div className="flex space-x-2 pt-4">
                  <Button variant="outline" className="flex-1">
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                  <Button variant="destructive" className="flex-1">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </MainLayout>
  )
}