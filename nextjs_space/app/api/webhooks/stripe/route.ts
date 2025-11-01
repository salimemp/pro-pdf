
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/db';
import Stripe from 'stripe';

export const dynamic = "force-dynamic";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature')!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error(`⚠️  Webhook signature verification failed.`, err.message);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        if (session.mode === 'subscription') {
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          );
          
          await updateUserSubscription(session.metadata?.userId!, subscription);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        
        // Find user by customer ID
        const user = await prisma.user.findFirst({
          where: { stripeCustomerId: customerId }
        });
        
        if (user) {
          await updateUserSubscription(user.id, subscription);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        
        // Find user by customer ID
        const user = await prisma.user.findFirst({
          where: { stripeCustomerId: customerId }
        });
        
        if (user) {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              isPremium: false,
              subscriptionId: null,
              subscriptionStatus: 'canceled',
              subscriptionEndDate: new Date(((subscription as any).current_period_end || 0) * 1000)
            }
          });
        }
        break;
      }

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook error' },
      { status: 500 }
    );
  }
}

async function updateUserSubscription(userId: string, subscription: Stripe.Subscription) {
  const currentPeriodEnd = (subscription as any).current_period_end || 0;
  const currentPeriodStart = (subscription as any).current_period_start || 0;
  const canceledAt = subscription.canceled_at || null;

  await prisma.user.update({
    where: { id: userId },
    data: {
      isPremium: subscription.status === 'active',
      subscriptionId: subscription.id,
      subscriptionStatus: subscription.status,
      subscriptionEndDate: new Date(currentPeriodEnd * 1000)
    }
  });

  // Update or create subscription record
  await prisma.subscription.upsert({
    where: { stripeSubscriptionId: subscription.id },
    update: {
      status: subscription.status,
      currentPeriodStart: new Date(currentPeriodStart * 1000),
      currentPeriodEnd: new Date(currentPeriodEnd * 1000),
      canceledAt: canceledAt ? new Date(canceledAt * 1000) : null,
    },
    create: {
      userId: userId,
      stripeSubscriptionId: subscription.id,
      stripeCustomerId: subscription.customer as string,
      stripePriceId: subscription.items?.data?.[0]?.price?.id || '',
      status: subscription.status,
      currentPeriodStart: new Date(currentPeriodStart * 1000),
      currentPeriodEnd: new Date(currentPeriodEnd * 1000),
      canceledAt: canceledAt ? new Date(canceledAt * 1000) : null,
    }
  });
}
