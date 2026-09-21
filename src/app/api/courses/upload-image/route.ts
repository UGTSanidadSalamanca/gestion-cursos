import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData()
    const file: File | null = data.get('file') as unknown as File

    if (!file) {
      return NextResponse.json({ error: 'No se ha enviado ningún archivo' }, { status: 400 })
    }

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'El archivo debe ser una imagen' }, { status: 400 })
    }

    // Validar tamaño máximo (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'La imagen no debe superar los 5MB' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Crear carpeta si no existe
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'courses')
    await mkdir(uploadDir, { recursive: true })

    // Sanitizar y generar nombre único
    const extension = path.extname(file.name) || '.png'
    const cleanName = path.basename(file.name, extension)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 30)
    const fileName = `${cleanName}-${Date.now()}${extension}`
    const filePath = path.join(uploadDir, fileName)

    await writeFile(filePath, buffer)

    const url = `/uploads/courses/${fileName}`
    return NextResponse.json({ success: true, url })
  } catch (error: any) {
    console.error('Error uploading course image:', error)
    return NextResponse.json(
      { error: 'Error al subir la imagen' },
      { status: 500 }
    )
  }
}
