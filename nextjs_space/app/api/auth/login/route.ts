
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { logSecurityEvent, getClientIP, getUserAgent, getDeviceType, getLocationFromIP, detectSuspiciousActivity } from '@/lib/security-logger';
import { sendEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user || !user.password) {
      // Log failed login attempt
      if (user) {
        const ipAddress = getClientIP(req);
        const userAgent = getUserAgent(req);
        const deviceType = getDeviceType(userAgent);
        const location = await getLocationFromIP(ipAddress);

        await logSecurityEvent({
          userId: user.id,
          eventType: 'failed_login',
          description: 'Invalid password',
          ipAddress,
          userAgent,
          location,
          deviceType,
          success: false,
        });
      }

      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      // Log failed login attempt
      const ipAddress = getClientIP(req);
      const userAgent = getUserAgent(req);
      const deviceType = getDeviceType(userAgent);
      const location = await getLocationFromIP(ipAddress);

      await logSecurityEvent({
        userId: user.id,
        eventType: 'failed_login',
        description: 'Invalid password',
        ipAddress,
        userAgent,
        location,
        deviceType,
        success: false,
      });

      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Get client info
    const ipAddress = getClientIP(req);
    const userAgent = getUserAgent(req);
    const deviceType = getDeviceType(userAgent);
    const location = await getLocationFromIP(ipAddress);

    // Check for suspicious activity
    const { suspicious, reason } = await detectSuspiciousActivity(
      user.id,
      ipAddress,
      location
    );

    // Log successful login
    await logSecurityEvent({
      userId: user.id,
      eventType: suspicious ? 'suspicious_login' : 'login',
      description: suspicious
        ? `Suspicious login detected: ${reason}`
        : `Successful login from ${location}`,
      ipAddress,
      userAgent,
      location,
      deviceType,
      success: true,
      metadata: suspicious ? { reason } : undefined,
    });

    // Send email notification for suspicious activity or new device
    if (suspicious) {
      // Send security alert email
      try {
        await sendEmail(
          user.email,
          'Suspicious Login Detected - PRO PDF',
          `
            <h2>Suspicious Login Detected</h2>
            <p>Hello ${user.firstName || 'User'},</p>
            <p>We detected a suspicious login to your PRO PDF account:</p>
            <ul>
              <li><strong>Location:</strong> ${location}</li>
              <li><strong>IP Address:</strong> ${ipAddress}</li>
              <li><strong>Device:</strong> ${deviceType}</li>
              <li><strong>Reason:</strong> ${reason}</li>
              <li><strong>Time:</strong> ${new Date().toLocaleString()}</li>
            </ul>
            <p>If this was you, you can safely ignore this email. If you don't recognize this activity, please secure your account immediately by changing your password.</p>
            <p>Best regards,<br>PRO PDF Security Team</p>
          `
        );
      } catch (emailError) {
        console.error('Failed to send security alert email:', emailError);
      }
    }

    // Return success
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        firstName: user.firstName,
        lastName: user.lastName,
        isPremium: user.isPremium,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
