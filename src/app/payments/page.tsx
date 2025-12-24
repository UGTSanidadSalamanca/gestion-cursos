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
  CreditCard,
  Calendar,
  DollarSign,
  User,
  BookOpen,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle
} from 'lucide-react'

interface Payment {
  id: string
  studentId?: string
  courseId?: string
  amount: number
  currency: string
  paymentDate: string
  paymentMethod: 'CASH' | 'BANK_TRANSFER' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'PAYPAL' | 'OTHER'
  reference?: string
  description?: string
  status: 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED' | 'REFUNDED'
  dueDate?: string
  paidDate?: string
  invoiceNumber?: string
  createdAt: string
  student?: {
    id: string
    name: string
    email: string
  }
  course?: {
    id: string
    title: string
    price: number
  }
}

const mockPayments: Payment[] = [
  {
    id: '1',
    studentId: '1',
    courseId: '1',
    amount: 299,
    currency: 'EUR',
    paymentDate: '2024-01-15',
    paymentMethod: 'BANK_TRANSFER',
    reference: 'TRF001',
    description: 'Pago mensualidad curso JavaScript',
    status: 'PAID',
    dueDate: '2024-01-20',
    paidDate: '2024-01-15',
    invoiceNumber: 'INV001',
    createdAt: '2024-01-15',
    student: {
      id: '1',
      name: 'María García López',
      email: 'maria.garcia@email.com'
    },
    course: {
      id: '1',
      title: 'JavaScript Básico',
      price: 299
    }
  },
  {
    id: '2',
    studentId: '2',
    courseId: '2',
    amount: 399,
    currency: 'EUR',
    paymentDate: '2024-01-14',
    paymentMethod: 'CREDIT_CARD',
    reference: 'CC002',
    description: 'Pago completo curso React Avanzado',
    status: 'PAID',
    dueDate: '2024-01-18',
    paidDate: '2024-01-14',
    invoiceNumber: 'INV002',
    createdAt: '2024-01-14',
    student: {
      id: '2',
      name: 'Juan Pérez Martínez',
      email: 'juan.perez@email.com'
    },
    course: {
      id: '2',
      title: 'React Avanzado',
      price: 399
    }
  },
  {
    id: '3',
    studentId: '3',
    courseId: '3',
    amount: 199,
    currency: 'EUR',
    paymentDate: '2024-01-10',
    paymentMethod: 'CASH',
    reference: 'CSH003',
    description: 'Pago inscripción curso Diseño UI/UX',
    status: 'PENDING',
    dueDate: '2024-01-20',
    invoiceNumber: 'INV003',
    createdAt: '2024-01-10',
    student: {
      id: '3',
      name: 'Ana López Sánchez',
      email: 'ana.lopez@email.com'
    },
    course: {
      id: '3',
      title: 'Diseño UI/UX',
      price: 199
    }
  },
  {
    id: '4',
    studentId: '4',
    courseId: '4',
    amount: 499,
    currency: 'EUR',
    paymentDate: '2024-01-05',
    paymentMethod: 'BANK_TRANSFER',
    reference: 'TRF004',
    description: 'Pago completo curso Python para Data Science',
    status: 'OVERDUE',
    dueDate: '2024-01-12',
    invoiceNumber: 'INV004',
    createdAt: '2024-01-05',
    student: {
      id: '4',
      name: 'Carlos Ruiz Fernández',
      email: 'carlos.ruiz@email.com'
    },
    course: {
      id: '4',
      title: 'Python para Data Science',
      price: 499
    }
  }
]

const getStatusBadge = (status: Payment['status']) => {
  switch (status) {
    case 'PAID':
      return <Badge className="bg-green-500 hover:bg-green-600">Pagado</Badge>
    case 'PENDING':
      return <Badge className="bg-yellow-500 hover:bg-yellow-600">Pendiente</Badge>
    case 'OVERDUE':
      return <Badge variant="destructive">Vencido</Badge>
    case 'CANCELLED':
      return <Badge variant="secondary">Cancelado</Badge>
    case 'REFUNDED':
      return <Badge className="bg-blue-500 hover:bg-blue-600">Reembolsado</Badge>
    default:
      return <Badge>{status}</Badge>
  }
}

const getStatusIcon = (status: Payment['status']) => {
  switch (status) {
    case 'PAID':
      return <CheckCircle className="h-4 w-4 text-green-500" />
    case 'PENDING':
      return <Clock className="h-4 w-4 text-yellow-500" />
    case 'OVERDUE':
      return <AlertTriangle className="h-4 w-4 text-red-500" />
    case 'CANCELLED':
      return <XCircle className="h-4 w-4 text-gray-500" />
    case 'REFUNDED':
      return <CheckCircle className="h-4 w-4 text-blue-500" />
    default:
      return <Clock className="h-4 w-4" />
  }
}

const getPaymentMethodBadge = (method: Payment['paymentMethod']) => {
  switch (method) {
    case 'CASH':
      return <Badge variant="outline">Efectivo</Badge>
    case 'BANK_TRANSFER':
      return <Badge className="bg-blue-500 hover:bg-blue-600">Transferencia</Badge>
    case 'CREDIT_CARD':
      return <Badge className="bg-purple-500 hover:bg-purple-600">Tarjeta Crédito</Badge>
    case 'DEBIT_CARD':
      return <Badge className="bg-green-500 hover:bg-green-600">Tarjeta Débito</Badge>
    case 'PAYPAL':
      return <Badge className="bg-blue-600 hover:bg-blue-700">PayPal</Badge>
    case 'OTHER':
      return <Badge variant="secondary">Otro</Badge>
    default:
      return <Badge>{method}</Badge>
  }
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>(mockPayments)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      payment.student?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.course?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const handleCreatePayment = (paymentData: Partial<Payment>) => {
    const newPayment: Payment = {
      id: Date.now().toString(),
      studentId: paymentData.studentId,
      courseId: paymentData.courseId,
      amount: paymentData.amount || 0,
      currency: paymentData.currency || 'EUR',
      paymentDate: paymentData.paymentDate || new Date().toISOString().split('T')[0],
      paymentMethod: paymentData.paymentMethod || 'BANK_TRANSFER',
      reference: paymentData.reference,
      description: paymentData.description,
      status: paymentData.status || 'PENDING',
      dueDate: paymentData.dueDate,
      paidDate: paymentData.paidDate,
      invoiceNumber: paymentData.invoiceNumber,
      createdAt: new Date().toISOString().split('T')[0],
      student: paymentData.student,
      course: paymentData.course
    }
    setPayments([...payments, newPayment])
    setIsCreateDialogOpen(false)
  }

  const handleEditPayment = (paymentData: Partial<Payment>) => {
    if (selectedPayment) {
      const updatedPayments = payments.map(payment =>
        payment.id === selectedPayment.id
          ? { ...payment, ...paymentData }
          : payment
      )
      setPayments(updatedPayments)
      setIsEditDialogOpen(false)
      setSelectedPayment(null)
    }
  }

  const handleDeletePayment = (paymentId: string) => {
    setPayments(payments.filter(payment => payment.id !== paymentId))
  }

  const PaymentForm = ({ 
    payment, 
    onSubmit, 
    onCancel 
  }: { 
    payment?: Payment | null
    onSubmit: (data: Partial<Payment>) => void
    onCancel: () => void 
  }) => {
    const [formData, setFormData] = useState({
      studentId: payment?.studentId || '',
      courseId: payment?.courseId || '',
      amount: payment?.amount?.toString() || '',
      currency: payment?.currency || 'EUR',
      paymentMethod: payment?.paymentMethod || 'BANK_TRANSFER',
      reference: payment?.reference || '',
      description: payment?.description || '',
      status: payment?.status || 'PENDING',
      dueDate: payment?.dueDate || '',
      paidDate: payment?.paidDate || '',
      invoiceNumber: payment?.invoiceNumber || ''
    })

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      onSubmit({
        ...formData,
        amount: parseFloat(formData.amount)
      })
    }

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Importe</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="pl-10"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="currency">Moneda</Label>
            <Select value={formData.currency} onValueChange={(value) => setFormData({ ...formData, currency: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EUR">EUR (€)</SelectItem>
                <SelectItem value="USD">USD ($)</SelectItem>
                <SelectItem value="GBP">GBP (£)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="paymentMethod">Método de Pago</Label>
            <Select value={formData.paymentMethod} onValueChange={(value) => setFormData({ ...formData, paymentMethod: value as Payment['paymentMethod'] })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CASH">Efectivo</SelectItem>
                <SelectItem value="BANK_TRANSFER">Transferencia Bancaria</SelectItem>
                <SelectItem value="CREDIT_CARD">Tarjeta de Crédito</SelectItem>
                <SelectItem value="DEBIT_CARD">Tarjeta de Débito</SelectItem>
                <SelectItem value="PAYPAL">PayPal</SelectItem>
                <SelectItem value="OTHER">Otro</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Estado</Label>
            <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as Payment['status'] })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PENDING">Pendiente</SelectItem>
                <SelectItem value="PAID">Pagado</SelectItem>
                <SelectItem value="OVERDUE">Vencido</SelectItem>
                <SelectItem value="CANCELLED">Cancelado</SelectItem>
                <SelectItem value="REFUNDED">Reembolsado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="paymentDate">Fecha de Pago</Label>
            <Input
              id="paymentDate"
              type="date"
              value={formData.paymentDate}
              onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dueDate">Fecha de Vencimiento</Label>
            <Input
              id="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="paidDate">Fecha de Liquidación</Label>
            <Input
              id="paidDate"
              type="date"
              value={formData.paidDate}
              onChange={(e) => setFormData({ ...formData, paidDate: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reference">Referencia</Label>
            <Input
              id="reference"
              value={formData.reference}
              onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="invoiceNumber">Número de Factura</Label>
          <Input
            id="invoiceNumber"
            value={formData.invoiceNumber}
            onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Descripción</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Descripción del pago..."
            rows={3}
          />
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit">
            {payment ? 'Actualizar' : 'Crear'} Pago
          </Button>
        </DialogFooter>
      </form>
    )
  }

  const PaymentDetails = ({ payment }: { payment: Payment }) => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="p-2 bg-primary/10 rounded-full">
            <CreditCard className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Pago #{payment.invoiceNumber || payment.id}</h3>
            <div className="flex items-center space-x-2">
              {getStatusIcon(payment.status)}
              {getStatusBadge(payment.status)}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold">{payment.currency} {payment.amount}</div>
          <div className="text-sm text-muted-foreground">{getPaymentMethodBadge(payment.paymentMethod)}</div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <span className="text-sm font-medium">Alumno:</span>
          <div className="mt-1">
            {payment.student ? (
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{payment.student.name}</span>
              </div>
            ) : (
              <span className="text-sm text-muted-foreground">No especificado</span>
            )}
          </div>
        </div>
        <div>
          <span className="text-sm font-medium">Curso:</span>
          <div className="mt-1">
            {payment.course ? (
              <div className="flex items-center space-x-2">
                <BookOpen className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{payment.course.title}</span>
              </div>
            ) : (
              <span className="text-sm text-muted-foreground">No especificado</span>
            )}
          </div>
        </div>
        <div>
          <span className="text-sm font-medium">Fecha de Pago:</span>
          <div className="mt-1 flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{payment.paymentDate}</span>
          </div>
        </div>
        <div>
          <span className="text-sm font-medium">Fecha de Vencimiento:</span>
          <div className="mt-1 flex items-center space-x-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{payment.dueDate || 'No especificado'}</span>
          </div>
        </div>
      </div>
      
      {payment.reference && (
        <div className="p-4 bg-muted rounded-lg">
          <h4 className="font-medium mb-2">Información de Referencia</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>Referencia: {payment.reference}</div>
            <div>Factura: {payment.invoiceNumber || 'No generada'}</div>
          </div>
        </div>
      )}
      
      {payment.description && (
        <div className="p-4 bg-muted rounded-lg">
          <h4 className="font-medium mb-2">Descripción</h4>
          <p className="text-sm">{payment.description}</p>
        </div>
      )}
      
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          Registrado el: {payment.createdAt}
        </span>
      </div>
    </div>
  )

  // Calculate summary statistics
  const totalPaid = payments.filter(p => p.status === 'PAID').reduce((sum, p) => sum + p.amount, 0)
  const totalPending = payments.filter(p => p.status === 'PENDING').reduce((sum, p) => sum + p.amount, 0)
  const totalOverdue = payments.filter(p => p.status === 'OVERDUE').reduce((sum, p) => sum + p.amount, 0)

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gestión de Pagos</h1>
            <p className="text-muted-foreground">
              Administra los pagos e ingresos del sistema
            </p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Pago
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Crear Nuevo Pago</DialogTitle>
                <DialogDescription>
                  Registra un nuevo pago en el sistema
                </DialogDescription>
              </DialogHeader>
              <PaymentForm
                onSubmit={handleCreatePayment}
                onCancel={() => setIsCreateDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pagado</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">€{totalPaid.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {payments.filter(p => p.status === 'PAID').length} pagos
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendiente</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">€{totalPending.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {payments.filter(p => p.status === 'PENDING').length} pagos
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vencido</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">€{totalOverdue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {payments.filter(p => p.status === 'OVERDUE').length} pagos
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pagos</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{payments.length}</div>
              <p className="text-xs text-muted-foreground">
                Total de registros
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por alumno, curso o referencia..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="PAID">Pagados</SelectItem>
                <SelectItem value="PENDING">Pendientes</SelectItem>
                <SelectItem value="OVERDUE">Vencidos</SelectItem>
                <SelectItem value="CANCELLED">Cancelados</SelectItem>
                <SelectItem value="REFUNDED">Reembolsados</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Payments Table */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Pagos</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Alumno</TableHead>
                  <TableHead>Curso</TableHead>
                  <TableHead>Importe</TableHead>
                  <TableHead>Método</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{payment.student?.name || 'No asignado'}</div>
                        {payment.student?.email && (
                          <div className="text-xs text-muted-foreground">{payment.student.email}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{payment.course?.title || 'No asignado'}</div>
                        {payment.course?.price && (
                          <div className="text-xs text-muted-foreground">€{payment.course.price}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">€{payment.amount}</TableCell>
                    <TableCell>{getPaymentMethodBadge(payment.paymentMethod)}</TableCell>
                    <TableCell>{getStatusBadge(payment.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{payment.paymentDate}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Dialog open={isViewDialogOpen && selectedPayment?.id === payment.id} onOpenChange={(open) => {
                          setIsViewDialogOpen(open)
                          if (open) setSelectedPayment(payment)
                        }}>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Detalles del Pago</DialogTitle>
                            </DialogHeader>
                            {selectedPayment && <PaymentDetails payment={selectedPayment} />}
                          </DialogContent>
                        </Dialog>
                        
                        <Dialog open={isEditDialogOpen && selectedPayment?.id === payment.id} onOpenChange={(open) => {
                          setIsEditDialogOpen(open)
                          if (open) setSelectedPayment(payment)
                        }}>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Editar Pago</DialogTitle>
                              <DialogDescription>
                                Actualiza la información del pago
                              </DialogDescription>
                            </DialogHeader>
                            {selectedPayment && (
                              <PaymentForm
                                payment={selectedPayment}
                                onSubmit={handleEditPayment}
                                onCancel={() => setIsEditDialogOpen(false)}
                              />
                            )}
                          </DialogContent>
                        </Dialog>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeletePayment(payment.id)}
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