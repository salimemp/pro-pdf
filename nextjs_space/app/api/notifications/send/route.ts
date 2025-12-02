import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import webpush from 'web-push';

// Configure web-push with VAPID keys
// In production, these should be environment variables
const vapidPublicKey = process.env.VAPID_PUBLIC_KEY || '';
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || '';

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(
    'mailto:support@propdf.com',
    vapidPublicKey,
    vapidPrivateKey
  );
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { title, body, url, jobId } = await req.json();

    // Get user's push subscription
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { pushSubscription: true, notificationsEnabled: true },
    });

    if (!user?.notificationsEnabled || !user.pushSubscription) {
      return NextResponse.json(
        { error: 'User has not enabled push notifications' },
        { status: 400 }
      );
    }

    const subscription = JSON.parse(user.pushSubscription as string);

    // Prepare notification payload
    const payload = JSON.stringify({
      title: title || 'PRO PDF',
      body: body || 'Your task has completed!',
      url: url || '/dashboard',
      jobId: jobId || null,
      tag: `notification-${Date.now()}`,
    });

    // Send push notification
    if (vapidPublicKey && vapidPrivateKey) {
      await webpush.sendNotification(subscription, payload);
    }

    return NextResponse.json({
      success: true,
      message: 'Notification sent successfully',
    });
  } catch (error: any) {
    console.error('Send notification error:', error);
    
    // Handle specific web-push errors
    if (error.statusCode === 410) {
      // Subscription has expired or is invalid
      // Remove from database
      const session = await getServerSession(authOptions);
      if (session?.user?.email) {
        await prisma.user.update({
          where: { email: session.user.email },
          data: { pushSubscription: null, notificationsEnabled: false },
        });
      }
      return NextResponse.json(
        { error: 'Push subscription has expired' },
        { status: 410 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    );
  }
}
