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

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
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

    const getSchedulesForDay = (day: string) => {
        return schedules.filter(s => s.dayOfWeek === day)
    }

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr)
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
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
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                            <CalendarIcon className="h-8 w-8 text-blue-600" />
                            Mi Agenda Semanal
                        </h1>
                        <p className="text-slate-500 mt-2">Consulta tus clases programadas para esta semana deportiva o académica.</p>
                    </div>
                </div>

                {schedules.length === 0 ? (
                    <Card className="bg-white border-dashed border-slate-300">
                        <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="bg-slate-100 p-4 rounded-full mb-4">
                                <Info className="h-8 w-8 text-slate-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900">No hay clases programadas</h3>
                            <p className="text-slate-500 max-w-sm mt-2">
                                Actualmente no tienes asignado ningún horario fijo. Contacta con coordinación si esperas tener clases.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
                        {DAYS.map((day) => {
                            const daySchedules = getSchedulesForDay(day)
                            return (
                                <div key={day} className="flex flex-col gap-4">
                                    <div className="flex items-center justify-between lg:justify-center p-3 bg-white border border-slate-200 rounded-xl shadow-sm">
                                        <span className="font-bold text-slate-900">{day}</span>
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
                                                <Card key={s.id} className="group hover:border-blue-400 transition-all duration-300 overflow-hidden shadow-sm hover:shadow-md">
                                                    <div className="h-1.5 bg-blue-500" />
                                                    <CardContent className="p-4 space-y-3">
                                                        <div className="flex items-start justify-between gap-2">
                                                            <h4 className="font-bold text-slate-800 text-sm leading-tight group-hover:text-blue-700 transition-colors">
                                                                {s.course.title}
                                                            </h4>
                                                        </div>

                                                        <div className="space-y-1.5">
                                                            <div className="flex items-center text-[11px] font-medium text-blue-700 bg-blue-50 px-2 py-1 rounded-md w-fit gap-1.5">
                                                                <Clock className="h-3 w-3" />
                                                                {formatTime(s.startTime)} - {formatTime(s.endTime)}
                                                            </div>
                                                            {s.classroom && (
                                                                <div className="flex items-center text-[11px] text-slate-500 gap-1.5 pl-2">
                                                                    <MapPin className="h-3 w-3 text-slate-400" />
                                                                    <span>Aula: {s.classroom}</span>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {s.notes && (
                                                            <p className="text-[10px] text-slate-400 italic line-clamp-2 pt-1 border-t border-slate-50">
                                                                {s.notes}
                                                            </p>
                                                        )}
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

                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6">
                    <div className="bg-white p-3 rounded-xl shadow-sm">
                        <CalendarIcon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                        <h4 className="text-blue-900 font-bold">Importante</h4>
                        <p className="text-blue-700 text-sm">
                            Este horario es fijo y recursivo. Si hay algún cambio puntual de última hora por festivos o eventos especiales,
                            se te notificará a través del sistema de avisos.
                        </p>
                    </div>
                </div>
            </div>
        </TeacherLayout>
    )
}
