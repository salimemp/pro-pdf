
// Simple in-memory rate limiter
// For production, use Redis or a distributed solution

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  max: number; // Max requests per window
}

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

// Store for rate limit records
const rateLimitStore = new Map<string, RateLimitRecord>();

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (record.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

export class RateLimiter {
  private config: RateLimitConfig;
  private identifier: string;

  constructor(identifier: string, config: RateLimitConfig) {
    this.identifier = identifier;
    this.config = config;
  }

  /**
   * Check if a request should be allowed
   * @param key - Unique identifier for the client (e.g., IP address, user ID)
   * @returns Object with allowed status and remaining requests
   */
  check(key: string): {
    allowed: boolean;
    remaining: number;
    resetTime: number;
  } {
    const now = Date.now();
    const limitKey = `${this.identifier}:${key}`;
    const record = rateLimitStore.get(limitKey);

    if (!record || record.resetTime < now) {
      // Create new record
      const newRecord: RateLimitRecord = {
        count: 1,
        resetTime: now + this.config.windowMs,
      };
      rateLimitStore.set(limitKey, newRecord);

      return {
        allowed: true,
        remaining: this.config.max - 1,
        resetTime: newRecord.resetTime,
      };
    }

    // Update existing record
    if (record.count < this.config.max) {
      record.count++;
      rateLimitStore.set(limitKey, record);

      return {
        allowed: true,
        remaining: this.config.max - record.count,
        resetTime: record.resetTime,
      };
    }

    // Rate limit exceeded
    return {
      allowed: false,
      remaining: 0,
      resetTime: record.resetTime,
    };
  }

  /**
   * Reset rate limit for a specific key
   * @param key - Unique identifier for the client
   */
  reset(key: string): void {
    const limitKey = `${this.identifier}:${key}`;
    rateLimitStore.delete(limitKey);
  }
}

// Predefined rate limiters for different endpoints
export const authRateLimiter = new RateLimiter('auth', {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per 15 minutes
});

export const signupRateLimiter = new RateLimiter('signup', {
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 signup attempts per hour
});

export const passwordResetRateLimiter = new RateLimiter('password-reset', {
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 reset requests per hour
});

export const apiRateLimiter = new RateLimiter('api', {
  windowMs: 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute
});

/**
 * Get client identifier from request
 * Uses IP address as the identifier
 */
export function getClientIdentifier(req: Request): string {
  // Try to get the real IP address from headers (considering proxies)
  const forwarded = req.headers.get('x-forwarded-for');
  const realIp = req.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIp) {
    return realIp;
  }
  
  // Fallback to a default value
  return 'unknown';
}

/**
 * Middleware helper to apply rate limiting
 */
export function withRateLimit(
  rateLimiter: RateLimiter,
  handler: (req: Request) => Promise<Response>
) {
  return async (req: Request): Promise<Response> => {
    const clientId = getClientIdentifier(req);
    const { allowed, remaining, resetTime } = rateLimiter.check(clientId);

    if (!allowed) {
      const retryAfter = Math.ceil((resetTime - Date.now()) / 1000);
      return new Response(
        JSON.stringify({
          error: 'Too many requests',
          message: 'You have exceeded the rate limit. Please try again later.',
          retryAfter,
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': retryAfter.toString(),
            'X-RateLimit-Limit': rateLimiter['config'].max.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(resetTime).toISOString(),
          },
        }
      );
    }

    const response = await handler(req);

    // Add rate limit headers to successful responses
    response.headers.set('X-RateLimit-Limit', rateLimiter['config'].max.toString());
    response.headers.set('X-RateLimit-Remaining', remaining.toString());
    response.headers.set('X-RateLimit-Reset', new Date(resetTime).toISOString());

    return response;
  };
}
