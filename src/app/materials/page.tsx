"use client"

import { useState } from "react"
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
  Box
} from "lucide-react"

export default function MaterialsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")

  const materials = [
    {
      id: 1,
      name: "Libro JavaScript Avanzado",
      description: "Libro de texto para el curso de JavaScript Avanzado",
      type: "BOOK",
      quantity: 25,
      unitPrice: 45.00,
      location: "Almacén A - Estantería 3",
      provider: "TechBooks S.L.",
      isAvailable: true,
      lastUpdated: "2024-01-10"
    },
    {
      id: 2,
      name: "Licencia Adobe Creative Cloud",
      description: "Licencia anual para diseño gráfico",
      type: "SOFTWARE",
      quantity: 10,
      unitPrice: 299.00,
      location: "Digital - Licencias",
      provider: "Software Educativo Pro",
      isAvailable: true,
      lastUpdated: "2024-01-15"
    },
    {
      id: 3,
      name: "Portátiles Dell Latitude",
      description: "Portátiles para uso en clase",
      type: "EQUIPMENT",
      quantity: 15,
      unitPrice: 899.00,
      location: "Aula Informática 1",
      provider: "Equipos Tecnológicos S.A.",
      isAvailable: true,
      lastUpdated: "2024-01-08"
    },
    {
      id: 4,
      name: "Kit de Programación Arduino",
      description: "Kits completos para prácticas de electrónica",
      type: "TOOL",
      quantity: 8,
      unitPrice: 75.00,
      location: "Laboratorio de Electrónica",
      provider: "TechBooks S.L.",
      isAvailable: false,
      lastUpdated: "2024-01-12"
    },
    {
      id: 5,
      name: "Papel y Material de Oficina",
      description: "Papel, bolígrafos, cuadernos, etc.",
      type: "CONSUMABLE",
      quantity: 200,
      unitPrice: 0.50,
      location: "Almacén B",
      provider: "Suministros Oficina S.L.",
      isAvailable: true,
      lastUpdated: "2024-01-05"
    }
  ]

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
                         material.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         material.provider.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === "all" || material.type === filterType
    return matchesSearch && matchesType
  })

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
            <Dialog>
              <DialogTrigger asChild>
                <Button>
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
                      Nombre
                    </Label>
                    <Input id="name" className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="type" className="text-right">
                      Tipo
                    </Label>
                    <Select className="col-span-3">
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="book">Libro</SelectItem>
                        <SelectItem value="software">Software</SelectItem>
                        <SelectItem value="equipment">Equipo</SelectItem>
                        <SelectItem value="tool">Herramienta</SelectItem>
                        <SelectItem value="consumable">Consumible</SelectItem>
                        <SelectItem value="digital">Recurso Digital</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="quantity" className="text-right">
                      Cantidad
                    </Label>
                    <Input id="quantity" type="number" className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="price" className="text-right">
                      Precio Unit.
                    </Label>
                    <Input id="price" type="number" placeholder="0.00" className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="location" className="text-right">
                      Ubicación
                    </Label>
                    <Input id="location" className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="provider" className="text-right">
                      Proveedor
                    </Label>
                    <Select className="col-span-3">
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar proveedor" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="techbooks">TechBooks S.L.</SelectItem>
                        <SelectItem value="software">Software Educativo Pro</SelectItem>
                        <SelectItem value="equipos">Equipos Tecnológicos S.A.</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="description" className="text-right">
                      Descripción
                    </Label>
                    <Textarea id="description" className="col-span-3" />
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline">Cancelar</Button>
                  <Button>Guardar</Button>
                </div>
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
                  {filteredMaterials.map((material) => (
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
                      <TableCell>€{material.unitPrice.toFixed(2)}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">{material.location}</span>
                        </div>
                      </TableCell>
                      <TableCell>{material.provider}</TableCell>
                      <TableCell>{getAvailabilityBadge(material.isAvailable, material.quantity)}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}