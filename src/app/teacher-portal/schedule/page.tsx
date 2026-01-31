"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { TeacherLayout } from "@/components/layout/teacher-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    Calendar as CalendarIcon,
    Clock,
    MapPin,
    ChevronLeft,
    ChevronRight,
    BookOpen,
    Info
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarDays } from "lucide-react"

interface Schedule {
    id: string
    courseId: string
    dayOfWeek: string
    startTime: string
    endTime: string
    classroom?: string
    notes?: string
    course: {
        title: string
        color?: string
    }
}

const DAYS_MAP: Record<string, string> = {
    'MONDAY': 'Lunes', 'TUESDAY': 'Martes', 'WEDNESDAY': 'Miércoles',
    'THURSDAY': 'Jueves', 'FRIDAY': 'Viernes', 'SATURDAY': 'Sábado', 'SUNDAY': 'Domingo'
}
const DAYS_ORDER = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']
const HOURS = Array.from({ length: 15 }, (_, i) => i + 8) // 8:00 to 22:00

export default function TeacherSchedulePage() {
    const { data: session } = useSession()
    const [schedules, setSchedules] = useState<Schedule[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (session?.user?.id) {
            fetchSchedule(session.user.id)
        }
    }, [session])

    const fetchSchedule = async (userId: string) => {
        try {
            const res = await fetch(`/api/teacher/schedule?userId=${userId}`)
            if (res.ok) {
                const data = await res.json()
                setSchedules(data)
            }
        } catch (e) {
            console.error("Error loading schedule", e)
        } finally {
            setLoading(false)
        }
    }

    const getSchedulesForDay = (dayKey: string) => {
        return schedules.filter(s => s.dayOfWeek === dayKey)
    }

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr)
        // Usar métodos UTC para evitar desfases de zona horaria si el usuario lo pide expresamente
        const hours = date.getUTCHours().toString().padStart(2, '0')
        const minutes = date.getUTCMinutes().toString().padStart(2, '0')
        return `${hours}:${minutes}`
    }

    if (loading) {
        return (
            <TeacherLayout>
                <div className="flex h-[50vh] items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <div className="h-12 w-12 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin" />
                        <p className="text-slate-500 font-medium animate-pulse">Cargando tu agenda...</p>
                    </div>
                </div>
            </TeacherLayout>
        )
    }

    return (
        <TeacherLayout>
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                            <CalendarIcon className="h-8 w-8 text-red-600" />
                            Mi Agenda Docente
                        </h1>
                        <p className="text-slate-500 mt-2">Consulta y gestiona tus clases programadas.</p>
                    </div>
                </div>

                <Tabs defaultValue="weekly" className="space-y-6">
                    <TabsList className="bg-slate-100 p-1 rounded-xl">
                        <TabsTrigger value="weekly" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm px-6">
                            <CalendarDays className="h-4 w-4 mr-2" />
                            Vista Semanal
                        </TabsTrigger>
                        <TabsTrigger value="monthly" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm px-6">
                            <CalendarIcon className="h-4 w-4 mr-2" />
                            Vista Mensual
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="weekly">
                        {schedules.length === 0 ? (
                            <Card className="bg-white border-dashed border-slate-300">
                                <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                                    <div className="bg-slate-100 p-4 rounded-full mb-4">
                                        <Info className="h-8 w-8 text-slate-400" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-slate-900">No hay clases programadas</h3>
                                    <p className="text-slate-500 max-w-sm mt-2">
                                        Actualmente no tienes asignado ningún horario fijo.
                                    </p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
                                {DAYS_ORDER.map((dayKey) => {
                                    const daySchedules = getSchedulesForDay(dayKey)
                                    return (
                                        <div key={dayKey} className="flex flex-col gap-4">
                                            <div className="flex items-center justify-between lg:justify-center p-3 bg-white border border-slate-200 rounded-xl shadow-sm">
                                                <span className="font-bold text-slate-900">{DAYS_MAP[dayKey]}</span>
                                                <Badge variant="secondary" className="lg:hidden">
                                                    {daySchedules.length} clases
                                                </Badge>
                                            </div>

                                            <div className="space-y-3">
                                                {daySchedules.length === 0 ? (
                                                    <div className="hidden lg:flex flex-col items-center justify-center py-10 opacity-20">
                                                        <div className="h-1.5 w-8 bg-slate-200 rounded-full" />
                                                    </div>
                                                ) : (
                                                    daySchedules.map((s) => (
                                                        <Card key={s.id} className="group hover:border-red-400 transition-all duration-300 overflow-hidden shadow-sm hover:shadow-md">
                                                            <div className="h-1.5 bg-red-500" />
                                                            <CardContent className="p-4 space-y-3">
                                                                <h4 className="font-bold text-slate-800 text-sm leading-tight group-hover:text-red-600 transition-colors">
                                                                    {s.course.title}
                                                                </h4>
                                                                <div className="space-y-1.5">
                                                                    <div className="flex items-center text-[11px] font-medium text-red-700 bg-red-50 px-2 py-1 rounded-md w-fit gap-1.5">
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
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="monthly">
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
                        <Button variant="outline" size="icon" onClick={prevMonth} className="h-8 w-8 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors">
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" onClick={nextMonth} className="h-8 w-8 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors">
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
                    {Array.from({ length: offset }).map((_, i) => (
                        <div key={`offset-${i}`} className="min-h-[120px] bg-slate-50/30 border-r border-b border-slate-100" />
                    ))}

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
                                        <div key={s.id} className="text-[10px] p-1.5 rounded-md bg-white border border-slate-200 shadow-sm leading-tight hover:border-red-200 transition-all cursor-default overflow-hidden whitespace-nowrap overflow-ellipsis">
                                            <div className="font-bold text-red-600 mb-0.5">
                                                {formatTime(s.startTime)}
                                            </div>
                                            <div className="font-medium text-slate-800 uppercase tracking-tighter truncate">{s.course.title}</div>
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
