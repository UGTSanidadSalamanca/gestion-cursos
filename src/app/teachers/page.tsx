"use client"

import { useState } from 'react'
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
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  BookOpen,
  DollarSign
} from 'lucide-react'

interface Teacher {
  id: string
  name: string
  email: string
  phone?: string
  address?: string
  dni?: string
  specialty?: string
  experience?: string
  cv?: string
  contractType: 'FREELANCE' | 'PART_TIME' | 'FULL_TIME' | 'HOURLY'
  hourlyRate?: number
  status: 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE'
  createdAt: string
}

const mockTeachers: Teacher[] = [
  {
    id: '1',
    name: 'Carlos Rodríguez Sánchez',
    email: 'carlos.rodriguez@email.com',
    phone: '+34 612 345 678',
    address: 'Calle Gran Vía 123, Madrid',
    dni: '12345678A',
    specialty: 'Desarrollo Web',
    experience: '10 años de experiencia en desarrollo web full-stack',
    cv: '/files/cv-carlos-rodriguez.pdf',
    contractType: 'FULL_TIME',
    hourlyRate: 45,
    status: 'ACTIVE',
    createdAt: '2024-01-10'
  },
  {
    id: '2',
    name: 'Ana Martínez López',
    email: 'ana.martinez@email.com',
    phone: '+34 623 456 789',
    address: 'Avenida Diagonal 456, Barcelona',
    dni: '87654321B',
    specialty: 'UI/UX Design',
    experience: '8 años de experiencia en diseño de interfaces',
    cv: '/files/cv-ana-martinez.pdf',
    contractType: 'PART_TIME',
    hourlyRate: 40,
    status: 'ACTIVE',
    createdAt: '2024-01-12'
  },
  {
    id: '3',
    name: 'Juan Pérez García',
    email: 'juan.perez@email.com',
    phone: '+34 634 567 890',
    address: 'Plaza del Ayuntamiento 789, Valencia',
    dni: '11223344C',
    specialty: 'Data Science',
    experience: '12 años de experiencia en análisis de datos',
    cv: '/files/cv-juan-perez.pdf',
    contractType: 'FREELANCE',
    hourlyRate: 60,
    status: 'INACTIVE',
    createdAt: '2024-01-08'
  },
  {
    id: '4',
    name: 'María López Fernández',
    email: 'maria.lopez@email.com',
    phone: '+34 645 678 901',
    address: 'Calle Larios 321, Málaga',
    dni: '44332211D',
    specialty: 'Marketing Digital',
    experience: '6 años de experiencia en marketing digital',
    cv: '/files/cv-maria-lopez.pdf',
    contractType: 'HOURLY',
    hourlyRate: 35,
    status: 'ON_LEAVE',
    createdAt: '2024-01-05'
  }
]

const getStatusBadge = (status: Teacher['status']) => {
  switch (status) {
    case 'ACTIVE':
      return <Badge className="bg-green-500 hover:bg-green-600">Activo</Badge>
    case 'INACTIVE':
      return <Badge variant="secondary">Inactivo</Badge>
    case 'ON_LEAVE':
      return <Badge className="bg-yellow-500 hover:bg-yellow-600">De Baja</Badge>
    default:
      return <Badge>{status}</Badge>
  }
}

const getContractTypeBadge = (contractType: Teacher['contractType']) => {
  switch (contractType) {
    case 'FREELANCE':
      return <Badge variant="outline">Freelance</Badge>
    case 'PART_TIME':
      return <Badge className="bg-blue-500 hover:bg-blue-600">Part-time</Badge>
    case 'FULL_TIME':
      return <Badge className="bg-green-500 hover:bg-green-600">Full-time</Badge>
    case 'HOURLY':
      return <Badge className="bg-purple-500 hover:bg-purple-600">Por Hora</Badge>
    default:
      return <Badge>{contractType}</Badge>
  }
}

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>(mockTeachers)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)

  const filteredTeachers = teachers.filter(teacher =>
    teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.specialty?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.dni?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCreateTeacher = (teacherData: Partial<Teacher>) => {
    const newTeacher: Teacher = {
      id: Date.now().toString(),
      name: teacherData.name || '',
      email: teacherData.email || '',
      phone: teacherData.phone,
      address: teacherData.address,
      dni: teacherData.dni,
      specialty: teacherData.specialty,
      experience: teacherData.experience,
      cv: teacherData.cv,
      contractType: teacherData.contractType || 'FREELANCE',
      hourlyRate: teacherData.hourlyRate,
      status: teacherData.status || 'ACTIVE',
      createdAt: new Date().toISOString().split('T')[0]
    }
    setTeachers([...teachers, newTeacher])
    setIsCreateDialogOpen(false)
  }

  const handleEditTeacher = (teacherData: Partial<Teacher>) => {
    if (selectedTeacher) {
      const updatedTeachers = teachers.map(teacher =>
        teacher.id === selectedTeacher.id
          ? { ...teacher, ...teacherData }
          : teacher
      )
      setTeachers(updatedTeachers)
      setIsEditDialogOpen(false)
      setSelectedTeacher(null)
    }
  }

  const handleDeleteTeacher = (teacherId: string) => {
    setTeachers(teachers.filter(teacher => teacher.id !== teacherId))
  }

  const TeacherForm = ({ 
    teacher, 
    onSubmit, 
    onCancel 
  }: { 
    teacher?: Teacher | null
    onSubmit: (data: Partial<Teacher>) => void
    onCancel: () => void 
  }) => {
    const [formData, setFormData] = useState({
      name: teacher?.name || '',
      email: teacher?.email || '',
      phone: teacher?.phone || '',
      address: teacher?.address || '',
      dni: teacher?.dni || '',
      specialty: teacher?.specialty || '',
      experience: teacher?.experience || '',
      contractType: teacher?.contractType || 'FREELANCE',
      hourlyRate: teacher?.hourlyRate?.toString() || '',
      status: teacher?.status || 'ACTIVE'
    })

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      onSubmit({
        ...formData,
        hourlyRate: formData.hourlyRate ? parseFloat(formData.hourlyRate) : undefined
      })
    }

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre completo</Label>
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
              required
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
            <Label htmlFor="dni">DNI</Label>
            <Input
              id="dni"
              value={formData.dni}
              onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
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
            <Label htmlFor="specialty">Especialidad</Label>
            <Input
              id="specialty"
              value={formData.specialty}
              onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contractType">Tipo de Contrato</Label>
            <Select value={formData.contractType} onValueChange={(value) => setFormData({ ...formData, contractType: value as Teacher['contractType'] })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="FREELANCE">Freelance</SelectItem>
                <SelectItem value="PART_TIME">Part-time</SelectItem>
                <SelectItem value="FULL_TIME">Full-time</SelectItem>
                <SelectItem value="HOURLY">Por Hora</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="hourlyRate">Tarifa por Hora (€)</Label>
            <Input
              id="hourlyRate"
              type="number"
              step="0.01"
              value={formData.hourlyRate}
              onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Estado</Label>
            <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as Teacher['status'] })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">Activo</SelectItem>
                <SelectItem value="INACTIVE">Inactivo</SelectItem>
                <SelectItem value="ON_LEAVE">De Baja</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="experience">Experiencia</Label>
          <Textarea
            id="experience"
            value={formData.experience}
            onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
            placeholder="Describe la experiencia del docente..."
            rows={3}
          />
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit">
            {teacher ? 'Actualizar' : 'Crear'} Docente
          </Button>
        </DialogFooter>
      </form>
    )
  }

  const TeacherDetails = ({ teacher }: { teacher: Teacher }) => (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <div className="p-2 bg-primary/10 rounded-full">
          <User className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">{teacher.name}</h3>
          <p className="text-sm text-muted-foreground">{teacher.email}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center space-x-2">
          <Phone className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{teacher.phone || 'No especificado'}</span>
        </div>
        <div className="flex items-center space-x-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{teacher.address || 'No especificado'}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">DNI: {teacher.dni || 'No especificado'}</span>
        </div>
        <div className="flex items-center space-x-2">
          <BookOpen className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{teacher.specialty || 'No especificado'}</span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <span className="text-sm font-medium">Tipo de Contrato:</span>
          <div className="mt-1">{getContractTypeBadge(teacher.contractType)}</div>
        </div>
        <div>
          <span className="text-sm font-medium">Tarifa por Hora:</span>
          <div className="mt-1 flex items-center">
            <DollarSign className="h-4 w-4 text-muted-foreground mr-1" />
            <span className="text-sm">{teacher.hourlyRate || 'No especificado'}</span>
          </div>
        </div>
      </div>
      
      {teacher.experience && (
        <div className="p-4 bg-muted rounded-lg">
          <h4 className="font-medium mb-2">Experiencia</h4>
          <p className="text-sm">{teacher.experience}</p>
        </div>
      )}
      
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          Registrado el: {teacher.createdAt}
        </span>
        {getStatusBadge(teacher.status)}
      </div>
    </div>
  )

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gestión de Docentes</h1>
            <p className="text-muted-foreground">
              Administra los docentes del sistema y su información contractual
            </p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Docente
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Crear Nuevo Docente</DialogTitle>
                <DialogDescription>
                  Ingresa los datos del nuevo docente en el sistema
                </DialogDescription>
              </DialogHeader>
              <TeacherForm
                onSubmit={handleCreateTeacher}
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
              placeholder="Buscar por nombre, email o especialidad..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Badge variant="outline">
              Total: {teachers.length}
            </Badge>
            <Badge className="bg-green-500 hover:bg-green-600">
              Activos: {teachers.filter(t => t.status === 'ACTIVE').length}
            </Badge>
            <Badge className="bg-blue-500 hover:bg-blue-600">
              Full-time: {teachers.filter(t => t.contractType === 'FULL_TIME').length}
            </Badge>
          </div>
        </div>

        {/* Teachers Table */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Docentes</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Especialidad</TableHead>
                  <TableHead>Contrato</TableHead>
                  <TableHead>Tarifa/Hora</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTeachers.map((teacher) => (
                  <TableRow key={teacher.id}>
                    <TableCell className="font-medium">
                      <div>
                        <div>{teacher.name}</div>
                        <div className="text-sm text-muted-foreground">{teacher.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>{teacher.specialty || '-'}</TableCell>
                    <TableCell>{getContractTypeBadge(teacher.contractType)}</TableCell>
                    <TableCell>
                      {teacher.hourlyRate ? `€${teacher.hourlyRate}` : '-'}
                    </TableCell>
                    <TableCell>{getStatusBadge(teacher.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Dialog open={isViewDialogOpen && selectedTeacher?.id === teacher.id} onOpenChange={(open) => {
                          setIsViewDialogOpen(open)
                          if (open) setSelectedTeacher(teacher)
                        }}>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Detalles del Docente</DialogTitle>
                            </DialogHeader>
                            {selectedTeacher && <TeacherDetails teacher={selectedTeacher} />}
                          </DialogContent>
                        </Dialog>
                        
                        <Dialog open={isEditDialogOpen && selectedTeacher?.id === teacher.id} onOpenChange={(open) => {
                          setIsEditDialogOpen(open)
                          if (open) setSelectedTeacher(teacher)
                        }}>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Editar Docente</DialogTitle>
                              <DialogDescription>
                                Actualiza los datos del docente
                              </DialogDescription>
                            </DialogHeader>
                            {selectedTeacher && (
                              <TeacherForm
                                teacher={selectedTeacher}
                                onSubmit={handleEditTeacher}
                                onCancel={() => setIsEditDialogOpen(false)}
                              />
                            )}
                          </DialogContent>
                        </Dialog>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteTeacher(teacher.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}