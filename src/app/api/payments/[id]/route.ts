import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const payment = await db.payment.findUnique({
      where: { id: params.id },
      include: {
        student: true,
        course: true
      }
    })

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(payment)
  } catch (error) {
    console.error('Error fetching payment:', error)
    return NextResponse.json(
      { error: 'Error fetching payment' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const {
      studentId,
      courseId,
      amount,
      currency,
      paymentDate,
      paymentMethod,
      reference,
      description,
      status,
      dueDate,
      paidDate,
      invoiceNumber
    } = body

    // Check if another payment with same invoice number exists
    if (invoiceNumber) {
      const existingPayment = await db.payment.findFirst({
        where: {
          invoiceNumber: invoiceNumber,
          NOT: {
            id: params.id
          }
        }
      })

      if (existingPayment) {
        return NextResponse.json(
          { error: 'Another payment with this invoice number already exists' },
          { status: 400 }
        )
      }
    }

    const payment = await db.payment.update({
      where: { id: params.id },
      data: {
        studentId,
        courseId,
        amount,
        currency,
        paymentDate,
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

    return NextResponse.json(payment)
  } catch (error) {
    console.error('Error updating payment:', error)
    return NextResponse.json(
      { error: 'Error updating payment' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await db.payment.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Payment deleted successfully' })
  } catch (error) {
    console.error('Error deleting payment:', error)
    return NextResponse.json(
      { error: 'Error deleting payment' },
      { status: 500 }
    )
  }
}