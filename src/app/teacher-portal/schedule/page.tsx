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
    Info,
    Edit,
    User
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn, formatTimeUTC } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarDays, Save } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

interface Schedule {
    id: string
    courseId: string
    dayOfWeek: string
    startTime: string
    endTime: string
    classroom?: string
    notes?: string
    isOwn?: boolean
    isRecurring?: boolean
    subject?: string
    course: {
        title: string
        code: string
    }
    teacher?: {
        name: string
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
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null)
    const [isSaving, setIsSaving] = useState(false)
    const [allTeachers, setAllTeachers] = useState<any[]>([])

    useEffect(() => {
        if (session?.user?.id) {
            fetchSchedule(session.user.id)
            fetchTeachers()
        }
    }, [session])

    const fetchTeachers = async () => {
        try {
            const res = await fetch('/api/teachers?status=ACTIVE')
            if (res.ok) {
                const data = await res.json()
                setAllTeachers(data)
            }
        } catch (e) {
            console.error("Error loading teachers", e)
        }
    }

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

    const formatTime = (dateStr: string) => formatTimeUTC(dateStr)

    const handleEditClick = (s: Schedule) => {
        setEditingSchedule(s)
        setIsEditDialogOpen(true)
    }

    const handleSaveEdit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!editingSchedule || !session?.user?.id) return

        setIsSaving(true)
        const formData = new FormData(e.currentTarget)

        const startTimeInput = formData.get('startTime') as string
        const endTimeInput = formData.get('endTime') as string

        // Merge time into existing date if isRecurring is false
        let finalStartTime = editingSchedule.startTime
        let finalEndTime = editingSchedule.endTime

        if (!editingSchedule.isRecurring) {
            const startDate = new Date(editingSchedule.startTime)
            const [h1, m1] = startTimeInput.split(':').map(Number)
            startDate.setUTCHours(h1, m1, 0, 0)
            finalStartTime = startDate.toISOString()

            const endDate = new Date(editingSchedule.endTime)
            const [h2, m2] = endTimeInput.split(':').map(Number)
            endDate.setUTCHours(h2, m2, 0, 0)
            finalEndTime = endDate.toISOString()
        } else {
            // For recurring, we just send the time part in a 1970 date or similar, 
            // but the API expects a full Date. The utils helper might be useful.
            const d1 = new Date(0)
            const [h1, m1] = startTimeInput.split(':').map(Number)
            d1.setUTCHours(h1, m1, 0, 0)
            finalStartTime = d1.toISOString()

            const d2 = new Date(0)
            const [h2, m2] = endTimeInput.split(':').map(Number)
            d2.setUTCHours(h2, m2, 0, 0)
            finalEndTime = d2.toISOString()
        }

        const data = {
            id: editingSchedule.id,
            teacherId: formData.get('teacherId'),
            startTime: finalStartTime,
            endTime: finalEndTime,
            classroom: formData.get('classroom'),
            subject: formData.get('subject'),
            notes: formData.get('notes'),
            userId: session.user.id
        }

        try {
            const res = await fetch('/api/teacher/schedule', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })

            if (res.ok) {
                toast.success("Horario actualizado correctamente")
                setIsEditDialogOpen(false)
                fetchSchedule(session.user.id)
            } else {
                const err = await res.json()
                toast.error(err.error || "Error al actualizar el horario")
            }
        } catch (error) {
            toast.error("Error de conexión")
        } finally {
            setIsSaving(false)
        }
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
                                                        <Card key={s.id} className={cn(
                                                            "group transition-all duration-300 overflow-hidden shadow-sm hover:shadow-md border-l-4",
                                                            s.isOwn ? "border-l-red-500 hover:border-red-400" : "border-l-slate-300 hover:border-slate-400 opacity-80"
                                                        )}>
                                                            <CardContent className="p-4 space-y-3">
                                                                <div className="flex justify-between items-start">
                                                                    <div className="flex flex-col">
                                                                        <h4 className={cn(
                                                                            "font-bold text-sm leading-tight transition-colors",
                                                                            s.isOwn ? "text-slate-800 group-hover:text-red-600" : "text-slate-500"
                                                                        )}>
                                                                            {s.course.title}
                                                                        </h4>
                                                                        {s.subject && (
                                                                            <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5 italic">
                                                                                {s.subject}
                                                                            </p>
                                                                        )}
                                                                        {!s.isRecurring && (
                                                                            <p className="text-[10px] text-red-600 font-bold mt-1">
                                                                                {new Date(s.startTime).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', timeZone: 'UTC' })}
                                                                            </p>
                                                                        )}
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            className={cn(
                                                                                "h-6 px-2 mt-2 text-[10px] hover:bg-white border transition-all",
                                                                                s.isOwn
                                                                                    ? "text-red-600 hover:text-red-700 border-red-100"
                                                                                    : "text-slate-400 hover:text-slate-600 border-slate-200"
                                                                            )}
                                                                            onClick={() => handleEditClick(s)}
                                                                        >
                                                                            <Edit className="h-3 w-3 mr-1" />
                                                                            {s.isOwn ? 'Editar' : 'Gestionar'}
                                                                        </Button>
                                                                    </div>
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
    const [currentDate, setCurrentDate] = useState<Date | null>(null)

    useEffect(() => {
        setCurrentDate(new Date())
    }, [])

    if (!currentDate) return <div className="h-[400px] flex items-center justify-center">Cargando calendario...</div>

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
                                        <div
                                            key={s.id}
                                            className={cn(
                                                "text-[9px] p-1.5 rounded-md border shadow-sm leading-tight transition-all cursor-default overflow-hidden",
                                                s.isOwn
                                                    ? "bg-white border-red-200 hover:border-red-400"
                                                    : "bg-slate-50 border-slate-100 opacity-70 grayscale-[0.5]"
                                            )}
                                            title={s.isOwn ? "Tu clase" : `Clase de ${s.teacher?.name || 'compañero/a'}`}
                                            onClick={() => handleEditClick(s)}
                                        >
                                            <div className={cn("font-bold mb-0.5", s.isOwn ? "text-red-600" : "text-slate-400")}>
                                                {formatTime(s.startTime)}
                                            </div>
                                            <div className={cn("font-medium uppercase tracking-tighter truncate", s.isOwn ? "text-slate-800" : "text-slate-400")}>
                                                {s.course?.title || "Curso sin título"}
                                            </div>
                                            {s.subject && (
                                                <div className="text-[7px] text-slate-400 truncate opacity-80 uppercase leading-none mt-0.5">
                                                    {s.subject}
                                                </div>
                                            )}
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

            {/* Modal de Edición */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Edit className="h-5 w-5 text-red-600" />
                            Editar Clase
                        </DialogTitle>
                        <DialogDescription>
                            Modifica los detalles de tu sesión programada.
                        </DialogDescription>
                    </DialogHeader>
                    {editingSchedule && (
                        <form onSubmit={handleSaveEdit} className="space-y-4 py-4">
                            <div className="grid gap-2">
                                <Label className="text-slate-500 text-xs font-bold uppercase">Curso</Label>
                                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-sm font-semibold text-slate-700">
                                    {editingSchedule.course.title}
                                </div>
                            </div>

                            {!editingSchedule.isRecurring && (
                                <div className="grid gap-2">
                                    <Label className="text-slate-500 text-xs font-bold uppercase">Fecha</Label>
                                    <div className="p-3 bg-red-50 rounded-lg border border-red-100 text-sm font-bold text-red-700">
                                        {new Date(editingSchedule.startTime).toLocaleDateString('es-ES', {
                                            weekday: 'long',
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric',
                                            timeZone: 'UTC'
                                        })}
                                    </div>
                                </div>
                            )}

                            <div className="grid gap-2">
                                <Label className="text-slate-500 text-xs font-bold uppercase">Profesor Docente</Label>
                                <select
                                    name="teacherId"
                                    className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    defaultValue={editingSchedule.teacherId || ""}
                                >
                                    <option value="" disabled>Selecciona un profesor</option>
                                    {allTeachers.map(t => (
                                        <option key={t.id} value={t.id}>{t.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="startTime">Hora Inicio</Label>
                                    <Input
                                        id="startTime"
                                        name="startTime"
                                        type="time"
                                        defaultValue={formatTime(editingSchedule.startTime)}
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="endTime">Hora Fin</Label>
                                    <Input
                                        id="endTime"
                                        name="endTime"
                                        type="time"
                                        defaultValue={formatTime(editingSchedule.endTime)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="subject">Asignatura / Módulo</Label>
                                <Input
                                    id="subject"
                                    name="subject"
                                    defaultValue={editingSchedule.subject}
                                    placeholder="Ej: Legislación Sanitaria"
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="classroom">Aula</Label>
                                <Input
                                    id="classroom"
                                    name="classroom"
                                    defaultValue={editingSchedule.classroom}
                                    placeholder="Ej: Online, Aula 4"
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="notes">Notas</Label>
                                <Input
                                    id="notes"
                                    name="notes"
                                    defaultValue={editingSchedule.notes}
                                    placeholder="Indicaciones adicionales..."
                                />
                            </div>

                            <DialogFooter className="pt-4 gap-2">
                                <Button type="button" variant="ghost" onClick={() => setIsEditDialogOpen(false)} disabled={isSaving}>
                                    Cancelar
                                </Button>
                                <Button type="submit" className="bg-red-600 hover:bg-red-700 shadow-md shadow-red-100" disabled={isSaving}>
                                    {isSaving ? (
                                        <>
                                            <div className="h-4 w-4 border-2 border-white/30 border-t-white animate-spin rounded-full mr-2" />
                                            Guardando...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="h-4 w-4 mr-2" />
                                            Guardar Cambios
                                        </>
                                    )}
                                </Button>
                            </DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>
        </Card>
    )
}
