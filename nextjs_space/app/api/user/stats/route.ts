

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        jobs: {
          select: {
            status: true,
            createdAt: true,
          }
        },
        files: {
          select: {
            fileSize: true,
            isTemporary: true,
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Calculate stats
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const completedJobs = user.jobs.filter((job: any) => job.status === 'completed');
    const jobsThisMonth = completedJobs.filter((job: any) => {
      const jobDate = new Date(job.createdAt);
      return jobDate.getMonth() === currentMonth && jobDate.getFullYear() === currentYear;
    });

    // Calculate storage used from files (exclude temporary guest files)
    const totalStorageBytes = user.files
      .filter((file: any) => !file.isTemporary)
      .reduce((total: number, file: any) => total + file.fileSize, 0);
    
    const storageLimit = user.isPremium ? 10 : 1; // 10GB for premium, 1GB for free
    const storageUsedGB = totalStorageBytes / (1024 * 1024 * 1024);
    const storagePercentage = Math.min(100, (storageUsedGB / storageLimit) * 100);

    // Estimate time saved (5 minutes per file processed)
    const timeSavedHours = Math.round((jobsThisMonth.length * 5) / 60);

    const stats = {
      filesProcessed: completedJobs.length,
      filesThisMonth: jobsThisMonth.length,
      storageUsedGB: parseFloat(storageUsedGB.toFixed(2)),
      storagePercentage: parseFloat(storagePercentage.toFixed(1)),
      storageLimit,
      timeSavedHours
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
