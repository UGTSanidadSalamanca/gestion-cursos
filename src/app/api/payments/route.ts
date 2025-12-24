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

    // Check if invoice number already exists
    if (invoiceNumber) {
      const existingPayment = await db.payment.findFirst({
        where: { invoiceNumber: invoiceNumber }
      })

      if (existingPayment) {
        return NextResponse.json(
          { error: 'Payment with this invoice number already exists' },
          { status: 400 }
        )
      }
    }

    const payment = await db.payment.create({
      data: {
        studentId,
        courseId,
        amount,
        currency,
        paymentDate: paymentDate || new Date(),
        paymentMethod,
        reference,
        description,
        status,
        dueDate,
        paidDate,
        invoiceNumber
      },
      include: {
        student: true,
        course: true
      }
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