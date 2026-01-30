"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  BarChart3,
  Users,
  UserCheck,
  Truck,
  CreditCard,
  Package,
  FileText,
  Menu,
  X,
  Home,
  BookOpen,
  Calendar,
  Settings,
  Database,
  Download,
  Phone,
  Monitor,
  Bell
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Alumnos', href: '/students', icon: Users },
  { name: 'Docentes', href: '/teachers', icon: UserCheck },
  { name: 'Cursos', href: '/courses', icon: BookOpen },
  { name: 'Matrículas', href: '/enrollments', icon: FileText },
  { name: 'Pagos', href: '/payments', icon: CreditCard },
  { name: 'Materiales', href: '/materials', icon: Package },
  { name: 'Proveedores', href: '/suppliers', icon: Truck },
  { name: 'Horarios', href: '/schedules', icon: Calendar },
  { name: 'Contactos', href: '/contacts', icon: Phone },
  { name: 'Software', href: '/software', icon: Monitor },
  { name: 'Reportes', href: '/reports', icon: BarChart3 },
  { name: 'Importar Datos', href: '/import', icon: Database },
  { name: 'Exportar Datos', href: '/export', icon: Download },
  { name: 'Notificaciones', href: '/notifications', icon: Bell },
  { name: 'Configuración', href: '/settings', icon: Settings },
]

interface SidebarProps {
  className?: string
}

import { signOut } from 'next-auth/react'
import { LogOut } from 'lucide-react'

function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()

  return (
    <div className={cn('pb-12 w-64 flex flex-col h-full', className)}>
      <div className="space-y-4 py-4 flex-1">
        <div className="px-3 py-2">
          <div className="flex items-center mb-6 px-2">
            <div className="bg-white p-1 rounded-lg mr-3 shadow-md flex items-center justify-center">
              <img src="/logo-ugt-sp.png" alt="Logo UGT Servicios Públicos" className="h-10 w-auto object-contain" />
            </div>
            <div className="flex flex-col">
              <h2 className="text-sm font-black text-white leading-tight uppercase tracking-tighter">Servicios</h2>
              <h2 className="text-sm font-black text-white leading-tight uppercase tracking-tighter">Públicos</h2>
              <span className="text-[10px] text-red-500 font-bold tracking-widest uppercase mt-0.5">UGT Salamanca</span>
            </div>
          </div>
          <div className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              const [unreadCount, setUnreadCount] = useState(0)

              useEffect(() => {
                if (item.name === 'Notificaciones') {
                  const checkNotifications = async () => {
                    try {
                      const res = await fetch('/api/notifications?unread=true&limit=1')
                      const data = await res.json()
                      setUnreadCount(data.pagination?.total || 0)
                    } catch (e) {
                      console.error('Error fetching unread count', e)
                    }
                  }
                  checkNotifications()
                  const interval = setInterval(checkNotifications, 30000)
                  return () => clearInterval(interval)
                }
              }, [])

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-red-600 text-white shadow-lg shadow-red-900/20'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  )}
                >
                  <div className="flex items-center">
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.name}
                  </div>
                  {item.name === 'Notificaciones' && unreadCount > 0 && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-slate-900 animate-pulse">
                      {unreadCount > 9 ? '+9' : unreadCount}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      <div className="px-3 py-4 border-t border-slate-800">
        <button
          onClick={() => signOut()}
          className="flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium text-slate-300 hover:bg-red-900/20 hover:text-red-400 transition-colors"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Cerrar Sesión
        </button>
      </div>
    </div>
  )
}

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen">
      {/* Sidebar para desktop */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <div className="flex flex-col flex-grow bg-slate-900 border-r border-slate-700 pt-5 overflow-y-auto">
          <Sidebar />
        </div>
      </div>

      {/* Sidebar móvil */}
      <div className={`lg:hidden ${sidebarOpen ? 'fixed inset-0 z-50' : 'hidden'}`}>
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 w-64 bg-slate-900 border-r border-slate-700 z-50">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center">
              <div className="bg-white p-1 rounded-lg mr-2 shadow-sm">
                <img src="/logo-ugt-sp.png" alt="Logo UGT" className="h-8 w-auto object-contain" />
              </div>
              <div className="flex flex-col">
                <h2 className="text-[10px] font-black text-white leading-none uppercase">Servicios Públicos</h2>
                <span className="text-[8px] text-red-500 font-bold uppercase">UGT Salamanca</span>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)}>
              <X className="h-4 w-4 text-white" />
            </Button>
          </div>
          <Sidebar />
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col flex-1">
        {/* Header móvil */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b bg-background px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden"
          >
            <Menu className="h-6 w-6" />
          </Button>
          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1 items-center">
              <img src="/logo-ugt-sp.png" alt="Logo UGT" className="h-8 w-auto object-contain mr-3" />
              <h1 className="text-sm font-black uppercase tracking-tighter text-slate-800">
                Servicios Públicos <span className="text-red-600">UGT</span>
              </h1>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}