import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
    try {
        const software = await db.software.findMany({
            orderBy: { createdAt: 'desc' }
        })
        return NextResponse.json(software)
    } catch (error) {
        return NextResponse.json({ error: 'Error fetching software' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const {
            name, version, type, license, licenseKey, expiryDate,
            provider, description, isActive, maxUsers, currentUsers, url, id
        } = body

        if (!name || !type) {
            return NextResponse.json({ error: 'Name and Type are required' }, { status: 400 })
        }

        const software = await db.software.upsert({
            where: { id: id || 'temp-id' }, // If id is provided, try to upsert
            update: {
                name,
                version,
                type,
                license,
                licenseKey,
                expiryDate: expiryDate ? new Date(expiryDate) : null,
                provider,
                description,
                isActive: isActive !== undefined ? isActive : true,
                maxUsers,
                currentUsers: currentUsers || 0,
                url,
            },
            create: {
                id: (id && id !== 'temp-id') ? id : undefined,
                name,
                version,
                type,
                license,
                licenseKey,
                expiryDate: expiryDate ? new Date(expiryDate) : null,
                provider,
                description,
                isActive: isActive !== undefined ? isActive : true,
                maxUsers,
                currentUsers: currentUsers || 0,
                url,
            },
        })

        return NextResponse.json(software)
    } catch (error) {
        console.error('Error creating software:', error)
        return NextResponse.json({ error: 'Error creating software' }, { status: 500 })
    }
}
