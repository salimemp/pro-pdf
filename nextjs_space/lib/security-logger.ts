
import { prisma } from './db';
import { NextRequest } from 'next/server';

interface SecurityLogData {
  userId: string;
  eventType: 'login' | 'password_change' | '2fa_enabled' | '2fa_disabled' | 'suspicious_login' | 'session_revoked' | 'signup' | 'failed_login';
  description: string;
  ipAddress?: string;
  userAgent?: string;
  location?: string;
  deviceType?: string;
  success?: boolean;
  metadata?: any;
}

/**
 * Extract IP address from request headers
 */
export function getClientIP(req: NextRequest | Request): string {
  const headers = req.headers;
  
  // Try various headers that might contain the real IP
  const forwardedFor = headers.get('x-forwarded-for');
  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwardedFor.split(',')[0].trim();
  }
  
  const realIp = headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }
  
  const cfConnectingIp = headers.get('cf-connecting-ip');
  if (cfConnectingIp) {
    return cfConnectingIp;
  }
  
  return 'Unknown';
}

/**
 * Extract user agent from request
 */
export function getUserAgent(req: NextRequest | Request): string {
  return req.headers.get('user-agent') || 'Unknown';
}

/**
 * Detect device type from user agent
 */
export function getDeviceType(userAgent: string): string {
  const ua = userAgent.toLowerCase();
  
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'tablet';
  }
  
  if (/mobile|iphone|ipod|android|blackberry|mini|windows\sce|palm/i.test(ua)) {
    return 'mobile';
  }
  
  return 'desktop';
}

/**
 * Get approximate location from IP address (free service)
 */
export async function getLocationFromIP(ipAddress: string): Promise<string> {
  // Skip for local/private IPs
  if (
    ipAddress === 'Unknown' ||
    ipAddress === '127.0.0.1' ||
    ipAddress === '::1' ||
    ipAddress.startsWith('192.168.') ||
    ipAddress.startsWith('10.') ||
    ipAddress.startsWith('172.')
  ) {
    return 'Local';
  }

  try {
    // Using free ip-api.com service (no API key required, 45 requests per minute)
    const response = await fetch(`http://ip-api.com/json/${ipAddress}?fields=country,city,status`, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      if (data.status === 'success') {
        return `${data.city}, ${data.country}`;
      }
    }
  } catch (error) {
    console.error('Failed to fetch location:', error);
  }

  return 'Unknown';
}

/**
 * Log a security event
 */
export async function logSecurityEvent(data: SecurityLogData): Promise<void> {
  try {
    await prisma.securityLog.create({
      data: {
        userId: data.userId,
        eventType: data.eventType,
        description: data.description,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        location: data.location,
        deviceType: data.deviceType,
        success: data.success ?? true,
        metadata: data.metadata ? JSON.stringify(data.metadata) : undefined,
      },
    });
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
}

/**
 * Get security logs for a user
 */
export async function getUserSecurityLogs(userId: string, limit: number = 20) {
  try {
    return await prisma.securityLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  } catch (error) {
    console.error('Failed to fetch security logs:', error);
    return [];
  }
}

/**
 * Check for suspicious login patterns
 */
export async function detectSuspiciousActivity(
  userId: string,
  currentIP: string,
  currentLocation: string
): Promise<{ suspicious: boolean; reason?: string }> {
  try {
    // Get recent login logs (last 24 hours)
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const recentLogins = await prisma.securityLog.findMany({
      where: {
        userId,
        eventType: 'login',
        success: true,
        createdAt: { gte: oneDayAgo },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    // Check for location change (simple check)
    if (recentLogins.length > 0) {
      const lastLocation = recentLogins[0].location;
      
      // If location changed significantly (different country)
      if (lastLocation && currentLocation !== 'Unknown' && lastLocation !== currentLocation) {
        const lastCountry = lastLocation.split(',').pop()?.trim();
        const currentCountry = currentLocation.split(',').pop()?.trim();
        
        if (lastCountry && currentCountry && lastCountry !== currentCountry) {
          return {
            suspicious: true,
            reason: `Login from new location: ${currentLocation} (Previous: ${lastLocation})`,
          };
        }
      }
    }

    // Check for multiple failed attempts
    const recentFailedAttempts = await prisma.securityLog.count({
      where: {
        userId,
        eventType: 'failed_login',
        success: false,
        createdAt: { gte: oneDayAgo },
      },
    });

    if (recentFailedAttempts >= 3) {
      return {
        suspicious: true,
        reason: `Multiple failed login attempts detected (${recentFailedAttempts} in last 24h)`,
      };
    }

    return { suspicious: false };
  } catch (error) {
    console.error('Failed to detect suspicious activity:', error);
    return { suspicious: false };
  }
}
