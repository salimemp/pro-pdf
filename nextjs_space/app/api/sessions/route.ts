
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get all active sessions for the user
    const sessions = await prisma.session.findMany({
      where: {
        userId: user.id,
        expires: {
          gt: new Date(),
        },
      },
      select: {
        id: true,
        sessionToken: true,
        ipAddress: true,
        userAgent: true,
        deviceType: true,
        lastActivity: true,
        createdAt: true,
        expires: true,
      },
      orderBy: {
        lastActivity: 'desc',
      },
    });

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error('Get sessions error:', error);
    return NextResponse.json(
      { error: 'Failed to get sessions' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { sessionId, all } = await req.json();

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (all) {
      // Delete all sessions except the current one
      const currentSessionToken = req.cookies.get('next-auth.session-token')?.value ||
                                   req.cookies.get('__Secure-next-auth.session-token')?.value;

      await prisma.session.deleteMany({
        where: {
          userId: user.id,
          NOT: {
            sessionToken: currentSessionToken,
          },
        },
      });

      return NextResponse.json({
        success: true,
        message: 'All other sessions have been revoked',
      });
    }

    if (sessionId) {
      // Delete specific session
      await prisma.session.delete({
        where: {
          id: sessionId,
          userId: user.id,
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Session revoked successfully',
      });
    }

    return NextResponse.json(
      { error: 'Session ID or "all" flag is required' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Delete session error:', error);
    return NextResponse.json(
      { error: 'Failed to revoke session' },
      { status: 500 }
    );
  }
}
