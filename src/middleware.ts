import { withAuth } from "next-auth/middleware"

export default withAuth({
    pages: {
        signIn: "/login",
    },
})

// Protege todas las rutas excepto login y recursos estáticos
export const config = {
    matcher: [
        "/((?!api|_next/static|_next/image|favicon.ico|icon-192x192.png|icon-512x512.png|manifest.json|logo.svg).*)",
    ],
}
