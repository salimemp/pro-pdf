import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// Subscribe to push notifications
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { subscription } = await req.json();

    if (!subscription) {
      return NextResponse.json(
        { error: 'No subscription provided' },
        { status: 400 }
      );
    }

    // Store the push subscription in the database
    await prisma.user.update(
      where: { email: session.user.email },
      data: {
        pushSubscription: JSON.stringify(subscription),
        notificationsEnabled: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Push notification subscription saved',
    });
  } catch (error) {
    console.error('Notification subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to subscribe to notifications' },
      { status: 500 }
    );
  }
}

// Unsubscribe from push notifications
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await prisma.user.update({
      where: { email: session.user.email },
      data: {
        pushSubscription: null,
        notificationsEnabled: false,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Push notification subscription removed',
    });
  } catch (error) {
    console.error('Notification unsubscribe error:', error);
    return NextResponse.json(
      { error: 'Failed to unsubscribe from notifications' },
      { status: 500 }
    );
  }
}
