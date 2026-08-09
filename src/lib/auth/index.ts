import NextAuth, { NextAuthConfig } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { db } from "@/lib/db"

declare module "next-auth" {
  interface User {
    role?: string
    permissions?: string[]
    phone?: string
  }
  interface Session {
    user: User & {
      role?: string
      permissions?: string[]
      id?: string
      phone?: string
    }
  }
}

export const authConfig: NextAuthConfig = {
  secret: process.env.AUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        phone: { label: "Phone", type: "tel" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.password) {
          return null
        }

        const user = await db.user.findUnique({
          where: {
            phone: credentials.phone as string
          }
        })

        if (!user || !user.passwordHash) return null

        if (user.isActive === false) return null

        const password = credentials.password as string
        let isValid = false

        // Check if the stored hash is a bcrypt hash (starts with $2)
        if (user.passwordHash.startsWith("$2")) {
          isValid = await bcrypt.compare(password, user.passwordHash)
        } else {
          // Legacy plaintext comparison — auto-migrate on success
          isValid = password === user.passwordHash
          if (isValid) {
            const hashedPassword = await bcrypt.hash(password, 10)
            await db.user.update({
              where: { id: user.id },
              data: { passwordHash: hashedPassword }
            })
          }
        }

        if (!isValid) return null

        return {
          id: user.id,
          email: user.email || undefined,
          phone: user.phone || undefined,
          name: user.name || undefined,
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
        token.phone = (user as any).phone
      }
      return token
    },
    async session({ session, token }) {
      if (token?.id) {
        session.user.role = token.role as string
        session.user.permissions = (token.permissions as string[]) || []
        session.user.id = token.id as string
        session.user.phone = token.phone as string
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
