"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BookOpen, Clock, Users, Euro, Calendar, CheckCircle, MessageSquare, ShieldCheck, ExternalLink, Printer } from "lucide-react"

interface PublicCourse {
    title: string
    description?: string
    publicDescription?: string
    benefits?: string
    code: string
    level: string
    duration: number
    price: number
    affiliatePrice?: number
    startDate?: string
    features?: string
    callUrl?: string
    hasCertificate?: boolean
    hasMaterials?: boolean
    teacher?: { name: string }
    modules?: {
        title: string
        description?: string
        teacher?: { name: string }
    }[]
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
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="flex flex-col items-center gap-6">
                    <div className="relative h-20 w-20">
                        <img src="/logo-ugt.png" alt="Logo UGT" className="h-20 w-20 animate-pulse object-contain" />
                    </div>
                    <div className="flex flex-col items-center">
                        <p className="text-xl font-black text-slate-800 tracking-tighter uppercase">Formación UGT</p>
                        <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Salamanca</span>
                    </div>
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
        const message = `¡Hola! Estoy interesado en el curso: ${course.title} (${course.code}). ¿Podríais enviarme más información?`
        window.open(`https://wa.me/34600437134?text=${encodeURIComponent(message)}`, '_blank')
    }

    const benefitsList = course.benefits ? course.benefits.split(/,|\n/).map(b => b.trim()).filter(b => b !== "") : []

    return (
        <div id="public-course-landing" className="min-h-screen bg-slate-50 pb-12">
            {/* Header Visual */}
            <div className="bg-gradient-to-br from-blue-700 to-indigo-800 text-white h-72 flex items-end relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <BookOpen className="h-80 w-80" />
                </div>
                {/* Botón Imprimir Flotante (no-print) */}
                <div className="absolute top-6 right-6 no-print">
                    <Button
                        variant="outline"
                        size="sm"
                        className="bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-md"
                        onClick={() => window.print()}
                    >
                        <Printer className="h-4 w-4 mr-2" /> Imprimir Ficha
                    </Button>
                </div>
                <div className="container mx-auto px-4 pb-12 relative z-10">
                    <Badge className="bg-blue-400/30 text-white border-blue-400/50 mb-3 px-3 py-1 text-xs">
                        PROGRAMA FORMATIVO
                    </Badge>
                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight max-w-4xl leading-tight">
                        {course.title}
                    </h1>
                    <div className="flex flex-wrap items-center gap-3 mt-4">
                        <Badge variant="outline" className="border-blue-300/30 text-blue-100 font-bold px-3 py-1">
                            CODE: {course.code}
                        </Badge>
                        <span className="text-blue-200/50">|</span>
                        <Badge className="bg-white/10 hover:bg-white/20 text-white border-transparent backdrop-blur-sm">
                            NIVEL {course.level}
                        </Badge>
                        {course.startDate && (
                            <>
                                <span className="text-blue-200/50">|</span>
                                <div className="flex items-center gap-2 text-blue-100 text-sm font-medium">
                                    <Calendar className="h-4 w-4" />
                                    <span>Inicio: {new Date(course.startDate).toLocaleDateString()}</span>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 -mt-10 relative z-20">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Info */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="border-none shadow-xl shadow-slate-200/60 overflow-hidden">
                            <CardHeader className="bg-white border-b border-slate-50">
                                <div className="flex items-center gap-2 text-slate-400 text-sm font-bold uppercase tracking-wider">
                                    <ShieldCheck className="h-4 w-4 text-blue-500" /> Descripción del programa
                                </div>
                            </CardHeader>
                            <CardContent className="p-8">
                                <p className="text-slate-600 text-lg leading-relaxed whitespace-pre-wrap">
                                    {course.publicDescription || course.description || "Este programa formativo ofrece una capacitación completa y actualizada para profesionales del sector. Contacta con nosotros para recibir el temario detallado."}
                                </p>

                                {benefitsList.length > 0 && (
                                    <div className="mt-12">
                                        <h3 className="text-slate-900 font-bold text-xl mb-6 flex items-center gap-2">
                                            <div className="h-8 w-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">✓</div>
                                            ¿Qué aprenderás con este curso?
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {benefitsList.map((benefit, i) => (
                                                <div key={i} className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                                    <CheckCircle className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                                                    <span className="text-slate-700 text-sm font-medium">{benefit}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {course.modules && course.modules.length > 0 && (
                                    <div className="mt-12 bg-slate-50 p-8 rounded-3xl border border-slate-100">
                                        <h3 className="text-slate-900 font-extrabold text-2xl mb-8 flex items-center gap-3">
                                            <div className="h-10 w-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg"><BookOpen className="h-5 w-5" /></div>
                                            Contenido del Programa
                                        </h3>
                                        <div className="space-y-4">
                                            {course.modules.map((module, i) => (
                                                <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center gap-4 group hover:border-blue-200 transition-all">
                                                    <div className="flex-1">
                                                        <h4 className="font-bold text-slate-900 text-lg group-hover:text-blue-600 transition-colors">{module.title}</h4>
                                                        {module.description && <p className="text-slate-500 text-sm mt-1 italic">{module.description}</p>}
                                                    </div>
                                                    <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 whitespace-nowrap">
                                                        <Users className="h-4 w-4 text-slate-400" />
                                                        <div>
                                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter leading-none mb-1">Docente</p>
                                                            <p className="text-sm font-bold text-slate-700">{module.teacher?.name || 'Experto Docente'}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mt-12 pt-8 border-t border-slate-100">
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
                        <Card className="border-none shadow-2xl bg-white sticky top-6 overflow-hidden">
                            <div className="bg-blue-600 h-2 w-full" />
                            <CardContent className="p-8">
                                <div className="text-center mb-6">
                                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4">Inversión del curso</p>

                                    <div className="space-y-4">
                                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                            <p className="text-slate-500 text-[10px] font-bold uppercase mb-1">General</p>
                                            <span className="text-3xl font-extrabold text-slate-900">€{course.price.toFixed(2)}</span>
                                        </div>

                                        {course.affiliatePrice && (
                                            <div className="bg-green-50 p-4 rounded-2xl border border-green-100 relative overflow-hidden">
                                                <div className="absolute top-0 right-0 p-1">
                                                    <Badge className="bg-green-500 text-[8px] font-bold">DTO. AFILIADOS</Badge>
                                                </div>
                                                <p className="text-green-600 text-[10px] font-bold uppercase mb-1">Afiliados UGT</p>
                                                <span className="text-3xl font-extrabold text-green-700">€{course.affiliatePrice.toFixed(2)}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-4 pt-6 border-t border-slate-100">
                                    {course.features ? (
                                        course.features.split(/,|\n/).map((feature, i) => (
                                            <div key={i} className="flex items-center gap-3 text-slate-600 text-sm italic font-medium">
                                                <CheckCircle className="h-4 w-4 text-green-500" />
                                                <span>{feature.trim()}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <>
                                            {(course.hasCertificate ?? true) && (
                                                <div className="flex items-center gap-3 text-slate-600 text-sm">
                                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                                    <span>Certificado oficial</span>
                                                </div>
                                            )}
                                            {(course.hasMaterials ?? true) && (
                                                <div className="flex items-center gap-3 text-slate-600 text-sm">
                                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                                    <span>Materiales incluidos</span>
                                                </div>
                                            )}
                                        </>
                                    )}
                                    <div className="flex items-center gap-3 text-slate-600 text-sm">
                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                        <span>Docente: {course.teacher?.name || 'Experto'}</span>
                                    </div>
                                </div>

                                <Button className="w-full h-14 mt-8 bg-green-600 hover:bg-green-700 text-white font-bold text-lg rounded-2xl shadow-lg shadow-green-200 transition-all active:scale-[0.98] group" onClick={handleInterest}>
                                    <MessageSquare className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" /> Reservar Plaza
                                </Button>

                                {course.callUrl && (
                                    <Button
                                        variant="outline"
                                        className="w-full h-12 mt-3 border-blue-600 text-blue-600 hover:bg-blue-50 font-bold rounded-2xl transition-all"
                                        onClick={() => window.open(course.callUrl, '_blank')}
                                    >
                                        <ExternalLink className="mr-2 h-4 w-4" /> Ver Convocatoria
                                    </Button>
                                )}

                                <div className="sidebar-cta-extra">
                                    <div className="mt-8 pt-6 border-t border-slate-100 space-y-3">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Contacto de Formación</p>
                                        <div className="flex flex-col gap-2">
                                            <a href="mailto:formacion.salamanca@ugt-sp.ugt.org" className="text-xs text-blue-600 hover:underline font-medium break-all flex items-center gap-1">
                                                formacion.salamanca@ugt-sp.ugt.org
                                            </a>
                                            <a href="mailto:fespugtsalamanca@gmail.com" className="text-xs text-blue-600 hover:underline font-medium break-all flex items-center gap-1">
                                                fespugtsalamanca@gmail.com
                                            </a>
                                            <p className="text-xs text-slate-700 font-bold flex items-center gap-1">
                                                Tel: <span className="text-slate-900">+34 600 43 71 34</span>
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-8 flex flex-col items-center gap-2 grayscale hover:grayscale-0 transition-all opacity-50 hover:opacity-100 cursor-default">
                                        <img src="/logo-ugt.png" alt="Logo UGT" className="h-6 w-6 object-contain" />
                                        <p className="text-center text-[8px] uppercase font-black text-slate-500 tracking-[0.2em]">
                                            Formación UGT Salamanca
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div >
    )
}
