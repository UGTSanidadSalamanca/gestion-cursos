"use client"

import { useState, useMemo } from "react"
import { useSession } from "next-auth/react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Mail, Send, Loader2, AlertTriangle, CheckCircle2, Users, AlertCircle } from "lucide-react"
import { toast } from "sonner"

export interface SelectedEnrollmentItem {
  id: string
  studentName: string
  courseName: string
  student?: {
    name?: string
    email?: string | null
    dni?: string | null
  }
}

interface BatchEmailDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  selectedEnrollments: SelectedEnrollmentItem[]
  onSuccess?: () => void
}

export function BatchEmailDialog({
  isOpen,
  onOpenChange,
  selectedEnrollments,
  onSuccess,
}: BatchEmailDialogProps) {
  const { data: session } = useSession()
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [sending, setSending] = useState(false)
  const [success, setSuccess] = useState(false)
  const [showAllRecipients, setShowAllRecipients] = useState(false)

  // Calcular destinatarios únicos con email y alumnos sin email
  const { validRecipients, missingEmailStudents } = useMemo(() => {
    const validMap = new Map<string, { name: string; email: string; courses: string[] }>()
    const missingSet = new Set<string>()

    selectedEnrollments.forEach((item) => {
      const email = item.student?.email?.trim()
      const name = item.student?.name || item.studentName || 'Alumno'

      if (email && email.includes('@')) {
        const lowerEmail = email.toLowerCase()
        const existing = validMap.get(lowerEmail)
        if (existing) {
          if (!existing.courses.includes(item.courseName)) {
            existing.courses.push(item.courseName)
          }
        } else {
          validMap.set(lowerEmail, {
            name,
            email,
            courses: [item.courseName],
          })
        }
      } else {
        missingSet.add(name)
      }
    })

    return {
      validRecipients: Array.from(validMap.values()),
      missingEmailStudents: Array.from(missingSet),
    }
  }, [selectedEnrollments])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!subject.trim() || !message.trim()) {
      toast.error("Por favor completa el asunto y el mensaje")
      return
    }

    if (validRecipients.length === 0) {
      toast.error("No hay alumnos con correo electrónico seleccionados")
      return
    }

    setSending(true)
    try {
      const response = await fetch("/api/enrollments/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          enrollmentIds: selectedEnrollments.map((e) => e.id),
          subject: subject.trim(),
          message: message.trim(),
          replyTo: session?.user?.email || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || data.details || "Error al enviar los correos")
      }

      setSuccess(true)
      toast.success(data.message || `Correo enviado a ${validRecipients.length} alumno(s)`)

      setTimeout(() => {
        onOpenChange(false)
        resetForm()
        onSuccess?.()
      }, 1800)
    } catch (error) {
      console.error("Error al enviar email grupal a matrículas:", error)
      toast.error(error instanceof Error ? error.message : "Error al enviar el correo")
    } finally {
      setSending(false)
    }
  }

  const resetForm = () => {
    setSubject("")
    setMessage("")
    setSuccess(false)
    setShowAllRecipients(false)
  }

  const displayedRecipients = showAllRecipients
    ? validRecipients
    : validRecipients.slice(0, 6)

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!sending) {
          onOpenChange(open)
          if (!open) resetForm()
        }
      }}
    >
      <DialogContent className="sm:max-w-[620px] max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300 rounded-xl">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold">
                Enviar Correo a Alumnos Seleccionados
              </DialogTitle>
              <DialogDescription className="text-sm mt-0.5">
                {selectedEnrollments.length} matrícula{selectedEnrollments.length !== 1 ? 's' : ''} seleccionada{selectedEnrollments.length !== 1 ? 's' : ''} · {validRecipients.length} destinatario{validRecipients.length !== 1 ? 's' : ''} único{validRecipients.length !== 1 ? 's' : ''} con email
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {success ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-4 text-center">
            <div className="h-16 w-16 bg-green-100 dark:bg-green-900/40 text-green-600 rounded-full flex items-center justify-center animate-bounce">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                ¡Correos Enviados con Éxito!
              </h3>
              <p className="text-slate-500 text-sm mt-1">
                La comunicación ha sido remitida a los {validRecipients.length} alumnos seleccionados.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSend} className="space-y-4 py-2 overflow-y-auto pr-1">
            {/* Lista resumen de destinatarios */}
            <div className="rounded-lg border bg-slate-50/70 dark:bg-slate-900/50 p-3 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-blue-600" />
                  Destinatarios ({validRecipients.length})
                </span>
                {validRecipients.length > 6 && (
                  <button
                    type="button"
                    onClick={() => setShowAllRecipients(!showAllRecipients)}
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium text-xs"
                  >
                    {showAllRecipients ? "Ver menos" : `Ver todos (${validRecipients.length})`}
                  </button>
                )}
              </div>

              {validRecipients.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
                  {displayedRecipients.map((recipient, i) => (
                    <Badge
                      key={i}
                      variant="secondary"
                      className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-[11px] py-0.5 px-2 font-normal"
                      title={recipient.email}
                    >
                      <span className="font-medium mr-1">{recipient.name}</span>
                      <span className="text-slate-400 text-[10px]">({recipient.email})</span>
                    </Badge>
                  ))}
                  {!showAllRecipients && validRecipients.length > 6 && (
                    <Badge
                      variant="outline"
                      className="text-slate-500 text-[11px] py-0.5 px-2 cursor-pointer hover:bg-slate-100"
                      onClick={() => setShowAllRecipients(true)}
                    >
                      +{validRecipients.length - 6} más
                    </Badge>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs text-red-600 py-1">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>No hay alumnos con dirección de correo en las matrículas seleccionadas.</span>
                </div>
              )}

              {/* Advertencia de alumnos sin correo */}
              {missingEmailStudents.length > 0 && (
                <div className="flex items-start gap-2 pt-2 border-t border-amber-200/60 dark:border-amber-900/40 text-amber-800 dark:text-amber-300 text-xs">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5 text-amber-600" />
                  <div>
                    <span className="font-semibold">
                      {missingEmailStudents.length} alumno{missingEmailStudents.length !== 1 ? 's' : ''} sin email:
                    </span>{" "}
                    <span className="text-amber-700 dark:text-amber-400">
                      {missingEmailStudents.slice(0, 3).join(", ")}
                      {missingEmailStudents.length > 3 && ` y ${missingEmailStudents.length - 3} más`}
                    </span>
                    <span className="text-[11px] block text-amber-600/80 dark:text-amber-400/80">
                      (No recibirán este correo porque no tienen dirección registrada)
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Asunto */}
            <div className="space-y-1.5">
              <Label htmlFor="batch-email-subject" className="text-xs font-bold uppercase text-slate-600 dark:text-slate-300">
                Asunto del Correo <span className="text-red-500">*</span>
              </Label>
              <Input
                id="batch-email-subject"
                placeholder="Ej: Información importante sobre su matrícula o inicio de curso"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                disabled={sending}
                required
              />
            </div>

            {/* Mensaje */}
            <div className="space-y-1.5">
              <Label htmlFor="batch-email-message" className="text-xs font-bold uppercase text-slate-600 dark:text-slate-300">
                Mensaje / Contenido <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="batch-email-message"
                placeholder="Escribe aquí el cuerpo del mensaje que recibirán los alumnos..."
                className="min-h-[160px] resize-none"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={sending}
                required
              />
              <p className="text-[11px] text-slate-400 italic">
                * Este correo se enviará en copia oculta (BCC) a todos los alumnos seleccionados para garantizar la protección de datos.
              </p>
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={sending}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={sending || !subject.trim() || !message.trim() || validRecipients.length === 0}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold"
              >
                {sending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando correo...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Enviar a {validRecipients.length} alumno{validRecipients.length !== 1 ? 's' : ''}
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
