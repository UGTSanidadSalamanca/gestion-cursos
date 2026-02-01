import { withAuth } from "next-auth/middleware"

export default withAuth({
    pages: {
        signIn: "/login",
    },
})

// Protege todas las rutas excepto login, recursos estáticos y rutas públicas de información
export const config = {
    matcher: [
        "/((?!api|_next/static|_next/image|favicon.ico|icon-192x192.png|icon-512x512.png|manifest.json|logo.svg|logo-ugt.png|ugt-logo.png|logo-servicios-publicos.png|sw.js|workbox-.*|p/|api/public).*)",
    ],
}
