import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// Get dynamic app shortcuts based on user preferences and history
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Default shortcuts for non-authenticated users
    const defaultShortcuts = [
      {
        name: 'Convert PDF',
        short_name: 'Convert',
        description: 'Convert files to and from PDF',
        url: '/tools/convert',
        icons: [{ src: '/icon-192.png', sizes: '192x192', type: 'image/png' }],
      },
      {
        name: 'Merge PDF',
        short_name: 'Merge',
        description: 'Combine multiple PDFs into one',
        url: '/tools/merge',
        icons: [{ src: '/icon-192.png', sizes: '192x192', type: 'image/png' }],
      },
      {
        name: 'Compress PDF',
        short_name: 'Compress',
        description: 'Reduce PDF file size',
        url: '/tools/compress',
        icons: [{ src: '/icon-192.png', sizes: '192x192', type: 'image/png' }],
      },
      {
        name: 'AI Summary',
        short_name: 'AI Summary',
        description: 'Get AI-powered PDF summary',
        url: '/tools/ai-summary',
        icons: [{ src: '/icon-192.png', sizes: '192x192', type: 'image/png' }],
      },
    ];

    if (!session?.user?.email) {
      return NextResponse.json({ shortcuts: defaultShortcuts });
    }

    // Get user's most frequent operations from conversion history
    const recentOperations = await prisma.conversionHistory.groupBy({
      by: ['operation'],
      where: {
        userId: session.user.email,
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        },
      },
      _count: {
        operation: true,
      },
      orderBy: {
        _count: {
          operation: 'desc',
        },
      },
      take: 6,
    });

    // Map operations to tool URLs and names
    const operationMap: Record<string, { name: string; url: string; description: string }> = {
      convert: {
        name: 'Convert PDF',
        url: '/tools/convert',
        description: 'Convert files to and from PDF',
      },
      merge: {
        name: 'Merge PDF',
        url: '/tools/merge',
        description: 'Combine multiple PDFs',
      },
      split: {
        name: 'Split PDF',
        url: '/tools/split',
        description: 'Split PDF into multiple files',
      },
      compress: {
        name: 'Compress PDF',
        url: '/tools/compress',
        description: 'Reduce PDF file size',
      },
      encrypt: {
        name: 'Encrypt PDF',
        url: '/tools/encrypt',
        description: 'Secure your PDFs',
      },
      sign: {
        name: 'Sign PDF',
        url: '/tools/sign',
        description: 'Add digital signatures',
      },
      watermark: {
        name: 'Watermark PDF',
        url: '/tools/watermark',
        description: 'Add watermarks',
      },
      'ai-summary': {
        name: 'AI Summary',
        url: '/tools/ai-summary',
        description: 'Get AI-powered summary',
      },
      annotate: {
        name: 'Annotate PDF',
        url: '/tools/annotate',
        description: 'Add annotations',
      },
      compare: {
        name: 'Compare PDFs',
        url: '/tools/compare',
        description: 'Compare two PDFs',
      },
    };

    // Build personalized shortcuts
    const personalizedShortcuts = recentOperations
      .map((op) => {
        const toolInfo = operationMap[op.operation];
        if (!toolInfo) return null;

        return {
          name: toolInfo.name,
          short_name: toolInfo.name.replace(' PDF', ''),
          description: toolInfo.description,
          url: toolInfo.url,
          icons: [{ src: '/icon-192.png', sizes: '192x192', type: 'image/png' }],
        };
      })
      .filter((shortcut) => shortcut !== null)
      .slice(0, 4); // Max 4 shortcuts

    // If user has less than 4 personalized shortcuts, fill with defaults
    const shortcuts =
      personalizedShortcuts.length >= 4
        ? personalizedShortcuts
        : [
            ...personalizedShortcuts,
            ...defaultShortcuts.slice(0, 4 - personalizedShortcuts.length),
          ];

    return NextResponse.json({ shortcuts });
  } catch (error) {
    console.error('Error fetching shortcuts:', error);
    // Return default shortcuts on error
    return NextResponse.json({
      shortcuts: [
        {
          name: 'Convert PDF',
          short_name: 'Convert',
          description: 'Convert files to and from PDF',
          url: '/tools/convert',
          icons: [{ src: '/icon-192.png', sizes: '192x192', type: 'image/png' }],
        },
        {
          name: 'Merge PDF',
          short_name: 'Merge',
          description: 'Combine multiple PDFs into one',
          url: '/tools/merge',
          icons: [{ src: '/icon-192.png', sizes: '192x192', type: 'image/png' }],
        },
        {
          name: 'Compress PDF',
          short_name: 'Compress',
          description: 'Reduce PDF file size',
          url: '/tools/compress',
          icons: [{ src: '/icon-192.png', sizes: '192x192', type: 'image/png' }],
        },
        {
          name: 'AI Summary',
          short_name: 'AI Summary',
          description: 'Get AI-powered PDF summary',
          url: '/tools/ai-summary',
          icons: [{ src: '/icon-192.png', sizes: '192x192', type: 'image/png' }],
        },
      ],
    });
  }
}
