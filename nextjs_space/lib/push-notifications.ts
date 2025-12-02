import { prisma } from './db';
import webpush from 'web-push';

const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || '';
const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:admin@propdf.com';

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(
    vapidSubject,
    vapidPublicKey,
    vapidPrivateKey
  );
}

export interface NotificationPayload {
  title: string;
  body: string;
  url?: string;
  jobId?: string;
  tag?: string;
}

export async function sendPushNotification(
  userEmail: string,
  payload: NotificationPayload
) {
  try {
    // Get user's push subscription
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      select: { pushSubscription: true, notificationsEnabled: true },
    });

    if (!user?.notificationsEnabled || !user.pushSubscription) {
      console.log(`User ${userEmail} has not enabled push notifications`);
      return false;
    }

    // Check if VAPID keys are configured
    if (!vapidPublicKey || !vapidPrivateKey) {
      console.warn('VAPID keys not configured. Skipping push notification.');
      return false;
    }

    const subscription = JSON.parse(user.pushSubscription as string);

    // Prepare notification payload
    const notificationPayload = JSON.stringify({
      title: payload.title || 'PRO PDF',
      body: payload.body || 'Your task has completed!',
      url: payload.url || '/dashboard',
      jobId: payload.jobId || null,
      tag: payload.tag || `notification-${Date.now()}`,
    });

    // Send push notification
    await webpush.sendNotification(subscription, notificationPayload);
    console.log(`Push notification sent to ${userEmail}`);
    return true;
  } catch (error: any) {
    console.error(`Error sending push notification to ${userEmail}:`, error);

    // Handle specific web-push errors
    if (error.statusCode === 410) {
      // Subscription has expired or is invalid - remove from database
      try {
        await prisma.user.update({
          where: { email: userEmail },
          data: { pushSubscription: null, notificationsEnabled: false },
        });
        console.log(`Removed expired push subscription for ${userEmail}`);
      } catch (dbError) {
        console.error('Error removing expired subscription:', dbError);
      }
    }

    return false;
  }
}

export async function notifyJobCompletion(
  userEmail: string,
  jobType: string,
  jobId: string,
  success: boolean = true
) {
  const title = success ? 'Task Completed Successfully!' : 'Task Failed';
  const body = success
    ? `Your ${jobType} task has finished processing.`
    : `Your ${jobType} task encountered an error.`;

  return sendPushNotification(userEmail, {
    title,
    body,
    url: `/jobs/${jobId}`,
    jobId,
    tag: `job-${jobId}`,
  });
}

export async function notifyBatchProgress(
  userEmail: string,
  completedCount: number,
  totalCount: number
) {
  const title = 'Batch Processing Update';
  const body = `Processed ${completedCount} of ${totalCount} files`;

  return sendPushNotification(userEmail, {
    title,
    body,
    url: '/dashboard',
    tag: 'batch-progress',
  });
}
