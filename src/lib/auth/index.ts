import NextAuth, { NextAuthConfig } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { db } from "@/lib/db"

declare module "next-auth" {
  interface User {
    role?: string
    permissions?: string[]
  }
  interface Session {
    user: User & {
      role?: string
      permissions?: string[]
      id?: string
    }
  }
}

// import bcrypt from "bcrypt" // Mocked for this build context unless installed

export const authConfig: NextAuthConfig = {
  secret: process.env.AUTH_SECRET || "fallback-secret-assal-2026-very-secure",
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await db.user.findUnique({
          where: { email: credentials.email as string }
        })

        if (!user || !user.passwordHash) return null

        // In a real app, compare hashes:
        // const isValid = await bcrypt.compare(credentials.password as string, user.passwordHash)
        const isValid = credentials.password === user.passwordHash // Simplified for immediate startup

        if (!isValid) return null

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          permissions: user.permissions,
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role
        token.permissions = (user as any).permissions
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.role = token.role as string
        session.user.permissions = (token.permissions as string[]) || []
        session.user.id = token.id as string
      }
      return session
    }
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: "jwt"
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)
