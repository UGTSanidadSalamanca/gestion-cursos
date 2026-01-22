"use client"

import { useState } from "react"
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
import { Mail, Send, Loader2, AlertCircle, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"

interface GroupEmailDialogProps {
    courseId: string
    courseTitle: string
    isOpen: boolean
    onOpenChange: (open: boolean) => void
}

export function GroupEmailDialog({
    courseId,
    courseTitle,
    isOpen,
    onOpenChange,
}: GroupEmailDialogProps) {
    const [subject, setSubject] = useState("")
    const [message, setMessage] = useState("")
    const [sending, setSending] = useState(false)
    const [success, setSuccess] = useState(false)

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!subject || !message) {
            toast.error("Por favor, rellena todos los campos")
            return
        }

        setSending(true)
        try {
            const response = await fetch(`/api/courses/${courseId}/group-email`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ subject, message }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || "Error al enviar el email")
            }

            setSuccess(true)
            toast.success(data.message)
            setTimeout(() => {
                onOpenChange(false)
                resetForm()
            }, 2000)
        } catch (error) {
            console.error(error)
            toast.error(error instanceof Error ? error.message : "Error al enviar el email")
        } finally {
            setSending(false)
        }
    }

    const resetForm = () => {
        setSubject("")
        setMessage("")
        setSuccess(false)
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            if (!sending) {
                onOpenChange(open)
                if (!open) resetForm()
            }
        }}>
            <DialogContent className="sm:max-w-[550px] overflow-hidden">
                <DialogHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                            <Mail className="h-5 w-5" />
                        </div>
                        <div>
                            <DialogTitle>Email Grupal</DialogTitle>
                            <DialogDescription>
                                Enviar comunicación a todos los alumnos de <strong>{courseTitle}</strong>
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                {success ? (
                    <div className="py-12 flex flex-col items-center justify-center space-y-4 text-center">
                        <div className="h-16 w-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                            <CheckCircle2 className="h-10 w-10" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-900">¡Emails Enviados!</h3>
                            <p className="text-slate-500">La información ha sido enviada correctamente.</p>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSend} className="space-y-6 py-4">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="subject" className="text-xs font-black uppercase text-slate-500">Asunto del Correo</Label>
                                <Input
                                    id="subject"
                                    placeholder="Ej: Información importante sobre el inicio del curso"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    disabled={sending}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="message" className="text-xs font-black uppercase text-slate-500">Mensaje / Cuerpo</Label>
                                <Textarea
                                    id="message"
                                    placeholder="Escribe aquí el contenido que recibirán los alumnos..."
                                    className="min-h-[200px] resize-none"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    disabled={sending}
                                    required
                                />
                                <p className="text-[10px] text-slate-400 italic">
                                    * Este mensaje se enviará a todos los alumnos inscritos con copia oculta (BCC).
                                </p>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => onOpenChange(false)}
                                disabled={sending}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                disabled={sending || !subject || !message}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold"
                            >
                                {sending ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Enviando...
                                    </>
                                ) : (
                                    <>
                                        <Send className="mr-2 h-4 w-4" />
                                        Enviar a todos
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
