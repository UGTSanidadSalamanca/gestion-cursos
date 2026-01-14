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
  CreditCard,
  Download,
  Upload,
  FileSpreadsheet
} from 'lucide-react'
import * as XLSX from 'xlsx'

interface Student {
  id: string
  name: string
  email?: string
  phone?: string
  address?: string
  dni?: string
  isAffiliated: boolean
  affiliateNumber?: string
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'GRADUATED'
  emergencyContact?: string
  emergencyPhone?: string
  createdAt: string
  enrollments?: any[]
  payments?: any[]
  contacts?: any[]
}

const mockStudents: Student[] = [
  {
    id: '1',
    name: 'María García López',
    email: 'maria.garcia@email.com',
    phone: '+34 612 345 678',
    address: 'Calle Mayor 123, Madrid',
    dni: '12345678A',
    isAffiliated: true,
    affiliateNumber: 'AFF001',
    status: 'ACTIVE',
    emergencyContact: 'Juan García',
    emergencyPhone: '+34 612 345 679',
    createdAt: '2024-01-10'
  },
  {
    id: '2',
    name: 'Juan Pérez Martínez',
    email: 'juan.perez@email.com',
    phone: '+34 623 456 789',
    address: 'Avenida Principal 456, Barcelona',
    dni: '87654321B',
    isAffiliated: false,
    status: 'ACTIVE',
    emergencyContact: 'Ana Pérez',
    emergencyPhone: '+34 623 456 780',
    createdAt: '2024-01-12'
  },
  {
    id: '3',
    name: 'Ana López Sánchez',
    email: 'ana.lopez@email.com',
    phone: '+34 634 567 890',
    address: 'Plaza Central 789, Valencia',
    dni: '11223344C',
    isAffiliated: true,
    affiliateNumber: 'AFF002',
    status: 'INACTIVE',
    emergencyContact: 'Carlos López',
    emergencyPhone: '+34 634 567 891',
    createdAt: '2024-01-08'
  },
  {
    id: '4',
    name: 'Carlos Ruiz Fernández',
    email: 'carlos.ruiz@email.com',
    phone: '+34 645 678 901',
    address: 'Calle Nueva 321, Sevilla',
    dni: '44332211D',
    isAffiliated: false,
    status: 'SUSPENDED',
    emergencyContact: 'María Ruiz',
    emergencyPhone: '+34 645 678 902',
    createdAt: '2024-01-05'
  }
]

const getStatusBadge = (status: Student['status']) => {
  switch (status) {
    case 'ACTIVE':
      return <Badge className="bg-green-500 hover:bg-green-600">Activo</Badge>
    case 'INACTIVE':
      return <Badge variant="secondary">Inactivo</Badge>
    case 'SUSPENDED':
      return <Badge variant="destructive">Suspendido</Badge>
    case 'GRADUATED':
      return <Badge className="bg-blue-500 hover:bg-blue-600">Graduado</Badge>
    default:
      return <Badge>{status}</Badge>
  }
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)

  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/students')
      if (response.ok) {
        const data = await response.json()
        setStudents(data)
      }
    } catch (error) {
      console.error('Error fetching students:', error)
    } finally {
      setLoading(false)
    }
  }

  const exportToCSV = () => {
    const headers = ['Nombre', 'Email', 'Telefono', 'DNI', 'Afiliado', 'Estado', 'Fecha Registro']
    const csvRows = students.map(s => [
      `"${s.name}"`,
      `"${s.email || ''}"`,
      `"${s.phone || ''}"`,
      `"${s.dni || ''}"`,
      s.isAffiliated ? 'Si' : 'No',
      s.status,
      s.createdAt
    ])

    const csvContent = [headers.join(','), ...csvRows.map(row => row.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `alumnos_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet)

        setLoading(true)
        let successCount = 0
        let errorCount = 0

        for (const row of jsonData as any[]) {
          // Mapear campos del Excel a los de la API
          const studentData = {
            name: row.Nombre || row.name || '',
            email: row.Email || row.email || '',
            phone: row.Telefono || row.phone || '',
            dni: row.DNI || row.dni || '',
            isAffiliated: !!(row.Afiliado || row.affiliated)
          }

          if (!studentData.name) continue

          try {
            const response = await fetch('/api/students', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(studentData),
            })
            if (response.ok) successCount++
            else errorCount++
          } catch (err) {
            errorCount++
          }
        }

        alert(`Importación finalizada.\nÉxito: ${successCount}\nErrores: ${errorCount}`)
        await fetchStudents()
      } catch (error) {
        console.error('Error parsing excel:', error)
        alert('Error al leer el archivo Excel. Asegúrate de que sea un formato válido.')
      } finally {
        setLoading(false)
        if (e.target) e.target.value = ''
      }
    }
    reader.readAsArrayBuffer(file)
  }

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (student.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.dni?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCreateStudent = async (studentData: Partial<Student>) => {
    try {
      const response = await fetch('/api/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(studentData),
      })

      if (response.ok) {
        await fetchStudents()
        setIsCreateDialogOpen(false)
      } else {
        const error = await response.json()
        alert(error.error || 'Error creating student')
      }
    } catch (error) {
      console.error('Error creating student:', error)
      alert('Error creating student')
    }
  }

  const handleEditStudent = async (studentData: Partial<Student>) => {
    if (selectedStudent) {
      try {
        const response = await fetch(`/api/students/${selectedStudent.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(studentData),
        })

        if (response.ok) {
          await fetchStudents()
          setIsEditDialogOpen(false)
          setSelectedStudent(null)
        } else {
          const error = await response.json()
          alert(error.error || 'Error updating student')
        }
      } catch (error) {
        console.error('Error updating student:', error)
        alert('Error updating student')
      }
    }
  }

  const handleDeleteStudent = async (studentId: string) => {
    if (confirm('Are you sure you want to delete this student?')) {
      try {
        const response = await fetch(`/api/students/${studentId}`, {
          method: 'DELETE',
        })

        if (response.ok) {
          await fetchStudents()
        } else {
          const error = await response.json()
          alert(error.error || 'Error deleting student')
        }
      } catch (error) {
        console.error('Error deleting student:', error)
        alert('Error deleting student')
      }
    }
  }

  const StudentForm = ({
    student,
    onSubmit,
    onCancel
  }: {
    student?: Student | null
    onSubmit: (data: Partial<Student>) => void
    onCancel: () => void
  }) => {
    const [formData, setFormData] = useState({
      name: student?.name || '',
      email: student?.email || '',
      phone: student?.phone || '',
      address: student?.address || '',
      dni: student?.dni || '',
      isAffiliated: student?.isAffiliated || false,
      affiliateNumber: student?.affiliateNumber || '',
      status: student?.status || 'ACTIVE',
      emergencyContact: student?.emergencyContact || '',
      emergencyPhone: student?.emergencyPhone || ''
    })

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      onSubmit(formData)
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
            <Label htmlFor="status">Estado</Label>
            <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as Student['status'] })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">Activo</SelectItem>
                <SelectItem value="INACTIVE">Inactivo</SelectItem>
                <SelectItem value="SUSPENDED">Suspendido</SelectItem>
                <SelectItem value="GRADUATED">Graduado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="emergencyContact">Contacto de emergencia</Label>
            <Input
              id="emergencyContact"
              value={formData.emergencyContact}
              onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="emergencyPhone">Teléfono de emergencia</Label>
            <Input
              id="emergencyPhone"
              value={formData.emergencyPhone}
              onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
            />
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="isAffiliated"
            checked={formData.isAffiliated}
            onChange={(e) => setFormData({ ...formData, isAffiliated: e.target.checked })}
          />
          <Label htmlFor="isAffiliated">Es afiliado</Label>
        </div>
        {formData.isAffiliated && (
          <div className="space-y-2">
            <Label htmlFor="affiliateNumber">Número de afiliado</Label>
            <Input
              id="affiliateNumber"
              value={formData.affiliateNumber}
              onChange={(e) => setFormData({ ...formData, affiliateNumber: e.target.value })}
            />
          </div>
        )}
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit">
            {student ? 'Actualizar' : 'Crear'} Alumno
          </Button>
        </DialogFooter>
      </form>
    )
  }

  const StudentDetails = ({ student }: { student: Student }) => (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <div className="p-2 bg-primary/10 rounded-full">
          <User className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">{student.name}</h3>
          <p className="text-sm text-muted-foreground">{student.email || 'Sin email'}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center space-x-2">
          <Phone className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{student.phone || 'No especificado'}</span>
        </div>
        <div className="flex items-center space-x-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{student.address || 'No especificado'}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">DNI: {student.dni || 'No especificado'}</span>
        </div>
        <div className="flex items-center space-x-2">
          <CreditCard className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">
            {student.isAffiliated ? `Afiliado: ${student.affiliateNumber}` : 'No afiliado'}
          </span>
        </div>
      </div>

      {student.emergencyContact && (
        <div className="p-4 bg-muted rounded-lg">
          <h4 className="font-medium mb-2">Contacto de Emergencia</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>Nombre: {student.emergencyContact}</div>
            <div>Teléfono: {student.emergencyPhone}</div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          Registrado el: {student.createdAt}
        </span>
        {getStatusBadge(student.status)}
      </div>
    </div>
  )

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gestión de Alumnos</h1>
            <p className="text-muted-foreground">
              Administra los alumnos del sistema, afiliados y no afiliados
            </p>
          </div>
          <div className="flex space-x-2">
            <div className="relative">
              <Button variant="outline" onClick={() => document.getElementById('excel-upload')?.click()}>
                <Upload className="h-4 w-4 mr-2" />
                Importar Excel
              </Button>
              <input
                id="excel-upload"
                type="file"
                accept=".xlsx, .xls, .csv"
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>
            <Button variant="outline" onClick={exportToCSV}>
              <Download className="h-4 w-4 mr-2" />
              Exportar Excel
            </Button>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Alumno
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Crear Nuevo Alumno</DialogTitle>
                  <DialogDescription>
                    Ingresa los datos del nuevo alumno en el sistema
                  </DialogDescription>
                </DialogHeader>
                <StudentForm
                  onSubmit={handleCreateStudent}
                  onCancel={() => setIsCreateDialogOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Search and Stats */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, email o DNI..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Badge variant="outline">
              Total: {students.length}
            </Badge>
            <Badge className="bg-green-500 hover:bg-green-600">
              Activos: {students.filter(s => s.status === 'ACTIVE').length}
            </Badge>
            <Badge variant="secondary">
              Afiliados: {students.filter(s => s.isAffiliated).length}
            </Badge>
          </div>
        </div>

        {/* Students Table */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Alumnos</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Teléfono</TableHead>
                    <TableHead>Afiliado</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.name}</TableCell>
                      <TableCell>{student.email || <span className="text-slate-400 italic text-xs">Sin email</span>}</TableCell>
                      <TableCell>{student.phone || '-'}</TableCell>
                      <TableCell>
                        {student.isAffiliated ? (
                          <Badge variant="default">Sí</Badge>
                        ) : (
                          <Badge variant="secondary">No</Badge>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(student.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Dialog open={isViewDialogOpen && selectedStudent?.id === student.id} onOpenChange={(open) => {
                            setIsViewDialogOpen(open)
                            if (open) setSelectedStudent(student)
                          }}>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Detalles del Alumno</DialogTitle>
                                <DialogDescription>
                                  Información completa del alumno
                                </DialogDescription>
                              </DialogHeader>
                              {selectedStudent && <StudentDetails student={selectedStudent} />}
                            </DialogContent>
                          </Dialog>

                          <Dialog open={isEditDialogOpen && selectedStudent?.id === student.id} onOpenChange={(open) => {
                            setIsEditDialogOpen(open)
                            if (open) setSelectedStudent(student)
                          }}>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Editar Alumno</DialogTitle>
                                <DialogDescription>
                                  Actualiza los datos del alumno
                                </DialogDescription>
                              </DialogHeader>
                              {selectedStudent && (
                                <StudentForm
                                  student={selectedStudent}
                                  onSubmit={handleEditStudent}
                                  onCancel={() => setIsEditDialogOpen(false)}
                                />
                              )}
                            </DialogContent>
                          </Dialog>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteStudent(student.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}