import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          name: session.user.name || 'Unknown',
          email: session.user.email,
          image: session.user.image,
        },
      });
    }

    // Check if user has any opened interactions
    const hasAnyOpened = await prisma.doThisForMeInteraction.findFirst({
      where: {
        userId: user.id,
        hasOpened: true,
      },
    });

    return NextResponse.json({
      hasAnyOpened: !!hasAnyOpened,
    });
  } catch (error) {
    console.error('Error fetching global interaction status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch global interaction status' },
      { status: 500 }
    );
  }
}