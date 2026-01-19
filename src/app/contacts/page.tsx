"use client"

import { useState, useEffect } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Phone, Mail, MapPin, Plus, Search, Building, User, Tag, Loader2, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"

interface Contact {
    id: string
    name: string
    email?: string
    phone?: string
    mobile?: string
    address?: string
    company?: string
    position?: string
    category: 'PERSONAL' | 'WORK' | 'EMERGENCY' | 'ACADEMIC' | 'ADMINISTRATIVE' | 'TECHNICAL' | 'OTHER'
    notes?: string
    createdAt: string
}

export default function ContactsPage() {
    const [contacts, setContacts] = useState<Contact[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        mobile: '',
        address: '',
        company: '',
        position: '',
        category: 'WORK',
        notes: ''
    })

    useEffect(() => {
        fetchContacts()
    }, [])

    const fetchContacts = async () => {
        setLoading(true)
        try {
            const response = await fetch('/api/contacts')
            if (response.ok) {
                const data = await response.json()
                setContacts(data)
            }
        } catch (error) {
            console.error('Error fetching contacts:', error)
            toast.error("Error al cargar contactos")
        } finally {
            setLoading(false)
        }
    }

    const handleCreateContact = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const response = await fetch('/api/contacts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            if (response.ok) {
                toast.success("Contacto creado con éxito")
                fetchContacts()
                setIsDialogOpen(false)
                resetForm()
            } else {
                toast.error("Error al crear contacto")
            }
        } catch (error) {
            toast.error("Error al crear contacto")
        }
    }

    const resetForm = () => {
        setFormData({
            name: '',
            email: '',
            phone: '',
            mobile: '',
            address: '',
            company: '',
            position: '',
            category: 'WORK',
            notes: ''
        })
    }

    const getCategoryBadge = (category: string) => {
        const colors: Record<string, string> = {
            'PERSONAL': 'bg-green-100 text-green-800',
            'WORK': 'bg-blue-100 text-blue-800',
            'EMERGENCY': 'bg-red-100 text-red-800',
            'ACADEMIC': 'bg-purple-100 text-purple-800',
            'ADMINISTRATIVE': 'bg-orange-100 text-orange-800',
            'TECHNICAL': 'bg-slate-100 text-slate-800',
            'OTHER': 'bg-gray-100 text-gray-800'
        }
        return <Badge className={colors[category] || 'bg-gray-100'}>{category}</Badge>
    }

    const filteredContacts = contacts.filter(contact =>
        contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.company?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <MainLayout>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Agenda de Contactos</h1>
                        <p className="text-muted-foreground">Gestiona tus contactos, empresas y entidades colaboradoras.</p>
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-blue-600 hover:bg-blue-700">
                                <Plus className="mr-2 h-4 w-4" /> Nuevo Contacto
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                            <form onSubmit={handleCreateContact}>
                                <DialogHeader>
                                    <DialogTitle>Añadir Nuevo Contacto</DialogTitle>
                                    <DialogDescription>
                                        Introduce los datos del nuevo contacto para tu agenda.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2 col-span-2">
                                            <Label htmlFor="name">Nombre Completo *</Label>
                                            <Input
                                                id="name"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                required
                                                placeholder="Ej: Juan Pérez"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                placeholder="juan@ejemplo.com"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="phone">Teléfono</Label>
                                            <Input
                                                id="phone"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                placeholder="+34 600..."
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="company">Empresa / Entidad</Label>
                                            <Input
                                                id="company"
                                                value={formData.company}
                                                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                                placeholder="Empresa S.L."
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="category">Categoría</Label>
                                            <Select
                                                value={formData.category}
                                                onValueChange={(value) => setFormData({ ...formData, category: value })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecciona..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="PERSONAL">Personal</SelectItem>
                                                    <SelectItem value="WORK">Trabajo</SelectItem>
                                                    <SelectItem value="EMERGENCY">Emergencia</SelectItem>
                                                    <SelectItem value="ACADEMIC">Académico</SelectItem>
                                                    <SelectItem value="ADMINISTRATIVE">Administrativo</SelectItem>
                                                    <SelectItem value="TECHNICAL">Técnico</SelectItem>
                                                    <SelectItem value="OTHER">Otro</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2 col-span-2">
                                            <Label htmlFor="address">Dirección</Label>
                                            <Input
                                                id="address"
                                                value={formData.address}
                                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                                placeholder="Calle Principal, 123"
                                            />
                                        </div>
                                        <div className="space-y-2 col-span-2">
                                            <Label htmlFor="notes">Notas</Label>
                                            <Textarea
                                                id="notes"
                                                value={formData.notes}
                                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                                placeholder="Información adicional..."
                                            />
                                        </div>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                        Cancelar
                                    </Button>
                                    <Button type="submit">Guardar Contacto</Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="flex items-center space-x-2">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar nombre, email o empresa..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-8"
                        />
                    </div>
                </div>

                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nombre</TableHead>
                                    <TableHead>Contacto</TableHead>
                                    <TableHead>Empresa</TableHead>
                                    <TableHead>Categoría</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">
                                            <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500" />
                                        </TableCell>
                                    </TableRow>
                                ) : filteredContacts.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                            No se encontraron contactos.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredContacts.map((contact) => (
                                        <TableRow key={contact.id}>
                                            <TableCell className="font-medium">
                                                <div className="flex flex-col">
                                                    <span>{contact.name}</span>
                                                    {contact.position && <span className="text-xs text-muted-foreground">{contact.position}</span>}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col space-y-1 text-sm">
                                                    {contact.email && (
                                                        <div className="flex items-center text-muted-foreground">
                                                            <Mail className="mr-2 h-3 w-3" />
                                                            {contact.email}
                                                        </div>
                                                    )}
                                                    {contact.phone && (
                                                        <div className="flex items-center text-muted-foreground">
                                                            <Phone className="mr-2 h-3 w-3" />
                                                            {contact.phone}
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {contact.company ? (
                                                    <div className="flex items-center">
                                                        <Building className="mr-2 h-3 w-3 text-muted-foreground" />
                                                        {contact.company}
                                                    </div>
                                                ) : <span className="text-muted-foreground">---</span>}
                                            </TableCell>
                                            <TableCell>{getCategoryBadge(contact.category)}</TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-blue-600">
                                                    <User className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </MainLayout>
    )
}
