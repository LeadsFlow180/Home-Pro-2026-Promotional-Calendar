import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 })
  }

  try {
    const { name, email, image } = await request.json()

    // Create or update user
    const user = await prisma.user.upsert({
      where: { email: email || 'dev@example.com' },
      update: {
        name: name || 'Development User',
        image: image,
      },
      create: {
        name: name || 'Development User',
        email: email || 'dev@example.com',
        image: image,
        emailVerified: new Date(), // Mark as verified for development
      },
    })

    // Create a session for the user (simplified for development)
    const sessionToken = `dev-session-${user.id}-${Date.now()}`
    const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days

    const session = await prisma.session.create({
      data: {
        sessionToken,
        userId: user.id,
        expires,
      },
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Development user created. Please refresh the page to sign in.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
      },
      session: {
        sessionToken: session.sessionToken,
        expires: session.expires,
      }
    })
  } catch (error) {
    console.error('Dev sign-in error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to create development user',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}