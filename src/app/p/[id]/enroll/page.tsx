"use client"

import React, { useEffect, useState, use } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import {
    ArrowLeft,
    BookOpen,
    CheckCircle2,
    ShieldCheck,
    ExternalLink,
    Download,
    Printer,
    Copy,
    Check,
    Info,
    Euro,
    CreditCard,
    Sparkles,
    User,
    Fingerprint,
    Mail,
    Phone,
    Calendar,
    Clock,
    Percent,
    AlertCircle
} from "lucide-react"
import { toast } from "sonner"
import { generateReceiptPdf, ReceiptData } from "@/lib/receipt-pdf"

interface DiscountRule {
    id?: string
    concept: string
    percentage: number
}

interface PublicCourse {
    id: string
    title: string
    code: string
    level?: string
    price?: number
    affiliatePrice?: number
    paymentFrequency?: string
    duration?: number
    durationPeriod?: string
    startDate?: string
    startDateHasDay?: boolean
    availableForNonMembers?: boolean
    hasDiscounts?: boolean
    discountDescription?: string
    discountRules?: string | DiscountRule[]
    isActive?: boolean
}

export default function CourseEnrollPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params)
    const id = resolvedParams.id
    const router = useRouter()

    const [course, setCourse] = useState<PublicCourse | null>(null)
    const [loading, setLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const [copiedIban, setCopiedIban] = useState(false)
    const [copiedConcept, setCopiedConcept] = useState(false)
    const [referenceId, setReferenceId] = useState('')

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

    useEffect(() => {
        if (!id) return
        const fetchCourse = async () => {
            try {
                const response = await fetch(`/api/public/course/${id}`)
                if (response.ok) {
                    const data = await response.json()
                    setCourse(data)
                    // Si el curso es exclusivo para afiliados, marcar por defecto
                    if (data.availableForNonMembers === false) {
                        setFormData(prev => ({ ...prev, isAffiliated: true }))
                    }
                }
            } catch (error) {
                console.error("Error fetching course for enrollment:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchCourse()
    }, [id])

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

    const getFractionInfo = (price?: number | null, frequency?: string) => {
        if (!price || price <= 0) return null
        let count = 0
        if (frequency === '2_PAYMENTS') count = 2
        else if (frequency === '3_PAYMENTS') count = 3
        else if (frequency === '4_PAYMENTS') count = 4
        else if (frequency === '5_PAYMENTS') count = 5
        else if (frequency === '6_PAYMENTS') count = 6

        if (count > 0) {
            const installmentPrice = price / count
            return {
                isFractioned: true,
                count,
                installmentPrice,
                totalPrice: price,
                mainDisplay: `${installmentPrice.toFixed(2)} €`,
                perInstallmentText: `por cuota (${count} plazos)`,
                totalText: `Total del curso: ${price.toFixed(2)} € (${count} cuotas de ${installmentPrice.toFixed(2)} €)`
            }
        }
        return null
    }

    const rawBasePrice = formData.isAffiliated ? course?.affiliatePrice : course?.price
    const hasDiscount = formData.selectedDiscountConcepts.length > 0 && totalDiscountPercentage > 0
    const activePrice = rawBasePrice !== undefined && rawBasePrice !== null
        ? (hasDiscount ? Math.round(rawBasePrice * (1 - (totalDiscountPercentage / 100)) * 100) / 100 : rawBasePrice)
        : undefined

    const frac = getFractionInfo(activePrice, course?.paymentFrequency)

    const currentYear = new Date().getFullYear()
    const paymentConcept = course ? `${course.code}${currentYear}` : ''
    const iban = 'ES59 2103 2347 4000 3377 9482'

    const handleCopy = (text: string, type: 'iban' | 'concept') => {
        navigator.clipboard.writeText(text)
        if (type === 'iban') {
            setCopiedIban(true)
            toast.success("IBAN copiado al portapapeles")
            setTimeout(() => setCopiedIban(false), 2500)
        } else {
            setCopiedConcept(true)
            toast.success("Concepto obligatorio copiado")
            setTimeout(() => setCopiedConcept(false), 2500)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!course) return

        if (!formData.name.trim()) {
            toast.error("Por favor, introduce tu nombre y apellidos.")
            return
        }

        if (!formData.dni.trim()) {
            toast.error("Por favor, introduce tu DNI o NIE.")
            return
        }

        if (!formData.email.trim() || !formData.email.includes('@')) {
            toast.error("Por favor, introduce un correo electrónico válido.")
            return
        }

        if (!formData.acceptedPrivacy) {
            toast.error("Debes aceptar la política de privacidad y protección de datos.")
            return
        }

        setIsSubmitting(true)
        try {
            const hasAnyDiscount = formData.selectedDiscountConcepts.length > 0
            const response = await fetch('/api/public/enroll', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name.trim(),
                    email: formData.email.trim(),
                    phone: formData.phone.trim(),
                    dni: formData.dni.trim().toUpperCase(),
                    isAffiliated: formData.isAffiliated,
                    wantsDiscount: hasAnyDiscount,
                    requestedDiscountPercentage: hasAnyDiscount ? totalDiscountPercentage : null,
                    requestedDiscountConcept: hasAnyDiscount ? discountReasonText : null,
                    discountDetails: formData.discountDetails,
                    courseId: course.id
                })
            })

            const resData = await response.json()

            if (response.ok) {
                const refNum = resData?.enrollment?.id
                    ? `UGT-${currentYear}-${resData.enrollment.id.substring(0, 6).toUpperCase()}`
                    : `UGT-${currentYear}-${Math.floor(1000 + Math.random() * 9000)}`
                setReferenceId(refNum)
                setIsSuccess(true)
                window.scrollTo({ top: 0, behavior: 'smooth' })
                toast.success("¡Pre-inscripción realizada con éxito!")
            } else {
                toast.error(resData.error || "Error al procesar la inscripción")
            }
        } catch (error) {
            console.error("Enrollment error:", error)
            toast.error("Error técnico al conectar con el servidor")
        } finally {
            setIsSubmitting(false)
        }
    }

    const buildReceiptData = (): ReceiptData => {
        return {
            studentName: formData.name.trim().toUpperCase(),
            dni: formData.dni.trim().toUpperCase(),
            email: formData.email.trim().toLowerCase(),
            phone: formData.phone.trim() || undefined,
            isAffiliated: formData.isAffiliated,
            courseTitle: course?.title || '',
            courseCode: course?.code || '',
            courseLevel: course?.level || undefined,
            duration: course?.duration || undefined,
            durationPeriod: course?.durationPeriod || undefined,
            totalAmount: activePrice || 0,
            firstPaymentAmount: frac ? frac.installmentPrice : undefined,
            paymentCount: frac ? frac.count : undefined,
            isFractioned: !!frac,
            paymentFrequencyLabel: frac ? 'Fraccionado' : 'Pago Único',
            discountApplied: hasDiscount ? `-${totalDiscountPercentage}% (${discountReasonText})` : undefined,
            iban: iban,
            paymentConcept: paymentConcept,
            enrollmentDate: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }),
            referenceId: referenceId || `UGT-${currentYear}-REG`
        }
    }

    const handleDownloadPdf = () => {
        try {
            const data = buildReceiptData()
            const doc = generateReceiptPdf(data)
            const cleanCode = (course?.code || 'curso').replace(/[^a-zA-Z0-9-_]/g, '_')
            doc.save(`Justificante_Inscripcion_${cleanCode}_${formData.dni || 'UGT'}.pdf`)
            toast.success("Justificante oficial descargado en formato PDF")
        } catch (error) {
            console.error("Error downloading PDF:", error)
            toast.error("No se pudo generar el PDF. Por favor, inténtalo de nuevo.")
        }
    }

    const handlePrint = () => {
        try {
            const data = buildReceiptData()
            const doc = generateReceiptPdf(data)
            const blobUrl = doc.output('bloburl')
            const printWindow = window.open(blobUrl, '_blank')
            if (printWindow) {
                printWindow.focus()
            } else {
                doc.save(`Justificante_Inscripcion_${course?.code || 'curso'}.pdf`)
            }
        } catch (e) {
            window.print()
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
                <div className="flex flex-col items-center gap-4 p-8 bg-white rounded-3xl shadow-sm border border-slate-100 max-w-sm w-full text-center">
                    <div className="h-16 w-16 rounded-2xl bg-red-50 flex items-center justify-center animate-pulse">
                        <img src="/ugt-logo.png" alt="Logo UGT" className="h-10 w-auto object-contain" />
                    </div>
                    <div>
                        <p className="text-sm font-black text-slate-800 tracking-tight uppercase">Servicios Públicos UGT</p>
                        <p className="text-xs font-bold text-red-600 uppercase tracking-widest mt-0.5">Cargando formulario...</p>
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
                        El curso indicado no existe o el periodo de inscripción no se encuentra habilitado.
                    </CardDescription>
                    <Button className="mt-6 w-full bg-red-600 hover:bg-red-700 text-white font-bold h-12 rounded-2xl" onClick={() => router.push('/')}>
                        Ir al catálogo de formación
                    </Button>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto space-y-6">

                {/* Barra de Navegación Superior */}
                <div className="flex items-center justify-between">
                    <Link
                        href={`/p/${course.id}`}
                        className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600 hover:text-red-600 bg-white hover:bg-red-50 px-3.5 py-2 rounded-xl border border-slate-200 transition-all shadow-sm"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span>Volver a la ficha del curso</span>
                    </Link>

                    <div className="flex items-center gap-2">
                        <img src="/ugt-logo.png" alt="UGT" className="h-8 w-auto object-contain" />
                        <span className="hidden sm:inline text-xs font-black text-slate-700 uppercase tracking-wider">
                            Sanidad y Servicios Públicos
                        </span>
                    </div>
                </div>

                {/* Cabecera del Curso */}
                <Card className="border-none shadow-md bg-white rounded-3xl overflow-hidden">
                    <div className="bg-red-600 h-2 w-full" />
                    <CardContent className="p-5 sm:p-7">
                        <div className="flex flex-wrap items-center gap-2 mb-2.5">
                            <Badge className="bg-red-100 text-red-700 border-none font-black text-[10px] tracking-widest uppercase">
                                {course.code}
                            </Badge>
                            {course.level && (
                                <Badge variant="outline" className="text-slate-600 border-slate-200 font-bold text-[10px]">
                                    {course.level}
                                </Badge>
                            )}
                            {course.duration && (
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 ml-auto">
                                    <Clock className="h-3 w-3 text-slate-400" />
                                    {course.duration} {course.durationPeriod ? course.durationPeriod.toLowerCase() : 'horas'}
                                </span>
                            )}
                        </div>

                        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">
                            {course.title}
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                            Formulario oficial de pre-inscripción y reserva de plaza online.
                        </p>
                    </CardContent>
                </Card>

                {/* PASO 1: Formulario de Inscripción */}
                {!isSuccess ? (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <Card className="border-none shadow-xl bg-white rounded-3xl overflow-hidden">
                            <CardHeader className="bg-slate-50/80 border-b border-slate-100 p-6 sm:p-8">
                                <div className="flex items-center justify-between">
                                    <span className="bg-red-100 text-red-700 text-[10px] font-black px-3 py-1 rounded-full tracking-widest uppercase">
                                        Paso 1 de 2: Mis Datos
                                    </span>
                                    <span className="text-xs text-slate-500 font-medium">
                                        Campos marcados con * obligatorios
                                    </span>
                                </div>
                                <CardTitle className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
                                    Datos del Alumno / Solicitante
                                </CardTitle>
                                <CardDescription className="text-xs text-slate-500 font-medium mt-0.5">
                                    Rellena tus datos personales para formalizar la reserva. En el siguiente paso obtendrás tu justificante bancario oficial.
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="p-6 sm:p-8 space-y-5">
                                {/* Nombre y Apellidos */}
                                <div className="space-y-1.5">
                                    <Label className="text-[11px] font-black uppercase text-slate-600 tracking-wider">
                                        Nombre y Apellidos completos *
                                    </Label>
                                    <div className="relative">
                                        <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                                        <Input
                                            required
                                            className="pl-10 h-12 bg-slate-50 border-slate-200 rounded-xl text-sm font-medium focus:bg-white"
                                            placeholder="Ej: Laura García Gómez"
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {/* DNI / NIE */}
                                <div className="space-y-1.5">
                                    <Label className="text-[11px] font-black uppercase text-slate-600 tracking-wider">
                                        DNI o NIE *
                                    </Label>
                                    <div className="relative">
                                        <Fingerprint className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                                        <Input
                                            required
                                            className="pl-10 h-12 bg-slate-50 border-slate-200 rounded-xl text-sm font-mono uppercase focus:bg-white"
                                            placeholder="12345678Z"
                                            value={formData.dni}
                                            onChange={e => setFormData({ ...formData, dni: e.target.value.toUpperCase() })}
                                        />
                                    </div>
                                </div>

                                {/* Correo Electrónico */}
                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-[11px] font-black uppercase text-slate-600 tracking-wider">
                                            Correo Electrónico *
                                        </Label>
                                        <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-100 flex items-center gap-1">
                                            <Sparkles className="h-2.5 w-2.5 text-red-500" /> Preferiblemente @gmail.com
                                        </span>
                                    </div>
                                    <div className="relative">
                                        <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                                        <Input
                                            required
                                            type="email"
                                            className="pl-10 h-12 bg-slate-50 border-slate-200 rounded-xl text-sm font-medium focus:bg-white"
                                            placeholder="ejemplo@gmail.com"
                                            value={formData.email}
                                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                    <p className="text-[11px] text-slate-500 leading-tight">
                                        Te aconsejamos indicar una cuenta de <strong className="text-slate-700">Gmail</strong> para facilitarte el acceso directo al aula virtual (Google Classroom / Meet) y a los materiales docentes.
                                    </p>
                                    {formData.email && formData.email.includes('@') && !formData.email.toLowerCase().includes('@gmail.com') && (
                                        <div className="p-3 bg-amber-50/90 border border-amber-200/90 rounded-xl flex items-start gap-2.5 text-[11px] text-amber-900">
                                            <Info className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                                            <p className="leading-snug">
                                                <strong>Nota informativa:</strong> Si dispones de cuenta <span className="underline font-semibold">@gmail.com</span>, te sugerimos utilizarla para que tu acceso a Google Classroom sea directo y sin incompatibilidades.
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Teléfono */}
                                <div className="space-y-1.5">
                                    <Label className="text-[11px] font-black uppercase text-slate-600 tracking-wider">
                                        Teléfono de Contacto (Móvil / WhatsApp)
                                    </Label>
                                    <div className="relative">
                                        <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                                        <Input
                                            className="pl-10 h-12 bg-slate-50 border-slate-200 rounded-xl text-sm font-medium focus:bg-white"
                                            placeholder="600 000 000"
                                            value={formData.phone}
                                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {/* Estado de Afiliación a UGT */}
                                {course.availableForNonMembers === false ? (
                                    <div className="p-4 bg-red-50/80 rounded-2xl border border-red-200 flex items-center space-x-3 select-none">
                                        <Checkbox id="is-affiliated-fixed" checked={true} disabled={true} />
                                        <div className="flex-1">
                                            <Label htmlFor="is-affiliated-fixed" className="text-xs sm:text-sm font-bold text-red-950 block">
                                                Afiliado/a a UGT (Obligatorio)
                                            </Label>
                                            <p className="text-[11px] text-red-700 font-medium">
                                                Este curso es exclusivo para personas afiliadas a la Unión General de Trabajadoras y Trabajadores (UGT).
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-4 bg-red-50/50 hover:bg-red-50/80 transition-colors rounded-2xl border border-red-100 flex items-center space-x-3 select-none cursor-pointer">
                                        <Checkbox
                                            id="is-affiliated"
                                            checked={formData.isAffiliated}
                                            onCheckedChange={(checked) => setFormData({ ...formData, isAffiliated: !!checked })}
                                        />
                                        <div className="flex-1" onClick={() => setFormData({ ...formData, isAffiliated: !formData.isAffiliated })}>
                                            <Label htmlFor="is-affiliated" className="text-xs sm:text-sm font-bold text-red-950 cursor-pointer block">
                                                Soy afiliado/a a UGT
                                            </Label>
                                            <p className="text-[11px] text-red-700 font-medium">
                                                Marca esta casilla para beneficiarte de la tarifa bonificada especial para personas afiliadas.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Descuentos Especiales Acumulables */}
                                {course.hasDiscounts && (
                                    <div className="space-y-3 pt-2">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-[11px] font-black uppercase text-slate-700 tracking-wider flex items-center gap-1.5">
                                                <Percent className="h-3.5 w-3.5 text-emerald-600" />
                                                ¿Te corresponde algún descuento adicional? (Acumulables)
                                            </Label>
                                            {formData.selectedDiscountConcepts.length > 0 && (
                                                <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 rounded-full animate-pulse">
                                                    -{totalDiscountPercentage}% Total Acumulado
                                                </span>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            {/* Tarifa sin descuento */}
                                            <div
                                                onClick={() => {
                                                    setFormData({
                                                        ...formData,
                                                        wantsDiscount: false,
                                                        selectedDiscountConcepts: [],
                                                        discountDetails: ''
                                                    })
                                                }}
                                                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                                                    formData.selectedDiscountConcepts.length === 0
                                                        ? 'bg-slate-50 border-slate-300 ring-1 ring-slate-300'
                                                        : 'bg-white border-slate-200 hover:border-slate-300'
                                                }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                                                        formData.selectedDiscountConcepts.length === 0 ? 'border-slate-800 bg-slate-800' : 'border-slate-300'
                                                    }`}>
                                                        {formData.selectedDiscountConcepts.length === 0 && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                                                    </div>
                                                    <span className="text-xs font-bold text-slate-700">Sin descuentos adicionales</span>
                                                </div>
                                            </div>

                                            {/* Lista de reglas de descuento */}
                                            {availableRules.map((rule, idx) => {
                                                const isSelected = formData.selectedDiscountConcepts.includes(rule.concept)
                                                return (
                                                    <div
                                                        key={rule.id || idx}
                                                        onClick={() => {
                                                            const nextSelected = isSelected
                                                                ? formData.selectedDiscountConcepts.filter(c => c !== rule.concept)
                                                                : [...formData.selectedDiscountConcepts, rule.concept]
                                                            setFormData({
                                                                ...formData,
                                                                wantsDiscount: nextSelected.length > 0,
                                                                selectedDiscountConcepts: nextSelected
                                                            })
                                                        }}
                                                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
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
                                                )
                                            })}
                                        </div>

                                        {formData.selectedDiscountConcepts.length > 0 && (
                                            <div className="space-y-1.5 pt-1">
                                                <Label className="text-[11px] font-black uppercase text-emerald-900 tracking-wider">
                                                    Observaciones o Justificación del descuento (Opcional)
                                                </Label>
                                                <Input
                                                    className="h-11 bg-emerald-50/30 border-emerald-200 rounded-xl text-xs font-medium"
                                                    placeholder="Ej: Año de realización del curso anterior, antigüedad, etc."
                                                    value={formData.discountDetails}
                                                    onChange={e => setFormData({ ...formData, discountDetails: e.target.value })}
                                                />
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Resumen del Importe Calculado */}
                                <div className="p-5 bg-gradient-to-br from-slate-50 to-red-50/30 border border-slate-200 rounded-2xl space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                                            <Euro className="h-3.5 w-3.5 text-red-600" /> Cuota de Inscripción
                                        </span>
                                        <Badge variant="outline" className="text-slate-700 bg-white border-slate-200 font-bold text-[10px]">
                                            {formData.isAffiliated ? 'Tarifa Afiliado/a UGT' : 'Tarifa General'}
                                        </Badge>
                                    </div>

                                    <div className="pt-2 border-t border-slate-200 flex items-baseline justify-between">
                                        <div>
                                            <p className="text-3xl font-black text-red-600">
                                                {frac ? frac.mainDisplay : (activePrice !== undefined ? `${activePrice.toFixed(2)} €` : '—')}
                                                {frac && (
                                                    <span className="text-xs font-bold text-slate-500 ml-1.5">
                                                        (1.er Plazo de {frac.count})
                                                    </span>
                                                )}
                                            </p>
                                            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                                                {frac ? frac.totalText : `Total del curso: ${activePrice?.toFixed(2)} € (Pago único)`}
                                            </p>
                                        </div>

                                        {hasDiscount && (
                                            <div className="text-right">
                                                <span className="text-xs font-black text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-lg">
                                                    -{totalDiscountPercentage}% Ahorro
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Protección de Datos RGPD y Aceptación */}
                                <div className="space-y-3 pt-2">
                                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-[11px] text-slate-600 leading-relaxed space-y-1.5">
                                        <div className="flex items-center gap-1.5 font-bold text-slate-800 text-xs mb-0.5">
                                            <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                                            <span>Información básica de Protección de Datos (RGPD)</span>
                                        </div>
                                        <p><strong className="text-slate-700">Responsable del tratamiento:</strong> UGT Servicios Públicos Castilla y León.</p>
                                        <p><strong className="text-slate-700">Finalidad:</strong> Tramitar y gestionar tu solicitud de pre-inscripción, reserva de plaza y comunicaciones docentes.</p>
                                        <p><strong className="text-slate-700">Legitimación:</strong> Tu consentimiento explícito al formalizar esta solicitud.</p>
                                        <p><strong className="text-slate-700">Derechos y Delegado de Protección de Datos:</strong> Puedes ejercer tus derechos de acceso, rectificación y supresión enviando un correo a <a href="mailto:dpo@ugt-sp.eu" className="text-red-600 font-bold hover:underline">dpo@ugt-sp.eu</a>.</p>
                                    </div>

                                    <div className="p-4 rounded-2xl border border-slate-200 bg-white flex items-start space-x-3 select-none">
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
                            </CardContent>

                            <div className="p-6 sm:p-8 bg-slate-50 border-t border-slate-100">
                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full h-14 bg-red-600 hover:bg-red-700 text-white font-black text-sm tracking-wide uppercase rounded-2xl shadow-lg shadow-red-200 transition-all active:scale-[0.99] flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <span>Procesando pre-inscripción...</span>
                                    ) : (
                                        <>
                                            <CheckCircle2 className="h-5 w-5" />
                                            <span>Confirmar y Ver Justificante de Pago</span>
                                        </>
                                    )}
                                </Button>
                                <p className="text-center text-[11px] text-slate-400 mt-2.5 font-medium">
                                    Al pulsar el botón se formalizará tu pre-reserva y se generará tu resguardo bancario con el concepto e IBAN oficial.
                                </p>
                            </div>
                        </Card>
                    </form>
                ) : (
                    /* PASO 2: Confirmación y Justificante Oficial con Descarga PDF Real */
                    <div className="space-y-6">
                        <Card className="border-none shadow-xl bg-white rounded-3xl overflow-hidden">
                            <div className="bg-emerald-500 h-2.5 w-full" />
                            <CardHeader className="p-6 sm:p-8 text-center bg-gradient-to-b from-emerald-50/50 to-transparent border-b border-slate-100">
                                <div className="h-16 w-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner">
                                    <CheckCircle2 className="h-9 w-9" />
                                </div>
                                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest mx-auto">
                                    Paso 2 de 2: Plaza Pre-Reservada
                                </span>
                                <CardTitle className="text-2xl sm:text-3xl font-black text-slate-900 mt-3">
                                    ¡Pre-inscripción realizada con éxito!
                                </CardTitle>
                                <CardDescription className="text-xs sm:text-sm text-slate-600 font-medium max-w-lg mx-auto mt-1">
                                    Tu solicitud ha quedado registrada correctamente. A continuación dispones de los datos para formalizar el abono y descargar tu <strong>justificante oficial</strong>.
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="p-6 sm:p-8 space-y-6">
                                {/* Número de Referencia y Resumen Alumno */}
                                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-wrap items-center justify-between gap-3">
                                    <div>
                                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                                            Número de Referencia
                                        </p>
                                        <p className="text-base font-mono font-black text-slate-900">
                                            {referenceId}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                                            Alumno / DNI
                                        </p>
                                        <p className="text-xs font-bold text-slate-800">
                                            {formData.name.toUpperCase()} · <span className="font-mono">{formData.dni}</span>
                                        </p>
                                    </div>
                                </div>

                                {/* Bloque Financiero e Instrucciones de Transferencia */}
                                <div className="space-y-4">
                                    <h3 className="text-xs font-black uppercase tracking-wider text-red-700 flex items-center gap-1.5">
                                        <CreditCard className="h-4 w-4" /> Datos Bancarios Oficiales para la Transferencia
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Importe */}
                                        <div className="p-4 bg-red-50/70 border border-red-200 rounded-2xl space-y-1">
                                            <p className="text-[10px] font-black uppercase text-red-600 tracking-wider flex items-center gap-1">
                                                <Euro className="h-3 w-3" /> Importe a transferir
                                            </p>
                                            <p className="text-2xl font-black text-red-700">
                                                {frac ? frac.mainDisplay : (activePrice !== undefined ? `${activePrice.toFixed(2)} €` : '—')}
                                            </p>
                                            <p className="text-[11px] text-red-950 font-medium">
                                                {frac
                                                    ? `1.er plazo de ${frac.count} cuotas (${frac.totalText})`
                                                    : `Abono completo del curso (Tarifa ${formData.isAffiliated ? 'Afiliado UGT' : 'General'})`}
                                            </p>
                                        </div>

                                        {/* Titular */}
                                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                                                Titular de la Cuenta
                                            </p>
                                            <p className="text-sm font-bold text-slate-800 leading-snug">
                                                UGT Servicios Públicos de Castilla y León
                                            </p>
                                            <p className="text-[11px] text-slate-500">
                                                Entidad: Unicaja Banco
                                            </p>
                                        </div>
                                    </div>

                                    {/* Cuenta Bancaria IBAN con botón de copiar */}
                                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                                        <div className="flex items-center justify-between">
                                            <p className="text-[10px] font-black uppercase text-slate-500 tracking-wider">
                                                Número de Cuenta Bancaria (IBAN)
                                            </p>
                                            <button
                                                type="button"
                                                onClick={() => handleCopy(iban, 'iban')}
                                                className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 hover:text-red-600 bg-white px-2.5 py-1 rounded-lg border border-slate-200 transition-colors shadow-2xs"
                                            >
                                                {copiedIban ? (
                                                    <>
                                                        <Check className="h-3 w-3 text-emerald-600" />
                                                        <span className="text-emerald-700">Copiado</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Copy className="h-3 w-3" />
                                                        <span>Copiar IBAN</span>
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                        <p className="text-base sm:text-lg font-mono font-black text-slate-900 tracking-wider select-all">
                                            {iban}
                                        </p>
                                    </div>

                                    {/* Concepto obligatorio con botón de copiar */}
                                    <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-2">
                                        <div className="flex items-center justify-between">
                                            <p className="text-[10px] font-black uppercase text-amber-900 tracking-wider flex items-center gap-1.5">
                                                <Info className="h-3.5 w-3.5 text-amber-600" /> Concepto Obligatorio de la Transferencia
                                            </p>
                                            <button
                                                type="button"
                                                onClick={() => handleCopy(paymentConcept, 'concept')}
                                                className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-900 hover:text-amber-950 bg-white px-2.5 py-1 rounded-lg border border-amber-200 transition-colors shadow-2xs"
                                            >
                                                {copiedConcept ? (
                                                    <>
                                                        <Check className="h-3 w-3 text-emerald-600" />
                                                        <span className="text-emerald-700">Copiado</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Copy className="h-3 w-3" />
                                                        <span>Copiar Concepto</span>
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                        <p className="text-base sm:text-lg font-mono font-black text-amber-950 tracking-widest select-all">
                                            {paymentConcept}
                                        </p>
                                        <p className="text-[11px] text-amber-900/80 leading-snug">
                                            <strong>Importante:</strong> Es imprescindible indicar este concepto exacto en tu transferencia para identificar automáticamente tu expediente.
                                        </p>
                                    </div>
                                </div>

                                {/* Instrucciones de envío de resguardo */}
                                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs text-slate-700">
                                    <p className="font-bold text-slate-900">Pasos para completar tu matrícula:</p>
                                    <ol className="list-decimal list-inside space-y-1.5 text-[11px] text-slate-600 leading-relaxed">
                                        <li>Realiza la transferencia desde tu banco online o ventanilla por el importe indicado.</li>
                                        <li>Descarga tu <strong>Justificante Oficial en PDF</strong> con el botón inferior para conservar una copia sellada de tu reserva.</li>
                                        <li>Remite el comprobante emitido por tu banco a la secretaría del curso para la confirmación definitiva de plaza.</li>
                                    </ol>
                                </div>

                                {/* BOTONES DE ACCIÓN REALES Y EFECTIVOS */}
                                <div className="space-y-3 pt-2">
                                    <Button
                                        type="button"
                                        onClick={handleDownloadPdf}
                                        className="w-full h-14 bg-red-600 hover:bg-red-700 text-white font-black text-sm tracking-wide uppercase rounded-2xl shadow-lg shadow-red-200 transition-all flex items-center justify-center gap-2.5 active:scale-[0.99]"
                                    >
                                        <Download className="h-5 w-5" />
                                        <span>Descargar Justificante Oficial (PDF)</span>
                                    </Button>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={handlePrint}
                                            className="h-12 border-slate-200 hover:bg-slate-50 font-bold text-xs rounded-xl flex items-center justify-center gap-2"
                                        >
                                            <Printer className="h-4 w-4 text-slate-600" />
                                            <span>Imprimir Justificante</span>
                                        </Button>

                                        <Link href={`/p/${course.id}`} className="w-full">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className="w-full h-12 border-slate-200 hover:bg-slate-50 font-bold text-xs rounded-xl flex items-center justify-center gap-2"
                                            >
                                                <BookOpen className="h-4 w-4 text-slate-600" />
                                                <span>Volver a la ficha del curso</span>
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    )
}
