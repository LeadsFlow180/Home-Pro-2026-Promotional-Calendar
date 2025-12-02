import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized - No session found' }, { status: 401 })
    }

    console.log('Session user:', session.user)

    // Try to find user by email first (works for both JWT and database sessions)
    let user = null
    
    if (session.user.email) {
      user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          updatedAt: true,
        },
      })
    }

    // Fallback: try to find by ID if email lookup fails
    if (!user && session.user.id) {
      user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          updatedAt: true,
        },
      })
    }

    if (!user) {
      // If user doesn't exist in database, return session data
      return NextResponse.json({ 
        user: {
          id: session.user.id || 'jwt-user',
          name: session.user.name || 'Unknown',
          email: session.user.email || 'Unknown',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          source: 'jwt-session'
        }
      })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
}