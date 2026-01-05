"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BookOpen, Clock, Users, Euro, Calendar, CheckCircle, MessageSquare } from "lucide-react"

interface PublicCourse {
    title: string
    description?: string
    code: string
    level: string
    duration: number
    price: number
    startDate?: string
    teacher?: { name: string }
}

export default function PublicCoursePage() {
    const params = useParams()
    const [course, setCourse] = useState<PublicCourse | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const response = await fetch(`/api/public/course/${params.id}`)
                if (response.ok) {
                    const data = await response.json()
                    setCourse(data)
                }
            } catch (error) {
                console.error("Error fetching public course:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchCourse()
    }, [params.id])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-pulse flex flex-col items-center gap-4">
                    <div className="h-12 w-12 bg-blue-200 rounded-full"></div>
                    <div className="h-4 w-48 bg-slate-200 rounded"></div>
                </div>
            </div>
        )
    }

    if (!course) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
                <Card className="max-w-md w-full text-center p-8">
                    <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <BookOpen className="h-8 w-8 text-red-500" />
                    </div>
                    <CardTitle className="text-2xl font-bold">Curso no encontrado</CardTitle>
                    <CardDescription className="mt-2">
                        El enlace que has seguido puede estar roto o el curso ya no está disponible.
                    </CardDescription>
                    <Button className="mt-6 w-full bg-blue-600" onClick={() => window.location.href = '/'}>
                        Ir a la web principal
                    </Button>
                </Card>
            </div>
        )
    }

    const handleInterest = () => {
        const message = `Hola! Estoy interesado en el curso: ${course.title} (${course.code}). ¿Podríais darme más información?`
        window.open(`https://wa.me/34600000000?text=${encodeURIComponent(message)}`, '_blank')
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-12">
            {/* Header Visual */}
            <div className="bg-gradient-to-br from-blue-700 to-indigo-800 text-white h-64 flex items-end relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <BookOpen className="h-64 w-64" />
                </div>
                <div className="container mx-auto px-4 pb-8 relative z-10">
                    <Badge className="bg-blue-400/30 text-white border-blue-400/50 mb-3 px-3 py-1 text-xs">
                        INFORMACIÓN DEL CURSO
                    </Badge>
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">{course.title}</h1>
                    <p className="text-blue-100 text-lg mt-2 font-mono uppercase tracking-widest">{course.code}</p>
                </div>
            </div>

            <div className="container mx-auto px-4 -mt-10 relative z-20">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Info */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="border-none shadow-xl shadow-slate-200/60 overflow-hidden">
                            <CardHeader className="bg-white border-b border-slate-50">
                                <div className="flex items-center gap-2 text-slate-400 text-sm font-bold uppercase tracking-wider">
                                    <CheckCircle className="h-4 w-4 text-green-500" /> Detalles del programa
                                </div>
                            </CardHeader>
                            <CardContent className="p-8">
                                <p className="text-slate-600 text-lg leading-relaxed whitespace-pre-wrap">
                                    {course.description || "Este programa formativo ofrece una capacitación completa y actualizada para profesionales del sector. Contacta con nosotros para recibir el temario detallado."}
                                </p>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mt-12">
                                    <div className="flex items-start space-x-4">
                                        <div className="p-3 bg-blue-50 rounded-2xl"><Clock className="h-6 w-6 text-blue-600" /></div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-400 uppercase">Duración Total</p>
                                            <p className="text-xl font-bold text-slate-800">{course.duration} horas lectivas</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-4">
                                        <div className="p-3 bg-indigo-50 rounded-2xl"><Calendar className="h-6 w-6 text-indigo-600" /></div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-400 uppercase">Inicio previsto</p>
                                            <p className="text-xl font-bold text-slate-800">
                                                {course.startDate ? new Date(course.startDate).toLocaleDateString() : 'Próximamente'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar CTA */}
                    <div className="space-y-6">
                        <Card className="border-none shadow-2xl bg-white sticky top-6">
                            <CardContent className="p-8">
                                <div className="text-center mb-6">
                                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Inversión del curso</p>
                                    <div className="flex items-center justify-center mt-1">
                                        <span className="text-4xl font-extrabold text-slate-900 mx-2">€{course.price.toFixed(2)}</span>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-6 border-t border-slate-100">
                                    <div className="flex items-center gap-3 text-slate-600 text-sm">
                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                        <span>Certificado oficial</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-slate-600 text-sm">
                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                        <span>Materiales incluidos</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-slate-600 text-sm">
                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                        <span>Docente: {course.teacher?.name || 'Experto'}</span>
                                    </div>
                                </div>

                                <Button className="w-full h-14 mt-8 bg-green-600 hover:bg-green-700 text-white font-bold text-lg rounded-2xl shadow-lg shadow-green-200 transition-all active:scale-[0.98]" onClick={handleInterest}>
                                    <MessageSquare className="mr-2 h-5 w-5" /> Consultar por WhatsApp
                                </Button>

                                <p className="text-center text-xs text-slate-400 mt-6">
                                    UGT Sanidad Salamanca - Formación para el empleo
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
