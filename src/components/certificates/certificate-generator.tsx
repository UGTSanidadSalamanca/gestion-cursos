'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Download, 
  Award, 
  Calendar, 
  Clock, 
  User,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

interface CertificateGeneratorProps {
  enrollment: {
    id: string
    student: { name: string }
    course: { 
      title: string
      duration: number
      teacher?: { name: string }
    }
    status: string
    grade?: number
    certificate?: string
    updatedAt: string
  }
  onCertificateGenerated?: () => void
}

export function CertificateGenerator({ enrollment, onCertificateGenerated }: CertificateGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [certificateData, setCertificateData] = useState<any>(null)

  const generateCertificate = async () => {
    setIsGenerating(true)
    
    try {
      const response = await fetch('/api/certificates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          enrollmentId: enrollment.id
        })
      })

      const result = await response.json()

      if (result.success) {
        setCertificateData(result.certificateData)
        onCertificateGenerated?.()
      } else {
        alert(result.error || 'Error al generar certificado')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error al generar certificado')
    } finally {
      setIsGenerating(false)
    }
  }

  const downloadCertificate = async () => {
    if (!certificateData) return

    const certificateElement = document.getElementById('certificate-template')
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
      pdf.save(`certificado-${certificateData.studentName.replace(/\s+/g, '-')}.pdf`)
    } catch (error) {
      console.error('Error al generar PDF:', error)
      alert('Error al generar PDF')
    }
  }

  const canGenerateCertificate = enrollment.status === 'COMPLETED'

  return (
    <div className="space-y-4">
      {/* Botón de Generación */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Certificado de Finalización
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {canGenerateCertificate ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-orange-500" />
                )}
                <span className="text-sm font-medium">
                  {canGenerateCertificate 
                    ? 'Curso completado - Certificado disponible' 
                    : 'El curso debe estar completado para generar certificado'
                  }
                </span>
              </div>
              
              {enrollment.grade && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Calificación: {enrollment.grade}/10</span>
                </div>
              )}
            </div>
            
            <div className="flex gap-2">
              {canGenerateCertificate && (
                <>
                  <Button 
                    onClick={generateCertificate}
                    disabled={isGenerating || !!certificateData}
                    size="sm"
                  >
                    {isGenerating ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Award className="h-4 w-4" />
                    )}
                    {isGenerating ? 'Generando...' : 'Generar Certificado'}
                  </Button>
                  
                  {certificateData && (
                    <Button 
                      onClick={downloadCertificate}
                      variant="outline"
                      size="sm"
                    >
                      <Download className="h-4 w-4" />
                      Descargar PDF
                    </Button>
                  )}
                </>
              )}
              
              {!canGenerateCertificate && (
                <Badge variant="secondary">
                  No disponible
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vista Previa del Certificado */}
      {certificateData && (
        <Card>
          <CardHeader>
            <CardTitle>Vista Previa del Certificado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg p-4 bg-white">
              <CertificateTemplate data={certificateData} />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

interface CertificateTemplateProps {
  data: {
    studentName: string
    courseName: string
    completionDate: string
    grade?: number
    instructorName: string
    courseDuration: number
    certificateNumber: string
  }
}

function CertificateTemplate({ data }: CertificateTemplateProps) {
  return (
    <div 
      id="certificate-template"
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
                <Clock className="h-4 w-4" />
                <span>{data.courseDuration} horas</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
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