"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    BookOpen,
    Clock,
    Users,
    Euro,
    Calendar,
    CheckCircle2,
    MessageSquare,
    ShieldCheck,
    ExternalLink,
    Printer,
    User,
    Mail,
    Phone,
    Fingerprint,
    CreditCard,
    Info,
    Award,
    Layers,
    FileText,
    Sparkles,
    AlertCircle,
    Lock,
    Tag,
    Percent
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { QRCodeSVG } from "qrcode.react"
import { jsPDF } from "jspdf"
import html2canvas from "html2canvas"
import { formatTimeUTC } from "@/lib/utils"

interface DiscountRule {
    id?: string
    percentage: number
    concept: string
}

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
    startDateHasDay?: boolean
    endDate?: string
    isActive?: boolean
    features?: string
    callUrl?: string
    hasCertificate?: boolean
    hasMaterials?: boolean
    availableForNonMembers?: boolean
    hasDiscounts?: boolean
    discountDescription?: string
    discountRules?: string | DiscountRule[]
    minStudents?: number
    maxStudents?: number
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
        isRecurring?: boolean
    }[]
}

export default function PublicCoursePage({ params }: { params: Promise<{ id: string }> }) {
    const [id, setId] = useState<string | null>(null)
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
        isAffiliated: false,
        acceptedPrivacy: false,
        wantsDiscount: false,
        selectedDiscountConcepts: [] as string[],
        discountDetails: ''
    })

    const getDiscountRules = (): DiscountRule[] => {
        if (!course?.discountRules) return []
        try {
            return typeof course.discountRules === 'string' ? JSON.parse(course.discountRules) : course.discountRules
        } catch (e) {
            return []
        }
    }

    const availableRules = getDiscountRules()
    const selectedRules = availableRules.filter(r => formData.selectedDiscountConcepts.includes(r.concept))
    const totalDiscountPercentage = selectedRules.reduce((sum, r) => sum + r.percentage, 0)
    const discountReasonText = selectedRules.map(r => `${r.concept} (-${r.percentage}%)`).join(' + ')

    useEffect(() => {
        const resolveParams = async () => {
            const resolvedParams = await params;
            setId(resolvedParams.id);
        };
        resolveParams();
    }, [params]);

    useEffect(() => {
        if (!id) return;
        const fetchCourse = async () => {
            try {
                const response = await fetch(`/api/public/course/${id}`)
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
    }, [id])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-4 p-8 bg-white rounded-3xl shadow-sm border border-slate-100">
                    <div className="h-16 w-16 rounded-2xl bg-red-50 flex items-center justify-center animate-pulse">
                        <img src="/ugt-logo.png" alt="Logo UGT" className="h-10 w-auto object-contain" />
                    </div>
                    <div className="text-center">
                        <p className="text-sm font-black text-slate-800 tracking-tight uppercase">Servicios Públicos UGT</p>
                        <p className="text-xs font-bold text-red-600 uppercase tracking-widest mt-0.5">Cargando programa...</p>
                    </div>
                </div>
            </div>
        )
    }

    if (!course) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
                <Card className="max-w-md w-full text-center p-8 border-none shadow-xl rounded-3xl bg-white">
                    <div className="bg-red-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-red-600">
                        <BookOpen className="h-8 w-8" />
                    </div>
                    <CardTitle className="text-2xl font-black text-slate-900">Curso no disponible</CardTitle>
                    <CardDescription className="mt-2 text-slate-500 text-sm">
                        El enlace no es válido o el programa formativo ha sido retirado.
                    </CardDescription>
                    <Button className="mt-6 w-full bg-red-600 hover:bg-red-700 text-white font-bold h-12 rounded-2xl" onClick={() => window.location.href = '/'}>
                        Ir al portal de formación
                    </Button>
                </Card>
            </div>
        )
    }

    const handleInterest = () => {
        const message = `¡Hola! Me interesa información sobre el curso: "${course.title}" (${course.code}). ¿Podríais informarme sobre disponibilidad y matrícula?`
        window.open(`https://wa.me/34600437134?text=${encodeURIComponent(message)}`, '_blank')
    }

    const handleEnroll = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!course) return

        if (!formData.email || !formData.email.trim()) {
            toast.error("Por favor, introduce tu correo electrónico.")
            return
        }

        if (!formData.acceptedPrivacy) {
            toast.error("Debes aceptar la política de privacidad y protección de datos para continuar.")
            return
        }

        setIsSubmitting(true)
        try {
            const hasAnyDiscount = formData.selectedDiscountConcepts.length > 0
            const response = await fetch('/api/public/enroll', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    dni: formData.dni,
                    isAffiliated: formData.isAffiliated,
                    wantsDiscount: hasAnyDiscount,
                    requestedDiscountPercentage: hasAnyDiscount ? totalDiscountPercentage : null,
                    requestedDiscountConcept: hasAnyDiscount ? discountReasonText : null,
                    discountDetails: formData.discountDetails,
                    courseId: id
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

    const benefitsList = course.benefits
        ? course.benefits.split(/,|\n/).map(b => b.trim()).filter(b => b !== "")
        : []

    const featuresList = course.features
        ? course.features.split(/,|\n/).map(f => f.trim()).filter(f => f !== "")
        : []

    const getSpanishLevel = (level: string) => {
        const levels: Record<string, string> = {
            'BEGINNER': 'Iniciación',
            'INTERMEDIATE': 'Intermedio',
            'ADVANCED': 'Avanzado',
            'EXPERT': 'Experto',
            'PREPARACION_OPOSICIONES': 'Prep. Oposiciones'
        };
        return levels[level] || level;
    }

    const getPriceUnitLabel = (unit?: string) => {
        if (!unit) return '';
        const u = unit.toUpperCase();
        if (u === 'SESSION' || u === 'SESIÓN' || u === 'SESION') return 'por sesión';
        if (u === 'MONTH' || u === 'MES') return 'al mes';
        if (u === 'TRIMESTER' || u === 'TRIMESTRE') return 'al trimestre';
        if (u === 'YEAR' || u === 'AÑO' || u === 'ANO') return 'al año';
        if (u === 'FULL' || u === 'TOTAL') return 'precio total';
        return `por ${unit.toLowerCase()}`;
    }

    const getFrequencyLabel = (frequency?: string) => {
        if (!frequency) return '';
        switch (frequency) {
            case 'SINGLE': return 'Pago único';
            case '2_PAYMENTS': return 'En 2 pagos (fraccionado)';
            case '3_PAYMENTS': return 'En 3 pagos (fraccionado)';
            case '4_PAYMENTS': return 'En 4 pagos (fraccionado)';
            case '5_PAYMENTS': return 'En 5 pagos (fraccionado)';
            case '6_PAYMENTS': return 'En 6 pagos (fraccionado)';
            case 'MONTHLY': return 'Pago mensual';
            case 'BIMONTHLY': return 'Pago bimestral';
            case 'TRIMESTER': return 'Pago trimestral';
            case 'SEMESTER': return 'Pago semestral';
            case 'ANNUAL': return 'Pago anual';
            default: return frequency;
        }
    }

    const getFractionInfo = (price?: number | null, frequency?: string) => {
        if (!price || price <= 0) return null;
        let count = 0;
        if (frequency === '2_PAYMENTS') count = 2;
        else if (frequency === '3_PAYMENTS') count = 3;
        else if (frequency === '4_PAYMENTS') count = 4;
        else if (frequency === '5_PAYMENTS') count = 5;
        else if (frequency === '6_PAYMENTS') count = 6;

        if (count > 0) {
            const installmentPrice = price / count;
            return {
                isFractioned: true,
                count,
                installmentPrice,
                totalPrice: price,
                mainDisplay: `${installmentPrice.toFixed(2)} €`,
                perInstallmentText: `por cuota (${count} pagos)`,
                totalText: `Total del curso: ${price.toFixed(2)} € (${count} plazos de ${installmentPrice.toFixed(2)} €)`
            };
        }
        return null;
    }

    const formatCourseStartDate = (dateStr?: string, hasDay: boolean = true) => {
        if (!dateStr) return '';
        try {
            const raw = dateStr.split('T')[0];
            const parts = raw.split('-').map(Number);
            if (parts.length < 2 || isNaN(parts[0]) || isNaN(parts[1])) return '';
            const year = parts[0];
            const month = parts[1];
            const day = parts[2] || 1;
            const d = new Date(Date.UTC(year, month - 1, day));
            if (hasDay === false) {
                const monthName = d.toLocaleDateString('es-ES', { month: 'long', timeZone: 'UTC' });
                return `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} de ${year}`;
            }
            return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
        } catch {
            return '';
        }
    }

    const getSpanishSchedule = (schedule: any, startDate?: string) => {
        const dayMap: Record<string, string> = {
            'MONDAY': 'Lunes',
            'TUESDAY': 'Martes',
            'WEDNESDAY': 'Miércoles',
            'THURSDAY': 'Jueves',
            'FRIDAY': 'Viernes',
            'SATURDAY': 'Sábado',
            'SUNDAY': 'Domingo'
        };

        const daySpan = dayMap[schedule.dayOfWeek] || schedule.dayOfWeek;
        const timeStr = `${formatTimeUTC(schedule.startTime)} a ${formatTimeUTC(schedule.endTime)}`;

        if (schedule.isRecurring === false) {
            const datePart = new Date(schedule.startTime).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', timeZone: 'UTC' });
            return `${daySpan}, ${datePart} (${timeStr})`;
        }

        return `${daySpan}s (${timeStr})`;
    }

    const handleExportPDF = async () => {
        const toastId = toast.loading("Generando documento PDF...")
        try {
            const element = document.getElementById('public-course-landing')
            if (!element) {
                toast.error("Error al localizar el contenido", { id: toastId })
                return
            }

            const noPrint = element.querySelectorAll('.no-print')
            noPrint.forEach((el: any) => el.style.display = 'none')

            const canvas = await html2canvas(element, {
                scale: 2.5,
                useCORS: true,
                backgroundColor: "#ffffff",
                logging: false,
                windowWidth: 1200
            })

            noPrint.forEach((el: any) => el.style.display = '')

            const imgData = canvas.toDataURL('image/jpeg', 0.95)
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
            toast.success("PDF descargado con éxito", { id: toastId })
        } catch (error) {
            console.error("PDF generation error:", error)
            toast.error("Error al generar el PDF", { id: toastId })
        }
    }

    // Comprobar qué datos rápidos existen para mostrar en la barra de estadísticas
    const hasQuickStats = (course.duration && course.duration > 0) || course.durationPeriod || course.startDate || (course.modules && course.modules.length > 0) || (course.minStudents && course.minStudents > 0)

    return (
        <div id="public-course-landing" className="min-h-screen bg-slate-50/80 text-slate-900 pb-16 print:bg-white print:pb-0 font-sans antialiased">
            <style jsx global>{`
                @media print {
                    @page {
                        size: A4;
                        margin: 8mm;
                    }
                    body {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                        background-color: white !important;
                        font-size: 11px;
                        color: #0f172a;
                    }
                    .no-print {
                        display: none !important;
                    }
                    #public-course-landing {
                        padding-bottom: 0 !important;
                        background-color: white !important;
                    }
                }
            `}</style>

            {/* Cabecera / Hero Banner Compacto y Estilizado */}
            <div className="bg-gradient-to-br from-red-600 via-red-700 to-red-900 text-white relative overflow-hidden shadow-lg print:shadow-none print:bg-red-800">
                {/* Patrón de fondo sutil */}
                <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />

                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 relative z-10">
                    {/* Barra superior de logotipo y acciones */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/15">
                        <div className="flex items-center gap-3">
                            <div className="bg-white p-1.5 rounded-xl shadow-md shrink-0">
                                <img
                                    src="/ugt-logo.png"
                                    alt="Logo UGT"
                                    className="h-8 sm:h-9 w-auto object-contain block"
                                    loading="eager"
                                />
                            </div>
                            <div>
                                <p className="text-sm sm:text-base font-black tracking-tight uppercase leading-none text-white">
                                    Servicios Públicos
                                </p>
                                <span className="text-[10px] font-bold text-red-200 tracking-widest uppercase mt-0.5 block">
                                    UGT Salamanca · Formación
                                </span>
                            </div>
                        </div>

                        {/* Botones de acción rápida */}
                        <div className="flex items-center gap-2 no-print self-end sm:self-auto">
                            <Button
                                variant="outline"
                                size="sm"
                                className="bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-sm text-xs font-semibold h-9 px-3 rounded-xl transition-all"
                                onClick={() => window.print()}
                                title="Imprimir ficha del curso"
                            >
                                <Printer className="h-4 w-4 sm:mr-1.5" />
                                <span className="hidden sm:inline">Imprimir</span>
                            </Button>
                            <Button
                                size="sm"
                                className="bg-white hover:bg-slate-100 text-red-700 font-bold text-xs h-9 px-3.5 rounded-xl shadow-md transition-all"
                                onClick={handleExportPDF}
                                title="Descargar PDF oficial"
                            >
                                <ExternalLink className="h-4 w-4 sm:mr-1.5" />
                                <span className="hidden sm:inline">Descargar PDF</span>
                            </Button>
                        </div>
                    </div>

                    {/* Título y Badges del Curso */}
                    <div className="pt-6 pb-2">
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                            <span className="bg-white/20 backdrop-blur-sm text-white text-[11px] font-bold px-2.5 py-0.5 rounded-lg uppercase tracking-wider border border-white/20">
                                {course.code}
                            </span>
                            <span className="bg-white/15 text-red-100 text-[11px] font-semibold px-2.5 py-0.5 rounded-lg">
                                Nivel {getSpanishLevel(course.level)}
                            </span>
                            {course.isActive === false ? (
                                <span className="bg-amber-400 text-amber-950 text-[11px] font-bold px-2.5 py-0.5 rounded-lg flex items-center gap-1 shadow-sm">
                                    <AlertCircle className="h-3 w-3" /> Inscripciones Cerradas
                                </span>
                            ) : (
                                <span className="bg-emerald-500 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-lg flex items-center gap-1 shadow-sm">
                                    <Sparkles className="h-3 w-3" /> Convocatoria Abierta
                                </span>
                            )}
                        </div>

                        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-white max-w-4xl">
                            {course.title}
                        </h1>
                    </div>
                </div>
            </div>

            {/* Contenedor Principal */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6">

                {/* Barra de Fichas Rápidas (Quick Stats) - Se adapta dinámicamente según los datos existentes */}
                {hasQuickStats && (
                    <div className="-mt-5 relative z-20 mb-8">
                        <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/70 border border-slate-100 p-3 sm:p-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 print:border-slate-300 print:shadow-none">
                            {course.duration && course.duration > 0 ? (
                                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50/80 border border-slate-100/80">
                                    <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                        <Clock className="h-5 w-5" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">Duración</p>
                                        <p className="text-sm sm:text-base font-extrabold text-slate-800 truncate">{course.duration}h lectivas</p>
                                    </div>
                                </div>
                            ) : null}

                            {course.durationPeriod ? (
                                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50/80 border border-slate-100/80">
                                    <div className="h-10 w-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                                        <Calendar className="h-5 w-5" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">Período</p>
                                        <p className="text-sm sm:text-base font-extrabold text-slate-800 truncate">{course.durationPeriod}</p>
                                    </div>
                                </div>
                            ) : null}

                            {course.startDate ? (
                                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50/80 border border-slate-100/80">
                                    <div className="h-10 w-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                                        <Calendar className="h-5 w-5" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">Fecha de Inicio</p>
                                        <p className="text-sm sm:text-base font-extrabold text-slate-800 truncate">
                                            {formatCourseStartDate(course.startDate, course.startDateHasDay)}
                                        </p>
                                    </div>
                                </div>
                            ) : null}

                            {course.modules && course.modules.length > 0 ? (
                                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50/80 border border-slate-100/80">
                                    <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                                        <Layers className="h-5 w-5" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">Temario</p>
                                        <p className="text-sm sm:text-base font-extrabold text-slate-800 truncate">
                                            {course.modules.length} {course.modules.length === 1 ? 'Módulo' : 'Módulos'}
                                        </p>
                                    </div>
                                </div>
                            ) : null}

                            {course.minStudents && course.minStudents > 0 ? (
                                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-amber-50/60 border border-amber-200/70">
                                    <div className="h-10 w-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                                        <Users className="h-5 w-5" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[10px] font-bold text-amber-800 uppercase tracking-wider truncate">Grupo Mínimo</p>
                                        <p className="text-sm sm:text-base font-extrabold text-amber-950 truncate">{course.minStudents} alumnos</p>
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    </div>
                )}

                {/* Rejilla de Dos Columnas: Contenido Principal + Tarjeta Lateral */}
                <div className={`grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-start ${!hasQuickStats ? 'mt-6' : ''}`}>

                    {/* COLUMNA IZQUIERDA: Información del Programa (2 columnas en desktop) */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Card: Descripción del Programa */}
                        <Card className="border-none shadow-sm rounded-2xl bg-white overflow-hidden border border-slate-100/80">
                            <CardHeader className="bg-slate-50/70 border-b border-slate-100 py-4 px-6">
                                <div className="flex items-center gap-2 text-slate-700 text-xs font-bold uppercase tracking-wider">
                                    <ShieldCheck className="h-4 w-4 text-red-600" />
                                    Descripción del Programa
                                </div>
                            </CardHeader>
                            <CardContent className="p-6 sm:p-7">
                                <p className="text-slate-700 text-base leading-relaxed whitespace-pre-wrap">
                                    {course.publicDescription || course.description || "Este programa formativo ofrece una capacitación completa y actualizada adaptada a las necesidades de los profesionales y opositores. Contacta con nosotros para consultar el programa detallado."}
                                </p>

                                {/* Bloque: Beneficios / ¿Qué aprenderás? (Solo si existen) */}
                                {benefitsList.length > 0 && (
                                    <div className="mt-8 pt-6 border-t border-slate-100">
                                        <h3 className="text-slate-900 font-extrabold text-lg mb-4 flex items-center gap-2">
                                            <div className="h-6 w-6 bg-red-600 text-white rounded-lg flex items-center justify-center font-bold text-xs">✓</div>
                                            ¿Qué aprenderás con este curso?
                                        </h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {benefitsList.map((benefit, i) => (
                                                <div key={i} className="flex items-start gap-2.5 p-3.5 bg-slate-50/80 rounded-xl border border-slate-100">
                                                    <CheckCircle2 className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                                                    <span className="text-slate-700 text-xs sm:text-sm font-medium leading-snug">{benefit}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Card: Módulos / Temario (Solo si existen) */}
                        {course.modules && course.modules.length > 0 && (
                            <Card className="border-none shadow-sm rounded-2xl bg-white overflow-hidden border border-slate-100/80">
                                <CardHeader className="bg-slate-50/70 border-b border-slate-100 py-4 px-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-slate-700 text-xs font-bold uppercase tracking-wider">
                                            <BookOpen className="h-4 w-4 text-indigo-600" />
                                            Contenido y Módulos
                                        </div>
                                        <Badge variant="secondary" className="text-[10px] font-bold">
                                            {course.modules.length} {course.modules.length === 1 ? 'módulo' : 'módulos'}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6 space-y-3">
                                    {course.modules.map((module, i) => (
                                        <div
                                            key={i}
                                            className="p-4 rounded-xl bg-slate-50/60 border border-slate-100/80 hover:border-slate-200 transition-all flex items-start gap-3"
                                        >
                                            <div className="h-7 w-7 rounded-lg bg-indigo-50 text-indigo-700 font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                                                {i + 1}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold text-slate-900 text-sm sm:text-base leading-snug">{module.title}</h4>
                                                {module.description && (
                                                    <p className="text-slate-500 text-xs mt-1 leading-relaxed">{module.description}</p>
                                                )}
                                                {module.teacher?.name && (
                                                    <p className="text-slate-400 text-[11px] mt-1.5 font-medium flex items-center gap-1">
                                                        <User className="h-3 w-3" /> Docente: {module.teacher.name}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        )}

                        {/* Card: Días y Horarios de Clase (Solo si existen) */}
                        {course.schedules && course.schedules.length > 0 && (
                            <Card className="border-none shadow-sm rounded-2xl bg-white overflow-hidden border border-slate-100/80">
                                <CardHeader className="bg-slate-50/70 border-b border-slate-100 py-4 px-6">
                                    <div className="flex items-center gap-2 text-slate-700 text-xs font-bold uppercase tracking-wider">
                                        <Clock className="h-4 w-4 text-blue-600" />
                                        Días y Horarios de Clase
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6 space-y-3">
                                    {course.schedules.map((schedule, i) => (
                                        <div
                                            key={i}
                                            className="p-4 rounded-xl bg-blue-50/30 border border-blue-100/60 flex items-center justify-between gap-4"
                                        >
                                            <div className="space-y-0.5">
                                                <p className="text-xs font-black uppercase text-blue-700 tracking-wider">
                                                    Sesión programada
                                                </p>
                                                <p className="text-sm sm:text-base font-bold text-slate-900">
                                                    {getSpanishSchedule(schedule, course.startDate)}
                                                </p>
                                                {schedule.classroom && (
                                                    <p className="text-xs text-slate-500 flex items-center gap-1 pt-0.5">
                                                        <Info className="h-3.5 w-3.5 text-slate-400" /> Aula / Lugar: {schedule.classroom}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* COLUMNA DERECHA: Sidebar CTA / Tarjeta de Matrícula e Inversión */}
                    <div className="space-y-6">
                        <Card className="border-none shadow-xl shadow-slate-200/80 bg-white rounded-3xl overflow-hidden border border-slate-100 lg:sticky lg:top-6">
                            <div className="bg-red-600 h-2 w-full" />
                            <CardContent className="p-6 sm:p-7 space-y-6">

                                {/* Título de la tarjeta */}
                                <div className="text-center pb-2 border-b border-slate-100">
                                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                                        Inversión y Matrícula
                                    </p>
                                </div>

                                {/* Requisito de grupo mínimo si aplica */}
                                {course.minStudents && course.minStudents > 0 && (
                                    <div className="p-3 bg-amber-50/80 border border-amber-200/80 rounded-2xl flex items-start gap-2.5">
                                        <div className="h-6 w-6 rounded-lg bg-amber-200 text-amber-900 flex items-center justify-center shrink-0 mt-0.5">
                                            <Users className="h-3.5 w-3.5" />
                                        </div>
                                        <div className="text-xs text-amber-950 leading-snug">
                                            <span className="font-bold">Grupo mínimo requerido: </span>
                                            Se requiere un mínimo de <strong>{course.minStudents} alumnos</strong> inscritos para la realización del curso.
                                        </div>
                                    </div>
                                )}

                                {/* Bloques de Precios: Diseño vertical anti-desbordamiento */}
                                <div className="space-y-3">
                                    {/* Precio Afiliados UGT */}
                                    <div className={`p-4 rounded-2xl border transition-all text-center ${course.affiliatePrice && course.affiliatePrice > 0 ? 'bg-emerald-50/70 border-emerald-200/80' : 'bg-slate-50 border-slate-100 opacity-60'}`}>
                                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider mb-1.5">
                                            <Award className="h-3 w-3" /> Tarifa Afiliados UGT
                                        </div>
                                        {course.affiliatePrice && course.affiliatePrice > 0 ? (
                                            (() => {
                                                const frac = getFractionInfo(course.affiliatePrice, course.paymentFrequency);
                                                if (frac) {
                                                    return (
                                                        <div className="space-y-1">
                                                            <p className="text-3xl sm:text-4xl font-black text-emerald-700 tracking-tight">
                                                                {frac.mainDisplay} <span className="text-xs font-bold text-emerald-800">/ plazo</span>
                                                            </p>
                                                            <div className="inline-block px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-900 text-[11px] font-bold">
                                                                {frac.count} plazos de {frac.mainDisplay}
                                                            </div>
                                                            <p className="text-[11px] font-semibold text-emerald-800/80 pt-0.5">
                                                                Total del curso: {frac.totalPrice.toFixed(2)} €
                                                            </p>
                                                        </div>
                                                    );
                                                }
                                                return (
                                                    <div className="space-y-0.5">
                                                        <p className="text-3xl sm:text-4xl font-black text-emerald-700 tracking-tight">
                                                            {course.affiliatePrice.toFixed(2)} €
                                                        </p>
                                                        <p className="text-xs font-semibold text-emerald-800/80">
                                                            {[getPriceUnitLabel(course.priceUnit), getFrequencyLabel(course.paymentFrequency)].filter(Boolean).join(' · ') || 'Precio total'}
                                                        </p>
                                                    </div>
                                                );
                                            })()
                                        ) : (
                                            <p className="text-base font-bold text-slate-500 py-1 italic">Consultar precio</p>
                                        )}
                                    </div>

                                    {/* Precio General (No Afiliados) — únicamente visible si el curso está disponible para no afiliados */}
                                    {course.availableForNonMembers !== false && (
                                        <div className={`p-3.5 rounded-2xl border text-center ${course.price && course.price > 0 ? 'bg-slate-50 border-slate-200/70' : 'bg-slate-50 border-slate-100 opacity-60'}`}>
                                            <p className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
                                                Precio General (No Afiliados)
                                            </p>
                                            {course.price && course.price > 0 ? (
                                                (() => {
                                                    const frac = getFractionInfo(course.price, course.paymentFrequency);
                                                    if (frac) {
                                                        return (
                                                            <div className="space-y-1">
                                                                <p className="text-2xl font-black text-slate-900 tracking-tight">
                                                                    {frac.mainDisplay} <span className="text-xs font-medium text-slate-500">/ plazo</span>
                                                                </p>
                                                                <p className="text-xs font-medium text-slate-600">
                                                                    Total: {frac.totalPrice.toFixed(2)} € ({frac.count} plazos de {frac.mainDisplay})
                                                                </p>
                                                            </div>
                                                        );
                                                    }
                                                    return (
                                                        <div className="space-y-0.5">
                                                            <p className="text-2xl font-black text-slate-900 tracking-tight">
                                                                {course.price.toFixed(2)} €
                                                            </p>
                                                            <p className="text-xs font-medium text-slate-500">
                                                                {[getPriceUnitLabel(course.priceUnit), getFrequencyLabel(course.paymentFrequency)].filter(Boolean).join(' · ') || 'Precio total'}
                                                            </p>
                                                        </div>
                                                    );
                                                })()
                                            ) : (
                                                <p className="text-sm font-bold text-slate-400 py-0.5 italic">Consultar</p>
                                            )}
                                        </div>
                                    )}

                                    {/* Panel de afiliación — solo si el curso no está disponible para no afiliados */}
                                    {course.availableForNonMembers === false && (
                                        <div className="p-4 rounded-2xl border border-red-100 bg-red-50/60 space-y-3">
                                            <div className="flex items-start gap-2.5">
                                                <div className="h-8 w-8 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                                                    <Award className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black text-red-900 leading-snug">
                                                        Programa orientado a afiliados UGT
                                                    </p>
                                                    <p className="text-[11px] text-red-700 mt-0.5 leading-snug">
                                                        Para acceder a las tarifas especiales y participar en este programa, necesitas estar afiliado/a a UGT.
                                                    </p>
                                                </div>
                                            </div>
                                            <a
                                                href="https://ugt-sp.es/afiliate/"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-colors"
                                            >
                                                <ExternalLink className="h-3.5 w-3.5" />
                                                Afíliate a UGT
                                            </a>
                                            <div className="pt-1 border-t border-red-100 space-y-1.5">
                                                <p className="text-[10px] font-black text-red-800 uppercase tracking-wider">¿Tienes dudas? Contacta con nosotros</p>
                                                <a href="tel:923271947" className="flex items-center gap-1.5 text-[11px] font-semibold text-red-700 hover:text-red-900 transition-colors">
                                                    <Phone className="h-3.5 w-3.5 shrink-0" />
                                                    923 271 947
                                                </a>
                                                <a href="mailto:ugt@salamanca.ugt.org" className="flex items-center gap-1.5 text-[11px] font-semibold text-red-700 hover:text-red-900 transition-colors">
                                                    <Mail className="h-3.5 w-3.5 shrink-0" />
                                                    ugt@salamanca.ugt.org
                                                </a>
                                            </div>
                                        </div>
                                    )}

                                    {/* Panel de descuentos aplicables */}
                                    {course.hasDiscounts && (
                                        <div className="p-4 rounded-2xl border border-emerald-100 bg-emerald-50/60 space-y-2.5">
                                            <div className="flex items-center gap-2">
                                                <div className="h-7 w-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                                                    <Percent className="h-3.5 w-3.5" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black text-emerald-900 leading-none">
                                                        Descuentos Especiales Disponibles
                                                    </p>
                                                    <p className="text-[10px] text-emerald-700 font-semibold mt-0.5">
                                                        Opciones aplicables al matricularte:
                                                    </p>
                                                </div>
                                            </div>

                                            {getDiscountRules().length > 0 ? (
                                                <div className="space-y-1.5 pt-1 border-t border-emerald-200/50">
                                                    {getDiscountRules().map((r, i) => (
                                                        <div key={r.id || i} className="flex items-start gap-2 text-[11px] text-emerald-900 bg-white/70 p-2 rounded-xl border border-emerald-100">
                                                            <span className="font-black px-1.5 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] shrink-0">
                                                                -{r.percentage}%
                                                            </span>
                                                            <span className="font-medium leading-tight">{r.concept}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-[11px] text-emerald-700 font-medium leading-snug">
                                                    {course.discountDescription || "Descuentos disponibles por haber cursado previamente este programa, antigüedad de afiliación u otros conceptos."}
                                                </p>
                                            )}
                                        </div>
                                    )}

                                </div>{/* end space-y-3 precios */}

                                {/* Características / Incluye */}
                                <div className="space-y-2.5 pt-2 border-t border-slate-100 text-xs text-slate-600 font-medium">
                                    {featuresList.length > 0 ? (
                                        featuresList.map((feature, i) => (
                                            <div key={i} className="flex items-center gap-2.5">
                                                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                                                <span>{feature}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <>
                                            {(course.hasCertificate ?? true) && (
                                                <div className="flex items-center gap-2.5">
                                                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                                                    <span>Certificado de aprovechamiento</span>
                                                </div>
                                            )}
                                            {(course.hasMaterials ?? true) && (
                                                <div className="flex items-center gap-2.5">
                                                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                                                    <span>Material y temario incluido</span>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>

                                {/* Acciones y Botones Principales */}
                                <div className="no-print space-y-3 pt-2">
                                    {course.isActive === false ? (
                                        <div className="space-y-3">
                                            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-center">
                                                <p className="text-xs font-black text-amber-800 uppercase tracking-wide flex items-center justify-center gap-1.5">
                                                    <AlertCircle className="h-4 w-4" /> Inscripciones Cerradas
                                                </p>
                                                <p className="text-[11px] text-amber-700 mt-1 leading-snug">
                                                    Este curso ha concluido o no dispone de plazas abiertas en este momento.
                                                </p>
                                            </div>
                                            <Button
                                                className="w-full min-h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 px-3 py-3 text-center whitespace-normal leading-snug"
                                                onClick={handleInterest}
                                            >
                                                <MessageSquare className="h-4 w-4 shrink-0" />
                                                <span>Consultar próximas convocatorias por WhatsApp</span>
                                            </Button>
                                        </div>
                                    ) : (
                                        <>
                                            <Button
                                                className="w-full min-h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-md shadow-emerald-100 transition-all active:scale-[0.98] flex items-center justify-center gap-2 px-4 py-3 text-center whitespace-normal leading-snug"
                                                onClick={handleInterest}
                                            >
                                                <MessageSquare className="h-4 w-4 shrink-0" />
                                                <span>Reservar / Consultar por WhatsApp</span>
                                            </Button>

                                            <div className="relative py-1 flex items-center">
                                                <div className="flex-grow border-t border-slate-200"></div>
                                                <span className="flex-shrink mx-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">O BIEN</span>
                                                <div className="flex-grow border-t border-slate-200"></div>
                                            </div>

                                            <Dialog open={isDialogOpen} onOpenChange={(open) => {
                                                setIsDialogOpen(open)
                                                if (!open) {
                                                    setShowSuccess(false)
                                                    setFormData({
                                                        name: '',
                                                        email: '',
                                                        phone: '',
                                                        dni: '',
                                                        isAffiliated: course.availableForNonMembers === false ? true : false,
                                                        acceptedPrivacy: false,
                                                        wantsDiscount: false,
                                                        selectedDiscountConcepts: [],
                                                        discountDetails: ''
                                                    })
                                                }
                                            }}>
                                                <DialogTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        className="w-full min-h-12 border-2 border-red-600 text-red-600 hover:bg-red-50 font-bold text-xs sm:text-sm rounded-2xl transition-all shadow-sm flex items-center justify-center gap-2 px-4 py-3 text-center whitespace-normal leading-snug"
                                                    >
                                                        <CheckCircle2 className="h-4 w-4 shrink-0" />
                                                        <span>Inscribirme Online</span>
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="sm:max-w-[500px] border-none shadow-2xl p-0 overflow-hidden bg-white rounded-3xl max-h-[90dvh] flex flex-col">
                                                    {!showSuccess ? (
                                                        <form onSubmit={handleEnroll} className="flex flex-col flex-1 min-h-0 overflow-hidden">
                                                            <DialogHeader className="p-6 sm:p-8 bg-slate-50 border-b shrink-0">
                                                                <div className="bg-red-100 text-red-700 text-[9px] font-black px-2.5 py-0.5 rounded-full w-fit mb-2 tracking-widest uppercase">
                                                                    Paso 1 de 2: Mis datos
                                                                </div>
                                                                <DialogTitle className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                                                                    Formulario de Inscripción
                                                                </DialogTitle>
                                                                <DialogDescription className="text-slate-500 text-xs font-medium leading-relaxed mt-1">
                                                                    Completa tus datos para reservar tu plaza. <br />
                                                                    <span className="text-red-600 font-bold">Tras este paso verás los datos de pago y concepto.</span>
                                                                </DialogDescription>
                                                            </DialogHeader>
                                                            <div className="p-6 sm:p-8 space-y-4 flex-1 overflow-y-auto overscroll-contain">
                                                                <div className="space-y-1.5">
                                                                    <Label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Nombre y Apellidos *</Label>
                                                                    <div className="relative">
                                                                        <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                                                        <Input required className="pl-10 h-11 bg-slate-50 border-slate-200 rounded-xl" placeholder="Tu nombre completo..." value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                                                                    </div>
                                                                </div>
                                                                <div className="space-y-1.5">
                                                                    <Label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">DNI / NIE *</Label>
                                                                    <div className="relative">
                                                                        <Fingerprint className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                                                        <Input required className="pl-10 h-11 bg-slate-50 border-slate-200 rounded-xl" placeholder="12345678X" value={formData.dni} onChange={e => setFormData({ ...formData, dni: e.target.value })} />
                                                                    </div>
                                                                </div>
                                                                <div className="space-y-1.5">
                                                                    <div className="flex items-center justify-between">
                                                                        <Label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                                                                            Correo Electrónico *
                                                                        </Label>
                                                                        <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-100 flex items-center gap-1">
                                                                            <Sparkles className="h-2.5 w-2.5 text-red-500" /> Preferiblemente @gmail.com
                                                                        </span>
                                                                    </div>
                                                                    <div className="relative">
                                                                        <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                                                        <Input
                                                                            required
                                                                            className="pl-10 h-11 bg-slate-50 border-slate-200 rounded-xl"
                                                                            type="email"
                                                                            placeholder="ejemplo@gmail.com"
                                                                            value={formData.email}
                                                                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                                                                        />
                                                                    </div>
                                                                    <p className="text-[11px] text-slate-500 leading-tight">
                                                                        Te aconsejamos indicar una cuenta de <strong className="text-slate-700">Gmail</strong> para facilitarte el acceso directo al aula virtual (Google Classroom / Meet) y los materiales docentes.
                                                                    </p>
                                                                    {formData.email && formData.email.includes('@') && !formData.email.toLowerCase().includes('@gmail.com') && (
                                                                        <div className="p-2.5 bg-amber-50/90 border border-amber-200/90 rounded-xl flex items-start gap-2 text-[11px] text-amber-900">
                                                                            <Info className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                                                                            <p className="leading-snug">
                                                                                <strong>Nota informativa:</strong> Si dispones de cuenta <span className="underline font-semibold">@gmail.com</span>, te recomendamos utilizarla para que tu alta en Google Classroom sea inmediata y sin incompatibilidades.
                                                                            </p>
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                <div className="space-y-1.5">
                                                                    <Label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Teléfono de Contacto (Móvil / WhatsApp)</Label>
                                                                    <div className="relative">
                                                                        <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                                                        <Input className="pl-10 h-11 bg-slate-50 border-slate-200 rounded-xl" placeholder="600000000" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                                                                    </div>
                                                                </div>

                                                                {course.availableForNonMembers === false ? (
                                                                    <div className="p-3.5 bg-red-50/70 rounded-xl border border-red-200 flex items-center space-x-3 select-none">
                                                                        <Checkbox
                                                                            id="is-affiliated"
                                                                            checked={true}
                                                                            disabled={true}
                                                                        />
                                                                        <div className="flex-1">
                                                                            <Label htmlFor="is-affiliated" className="text-xs font-bold text-red-900 block">
                                                                                Afiliado/a a UGT (Obligatorio)
                                                                            </Label>
                                                                            <p className="text-[10px] text-red-600 font-medium">Este curso es de participación exclusiva para miembros afiliados a UGT.</p>
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <div className="p-3.5 bg-red-50/50 rounded-xl border border-red-100 flex items-center space-x-3 select-none">
                                                                        <Checkbox
                                                                            id="is-affiliated"
                                                                            checked={formData.isAffiliated}
                                                                            onCheckedChange={(checked) => setFormData({ ...formData, isAffiliated: !!checked })}
                                                                        />
                                                                        <div className="flex-1 cursor-pointer">
                                                                            <Label htmlFor="is-affiliated" className="text-xs font-bold text-red-900 cursor-pointer block">
                                                                                Soy afiliado/a a UGT
                                                                            </Label>
                                                                            <p className="text-[10px] text-red-600 font-medium">Se aplicará la tarifa bonificada de afiliación.</p>
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {course.hasDiscounts && (
                                                                    <div className="space-y-2.5 pt-1">
                                                                        <div className="flex items-center justify-between">
                                                                            <Label className="text-[11px] font-black uppercase text-slate-700 tracking-wider flex items-center gap-1.5">
                                                                                <Percent className="h-3.5 w-3.5 text-emerald-600" />
                                                                                ¿Te corresponde algún descuento especial? (Acumulables)
                                                                            </Label>
                                                                            {formData.selectedDiscountConcepts.length > 0 && (
                                                                                <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full animate-pulse">
                                                                                    -{totalDiscountPercentage}% Total Acumulado
                                                                                </span>
                                                                            )}
                                                                        </div>

                                                                        <div className="space-y-1.5">
                                                                            {/* Opción Sin Descuento */}
                                                                            <div
                                                                                onClick={() => {
                                                                                    setFormData({
                                                                                        ...formData,
                                                                                        wantsDiscount: false,
                                                                                        selectedDiscountConcepts: [],
                                                                                        discountDetails: ''
                                                                                    })
                                                                                }}
                                                                                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                                                                                    formData.selectedDiscountConcepts.length === 0
                                                                                        ? 'bg-slate-50 border-slate-300 ring-1 ring-slate-300'
                                                                                        : 'bg-white border-slate-200 hover:border-slate-300'
                                                                                }`}
                                                                            >
                                                                                <div className="flex items-center gap-2.5">
                                                                                    <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                                                                                        formData.selectedDiscountConcepts.length === 0 ? 'border-slate-800 bg-slate-800' : 'border-slate-300'
                                                                                    }`}>
                                                                                        {formData.selectedDiscountConcepts.length === 0 && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                                                                                    </div>
                                                                                    <span className="text-xs font-semibold text-slate-700">Sin descuento / Tarifa general</span>
                                                                                </div>
                                                                            </div>

                                                                            {/* Lista de descuentos configurados en el curso con multiselección */}
                                                                            {availableRules.map((rule, idx) => {
                                                                                const isSelected = formData.selectedDiscountConcepts.includes(rule.concept);
                                                                                return (
                                                                                    <div
                                                                                        key={rule.id || idx}
                                                                                        onClick={() => {
                                                                                            const nextSelected = isSelected
                                                                                                ? formData.selectedDiscountConcepts.filter(c => c !== rule.concept)
                                                                                                : [...formData.selectedDiscountConcepts, rule.concept];
                                                                                            setFormData({
                                                                                                ...formData,
                                                                                                wantsDiscount: nextSelected.length > 0,
                                                                                                selectedDiscountConcepts: nextSelected
                                                                                            })
                                                                                        }}
                                                                                        className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 ${
                                                                                            isSelected
                                                                                                ? 'bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/30 shadow-sm'
                                                                                                : 'bg-white border-slate-200 hover:border-emerald-200 hover:bg-emerald-50/20'
                                                                                        }`}
                                                                                    >
                                                                                        <div className={`h-4 w-4 rounded-md border mt-0.5 shrink-0 flex items-center justify-center ${
                                                                                            isSelected ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-300 bg-white'
                                                                                        }`}>
                                                                                            {isSelected && <CheckCircle2 className="h-3.5 w-3.5" />}
                                                                                        </div>
                                                                                        <div className="flex-1">
                                                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                                                <span className="font-black text-[11px] px-2 py-0.5 rounded-md bg-emerald-600 text-white leading-none">
                                                                                                    -{rule.percentage}%
                                                                                                </span>
                                                                                                <span className="text-xs font-bold text-slate-800 leading-snug">
                                                                                                    {rule.concept}
                                                                                                </span>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                );
                                                                            })}
                                                                        </div>

                                                                        {formData.selectedDiscountConcepts.length > 0 && (
                                                                            <div className="space-y-1.5 pt-1">
                                                                                <Label className="text-[10px] font-black uppercase text-emerald-900 tracking-wider">
                                                                                    Observaciones / Justificación adicional (Opcional)
                                                                                </Label>
                                                                                <Input
                                                                                    className="h-10 bg-emerald-50/30 border-emerald-200 rounded-xl text-xs"
                                                                                    placeholder="Ej: Año en que realicé el curso anterior, años de antigüedad, etc."
                                                                                    value={formData.discountDetails}
                                                                                    onChange={e => setFormData({ ...formData, discountDetails: e.target.value })}
                                                                                />
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                )}

                                                                {/* Cláusula Informativa RGPD / Capa 1 y Consentimiento */}
                                                                <div className="space-y-2.5 pt-1">
                                                                    <div className="p-3 bg-slate-50 border border-slate-200/90 rounded-xl text-[11px] text-slate-600 leading-relaxed space-y-1">
                                                                        <div className="flex items-center gap-1.5 font-bold text-slate-800 text-[11px] mb-0.5">
                                                                            <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                                                                            <span>Información básica de Protección de Datos (RGPD)</span>
                                                                        </div>
                                                                        <p>
                                                                            <strong className="text-slate-700">Responsable:</strong> UGT SP.
                                                                        </p>
                                                                        <p>
                                                                            <strong className="text-slate-700">Finalidad:</strong> Tramitar y gestionar tu solicitud de pre-inscripción y reserva de plaza en el curso, así como la posterior comunicación formativa.
                                                                        </p>
                                                                        <p>
                                                                            <strong className="text-slate-700">Legitimación:</strong> Tu consentimiento explícito al formalizar este formulario y ejecución de la solicitud.
                                                                        </p>
                                                                        <p>
                                                                            <strong className="text-slate-700">Derechos y DPO:</strong> Tienes derecho a acceder, rectificar y suprimir tus datos en <a href="mailto:dpo@ugt-sp.eu" className="text-red-600 font-semibold hover:underline">dpo@ugt-sp.eu</a>.
                                                                        </p>
                                                                    </div>

                                                                    <div className="p-3 rounded-xl border border-slate-200 bg-white flex items-start space-x-3 select-none">
                                                                        <Checkbox
                                                                            id="accepted-privacy"
                                                                            required
                                                                            checked={formData.acceptedPrivacy}
                                                                            onCheckedChange={(checked) => setFormData({ ...formData, acceptedPrivacy: !!checked })}
                                                                            className="mt-0.5"
                                                                        />
                                                                        <div className="flex-1 text-xs text-slate-700 leading-snug">
                                                                            <Label htmlFor="accepted-privacy" className="cursor-pointer font-medium text-slate-800">
                                                                                He leído y acepto la{" "}
                                                                                <a
                                                                                    href="https://ugtsanidadsalamanca.github.io/-rgpd-formacion/"
                                                                                    target="_blank"
                                                                                    rel="noopener noreferrer"
                                                                                    className="text-red-600 font-bold hover:underline inline-flex items-center gap-0.5"
                                                                                >
                                                                                    Política de Privacidad y Protección de Datos
                                                                                    <ExternalLink className="h-3 w-3 inline ml-0.5" />
                                                                                </a>{" "}
                                                                                *
                                                                            </Label>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <DialogFooter className="p-6 bg-slate-50 border-t shrink-0">
                                                                <Button type="submit" disabled={isSubmitting} className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-bold uppercase text-xs tracking-wider rounded-xl shadow-md">
                                                                    {isSubmitting ? "Procesando..." : "Confirmar Pre-inscripción"}
                                                                </Button>
                                                            </DialogFooter>
                                                        </form>
                                                    ) : (
                                                        <div className="p-6 sm:p-8 text-center flex-1 overflow-y-auto overscroll-contain">
                                                            <div className="h-16 w-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                                                <CheckCircle2 className="h-8 w-8" />
                                                            </div>
                                                            <div className="bg-emerald-100 text-emerald-700 text-[9px] font-black px-2.5 py-0.5 rounded-full w-fit mb-2 tracking-widest uppercase mx-auto">
                                                                Paso 2 de 2: Pago
                                                            </div>
                                                            <h2 className="text-2xl font-black text-slate-900 mb-1">¡Pre-inscripción realizada!</h2>
                                                            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 mb-6 text-left space-y-3.5">
                                                                <div className="space-y-1">
                                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                                                        <Euro className="h-3 w-3" /> Importe a transferir
                                                                    </p>
                                                                    <div className="bg-red-50 rounded-xl border border-red-100 p-3 text-center space-y-2">
                                                                        {(() => {
                                                                            const rawBasePrice = formData.isAffiliated ? course.affiliatePrice : course.price;
                                                                            const hasDiscount = formData.selectedDiscountConcepts.length > 0 && totalDiscountPercentage > 0;
                                                                            const activePrice = rawBasePrice !== undefined && rawBasePrice !== null
                                                                                ? (hasDiscount ? Math.round(rawBasePrice * (1 - (totalDiscountPercentage / 100)) * 100) / 100 : rawBasePrice)
                                                                                : undefined;

                                                                            const frac = getFractionInfo(activePrice, course.paymentFrequency);
                                                                            if (frac) {
                                                                                return (
                                                                                    <>
                                                                                        <p className="text-2xl font-black text-red-700">
                                                                                            {frac.mainDisplay}
                                                                                            <span className="text-xs font-bold text-red-500 ml-1">
                                                                                                (1.er Plazo de {frac.count})
                                                                                            </span>
                                                                                        </p>
                                                                                        <div className="text-[10px] font-semibold text-slate-600 space-y-0.5 pt-1 border-t border-red-200/60">
                                                                                            <p>Total: {frac.totalPrice.toFixed(2)} € en {frac.count} cuotas · Tarifa {formData.isAffiliated ? 'Afiliado UGT' : 'General'}</p>
                                                                                            {hasDiscount && (
                                                                                                <p className="text-emerald-700 font-bold">
                                                                                                    🏷️ Descuento acumulado del -{totalDiscountPercentage}% aplicado ({discountReasonText})
                                                                                                </p>
                                                                                            )}
                                                                                        </div>
                                                                                    </>
                                                                                );
                                                                            }
                                                                            return (
                                                                                <>
                                                                                    <p className="text-2xl font-black text-red-700">
                                                                                        {activePrice !== undefined ? `${activePrice.toFixed(2)} €` : 'Por consultar'}
                                                                                    </p>
                                                                                    <div className="text-[10px] font-semibold text-slate-600 space-y-0.5 pt-1 border-t border-red-200/60">
                                                                                        <p>Tarifa {formData.isAffiliated ? 'Afiliado UGT' : 'General'}{rawBasePrice && hasDiscount ? ` (Base: ${rawBasePrice.toFixed(2)} €)` : ''}</p>
                                                                                        {hasDiscount && (
                                                                                            <p className="text-emerald-700 font-bold">
                                                                                                🏷️ Descuento acumulado del -{totalDiscountPercentage}% aplicado ({discountReasonText})
                                                                                            </p>
                                                                                        )}
                                                                                    </div>
                                                                                </>
                                                                            );
                                                                        })()}
                                                                    </div>
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                                                        <CreditCard className="h-3 w-3" /> Cuenta Bancaria (IBAN)
                                                                    </p>
                                                                    <p className="text-xs font-bold text-slate-800 select-all block p-2 bg-white rounded-lg border border-slate-200 text-center font-mono">
                                                                        ES59 2103 2347 4000 3377 9482
                                                                    </p>
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                                                        <Info className="h-3 w-3" /> Concepto obligatorio
                                                                    </p>
                                                                    <p className="text-xs font-black text-red-700 select-all block p-2 bg-red-50 rounded-lg border border-red-100 text-center tracking-widest font-mono">
                                                                        {paymentConcept}
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            <div className="p-3 bg-emerald-50/80 border border-emerald-150 rounded-xl flex items-start gap-2.5 text-left mb-5">
                                                                <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                                                                <p className="text-[11px] text-emerald-950/85 leading-relaxed">
                                                                    <strong className="text-emerald-900 font-bold block mb-0.5">Garantía de Confidencialidad y Custodia RGPD</strong>
                                                                    Los datos de tu reserva están custodiados de forma segura por UGT Castilla y León conforme al RGPD. Puedes consultar la <a href="https://ugtsanidadsalamanca.github.io/-rgpd-formacion/" target="_blank" rel="noopener noreferrer" className="text-emerald-800 font-bold underline hover:text-emerald-950">política de privacidad oficial</a>.
                                                                </p>
                                                            </div>

                                                            <Button onClick={() => setIsDialogOpen(false)} className="w-full h-11 bg-slate-900 hover:bg-black text-white font-bold rounded-xl text-xs">
                                                                Cerrar y guardar justificante
                                                            </Button>
                                                        </div>
                                                    )}
                                                </DialogContent>
                                            </Dialog>
                                        </>
                                    )}

                                    {/* Enlace a convocatoria oficial si existe */}
                                    {course.callUrl && (
                                        <Button
                                            variant="outline"
                                            className="w-full min-h-11 border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-xs rounded-2xl transition-all flex items-center justify-center gap-1.5"
                                            onClick={() => window.open(course.callUrl, '_blank')}
                                        >
                                            <FileText className="h-4 w-4" /> Ver Convocatoria Oficial
                                        </Button>
                                    )}
                                </div>

                                {/* Información de Contacto de Formación */}
                                <div className="pt-4 border-t border-slate-100 space-y-2 text-xs">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                        Contacto UGT Formación
                                    </p>
                                    <div className="space-y-1 text-slate-600">
                                        <a href="mailto:formacion.salamanca@ugt-sp.ugt.org" className="text-red-600 hover:underline font-medium block truncate text-[11px]">
                                            formacion.salamanca@ugt-sp.ugt.org
                                        </a>
                                        <p className="font-bold text-slate-800 text-[11px] pt-1">
                                            Teléfono: +34 600 43 71 34
                                        </p>
                                    </div>
                                </div>

                            </CardContent>
                        </Card>
                    </div>

                </div>
            </div>

            {/* Footer Institucional con Enlaces y Protección de Datos */}
            <footer className="mt-16 border-t border-slate-200/80 bg-slate-100/70 py-8 no-print text-slate-600 text-xs">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-5">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-200">
                        <div className="flex items-center gap-3">
                            <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-200 shrink-0">
                                <img
                                    src="/ugt-logo.png"
                                    alt="Logo UGT"
                                    className="h-8 w-auto object-contain"
                                />
                            </div>
                            <div>
                                <p className="font-extrabold text-slate-800 text-sm uppercase tracking-tight">
                                    Servicios Públicos UGT Salamanca
                                </p>
                                <p className="text-[11px] text-slate-500 font-medium">
                                    Portal Oficial de Formación y Oposiciones · UGT Salamanca
                                </p>
                            </div>
                        </div>

                        <div className="text-xs text-slate-500 font-medium text-center sm:text-right">
                            <p>© {currentYear} UGT Salamanca · C/ Gran Vía, 79-81 · 37001 Salamanca</p>
                        </div>
                    </div>

                    {/* Bloque Resumido RGPD */}
                    <div
                        role="note"
                        aria-label="Información resumida sobre protección de datos"
                        className="mt-4 p-3.5 sm:p-4 border border-[#e5e5e7] border-l-4 border-l-[#e4002b] rounded-lg bg-[#fafafa] text-[#38383d] text-xs sm:text-[13px] leading-relaxed text-left"
                    >
                        <strong className="text-[#1e1e24] font-bold">Protección de datos. </strong>
                        Responsable: Unión General de Trabajadores de Servicios Públicos (CIF G-78085149). Tus datos se tratarán para gestionar tu inscripción y, en su caso, la organización, desarrollo y seguimiento de la acción formativa, acceso a plataformas, emisión de certificados y las gestiones legalmente necesarias asociadas a la formación. La base jurídica es tu consentimiento, la ejecución de la relación formativa y el cumplimiento de las obligaciones legales aplicables. Podrán comunicarse datos a estructuras de UGT y a las Administraciones Públicas cuando resulte necesario. Puedes ejercer tus derechos de acceso, rectificación, supresión, oposición, limitación y portabilidad escribiendo a{" "}
                        <a href="mailto:dpo@ugt-sp.eu" className="text-[#b00020] font-bold underline underline-offset-2 hover:text-red-800">
                            dpo@ugt-sp.eu
                        </a>.{" "}
                        <a
                            href="https://ugtsanidadsalamanca.github.io/-rgpd-formacion/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#b00020] font-bold underline underline-offset-2 hover:text-red-800 inline-flex items-center gap-1"
                        >
                            Consulta la información completa sobre protección de datos
                            <ExternalLink className="h-3.5 w-3.5 inline shrink-0" />
                        </a>.
                    </div>

                    <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500 text-center sm:text-left">
                        <p className="flex items-center justify-center gap-1 font-medium">
                            <Lock className="h-3 w-3 text-emerald-600" /> Tratamiento de datos conforme a RGPD y LOPDGDD
                        </p>
                        <p className="text-slate-400">
                            Contacto DPO: <a href="mailto:dpo@ugt-sp.eu" className="hover:underline text-slate-600">dpo@ugt-sp.eu</a>
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    )
}
