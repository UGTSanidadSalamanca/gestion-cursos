import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
    try {
        const contacts = await db.contact.findMany({
            orderBy: {
                createdAt: 'desc'
            }
        })
        return NextResponse.json(contacts)
    } catch (error) {
        console.error('Error fetching contacts:', error)
        return NextResponse.json({ error: 'Error fetching contacts' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const contact = await db.contact.create({
            data: {
                name: body.name,
                email: body.email || null,
                phone: body.phone || null,
                mobile: body.mobile || null,
                address: body.address || null,
                company: body.company || null,
                position: body.position || null,
                category: body.category || 'PERSONAL',
                notes: body.notes || null,
                isPrimary: body.isPrimary || false,
            }
        })
        return NextResponse.json(contact)
    } catch (error) {
        console.error('Error creating contact:', error)
        return NextResponse.json({ error: 'Error creating contact' }, { status: 500 })
    }
}
