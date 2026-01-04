"use client"

import { useState, useEffect } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Building,
  Mail,
  Phone,
  MapPin,
  Globe,
  Package,
  Truck
} from 'lucide-react'

interface Supplier {
  id: string
  name: string
  email?: string
  phone?: string
  address?: string
  taxId?: string
  category: 'MATERIALS' | 'SOFTWARE' | 'EQUIPMENT' | 'SERVICES' | 'MAINTENANCE' | 'OTHER'
  description?: string
  website?: string
  status: 'ACTIVE' | 'INACTIVE' | 'BLACKLISTED'
  createdAt: string
}

const getStatusBadge = (status: Supplier['status']) => {
  switch (status) {
    case 'ACTIVE':
      return <Badge className="bg-green-500 hover:bg-green-600">Activo</Badge>
    case 'INACTIVE':
      return <Badge variant="secondary">Inactivo</Badge>
    case 'BLACKLISTED':
      return <Badge variant="destructive">Lista Negra</Badge>
    default:
      return <Badge>{status}</Badge>
  }
}

const getCategoryBadge = (category: Supplier['category']) => {
  switch (category) {
    case 'MATERIALS':
      return <Badge className="bg-blue-500 hover:bg-blue-600">Materiales</Badge>
    case 'SOFTWARE':
      return <Badge className="bg-purple-500 hover:bg-purple-600">Software</Badge>
    case 'EQUIPMENT':
      return <Badge className="bg-orange-500 hover:bg-orange-600">Equipos</Badge>
    case 'SERVICES':
      return <Badge className="bg-green-500 hover:bg-green-600">Servicios</Badge>
    case 'MAINTENANCE':
      return <Badge className="bg-yellow-500 hover:bg-yellow-600">Mantenimiento</Badge>
    case 'OTHER':
      return <Badge variant="outline">Otros</Badge>
    default:
      return <Badge>{category}</Badge>
  }
}

const getCategoryIcon = (category: Supplier['category']) => {
  switch (category) {
    case 'MATERIALS':
      return <Package className="h-4 w-4" />
    case 'SOFTWARE':
      return <Globe className="h-4 w-4" />
    case 'EQUIPMENT':
      return <Building className="h-4 w-4" />
    case 'SERVICES':
      return <Building className="h-4 w-4" />
    case 'MAINTENANCE':
      return <Truck className="h-4 w-4" />
    case 'OTHER':
      return <Building className="h-4 w-4" />
    default:
      return <Building className="h-4 w-4" />
  }
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)

  useEffect(() => {
    fetchSuppliers()
  }, [])

  const fetchSuppliers = async () => {
    try {
      const response = await fetch('/api/suppliers')
      if (response.ok) {
        const data = await response.json()
        setSuppliers(data)
      }
    } catch (error) {
      console.error('Error fetching suppliers:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.taxId?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCreateSupplier = async (supplierData: Partial<Supplier>) => {
    try {
      const response = await fetch('/api/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(supplierData)
      })

      if (response.ok) {
        await fetchSuppliers()
        setIsCreateDialogOpen(false)
      } else {
        const error = await response.json()
        alert(error.error || 'Error al crear proveedor')
      }
    } catch (error) {
      console.error('Error creating supplier:', error)
      alert('Error al crear proveedor')
    }
  }

  const handleEditSupplier = async (supplierData: Partial<Supplier>) => {
    if (selectedSupplier) {
      try {
        const response = await fetch(`/api/suppliers/${selectedSupplier.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(supplierData)
        })

        if (response.ok) {
          await fetchSuppliers()
          setIsEditDialogOpen(false)
          setSelectedSupplier(null)
        } else {
          const error = await response.json()
          alert(error.error || 'Error al actualizar proveedor')
        }
      } catch (error) {
        console.error('Error updating supplier:', error)
        alert('Error al actualizar proveedor')
      }
    }
  }

  const handleDeleteSupplier = async (supplierId: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este proveedor?')) {
      try {
        const response = await fetch(`/api/suppliers/${supplierId}`, {
          method: 'DELETE'
        })

        if (response.ok) {
          await fetchSuppliers()
        } else {
          const error = await response.json()
          alert(error.error || 'Error al eliminar proveedor')
        }
      } catch (error) {
        console.error('Error deleting supplier:', error)
        alert('Error al eliminar proveedor')
      }
    }
  }

  const SupplierForm = ({
    supplier,
    onSubmit,
    onCancel
  }: {
    supplier?: Supplier | null
    onSubmit: (data: Partial<Supplier>) => void
    onCancel: () => void
  }) => {
    const [formData, setFormData] = useState({
      name: supplier?.name || '',
      email: supplier?.email || '',
      phone: supplier?.phone || '',
      address: supplier?.address || '',
      taxId: supplier?.taxId || '',
      category: supplier?.category || 'OTHER',
      description: supplier?.description || '',
      website: supplier?.website || '',
      status: supplier?.status || 'ACTIVE'
    })

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      onSubmit(formData)
    }

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre del Proveedor *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Teléfono</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="taxId">NIF/CIF</Label>
            <Input
              id="taxId"
              value={formData.taxId}
              onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
            />
          </div>
          <div className="space-y-2 col-span-2">
            <Label htmlFor="address">Dirección</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Categoría</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value as Supplier['category'] })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MATERIALS">Materiales</SelectItem>
                <SelectItem value="SOFTWARE">Software</SelectItem>
                <SelectItem value="EQUIPMENT">Equipos</SelectItem>
                <SelectItem value="SERVICES">Servicios</SelectItem>
                <SelectItem value="MAINTENANCE">Mantenimiento</SelectItem>
                <SelectItem value="OTHER">Otros</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Estado</Label>
            <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as Supplier['status'] })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">Activo</SelectItem>
                <SelectItem value="INACTIVE">Inactivo</SelectItem>
                <SelectItem value="BLACKLISTED">Lista Negra</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="website">Sitio Web</Label>
          <Input
            id="website"
            type="url"
            value={formData.website}
            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
            placeholder="https://ejemplo.com"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Descripción</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe los productos o servicios del proveedor..."
            rows={3}
          />
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit">
            {supplier ? 'Actualizar' : 'Crear'} Proveedor
          </Button>
        </DialogFooter>
      </form>
    )
  }

  const SupplierDetails = ({ supplier }: { supplier: Supplier }) => (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <div className="p-2 bg-primary/10 rounded-full">
          <Building className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">{supplier.name}</h3>
          <p className="text-sm text-muted-foreground">{supplier.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center space-x-2">
          <Phone className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{supplier.phone || 'No especificado'}</span>
        </div>
        <div className="flex items-center space-x-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{supplier.address || 'No especificado'}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Package className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">NIF: {supplier.taxId || 'No especificado'}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Globe className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm truncate">
            {supplier.website ? (
              <a href={supplier.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                Visitar sitio web
              </a>
            ) : 'No especificado'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <span className="text-sm font-medium">Categoría:</span>
          <div className="mt-1">{getCategoryBadge(supplier.category)}</div>
        </div>
        <div>
          <span className="text-sm font-medium">Estado:</span>
          <div className="mt-1">{getStatusBadge(supplier.status)}</div>
        </div>
      </div>

      {supplier.description && (
        <div className="p-4 bg-muted rounded-lg">
          <h4 className="font-medium mb-2">Descripción</h4>
          <p className="text-sm">{supplier.description}</p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          Registrado el: {supplier.createdAt}
        </span>
      </div>
    </div>
  )

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gestión de Proveedores</h1>
            <p className="text-muted-foreground">
              Administra los proveedores de materiales, software y servicios
            </p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Proveedor
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Crear Nuevo Proveedor</DialogTitle>
                <DialogDescription>
                  Ingresa los datos del nuevo proveedor en el sistema
                </DialogDescription>
              </DialogHeader>
              <SupplierForm
                onSubmit={handleCreateSupplier}
                onCancel={() => setIsCreateDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Search and Stats */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, email o descripción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Badge variant="outline">
              Total: {suppliers.length}
            </Badge>
            <Badge className="bg-green-500 hover:bg-green-600">
              Activos: {suppliers.filter(s => s.status === 'ACTIVE').length}
            </Badge>
            <Badge variant="destructive">
              Lista Negra: {suppliers.filter(s => s.status === 'BLACKLISTED').length}
            </Badge>
          </div>
        </div>

        {/* Suppliers Table */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Proveedores</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSuppliers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4">
                      No se encontraron proveedores
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSuppliers.map((supplier) => (
                    <TableRow key={supplier.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-2">
                          {getCategoryIcon(supplier.category)}
                          <div>
                            <div>{supplier.name}</div>
                            {supplier.taxId && (
                              <div className="text-xs text-muted-foreground">{supplier.taxId}</div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getCategoryBadge(supplier.category)}</TableCell>
                      <TableCell>{supplier.phone || '-'}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {supplier.email || '-'}
                      </TableCell>
                      <TableCell>{getStatusBadge(supplier.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Dialog open={isViewDialogOpen && selectedSupplier?.id === supplier.id} onOpenChange={(open) => {
                            setIsViewDialogOpen(open)
                            if (open) setSelectedSupplier(supplier)
                          }}>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Detalles del Proveedor</DialogTitle>
                              </DialogHeader>
                              {selectedSupplier && <SupplierDetails supplier={selectedSupplier} />}
                            </DialogContent>
                          </Dialog>

                          <Dialog open={isEditDialogOpen && selectedSupplier?.id === supplier.id} onOpenChange={(open) => {
                            setIsEditDialogOpen(open)
                            if (open) setSelectedSupplier(supplier)
                          }}>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Editar Proveedor</DialogTitle>
                                <DialogDescription>
                                  Actualiza los datos del proveedor
                                </DialogDescription>
                              </DialogHeader>
                              {selectedSupplier && (
                                <SupplierForm
                                  supplier={selectedSupplier}
                                  onSubmit={handleEditSupplier}
                                  onCancel={() => setIsEditDialogOpen(false)}
                                />
                              )}
                            </DialogContent>
                          </Dialog>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteSupplier(supplier.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
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