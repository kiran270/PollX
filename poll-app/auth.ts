import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { prisma } from "@/lib/prisma"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      },
    }),
  ],
  trustHost: true,
  debug: process.env.NODE_ENV === 'development',
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false
      
      try {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
        })

        if (!existingUser) {
          await prisma.user.create({
            data: {
              email: user.email,
              name: user.name,
              image: user.image,
            },
          })
        }

        return true
      } catch (error) {
        console.error('Sign in error:', error)
        return false
      }
    },
    async session({ session }) {
      if (session.user?.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: session.user.email },
        })
        if (dbUser) {
          session.user.id = dbUser.id
          session.user.role = dbUser.role
        }
      }
      return session
    },
  },
})
