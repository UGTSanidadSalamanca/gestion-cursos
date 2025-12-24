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
  DialogFooter,
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
  const [teachers, setTeachers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [courseFormData, setCourseFormData] = useState({
    title: '',
    code: '',
    level: 'BEGINNER',
    duration: '',
    price: '',
    teacherId: '',
    description: '',
    isActive: true
  })

  useEffect(() => {
    fetchCourses()
    fetchTeachers()
  }, [])

  const fetchTeachers = async () => {
    try {
      const response = await fetch('/api/teachers')
      if (response.ok) {
        const data = await response.json()
        setTeachers(data)
      }
    } catch (error) {
      console.error('Error fetching teachers:', error)
    }
  }

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

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...courseFormData,
          duration: courseFormData.duration ? parseInt(courseFormData.duration) : 0,
          price: courseFormData.price ? parseFloat(courseFormData.price) : 0,
          maxStudents: 30, // Default value
        }),
      })

      if (response.ok) {
        await fetchCourses()
        setIsCreateDialogOpen(false)
        setCourseFormData({
          title: '',
          code: '',
          level: 'BEGINNER',
          duration: '',
          price: '',
          teacherId: '',
          description: '',
          isActive: true
        })
      } else {
        const error = await response.json()
        alert(error.error || 'Error al crear el curso')
      }
    } catch (error) {
      console.error('Error creating course:', error)
      alert('Error al crear el curso')
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
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Nuevo Curso
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[525px]">
                    <form onSubmit={handleCreateCourse}>
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
                          <Input
                            id="title"
                            className="col-span-3"
                            value={courseFormData.title}
                            onChange={(e) => setCourseFormData({ ...courseFormData, title: e.target.value })}
                            required
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="code" className="text-right">
                            Código
                          </Label>
                          <Input
                            id="code"
                            className="col-span-3"
                            value={courseFormData.code}
                            onChange={(e) => setCourseFormData({ ...courseFormData, code: e.target.value })}
                            required
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="level" className="text-right">
                            Nivel
                          </Label>
                          <Select
                            value={courseFormData.level}
                            onValueChange={(value) => setCourseFormData({ ...courseFormData, level: value })}
                          >
                            <SelectTrigger className="col-span-3">
                              <SelectValue placeholder="Seleccionar nivel" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="BEGINNER">Principiante</SelectItem>
                              <SelectItem value="INTERMEDIATE">Intermedio</SelectItem>
                              <SelectItem value="ADVANCED">Avanzado</SelectItem>
                              <SelectItem value="EXPERT">Experto</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="duration" className="text-right">
                            Duración (h)
                          </Label>
                          <Input
                            id="duration"
                            type="number"
                            className="col-span-3"
                            value={courseFormData.duration}
                            onChange={(e) => setCourseFormData({ ...courseFormData, duration: e.target.value })}
                            required
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="price" className="text-right">
                            Precio
                          </Label>
                          <Input
                            id="price"
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            className="col-span-3"
                            value={courseFormData.price}
                            onChange={(e) => setCourseFormData({ ...courseFormData, price: e.target.value })}
                            required
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="teacher" className="text-right">
                            Profesor
                          </Label>
                          <Select
                            value={courseFormData.teacherId}
                            onValueChange={(value) => setCourseFormData({ ...courseFormData, teacherId: value })}
                          >
                            <SelectTrigger className="col-span-3">
                              <SelectValue placeholder="Seleccionar profesor" />
                            </SelectTrigger>
                            <SelectContent>
                              {teachers.map((teacher) => (
                                <SelectItem key={teacher.id} value={teacher.id}>
                                  {teacher.name}
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
                            className="col-span-3"
                            value={courseFormData.description}
                            onChange={(e) => setCourseFormData({ ...courseFormData, description: e.target.value })}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancelar</Button>
                        <Button type="submit">Guardar</Button>
                      </DialogFooter>
                    </form>
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
                          <TableCell>{course.teacher?.name || 'No asignado'}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-1">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              <span>{course.duration}h</span>
                            </div>
                          </TableCell>
                          <TableCell>€{course.price.toFixed(2)}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <span>{course._count?.enrollments || 0}</span>
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