"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  BarChart3,
  BookOpen,
  Users,
  UserCheck,
  Truck,
  CreditCard,
  Package,
  Calendar,
  Settings,
  Home,
  FileText,
  Phone,
  Monitor,
  Database,
  Download
} from "lucide-react"

const navItems = [
  {
    title: "Dashboard",
    href: "/",
    icon: Home,
  },
  {
    title: "Alumnos",
    href: "/students",
    icon: Users,
  },
  {
    title: "Docentes",
    href: "/teachers",
    icon: UserCheck,
  },
  {
    title: "Proveedores",
    href: "/providers",
    icon: Truck,
  },
  {
    title: "Cursos",
    href: "/courses",
    icon: BookOpen,
  },
  {
    title: "Matrículas",
    href: "/enrollments",
    icon: FileText,
  },
  {
    title: "Pagos",
    href: "/payments",
    icon: CreditCard,
  },
  {
    title: "Materiales",
    href: "/materials",
    icon: Package,
  },
  {
    title: "Horarios",
    href: "/schedules",
    icon: Calendar,
  },
  {
    title: "Contactos",
    href: "/contacts",
    icon: Phone,
  },
  {
    title: "Software",
    href: "/software",
    icon: Monitor,
  },
  {
    title: "Reportes",
    href: "/reports",
    icon: BarChart3,
  },
  {
    title: "Importar Datos",
    href: "/import",
    icon: Database,
  },
  {
    title: "Exportar Datos",
    href: "/export",
    icon: Download,
  },
  {
    title: "Configuración",
    href: "/settings",
    icon: Settings,
  },
]

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()

  return (
    <div className={cn("pb-12 w-64", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Gestión de Cursos
          </h2>
          <div className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Button
                  key={item.href}
                  variant={isActive ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  asChild
                >
                  <Link href={item.href}>
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.title}
                  </Link>
                </Button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}