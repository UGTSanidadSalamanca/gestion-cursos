import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

interface CertificateData {
  enrollmentId: string
  studentName: string
  courseName: string
  completionDate: string
  grade?: number
  instructorName: string
  courseDuration: number
  certificateNumber: string
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { enrollmentId } = body

    if (!enrollmentId) {
      return NextResponse.json(
        { error: 'ID de matrícula es requerido' },
        { status: 400 }
      )
    }

    // Obtener información de la matrícula
    const enrollment = await db.enrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        student: true,
        course: {
          include: {
            teacher: true
          }
        }
      }
    })

    if (!enrollment) {
      return NextResponse.json(
        { error: 'Matrícula no encontrada' },
        { status: 404 }
      )
    }

    // Verificar si el alumno ha completado el curso
    if (enrollment.status !== 'COMPLETED') {
      return NextResponse.json(
        { error: 'El alumno no ha completado el curso' },
        { status: 400 }
      )
    }

    // Generar número de certificado único
    const certificateNumber = `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    // Preparar datos del certificado
    const certificateData: CertificateData = {
      enrollmentId: enrollment.id,
      studentName: enrollment.student.name,
      courseName: enrollment.course.title,
      completionDate: enrollment.updatedAt.toISOString().split('T')[0],
      grade: enrollment.grade || undefined,
      instructorName: enrollment.course.teacher?.name || 'No asignado',
      courseDuration: enrollment.course.duration,
      certificateNumber
    }

    // Actualizar la matrícula con el número de certificado
    await db.enrollment.update({
      where: { id: enrollmentId },
      data: {
        certificate: certificateNumber
      }
    })

    return NextResponse.json({
      success: true,
      certificateData,
      message: 'Certificado generado exitosamente'
    })

  } catch (error) {
    console.error('Error al generar certificado:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const enrollmentId = searchParams.get('enrollmentId')

    if (!enrollmentId) {
      return NextResponse.json(
        { error: 'ID de matrícula es requerido' },
        { status: 400 }
      )
    }

    // Obtener información del certificado
    const enrollment = await db.enrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        student: true,
        course: {
          include: {
            teacher: true
          }
        }
      }
    })

    if (!enrollment || !enrollment.certificate) {
      return NextResponse.json(
        { error: 'Certificado no encontrado' },
        { status: 404 }
      )
    }

    const certificateData = {
      enrollmentId: enrollment.id,
      studentName: enrollment.student.name,
      courseName: enrollment.course.title,
      completionDate: enrollment.updatedAt.toISOString().split('T')[0],
      grade: enrollment.grade || undefined,
      instructorName: enrollment.course.teacher?.name || 'No asignado',
      courseDuration: enrollment.course.duration,
      certificateNumber: enrollment.certificate
    }

    return NextResponse.json({
      success: true,
      certificateData
    })

  } catch (error) {
    console.error('Error al obtener certificado:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}