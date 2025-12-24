"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
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
  BookOpen, 
  Plus, 
  Search, 
  Filter,
  Edit,
  Eye,
  Clock,
  Users,
  Euro,
  Calendar,
  UserPlus
} from "lucide-react"
import { EnrollmentForm } from "@/components/enrollment/enrollment-form"

interface Course {
  id: string
  title: string
  description?: string
  code: string
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT'
  duration: number
  maxStudents: number
  price: number
  isActive: boolean
  startDate?: string
  endDate?: string
  teacher?: {
    name: string
  }
  _count?: {
    enrollments: number
  }
}

export default function CoursesPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterLevel, setFilterLevel] = useState("all")
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/courses')
      if (response.ok) {
        const data = await response.json()
        setCourses(data)
      }
    } catch (error) {
      console.error('Error fetching courses:', error)
    } finally {
      setLoading(false)
    }
  }

  const getLevelBadge = (level: string) => {
    switch (level) {
      case "BEGINNER":
        return <Badge className="bg-green-500 hover:bg-green-600">Principiante</Badge>
      case "INTERMEDIATE":
        return <Badge className="bg-blue-500 hover:bg-blue-600">Intermedio</Badge>
      case "ADVANCED":
        return <Badge className="bg-purple-500 hover:bg-purple-600">Avanzado</Badge>
      case "EXPERT":
        return <Badge className="bg-red-500 hover:bg-red-600">Experto</Badge>
      default:
        return <Badge>{level}</Badge>
    }
  }

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.code.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesLevel = filterLevel === "all" || course.level === filterLevel
    return matchesSearch && matchesLevel
  })

  const totalCourses = courses.length
  const activeCourses = courses.filter(c => c.isActive).length
  const totalEnrollments = courses.reduce((sum, course) => sum + (course._count?.enrollments || 0), 0)
  const totalRevenue = courses.reduce((sum, course) => sum + ((course._count?.enrollments || 0) * course.price), 0)

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Gestión de Cursos</h1>
                <p className="text-muted-foreground">
                  Administra todos los cursos y asignaturas del centro educativo
                </p>
              </div>
              <div className="mt-4 flex items-center space-x-2 md:mt-0">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Nuevo Curso
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[525px]">
                    <DialogHeader>
                      <DialogTitle>Crear Nuevo Curso</DialogTitle>
                      <DialogDescription>
                        Completa los datos del nuevo curso para agregarlo al sistema.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="title" className="text-right">
                          Título
                        </Label>
                        <Input id="title" className="col-span-3" />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="code" className="text-right">
                          Código
                        </Label>
                        <Input id="code" className="col-span-3" />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="level" className="text-right">
                          Nivel
                        </Label>
                        <Select className="col-span-3">
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar nivel" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="beginner">Principiante</SelectItem>
                            <SelectItem value="intermediate">Intermedio</SelectItem>
                            <SelectItem value="advanced">Avanzado</SelectItem>
                            <SelectItem value="expert">Experto</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="duration" className="text-right">
                          Duración (h)
                        </Label>
                        <Input id="duration" type="number" className="col-span-3" />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="price" className="text-right">
                          Precio
                        </Label>
                        <Input id="price" type="number" placeholder="0.00" className="col-span-3" />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="teacher" className="text-right">
                          Profesor
                        </Label>
                        <Select className="col-span-3">
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar profesor" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="carlos">Carlos Rodríguez</SelectItem>
                            <SelectItem value="maria">María González</SelectItem>
                            <SelectItem value="juan">Juan Martínez</SelectItem>
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
                  <CardTitle className="text-sm font-medium">Total Cursos</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalCourses}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Activos</CardTitle>
                  <BookOpen className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{activeCourses}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Alumnos Inscritos</CardTitle>
                  <Users className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalEnrollments}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ingresos Potenciales</CardTitle>
                  <Euro className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">€{totalRevenue.toFixed(2)}</div>
                </CardContent>
              </Card>
            </div>

            {/* Filters and Search */}
            <Card>
              <CardHeader>
                <CardTitle>Lista de Cursos</CardTitle>
                <CardDescription>
                  Todos los cursos disponibles en el sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4 mb-4">
                  <div className="flex-1 max-w-sm">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar por título, descripción o código..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8"
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <Select value={filterLevel} onValueChange={setFilterLevel}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filtrar por nivel" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos los niveles</SelectItem>
                        <SelectItem value="BEGINNER">Principiante</SelectItem>
                        <SelectItem value="INTERMEDIATE">Intermedio</SelectItem>
                        <SelectItem value="ADVANCED">Avanzado</SelectItem>
                        <SelectItem value="EXPERT">Experto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Curso</TableHead>
                        <TableHead>Nivel</TableHead>
                        <TableHead>Profesor</TableHead>
                        <TableHead>Duración</TableHead>
                        <TableHead>Precio</TableHead>
                        <TableHead>Alumnos</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCourses.map((course) => (
                        <TableRow key={course.id}>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">{course.title}</span>
                              <span className="text-sm text-muted-foreground">{course.code}</span>
                            </div>
                          </TableCell>
                          <TableCell>{getLevelBadge(course.level)}</TableCell>
                          <TableCell>{course.teacher}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-1">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              <span>{course.duration}h</span>
                            </div>
                          </TableCell>
                          <TableCell>€{course.price.toFixed(2)}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <span>{course.enrolledStudents}</span>
                              <span className="text-sm text-muted-foreground">/ {course.maxStudents}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {course.isActive ? (
                              <Badge className="bg-green-500 hover:bg-green-600">Activo</Badge>
                            ) : (
                              <Badge variant="secondary">Inactivo</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <EnrollmentForm courseId={course.id} onSuccess={fetchCourses} />
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
        </main>
      </div>
    </div>
  )
}