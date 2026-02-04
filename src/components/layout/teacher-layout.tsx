"use client"

import { useSession, signOut } from "next-auth/react"
import Link from 'next/link'
import { GraduationCap, LogOut, LayoutDashboard, User, Calendar } from 'lucide-react'
import { Button } from "@/components/ui/button"

export function TeacherLayout({ children }: { children: React.ReactNode }) {
    const { data: session } = useSession()

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Top Navigation Bar */}
            <nav className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            <div className="flex-shrink-0 flex items-center gap-2 mr-8">
                                <div className="bg-red-600 p-1.5 rounded-lg shadow-sm">
                                    <GraduationCap className="h-6 w-6 text-white" />
                                </div>
                                <div className="hidden md:block">
                                    <span className="text-xl font-black text-red-600 tracking-tighter uppercase">
                                        UGT
                                    </span>
                                    <span className="text-sm font-bold text-slate-400 ml-2 border-l border-slate-200 pl-2 uppercase tracking-tight">
                                        Docentes
                                    </span>
                                </div>
                            </div>
                            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                                <Link
                                    href="/teacher-portal"
                                    className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-slate-500 hover:border-red-500 hover:text-slate-900 transition-colors"
                                >
                                    <LayoutDashboard className="h-4 w-4 mr-2" />
                                    Mis Cursos
                                </Link>
                                <Link
                                    href="/teacher-portal/schedule"
                                    className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-slate-500 hover:border-red-500 hover:text-slate-900 transition-colors"
                                >
                                    <Calendar className="h-4 w-4 mr-2" />
                                    Mi Agenda
                                </Link>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-full border border-slate-200">
                                <User className="h-4 w-4 text-slate-400" />
                                <span className="text-sm font-bold text-slate-700">
                                    {session?.user?.name || 'Docente'}
                                </span>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => signOut({ callbackUrl: '/login' })}
                                className="text-slate-500 hover:text-red-600 hover:bg-red-50"
                            >
                                <LogOut className="h-4 w-4 mr-2" />
                                Salir
                            </Button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-[calc(100vh-64px)]">
                <div className="animate-in fade-in duration-500">
                    {children}
                </div>
            </main>
        </div>
    )
}
