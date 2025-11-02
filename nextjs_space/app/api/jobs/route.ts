
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const jobs = await prisma.job.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(jobs);
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const data = await req.json();
    
    const job = await prisma.job.create({
      data: {
        userId: user.id,
        name: data.name,
        type: data.type,
        priority: data.priority || 'medium',
        isRecurring: data.isRecurring || false,
        recurrence: data.recurrence,
        nextRunAt: data.nextRunAt ? new Date(data.nextRunAt) : null,
        inputFiles: data.inputFiles || [],
        settings: data.settings || {},
        status: data.nextRunAt ? 'scheduled' : 'pending'
      }
    });

    return NextResponse.json(job);
  } catch (error) {
    console.error("Error creating job:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
