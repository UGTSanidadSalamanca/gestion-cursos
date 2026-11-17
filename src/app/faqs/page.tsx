"use client"

import { useState, useEffect } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  HelpCircle,
  Plus,
  Search,
  Edit2,
  Trash2,
  Copy,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Library,
  BookOpen,
  Filter,
  CheckCircle2
} from "lucide-react"
import { toast } from "sonner"
import { FaqItem, FaqAccordion } from "@/components/faqs/faq-accordion"

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

export default function FaqsPage() {
  const [faqs, setFaqs] = useState<FaqItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [filterType, setFilterType] = useState<"all" | "global" | "courses">("global")

  // Modales
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [editingFaq, setEditingFaq] = useState<FaqItem | null>(null)

  // Formulario
  const [formData, setFormData] = useState({
    question: "",
    answer: "",
    category: "Inscripción",
    isActive: true,
    courseId: null as string | null
  })

  const loadFaqs = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filterType === "global") params.set("courseId", "global")
      else if (filterType === "courses") params.set("courseId", "all")
      if (selectedCategory !== "all") params.set("category", selectedCategory)
      if (searchTerm) params.set("search", searchTerm)

      const res = await fetch(`/api/faqs?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setFaqs(data)
      } else {
        toast.error("Error al cargar las preguntas frecuentes")
      }
    } catch (error) {
      console.error(error)
      toast.error("Error al conectar con el servidor")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadFaqs()
  }, [selectedCategory, filterType])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    loadFaqs()
  }

  const handleCreate = async (e: React.FormEvent) => {
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
          order: faqs.length + 1
        })
      })

      if (res.ok) {
        toast.success("Pregunta frecuente creada con éxito")
        setIsCreateOpen(false)
        setFormData({ question: "", answer: "", category: "Inscripción", isActive: true, courseId: null })
        loadFaqs()
      } else {
        const err = await res.json()
        toast.error(err.error || "Error al crear la pregunta")
      }
    } catch (error) {
      toast.error("Error de conexión")
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
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
        loadFaqs()
      } else {
        const err = await res.json()
        toast.error(err.error || "Error al actualizar")
      }
    } catch (error) {
      toast.error("Error al actualizar la pregunta")
    }
  }

  const handleDelete = async (id: string, question: string) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar la pregunta "${question}"?`)) return

    try {
      const res = await fetch(`/api/faqs/${id}`, { method: "DELETE" })
      if (res.ok) {
        toast.success("Pregunta eliminada")
        setFaqs(prev => prev.filter(f => f.id !== id))
      } else {
        toast.error("Error al eliminar la pregunta")
      }
    } catch (error) {
      toast.error("Error de conexión")
    }
  }

  const handleToggleActive = async (faq: FaqItem) => {
    try {
      const newStatus = !faq.isActive
      const res = await fetch(`/api/faqs/${faq.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: newStatus })
      })
      if (res.ok) {
        setFaqs(prev => prev.map(f => f.id === faq.id ? { ...f, isActive: newStatus } : f))
        toast.success(newStatus ? "Pregunta activada" : "Pregunta desactivada")
      }
    } catch (error) {
      toast.error("Error al cambiar estado")
    }
  }

  const handleDuplicate = async (faqId: string) => {
    try {
      const res = await fetch("/api/faqs/duplicate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ faqId })
      })

      if (res.ok) {
        toast.success("Pregunta duplicada")
        loadFaqs()
      } else {
        toast.error("Error al duplicar")
      }
    } catch (error) {
      toast.error("Error de conexión")
    }
  }

  const handleMoveOrder = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= faqs.length) return

    const currentFaq = faqs[index]
    const targetFaq = faqs[targetIndex]

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

      const updated = [...faqs]
      updated[index] = { ...targetFaq, order: newTargetOrder }
      updated[targetIndex] = { ...currentFaq, order: newCurrentOrder }
      setFaqs(updated)
      toast.success("Orden actualizado")
    } catch (error) {
      toast.error("Error al reordenar")
    }
  }

  const openEdit = (faq: FaqItem) => {
    setEditingFaq(faq)
    setFormData({
      question: faq.question,
      answer: faq.answer,
      category: faq.category || "Inscripción",
      isActive: faq.isActive !== false,
      courseId: faq.courseId || null
    })
    setIsEditOpen(true)
  }

  const activeCount = faqs.filter(f => f.isActive).length
  const categoriesPresent = Array.from(new Set(faqs.map(f => f.category || "General")))

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Cabecera de la sección */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <HelpCircle className="h-6 w-6 text-red-600" />
              Preguntas Frecuentes (FAQ)
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Gestiona la biblioteca de preguntas comunes y específicas que se muestran en las landings públicas.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPreviewOpen(true)}
              className="text-xs gap-1.5"
            >
              <HelpCircle className="h-4 w-4 text-slate-600" />
              Vista Previa
            </Button>
            <Button
              size="sm"
              onClick={() => {
                setFormData({
                  question: "",
                  answer: "",
                  category: "Inscripción",
                  isActive: true,
                  courseId: null
                })
                setIsCreateOpen(true)
              }}
              className="bg-red-600 hover:bg-red-700 text-white text-xs gap-1.5"
            >
              <Plus className="h-4 w-4" />
              Nueva Pregunta
            </Button>
          </div>
        </div>

        {/* Tarjetas de Estadísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500">Total Preguntas</p>
                <p className="text-2xl font-black text-slate-900">{faqs.length}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Library className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500">Preguntas Activas</p>
                <p className="text-2xl font-black text-emerald-600">{activeCount}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500">Categorías Activas</p>
                <p className="text-2xl font-black text-slate-900">{categoriesPresent.length}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <Filter className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Barra de Filtros y Búsqueda */}
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-4">
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Buscar en preguntas o respuestas..."
                  className="pl-9 text-xs h-9"
                />
              </div>

              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="h-9 rounded-md border border-slate-200 bg-white px-3 py-1 text-xs sm:w-56"
              >
                <option value="all">Todas las categorías</option>
                {SUGGESTED_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              <select
                value={filterType}
                onChange={e => setFilterType(e.target.value as any)}
                className="h-9 rounded-md border border-slate-200 bg-white px-3 py-1 text-xs sm:w-48"
              >
                <option value="global">Biblioteca (Generales)</option>
                <option value="courses">Todas (Cursos + Generales)</option>
              </select>

              <Button type="submit" size="sm" variant="secondary" className="text-xs h-9">
                Filtrar
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Listado de Preguntas Frecuentes */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="py-4 px-6 border-b border-slate-100 bg-slate-50/50">
            <CardTitle className="text-sm font-bold text-slate-800 flex items-center justify-between">
              <span>Listado de Preguntas Frecuentes ({faqs.length})</span>
              <span className="text-xs font-normal text-slate-500">
                Usa las flechas para ordenar su visualización en el acordeón
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            {loading ? (
              <div className="p-12 text-center text-xs text-slate-400">
                Cargando preguntas frecuentes...
              </div>
            ) : faqs.length === 0 ? (
              <div className="p-12 text-center border-2 border-dashed border-slate-200 rounded-2xl space-y-3">
                <HelpCircle className="h-10 w-10 text-slate-300 mx-auto" />
                <p className="text-sm font-bold text-slate-700">No se encontraron preguntas frecuentes</p>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Añade una nueva pregunta a la biblioteca o cambia los filtros de búsqueda.
                </p>
                <Button
                  size="sm"
                  onClick={() => setIsCreateOpen(true)}
                  className="bg-red-600 hover:bg-red-700 text-white text-xs mt-2"
                >
                  <Plus className="h-3.5 w-3.5 mr-1" /> Crear primera pregunta
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {faqs.map((faq, index) => (
                  <div
                    key={faq.id}
                    className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      faq.isActive ? "bg-white border-slate-200 hover:border-slate-300" : "bg-slate-50/70 border-slate-200/60 opacity-60"
                    }`}
                  >
                    <div className="flex items-start sm:items-center gap-3 flex-1">
                      {/* Botones de Orden */}
                      <div className="flex flex-col gap-0.5 shrink-0 pt-0.5 sm:pt-0">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => handleMoveOrder(index, "up")}
                          className="p-1 hover:bg-slate-100 rounded disabled:opacity-30"
                          title="Subir posición"
                        >
                          <ArrowUp className="h-3.5 w-3.5 text-slate-500" />
                        </button>
                        <button
                          type="button"
                          disabled={index === faqs.length - 1}
                          onClick={() => handleMoveOrder(index, "down")}
                          className="p-1 hover:bg-slate-100 rounded disabled:opacity-30"
                          title="Bajar posición"
                        >
                          <ArrowDown className="h-3.5 w-3.5 text-slate-500" />
                        </button>
                      </div>

                      {/* Contenido de la FAQ */}
                      <div className="space-y-1 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[10px] font-bold text-slate-400">#{index + 1}</span>
                          <Badge variant="outline" className="text-[10px] font-bold text-slate-700 bg-slate-50">
                            {faq.category || "General"}
                          </Badge>
                          {faq.courseId ? (
                            <Badge variant="secondary" className="text-[10px] bg-blue-50 text-blue-700 border-blue-200">
                              Curso: {(faq as any).course?.title || "Específica"}
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200">
                              Biblioteca Global
                            </Badge>
                          )}
                          {!faq.isActive && (
                            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                              Oculta
                            </span>
                          )}
                        </div>

                        <p className="text-sm font-bold text-slate-900">
                          {faq.question}
                        </p>
                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center border-t sm:border-t-0 pt-2 sm:pt-0 w-full sm:w-auto justify-between sm:justify-start">
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-500 hover:text-blue-600"
                          onClick={() => openEdit(faq)}
                          title="Editar"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-500 hover:text-emerald-600"
                          onClick={() => handleDuplicate(faq.id)}
                          title="Duplicar pregunta"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-500 hover:text-red-600"
                          onClick={() => handleDelete(faq.id, faq.question)}
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                        <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
                          {faq.isActive ? "Activa" : "Oculta"}
                        </span>
                        <Switch
                          checked={faq.isActive}
                          onCheckedChange={() => handleToggleActive(faq)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modal: Crear FAQ */}
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <form onSubmit={handleCreate} className="space-y-4">
              <DialogHeader>
                <DialogTitle className="text-base font-bold text-slate-900">
                  Nueva Pregunta en Biblioteca Global
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Estará disponible para todos los cursos con FAQs activadas.
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
                    placeholder="Ej: ¿Qué titulación se exige para el curso?"
                    required
                    className="text-xs h-9"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-bold text-slate-600">
                    Respuesta * (admite Markdown y enlaces seguros)
                  </Label>
                  <Textarea
                    value={formData.answer}
                    onChange={e => setFormData({ ...formData, answer: e.target.value })}
                    placeholder="Escribe la respuesta. Puedes usar enlaces con [texto](https://...)"
                    required
                    rows={5}
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
          <DialogContent className="sm:max-w-[600px]">
            <form onSubmit={handleUpdate} className="space-y-4">
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
                    rows={5}
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

        {/* Modal: Vista Previa */}
        <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
          <DialogContent className="sm:max-w-[750px] max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-slate-900">
                Vista Previa del Acordeón FAQ
              </DialogTitle>
              <DialogDescription className="text-xs">
                Así se visualizará la biblioteca de preguntas en las páginas públicas.
              </DialogDescription>
            </DialogHeader>

            <div className="py-2">
              <FaqAccordion faqs={faqs.filter(f => f.isActive)} />
            </div>

            <DialogFooter>
              <Button type="button" size="sm" onClick={() => setIsPreviewOpen(false)}>
                Cerrar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  )
}
