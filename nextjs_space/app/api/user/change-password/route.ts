
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import bcrypt from 'bcryptjs';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { sendEmail } from '@/lib/email';
import { logSecurityEvent, getClientIP, getUserAgent, getDeviceType, getLocationFromIP } from '@/lib/security-logger';
import { validatePasswordStrength } from '@/components/password-strength-indicator';

export const dynamic = 'force-dynamic';

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
    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Current password and new password are required' },
        { status: 400 }
      );
    }

    // Validate new password strength
    const passwordValidation = validatePasswordStrength(newPassword);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: passwordValidation.message },
        { status: 400 }
      );
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.password) {
      return NextResponse.json(
        { error: 'User not found or password not set' },
        { status: 404 }
      );
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 401 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    // Get client info
    const ipAddress = getClientIP(req);
    const userAgent = getUserAgent(req);
    const deviceType = getDeviceType(userAgent);
    const location = await getLocationFromIP(ipAddress);

    // Log password change
    await logSecurityEvent({
      userId,
      eventType: 'password_change',
      description: `Password changed from ${location}`,
      ipAddress,
      userAgent,
      location,
      deviceType,
      success: true,
    });

    // Send email notification
    try {
      await sendEmail(
        user.email,
        'Password Changed - PRO PDF',
        `
          <h2>Password Changed</h2>
          <p>Hello ${user.firstName || 'User'},</p>
          <p>Your PRO PDF account password was successfully changed.</p>
          <p><strong>Details:</strong></p>
          <ul>
            <li><strong>Location:</strong> ${location}</li>
            <li><strong>IP Address:</strong> ${ipAddress}</li>
            <li><strong>Device:</strong> ${deviceType}</li>
            <li><strong>Time:</strong> ${new Date().toLocaleString()}</li>
          </ul>
          <p>If you did not make this change, please contact our support team immediately and reset your password.</p>
          <p>Best regards,<br>PRO PDF Security Team</p>
        `
      );
    } catch (emailError) {
      console.error('Failed to send password change email:', emailError);
    }

    return NextResponse.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
