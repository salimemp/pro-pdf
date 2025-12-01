import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { exportUserData } from '@/lib/compliance';

/**
 * GDPR Right to Data Portability
 * Export all user data in JSON format
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
    
    // Export all user data
    const userData = await exportUserData(userId);
    
    // Return as downloadable JSON file
    return new NextResponse(
      JSON.stringify(userData, null, 2),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="user-data-${userId}-${Date.now()}.json"`,
        },
      }
    );
  } catch (error: any) {
    console.error('Data export error:', error);
    return NextResponse.json(
      { error: 'Failed to export data', details: error.message },
      { status: 500 }
    );
  }
}
