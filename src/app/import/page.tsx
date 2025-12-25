"use client"

import { useState } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Upload,
    FileSpreadsheet,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Users,
    BookOpen,
    UserCheck,
    Download
} from "lucide-react"
import * as XLSX from "xlsx"

export default function ImportPage() {
    const [loading, setLoading] = useState(false)
    const [results, setResults] = useState<{
        entity: string,
        success: number,
        errors: number,
        status: 'pending' | 'processing' | 'completed'
    }[]>([])

    const downloadTemplate = () => {
        const wb = XLSX.utils.book_new()

        // Alumnos Template
        const wsAlumnos = XLSX.utils.json_to_sheet([
            { Nombre: 'Juan Pérez', Email: 'juan@ejemplo.com', Telefono: '600111222', DNI: '12345678A', Afiliado: 'Si' }
        ])
        XLSX.utils.book_append_sheet(wb, wsAlumnos, 'Alumnos')

        // Docentes Template
        const wsDocentes = XLSX.utils.json_to_sheet([
            { Nombre: 'Ana Lopez', Email: 'ana@ejemplo.com', Especialidad: 'Matemáticas', Telefono: '600333444' }
        ])
        XLSX.utils.book_append_sheet(wb, wsDocentes, 'Docentes')

        // Cursos Template
        const wsCursos = XLSX.utils.json_to_sheet([
            { Titulo: 'Cocina Básica', Codigo: 'CB001', Precio: 150, Nivel: 'BEGINNER', Duracion: 40 }
        ])
        XLSX.utils.book_append_sheet(wb, wsCursos, 'Cursos')

        XLSX.writeFile(wb, 'Plantilla_Importacion_Gestion_Cursos.xlsx')
    }

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setLoading(true)
        const reader = new FileReader()

        reader.onload = async (event) => {
            try {
                const data = new Uint8Array(event.target?.result as ArrayBuffer)
                const workbook = XLSX.read(data, { type: 'array' })

                const newResults: any[] = []

                // 1. Procesar Alumnos
                if (workbook.SheetNames.includes('Alumnos') || workbook.SheetNames.includes('Students')) {
                    const sheet = workbook.Sheets[workbook.SheetNames.find(n => n === 'Alumnos' || n === 'Students')!]
                    const jsonData = XLSX.utils.sheet_to_json(sheet)
                    const res = await processImport('/api/students', jsonData, 'Alumnos')
                    newResults.push(res)
                }

                // 2. Procesar Docentes
                if (workbook.SheetNames.includes('Docentes') || workbook.SheetNames.includes('Teachers')) {
                    const sheet = workbook.Sheets[workbook.SheetNames.find(n => n === 'Docentes' || n === 'Teachers')!]
                    const jsonData = XLSX.utils.sheet_to_json(sheet)
                    const res = await processImport('/api/teachers', jsonData, 'Docentes')
                    newResults.push(res)
                }

                // 3. Procesar Cursos
                if (workbook.SheetNames.includes('Cursos') || workbook.SheetNames.includes('Courses')) {
                    const sheet = workbook.Sheets[workbook.SheetNames.find(n => n === 'Cursos' || n === 'Courses')!]
                    const jsonData = XLSX.utils.sheet_to_json(sheet)
                    const res = await processImport('/api/courses', jsonData, 'Cursos')
                    newResults.push(res)
                }

                setResults(newResults)
                alert('Proceso de importación finalizado. Revisa los resultados.')
            } catch (error) {
                console.error('Error importing data:', error)
                alert('Error crítico al procesar el archivo.')
            } finally {
                setLoading(false)
                if (e.target) e.target.value = ''
            }
        }
        reader.readAsArrayBuffer(file)
    }

    const processImport = async (endpoint: string, data: any[], entityName: string) => {
        let success = 0
        let errors = 0

        for (const row of data) {
            // Normalización básica de campos común
            const payload: any = {}

            // Mapeo dinámico básico basado en nombres de columnas comunes
            Object.keys(row).forEach(key => {
                const lowerKey = key.toLowerCase()
                if (lowerKey.includes('nombre') || lowerKey.includes('name') || lowerKey.includes('titulo') || lowerKey.includes('title')) payload.name = row[key];
                if (lowerKey === 'title' || lowerKey === 'titulo') payload.title = row[key];
                if (lowerKey.includes('email') || lowerKey.includes('correo')) payload.email = row[key];
                if (lowerKey.includes('dni') || lowerKey.includes('identificacion')) payload.dni = row[key];
                if (lowerKey.includes('telefono') || lowerKey.includes('phone')) payload.phone = String(row[key]);
                if (lowerKey.includes('especialidad') || lowerKey.includes('specialty')) payload.specialty = row[key];
                if (lowerKey.includes('codigo') || lowerKey.includes('code')) payload.code = String(row[key]);
                if (lowerKey.includes('precio') || lowerKey.includes('price')) payload.price = parseFloat(row[key]);
                if (lowerKey.includes('duracion') || lowerKey.includes('duration')) payload.duration = parseInt(row[key]);
                if (lowerKey.includes('nivel') || lowerKey.includes('level')) payload.level = row[key].toUpperCase();
            })

            // Caso especial para Cursos -> Title es obligatorio
            if (endpoint === '/api/courses' && !payload.title) payload.title = payload.name;

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

        return { entity: entityName, success, errors, status: 'completed' }
    }

    return (
        <MainLayout>
            <div className="container mx-auto p-6 space-y-8">
                <div className="flex flex-col space-y-2">
                    <h1 className="text-4xl font-extrabold tracking-tight">Centro de Importación Inteligente</h1>
                    <p className="text-muted-foreground text-lg">
                        Sube un solo archivo Excel con diferentes pestañas para actualizar toda tu academia de golpe.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Instrucciones */}
                    <Card className="lg:col-span-1 border-primary/20 bg-primary/5">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <AlertCircle className="h-5 w-5 text-primary" />
                                Guía de Formato
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm">Tu Excel debe tener pestañas (hojas) con estos nombres exactos:</p>
                            <ul className="space-y-3">
                                <li className="flex items-center gap-2 text-sm font-medium">
                                    <Badge variant="outline">Alumnos</Badge> (Nombre, Email, DNI)
                                </li>
                                <li className="flex items-center gap-2 text-sm font-medium">
                                    <Badge variant="outline">Docentes</Badge> (Nombre, Email, Especialidad)
                                </li>
                                <li className="flex items-center gap-2 text-sm font-medium">
                                    <Badge variant="outline">Cursos</Badge> (Titulo, Codigo, Precio, Nivel)
                                </li>
                            </ul>
                            <div className="pt-4 border-t space-y-2">
                                <Button variant="link" className="p-0 h-auto text-primary flex items-center gap-2" onClick={downloadTemplate}>
                                    <Download className="h-4 w-4" />
                                    Descargar plantilla modelo
                                </Button>
                                <p className="text-xs text-muted-foreground italic">
                                    * El sistema ignorará registros duplicados o con emails erróneos.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Área de Carga */}
                    <Card className="lg:col-span-2 shadow-xl border-dashed border-2 hover:border-primary/50 transition-all">
                        <CardContent className="flex flex-col items-center justify-center py-16 space-y-6">
                            <div className="p-6 bg-primary/10 rounded-full">
                                <FileSpreadsheet className="h-16 w-16 text-primary" />
                            </div>
                            <div className="text-center space-y-2">
                                <h3 className="text-2xl font-bold">Cargar Archivo Maestro</h3>
                                <p className="text-muted-foreground">Arrastra tu .xlsx aquí o haz clic para buscar</p>
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
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                                        Procesando datos...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="mr-2 h-6 w-6" />
                                        Seleccionar Excel
                                    </>
                                )}
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Resultados */}
                {results.length > 0 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            <CheckCircle2 className="h-6 w-6 text-green-500" />
                            Resultados de la última carga
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {results.map((res, i) => (
                                <Card key={i} className="overflow-hidden border-l-4 border-l-green-500">
                                    <CardContent className="p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="p-2 bg-muted rounded-lg">
                                                {res.entity === 'Alumnos' && <Users className="h-6 w-6 text-blue-500" />}
                                                {res.entity === 'Docentes' && <UserCheck className="h-6 w-6 text-purple-500" />}
                                                {res.entity === 'Cursos' && <BookOpen className="h-6 w-6 text-orange-500" />}
                                            </div>
                                            <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200">Completado</Badge>
                                        </div>
                                        <h4 className="text-xl font-bold mb-1">{res.entity}</h4>
                                        <div className="flex gap-4 text-sm font-medium">
                                            <span className="text-green-600">✅ {res.success} Éxitos</span>
                                            <span className="text-red-500">❌ {res.errors} Errores</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </MainLayout>
    )
}
