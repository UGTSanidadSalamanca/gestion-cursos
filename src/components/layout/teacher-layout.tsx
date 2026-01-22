"use client"

import { useSession, signOut } from "next-auth/react"
import Link from 'next/link'
import { GraduationCap, LogOut, LayoutDashboard, User } from 'lucide-react'
import { Button } from "@/components/ui/button"

export function TeacherLayout({ children }: { children: React.ReactNode }) {
    const { data: session } = useSession()

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Top Navigation Bar */}
            <nav className="bg-white border-b border-slate-200 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            <div className="flex-shrink-0 flex items-center gap-2">
                                <div className="bg-blue-600 p-1.5 rounded-lg">
                                    <GraduationCap className="h-6 w-6 text-white" />
                                </div>
                                <div className="hidden md:block">
                                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-purple-700">
                                        UGT
                                    </span>
                                    <span className="text-sm font-semibold text-slate-500 ml-2 border-l border-slate-300 pl-2">
                                        Portal Docente
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full border border-slate-200">
                                <User className="h-4 w-4 text-slate-500" />
                                <span className="text-sm font-medium text-slate-700">
                                    {session?.user?.name || 'Profesor'}
                                </span>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => signOut({ callbackUrl: '/login' })}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                                <LogOut className="h-4 w-4 mr-2" />
                                Salir
                            </Button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>
        </div>
    )
}
