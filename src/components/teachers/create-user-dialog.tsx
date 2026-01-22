"use client"

import { useState, useEffect } from "react"
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
import { KeyRound, Shield, Loader2, CheckCircle2, UserX, AlertTriangle } from "lucide-react"
import { toast } from "sonner"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface CreateUserDialogProps {
    teacherId: string
    teacherName: string
    teacherEmail?: string
    hasAccess?: boolean
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
}

export function CreateUserDialog({
    teacherId,
    teacherName,
    teacherEmail,
    hasAccess = false,
    isOpen,
    onOpenChange,
    onSuccess
}: CreateUserDialogProps) {
    const [email, setEmail] = useState(teacherEmail || "")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [successMessage, setSuccessMessage] = useState("")
    const [view, setView] = useState<'main' | 'revoke'>('main')

    useEffect(() => {
        if (isOpen) {
            setEmail(teacherEmail || "")
            setSuccess(false)
            setView('main')
            setPassword("")
            setConfirmPassword("")
        }
    }, [isOpen, teacherEmail])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!hasAccess && !email) {
            toast.error("El email es requerido")
            return
        }

        if (!password || !confirmPassword) {
            toast.error("Por favor, rellena los campos de contraseña")
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
            const method = hasAccess ? "PUT" : "POST"
            const body = hasAccess ? { password } : { email, password }

            const response = await fetch(`/api/teachers/${teacherId}/user`, {
                method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || "Error en la operación")
            }

            setSuccess(true)
            setSuccessMessage(hasAccess ? "Contraseña actualizada correctamente" : "Usuario creado correctamente")
            toast.success(hasAccess ? "Contraseña actualizada" : "Usuario creado")

            if (onSuccess) onSuccess()

            setTimeout(() => {
                onOpenChange(false)
            }, 2000)
        } catch (error) {
            console.error(error)
            toast.error(error instanceof Error ? error.message : "Error en la operación")
        } finally {
            setLoading(false)
        }
    }

    const handleRevoke = async () => {
        setLoading(true)
        try {
            const response = await fetch(`/api/teachers/${teacherId}/user`, {
                method: "DELETE",
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || "Error al revocar acceso")
            }

            setSuccess(true)
            setSuccessMessage("Acceso revocado correctamente")
            toast.success("Acceso revocado")

            if (onSuccess) onSuccess()

            setTimeout(() => {
                onOpenChange(false)
            }, 2000)
        } catch (error) {
            console.error(error)
            toast.error(error instanceof Error ? error.message : "Error al revocar acceso")
        } finally {
            setLoading(false)
        }
    }

    const renderSuccess = () => (
        <div className="py-8 flex flex-col items-center justify-center space-y-4 text-center">
            <div className="h-16 w-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-10 w-10" />
            </div>
            <div>
                <h3 className="text-xl font-bold text-slate-900">¡Operación Exitosa!</h3>
                <p className="text-slate-500 max-w-xs mx-auto mt-2">
                    {successMessage}
                </p>
            </div>
        </div>
    )

    const renderRevokeConfirm = () => (
        <div className="space-y-4 py-2">
            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Atención</AlertTitle>
                <AlertDescription>
                    Estás a punto de eliminar el acceso de este profesor al portal. No podrá iniciar sesión hasta que generes nuevas credenciales.
                </AlertDescription>
            </Alert>
            <DialogFooter className="pt-4">
                <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setView('main')}
                    disabled={loading}
                >
                    Cancelar
                </Button>
                <Button
                    type="button"
                    variant="destructive"
                    onClick={handleRevoke}
                    disabled={loading}
                >
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserX className="mr-2 h-4 w-4" />}
                    Confirmar Revocación
                </Button>
            </DialogFooter>
        </div>
    )

    const renderMainForm = () => (
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div className="space-y-4">
                {!hasAccess && (
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
                )}

                <div className="space-y-2">
                    <Label htmlFor="password">{hasAccess ? "Nueva Contraseña" : "Contraseña"}</Label>
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
                    <Label htmlFor="confirmPassword">Confirmar {hasAccess ? "Nueva " : ""}Contraseña</Label>
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

            <DialogFooter className="pt-4 flex !justify-between w-full">
                {hasAccess ? (
                    <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => setView('revoke')}
                        className="mr-auto"
                    >
                        Revocar Acceso
                    </Button>
                ) : <div />}

                <div className="flex gap-2">
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
                        disabled={loading || (!hasAccess && !email) || !password || !confirmPassword}
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {hasAccess ? "Actualizando..." : "Creando..."}
                            </>
                        ) : (
                            <>
                                <Shield className="mr-2 h-4 w-4" />
                                {hasAccess ? "Actualizar Contraseña" : "Generar Acceso"}
                            </>
                        )}
                    </Button>
                </div>
            </DialogFooter>
        </form>
    )

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            if (!loading) {
                onOpenChange(open)
            }
        }}>
            <DialogContent className="sm:max-w-[450px]">
                <DialogHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <div className={`p-2 rounded-lg ${hasAccess ? 'bg-amber-100 text-amber-600' : 'bg-purple-100 text-purple-600'}`}>
                            <Shield className="h-5 w-5" />
                        </div>
                        <div>
                            <DialogTitle>{hasAccess ? "Gestionar Acceso" : "Crear Acceso a Portal"}</DialogTitle>
                            <DialogDescription>
                                {hasAccess
                                    ? `Modificar credenciales de ${teacherName}`
                                    : `Generar credenciales para ${teacherName}`
                                }
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                {success ? renderSuccess() : (
                    view === 'revoke' ? renderRevokeConfirm() : renderMainForm()
                )}
            </DialogContent>
        </Dialog>
    )
}
