"use client"

import { useState, useEffect } from "react"
import { TeacherLayout } from "@/components/layout/teacher-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Users,
    Mail,
    FileSpreadsheet,
    ArrowLeft,
    Calendar,
    Search,
    Phone,
    MapPin,
    CreditCard
} from "lucide-react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { GroupEmailDialog } from "@/components/courses/group-email-dialog"
import { IndividualEmailDialog } from "@/components/students/individual-email-dialog"
import * as XLSX from "xlsx"
import { toast } from "sonner"
import { useParams } from "next/navigation"

export default function TeacherCourseDetail({ params }: { params: Promise<{ id: string }> }) {
    const [courseId, setCourseId] = useState<string | null>(null)
    const [course, setCourse] = useState<any>(null)

    useEffect(() => {
        const resolveParams = async () => {
            const resolvedParams = await params;
            setCourseId(resolvedParams.id);
        };
        resolveParams();
    }, [params]);
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")

    const [showAll, setShowAll] = useState(false)

    // Dialog states
    const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false)
    const [isIndividualEmailOpen, setIsIndividualEmailOpen] = useState(false)
    const [selectedStudent, setSelectedStudent] = useState<any>(null)

    useEffect(() => {
        if (courseId) fetchCourseDetails()
    }, [courseId])

    const fetchCourseDetails = async () => {
        try {
            const res = await fetch(`/api/courses/${courseId}`)
            if (res.ok) {
                const data = await res.json()
                setCourse(data)
            }
        } catch (e) {
            console.error(e)
            toast.error("Error al cargar el curso")
        } finally {
            setLoading(false)
        }
    }

    const handleExportExcel = () => {
        if (!course?.enrollments) return

        const enrollmentsToExport = showAll
            ? course.enrollments
            : course.enrollments.filter((e: any) => e.status !== 'PENDING')

        const data = enrollmentsToExport.map((e: any) => ({
            'Nombre Completo': e.student.name,
            'DNI': e.student.dni || '',
            'Email': e.student.email || '',
            'Teléfono': e.student.phone || '',
            'Dirección': e.student.address || '',
            'Afiliado': e.student.isAffiliated ? 'SÍ' : 'NO',
            'Nº Afiliado': e.student.affiliateNumber || '',
            'Estado Alumno': e.student.status === 'ACTIVE' ? 'Activo' : e.student.status === 'INACTIVE' ? 'Inactivo' : e.student.status,
            'Estado Matrícula': e.status === 'ENROLLED' ? 'Matriculado' : e.status === 'PENDING' ? 'Pendiente' : e.status,
            'Fecha Inscripción': new Date(e.createdAt).toLocaleDateString('es-ES')
        }))

        const ws = XLSX.utils.json_to_sheet(data)
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, "Alumnos")
        XLSX.writeFile(wb, `Alumnos_${course.code}_${course.title.replace(/[^a-z0-9]/gi, '_')}.xlsx`)
        toast.success("Excel generado correctamente")
    }

    const displayEnrollments = course?.enrollments?.filter((enr: any) => {
        if (showAll) return true
        return enr.status !== 'PENDING'
    }) || []

    const filteredEnrollments = displayEnrollments.filter((enr: any) =>
        enr.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        enr.student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        enr.student.dni?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (loading) {
        return (
            <TeacherLayout>
                <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
                    <div className="h-12 w-12 rounded-full border-4 border-slate-100 border-t-red-600 animate-spin" />
                    <p className="text-slate-500 font-medium animate-pulse text-sm uppercase tracking-widest">Cargando datos del curso...</p>
                </div>
            </TeacherLayout>
        )
    }

    if (!course) return <TeacherLayout><div>Curso no encontrado</div></TeacherLayout>

    return (
        <TeacherLayout>
            <div className="space-y-6">
                <div>
                    <Link href="/teacher-portal" className="text-sm text-slate-500 hover:text-blue-600 flex items-center mb-4 transition-colors">
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Volver a mis cursos
                    </Link>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-3xl font-bold text-slate-900">{course.title}</h1>
                                <Badge variant="outline" className="text-lg px-3 py-1 bg-white font-mono">{course.code}</Badge>
                            </div>
                            <div className="flex flex-wrap gap-4 mt-2 text-sm text-slate-500">
                                <span className="flex items-center">
                                    <Calendar className="h-4 w-4 mr-2" />
                                    {course.startDate ? new Date(course.startDate).toLocaleDateString() : 'Sin fecha'}
                                </span>
                                <span className="flex items-center">
                                    <Users className="h-4 w-4 mr-2" />
                                    {displayEnrollments.length} Alumnos {showAll ? '(Total)' : '(Confirmados)'}
                                </span>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                className="border-green-200 text-green-700 hover:bg-green-50 hover:text-green-800"
                                onClick={handleExportExcel}
                            >
                                <FileSpreadsheet className="h-4 w-4 mr-2" />
                                Exportar Excel
                            </Button>
                            <Button
                                className="bg-slate-900 hover:bg-blue-600"
                                onClick={() => setIsEmailDialogOpen(true)}
                            >
                                <Mail className="h-4 w-4 mr-2" />
                                Mensaje Grupal
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="grid gap-6">
                    <Card>
                        <CardHeader>
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div className="flex items-center gap-4 flex-1">
                                    <div className="flex items-center gap-2">
                                        <Users className="h-5 w-5 text-slate-500" />
                                        <CardTitle>Listado de Alumnos</CardTitle>
                                    </div>
                                    <div className="h-8 w-px bg-slate-200 hidden sm:block" />
                                    <div className="flex bg-slate-100 p-1 rounded-lg">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setShowAll(false)}
                                            className={!showAll ? "bg-white shadow-sm text-blue-600 hover:bg-white" : "text-slate-500"}
                                        >
                                            Confirmados
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setShowAll(true)}
                                            className={showAll ? "bg-white shadow-sm text-blue-600 hover:bg-white" : "text-slate-500"}
                                        >
                                            Todos
                                        </Button>
                                    </div>
                                </div>
                                <div className="relative w-full sm:w-72">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input
                                        placeholder="Buscar alumno..."
                                        className="pl-9"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border border-slate-200 overflow-hidden">
                                <Table>
                                    <TableHeader className="bg-slate-50">
                                        <TableRow>
                                            <TableHead className="w-[30%]">Alumno</TableHead>
                                            <TableHead>Contacto</TableHead>
                                            <TableHead>DNI</TableHead>
                                            <TableHead>Afiliación</TableHead>
                                            <TableHead>Estado</TableHead>
                                            <TableHead className="text-right">Acciones</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredEnrollments.map((enr: any) => (
                                            <TableRow key={enr.id} className="hover:bg-slate-50/50">
                                                <TableCell className="font-medium">
                                                    <div className="flex flex-col">
                                                        <span className="text-slate-900 font-semibold">{enr.student.name}</span>
                                                        <span className="text-xs text-slate-500">Inscrito: {new Date(enr.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col gap-1 text-sm">
                                                        {enr.student.email && (
                                                            <div className="flex items-center text-slate-600">
                                                                <Mail className="h-3 w-3 mr-1.5 opacity-50" />
                                                                {enr.student.email}
                                                            </div>
                                                        )}
                                                        {enr.student.phone && (
                                                            <div className="flex items-center text-slate-600">
                                                                <Phone className="h-3 w-3 mr-1.5 opacity-50" />
                                                                {enr.student.phone}
                                                            </div>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="font-mono text-xs">{enr.student.dni || '-'}</TableCell>
                                                <TableCell>
                                                    {enr.student.isAffiliated ? (
                                                        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-none shadow-none">
                                                            Afiliado
                                                        </Badge>
                                                    ) : (
                                                        <span className="text-slate-400 text-sm">-</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {enr.status === 'ENROLLED' ? (
                                                        <Badge variant="outline" className="border-green-200 text-green-700 bg-green-50">Matriculado</Badge>
                                                    ) : enr.status === 'PENDING' ? (
                                                        <Badge variant="outline" className="border-amber-200 text-amber-700 bg-amber-50">Pendiente de Pago</Badge>
                                                    ) : (
                                                        <Badge variant="secondary" className="capitalize">{enr.status.toLowerCase()}</Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {enr.student.email && (
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="text-slate-400 hover:text-blue-600"
                                                            onClick={() => {
                                                                setSelectedStudent(enr.student)
                                                                setIsIndividualEmailOpen(true)
                                                            }}
                                                        >
                                                            <Mail className="h-4 w-4" />
                                                            <span className="sr-only">Enviar Email</span>
                                                        </Button>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {filteredEnrollments.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={6} className="h-24 text-center text-slate-500">
                                                    No se encontraron alumnos
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <GroupEmailDialog
                    courseId={course.id}
                    courseTitle={course.title}
                    isOpen={isEmailDialogOpen}
                    onOpenChange={setIsEmailDialogOpen}
                />

                {selectedStudent && (
                    <IndividualEmailDialog
                        studentId={selectedStudent.id}
                        studentName={selectedStudent.name}
                        studentEmail={selectedStudent.email}
                        isOpen={isIndividualEmailOpen}
                        onOpenChange={setIsIndividualEmailOpen}
                    />
                )}
            </div>
        </TeacherLayout>
    )
}
