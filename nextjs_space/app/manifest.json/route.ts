import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Dynamic route configuration
export const dynamic = 'force-dynamic';

// Dynamic manifest endpoint that serves personalized shortcuts
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Fetch dynamic shortcuts based on user preferences
    let shortcuts = [];
    if (session?.user?.email) {
      try {
        // Get personalized shortcuts from API
        const shortcutsResponse = await fetch(
          `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/shortcuts`,
          {
            headers: {
              Cookie: req.headers.get('cookie') || '',
            },
          }
        );
        if (shortcutsResponse.ok) {
          const data = await shortcutsResponse.json();
          shortcuts = data.shortcuts || [];
        }
      } catch (error) {
        console.error('Error fetching dynamic shortcuts:', error);
      }
    }

    // Fallback to default shortcuts if none are available
    if (shortcuts.length === 0) {
      shortcuts = [
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
    }

    // Build complete manifest
    const manifest = {
      name: 'PRO PDF - Professional PDF Tools',
      short_name: 'PRO PDF',
      description:
        'Professional PDF tools for converting, merging, splitting, compressing, and editing PDFs with enterprise-grade security.',
      start_url: '/',
      display: 'standalone',
      background_color: '#0f172a',
      theme_color: '#3b82f6',
      orientation: 'portrait-primary',
      icons: [
        {
          src: '/favicon.svg',
          sizes: 'any',
          type: 'image/svg+xml',
          purpose: 'any maskable',
        },
        {
          src: '/icon-192.png',
          sizes: '192x192',
          type: 'image/png',
          purpose: 'any maskable',
        },
        {
          src: '/icon-512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any maskable',
        },
      ],
      screenshots: [
        {
          src: '/og-image.png',
          sizes: '1200x630',
          type: 'image/png',
          form_factor: 'wide',
        },
      ],
      categories: ['productivity', 'utilities'],
      shortcuts,
    };

    return NextResponse.json(manifest, {
      headers: {
        'Content-Type': 'application/manifest+json',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  } catch (error) {
    console.error('Error generating manifest:', error);
    // Return basic manifest on error
    const fallbackManifest = {
      name: 'PRO PDF - Professional PDF Tools',
      short_name: 'PRO PDF',
      description: 'Professional PDF tools',
      start_url: '/',
      display: 'standalone',
      background_color: '#0f172a',
      theme_color: '#3b82f6',
      icons: [
        {
          src: '/icon-192.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: '/icon-512.png',
          sizes: '512x512',
          type: 'image/png',
        },
      ],
    };
    return NextResponse.json(fallbackManifest, {
      headers: {
        'Content-Type': 'application/manifest+json',
      },
    });
  }
}
