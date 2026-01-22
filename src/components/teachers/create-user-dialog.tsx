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
import { KeyRound, Shield, Loader2, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"

interface CreateUserDialogProps {
    teacherId: string
    teacherName: string
    teacherEmail?: string
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
}

export function CreateUserDialog({
    teacherId,
    teacherName,
    teacherEmail,
    isOpen,
    onOpenChange,
    onSuccess
}: CreateUserDialogProps) {
    const [email, setEmail] = useState(teacherEmail || "")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!email || !password || !confirmPassword) {
            toast.error("Por favor, rellena todos los campos")
            return
        }

        if (password !== confirmPassword) {
            toast.error("Las contraseñas no coinciden")
            return
        }

        if (password.length < 6) {
            toast.error("La contraseña debe tener al menos 6 caracteres")
            return
        }

        setLoading(true)
        try {
            const response = await fetch(`/api/teachers/${teacherId}/user`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || "Error al crear usuario")
            }

            setSuccess(true)
            toast.success("Usuario creado correctamente")
            if (onSuccess) onSuccess()

            setTimeout(() => {
                onOpenChange(false)
                resetForm()
            }, 2000)
        } catch (error) {
            console.error(error)
            toast.error(error instanceof Error ? error.message : "Error al crear usuario")
        } finally {
            setLoading(false)
        }
    }

    const resetForm = () => {
        setEmail(teacherEmail || "")
        setPassword("")
        setConfirmPassword("")
        setSuccess(false)
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            if (!loading) {
                onOpenChange(open)
                if (!open) resetForm()
            }
        }}>
            <DialogContent className="sm:max-w-[450px]">
                <DialogHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                            <Shield className="h-5 w-5" />
                        </div>
                        <div>
                            <DialogTitle>Crear Acceso a Portal</DialogTitle>
                            <DialogDescription>
                                Generar credenciales para <strong>{teacherName}</strong>
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                {success ? (
                    <div className="py-8 flex flex-col items-center justify-center space-y-4 text-center">
                        <div className="h-16 w-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                            <CheckCircle2 className="h-10 w-10" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-900">¡Acceso Creado!</h3>
                            <p className="text-slate-500 max-w-xs mx-auto mt-2">
                                El docente ya puede acceder al portal usando su email y la contraseña establecida.
                            </p>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleCreate} className="space-y-4 py-2">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Usuario / Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="ejemplo@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={loading}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Contraseña</Label>
                                <div className="relative">
                                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="Mínimo 6 caracteres"
                                        className="pl-9"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        disabled={loading}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                                <div className="relative">
                                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        placeholder="Repite la contraseña"
                                        className="pl-9"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        disabled={loading}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="pt-4">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => onOpenChange(false)}
                                disabled={loading}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                disabled={loading || !email || !password || !confirmPassword}
                                className="bg-purple-600 hover:bg-purple-700 text-white"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Creando...
                                    </>
                                ) : (
                                    <>
                                        <Shield className="mr-2 h-4 w-4" />
                                        Generar Acceso
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
