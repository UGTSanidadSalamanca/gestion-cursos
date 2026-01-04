import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const status = searchParams.get('status')
    const paymentMethod = searchParams.get('paymentMethod')
    const studentId = searchParams.get('studentId')
    const courseId = searchParams.get('courseId')

    let whereClause: any = {}

    if (search) {
      whereClause.OR = [
        { reference: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { invoiceNumber: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (status && status !== 'all') {
      whereClause.status = status
    }

    if (paymentMethod && paymentMethod !== 'all') {
      whereClause.paymentMethod = paymentMethod
    }

    if (studentId) {
      whereClause.studentId = studentId
    }

    if (courseId) {
      whereClause.courseId = courseId
    }

    const payments = await db.payment.findMany({
      where: whereClause,
      include: {
        student: true,
        course: true
      },
      orderBy: {
        paymentDate: 'desc'
      }
    })

    return NextResponse.json(payments)
  } catch (error) {
    console.error('Error fetching payments:', error)
    return NextResponse.json(
      { error: 'Error fetching payments' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      studentId,
      courseId,
      amount,
      currency = 'EUR',
      paymentDate,
      paymentMethod,
      reference,
      description,
      status = 'PENDING',
      dueDate,
      paidDate,
      invoiceNumber
    } = body

    const paymentData = {
      studentId: studentId || null,
      courseId: courseId || null,
      amount: typeof amount === 'string' ? parseFloat(amount) : amount,
      currency: currency || 'EUR',
      paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
      paymentMethod,
      reference,
      description,
      status: status || 'PENDING',
      dueDate: dueDate ? new Date(dueDate) : null,
      paidDate: paidDate ? new Date(paidDate) : null,
      invoiceNumber
    }

    const payment = body.id
      ? await db.payment.upsert({
        where: { id: body.id },
        update: paymentData,
        create: { id: body.id, ...paymentData },
        include: { student: true, course: true }
      })
      : await db.payment.create({
        data: paymentData,
        include: { student: true, course: true }
      })

    return NextResponse.json(payment, { status: 201 })
  } catch (error) {
    console.error('Error creating payment:', error)
    return NextResponse.json(
      { error: 'Error creating payment' },
      { status: 500 }
    )
  }
}