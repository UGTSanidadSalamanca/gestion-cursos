import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from "next-auth/next"

// Simple handler access to get server session manually if needed, 
// but usually we can assume the user email from the session in a real protected route.
// For now, allow passing ?userId=... or assume current session.

export async function GET(request: NextRequest) {
    try {
        // Get session using the app's auth config (we'd need to import authOptions, but for now let's query based on searchParams or header if middleware passed it).
        // Since we are in app directory, getting session is a bit different. 
        // Let's rely on the client sending the request to filter by their own ID if we want to be secure,
        // OR better, we need to know WHICH teacher is asking.

        // For MVP, let's assume the UI passes the USER ID in the header or we can get it from session.
        // Getting session in Route Handler:
        // import { handler } from '@/app/api/auth/[...nextauth]/route'
        // const session = await getServerSession(handler); 
        // Use a simpler approach for now: query param ?userId=XYZ (validated by checking if that user exists and is tied to a teacher)

        const { searchParams } = new URL(request.url)
        const userId = searchParams.get('userId')

        if (!userId) {
            return NextResponse.json({ error: 'User ID required' }, { status: 400 })
        }

        // Find teacher profile linked to this user
        const teacher = await db.teacher.findFirst({
            where: { userId: userId }
        })

        if (!teacher) {
            return NextResponse.json({ error: 'Teacher profile not found' }, { status: 404 })
        }

        // Find courses where the teacher is assigned to a module
        const courses = await db.course.findMany({
            where: {
                modules: {
                    some: {
                        teacherId: teacher.id
                    }
                }
            },
            include: {
                _count: {
                    select: { enrollments: true }
                },
                // We might want next session info or schedule
            },
            orderBy: { startDate: 'desc' }
        })

        return NextResponse.json(courses)
    } catch (error) {
        console.error('Error fetching teacher courses:', error)
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        )
    }
}
