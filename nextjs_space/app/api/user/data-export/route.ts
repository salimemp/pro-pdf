
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

/**
 * GDPR Compliance: Export User Data
 * Allows users to download all their personal data in JSON format
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all user data
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        sessions: {
          select: {
            id: true,
            createdAt: true,
            expires: true,
            ipAddress: true,
            userAgent: true,
            deviceType: true,
            lastActivity: true,
          },
        },
        files: {
          select: {
            id: true,
            fileName: true,
            fileSize: true,
            cloudStoragePath: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Remove sensitive data before export
    const exportData = {
      personalInformation: {
        id: user.id,
        email: user.email,
        name: user.name,
        firstName: user.firstName,
        lastName: user.lastName,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      accountSettings: {
        subscriptionStatus: user.subscriptionStatus,
        subscriptionId: user.subscriptionId,
        subscriptionEndDate: user.subscriptionEndDate,
        twoFactorEnabled: user.twoFactorEnabled,
      },
      consents: {
        acceptedTermsAt: user.acceptedTermsAt,
        acceptedMarketingAt: user.acceptedMarketingAt,
      },
      sessions: user.sessions,
      fileHistory: user.files,
      exportedAt: new Date().toISOString(),
      exportedBy: session.user.email,
    };

    // Return as downloadable JSON file
    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="propdf-data-export-${Date.now()}.json"`,
      },
    });
  } catch (error) {
    console.error('Data export error:', error);
    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500 }
    );
  }
}
