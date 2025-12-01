import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { requestAccountDeletion, cancelAccountDeletion } from '@/lib/compliance';

/**
 * Request or cancel account deletion
 * POST: Request deletion (30-day grace period)
 * DELETE: Cancel deletion request
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
    const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || undefined;
    const userAgent = req.headers.get('user-agent') || undefined;
    
    const user = await requestAccountDeletion(userId, ipAddress, userAgent);
    
    return NextResponse.json({
      success: true,
      message: 'Account deletion requested',
      deletionScheduledAt: user.dataDeletionScheduledAt,
    });
  } catch (error: any) {
    console.error('Account deletion request error:', error);
    return NextResponse.json(
      { error: 'Failed to request account deletion', details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const userId = (session.user as any).id;
    
    const user = await cancelAccountDeletion(userId);
    
    return NextResponse.json({
      success: true,
      message: 'Account deletion canceled',
    });
  } catch (error: any) {
    console.error('Cancel deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to cancel account deletion', details: error.message },
      { status: 500 }
    );
  }
}
