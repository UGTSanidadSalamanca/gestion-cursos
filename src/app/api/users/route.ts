import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
    try {
        const users = await db.user.findMany({
            orderBy: { createdAt: 'desc' }
        })
        return NextResponse.json(users)
    } catch (error) {
        return NextResponse.json({ error: 'Error fetching users' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { email, name, role, id } = body

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 })
        }

        const user = await db.user.upsert({
            where: { email },
            update: {
                name,
                role: role || 'STAFF',
            },
            create: {
                id: id || undefined,
                email,
                name,
                role: role || 'STAFF',
            },
        })

        return NextResponse.json(user)
    } catch (error) {
        console.error('Error creating user:', error)
        return NextResponse.json({ error: 'Error creating user' }, { status: 500 })
    }
}
