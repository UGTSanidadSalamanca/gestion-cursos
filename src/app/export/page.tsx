"use client"

import { useState } from "react"
import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Download,
    FileSpreadsheet,
    Database,
    CheckCircle2,
    Loader2,
    Users,
    BookOpen,
    UserCheck,
    Package,
    Building,
    Calendar,
    Phone,
    Laptop,
    Bell,
    Upload,
    AlertCircle
} from "lucide-react"
import * as XLSX from "xlsx"

export default function ExportPage() {
    const [loading, setLoading] = useState(false)
    const [exportStats, setExportStats] = useState<any>(null)

    const handleExport = async () => {
        setLoading(true)
        try {
            // Llamar al API para obtener todos los datos
            const response = await fetch('/api/export')
            if (!response.ok) {
                throw new Error('Error al exportar datos')
            }

            const data = await response.json()
            setExportStats(data.metadata)

            // Crear libro de Excel
            const wb = XLSX.utils.book_new()

            // Hoja de Instrucciones
            const instructions = [
                ["BACKUP COMPLETO - SISTEMA DE GESTIÓN DE CURSOS"],
                [""],
                ["📅 Fecha de exportación: " + new Date().toLocaleString('es-ES')],
                [""],
                ["📊 RESUMEN DE DATOS EXPORTADOS:"],
                [`• Usuarios: ${data.metadata.totalRecords.users}`],
                [`• Estudiantes: ${data.metadata.totalRecords.students}`],
                [`• Profesores: ${data.metadata.totalRecords.teachers}`],
                [`• Proveedores: ${data.metadata.totalRecords.providers}`],
                [`• Cursos: ${data.metadata.totalRecords.courses}`],
                [`• Materiales: ${data.metadata.totalRecords.materials}`],
                [`• Matrículas: ${data.metadata.totalRecords.enrollments}`],
                [`• Pagos: ${data.metadata.totalRecords.payments}`],
                [`• Horarios: ${data.metadata.totalRecords.schedules}`],
                [`• Contactos: ${data.metadata.totalRecords.contacts}`],
                [`• Software: ${data.metadata.totalRecords.software}`],
                [""],
                ["⚠️ IMPORTANTE:"],
                ["• Este archivo contiene TODOS los datos de tu base de datos"],
                ["• Guárdalo en un lugar seguro como backup"],
                ["• Puedes usar este archivo para restaurar datos en caso de pérdida"],
                ["• Para importar, ve a la sección 'Importar Datos' de la aplicación"],
                [""],
                ["🔒 SEGURIDAD:"],
                ["• No compartas este archivo - contiene información sensible"],
                ["• Mantén múltiples copias en diferentes ubicaciones"],
                ["• Actualiza este backup regularmente"],
            ]

            const wsInstructions = XLSX.utils.aoa_to_sheet(instructions)
            XLSX.utils.book_append_sheet(wb, wsInstructions, "📖 INSTRUCCIONES")

            // Agregar cada tabla como hoja
            if (data.users.length > 0) {
                const wsUsers = XLSX.utils.json_to_sheet(data.users)
                XLSX.utils.book_append_sheet(wb, wsUsers, "👤 Users")
            }

            if (data.students.length > 0) {
                const wsStudents = XLSX.utils.json_to_sheet(data.students)
                XLSX.utils.book_append_sheet(wb, wsStudents, "🎓 Students")
            }

            if (data.teachers.length > 0) {
                const wsTeachers = XLSX.utils.json_to_sheet(data.teachers)
                XLSX.utils.book_append_sheet(wb, wsTeachers, "👨‍🏫 Teachers")
            }

            if (data.providers.length > 0) {
                const wsProviders = XLSX.utils.json_to_sheet(data.providers)
                XLSX.utils.book_append_sheet(wb, wsProviders, "🏢 Providers")
            }

            if (data.courses.length > 0) {
                const wsCourses = XLSX.utils.json_to_sheet(data.courses)
                XLSX.utils.book_append_sheet(wb, wsCourses, "📚 Courses")
            }

            if (data.materials.length > 0) {
                const wsMaterials = XLSX.utils.json_to_sheet(data.materials)
                XLSX.utils.book_append_sheet(wb, wsMaterials, "📦 Materials")
            }

            if (data.enrollments.length > 0) {
                const wsEnrollments = XLSX.utils.json_to_sheet(data.enrollments)
                XLSX.utils.book_append_sheet(wb, wsEnrollments, "📝 Enrollments")
            }

            if (data.payments.length > 0) {
                const wsPayments = XLSX.utils.json_to_sheet(data.payments)
                XLSX.utils.book_append_sheet(wb, wsPayments, "💰 Payments")
            }

            if (data.schedules.length > 0) {
                const wsSchedules = XLSX.utils.json_to_sheet(data.schedules)
                XLSX.utils.book_append_sheet(wb, wsSchedules, "🕐 Schedules")
            }

            if (data.contacts.length > 0) {
                const wsContacts = XLSX.utils.json_to_sheet(data.contacts)
                XLSX.utils.book_append_sheet(wb, wsContacts, "📞 Contacts")
            }

            if (data.software.length > 0) {
                const wsSoftware = XLSX.utils.json_to_sheet(data.software)
                XLSX.utils.book_append_sheet(wb, wsSoftware, "💻 Software")
            }

            // Generar nombre de archivo con fecha
            const fileName = `BACKUP_GestionCursos_${new Date().toISOString().split('T')[0]}.xlsx`

            // Descargar archivo
            XLSX.writeFile(wb, fileName)

            alert('✅ Backup exportado exitosamente!')
        } catch (error) {
            console.error('Error exporting data:', error)
            alert('❌ Error al exportar datos. Por favor, intenta de nuevo.')
        } finally {
            setLoading(false)
        }
    }

    const downloadTemplate = () => {
        // Descargar la plantilla vacía
        window.open('/PLANTILLA_BACKUP_DATOS.xlsx', '_blank')
    }

    return (
        <MainLayout>
            <div className="container mx-auto p-6 space-y-8">
                <div className="flex flex-col space-y-2">
                    <h1 className="text-4xl font-extrabold tracking-tight">Centro de Exportación de Datos</h1>
                    <p className="text-muted-foreground text-lg">
                        Descarga un backup completo de toda tu base de datos en formato Excel
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Información */}
                    <Card className="lg:col-span-1 border-primary/20 bg-primary/5">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <AlertCircle className="h-5 w-5 text-primary" />
                                ¿Qué se exporta?
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm">
                                El sistema exportará TODOS los datos actuales de tu base de datos:
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-center gap-2 text-sm">
                                    <Users className="h-4 w-4 text-blue-500" />
                                    <span>Usuarios del sistema</span>
                                </li>
                                <li className="flex items-center gap-2 text-sm">
                                    <Users className="h-4 w-4 text-green-500" />
                                    <span>Estudiantes</span>
                                </li>
                                <li className="flex items-center gap-2 text-sm">
                                    <UserCheck className="h-4 w-4 text-purple-500" />
                                    <span>Profesores</span>
                                </li>
                                <li className="flex items-center gap-2 text-sm">
                                    <Building className="h-4 w-4 text-orange-500" />
                                    <span>Proveedores</span>
                                </li>
                                <li className="flex items-center gap-2 text-sm">
                                    <BookOpen className="h-4 w-4 text-red-500" />
                                    <span>Cursos</span>
                                </li>
                                <li className="flex items-center gap-2 text-sm">
                                    <Package className="h-4 w-4 text-cyan-500" />
                                    <span>Materiales</span>
                                </li>
                                <li className="flex items-center gap-2 text-sm">
                                    <Calendar className="h-4 w-4 text-pink-500" />
                                    <span>Matrículas, Pagos, Horarios</span>
                                </li>
                                <li className="flex items-center gap-2 text-sm">
                                    <Phone className="h-4 w-4 text-yellow-500" />
                                    <span>Contactos</span>
                                </li>
                                <li className="flex items-center gap-2 text-sm">
                                    <Laptop className="h-4 w-4 text-indigo-500" />
                                    <span>Software y Licencias</span>
                                </li>
                            </ul>
                            <div className="pt-4 border-t space-y-2">
                                <Button
                                    variant="outline"
                                    className="w-full flex items-center gap-2"
                                    onClick={downloadTemplate}
                                >
                                    <Download className="h-4 w-4" />
                                    Descargar Plantilla Vacía
                                </Button>
                                <p className="text-xs text-muted-foreground italic">
                                    * Usa la plantilla vacía para rellenar datos manualmente
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Área de Exportación */}
                    <Card className="lg:col-span-2 shadow-xl border-2 border-primary/20">
                        <CardContent className="flex flex-col items-center justify-center py-16 space-y-6">
                            <div className="p-6 bg-green-500/10 rounded-full">
                                <Database className="h-16 w-16 text-green-500" />
                            </div>
                            <div className="text-center space-y-2">
                                <h3 className="text-2xl font-bold">Exportar Base de Datos Completa</h3>
                                <p className="text-muted-foreground">
                                    Genera un archivo Excel con todos tus datos actuales
                                </p>
                            </div>

                            <Button
                                size="lg"
                                className="px-12 py-6 text-lg bg-green-600 hover:bg-green-700"
                                onClick={handleExport}
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                                        Exportando datos...
                                    </>
                                ) : (
                                    <>
                                        <Download className="mr-2 h-6 w-6" />
                                        Exportar a Excel
                                    </>
                                )}
                            </Button>

                            {exportStats && (
                                <div className="w-full mt-8 p-6 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                                    <div className="flex items-center gap-2 mb-4">
                                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                                        <h4 className="font-semibold text-green-900 dark:text-green-100">
                                            Última exportación exitosa
                                        </h4>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                                        <div className="flex flex-col">
                                            <span className="text-muted-foreground">Estudiantes</span>
                                            <span className="font-bold text-lg">{exportStats.totalRecords.students}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-muted-foreground">Profesores</span>
                                            <span className="font-bold text-lg">{exportStats.totalRecords.teachers}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-muted-foreground">Cursos</span>
                                            <span className="font-bold text-lg">{exportStats.totalRecords.courses}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-muted-foreground">Matrículas</span>
                                            <span className="font-bold text-lg">{exportStats.totalRecords.enrollments}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-muted-foreground">Pagos</span>
                                            <span className="font-bold text-lg">{exportStats.totalRecords.payments}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-muted-foreground">Materiales</span>
                                            <span className="font-bold text-lg">{exportStats.totalRecords.materials}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Recomendaciones */}
                <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950 dark:border-yellow-800">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-yellow-900 dark:text-yellow-100">
                            <Bell className="h-5 w-5" />
                            Recomendaciones de Backup
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm text-yellow-900 dark:text-yellow-100">
                        <div className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                            <p>Exporta tus datos regularmente (recomendado: semanalmente)</p>
                        </div>
                        <div className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                            <p>Guarda múltiples copias en diferentes ubicaciones (nube, disco externo, etc.)</p>
                        </div>
                        <div className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                            <p>Verifica que el archivo se descargó correctamente antes de cerrar esta página</p>
                        </div>
                        <div className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                            <p>No compartas este archivo - contiene información sensible de tu organización</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </MainLayout>
    )
}
