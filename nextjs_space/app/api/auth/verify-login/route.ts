
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verify2FAToken, verifyBackupCode } from '@/lib/2fa';
import { authRateLimiter, getClientIdentifier } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  // Apply rate limiting
  const clientId = getClientIdentifier(req);
  const { allowed, remaining, resetTime } = authRateLimiter.check(clientId);

  if (!allowed) {
    const retryAfter = Math.ceil((resetTime - Date.now()) / 1000);
    return NextResponse.json(
      {
        error: 'Too many verification attempts',
        message: 'Please try again later.',
        retryAfter,
      },
      {
        status: 429,
        headers: {
          'Retry-After': retryAfter.toString(),
        },
      }
    );
  }

  try {
    const { userId, token, isBackupCode } = await req.json();

    if (!userId || !token) {
      return NextResponse.json(
        { error: 'User ID and token are required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        twoFactorEnabled: true,
        twoFactorSecret: true,
        backupCodes: true,
      },
    });

    if (!user || !user.twoFactorEnabled) {
      return NextResponse.json(
        { error: 'Invalid user or 2FA not enabled' },
        { status: 401 }
      );
    }

    let isValid = false;

    if (isBackupCode && user.backupCodes) {
      // Verify backup code
      const { valid, remainingCodes } = verifyBackupCode(
        user.backupCodes as string[],
        token
      );
      
      if (valid) {
        // Update remaining backup codes
        await prisma.user.update({
          where: { id: user.id },
          data: { backupCodes: remainingCodes },
        });
        isValid = true;
      }
    } else if (user.twoFactorSecret) {
      // Verify TOTP token
      isValid = verify2FAToken(user.twoFactorSecret, token);
    }

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Login verified successfully',
    });
  } catch (error) {
    console.error('Verify login error:', error);
    return NextResponse.json(
      { error: 'Failed to verify login' },
      { status: 500 }
    );
  }
}
