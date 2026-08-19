import { NextRequest, NextResponse } from 'next/server'
import { deactivateExpiredCourses } from '@/lib/course-utils'

export async function POST(request: NextRequest) {
  try {
    const result = await deactivateExpiredCourses()
    return NextResponse.json({
      success: true,
      message: result.deactivatedCount > 0
        ? `Se han desactivado ${result.deactivatedCount} curso(s) vencido(s).`
        : 'Todos los cursos están al día. No había cursos vencidos activos.',
      ...result
    })
  } catch (error) {
    console.error('Error syncing expired courses:', error)
    return NextResponse.json(
      { error: 'Error al sincronizar cursos vencidos' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  return POST(request)
}
