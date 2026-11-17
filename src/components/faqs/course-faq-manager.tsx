"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card"
import {
  HelpCircle,
  Plus,
  Trash2,
  Edit2,
  ArrowUp,
  ArrowDown,
  Copy,
  Library,
  Eye,
  CheckCircle2,
  AlertCircle
} from "lucide-react"
import { toast } from "sonner"
import { FaqAccordion, FaqItem } from "./faq-accordion"

const SUGGESTED_CATEGORIES = [
  "Inscripción",
  "Afiliación y descuentos",
  "Precios y pagos",
  "Cancelaciones y devoluciones",
  "Desarrollo de la formación",
  "Materiales y certificados",
  "Convocatorias y oposiciones",
  "General"
]

interface CourseFaqManagerProps {
  courseId: string
  courseTitle: string
  showFaqs: boolean
  includeGlobalFaqs: boolean
  onToggleShowFaqs: (show: boolean) => void
  onToggleIncludeGlobal: (include: boolean) => void
}

export function CourseFaqManager({
  courseId,
  courseTitle,
  showFaqs,
  includeGlobalFaqs,
  onToggleShowFaqs,
  onToggleIncludeGlobal
}: CourseFaqManagerProps) {
  const [courseFaqs, setCourseFaqs] = useState<FaqItem[]>([])
  const [globalFaqs, setGlobalFaqs] = useState<FaqItem[]>([])
  const [loading, setLoading] = useState(true)

  // Modales
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isLibraryOpen, setIsLibraryOpen] = useState(false)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  // Formulario de edición/creación
  const [editingFaq, setEditingFaq] = useState<FaqItem | null>(null)
  const [formData, setFormData] = useState({
    question: "",
    answer: "",
    category: "Inscripción",
    isActive: true
  })

  // Cargar FAQs específicas del curso y globales
  const fetchFaqs = async () => {
    try {
      setLoading(true)
      const [courseRes, globalRes] = await Promise.all([
        fetch(`/api/faqs?courseId=${courseId}`),
        fetch(`/api/faqs?courseId=global`)
      ])

      if (courseRes.ok) {
        const cData = await courseRes.json()
        setCourseFaqs(cData)
      }
      if (globalRes.ok) {
        const gData = await globalRes.json()
        setGlobalFaqs(gData)
      }
    } catch (error) {
      console.error("Error al cargar FAQs:", error)
      toast.error("Error al cargar las preguntas frecuentes")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (courseId) {
      fetchFaqs()
    }
  }, [courseId])

  // Guardar nueva FAQ específica
  const handleCreateFaq = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.question.trim() || !formData.answer.trim()) {
      toast.error("Pregunta y respuesta son obligatorias")
      return
    }

    try {
      const res = await fetch("/api/faqs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          courseId,
          order: courseFaqs.length + 1
        })
      })

      if (res.ok) {
        toast.success("Pregunta específica creada correctamente")
        setIsCreateOpen(false)
        setFormData({ question: "", answer: "", category: "Inscripción", isActive: true })
        fetchFaqs()
      } else {
        const err = await res.json()
        toast.error(err.error || "Error al crear la pregunta")
      }
    } catch (error) {
      toast.error("Error al conectar con el servidor")
    }
  }

  // Actualizar FAQ
  const handleUpdateFaq = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingFaq) return

    try {
      const res = await fetch(`/api/faqs/${editingFaq.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        toast.success("Pregunta actualizada")
        setIsEditOpen(false)
        setEditingFaq(null)
        fetchFaqs()
      } else {
        const err = await res.json()
        toast.error(err.error || "Error al actualizar")
      }
    } catch (error) {
      toast.error("Error al actualizar la pregunta")
    }
  }

  // Eliminar FAQ
  const handleDeleteFaq = async (id: string, questionText: string) => {
    if (!confirm(`¿Eliminar la pregunta "${questionText}"?`)) return

    try {
      const res = await fetch(`/api/faqs/${id}`, { method: "DELETE" })
      if (res.ok) {
        toast.success("Pregunta eliminada")
        setCourseFaqs(prev => prev.filter(f => f.id !== id))
      } else {
        toast.error("Error al eliminar la pregunta")
      }
    } catch (error) {
      toast.error("Error al conectar con el servidor")
    }
  }

  // Alternar publicación
  const handleToggleActive = async (faq: FaqItem) => {
    try {
      const newStatus = !faq.isActive
      const res = await fetch(`/api/faqs/${faq.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: newStatus })
      })
      if (res.ok) {
        setCourseFaqs(prev => prev.map(f => f.id === faq.id ? { ...f, isActive: newStatus } : f))
        toast.success(newStatus ? "Pregunta activada" : "Pregunta desactivada")
      }
    } catch (error) {
      toast.error("Error al cambiar estado")
    }
  }

  // Mover orden arriba / abajo
  const handleMoveOrder = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= courseFaqs.length) return

    const currentFaq = courseFaqs[index]
    const targetFaq = courseFaqs[targetIndex]

    const newCurrentOrder = targetFaq.order || targetIndex + 1
    const newTargetOrder = currentFaq.order || index + 1

    try {
      await Promise.all([
        fetch(`/api/faqs/${currentFaq.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order: newCurrentOrder })
        }),
        fetch(`/api/faqs/${targetFaq.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order: newTargetOrder })
        })
      ])

      const updated = [...courseFaqs]
      updated[index] = { ...targetFaq, order: newTargetOrder }
      updated[targetIndex] = { ...currentFaq, order: newCurrentOrder }
      setCourseFaqs(updated)
      toast.success("Orden actualizado")
    } catch (error) {
      toast.error("Error al reordenar")
    }
  }

  // Importar desde biblioteca global al curso
  const handleImportFromLibrary = async (globalFaqId: string) => {
    try {
      const res = await fetch("/api/faqs/duplicate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          faqId: globalFaqId,
          targetCourseId: courseId
        })
      })

      if (res.ok) {
        toast.success("Pregunta añadida a las específicas del curso")
        fetchFaqs()
      } else {
        toast.error("Error al importar la pregunta")
      }
    } catch (error) {
      toast.error("Error de conexión")
    }
  }

  const openEditModal = (faq: FaqItem) => {
    setEditingFaq(faq)
    setFormData({
      question: faq.question,
      answer: faq.answer,
      category: faq.category || "Inscripción",
      isActive: faq.isActive !== false
    })
    setIsEditOpen(true)
  }

  // Combinación para previsualización
  const previewFaqs: FaqItem[] = [
    ...courseFaqs.filter(f => f.isActive),
    ...(includeGlobalFaqs ? globalFaqs.filter(g => g.isActive && !courseFaqs.some(c => c.question.toLowerCase() === g.question.toLowerCase())) : [])
  ]

  return (
    <div className="space-y-6">
      {/* Controles generales del bloque FAQ para este curso */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
          <div>
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-red-600" />
              Bloque de Preguntas Frecuentes (FAQ)
            </h4>
            <p className="text-xs text-slate-500">
              Controla la visualización del acordeón en la landing pública de este curso.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsPreviewOpen(true)}
              className="text-xs gap-1.5 h-9"
            >
              <Eye className="h-3.5 w-3.5 text-blue-600" />
              Vista Previa ({previewFaqs.length})
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200">
            <div className="space-y-0.5">
              <Label className="text-xs font-bold text-slate-800">Mostrar bloque FAQ en la landing</Label>
              <p className="text-[11px] text-slate-500">Activa o apaga el acordeón sin borrar preguntas.</p>
            </div>
            <Switch
              checked={showFaqs}
              onCheckedChange={onToggleShowFaqs}
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200">
            <div className="space-y-0.5">
              <Label className="text-xs font-bold text-slate-800">Incluir FAQs generales de la biblioteca</Label>
              <p className="text-[11px] text-slate-500">Muestra también las preguntas comunes a todos los cursos.</p>
            </div>
            <Switch
              checked={includeGlobalFaqs}
              onCheckedChange={onToggleIncludeGlobal}
            />
          </div>
        </div>
      </div>

      {/* Preguntas Específicas del Curso */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>Preguntas específicas de este curso</span>
              <Badge variant="secondary" className="text-xs">
                {courseFaqs.length}
              </Badge>
            </h4>
            <p className="text-xs text-slate-500">
              Personalizadas exclusivamente para {courseTitle}.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsLibraryOpen(true)}
              className="text-xs gap-1 h-8"
            >
              <Library className="h-3.5 w-3.5 text-slate-600" />
              Copiar de biblioteca
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => {
                setFormData({ question: "", answer: "", category: "Inscripción", isActive: true })
                setIsCreateOpen(true)
              }}
              className="text-xs gap-1 h-8 bg-red-600 hover:bg-red-700 text-white"
            >
              <Plus className="h-3.5 w-3.5" />
              Nueva pregunta
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">Cargando preguntas frecuentes...</div>
        ) : courseFaqs.length === 0 ? (
          <div className="p-6 text-center border-2 border-dashed border-slate-200 rounded-2xl space-y-2">
            <HelpCircle className="h-8 w-8 text-slate-300 mx-auto" />
            <p className="text-xs font-semibold text-slate-600">Este curso no tiene preguntas específicas todavía.</p>
            <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
              {includeGlobalFaqs
                ? "Actualmente solo se mostrarán las preguntas generales de la biblioteca."
                : "Puedes crear preguntas a medida o copiar preguntas de la biblioteca general."}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {courseFaqs.map((faq, idx) => (
              <div
                key={faq.id}
                className={`p-3 bg-white rounded-xl border transition-all flex items-center justify-between gap-3 ${
                  faq.isActive ? "border-slate-200" : "border-slate-200/60 bg-slate-50/50 opacity-60"
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="flex flex-col gap-0.5">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMoveOrder(idx, "up")}
                      className="p-0.5 hover:bg-slate-100 rounded disabled:opacity-30"
                    >
                      <ArrowUp className="h-3 w-3 text-slate-500" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === courseFaqs.length - 1}
                      onClick={() => handleMoveOrder(idx, "down")}
                      className="p-0.5 hover:bg-slate-100 rounded disabled:opacity-30"
                    >
                      <ArrowDown className="h-3 w-3 text-slate-500" />
                    </button>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-slate-400">#{idx + 1}</span>
                      <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-medium">
                        {faq.category || "General"}
                      </Badge>
                      {!faq.isActive && (
                        <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                          Desactivada
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-bold text-slate-800 line-clamp-1 mt-0.5">
                      {faq.question}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-slate-500 hover:text-blue-600"
                    onClick={() => openEditModal(faq)}
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-slate-500 hover:text-red-600"
                    onClick={() => handleDeleteFaq(faq.id, faq.question)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                  <Switch
                    checked={faq.isActive}
                    onCheckedChange={() => handleToggleActive(faq)}
                    className="scale-75"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Preguntas Generales que se mostrarán */}
      {includeGlobalFaqs && (
        <div className="space-y-3 pt-4 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Library className="h-3.5 w-3.5 text-slate-400" />
                Preguntas Generales Heredadas ({globalFaqs.filter(g => g.isActive).length})
              </h4>
              <p className="text-[11px] text-slate-400">
                Se muestran automáticamente en este curso porque la opción está habilitada.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {globalFaqs.slice(0, 6).map(g => (
              <div key={g.id} className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-left">
                <span className="text-[9px] font-bold text-slate-400 uppercase">{g.category}</span>
                <p className="text-xs font-semibold text-slate-700 line-clamp-1">{g.question}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Crear FAQ específica */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <form onSubmit={handleCreateFaq} className="space-y-4">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-slate-900">
                Nueva Pregunta Específica para este Curso
              </DialogTitle>
              <DialogDescription className="text-xs">
                Se mostrará únicamente en la landing de este curso.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-600">Categoría</Label>
                <select
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                  className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 py-1 text-xs"
                >
                  {SUGGESTED_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-600">Pregunta *</Label>
                <Input
                  value={formData.question}
                  onChange={e => setFormData({ ...formData, question: e.target.value })}
                  placeholder="Ej: ¿Dónde se realizarán las prácticas presenciales?"
                  required
                  className="text-xs h-9"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-600">Respuesta * (admite Markdown y enlaces)</Label>
                <Textarea
                  value={formData.answer}
                  onChange={e => setFormData({ ...formData, answer: e.target.value })}
                  placeholder="Detalla aquí la respuesta..."
                  required
                  rows={4}
                  className="text-xs"
                />
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsCreateOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" size="sm" className="bg-red-600 hover:bg-red-700 text-white">
                Crear Pregunta
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal: Editar FAQ */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <form onSubmit={handleUpdateFaq} className="space-y-4">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-slate-900">
                Editar Pregunta Frecuente
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-600">Categoría</Label>
                <select
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                  className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 py-1 text-xs"
                >
                  {SUGGESTED_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-600">Pregunta *</Label>
                <Input
                  value={formData.question}
                  onChange={e => setFormData({ ...formData, question: e.target.value })}
                  required
                  className="text-xs h-9"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-600">Respuesta *</Label>
                <Textarea
                  value={formData.answer}
                  onChange={e => setFormData({ ...formData, answer: e.target.value })}
                  required
                  rows={4}
                  className="text-xs"
                />
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsEditOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" size="sm" className="bg-red-600 hover:bg-red-700 text-white">
                Guardar Cambios
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal: Copiar de Biblioteca */}
      <Dialog open={isLibraryOpen} onOpenChange={setIsLibraryOpen}>
        <DialogContent className="sm:max-w-[650px] max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900">
              Biblioteca de Preguntas Generales
            </DialogTitle>
            <DialogDescription className="text-xs">
              Copia una pregunta general a este curso para personalizar su texto de forma independiente.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-2 py-2 pr-1">
            {globalFaqs.map(g => (
              <div
                key={g.id}
                className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start justify-between gap-3 hover:bg-white transition-colors"
              >
                <div className="space-y-1">
                  <Badge variant="outline" className="text-[10px]">
                    {g.category}
                  </Badge>
                  <p className="text-xs font-bold text-slate-800">{g.question}</p>
                  <p className="text-[11px] text-slate-500 line-clamp-2">{g.answer}</p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="shrink-0 text-xs gap-1 h-8"
                  onClick={() => handleImportFromLibrary(g.id)}
                >
                  <Copy className="h-3.5 w-3.5" />
                  Copiar al curso
                </Button>
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button type="button" size="sm" onClick={() => setIsLibraryOpen(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Vista Previa */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900">
              Vista Previa en Landing Pública
            </DialogTitle>
            <DialogDescription className="text-xs">
              Así verán los alumnos el bloque en la página del curso.
            </DialogDescription>
          </DialogHeader>

          <div className="py-2">
            {!showFaqs ? (
              <div className="p-6 text-center bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 text-xs">
                ⚠️ El bloque está <strong>desactivado</strong> para este curso. En la landing pública no se mostrará nada.
              </div>
            ) : previewFaqs.length === 0 ? (
              <div className="p-6 text-center bg-slate-50 rounded-2xl text-slate-500 text-xs">
                No hay preguntas activas para mostrar. El bloque permanecerá oculto.
              </div>
            ) : (
              <FaqAccordion faqs={previewFaqs} />
            )}
          </div>

          <DialogFooter>
            <Button type="button" size="sm" onClick={() => setIsPreviewOpen(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
