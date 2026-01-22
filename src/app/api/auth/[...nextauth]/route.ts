import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { db } from "@/lib/db"
import { verifyPassword } from "@/lib/auth-utils"

const handler = NextAuth({
    providers: [
        CredentialsProvider({
            name: "Credenciales",
            credentials: {
                username: { label: "Usuario/Email", type: "text", placeholder: "admin" },
                password: { label: "Contraseña", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.username || !credentials.password) return null

                const user = await db.user.findFirst({
                    where: {
                        OR: [
                            { username: credentials.username },
                            { email: credentials.username }
                        ]
                    }
                })

                if (!user || !user.password) return null

                const isValid = await verifyPassword(credentials.password, user.password)

                if (isValid) {
                    return {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        role: user.role
                    }
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
    callbacks: {
        async jwt({ token, user }: any) {
            if (user) {
                token.role = user.role
                token.id = user.id
            }
            return token
        },
        async session({ session, token }: any) {
            if (session.user) {
                session.user.role = token.role
                session.user.id = token.id
            }
            return session
        }
    },
    secret: process.env.NEXTAUTH_SECRET || "secret-key-for-dev",
})

export { handler as GET, handler as POST }
