import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
    try {
        const contacts = await db.contact.findMany({
            orderBy: { createdAt: 'desc' }
        })
        return NextResponse.json(contacts)
    } catch (error) {
        return NextResponse.json({ error: 'Error fetching contacts' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const {
            name, email, phone, mobile, address, company, position,
            category, notes, isPrimary, studentId, teacherId, providerId, userId, id
        } = body

        if (!name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 })
        }

        const contact = await db.contact.create({
            data: {
                id: id || undefined,
                name,
                email,
                phone,
                mobile,
                address,
                company,
                position,
                category: category || 'OTHER',
                notes,
                isPrimary: isPrimary !== undefined ? isPrimary : false,
                studentId: studentId || null,
                teacherId: teacherId || null,
                providerId: providerId || null,
                userId: userId || null,
            },
        })

        return NextResponse.json(contact)
    } catch (error) {
        console.error('Error creating contact:', error)
        return NextResponse.json({ error: 'Error creating contact' }, { status: 500 })
    }
}
