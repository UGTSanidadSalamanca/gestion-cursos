"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { TeacherLayout } from "@/components/layout/teacher-layout"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Users, Clock, ArrowRight, BookOpen, MapPin, Loader2, CalendarDays, ChevronLeft, ChevronRight } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"

interface Course {
    id: string
    title: string
    code: string
    startDate?: string
    endDate?: string
    status?: string // Calculated or from isActive
    isActive: boolean
    _count?: {
        enrollments: number
    }
}

export default function TeacherPortalPage() {
    const { data: session } = useSession()
    const [courses, setCourses] = useState<Course[]>([])
    const [loading, setLoading] = useState(true)
    const [schedules, setSchedules] = useState<any[]>([])
    const [schedulesLoading, setSchedulesLoading] = useState(false)

    useEffect(() => {
        if (session?.user?.id) {
            fetchCourses(session.user.id)
            fetchSchedules(session.user.id)
        }
    }, [session])

    const fetchCourses = async (userId: string) => {
        try {
            const res = await fetch(`/api/teacher/courses?userId=${userId}`)
            if (res.ok) {
                const data = await res.json()
                setCourses(data)
            }
        } catch (e) {
            console.error("Error loading courses", e)
        } finally {
            setLoading(false)
        }
    }

    const fetchSchedules = async (userId: string) => {
        setSchedulesLoading(true)
        try {
            const res = await fetch(`/api/teacher/schedule?userId=${userId}`)
            if (res.ok) {
                const data = await res.json()
                setSchedules(data)
            }
        } catch (e) {
            console.error("Error loading schedules", e)
        } finally {
            setSchedulesLoading(false)
        }
    }

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr)
        const hours = date.getUTCHours().toString().padStart(2, '0')
        const minutes = date.getUTCMinutes().toString().padStart(2, '0')
        return `${hours}:${minutes}`
    }

    const daysMap: Record<string, string> = {
        'MONDAY': 'Lunes', 'TUESDAY': 'Martes', 'WEDNESDAY': 'Miércoles',
        'THURSDAY': 'Jueves', 'FRIDAY': 'Viernes', 'SATURDAY': 'Sábado', 'SUNDAY': 'Domingo'
    }

    const daysOrder = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']

    if (loading) {
        return (
            <TeacherLayout>
                <div className="flex h-[50vh] items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <div className="h-12 w-12 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin" />
                        <p className="text-slate-500 font-medium animate-pulse">Cargando tus cursos...</p>
                    </div>
                </div>
            </TeacherLayout>
        )
    }

    return (
        <TeacherLayout>
            <div className="space-y-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Portal Docente</h1>
                        <p className="text-slate-500 mt-2">Bienvenido/a. Gestiona tus cursos y consulta tu agenda de clases.</p>
                    </div>
                </div>

                <Tabs defaultValue="courses" className="space-y-6">
                    <TabsList className="bg-slate-100 p-1 rounded-xl">
                        <TabsTrigger value="courses" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm px-6">
                            <BookOpen className="h-4 w-4 mr-2" />
                            Mis Cursos
                        </TabsTrigger>
                        <TabsTrigger value="agenda" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm px-6">
                            <CalendarDays className="h-4 w-4 mr-2" />
                            Mi Agenda Semanal
                        </TabsTrigger>
                        <TabsTrigger value="calendar" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm px-6">
                            <Calendar className="h-4 w-4 mr-2" />
                            Mi Calendario Mensual
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="courses">
                        {courses.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
                                <div className="bg-slate-100 p-4 rounded-full inline-block mb-4">
                                    <BookOpen className="h-8 w-8 text-slate-400" />
                                </div>
                                <h3 className="text-lg font-medium text-slate-900">No tienes cursos asignados</h3>
                                <p className="text-slate-500 max-w-md mx-auto mt-2">
                                    Actualmente no apareces como docente en ningún curso activo.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {courses.map(course => (
                                    <Card key={course.id} className="group hover:shadow-lg transition-all duration-300 border-slate-200 overflow-hidden">
                                        <div className="h-2 bg-gradient-to-r from-red-500 to-red-600" />
                                        <CardHeader className="pb-4">
                                            <div className="flex justify-between items-start gap-4">
                                                <Badge variant="outline" className="font-mono text-xs bg-slate-50">
                                                    {course.code}
                                                </Badge>
                                                {course.isActive ? (
                                                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200 shadow-none">
                                                        Activo
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="secondary">Finalizado</Badge>
                                                )}
                                            </div>
                                            <CardTitle className="text-xl font-bold text-slate-800 line-clamp-2 mt-2 leading-tight group-hover:text-red-600 transition-colors">
                                                {course.title}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4 pb-6">
                                            <div className="flex items-center text-sm text-slate-600 gap-2">
                                                <Calendar className="h-4 w-4 text-slate-400" />
                                                <span>
                                                    {course.startDate ? new Date(course.startDate).toLocaleDateString() : 'Por definir'}
                                                </span>
                                            </div>
                                            <div className="flex items-center text-sm text-slate-600 gap-2">
                                                <Users className="h-4 w-4 text-slate-400" />
                                                <span>
                                                    {course._count?.enrollments || 0} Alumnos matriculados
                                                </span>
                                            </div>
                                        </CardContent>
                                        <CardFooter className="pt-2 pb-6">
                                            <Link href={`/teacher-portal/courses/${course.id}`} className="w-full">
                                                <Button className="w-full bg-slate-900 hover:bg-red-600 group-hover:shadow-md transition-all">
                                                    Gestionar Alumnos
                                                    <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                                </Button>
                                            </Link>
                                        </CardFooter>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="agenda">
                        {/* Weekly agenda content stays the same */}
                        <div className="grid grid-cols-1 gap-6">
                            {daysOrder.map(dayKey => {
                                const daySchedules = schedules.filter(s => {
                                    if (s.isRecurring) return s.dayOfWeek === dayKey;
                                    // Para no recurrentes en vista semanal, podríamos mostrar solo las de la semana actual
                                    // Pero para simplificar y que vean "sus días", mostramos todas las que caigan en ese día de la semana
                                    return s.dayOfWeek === dayKey;
                                });
                                if (daySchedules.length === 0) return null;

                                return (
                                    <div key={dayKey} className="space-y-4">
                                        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                            <div className="w-2 h-6 bg-red-600 rounded-full" />
                                            {daysMap[dayKey]}
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {daySchedules.map((s) => (
                                                <Card key={s.id} className={cn(
                                                    "group transition-all duration-300 overflow-hidden shadow-sm hover:shadow-md border-l-4",
                                                    s.isOwn ? "border-l-red-500 hover:border-red-400" : "border-l-slate-300 hover:border-slate-400 opacity-80"
                                                )}>
                                                    <CardContent className="p-4 space-y-3">
                                                        <div className="flex justify-between items-start">
                                                            <h4 className={cn(
                                                                "font-bold text-sm leading-tight transition-colors",
                                                                s.isOwn ? "text-slate-800 group-hover:text-red-600" : "text-slate-500"
                                                            )}>
                                                                {s.course.title}
                                                            </h4>
                                                            {!s.isOwn && (
                                                                <Badge variant="outline" className="text-[9px] py-0 h-4 bg-slate-50 text-slate-400 border-slate-200">
                                                                    {s.teacher?.name || 'Compañero/a'}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <div className="space-y-1.5">
                                                            <div className={cn(
                                                                "flex items-center text-[11px] font-medium px-2 py-1 rounded-md w-fit gap-1.5",
                                                                s.isOwn ? "text-red-700 bg-red-50" : "text-slate-600 bg-slate-100"
                                                            )}>
                                                                <Clock className="h-3 w-3" />
                                                                {formatTime(s.startTime)} - {formatTime(s.endTime)}
                                                            </div>
                                                            {s.classroom && (
                                                                <div className="flex items-center text-[11px] text-slate-500 gap-1.5 pl-2">
                                                                    <MapPin className="h-3 w-3 text-slate-400" />
                                                                    <span>{s.classroom}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                            {/* Empty/Loading states stay here */}
                            {schedules.length === 0 && !schedulesLoading && (
                                <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
                                    <CalendarDays className="h-10 w-10 text-slate-300 mx-auto mb-4" />
                                    <p className="text-slate-500">No tienes clases programadas en tu agenda semanal.</p>
                                </div>
                            )}
                            {schedulesLoading && (
                                <div className="flex justify-center py-20">
                                    <Loader2 className="h-8 w-8 animate-spin text-red-600" />
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="calendar">
                        <MonthlyCalendar schedules={schedules} formatTime={formatTime} />
                    </TabsContent>
                </Tabs>
            </div>
        </TeacherLayout>
    )
}
const MonthlyCalendar = ({ schedules, formatTime }: { schedules: any[], formatTime: (s: string) => string }) => {
    const [currentDate, setCurrentDate] = useState(new Date())

    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    const monthName = new Intl.DateTimeFormat('es-ES', { month: 'long' }).format(currentDate)
    const firstDayOfMonth = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    // Adjust first day to start from Monday (0: Monday, ..., 6: Sunday)
    const offset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1

    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1))

    const dayNames = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
    const dayEnums = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']

    return (
        <Card className="border-slate-200 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50 border-b border-slate-200">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-bold text-slate-800 capitalize">
                        {monthName} {year}
                    </CardTitle>
                    <div className="flex gap-2">
                        <Button variant="outline" size="icon" onClick={prevMonth} className="h-8 w-8 rounded-lg">
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" onClick={nextMonth} className="h-8 w-8 rounded-lg">
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/50">
                    {dayNames.map(d => (
                        <div key={d} className="py-3 text-center text-xs font-bold text-slate-500 uppercase tracking-widest">{d}</div>
                    ))}
                </div>
                <div className="grid grid-cols-7">
                    {/* Offset days */}
                    {Array.from({ length: offset }).map((_, i) => (
                        <div key={`offset-${i}`} className="min-h-[120px] bg-slate-50/30 border-r border-b border-slate-100" />
                    ))}

                    {/* Month days */}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                        const dayNum = i + 1
                        const date = new Date(year, month, dayNum)
                        const dayOfWeekEnum = dayEnums[date.getDay() === 0 ? 6 : date.getDay() - 1]

                        const daySchedules = schedules.filter(s => {
                            if (s.isRecurring) {
                                return s.dayOfWeek === dayOfWeekEnum
                            } else {
                                const sDate = new Date(s.startTime)
                                return sDate.getDate() === date.getDate() &&
                                    sDate.getMonth() === date.getMonth() &&
                                    sDate.getFullYear() === date.getFullYear()
                            }
                        })
                        const isToday = new Date().toDateString() === date.toDateString()

                        return (
                            <div key={dayNum} className={`min-h-[120px] p-2 border-r border-b border-slate-100 group hover:bg-slate-50/50 transition-colors ${isToday ? 'bg-red-50/20' : ''}`}>
                                <div className="flex justify-between items-center mb-2">
                                    <span className={`text-sm font-bold ${isToday ? 'bg-red-600 text-white w-6 h-6 flex items-center justify-center rounded-full' : 'text-slate-400'}`}>
                                        {dayNum}
                                    </span>
                                </div>
                                <div className="space-y-1">
                                    {daySchedules.map(s => (
                                        <div
                                            key={s.id}
                                            className={cn(
                                                "text-[9px] p-1.5 rounded-md border shadow-sm leading-tight transition-all cursor-default overflow-hidden",
                                                s.isOwn
                                                    ? "bg-white border-red-200 hover:border-red-400"
                                                    : "bg-slate-50 border-slate-100 opacity-70 grayscale-[0.5]"
                                            )}
                                            title={s.isOwn ? "Tu clase" : `Clase de ${s.teacher?.name || 'compañero/a'}`}
                                        >
                                            <div className={cn("font-bold mb-0.5", s.isOwn ? "text-red-600" : "text-slate-400")}>
                                                {formatTime(s.startTime)}
                                            </div>
                                            <div className={cn("font-medium uppercase tracking-tighter truncate", s.isOwn ? "text-slate-800" : "text-slate-400")}>
                                                {s.course.title}
                                            </div>
                                            {!s.isOwn && (
                                                <div className="mt-0.5 text-[8px] text-slate-400 italic truncate border-t border-slate-100 pt-0.5">
                                                    {s.teacher?.name || 'Compañero/a'}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </CardContent>
        </Card>
    )
}
