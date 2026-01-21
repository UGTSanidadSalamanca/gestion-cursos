import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const level = searchParams.get('level')
    const isActive = searchParams.get('isActive')

    let whereClause: any = {}

    if (level && level !== 'all') {
      whereClause.level = level
    }

    if (isActive !== null && isActive !== undefined) {
      whereClause.isActive = isActive === 'true'
    }

    const courses = await db.course.findMany({
      where: whereClause,
      include: {
        teacher: true,
        modules: {
          include: {
            teacher: true
          }
        },
        _count: {
          select: { enrollments: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(courses)
  } catch (error) {
    console.error('Error fetching courses:', error)
    return NextResponse.json(
      { error: 'Error fetching courses' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      title,
      description,
      code,
      level,
      duration,
      durationSessions,
      sessionDuration,
      durationMonths,
      durationPeriod,
      syllabusUrl,
      maxStudents,
      price,
      priceUnit,
      paymentFrequency,
      affiliatePrice,
      isActive = true,
      startDate,
      endDate,
      publicDescription,
      benefits,
      features,
      callUrl,
      hasCertificate,
      hasMaterials,
      teacherId,
      modules = []
    } = body

    const course = await db.course.upsert({
      where: {
        code: code
      },
      update: {
        title,
        description,
        level,
        duration: duration ? parseInt(duration) : null,
        durationSessions: durationSessions ? parseInt(durationSessions) : null,
        sessionDuration: sessionDuration ? parseFloat(sessionDuration) : null,
        durationMonths: durationMonths ? parseInt(durationMonths) : null,
        durationPeriod,
        syllabusUrl,
        maxStudents: maxStudents ? parseInt(maxStudents) : null,
        price: price ? parseFloat(price) : null,
        priceUnit,
        paymentFrequency,
        affiliatePrice: affiliatePrice ? parseFloat(affiliatePrice) : null,
        isActive: isActive !== undefined ? isActive : true,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        publicDescription,
        benefits,
        features,
        callUrl,
        hasCertificate: hasCertificate !== undefined ? hasCertificate : true,
        hasMaterials: hasMaterials !== undefined ? hasMaterials : true,
        teacherId: teacherId || null,
        modules: {
          deleteMany: {},
          create: modules.map((m: any) => ({
            title: m.title,
            description: m.description,
            teacherId: m.teacherId || null
          }))
        }
      },
      create: {
        id: body.id || undefined,
        title,
        description,
        code,
        level,
        duration: duration ? parseInt(duration) : null,
        durationSessions: durationSessions ? parseInt(durationSessions) : null,
        sessionDuration: sessionDuration ? parseFloat(sessionDuration) : null,
        durationMonths: durationMonths ? parseInt(durationMonths) : null,
        durationPeriod,
        syllabusUrl,
        maxStudents: maxStudents ? parseInt(maxStudents) : null,
        price: price ? parseFloat(price) : null,
        priceUnit,
        paymentFrequency,
        affiliatePrice: affiliatePrice ? parseFloat(affiliatePrice) : null,
        isActive: isActive !== undefined ? isActive : true,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        publicDescription,
        benefits,
        features,
        callUrl,
        hasCertificate: hasCertificate !== undefined ? hasCertificate : true,
        hasMaterials: hasMaterials !== undefined ? hasMaterials : true,
        teacherId: teacherId || null,
        modules: {
          create: modules.map((m: any) => ({
            title: m.title,
            description: m.description,
            teacherId: m.teacherId || null
          }))
        }
      },
      include: {
        teacher: true,
        modules: {
          include: {
            teacher: true
          }
        },
        _count: {
          select: { enrollments: true }
        }
      }
    })

    return NextResponse.json(course, { status: 201 })
  } catch (error) {
    console.error('Error creating course:', error)
    return NextResponse.json(
      { error: 'Error creating course' },
      { status: 500 }
    )
  }
}