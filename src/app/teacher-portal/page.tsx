"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { TeacherLayout } from "@/components/layout/teacher-layout"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Users, Clock, ArrowRight, BookOpen, MapPin, Loader2 } from "lucide-react"
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

    useEffect(() => {
        if (session?.user?.id) {
            fetchCourses(session.user.id)
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
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Mis Cursos</h1>
                    <p className="text-slate-500 mt-2">Gestiona tus asignaciones docentes y comunícate con tus alumnos.</p>
                </div>

                {courses.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
                        <div className="bg-slate-100 p-4 rounded-full inline-block mb-4">
                            <BookOpen className="h-8 w-8 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-medium text-slate-900">No tienes cursos asignados</h3>
                        <p className="text-slate-500 max-w-md mx-auto mt-2">
                            Actualmente no apareces como docente principal en ningún curso activo. Contacta con administración si crees que es un error.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {courses.map(course => (
                            <Card key={course.id} className="group hover:shadow-lg transition-all duration-300 border-slate-200 overflow-hidden">
                                <div className="h-2 bg-gradient-to-r from-blue-500 to-purple-500" />
                                <CardHeader className="pb-4">
                                    <div className="flex justify-between items-start gap-4">
                                        <Badge variant="outline" className="font-mono text-xs bg-slate-50">
                                            {course.code}
                                        </Badge>
                                        {course.isActive ? (
                                            <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200 shadow-none">
                                                En curso
                                            </Badge>
                                        ) : (
                                            <Badge variant="secondary">Finalizado</Badge>
                                        )}
                                    </div>
                                    <CardTitle className="text-xl font-bold text-slate-800 line-clamp-2 mt-2 leading-tight group-hover:text-blue-700 transition-colors">
                                        {course.title}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4 pb-6">
                                    <div className="flex items-center text-sm text-slate-600 gap-2">
                                        <Calendar className="h-4 w-4 text-slate-400" />
                                        <span>
                                            {course.startDate ? new Date(course.startDate).toLocaleDateString() : 'Fecha por definir'}
                                        </span>
                                    </div>
                                    <div className="flex items-center text-sm text-slate-600 gap-2">
                                        <Users className="h-4 w-4 text-slate-400" />
                                        <span>
                                            {course._count?.enrollments || 0} Alumnos inscritos
                                        </span>
                                    </div>
                                </CardContent>
                                <CardFooter className="pt-2 pb-6">
                                    <Link href={`/teacher-portal/courses/${course.id}`} className="w-full">
                                        <Button className="w-full bg-slate-900 hover:bg-blue-600 group-hover:shadow-md transition-all">
                                            Gestionar Curso
                                            <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                        </Button>
                                    </Link>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </TeacherLayout>
    )
}
