import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token
        const isTeacher = token?.role === "TEACHER"
        const pathname = req.nextUrl.pathname
        const isTeacherPortal = pathname.startsWith("/teacher-portal")
        const isApi = pathname.startsWith("/api")
        const isPublicApi = pathname.startsWith("/api/public") || pathname.startsWith("/api/auth")

        // Rutas de API permitidas para profesores
        const isTeacherApi =
            pathname.startsWith("/api/teacher") ||
            (pathname.startsWith("/api/courses/") && req.method === "GET") ||
            (pathname.startsWith("/api/courses/") && pathname.endsWith("/group-email") && req.method === "POST") ||
            (pathname.startsWith("/api/students/") && pathname.endsWith("/email") && req.method === "POST") ||
            pathname === "/api/notifications"

        // Si es profesor
        if (isTeacher) {
            // No permitir acceso fuera del portal docente (UI)
            if (!isApi && !isTeacherPortal) {
                return NextResponse.redirect(new URL("/teacher-portal", req.url))
            }
            // No permitir acceso a APIs que no estén en la lista blanca
            if (isApi && !isPublicApi && !isTeacherApi) {
                return new NextResponse(
                    JSON.stringify({ error: "No autorizado (API restringida para docentes)" }),
                    { status: 403, headers: { 'content-type': 'application/json' } }
                )
            }
        }

        // Si es admin/staff, permitimos todo por ahora
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token,
        },
        pages: {
            signIn: "/login",
        },
    }
)

// Protege todas las rutas excepto login, recursos estáticos y rutas públicas
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder files (logo, manifest, etc.)
         * - p/ (public course pages)
         */
        "/((?!_next/static|_next/image|favicon.ico|icon-.*|apple-touch-icon.*|manifest.json|logo.*|ugt-logo.*|sw.js|workbox-.*|p/|login|api/auth|api/public).*)",
    ],
}
