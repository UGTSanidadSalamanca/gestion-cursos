"use client"

import { useState, useRef } from "react"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Upload, X, Check, Image as ImageIcon, Loader2, Sparkles } from "lucide-react"
import { toast } from "sonner"

export const CATALOG_COURSE_IMAGES = [
  {
    id: 'aux-admin-junta',
    title: 'Aux. Admin. Junta',
    subtitle: 'Junta de Castilla y León',
    url: '/Imagenes/cursos/aux-admin-junta.png'
  },
  {
    id: 'aux-admin-sacyl',
    title: 'Aux. Admin. SACYL',
    subtitle: 'Sanidad Castilla y León',
    url: '/Imagenes/cursos/aux-admin-sacyl.png'
  },
  {
    id: 'celador',
    title: 'Celador',
    subtitle: 'Servicios de Salud / SACYL',
    url: '/Imagenes/cursos/celador.png'
  },
  {
    id: 'tcae',
    title: 'TCAE',
    subtitle: 'Cuidados Auxiliares Enfermería',
    url: '/Imagenes/cursos/tcae.png'
  }
]

interface CourseImagePickerProps {
  value: string
  onChange: (url: string) => void
}

export function CourseImagePicker({ value, onChange }: CourseImagePickerProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [showUrlInput, setShowUrlInput] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecciona un archivo de imagen válido')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen no debe superar los 5 MB')
      return
    }

    setIsUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/courses/upload-image', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Error al subir la imagen')
      }

      const data = await response.json()
      onChange(data.url)
      toast.success('Imagen subida correctamente')
    } catch (error) {
      console.error(error)
      toast.error('No se pudo subir la imagen')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  // Normalizar valor para comparar con URLs de catálogo (por si vienen con o sin codificar)
  const normalizedValue = value ? decodeURIComponent(value) : ''

  return (
    <div className="space-y-4 p-5 bg-gradient-to-br from-slate-50 to-blue-50/20 border border-slate-200/80 rounded-2xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <Label className="text-xs font-black uppercase text-blue-900 tracking-wider flex items-center gap-1.5">
            <ImageIcon className="h-4 w-4 text-blue-600" /> Imagen de Portada del Curso (1:1 Cuadrada)
          </Label>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Se mostrará en la cabecera de la landing pública y en las tarjetas del curso.
          </p>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-blue-100/80 text-blue-700 rounded-md self-start sm:self-auto">
          Recomendado: 1:1
        </span>
      </div>

      {/* Grid de Imágenes de Catálogo */}
      <div className="space-y-2">
        <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1">
          <Sparkles className="h-3 w-3 text-amber-500" /> Imágenes de catálogo oficiales UGT:
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {CATALOG_COURSE_IMAGES.map((img) => {
            const isSelected = normalizedValue === img.url || normalizedValue === img.url.replace('/Imagenes/cursos/aux-admin-', '/Imagenes/cursos/aux admin ')
            return (
              <button
                key={img.id}
                type="button"
                onClick={() => onChange(img.url)}
                className={`group relative flex flex-col items-center p-2 rounded-xl border text-center transition-all bg-white hover:shadow-md ${
                  isSelected
                    ? 'border-blue-600 ring-2 ring-blue-500/20 shadow-sm bg-blue-50/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Check badge */}
                {isSelected && (
                  <div className="absolute top-1.5 right-1.5 h-5 w-5 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-xs z-10">
                    <Check className="h-3 w-3 stroke-[3]" />
                  </div>
                )}

                {/* Thumbnail */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-slate-100 mb-2 border border-slate-100 flex items-center justify-center">
                  <img
                    src={img.url}
                    alt={img.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    loading="lazy"
                  />
                </div>

                <span className="text-xs font-bold text-slate-800 leading-tight line-clamp-1">
                  {img.title}
                </span>
                <span className="text-[10px] text-slate-400 leading-tight line-clamp-1 mt-0.5">
                  {img.subtitle}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Previsualización y Acciones Personalizadas */}
      <div className="pt-2 border-t border-slate-200/60 flex flex-col sm:flex-row items-center gap-4">
        {/* Preview box */}
        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl border-2 border-dashed border-slate-200 bg-white flex items-center justify-center overflow-hidden shrink-0 relative shadow-xs">
          {value ? (
            <>
              <img
                src={value}
                alt="Vista previa de portada"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => onChange('')}
                className="absolute top-1 right-1 h-5 w-5 bg-red-600/90 hover:bg-red-700 text-white rounded-full flex items-center justify-center shadow-md transition-colors"
                title="Eliminar imagen"
              >
                <X className="h-3 w-3" />
              </button>
            </>
          ) : (
            <div className="text-center p-2 text-slate-300">
              <ImageIcon className="h-8 w-8 mx-auto mb-1 stroke-1" />
              <span className="text-[9px] font-bold block uppercase tracking-wide text-slate-400">Sin foto</span>
            </div>
          )}
        </div>

        {/* Botones de acción */}
        <div className="flex-1 space-y-2 w-full">
          <div className="flex flex-wrap gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
              className="h-9 text-xs font-bold bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> Subiendo...
                </>
              ) : (
                <>
                  <Upload className="h-3.5 w-3.5 mr-1.5 text-blue-600" /> Subir otra imagen (PC)
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowUrlInput(!showUrlInput)}
              className="h-9 text-xs text-slate-500 hover:text-slate-800"
            >
              {showUrlInput ? 'Ocultar URL' : 'Escribir enlace URL'}
            </Button>

            {value && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onChange('')}
                className="h-9 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 ml-auto"
              >
                Quitar imagen
              </Button>
            )}
          </div>

          {showUrlInput && (
            <div className="pt-1">
              <Input
                placeholder="https://... o /Imagenes/cursos/..."
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="h-9 text-xs bg-white border-slate-200"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
