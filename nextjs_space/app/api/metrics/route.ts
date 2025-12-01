import { NextRequest, NextResponse } from 'next/server';
import { getMetrics, getContentType } from '@/lib/monitoring/metrics';

/**
 * GET /api/metrics
 * 
 * Exposes Prometheus metrics endpoint
 * 
 * Security: In production, this endpoint should be:
 * 1. Protected by authentication
 * 2. Only accessible from monitoring systems
 * 3. Rate limited
 * 4. Not exposed publicly
 */
export async function GET(req: NextRequest) {
  try {
    // In production, add authentication here
    // const authHeader = req.headers.get('authorization');
    // if (!isValidMonitoringToken(authHeader)) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }
    
    const metrics = await getMetrics();
    
    return new NextResponse(metrics, {
      status: 200,
      headers: {
        'Content-Type': getContentType(),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Error getting metrics:', error);
    return NextResponse.json(
      { error: 'Failed to get metrics' },
      { status: 500 }
    );
  }
}
