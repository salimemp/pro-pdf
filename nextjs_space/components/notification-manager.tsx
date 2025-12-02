'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, BellOff, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';

interface NotificationManagerProps {
  className?: string;
}

export function NotificationManager({ className }: NotificationManagerProps) {
  const { data: session } = useSession() || {};
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribing, setIsSubscribing] = useState(false);

  useEffect(() => {
    // Check current notification permission
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }

    // Check if user has enabled notifications in the database
    checkNotificationStatus();
  }, [session]);

  const checkNotificationStatus = async () => {
    if (!session?.user?.email) return;

    try {
      const response = await fetch('/api/user');
      if (response.ok) {
        const userData = await response.json();
        setNotificationsEnabled(userData.notificationsEnabled || false);
      }
    } catch (error) {
      console.error('Failed to check notification status:', error);
    }
  };

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const subscribeToPushNotifications = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      toast.error('Push notifications are not supported in your browser');
      return;
    }

    setIsSubscribing(true);

    try {
      // Request notification permission
      const permission = await Notification.requestPermission();
      setPermission(permission);

      if (permission !== 'granted') {
        toast.error('Notification permission was denied');
        setIsSubscribing(false);
        return;
      }

      // Get service worker registration
      const registration = await navigator.serviceWorker.ready;

      // Subscribe to push notifications
      // Note: VAPID public key should be provided by the backend
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
      
      if (!vapidPublicKey) {
        console.warn('VAPID public key not configured. Using demo mode.');
        // In demo mode, just mark as enabled without actual push subscription
        await fetch('/api/notifications/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subscription: { demo: true } }),
        });
        setNotificationsEnabled(true);
        toast.success('Notifications enabled (Demo Mode)');
        setIsSubscribing(false);
        return;
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });

      // Send subscription to backend
      const response = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription }),
      });

      if (response.ok) {
        setNotificationsEnabled(true);
        toast.success('Push notifications enabled successfully!');
      } else {
        throw new Error('Failed to save subscription');
      }
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      toast.error('Failed to enable push notifications');
    } finally {
      setIsSubscribing(false);
    }
  };

  const unsubscribeFromPushNotifications = async () => {
    setIsSubscribing(true);

    try {
      // Get service worker registration
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();

        if (subscription) {
          await subscription.unsubscribe();
        }
      }

      // Remove subscription from backend
      const response = await fetch('/api/notifications/subscribe', {
        method: 'DELETE',
      });

      if (response.ok) {
        setNotificationsEnabled(false);
        toast.success('Push notifications disabled');
      } else {
        throw new Error('Failed to remove subscription');
      }
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
      toast.error('Failed to disable push notifications');
    } finally {
      setIsSubscribing(false);
    }
  };

  const sendTestNotification = async () => {
    try {
      const response = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Test Notification',
          body: 'This is a test notification from PRO PDF!',
          url: '/dashboard',
        }),
      });

      if (response.ok) {
        toast.success('Test notification sent!');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to send test notification');
      }
    } catch (error) {
      console.error('Error sending test notification:', error);
      toast.error('Failed to send test notification');
    }
  };

  if (!session) {
    return null;
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {notificationsEnabled ? (
            <Bell className="h-5 w-5 text-green-500" />
          ) : (
            <BellOff className="h-5 w-5 text-muted-foreground" />
          )}
          Push Notifications
        </CardTitle>
        <CardDescription>
          Get notified when your PDF tasks are completed
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Permission Status */}
        <div className="rounded-lg border p-3">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-sm font-medium">Browser Permission</div>
              <div className="text-xs text-muted-foreground">
                {permission === 'granted' && (
                  <span className="flex items-center gap-1 text-green-600">
                    <CheckCircle2 className="h-3 w-3" /> Granted
                  </span>
                )}
                {permission === 'denied' && (
                  <span className="flex items-center gap-1 text-red-600">
                    <XCircle className="h-3 w-3" /> Denied
                  </span>
                )}
                {permission === 'default' && (
                  <span className="text-muted-foreground">Not requested</span>
                )}
              </div>
            </div>
            <div className="space-y-0.5">
              <div className="text-sm font-medium">Status</div>
              <div className="text-xs text-muted-foreground">
                {notificationsEnabled ? (
                  <span className="flex items-center gap-1 text-green-600">
                    <CheckCircle2 className="h-3 w-3" /> Enabled
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <XCircle className="h-3 w-3" /> Disabled
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2">
          {!notificationsEnabled ? (
            <Button
              onClick={subscribeToPushNotifications}
              disabled={isSubscribing || permission === 'denied'}
              className="w-full"
            >
              <Bell className="mr-2 h-4 w-4" />
              {isSubscribing ? 'Enabling...' : 'Enable Notifications'}
            </Button>
          ) : (
            <>
              <Button
                onClick={sendTestNotification}
                variant="outline"
                className="w-full"
              >
                <Bell className="mr-2 h-4 w-4" />
                Send Test Notification
              </Button>
              <Button
                onClick={unsubscribeFromPushNotifications}
                disabled={isSubscribing}
                variant="destructive"
                className="w-full"
              >
                <BellOff className="mr-2 h-4 w-4" />
                {isSubscribing ? 'Disabling...' : 'Disable Notifications'}
              </Button>
            </>
          )}
        </div>

        {permission === 'denied' && (
          <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            You have blocked notifications for this site. To enable them, please
            update your browser settings.
          </div>
        )}

        {!('Notification' in window) && (
          <div className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
            Push notifications are not supported in your browser.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
