import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, description, category, month, day, year } =
      await request.json();

    if (!title || !month || !day || !year) {
      return NextResponse.json(
        { error: "Missing required fields: title, month, day, year" },
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
          name: session.user.name || "Unknown",
          email: session.user.email,
          image: session.user.image,
        },
      });
    }

    // Check if campaign is already saved
    const existingCampaign = await prisma.savedCampaign.findFirst({
      where: {
        userId: user.id,
        title,
        month,
        day,
        year,
      },
    });

    if (existingCampaign) {
      return NextResponse.json(
        { error: "Campaign already saved" },
        { status: 409 }
      );
    }

    // Save the campaign
    const savedCampaign = await prisma.savedCampaign.create({
      data: {
        userId: user.id,
        title,
        description: description || "",
        category: category || "",
        month,
        day,
        year,
      },
    });

    return NextResponse.json(
      {
        message: "Campaign saved successfully",
        campaign: savedCampaign,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error saving campaign:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ campaigns: [] });
    }

    // Get saved campaigns
    const savedCampaigns = await prisma.savedCampaign.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ campaigns: savedCampaigns });
  } catch (error) {
    console.error("Error fetching saved campaigns:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { campaignId } = await request.json();

    if (!campaignId) {
      return NextResponse.json(
        { error: "Campaign ID is required" },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Delete the campaign (only if it belongs to the user)
    const deletedCampaign = await prisma.savedCampaign.delete({
      where: {
        id: campaignId,
        userId: user.id,
      },
    });

    return NextResponse.json({
      message: "Campaign deleted successfully",
      deletedCampaign,
    });
  } catch (error) {
    console.error("Error deleting saved campaign:", error);

    // Handle case where campaign doesn't exist or doesn't belong to user
    if (
      error instanceof Error &&
      error.message.includes("Record to delete does not exist")
    ) {
      return NextResponse.json(
        {
          error:
            "Campaign not found or you do not have permission to delete it",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
