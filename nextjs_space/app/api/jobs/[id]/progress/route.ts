
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = 'force-dynamic';

// SSE endpoint for real-time progress updates
export async function GET(
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

    // Create a readable stream for SSE
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        
        // Send initial progress
        const sendProgress = () => {
          const data = {
            jobId: job.id,
            progress: job.progress,
            status: job.status,
            timestamp: Date.now(),
          };
          
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
          );
        };
        
        // Send progress every 500ms
        const interval = setInterval(async () => {
          try {
            const updatedJob = await prisma.job.findUnique({
              where: { id: params.id }
            });
            
            if (!updatedJob) {
              clearInterval(interval);
              controller.close();
              return;
            }
            
            const data = {
              jobId: updatedJob.id,
              progress: updatedJob.progress,
              status: updatedJob.status,
              timestamp: Date.now(),
            };
            
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
            );
            
            // Close stream if job is completed or failed
            if (updatedJob.status === 'completed' || updatedJob.status === 'failed') {
              clearInterval(interval);
              controller.close();
            }
          } catch (error) {
            console.error('Error fetching job progress:', error);
            clearInterval(interval);
            controller.close();
          }
        }, 500);
        
        // Send initial progress
        sendProgress();
        
        // Clean up on connection close
        req.signal.addEventListener('abort', () => {
          clearInterval(interval);
          controller.close();
        });
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error("Error streaming progress:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
