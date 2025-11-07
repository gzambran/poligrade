import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(email => email.trim()) || []

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      // Check if user's email is in the whitelist
      if (!user.email) return false

      const isAllowed = adminEmails.includes(user.email)

      if (!isAllowed) {
        console.log(`Unauthorized login attempt: ${user.email}`)
      }

      return isAllowed
    },
    async session({ session, token }) {
      return session
    },
    async jwt({ token, user }) {
      return token
    },
  },
  pages: {
    signIn: '/admin',
    error: '/admin',
  },
  session: {
    strategy: 'jwt',
  },
}
