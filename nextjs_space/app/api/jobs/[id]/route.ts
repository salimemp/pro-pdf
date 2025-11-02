
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function DELETE(
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

    await prisma.job.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting job:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
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

    const data = await req.json();
    
    const updatedJob = await prisma.job.update({
      where: { id: params.id },
      data
    });

    return NextResponse.json(updatedJob);
  } catch (error) {
    console.error("Error updating job:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
