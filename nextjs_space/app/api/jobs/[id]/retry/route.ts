
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const job = await prisma.job.findUnique({
      where: { id: params.id }
    });

    if (!job || job.userId !== user.id) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const updatedJob = await prisma.job.update({
      where: { id: params.id },
      data: {
        status: 'pending',
        progress: 0,
        errorMessage: null,
        startedAt: null,
        completedAt: null
      }
    });

    return NextResponse.json(updatedJob);
  } catch (error) {
    console.error("Error retrying job:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
