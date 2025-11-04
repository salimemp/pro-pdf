
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { generate2FASecret, generateQRCode, generateBackupCodes } from '@/lib/2fa';

export async function POST(req: NextRequest) {
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
      select: { id: true, email: true, twoFactorEnabled: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (user.twoFactorEnabled) {
      return NextResponse.json(
        { error: '2FA is already enabled' },
        { status: 400 }
      );
    }

    // Generate 2FA secret and QR code
    const { secret, otpauthUrl, encryptedSecret } = generate2FASecret(user.email);
    const qrCode = await generateQRCode(otpauthUrl);

    // Generate backup codes
    const { plainCodes, encryptedCodes } = generateBackupCodes();

    // Store the secret temporarily (will be confirmed during verification)
    await prisma.user.update({
      where: { id: user.id },
      data: {
        twoFactorSecret: encryptedSecret,
        backupCodes: encryptedCodes,
      },
    });

    return NextResponse.json({
      qrCode,
      secret, // Show this to user as a backup if QR code doesn't work
      backupCodes: plainCodes,
    });
  } catch (error) {
    console.error('2FA setup error:', error);
    return NextResponse.json(
      { error: 'Failed to setup 2FA' },
      { status: 500 }
    );
  }
}
