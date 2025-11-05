
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUserSecurityLogs } from '@/lib/security-logger';

export const dynamic = 'force-dynamic';

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
    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get('limit') || '20', 10);

    const logs = await getUserSecurityLogs(userId, limit);

    return NextResponse.json({ logs });
  } catch (error) {
    console.error('Failed to fetch security logs:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
