"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Phone, Mail, MapPin, Plus, Search } from "lucide-react"

export default function ContactsPage() {
    return (
        <MainLayout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Agenda de Contactos</h1>
                        <p className="text-muted-foreground">Gestiona tus contactos, empresas y entidades colaboradoras.</p>
                    </div>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="mr-2 h-4 w-4" /> Nuevo Contacto
                    </Button>
                </div>

                <Card className="border-dashed border-2 bg-slate-50/50">
                    <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="p-4 bg-slate-100 rounded-full mb-4">
                            <Phone className="h-10 w-10 text-slate-400" />
                        </div>
                        <CardTitle className="text-xl">Módulo en Desarrollo</CardTitle>
                        <CardDescription className="max-w-md mx-auto mt-2">
                            Estamos preparando un sistema completo de CRM para que puedas gestionar todas las relaciones externas de UGT Sanidad Salamanca en un solo lugar.
                        </CardDescription>
                        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-2xl text-left">
                            <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-100">
                                <Mail className="h-5 w-5 text-blue-500 mb-2" />
                                <h3 className="font-bold text-sm">Gestión de Emails</h3>
                                <p className="text-xs text-slate-500">Plantillas y envíos masivos.</p>
                            </div>
                            <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-100">
                                <MapPin className="h-5 w-5 text-green-500 mb-2" />
                                <h3 className="font-bold text-sm">Ubicaciones</h3>
                                <p className="text-xs text-slate-500">Mapa de entidades colaboradoras.</p>
                            </div>
                            <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-100">
                                <Search className="h-5 w-5 text-purple-500 mb-2" />
                                <h3 className="font-bold text-sm">Filtros Avanzados</h3>
                                <p className="text-xs text-slate-500">Segmentación por tipo de contacto.</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </MainLayout>
    )
}
