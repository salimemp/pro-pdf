import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { updateConsent, updateCookieConsent, updateCCPAOptOut } from '@/lib/compliance';

/**
 * Update user consent preferences
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const userId = (session.user as any).id;
    const body = await req.json();
    const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || undefined;
    const userAgent = req.headers.get('user-agent') || undefined;
    
    // Handle different types of consent updates
    if (body.consentType === 'general') {
      const user = await updateConsent(
        userId,
        {
          terms: body.terms,
          privacy: body.privacy,
          marketing: body.marketing,
        },
        ipAddress,
        userAgent
      );
      
      return NextResponse.json({
        success: true,
        message: 'Consent preferences updated',
      });
    }
    
    if (body.consentType === 'cookies') {
      const user = await updateCookieConsent(userId, {
        analytics: body.analytics ?? true,
        marketing: body.marketing ?? false,
        functional: body.functional ?? true,
      });
      
      return NextResponse.json({
        success: true,
        message: 'Cookie preferences updated',
      });
    }
    
    if (body.consentType === 'ccpa') {
      const user = await updateCCPAOptOut(
        userId,
        body.optOut ?? false,
        ipAddress,
        userAgent
      );
      
      return NextResponse.json({
        success: true,
        message: 'CCPA preferences updated',
      });
    }
    
    return NextResponse.json(
      { error: 'Invalid consent type' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Consent update error:', error);
    return NextResponse.json(
      { error: 'Failed to update consent', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * Get current consent preferences
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const userId = (session.user as any).id;
    const { prisma } = await import('@/lib/db');
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        acceptedTermsAt: true,
        acceptedPrivacyAt: true,
        acceptedMarketingAt: true,
        gdprConsent: true,
        ccpaOptOut: true,
        cookieConsent: true,
        dataRetentionConsent: true,
        country: true,
        gdprRegion: true,
        ccpaRegion: true,
      },
    });
    
    return NextResponse.json({
      success: true,
      consent: user,
    });
  } catch (error: any) {
    console.error('Get consent error:', error);
    return NextResponse.json(
      { error: 'Failed to get consent preferences', details: error.message },
      { status: 500 }
    );
  }
}
