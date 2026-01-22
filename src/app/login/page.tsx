"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Database, Lock, User, Loader2 } from "lucide-react"
import { toast } from "sonner"

export default function LoginPage() {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const result = await signIn("credentials", {
                username,
                password,
                redirect: false,
            })

            if (result?.error) {
                toast.error("Credenciales incorrectas")
                setLoading(false)
            } else {
                // Check session to redirect based on role
                const response = await fetch("/api/auth/session")
                const session = await response.json()

                toast.success(`¡Bienvenido ${session?.user?.name || ''}!`)

                if (session?.user?.role === 'TEACHER') {
                    router.push("/teacher-portal")
                } else {
                    router.push("/")
                }
                router.refresh()
            }
        } catch (error) {
            console.error(error)
            toast.error("Error al iniciar sesión")
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[25%] -left-[10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[120px]" />
                <div className="absolute -bottom-[25%] -right-[10%] w-[50%] h-[50%] bg-teal-500/10 rounded-full blur-[120px]" />
            </div>

            <Card className="w-full max-w-md border-slate-800 bg-slate-900/50 backdrop-blur-xl shadow-2xl relative z-10">
                <CardHeader className="space-y-4 text-center">
                    <div className="flex justify-center -mt-12">
                        <div className="p-3 bg-white rounded-full shadow-2xl shadow-blue-500/50 border-4 border-slate-900 group transition-transform hover:scale-110 duration-300">
                            <img src="/logo-ugt.png" alt="Logo UGT" className="h-24 w-24 object-contain" />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <CardTitle className="text-3xl font-black tracking-tighter text-white uppercase pt-4">
                            Formación UGT <span className="text-blue-500">Salamanca</span>
                        </CardTitle>
                        <p className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.2em]">Sistema de Gestión Integral</p>
                    </div>
                    <CardDescription className="text-slate-400">
                        Ingresa tus credenciales para acceder al sistema
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="username" className="text-slate-200">Usuario</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                                <Input
                                    id="username"
                                    placeholder="admin"
                                    className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-600 focus:ring-blue-500"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-slate-200">Contraseña</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                                <Input
                                    id="password"
                                    type="password"
                                    className="pl-10 bg-slate-800/50 border-slate-700 text-white focus:ring-blue-500"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <Button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-11 shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98]"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Iniciando sesión...
                                </>
                            ) : (
                                "Iniciar Sesión"
                            )}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4 border-t border-slate-800 mt-2 pt-6">
                    <p className="text-xs text-center text-slate-500">
                        Acceso privado para personal autorizado del centro educativo.
                    </p>
                </CardFooter>
            </Card>
        </div>
    )
}
