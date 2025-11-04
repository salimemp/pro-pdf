
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

/**
 * GDPR Compliance: Update User Consent Preferences
 * Allows users to update their marketing and data processing consents
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        acceptedTermsAt: true,
        acceptedMarketingAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      hasAcceptedTerms: !!user.acceptedTermsAt,
      hasAcceptedMarketing: !!user.acceptedMarketingAt,
      acceptedTermsAt: user.acceptedTermsAt,
      acceptedMarketingAt: user.acceptedMarketingAt,
    });
  } catch (error) {
    console.error('Get consent error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve consent preferences' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { acceptMarketing } = await request.json();

    // Update user consent preferences
    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        acceptedMarketingAt: acceptMarketing ? new Date() : null,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Consent preferences updated successfully',
      hasAcceptedMarketing: !!user.acceptedMarketingAt,
    });
  } catch (error) {
    console.error('Update consent error:', error);
    return NextResponse.json(
      { error: 'Failed to update consent preferences' },
      { status: 500 }
    );
  }
}
