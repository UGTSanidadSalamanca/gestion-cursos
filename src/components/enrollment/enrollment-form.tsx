"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { 
  Users, 
  BookOpen, 
  Calendar,
  Euro,
  UserPlus
} from 'lucide-react'

interface Student {
  id: string
  name: string
  email: string
  status: string
}

interface Course {
  id: string
  title: string
  code: string
  level: string
  duration: number
  price: number
  maxStudents: number
  isActive: boolean
  teacher?: {
    name: string
  }
  _count?: {
    enrollments: number
  }
}

interface EnrollmentFormProps {
  courseId?: string
  studentId?: string
  onSuccess?: () => void
  onCancel?: () => void
}

export function EnrollmentForm({ courseId, studentId, onSuccess, onCancel }: EnrollmentFormProps) {
  const [students, setStudents] = useState<Student[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<string>(studentId || '')
  const [selectedCourse, setSelectedCourse] = useState<string>(courseId || '')
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    if (!studentId) {
      fetchStudents()
    }
    if (!courseId) {
      fetchCourses()
    }
  }, [studentId, courseId])

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/students')
      if (response.ok) {
        const data = await response.json()
        setStudents(data.filter((s: Student) => s.status === 'ACTIVE'))
      }
    } catch (error) {
      console.error('Error fetching students:', error)
    }
  }

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/courses')
      if (response.ok) {
        const data = await response.json()
        setCourses(data.filter((c: Course) => c.isActive))
      }
    } catch (error) {
      console.error('Error fetching courses:', error)
    }
  }

  const handleEnroll = async () => {
    if (!selectedStudent || !selectedCourse) {
      alert('Por favor selecciona un alumno y un curso')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/enrollments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId: selectedStudent,
          courseId: selectedCourse,
        }),
      })

      if (response.ok) {
        alert('Inscripción realizada con éxito')
        if (onCancel) {
          onCancel()
        }
        onSuccess?.()
      } else {
        const error = await response.json()
        alert(error.error || 'Error al realizar la inscripción')
      }
    } catch (error) {
      console.error('Error enrolling student:', error)
      alert('Error al realizar la inscripción')
    } finally {
      setLoading(false)
    }
  }

  const getLevelBadge = (level: string) => {
    switch (level) {
      case 'BEGINNER':
        return <Badge className="bg-green-500 hover:bg-green-600">Principiante</Badge>
      case 'INTERMEDIATE':
        return <Badge className="bg-blue-500 hover:bg-blue-600">Intermedio</Badge>
      case 'ADVANCED':
        return <Badge className="bg-purple-500 hover:bg-purple-600">Avanzado</Badge>
      case 'EXPERT':
        return <Badge className="bg-red-500 hover:bg-red-600">Experto</Badge>
      default:
        return <Badge>{level}</Badge>
    }
  }

  // Si se proporciona onCancel, renderizar como formulario regular, sino como diálogo
  if (onCancel) {
    return (
      <div className="space-y-6">
        {/* Student Selection */}
        <div className="space-y-2">
          <Label htmlFor="student">Seleccionar Alumno</Label>
          {studentId ? (
            <div className="p-3 border rounded-lg bg-muted">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span className="font-medium">
                  {students.find(s => s.id === studentId)?.name || 'Alumno seleccionado'}
                </span>
              </div>
            </div>
          ) : (
            <Select value={selectedStudent} onValueChange={setSelectedStudent}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un alumno" />
              </SelectTrigger>
              <SelectContent>
                {students.map((student) => (
                  <SelectItem key={student.id} value={student.id}>
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4" />
                      <span>{student.name}</span>
                      <span className="text-sm text-muted-foreground">({student.email})</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Course Selection */}
        <div className="space-y-2">
          <Label htmlFor="course">Seleccionar Curso</Label>
          {courseId ? (
            <div className="p-3 border rounded-lg bg-muted">
              <div className="flex items-center space-x-2">
                <BookOpen className="h-4 w-4" />
                <span className="font-medium">
                  {courses.find(c => c.id === courseId)?.title || 'Curso seleccionado'}
                </span>
              </div>
            </div>
          ) : (
            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un curso" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    <div className="flex flex-col space-y-1">
                      <div className="flex items-center space-x-2">
                        <BookOpen className="h-4 w-4" />
                        <span className="font-medium">{course.title}</span>
                        {getLevelBadge(course.level)}
                      </div>
                      <div className="text-sm text-muted-foreground ml-6">
                        <div className="flex items-center space-x-4">
                          <span>{course.code}</span>
                          <span>{course.duration}h</span>
                          <span className="flex items-center space-x-1">
                            <Euro className="h-3 w-3" />
                            <span>{course.price}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Users className="h-3 w-3" />
                            <span>{course._count?.enrollments || 0}/{course.maxStudents}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Course Details */}
        {selectedCourse && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Detalles del Curso</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {(() => {
                const course = courses.find(c => c.id === selectedCourse)
                if (!course) return null
                
                return (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Profesor</Label>
                        <p>{course.teacher?.name || 'No asignado'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Duración</Label>
                        <p>{course.duration} horas</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Precio</Label>
                        <p className="flex items-center space-x-1">
                          <Euro className="h-4 w-4" />
                          <span>{course.price}</span>
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Plazas disponibles</Label>
                        <p>{course.maxStudents - (course._count?.enrollments || 0)} / {course.maxStudents}</p>
                      </div>
                    </div>
                  </>
                )
              })()}
            </CardContent>
          </Card>
        )}

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button onClick={handleEnroll} disabled={loading || !selectedStudent || !selectedCourse}>
            {loading ? 'Inscribiendo...' : 'Confirmar Inscripción'}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="h-4 w-4 mr-2" />
          Inscribir Alumno
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Nueva Inscripción</DialogTitle>
          <DialogDescription>
            Selecciona un alumno y un curso para realizar la inscripción
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Student Selection */}
          <div className="space-y-2">
            <Label htmlFor="student">Seleccionar Alumno</Label>
            {studentId ? (
              <div className="p-3 border rounded-lg bg-muted">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span className="font-medium">
                    {students.find(s => s.id === studentId)?.name || 'Alumno seleccionado'}
                  </span>
                </div>
              </div>
            ) : (
              <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un alumno" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4" />
                        <span>{student.name}</span>
                        <span className="text-sm text-muted-foreground">({student.email})</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Course Selection */}
          <div className="space-y-2">
            <Label htmlFor="course">Seleccionar Curso</Label>
            {courseId ? (
              <div className="p-3 border rounded-lg bg-muted">
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-4 w-4" />
                  <span className="font-medium">
                    {courses.find(c => c.id === courseId)?.title || 'Curso seleccionado'}
                  </span>
                </div>
              </div>
            ) : (
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un curso" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center space-x-2">
                          <BookOpen className="h-4 w-4" />
                          <span className="font-medium">{course.title}</span>
                          {getLevelBadge(course.level)}
                        </div>
                        <div className="text-sm text-muted-foreground ml-6">
                          <div className="flex items-center space-x-4">
                            <span>{course.code}</span>
                            <span>{course.duration}h</span>
                            <span className="flex items-center space-x-1">
                              <Euro className="h-3 w-3" />
                              <span>{course.price}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Users className="h-3 w-3" />
                              <span>{course._count?.enrollments || 0}/{course.maxStudents}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Course Details */}
          {selectedCourse && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Detalles del Curso</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {(() => {
                  const course = courses.find(c => c.id === selectedCourse)
                  if (!course) return null
                  
                  return (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Profesor</Label>
                          <p>{course.teacher?.name || 'No asignado'}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Duración</Label>
                          <p>{course.duration} horas</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Precio</Label>
                          <p className="flex items-center space-x-1">
                            <Euro className="h-4 w-4" />
                            <span>{course.price}</span>
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Plazas disponibles</Label>
                          <p>{course.maxStudents - (course._count?.enrollments || 0)} / {course.maxStudents}</p>
                        </div>
                      </div>
                    </>
                  )
                })()}
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleEnroll} disabled={loading || !selectedStudent || !selectedCourse}>
            {loading ? 'Inscribiendo...' : 'Confirmar Inscripción'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}