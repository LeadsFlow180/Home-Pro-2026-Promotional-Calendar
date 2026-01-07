import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  // Use JWT sessions for simplicity and production compatibility
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          }
        })

        if (!user || !user.password) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        }
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
          scope: 'openid email profile'
        }
      }
    }),
  ],
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user, account, profile }) {
      if (user) {
        token.id = user.id
        token.image = user.image
        token.name = user.name
        token.email = user.email
      }
      // For Google OAuth, preserve the profile image
      if (account?.provider === 'google' && profile) {
        token.image = profile.picture
      }
      return token
    },
    async session({ session, token }) {
      try {
        if (session.user && token) {
          session.user.id = token.id as string
          session.user.image = token.image as string
          session.user.name = token.name as string
          session.user.email = token.email as string
        }
        return session
      } catch (error) {
        console.error('Session callback error:', error)
        return session
      }
    },
    async signIn({ user, account, profile }) {
      try {
        // Additional sign-in validation can go here
        return true
      } catch (error) {
        console.error('Sign-in callback error:', error)
        return false
      }
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  events: {
    async signIn(message) {
      console.log('User signed in:', message.user.email)
    },
    async signOut(message) {
      console.log('User signed out')
    },
    async createUser(message) {
      console.log('New user created:', message.user.email)
      
      // Track new user with affiliate manager
      // Note: Server-side tracking won't work directly with window.affiliateManager
      // We'll need to track on the client side after OAuth redirect
      // Store a flag in session to track on next page load
      try {
        if (message.user.email) {
          // For Google OAuth users, we'll track them client-side after redirect
          // by checking if they're a new user in the session callback
          console.log('Will track user on client side:', message.user.email)
        }
      } catch (error) {
        console.error('Error in createUser event:', error)
      }
    },
  },
  debug: process.env.NODE_ENV === 'development',
  trustHost: true,
}