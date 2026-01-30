"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BookOpen, Clock, Users, Euro, Calendar, CheckCircle, MessageSquare, ShieldCheck, ExternalLink, Printer, User, Mail, Phone, Fingerprint, CreditCard, Info } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { QRCodeSVG } from "qrcode.react"
import { jsPDF } from "jspdf"
import html2canvas from "html2canvas"

interface PublicCourse {
    title: string
    description?: string
    publicDescription?: string
    benefits?: string
    code: string
    level: string
    duration: number
    durationPeriod?: string
    price?: number
    priceUnit?: string
    paymentFrequency?: string
    affiliatePrice?: number
    startDate?: string
    features?: string
    callUrl?: string
    hasCertificate?: boolean
    hasMaterials?: boolean
    modules?: {
        title: string
        description?: string
        teacher?: { name: string }
    }[]
    schedules?: {
        dayOfWeek: string
        startTime: string
        endTime: string
        classroom?: string
    }[]
}

export default function PublicCoursePage() {
    const params = useParams()
    const [course, setCourse] = useState<PublicCourse | null>(null)
    const [loading, setLoading] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [showSuccess, setShowSuccess] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        dni: '',
        isAffiliated: false
    })

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
                    <div className="flex flex-col items-center gap-6">
                        <div className="relative h-20 w-auto">
                            <img src="/ugt-logo.png" alt="Logo UGT Servicios Públicos" className="h-20 w-auto animate-pulse object-contain" />
                        </div>
                        <div className="flex flex-col items-center">
                            <p className="text-xl font-black text-slate-800 tracking-tighter uppercase leading-none">Servicios Públicos</p>
                            <span className="text-xs font-bold text-red-600 uppercase tracking-widest mt-1">UGT Salamanca</span>
                        </div>
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
                    <Button className="mt-6 w-full bg-red-600 hover:bg-red-700" onClick={() => window.location.href = '/'}>
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

    const handleEnroll = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!course) return

        setIsSubmitting(true)
        try {
            const response = await fetch('/api/public/enroll', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    courseId: params.id
                })
            })

            if (response.ok) {
                setShowSuccess(true)
            } else {
                const error = await response.json()
                toast.error(error.error || "Error al procesar la inscripción")
            }
        } catch (error) {
            console.error("Enrollment error:", error)
            toast.error("Error técnico al procesar la inscripción")
        } finally {
            setIsSubmitting(false)
        }
    }

    const currentYear = new Date().getFullYear()
    const paymentConcept = course ? `${course.code}${currentYear}` : ''
    const currentUrl = typeof window !== 'undefined' ? window.location.href : ''

    const benefitsList = course.benefits ? course.benefits.split(/,|\n/).map(b => b.trim()).filter(b => b !== "") : []

    const formatPriceUnit = (unit?: string, frequency?: string) => {
        if (!unit && !frequency) return '';
        let result = '';
        if (unit) {
            const u = unit.toUpperCase();
            if (u === 'SESSION' || u === 'SESIÓN' || u === 'SESION') result = '/ Sesión';
            else if (u === 'MONTH' || u === 'MES') result = '/ Mes';
            else if (u === 'TRIMESTER' || u === 'TRIMESTRE') result = '/ Trimestre';
            else if (u === 'YEAR' || u === 'AÑO' || u === 'ANO') result = '/ Año';
            else if (u === 'FULL' || u === 'TOTAL') result = '';
            else result = `/ ${unit}`;
        }

        if (frequency === 'TRIMESTER') {
            result += ' (Pago trimestral)';
        } else if (frequency === 'MONTHLY') {
            result += ' (Pago mensual)';
        } else if (frequency === 'SINGLE') {
            result += ' (Pago único)';
        }
        return result;
    }

    const getSpanishSchedule = (schedule: any, startDate?: string) => {
        const timeStr = `${new Date(schedule.startTime).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false })} - ${new Date(schedule.endTime).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false })}`;

        if (!startDate) return `${schedule.dayOfWeek} de ${timeStr}`;

        try {
            const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
            const start = new Date(startDate);
            const targetDay = days.indexOf(schedule.dayOfWeek);

            if (targetDay === -1) return `${schedule.dayOfWeek} de ${timeStr}`;

            // Encontrar la primera fecha después o en startDate que sea el día de la semana buscado
            const resultDate = new Date(start);
            const currentDay = resultDate.getDay();
            let distance = targetDay - currentDay;
            if (distance < 0) distance += 7;
            resultDate.setDate(resultDate.getDate() + distance);

            const datePart = resultDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' });
            return `${schedule.dayOfWeek}, ${datePart} a las ${timeStr}`;
        } catch (e) {
            return `${schedule.dayOfWeek} de ${timeStr}`;
        }
    }

    const handleExportPDF = async () => {
        const toastId = toast.loading("Preparando descarga PDF (A4)...")
        try {
            const element = document.getElementById('public-course-landing')
            if (!element) {
                toast.error("Error al localizar el contenido", { id: toastId })
                return
            }

            // Ocultar elementos no deseados para el PDF
            const noPrint = element.querySelectorAll('.no-print')
            noPrint.forEach((el: any) => el.style.display = 'none')

            const canvas = await html2canvas(element, {
                scale: 3,
                useCORS: true,
                backgroundColor: "#ffffff",
                logging: false,
                windowWidth: 1200
            })

            // Restaurar visibilidad
            noPrint.forEach((el: any) => el.style.display = '')

            const imgData = canvas.toDataURL('image/jpeg', 1.0)
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4',
                compress: true
            })

            const pageWidth = pdf.internal.pageSize.getWidth()
            const pageHeight = pdf.internal.pageSize.getHeight()
            const imgProps = pdf.getImageProperties(imgData)
            const imgHeight = (imgProps.height * pageWidth) / imgProps.width

            // Añadir imagen al PDF (puede requerir múltiples páginas si es largo)
            let heightLeft = imgHeight
            let position = 0

            pdf.addImage(imgData, 'JPEG', 0, position, pageWidth, imgHeight)
            heightLeft -= pageHeight

            while (heightLeft > 0) {
                position = heightLeft - imgHeight
                pdf.addPage()
                pdf.addImage(imgData, 'JPEG', 0, position, pageWidth, imgHeight)
                heightLeft -= pageHeight
            }

            pdf.save(`FICHA_${course?.code || 'CURSO'}.pdf`)
            toast.success("PDF generado con éxito", { id: toastId })
        } catch (error) {
            console.error("PDF generation error:", error)
            toast.error("Error al generar el PDF", { id: toastId })
        }
    }

    return (
        <div id="public-course-landing" className="min-h-screen bg-slate-50 pb-12 print:bg-white print:pb-0">
            <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 10mm;
          }
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            background-color: white !important;
            font-size: 11px;
            color: #1e293b;
          }
          .no-print {
            display: none !important;
          }
          #public-course-landing {
            padding-bottom: 0 !important;
            background-color: white !important;
          }
          .print-compact-gap {
            gap: 0.5rem !important;
          }
          .print-no-shadow {
            box-shadow: none !important;
            border: 1px solid #e2e8f0 !important;
          }
          /* Forzar que todo quepa en una página */
          h1 { font-size: 24pt !important; line-height: 1.1 !important; margin-bottom: 5pt !important; }
          .container { max-width: 100% !important; width: 100% !important; padding: 0 !important; margin: 0 !important; }
          .card-content { padding: 0.75rem !important; }
          .p-8 { padding: 1rem !important; }
          .p-6 { padding: 0.75rem !important; }
          .p-4 { padding: 0.5rem !important; }
          .mt-12 { margin-top: 0.75rem !important; }
          .mt-8 { margin-top: 0.5rem !important; }
          .mb-8 { margin-bottom: 0.4rem !important; }
          .mb-6 { margin-bottom: 0.3rem !important; }
          .h-72 { height: 140px !important; }
          .h-32 { height: 70px !important; }
          .gap-8 { gap: 0.5rem !important; }
          
          /* Ajuste de columnas en print */
          .print-grid-layout { 
            grid-template-columns: 1.8fr 1.2fr !important; 
            display: grid !important; 
            gap: 15px !important; 
          }
          .print-full-width { width: 100% !important; }
          .print-no-break { break-inside: avoid; }
          .print-rounded { border-radius: 12px !important; }
          
          /* Colores vivos en print */
          .bg-blue-600 { background-color: #dc2626 !important; }
          .bg-green-600 { background-color: #16a34a !important; }
          .text-blue-600 { color: #dc2626 !important; }
          .text-green-700 { color: #15803d !important; }
          
          /* Ajustes de badges en print */
          .badge-print { 
            background-color: #fef2f2 !important; 
            color: #991b1b !important; 
            border: 1px solid #fee2e2 !important;
          }
          /* Forzar el logo en print si no aparece */
          .print-logo {
            display: block !important;
            height: 40px !important;
            width: auto !important;
          }
        }

        .header-visual {
            user-select: none;
            -webkit-user-select: none;
        }
      `}</style>

            {/* Header Visual */}
            <div className="header-visual bg-gradient-to-br from-red-600 to-red-900 text-white h-72 flex items-end relative overflow-hidden print:h-32 print:rounded-b-none print:mb-6">
                <div className="absolute top-6 left-6 z-30 print:top-4 print:left-4">
                    <div className="flex items-center">
                        <div className="bg-white p-2 rounded-xl shadow-2xl mr-4 print:shadow-none print:border print:p-1.5">
                            <img src="/ugt-logo.png" alt="Logo UGT" className="h-12 w-auto object-contain print:h-10" />
                        </div>
                        <div className="flex flex-col drop-shadow-lg">
                            <h2 className="text-xl font-black text-white leading-tight uppercase tracking-tighter">Servicios Públicos</h2>
                            <span className="text-xs text-red-100 font-bold tracking-[0.3em] uppercase opacity-90">UGT Salamanca</span>
                        </div>
                    </div>
                </div>
                <div className="absolute top-0 right-0 p-8 opacity-10 print:opacity-5 print:p-2">
                    <BookOpen className="h-80 w-80 print:h-40 print:w-40" />
                </div>
                {/* Botón Imprimir Flotante (no-print) */}
                <div className="absolute top-6 right-6 no-print flex gap-3">
                    <Button
                        variant="outline"
                        size="sm"
                        className="bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-md font-bold"
                        onClick={() => window.print()}
                    >
                        <Printer className="h-4 w-4 mr-2" /> Imprimir Ficha
                    </Button>
                    <Button
                        size="sm"
                        className="bg-red-600 hover:bg-red-700 text-white font-bold shadow-lg"
                        onClick={handleExportPDF}
                    >
                        <ExternalLink className="h-4 w-4 mr-2" /> Descargar PDF (A4)
                    </Button>
                </div>
                <div className="container mx-auto px-4 pb-12 relative z-10 print:pb-6">
                    <Badge className="bg-white/20 text-white border-white/30 mb-3 px-3 py-1 text-xs print:bg-red-600/20 print:text-red-100 uppercase tracking-widest font-black">
                        Servicios Públicos UGT
                    </Badge>
                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight max-w-4xl leading-tight print:text-3xl">
                        {course.title}
                    </h1>
                    <div className="flex flex-wrap items-center gap-3 mt-4 print:mt-1">
                        <Badge variant="outline" className="border-white/30 text-white font-bold px-3 py-1 print:text-red-100 print:border-red-300/30">
                            CODE: {course.code}
                        </Badge>
                        <span className="text-white/20 print:hidden">|</span>
                        <Badge className="bg-white/10 hover:bg-white/20 text-white border-transparent backdrop-blur-sm print:bg-white/10 print:text-white">
                            NIVEL {course.level}
                        </Badge>
                        {course.startDate && (
                            <>
                                <span className="text-white/20 print:hidden">|</span>
                                <div className="flex items-center gap-2 text-white text-sm font-medium print:text-red-900 print:bg-red-50 print:px-2 print:py-0.5 print:rounded-full print:text-[9px]">
                                    <Calendar className="h-4 w-4" />
                                    <span>Inicio: {new Date(course.startDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 -mt-10 relative z-20 print:mt-0 print:px-0">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 print-grid-layout print:gap-4">
                    {/* Main Info */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="border-none shadow-xl shadow-slate-200/60 overflow-hidden">
                            <CardHeader className="bg-white border-b border-slate-50">
                                <div className="flex items-center gap-2 text-slate-400 text-sm font-bold uppercase tracking-wider">
                                    <ShieldCheck className="h-4 w-4 text-red-500" /> Descripción del programa
                                </div>
                            </CardHeader>
                            <CardContent className="p-8">
                                <p className="text-slate-600 text-lg leading-relaxed whitespace-pre-wrap">
                                    {course.publicDescription || course.description || "Este programa formativo ofrece una capacitación completa y actualizada para profesionales del sector. Contacta con nosotros para recibir el temario detallado."}
                                </p>

                                {benefitsList.length > 0 && (
                                    <div className="mt-12 print:mt-6">
                                        <h3 className="text-slate-900 font-bold text-xl mb-6 flex items-center gap-2 print:text-lg print:mb-3">
                                            <div className="h-8 w-8 bg-red-600 text-white rounded-full flex items-center justify-center font-bold text-sm">✓</div>
                                            ¿Qué aprenderás con este curso?
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {benefitsList.map((benefit, i) => (
                                                <div key={i} className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                                    <CheckCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                                                    <span className="text-slate-700 text-sm font-medium">{benefit}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {course.modules && course.modules.length > 0 && (
                                    <div className="mt-12 bg-slate-50 p-8 rounded-3xl border border-slate-100 print:mt-6 print:p-4 print:bg-white print:border-slate-200">
                                        <h3 className="text-slate-900 font-extrabold text-2xl mb-8 flex items-center gap-3 print:text-lg print:mb-4">
                                            <div className="h-10 w-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg print:h-8 print:w-8 print:shadow-none"><BookOpen className="h-5 w-5" /></div>
                                            Contenido del Programa
                                        </h3>
                                        <div className="space-y-4">
                                            {course.modules.map((module, i) => (
                                                <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center gap-4 group hover:border-red-200 transition-all">
                                                    <div className="flex-1">
                                                        <h4 className="font-bold text-slate-900 text-lg group-hover:text-red-600 transition-colors">{module.title}</h4>
                                                        {module.description && <p className="text-slate-500 text-sm mt-1 italic">{module.description}</p>}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <div className="mt-12 bg-slate-50 p-8 rounded-3xl border border-slate-100 print:mt-6 print:p-4 print:bg-white print:border-slate-200">
                            <h3 className="text-slate-900 font-extrabold text-2xl mb-8 flex items-center gap-3 print:text-lg print:mb-4">
                                <div className="h-10 w-10 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg print:h-8 print:w-8 print:shadow-none"><Clock className="h-5 w-5" /></div>
                                Días y Horarios de Clase
                            </h3>
                            {course.schedules && course.schedules.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {course.schedules.map((schedule, i) => (
                                        <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between group hover:border-red-200 transition-all">
                                            <div>
                                                <p className="text-red-600 font-black uppercase text-xs tracking-widest mb-1">Horario de clase</p>
                                                <p className="text-slate-900 font-bold text-lg">
                                                    {getSpanishSchedule(schedule, course.startDate)}
                                                </p>
                                                {schedule.classroom && (
                                                    <p className="text-slate-400 text-xs mt-1 flex items-center gap-1">
                                                        <Info className="h-3 w-3" /> {schedule.classroom}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-6 text-slate-400 italic">
                                    Horario por definir. Contacta para más detalles.
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-12 pt-8 border-t border-slate-100 print:mt-4 print:pt-4 print:gap-2">
                            <div className="flex items-start space-x-4 print:space-x-2">
                                <div className="p-3 bg-blue-50 rounded-2xl print:p-2"><Clock className="h-6 w-6 text-blue-600 print:h-4 print:w-4" /></div>
                                <div>
                                    <p className="text-sm font-bold text-slate-400 uppercase print:text-[10px]">Horas Totales</p>
                                    <p className="text-xl font-bold text-slate-800 print:text-sm">{course.duration}h</p>
                                </div>
                            </div>
                            {course.durationPeriod && (
                                <div className="flex items-start space-x-4 print:space-x-2">
                                    <div className="p-3 bg-purple-50 rounded-2xl print:p-2"><Calendar className="h-6 w-6 text-purple-600 print:h-4 print:w-4" /></div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-400 uppercase print:text-[10px]">Período</p>
                                        <p className="text-xl font-bold text-slate-800 print:text-sm">{course.durationPeriod}</p>
                                    </div>
                                </div>
                            )}
                            <div className="flex items-start space-x-4 print:space-x-2">
                                <div className="p-3 bg-red-50 rounded-2xl print:p-2"><Calendar className="h-6 w-6 text-red-600 print:h-4 print:w-4" /></div>
                                <div>
                                    <p className="text-sm font-bold text-slate-400 uppercase print:text-[10px]">Próximo Inicio</p>
                                    <p className="text-xl font-bold text-slate-800 print:text-sm">
                                        {course.startDate ? new Date(course.startDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) : 'Próximamente'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar CTA */}
                    <div className="space-y-6 print:space-y-2">
                        <Card className="border-none shadow-2xl bg-white sticky top-6 overflow-hidden print:static print:shadow-none print:border print:border-slate-200 print-no-break">
                            <div className="bg-red-600 h-2 w-full print:bg-red-700" />
                            <CardContent className="p-8 print:p-4">
                                <div className="text-center mb-6 print:mb-2">
                                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4 print:mb-1 print:text-blue-800">Inversión del curso</p>

                                    <div className="flex flex-col gap-3 print:gap-2">
                                        {/* Bloque Precio Afiliados */}
                                        <div className={`p-5 rounded-2xl border-2 relative overflow-hidden print:p-2 print:border print:rounded-xl ${course.affiliatePrice ? 'bg-green-50 border-green-200 print:bg-green-50/50' : 'bg-slate-50 border-slate-100 opacity-50'}`}>
                                            <p className={`text-[10px] font-black uppercase mb-1 tracking-tighter ${course.affiliatePrice ? 'text-green-600' : 'text-slate-400'}`}>Precio Afiliados UGT</p>
                                            <div className="flex items-baseline justify-center gap-1">
                                                {course.affiliatePrice && course.affiliatePrice > 0 ? (
                                                    <>
                                                        <span className="text-5xl font-black tracking-tight print:text-2xl text-green-700">
                                                            €{(course.affiliatePrice).toFixed(2)}
                                                        </span>
                                                        <span className="text-sm font-bold uppercase print:text-[8px] text-green-600">
                                                            {formatPriceUnit(course.priceUnit, course.paymentFrequency)}
                                                        </span>
                                                    </>
                                                ) : (
                                                    <span className="text-xl font-bold text-slate-400 uppercase tracking-widest py-2 italic print:text-base print:py-1">Consultar</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Bloque Precio General */}
                                        <div className={`p-4 rounded-2xl border relative overflow-hidden print:p-2 print:rounded-xl ${course.price ? 'bg-red-50/30 border-red-100 print:bg-red-50/10' : 'bg-slate-50 border-slate-100 opacity-50'}`}>
                                            <p className={`text-[10px] font-black uppercase mb-1 tracking-tighter ${course.price ? 'text-red-600' : 'text-slate-400'}`}>Precio General</p>
                                            <div className="flex items-baseline justify-center gap-1">
                                                {course.price && course.price > 0 ? (
                                                    <>
                                                        <span className="text-3xl font-black tracking-tight print:text-xl text-slate-900">
                                                            €{(course.price).toFixed(2)}
                                                        </span>
                                                        <span className="text-xs font-bold uppercase print:text-[8px] text-red-600">
                                                            {formatPriceUnit(course.priceUnit, course.paymentFrequency)}
                                                        </span>
                                                    </>
                                                ) : (
                                                    <span className="text-lg font-bold text-slate-400 uppercase tracking-tight py-1 italic print:text-sm">Consultar</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-6 border-t border-slate-100 print:pt-2 print:space-y-1">
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

                                </div>

                                <div className="no-print space-y-4">
                                    <Button className="w-full h-16 mt-8 bg-green-600 hover:bg-green-700 text-white font-bold text-lg rounded-2xl shadow-lg shadow-green-200 transition-all active:scale-[0.98] group flex flex-col items-center justify-center leading-tight py-2" onClick={handleInterest}>
                                        <div className="flex items-center gap-2">
                                            <MessageSquare className="h-5 w-5 group-hover:scale-110 transition-transform" />
                                            Contacta y reserva por WhatsApp
                                        </div>
                                        <span className="text-[10px] font-medium opacity-80 uppercase tracking-widest mt-1">Dudas e información inicial</span>
                                    </Button>

                                    <div className="relative py-2 flex items-center">
                                        <div className="flex-grow border-t border-slate-200"></div>
                                        <span className="flex-shrink mx-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">O BIEN</span>
                                        <div className="flex-grow border-t border-slate-200"></div>
                                    </div>

                                    <Dialog open={isDialogOpen} onOpenChange={(open) => {
                                        setIsDialogOpen(open)
                                        if (!open) {
                                            setShowSuccess(false)
                                            setFormData({ name: '', email: '', phone: '', dni: '', isAffiliated: false })
                                        }
                                    }}>
                                        <DialogTrigger asChild>
                                            <Button variant="outline" className="w-full h-14 border-blue-600 text-blue-600 hover:bg-blue-50 font-bold rounded-2xl transition-all shadow-sm flex items-center justify-center">
                                                <CheckCircle className="h-5 w-5 mr-2" />
                                                Tengo la decisión tomada: Inscribirme
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-[500px] border-none shadow-2xl p-0 overflow-hidden bg-white">
                                            {!showSuccess ? (
                                                <form onSubmit={handleEnroll}>
                                                    <DialogHeader className="p-8 bg-slate-50 border-b">
                                                        <div className="bg-blue-100 text-blue-700 text-[9px] font-black px-2 py-0.5 rounded-full w-fit mb-3 tracking-widest uppercase">Paso 1 de 2: Mis datos</div>
                                                        <DialogTitle className="text-2xl font-black text-slate-900 leading-tight">Formulario de Inscripción</DialogTitle>
                                                        <DialogDescription className="text-slate-500 font-medium leading-relaxed mt-1">
                                                            Completa tus datos para reservar tu plaza. <br />
                                                            <span className="text-red-600 font-bold">Tras este paso verás los datos de pago y concepto.</span>
                                                        </DialogDescription>
                                                    </DialogHeader>
                                                    <div className="p-8 space-y-5">
                                                        <div className="grid grid-cols-1 gap-5">
                                                            <div className="space-y-2">
                                                                <Label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Nombre y Apellidos *</Label>
                                                                <div className="relative">
                                                                    <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                                                    <Input required className="pl-10 h-11 bg-slate-50 border-slate-200 focus:bg-white" placeholder="Juan Pérez..." value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                                                                </div>
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">DNI / NIE *</Label>
                                                                <div className="relative">
                                                                    <Fingerprint className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                                                    <Input required className="pl-10 h-11 bg-slate-50 border-slate-200 focus:bg-white" placeholder="12345678X" value={formData.dni} onChange={e => setFormData({ ...formData, dni: e.target.value })} />
                                                                </div>
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div className="space-y-2">
                                                                    <Label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Teléfono</Label>
                                                                    <div className="relative">
                                                                        <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                                                        <Input className="pl-10 h-11 bg-slate-50 border-slate-200 focus:bg-white" placeholder="600000000" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                                                                    </div>
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <Label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Email</Label>
                                                                    <div className="relative">
                                                                        <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                                                        <Input className="pl-10 h-11 bg-slate-50 border-slate-200 focus:bg-white" type="email" placeholder="email@ejemplo.com" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="p-4 bg-red-50/50 rounded-xl border border-red-100/50 flex items-center space-x-3 select-none">
                                                                <Checkbox
                                                                    id="is-affiliated"
                                                                    checked={formData.isAffiliated}
                                                                    onCheckedChange={(checked) => setFormData({ ...formData, isAffiliated: !!checked })}
                                                                />
                                                                <div className="flex-1 cursor-pointer">
                                                                    <Label htmlFor="is-affiliated" className="text-xs font-bold text-red-900 cursor-pointer block">
                                                                        Soy afiliado/a a UGT
                                                                    </Label>
                                                                    <p className="text-[9px] text-red-600/70 font-medium">Activa esta casilla para aplicar el precio reducido.</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <DialogFooter className="p-8 bg-slate-50 border-t flex flex-col gap-3">
                                                        <Button type="submit" disabled={isSubmitting} className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-red-100">
                                                            {isSubmitting ? "Procesando..." : "Confirmar Pre-inscripción"}
                                                        </Button>
                                                        <p className="text-[9px] text-slate-400 text-center leading-relaxed">Al inscribirte, tus datos quedarán registrados para la gestión del curso. Deberás completar el pago para confirmar tu plaza.</p>
                                                    </DialogFooter>
                                                </form>
                                            ) : (
                                                <div className="p-10 text-center animate-in zoom-in-95 duration-300">
                                                    <div className="h-20 w-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                                        <CheckCircle className="h-10 w-10" />
                                                    </div>
                                                    <div className="bg-green-100 text-green-700 text-[9px] font-black px-2 py-0.5 rounded-full w-fit mb-3 tracking-widest uppercase mx-auto">Paso 2 de 2: Pago</div>
                                                    <h2 className="text-3xl font-black text-slate-900 mb-2">¡Pre-inscripción recibida!</h2>
                                                    <p className="text-slate-500 font-medium mb-8">Tu plaza ha quedado reservada en estado "pendiente de pago".</p>

                                                    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 mb-8 text-left space-y-4">
                                                        <div className="space-y-1">
                                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                                <Euro className="h-3 w-3" /> Importe a pagar
                                                            </p>
                                                            <div className="bg-red-50/50 rounded-lg border border-red-100 p-3 text-center">
                                                                <p className="text-2xl font-black text-red-700 select-all">
                                                                    {formData.isAffiliated
                                                                        ? (course.affiliatePrice ? `${course.affiliatePrice.toFixed(2)}€` : 'Por consultar')
                                                                        : (course.price ? `${course.price.toFixed(2)}€` : 'Por consultar')}
                                                                    {(formData.isAffiliated ? course.affiliatePrice : course.price) && (
                                                                        <span className="text-sm ml-1 font-bold text-red-500">{formatPriceUnit(course.priceUnit, course.paymentFrequency)}</span>
                                                                    )}
                                                                </p>
                                                                <p className="text-[10px] font-medium text-red-600/70 mt-1 italic">
                                                                    Tarifa {formData.isAffiliated ? 'Afiliado UGT' : 'General'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                                <CreditCard className="h-3 w-3" /> Datos para el pago (IBAN)
                                                            </p>
                                                            <p className="text-sm font-bold text-slate-700 select-all block p-2 bg-white rounded-lg border border-slate-100 text-center">ES59 2103 2347 4000 3377 9482</p>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                                <Info className="h-3 w-3" /> Concepto de transferencia
                                                            </p>
                                                            <p className="text-sm font-black text-red-700 select-all block p-2 bg-red-50/50 rounded-lg border border-red-100 text-center tracking-widest">{paymentConcept}</p>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-4">
                                                        <p className="text-xs text-slate-500 leading-relaxed font-medium italic">
                                                            "Por favor, envía el justificante de la transferencia por <b>Email</b> o <b>WhatsApp</b> para que la inscripción definitiva sea efectiva."
                                                        </p>
                                                        <Button onClick={() => setIsDialogOpen(false)} className="w-full h-12 bg-slate-900 border hover:bg-black text-white font-bold rounded-xl mt-4">
                                                            Cerrar y volver
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}
                                        </DialogContent>
                                    </Dialog>
                                </div>

                                {course.callUrl && (
                                    <Button
                                        variant="outline"
                                        className="w-full h-12 mt-3 border-red-600 text-red-600 hover:bg-red-50 font-bold rounded-2xl transition-all print:border-2 print:h-10 print:mt-1 print:text-xs"
                                        onClick={() => window.open(course.callUrl, '_blank')}
                                    >
                                        <ExternalLink className="mr-2 h-4 w-4" /> Ver Convocatoria
                                    </Button>
                                )}

                                <div className="sidebar-cta-extra print:mt-2">
                                    <div className="mt-8 pt-6 border-t border-slate-100 space-y-3 print:mt-2 print:pt-2 print:space-y-1">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 print:mb-1">Contacto de Formación</p>
                                        <div className="flex flex-col gap-2 print:gap-1">
                                            <a href="mailto:formacion.salamanca@ugt-sp.ugt.org" className="text-xs text-red-600 hover:underline font-medium break-all flex items-center gap-1 print:text-[9px]">
                                                formacion.salamanca@ugt-sp.ugt.org
                                            </a>
                                            <a href="mailto:fespugtsalamanca@gmail.com" className="text-xs text-red-600 hover:underline font-medium break-all flex items-center gap-1 print:text-[9px]">
                                                fespugtsalamanca@gmail.com
                                            </a>
                                            <p className="text-xs text-slate-700 font-bold flex items-center gap-1 print:text-[9px]">
                                                Tel: <span className="text-slate-900">+34 600 43 71 34</span>
                                            </p>
                                        </div>
                                    </div>

                                    <div className="md:hidden print:flex flex-col items-center gap-2 mt-4 pt-4 border-t border-slate-100 border-dashed">
                                        <div className="bg-white p-2 border rounded-xl shadow-sm">
                                            <QRCodeSVG value={currentUrl} size={64} level="M" />
                                        </div>
                                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest text-center">Escanea para ir a la web e inscribirte</p>
                                    </div>

                                    <div className="mt-8 flex flex-col items-center gap-2 grayscale hover:grayscale-0 transition-all opacity-50 hover:opacity-100 cursor-default print:mt-4 print:opacity-100 print:grayscale-0">
                                        <img src="/logo-servicios-publicos.png" alt="Logo UGT Servicios Públicos" className="h-6 w-auto object-contain" />
                                        <p className="text-center text-[8px] uppercase font-black text-slate-500 tracking-[0.2em]">
                                            Servicios Públicos UGT Salamanca
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div >
            </div >
        </div >
    )
}
