"use client"

import { useState, useEffect } from "react"
import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  Package,
  Plus,
  Search,
  Filter,
  Edit,
  Eye,
  MapPin,
  Euro,
  AlertTriangle,
  CheckCircle,
  Box,
  Trash2
} from "lucide-react"

interface Material {
  id: string
  name: string
  description?: string
  type: string
  quantity: number
  unitPrice: number
  location?: string
  providerId?: string
  provider?: {
    id: string
    name: string
  }
  isAvailable: boolean
  createdAt: string
  updatedAt: string
}

interface Provider {
  id: string
  name: string
}

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([])
  const [providers, setProviders] = useState<Provider[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: '',
    quantity: '',
    unitPrice: '',
    location: '',
    providerId: '',
    isAvailable: true
  })

  useEffect(() => {
    fetchMaterials()
    fetchProviders()
  }, [])

  const fetchMaterials = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/materials')
      if (response.ok) {
        const data = await response.json()
        setMaterials(data)
      }
    } catch (error) {
      console.error('Error fetching materials:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchProviders = async () => {
    try {
      const response = await fetch('/api/suppliers')
      if (response.ok) {
        const data = await response.json()
        setProviders(data)
      }
    } catch (error) {
      console.error('Error fetching providers:', error)
    }
  }

  const handleCreateMaterial = async () => {
    try {
      if (!formData.name || !formData.type || !formData.quantity || !formData.unitPrice) {
        alert('Por favor completa los campos requeridos')
        return
      }

      const response = await fetch('/api/materials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        await fetchMaterials()
        setIsCreateDialogOpen(false)
        resetForm()
      } else {
        const error = await response.json()
        alert(error.error || 'Error creating material')
      }
    } catch (error) {
      console.error('Error creating material:', error)
      alert('Error creating material')
    }
  }

  const handleDeleteMaterial = async (materialId: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este material?')) {
      try {
        const response = await fetch(`/api/materials/${materialId}`, {
          method: 'DELETE'
        })

        if (response.ok) {
          await fetchMaterials()
        } else {
          const error = await response.json()
          alert(error.error || 'Error deleting material')
        }
      } catch (error) {
        console.error('Error deleting material:', error)
        alert('Error deleting material')
      }
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      type: '',
      quantity: '',
      unitPrice: '',
      location: '',
      providerId: '',
      isAvailable: true
    })
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "BOOK":
        return <Badge className="bg-blue-500 hover:bg-blue-600">Libro</Badge>
      case "SOFTWARE":
        return <Badge className="bg-green-500 hover:bg-green-600">Software</Badge>
      case "EQUIPMENT":
        return <Badge className="bg-purple-500 hover:bg-purple-600">Equipo</Badge>
      case "TOOL":
        return <Badge className="bg-orange-500 hover:bg-orange-600">Herramienta</Badge>
      case "CONSUMABLE":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Consumible</Badge>
      case "DIGITAL_RESOURCE":
        return <Badge className="bg-cyan-500 hover:bg-cyan-600">Recurso Digital</Badge>
      default:
        return <Badge>{type}</Badge>
    }
  }

  const getAvailabilityBadge = (isAvailable: boolean, quantity: number) => {
    if (!isAvailable) {
      return <Badge variant="destructive">No Disponible</Badge>
    }
    if (quantity < 5) {
      return <Badge className="bg-orange-500 hover:bg-orange-600">Stock Bajo</Badge>
    }
    return <Badge className="bg-green-500 hover:bg-green-600">Disponible</Badge>
  }

  const filteredMaterials = materials.filter(material => {
    const matchesSearch = material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.provider?.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === "all" || material.type === filterType
    return matchesSearch && matchesType
  })

  // Calculate summary stats
  const totalMaterials = materials.length
  const availableMaterials = materials.filter(m => m.isAvailable).length
  const lowStockMaterials = materials.filter(m => m.quantity < 5).length
  const totalValue = materials.reduce((sum, material) => sum + (material.quantity * material.unitPrice), 0)

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gestión de Materiales</h1>
            <p className="text-muted-foreground">
              Administra todos los materiales y recursos del centro educativo
            </p>
          </div>
          <div className="mt-4 flex items-center space-x-2 md:mt-0">
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Nuevo Material
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                  <DialogTitle>Agregar Nuevo Material</DialogTitle>
                  <DialogDescription>
                    Completa los datos del nuevo material para registrarlo en el sistema.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Nombre *
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="type" className="text-right">
                      Tipo *
                    </Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => setFormData({ ...formData, type: value })}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BOOK">Libro</SelectItem>
                        <SelectItem value="SOFTWARE">Software</SelectItem>
                        <SelectItem value="EQUIPMENT">Equipo</SelectItem>
                        <SelectItem value="TOOL">Herramienta</SelectItem>
                        <SelectItem value="CONSUMABLE">Consumible</SelectItem>
                        <SelectItem value="DIGITAL_RESOURCE">Recurso Digital</SelectItem>
                        <SelectItem value="OTHER">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="quantity" className="text-right">
                      Cantidad *
                    </Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="price" className="text-right">
                      Precio Unit. *
                    </Label>
                    <Input
                      id="price"
                      type="number"
                      value={formData.unitPrice}
                      onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                      placeholder="0.00"
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="location" className="text-right">
                      Ubicación
                    </Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="provider" className="text-right">
                      Proveedor
                    </Label>
                    <Select
                      value={formData.providerId}
                      onValueChange={(value) => setFormData({ ...formData, providerId: value })}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Seleccionar proveedor" />
                      </SelectTrigger>
                      <SelectContent>
                        {providers.map((provider) => (
                          <SelectItem key={provider.id} value={provider.id}>
                            {provider.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="description" className="text-right">
                      Descripción
                    </Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="col-span-3"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancelar</Button>
                  <Button onClick={handleCreateMaterial}>Guardar</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Materiales</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalMaterials}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Disponibles</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{availableMaterials}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Stock Bajo</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{lowStockMaterials}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
              <Euro className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">€{totalValue.toFixed(2)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <CardTitle>Inventario de Materiales</CardTitle>
            <CardDescription>
              Todos los materiales y recursos registrados en el sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4 mb-4">
              <div className="flex-1 max-w-sm">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nombre, descripción o proveedor..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filtrar por tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los tipos</SelectItem>
                    <SelectItem value="BOOK">Libros</SelectItem>
                    <SelectItem value="SOFTWARE">Software</SelectItem>
                    <SelectItem value="EQUIPMENT">Equipos</SelectItem>
                    <SelectItem value="TOOL">Herramientas</SelectItem>
                    <SelectItem value="CONSUMABLE">Consumibles</SelectItem>
                    <SelectItem value="DIGITAL_RESOURCE">Recursos Digitales</SelectItem>
                    <SelectItem value="OTHER">Otros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Material</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Cantidad</TableHead>
                    <TableHead>Precio Unit.</TableHead>
                    <TableHead>Ubicación</TableHead>
                    <TableHead>Proveedor</TableHead>
                    <TableHead>Disponibilidad</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMaterials.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-4">
                        No se encontraron materiales
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredMaterials.map((material) => (
                      <TableRow key={material.id}>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{material.name}</span>
                            <span className="text-sm text-muted-foreground">{material.description}</span>
                          </div>
                        </TableCell>
                        <TableCell>{getTypeBadge(material.type)}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Box className="h-4 w-4 text-muted-foreground" />
                            <span>{material.quantity}</span>
                          </div>
                        </TableCell>
                        <TableCell>€{Number(material.unitPrice).toFixed(2)}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">{material.location || '-'}</span>
                          </div>
                        </TableCell>
                        <TableCell>{material.provider?.name || '-'}</TableCell>
                        <TableCell>{getAvailabilityBadge(material.isAvailable, material.quantity)}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteMaterial(material.id)}
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
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}