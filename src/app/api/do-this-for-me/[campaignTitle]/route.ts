import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ campaignTitle: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { campaignTitle } = await params;

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

    // Get the interaction record for this user and campaign
    const interaction = await prisma.doThisForMeInteraction.findUnique({
      where: {
        userId_campaignTitle: {
          userId: user.id,
          campaignTitle: campaignTitle,
        },
      },
    });

    return NextResponse.json({
      hasOpened: interaction?.hasOpened || false,
      hasBooked: interaction?.hasBooked || false,
      firstOpenedAt: interaction?.firstOpenedAt,
      lastOpenedAt: interaction?.lastOpenedAt,
      bookedAt: interaction?.bookedAt,
    });
  } catch (error) {
    console.error('Error fetching Do This For Me interaction:', error);
    return NextResponse.json(
      { error: 'Failed to fetch interaction data' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ campaignTitle: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { campaignTitle } = await params;
    const body = await request.json();
    const { action } = body; // 'opened' or 'booked'

    if (!action || !['opened', 'booked'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be "opened" or "booked"' },
        { status: 400 }
      );
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

    // Upsert the interaction record
    const interaction = await prisma.doThisForMeInteraction.upsert({
      where: {
        userId_campaignTitle: {
          userId: user.id,
          campaignTitle: campaignTitle,
        },
      },
      update: {
        hasOpened: action === 'opened' ? true : undefined,
        hasBooked: action === 'booked' ? true : undefined,
        lastOpenedAt: action === 'opened' ? new Date() : undefined,
        bookedAt: action === 'booked' ? new Date() : undefined,
      },
      create: {
        userId: user.id,
        campaignTitle: campaignTitle,
        hasOpened: action === 'opened',
        hasBooked: action === 'booked',
        firstOpenedAt: action === 'opened' ? new Date() : null,
        lastOpenedAt: action === 'opened' ? new Date() : null,
        bookedAt: action === 'booked' ? new Date() : null,
      },
    });

    return NextResponse.json({
      success: true,
      hasOpened: interaction.hasOpened,
      hasBooked: interaction.hasBooked,
      firstOpenedAt: interaction.firstOpenedAt,
      lastOpenedAt: interaction.lastOpenedAt,
      bookedAt: interaction.bookedAt,
    });
  } catch (error) {
    console.error('Error updating Do This For Me interaction:', error);
    return NextResponse.json(
      { error: 'Failed to update interaction data' },
      { status: 500 }
    );
  }
}