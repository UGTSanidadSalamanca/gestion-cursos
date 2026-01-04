"use client"

import { useState } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
    Upload,
    FileSpreadsheet,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Users,
    BookOpen,
    UserCheck,
    Download,
    Truck,
    Package,
    CreditCard,
    Calendar,
    Phone,
    Laptop,
    Database,
    ArrowRight
} from "lucide-react"
import * as XLSX from "xlsx"

interface ImportResult {
    entity: string
    success: number
    errors: number
    status: 'pending' | 'processing' | 'completed'
    total: number
}

export default function ImportPage() {
    const [loading, setLoading] = useState(false)
    const [progress, setProgress] = useState(0)
    const [results, setResults] = useState<ImportResult[]>([])

    const downloadTemplate = () => {
        const link = document.createElement('a');
        link.href = '/PLANTILLA_BACKUP_DATOS.xlsx';
        link.download = 'PLANTILLA_BACKUP_DATOS.xlsx';
        link.click();
    }

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setLoading(true)
        setProgress(0)
        setResults([])

        const reader = new FileReader()

        reader.onload = async (event) => {
            try {
                const data = new Uint8Array(event.target?.result as ArrayBuffer)
                const workbook = XLSX.read(data, { type: 'array' })

                // Definir entidades y sus nombres de hoja correspondientes
                const entities = [
                    { key: 'users', sheet: '👤 Users', endpoint: '/api/users', label: 'Usuarios', icon: Users },
                    { key: 'teachers', sheet: '👨‍🏫 Teachers', endpoint: '/api/teachers', label: 'Profesores', icon: UserCheck },
                    { key: 'students', sheet: '🎓 Students', endpoint: '/api/students', label: 'Estudiantes', icon: Users },
                    { key: 'providers', sheet: '🏢 Providers', endpoint: '/api/suppliers', label: 'Proveedores', icon: Truck },
                    { key: 'courses', sheet: '📚 Courses', endpoint: '/api/courses', label: 'Cursos', icon: BookOpen },
                    { key: 'materials', sheet: '📦 Materials', endpoint: '/api/materials', label: 'Materiales', icon: Package },
                    { key: 'enrollments', sheet: '📝 Enrollments', endpoint: '/api/enrollments', label: 'Matrículas', icon: FileSpreadsheet },
                    { key: 'payments', sheet: '💰 Payments', endpoint: '/api/payments', label: 'Pagos', icon: CreditCard },
                    { key: 'schedules', sheet: '🕐 Schedules', endpoint: '/api/schedules', label: 'Horarios', icon: Calendar },
                    { key: 'contacts', sheet: '📞 Contacts', endpoint: '/api/contacts', label: 'Contactos', icon: Phone },
                    { key: 'software', sheet: '💻 Software', endpoint: '/api/software', label: 'Software', icon: Laptop },
                ]

                const finalResults: ImportResult[] = []
                let totalSteps = entities.filter(e => workbook.SheetNames.includes(e.sheet)).length
                let currentStep = 0

                for (const entity of entities) {
                    if (workbook.SheetNames.includes(entity.sheet)) {
                        currentStep++
                        const sheet = workbook.Sheets[entity.sheet]
                        const jsonData = XLSX.utils.sheet_to_json(sheet)

                        // Eliminar la fila de ejemplo (si existe y tiene el formato de ejemplo)
                        const filteredData = jsonData.filter((row: any) => {
                            const firstVal = Object.values(row)[0] as string
                            return !(typeof firstVal === 'string' && firstVal.includes('Ejemplo'))
                        })

                        if (filteredData.length > 0) {
                            const res = await processBatchImport(entity.endpoint, filteredData, entity.label)
                            finalResults.push({ ...res, total: filteredData.length })
                        }

                        setProgress((currentStep / totalSteps) * 100)
                    }
                }

                setResults(finalResults)
                alert('✅ Importación masiva completada exitosamente.')
            } catch (error) {
                console.error('Error importing data:', error)
                alert('❌ Error crítico al procesar el archivo. Asegúrate de usar la plantilla oficial.')
            } finally {
                setLoading(false)
                if (e.target) e.target.value = ''
            }
        }
        reader.readAsArrayBuffer(file)
    }

    const processBatchImport = async (endpoint: string, data: any[], entityName: string) => {
        let success = 0
        let errors = 0

        for (const row of data) {
            const payload: any = {}

            // Mapeo exhaustivo de campos basado en la plantilla
            Object.keys(row).forEach(key => {
                const cleanKey = key.replace('*', '').trim().toLowerCase()
                let value = row[key]

                // Normalización de booleanos
                if (value === 'SI') value = true
                if (value === 'NO') value = false

                // Mapeo dinámico
                if (cleanKey === 'id') payload.id = String(value)
                else if (cleanKey === 'name' || cleanKey === 'nombre' || cleanKey === 'title' || cleanKey === 'titulo') {
                    payload.name = value
                    payload.title = value
                }
                else if (cleanKey === 'email' || cleanKey === 'correo') payload.email = value
                else if (cleanKey === 'phone' || cleanKey === 'telefono') payload.phone = String(value)
                else if (cleanKey === 'dni') payload.dni = String(value)
                else if (cleanKey === 'address' || cleanKey === 'direccion') payload.address = value
                else if (cleanKey === 'price' || cleanKey === 'precio' || cleanKey === 'amount' || cleanKey === 'monto') payload.price = payload.amount = parseFloat(value)
                else if (cleanKey === 'quantity' || cleanKey === 'cantidad') payload.quantity = parseInt(value)
                else if (cleanKey === 'description' || cleanKey === 'descripcion') payload.description = value
                else if (cleanKey === 'status' || cleanKey === 'estado') payload.status = String(value).toUpperCase()
                else if (cleanKey === 'code' || cleanKey === 'codigo') payload.code = String(value)
                else if (cleanKey === 'level' || cleanKey === 'nivel') payload.level = String(value).toUpperCase()
                else if (cleanKey === 'category' || cleanKey === 'categoria') payload.category = String(value).toUpperCase()
                else if (cleanKey === 'role' || cleanKey === 'rol') payload.role = String(value).toUpperCase()

                // Ids de relación
                else if (cleanKey === 'teacherid') payload.teacherId = String(value)
                else if (cleanKey === 'studentid') payload.studentId = String(value)
                else if (cleanKey === 'courseid') payload.courseId = String(value)
                else if (cleanKey === 'providerid') payload.providerId = String(value)

                // Otros campos específicos
                else {
                    // Mantener el nombre de la columna original si no coincide con los mapeos comunes
                    const targetKey = key.replace('*', '').trim()
                    payload[targetKey] = value
                }
            })

            try {
                const response = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                })
                if (response.ok) success++
                else errors++
            } catch (err) {
                errors++
            }
        }

        return { entity: entityName, success, errors, status: 'completed' as const }
    }

    return (
        <MainLayout>
            <div className="container mx-auto p-6 space-y-8">
                <div className="flex flex-col space-y-2">
                    <h1 className="text-4xl font-extrabold tracking-tight">Centro de Importación Inteligente</h1>
                    <p className="text-muted-foreground text-lg">
                        Sube tu archivo de backup para restaurar o actualizar toda tu academia de una vez.
                    </p>
                </div>

                {loading && (
                    <Card className="border-primary/50 bg-primary/5 animate-pulse">
                        <CardContent className="py-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                                    <span className="font-semibold text-primary">Procesando Importación Masiva...</span>
                                </div>
                                <span className="font-bold">{Math.round(progress)}%</span>
                            </div>
                            <Progress value={progress} className="h-3" />
                        </CardContent>
                    </Card>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Instrucciones */}
                    <Card className="lg:col-span-1 border-primary/20 bg-primary/5">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <AlertCircle className="h-5 w-5 text-primary" />
                                Instrucciones
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm">Para una importación exitosa, sigue estos pasos:</p>
                            <div className="space-y-3">
                                <div className="flex gap-3">
                                    <div className="bg-primary/20 h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold text-primary shrink-0">1</div>
                                    <p className="text-xs">Usa la <strong>Plantilla de Backup</strong> oficial para organizar tus datos.</p>
                                </div>
                                <div className="flex gap-3">
                                    <div className="bg-primary/20 h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold text-primary shrink-0">2</div>
                                    <p className="text-xs">Asegúrate de que los nombres de las pestañas no hayan sido modificados.</p>
                                </div>
                                <div className="flex gap-3">
                                    <div className="bg-primary/20 h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold text-primary shrink-0">3</div>
                                    <p className="text-xs">Respetar el formato de fechas (YYYY-MM-DD) y los valores de los desplegables.</p>
                                </div>
                            </div>
                            <div className="pt-4 border-t space-y-2">
                                <Button
                                    variant="outline"
                                    className="w-full justify-start text-primary"
                                    onClick={downloadTemplate}
                                >
                                    <Download className="h-4 w-4 mr-2" />
                                    Descargar Plantilla Maestra
                                </Button>
                                <p className="text-[10px] text-muted-foreground italic">
                                    * Se recomienda probar primero con 1 o 2 registros para verificar el formato.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Área de Carga */}
                    <Card className="lg:col-span-2 shadow-xl border-dashed border-2 hover:border-primary/50 transition-all">
                        <CardContent className="flex flex-col items-center justify-center py-16 space-y-6">
                            <div className="p-6 bg-primary/10 rounded-full">
                                <Database className="h-16 w-16 text-primary" />
                            </div>
                            <div className="text-center space-y-2">
                                <h3 className="text-2xl font-bold">Cargar Backup (.xlsx)</h3>
                                <p className="text-muted-foreground italic">Formatos compatibles: .xlsx, .xls</p>
                            </div>
                            <input
                                id="master-upload"
                                type="file"
                                accept=".xlsx, .xls"
                                className="hidden"
                                onChange={handleFileUpload}
                                disabled={loading}
                            />
                            <Button
                                size="lg"
                                className="px-12 py-6 text-lg"
                                onClick={() => document.getElementById('master-upload')?.click()}
                                disabled={loading}
                            >
                                <Upload className="mr-2 h-6 w-6" />
                                Seleccionar Archivo
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Resultados */}
                {results.length > 0 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="flex items-center justify-between border-b pb-2">
                            <h2 className="text-2xl font-bold flex items-center gap-2 text-green-600">
                                <CheckCircle2 className="h-6 w-6" />
                                Informe Final de Importación
                            </h2>
                            <Button variant="ghost" size="sm" onClick={() => setResults([])}>Limpiar Resultados</Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {results.map((res, i) => (
                                <Card key={i} className="overflow-hidden border-l-4 border-l-green-500 shadow-sm hover:shadow-md transition-shadow">
                                    <CardContent className="p-5">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-muted rounded-lg">
                                                    <FileSpreadsheet className="h-5 w-5 text-slate-600" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-lg">{res.entity}</h4>
                                                    <p className="text-xs text-muted-foreground">{res.success + res.errors} registros procesados</p>
                                                </div>
                                            </div>
                                            <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200">OK</Badge>
                                        </div>
                                        <div className="space-y-2 pt-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-green-600 font-medium flex items-center gap-1">
                                                    <CheckCircle2 className="h-3 w-3" /> Éxito:
                                                </span>
                                                <span className="font-bold">{res.success}</span>
                                            </div>
                                            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                                <div
                                                    className="bg-green-500 h-full transition-all duration-1000"
                                                    style={{ width: `${(res.success / (res.success + res.errors)) * 100}%` }}
                                                />
                                            </div>
                                            {res.errors > 0 && (
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-red-500 font-medium flex items-center gap-1">
                                                        <AlertCircle className="h-3 w-3" /> Error:
                                                    </span>
                                                    <span className="font-bold">{res.errors}</span>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-900">
                            <CardContent className="p-4 flex items-center gap-4">
                                <div className="bg-blue-500 p-2 rounded-full">
                                    <CheckCircle2 className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <p className="font-bold text-blue-900 dark:text-blue-100 text-lg">Importación Completada</p>
                                    <p className="text-sm text-blue-700 dark:text-blue-200">
                                        Se han procesado todas las pestañas detectadas en tu archivo. Los datos ya están disponibles en sus secciones correspondientes.
                                    </p>
                                </div>
                                <Button className="ml-auto bg-blue-600 hover:bg-blue-700" asChild>
                                    <a href="/">Ir al Dashboard <ArrowRight className="ml-2 h-4 w-4" /></a>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </MainLayout>
    )
}
