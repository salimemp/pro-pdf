import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getComplianceStatus } from '@/lib/compliance';

/**
 * Get user's compliance status and requirements
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
    
    const status = await getComplianceStatus(userId);
    
    return NextResponse.json({
      success: true,
      ...status,
    });
  } catch (error: any) {
    console.error('Compliance status error:', error);
    return NextResponse.json(
      { error: 'Failed to get compliance status', details: error.message },
      { status: 500 }
    );
  }
}
