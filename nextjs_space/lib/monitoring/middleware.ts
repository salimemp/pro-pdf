import { NextRequest, NextResponse } from 'next/server';
import { trackHttpRequest } from './metrics';

/**
 * Monitoring middleware to track HTTP requests
 */
export function monitoringMiddleware(
  handler: (req: NextRequest) => Promise<NextResponse> | NextResponse
) {
  return async (req: NextRequest) => {
    const start = Date.now();
    const method = req.method;
    const route = getRouteFromPath(req.nextUrl.pathname);
    
    try {
      const response = await handler(req);
      const duration = (Date.now() - start) / 1000; // Convert to seconds
      const statusCode = response.status;
      
      // Get request and response sizes
      const requestSize = parseInt(req.headers.get('content-length') || '0');
      const responseSize = parseInt(response.headers.get('content-length') || '0');
      
      // Track metrics
      trackHttpRequest(method, route, statusCode, duration, requestSize, responseSize);
      
      return response;
    } catch (error) {
      const duration = (Date.now() - start) / 1000;
      trackHttpRequest(method, route, 500, duration);
      throw error;
    }
  };
}

/**
 * Extract route pattern from pathname
 * Converts /api/users/123 to /api/users/:id
 */
function getRouteFromPath(pathname: string): string {
  // Remove query parameters
  const cleanPath = pathname.split('?')[0];
  
  // API routes
  if (cleanPath.startsWith('/api/')) {
    // Replace UUIDs and numeric IDs with placeholders
    return cleanPath
      .replace(/\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, '/:id')
      .replace(/\/\d+/g, '/:id');
  }
  
  // Tool routes
  if (cleanPath.startsWith('/tools/')) {
    return cleanPath;
  }
  
  // Auth routes
  if (cleanPath.startsWith('/auth/')) {
    return cleanPath;
  }
  
  // Static pages
  const staticPages = ['/', '/about', '/contact', '/help', '/pricing', '/privacy', '/terms', '/dashboard', '/settings', '/jobs'];
  if (staticPages.includes(cleanPath)) {
    return cleanPath;
  }
  
  // Default: return as-is
  return cleanPath || '/';
}

/**
 * Helper to wrap API route handlers with monitoring
 */
export function withMonitoring<T extends any[]>(
  handler: (...args: T) => Promise<NextResponse> | NextResponse
) {
  return async (...args: T) => {
    const req = args[0] as NextRequest;
    const start = Date.now();
    const method = req.method;
    const route = getRouteFromPath(req.nextUrl?.pathname || req.url || '');
    
    try {
      const response = await handler(...args);
      const duration = (Date.now() - start) / 1000;
      const statusCode = response.status;
      
      trackHttpRequest(method, route, statusCode, duration);
      
      return response;
    } catch (error) {
      const duration = (Date.now() - start) / 1000;
      trackHttpRequest(method, route, 500, duration);
      throw error;
    }
  };
}
