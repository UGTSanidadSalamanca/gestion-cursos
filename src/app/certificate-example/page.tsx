"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MainLayout } from "@/components/layout/main-layout"
import { 
  Award, 
  Download, 
  Eye,
  FileText,
  Settings,
  Palette
} from "lucide-react"
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

interface CertificateData {
  studentName: string
  courseName: string
  completionDate: string
  grade?: number
  instructorName: string
  courseDuration: number
  certificateNumber: string
}

export default function CertificateExamplePage() {
  const [selectedTemplate, setSelectedTemplate] = useState<'classic' | 'modern' | 'elegant'>('classic')
  
  const exampleData: CertificateData = {
    studentName: "María García López",
    courseName: "Desarrollo Web Full Stack con React y Node.js",
    completionDate: "2024-03-15",
    grade: 9.5,
    instructorName: "Dr. Carlos Rodríguez Martínez",
    courseDuration: 120,
    certificateNumber: "CERT-2024-001234"
  }

  const downloadCertificate = async () => {
    const certificateElement = document.getElementById('certificate-example')
    if (!certificateElement) return

    try {
      const canvas = await html2canvas(certificateElement, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      })

      const imgWidth = 297
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight)
      pdf.save(`certificado-ejemplo-${exampleData.studentName.replace(/\s+/g, '-')}.pdf`)
    } catch (error) {
      console.error('Error al generar PDF:', error)
      alert('Error al generar PDF')
    }
  }

  const CertificateTemplate = ({ data, template }: { data: CertificateData; template: string }) => {
    if (template === 'modern') {
      return (
        <div 
          id="certificate-example"
          className="w-full max-w-4xl mx-auto p-8 bg-white border-4 border-blue-600 relative overflow-hidden"
        >
          {/* Fondo moderno */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 opacity-50"></div>
          
          {/* Elementos decorativos modernos */}
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 to-purple-600"></div>
          <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-purple-600 to-blue-600"></div>
          <div className="absolute top-8 left-8 w-16 h-16 border-2 border-blue-400 rounded-lg transform rotate-45"></div>
          <div className="absolute bottom-8 right-8 w-12 h-12 border-2 border-purple-400 rounded-full"></div>

          {/* Contenido */}
          <div className="relative z-10 text-center">
            {/* Header moderno */}
            <div className="mb-8">
              <div className="inline-block px-6 py-2 bg-blue-600 text-white rounded-full mb-4">
                <span className="text-sm font-bold uppercase tracking-wide">Certificado Oficial</span>
              </div>
              <h1 className="text-5xl font-bold text-gray-800 mb-2">
                CERTIFICADO DE COMPLETACIÓN
              </h1>
              <div className="w-32 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto"></div>
            </div>

            {/* Contenido principal */}
            <div className="mb-8">
              <p className="text-xl text-gray-700 mb-6">
                Por la presente se certifica que
              </p>
              
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 mb-6 border-l-4 border-blue-600">
                <h2 className="text-3xl font-bold text-blue-800 mb-2">
                  {data.studentName}
                </h2>
                <div className="w-40 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto"></div>
              </div>

              <p className="text-xl text-gray-700 mb-4">
                Ha completado exitosamente el curso
              </p>
              
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-6 mb-6">
                <h3 className="text-2xl font-bold mb-2">
                  {data.courseName}
                </h3>
                <div className="flex justify-center items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span>{data.courseDuration} horas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4" />
                    <span>{data.completionDate}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Calificación */}
            {data.grade && (
              <div className="mb-6">
                <p className="text-lg text-gray-700">
                  Con una calificación final de
                  <span className="font-bold text-blue-600 mx-2 text-2xl">
                    {data.grade}/10
                  </span>
                </p>
              </div>
            )}

            {/* Instructor */}
            <div className="mb-8">
              <p className="text-gray-600">
                Curso dictado por: <span className="font-semibold text-blue-800">{data.instructorName}</span>
              </p>
            </div>

            {/* Número de certificado */}
            <div className="mb-8">
              <div className="inline-block px-4 py-2 bg-gray-100 rounded-lg">
                <p className="text-sm font-mono text-gray-600">
                  Nº Certificado: {data.certificateNumber}
                </p>
              </div>
            </div>

            {/* Firmas */}
            <div className="flex justify-between items-end mt-12 pt-8 border-t-2 border-gray-300">
              <div className="text-center flex-1">
                <div className="w-32 h-0.5 bg-gray-400 mb-2 mx-auto"></div>
                <p className="text-sm font-semibold text-gray-700">Firma del Participante</p>
                <p className="text-xs text-gray-500">{data.studentName}</p>
              </div>
              <div className="text-center flex-1">
                <div className="w-32 h-0.5 bg-gray-400 mb-2 mx-auto"></div>
                <p className="text-sm font-semibold text-gray-700">Firma del Instructor</p>
                <p className="text-xs text-gray-500">{data.instructorName}</p>
              </div>
              <div className="text-center flex-1">
                <div className="w-32 h-0.5 bg-gray-400 mb-2 mx-auto"></div>
                <p className="text-sm font-semibold text-gray-700">Firma del Director</p>
                <p className="text-xs text-gray-500">Centro de Formación</p>
              </div>
            </div>

            {/* Fecha de emisión */}
            <div className="mt-8 text-center">
              <div className="inline-block px-4 py-2 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  Emitido el {new Date().toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    }

    if (template === 'elegant') {
      return (
        <div 
          id="certificate-example"
          className="w-full max-w-4xl mx-auto p-12 bg-gradient-to-br from-amber-50 to-orange-50 border-8 border-double border-amber-600 relative"
        >
          {/* Fondo elegante */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-8 left-8 w-40 h-40 border-4 border-amber-400 rounded-full"></div>
            <div className="absolute bottom-8 right-8 w-32 h-32 border-4 border-orange-400 rounded-full"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 border-2 border-yellow-400 rounded-full"></div>
          </div>

          {/* Contenido elegante */}
          <div className="relative z-10 text-center">
            {/* Título elegante */}
            <div className="mb-10">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-amber-600 rounded-full flex items-center justify-center">
                  <Award className="h-8 w-8 text-white" />
                </div>
              </div>
              <h1 className="text-6xl font-bold text-amber-800 mb-4 font-serif">
                CERTIFICADO
              </h1>
              <h2 className="text-3xl text-amber-700 mb-2">
                de Finalización
              </h2>
              <div className="w-48 h-1 bg-amber-600 mx-auto mb-4"></div>
              <p className="text-lg text-amber-800 italic">
                "La excelencia en educación es nuestro compromiso"
              </p>
            </div>

            {/* Cuerpo principal */}
            <div className="mb-10">
              <p className="text-xl text-gray-800 mb-6">
                Por medio de la presente se hace constar que
              </p>
              
              <div className="bg-white/90 backdrop-blur-sm rounded-lg p-8 mb-6 border-2 border-amber-200 shadow-lg">
                <h2 className="text-4xl font-bold text-amber-800 mb-3 font-serif">
                  {data.studentName}
                </h2>
                <div className="w-48 h-0.5 bg-amber-600 mx-auto mb-4"></div>
                <p className="text-gray-600 italic">ha completado con éxito</p>
              </div>

              <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-lg p-6 mb-6 shadow-lg">
                <h3 className="text-3xl font-bold mb-3">
                  {data.courseName}
                </h3>
                <div className="flex justify-center items-center gap-8 text-sm">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    <span>{data.courseDuration} horas de formación</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    <span>Finalizado: {data.completionDate}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Calificación destacada */}
            {data.grade && (
              <div className="mb-8">
                <div className="inline-block px-6 py-3 bg-amber-100 rounded-full border-2 border-amber-300">
                  <p className="text-lg text-amber-800">
                    Calificación Obtenida: 
                    <span className="font-bold text-2xl text-amber-600 mx-2">
                      {data.grade}/10
                    </span>
                    <span className="text-amber-700">✨ Sobresaliente</span>
                  </p>
                </div>
              </div>
            )}

            {/* Instructor */}
            <div className="mb-8">
              <p className="text-gray-700 text-lg">
                Bajo la dirección del experto: 
                <span className="font-semibold text-amber-800"> {data.instructorName}</span>
              </p>
            </div>

            {/* Número de certificado elegante */}
            <div className="mb-10">
              <div className="inline-block px-6 py-3 bg-amber-50 border-2 border-amber-200 rounded-lg">
                <p className="text-sm font-mono text-amber-700 font-bold">
                  CÓDIGO DE CERTIFICADO: {data.certificateNumber}
                </p>
              </div>
            </div>

            {/* Sección de firmas elegante */}
            <div className="flex justify-between items-end mt-16 pt-10 border-t-2 border-amber-300">
              <div className="text-center flex-1">
                <div className="w-36 h-0.5 bg-amber-600 mb-3 mx-auto"></div>
                <p className="text-sm font-bold text-amber-800">Firma del Participante</p>
                <p className="text-xs text-amber-700 mt-1">{data.studentName}</p>
              </div>
              <div className="text-center flex-1">
                <div className="w-36 h-0.5 bg-amber-600 mb-3 mx-auto"></div>
                <p className="text-sm font-bold text-amber-800">Firma del Instructor</p>
                <p className="text-xs text-amber-700 mt-1">{data.instructorName}</p>
              </div>
              <div className="text-center flex-1">
                <div className="w-36 h-0.5 bg-amber-600 mb-3 mx-auto"></div>
                <p className="text-sm font-bold text-amber-800">Firma del Director</p>
                <p className="text-xs text-amber-700 mt-1">Centro Educativo</p>
              </div>
            </div>

            {/* Fecha y sello */}
            <div className="mt-12 text-center">
              <div className="inline-flex items-center gap-4 px-6 py-3 bg-amber-50 rounded-lg border border-amber-200">
                <div className="w-12 h-12 bg-amber-600 rounded-full flex items-center justify-center">
                  <Award className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-amber-800">Fecha de Emisión</p>
                  <p className="text-xs text-amber-700">
                    {new Date().toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }

    // Plantilla clásica (por defecto)
    return (
      <div 
        id="certificate-example"
        className="w-full max-w-4xl mx-auto p-12 bg-gradient-to-br from-blue-50 to-indigo-100 border-8 border-double border-yellow-600 relative"
      >
        {/* Fondo decorativo */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 left-4 w-32 h-32 border-4 border-blue-300 rounded-full"></div>
          <div className="absolute bottom-4 right-4 w-24 h-24 border-4 border-indigo-300 rounded-full"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-2 border-purple-300 rounded-full"></div>
        </div>

        {/* Contenido del certificado */}
        <div className="relative z-10 text-center">
          {/* Título principal */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              CERTIFICADO DE FINALIZACIÓN
            </h1>
            <div className="w-48 h-1 bg-yellow-500 mx-auto mb-4"></div>
            <p className="text-lg text-gray-600">
              Se certifica que
            </p>
          </div>

          {/* Nombre del alumno */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-blue-800 mb-2">
              {data.studentName}
            </h2>
            <div className="w-32 h-0.5 bg-gray-400 mx-auto"></div>
          </div>

          {/* Información del curso */}
          <div className="mb-8 space-y-4">
            <p className="text-xl text-gray-700">
              Ha completado satisfactoriamente el curso
            </p>
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 mx-auto max-w-md">
              <h3 className="text-2xl font-bold text-indigo-800 mb-2">
                {data.courseName}
              </h3>
              <div className="flex justify-center items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  <span>{data.courseDuration} horas</span>
                </div>
                <div className="flex items-center gap-1">
                  <Award className="h-4 w-4" />
                  <span>{data.completionDate}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Calificación si existe */}
          {data.grade && (
            <div className="mb-6">
              <p className="text-lg text-gray-700">
                Con una calificación de
                <span className="font-bold text-green-600 mx-2">
                  {data.grade}/10
                </span>
              </p>
            </div>
          )}

          {/* Instructor */}
          <div className="mb-8">
            <p className="text-gray-600">
              Dictado por: <span className="font-semibold">{data.instructorName}</span>
            </p>
          </div>

          {/* Número de certificado */}
          <div className="mb-8">
            <p className="text-sm text-gray-500">
              Número de certificado: <span className="font-mono">{data.certificateNumber}</span>
            </p>
          </div>

          {/* Firmas */}
          <div className="flex justify-between items-end mt-12 pt-8 border-t border-gray-300">
            <div className="text-center">
              <div className="w-32 h-0.5 bg-gray-400 mb-2"></div>
              <p className="text-sm text-gray-600">Firma del Alumno</p>
            </div>
            <div className="text-center">
              <div className="w-32 h-0.5 bg-gray-400 mb-2"></div>
              <p className="text-sm text-gray-600">Firma del Instructor</p>
            </div>
            <div className="text-center">
              <div className="w-32 h-0.5 bg-gray-400 mb-2"></div>
              <p className="text-sm text-gray-600">Firma del Director</p>
            </div>
          </div>

          {/* Fecha de emisión */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Emitido el {new Date().toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <MainLayout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Ejemplo de Certificado</h1>
            <p className="text-muted-foreground mt-2">
              Vista previa de los certificados generados por el sistema
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex gap-2">
            <Button onClick={downloadCertificate}>
              <Download className="h-4 w-4 mr-2" />
              Descargar PDF
            </Button>
          </div>
        </div>

        {/* Selector de Plantillas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Seleccionar Plantilla
            </CardTitle>
            <CardDescription>
              Elige el diseño de certificado que prefieras
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button
                variant={selectedTemplate === 'classic' ? 'default' : 'outline'}
                onClick={() => setSelectedTemplate('classic')}
              >
                📜 Clásico
              </Button>
              <Button
                variant={selectedTemplate === 'modern' ? 'default' : 'outline'}
                onClick={() => setSelectedTemplate('modern')}
              >
                🚀 Moderno
              </Button>
              <Button
                variant={selectedTemplate === 'elegant' ? 'default' : 'outline'}
                onClick={() => setSelectedTemplate('elegant')}
              >
                ✨ Elegante
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Vista Previa del Certificado */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Vista Previa
            </CardTitle>
            <CardDescription>
              Certificado con datos de ejemplo - {selectedTemplate === 'classic' ? 'Diseño Clásico' : selectedTemplate === 'modern' ? 'Diseño Moderno' : 'Diseño Elegante'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg p-4 bg-white overflow-auto">
              <CertificateTemplate data={exampleData} template={selectedTemplate} />
            </div>
          </CardContent>
        </Card>

        {/* Información del Certificado */}
        <Card>
          <CardHeader>
            <CardTitle>Información del Certificado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Estudiante</p>
                <p className="font-medium">{exampleData.studentName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Curso</p>
                <p className="font-medium">{exampleData.courseName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Duración</p>
                <p className="font-medium">{exampleData.courseDuration} horas</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Fecha de Finalización</p>
                <p className="font-medium">{exampleData.completionDate}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Calificación</p>
                <p className="font-medium">{exampleData.grade}/10</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Instructor</p>
                <p className="font-medium">{exampleData.instructorName}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm font-medium text-muted-foreground">Número de Certificado</p>
                <p className="font-medium font-mono">{exampleData.certificateNumber}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Instrucciones */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Cómo Generar Certificados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-blue-600">1</span>
                </div>
                <div>
                  <p className="font-medium">Ve a la página de Matrículas</p>
                  <p className="text-sm text-muted-foreground">Accede a la sección de matrículas para ver todos los cursos y estudiantes</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-blue-600">2</span>
                </div>
                <div>
                  <p className="font-medium">Selecciona una matrícula completada</p>
                  <p className="text-sm text-muted-foreground">Haz clic en "Ver Detalles" en una matrícula con estado "Completado"</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-blue-600">3</span>
                </div>
                <div>
                  <p className="font-medium">Genera el certificado</p>
                  <p className="text-sm text-muted-foreground">Haz clic en "Generar Certificado" para crear un certificado único</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-blue-600">4</span>
                </div>
                <div>
                  <p className="font-medium">Descarga el PDF</p>
                  <p className="text-sm text-muted-foreground">Una vez generado, haz clic en "Descargar PDF" para obtener el certificado</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}