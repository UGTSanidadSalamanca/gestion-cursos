import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword } from '@/lib/auth-utils'

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id: teacherId } = params
        const { email, password } = await request.json()

        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email y contraseña son requeridos' },
                { status: 400 }
            )
        }

        // Verificar si el profesor existe
        const teacher = await db.teacher.findUnique({
            where: { id: teacherId }
        })

        if (!teacher) {
            return NextResponse.json(
                { error: 'Profesor no encontrado' },
                { status: 404 }
            )
        }

        // Verificar si ya tiene usuario
        if (teacher.userId) {
            return NextResponse.json(
                { error: 'Este profesor ya tiene un usuario asignado' },
                { status: 400 }
            )
        }

        // Verificar si el email ya está en uso en usuarios
        const existingUser = await db.user.findFirst({
            where: { email }
        })

        if (existingUser) {
            return NextResponse.json(
                { error: 'Este email ya está en uso por otro usuario' },
                { status: 400 }
            )
        }

        const hashedPassword = await hashPassword(password)

        // Crear usuario y actualizar profesor en una transacción
        const result = await db.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    email,
                    username: email, // Usamos el email como username por defecto
                    password: hashedPassword,
                    name: teacher.name,
                    role: 'TEACHER',
                }
            })

            await tx.teacher.update({
                where: { id: teacherId },
                data: {
                    userId: user.id
                }
            })

            return user
        })

        return NextResponse.json({
            success: true,
            message: 'Usuario creado correctamente',
            userId: result.id
        })
    } catch (error) {
        console.error('Error creando usuario profesor:', error)
        return NextResponse.json(
            { error: 'Error interno al crear usuario' },
            { status: 500 }
        )
    }
}
