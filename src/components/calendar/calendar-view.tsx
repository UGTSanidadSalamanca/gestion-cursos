"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  Clock, 
  MapPin, 
  Users,
  BookOpen,
  Plus
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
}

interface CalendarViewProps {
  events?: CalendarEvent[]
  onEventClick?: (event: CalendarEvent) => void
  onDateClick?: (date: Date) => void
}

export function CalendarView({ events = [], onEventClick, onDateClick }: CalendarViewProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date())

  // Mock data para demostración
  const mockEvents: CalendarEvent[] = [
    {
      id: "1",
      title: "JavaScript Avanzado - Clase 1",
      course: "JavaScript Avanzado",
      date: new Date(2024, 5, 15),
      startTime: "09:00",
      endTime: "12:00",
      location: "Aula 101",
      instructor: "Juan Pérez",
      students: 25,
      maxStudents: 30,
      type: "class"
    },
    {
      id: "2",
      title: "React Native - Clase 3",
      course: "React Native",
      date: new Date(2024, 5, 15),
      startTime: "14:00",
      endTime: "17:00",
      location: "Aula 205",
      instructor: "María García",
      students: 20,
      maxStudents: 25,
      type: "class"
    },
    {
      id: "3",
      title: "Examen Final - Diseño Web",
      course: "Diseño Web",
      date: new Date(2024, 5, 16),
      startTime: "10:00",
      endTime: "12:00",
      location: "Aula 301",
      instructor: "Carlos López",
      students: 18,
      maxStudents: 20,
      type: "exam"
    },
    {
      id: "4",
      title: "Reunión de Instructores",
      course: "Reunión Mensual",
      date: new Date(2024, 5, 17),
      startTime: "16:00",
      endTime: "18:00",
      location: "Sala de Reuniones",
      instructor: "Administración",
      students: 8,
      type: "meeting"
    },
    {
      id: "5",
      title: "Python Backend - Clase 5",
      course: "Python Backend",
      date: new Date(2024, 5, 18),
      startTime: "09:00",
      endTime: "12:00",
      location: "Aula 102",
      instructor: "Ana Martínez",
      students: 22,
      maxStudents: 25,
      type: "class"
    }
  ]

  const allEvents = events.length > 0 ? events : mockEvents

  const getEventsForDate = (date: Date) => {
    return allEvents.filter(event => {
      const eventDate = new Date(event.date)
      return eventDate.toDateString() === date.toDateString()
    })
  }

  const getEventsForMonth = () => {
    const monthEvents: { [key: string]: CalendarEvent[] } = {}
    
    allEvents.forEach(event => {
      const dateKey = event.date.toDateString()
      if (!monthEvents[dateKey]) {
        monthEvents[dateKey] = []
      }
      monthEvents[dateKey].push(event)
    })
    
    return monthEvents
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

  const getEventTypeIcon = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'class':
        return <BookOpen className="h-4 w-4" />
      case 'exam':
        return <Calendar className="h-4 w-4" />
      case 'meeting':
        return <Users className="h-4 w-4" />
      case 'event':
        return <Calendar className="h-4 w-4" />
      default:
        return <Calendar className="h-4 w-4" />
    }
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth)
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1)
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1)
    }
    setCurrentMonth(newMonth)
  }

  const monthEvents = getEventsForMonth()

  return (
    <div className="space-y-6">
      {/* Header con controles */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Calendario de Cursos</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="font-medium">
                {currentMonth.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
              </span>
              <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Evento
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Vista principal */}
      <Tabs defaultValue="month" className="space-y-4">
        <TabsList>
          <TabsTrigger value="month">Vista Mensual</TabsTrigger>
          <TabsTrigger value="week">Vista Semanal</TabsTrigger>
          <TabsTrigger value="day">Vista Diaria</TabsTrigger>
        </TabsList>

        <TabsContent value="month" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-3">
            {/* Calendario */}
            <Card className="md:col-span-2">
              <CardContent className="p-0">
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    if (date) {
                      setSelectedDate(date)
                      onDateClick?.(date)
                    }
                  }}
                  month={currentMonth}
                  onMonthChange={setCurrentMonth}
                  className="rounded-md border-0"
                  components={{
                    DayContent: ({ date, ...props }) => {
                      const dateEvents = getEventsForDate(date)
                      const hasEvents = dateEvents.length > 0
                      
                      return (
                        <div className="relative w-full">
                          <div
                            {...props}
                            className={`relative w-full p-2 text-center text-sm ${
                              hasEvents ? 'bg-blue-50 font-semibold' : ''
                            }`}
                          >
                            {date.getDate()}
                            {hasEvents && (
                              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 flex space-x-1">
                                {dateEvents.slice(0, 3).map((_, index) => (
                                  <div
                                    key={index}
                                    className="w-1 h-1 rounded-full bg-blue-500"
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    }
                  }}
                />
              </CardContent>
            </Card>

            {/* Eventos del día seleccionado */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {selectedDate.toLocaleDateString('es-ES', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {getEventsForDate(selectedDate).length > 0 ? (
                    getEventsForDate(selectedDate).map((event) => (
                      <div
                        key={event.id}
                        className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => onEventClick?.(event)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-sm">{event.title}</h4>
                          <Badge variant="outline" className={getEventTypeColor(event.type)}>
                            {getEventTypeIcon(event.type)}
                            <span className="ml-1 text-xs">
                              {event.type === 'class' ? 'Clase' : 
                               event.type === 'exam' ? 'Examen' : 
                               event.type === 'meeting' ? 'Reunión' : 'Evento'}
                            </span>
                          </Badge>
                        </div>
                        
                        <div className="space-y-1 text-xs text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{event.startTime} - {event.endTime}</span>
                          </div>
                          {event.location && (
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-3 w-3" />
                              <span>{event.location}</span>
                            </div>
                          )}
                          <div className="flex items-center space-x-1">
                            <Users className="h-3 w-3" />
                            <span>{event.students}{event.maxStudents ? `/${event.maxStudents}` : ''} alumnos</span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No hay eventos programados para este día
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="week" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Vista Semanal</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Vista semanal en desarrollo...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="day" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Vista Diaria</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Vista diaria en desarrollo...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}