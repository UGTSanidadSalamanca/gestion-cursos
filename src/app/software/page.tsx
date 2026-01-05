"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Monitor, Cpu, Key, Plus, ExternalLink } from "lucide-react"

export default function SoftwarePage() {
    return (
        <MainLayout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Gestión de Software</h1>
                        <p className="text-muted-foreground">Control de licencias, versiones y activos digitales del centro.</p>
                    </div>
                    <Button className="bg-indigo-600 hover:bg-indigo-700">
                        <Plus className="mr-2 h-4 w-4" /> Registrar Licencia
                    </Button>
                </div>

                <Card className="border-dashed border-2 bg-slate-50/50">
                    <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="p-4 bg-slate-100 rounded-full mb-4">
                            <Monitor className="h-10 w-10 text-slate-400" />
                        </div>
                        <CardTitle className="text-xl">Inventario de Software</CardTitle>
                        <CardDescription className="max-w-md mx-auto mt-2">
                            Pronto podrás llevar un control exhaustivo de todas las licencias y herramientas digitales utilizadas en los cursos.
                        </CardDescription>
                        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-2xl text-left">
                            <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-100">
                                <Key className="h-5 w-5 text-indigo-500 mb-2" />
                                <h3 className="font-bold text-sm">Control de Licencias</h3>
                                <p className="text-xs text-slate-500">Alertas de caducidad y claves.</p>
                            </div>
                            <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-100">
                                <Cpu className="h-5 w-5 text-orange-500 mb-2" />
                                <h3 className="font-bold text-sm">Asignación a Cursos</h3>
                                <p className="text-xs text-slate-500">Software requerido por aula.</p>
                            </div>
                            <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-100">
                                <ExternalLink className="h-5 w-5 text-sky-500 mb-2" />
                                <h3 className="font-bold text-sm">Portales de Descarga</h3>
                                <p className="text-xs text-slate-500">Enlaces directos a recursos.</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </MainLayout>
    )
}
