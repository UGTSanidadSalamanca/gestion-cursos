import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

const handler = NextAuth({
    providers: [
        CredentialsProvider({
            name: "Credenciales",
            credentials: {
                username: { label: "Usuario", type: "text", placeholder: "admin" },
                password: { label: "Contraseña", type: "password" }
            },
            async authorize(credentials) {
                // En una app real, esto consultaría la base de datos
                // Por ahora, usamos una contraseña por defecto
                if (credentials?.username === "admin" && credentials?.password === "admin123") {
                    return { id: "1", name: "Administrador", email: "admin@gestion.com" }
                }
                return null
            }
        })
    ],
    pages: {
        signIn: "/login",
    },
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET || "secret-key-for-dev",
})

export { handler as GET, handler as POST }
