import { Registry, Counter, Histogram, Gauge, collectDefaultMetrics } from 'prom-client';

// Create a Registry to register the metrics
export const register = new Registry();

// Add a default label to all metrics
register.setDefaultLabels({
  app: 'pro-pdf',
  environment: process.env.NODE_ENV || 'development',
});

// Collect default metrics (CPU, memory, etc.)
collectDefaultMetrics({ register, prefix: 'propdf_' });

// ===================
// HTTP Request Metrics
// ===================

// HTTP request duration histogram
export const httpRequestDuration = new Histogram({
  name: 'propdf_http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.5, 1, 2, 5, 10],
  registers: [register],
});

// HTTP request counter
export const httpRequestTotal = new Counter({
  name: 'propdf_http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
});

// HTTP request size
export const httpRequestSize = new Histogram({
  name: 'propdf_http_request_size_bytes',
  help: 'Size of HTTP requests in bytes',
  labelNames: ['method', 'route'],
  buckets: [100, 1000, 10000, 100000, 1000000, 10000000],
  registers: [register],
});

// HTTP response size
export const httpResponseSize = new Histogram({
  name: 'propdf_http_response_size_bytes',
  help: 'Size of HTTP responses in bytes',
  labelNames: ['method', 'route'],
  buckets: [100, 1000, 10000, 100000, 1000000, 10000000],
  registers: [register],
});

// ===================
// PDF Processing Metrics
// ===================

// PDF conversion duration
export const pdfConversionDuration = new Histogram({
  name: 'propdf_conversion_duration_seconds',
  help: 'Duration of PDF conversions in seconds',
  labelNames: ['operation', 'status'],
  buckets: [1, 5, 10, 30, 60, 120, 300],
  registers: [register],
});

// PDF conversion counter
export const pdfConversionTotal = new Counter({
  name: 'propdf_conversions_total',
  help: 'Total number of PDF conversions',
  labelNames: ['operation', 'status'],
  registers: [register],
});

// PDF file size
export const pdfFileSize = new Histogram({
  name: 'propdf_file_size_bytes',
  help: 'Size of processed PDF files in bytes',
  labelNames: ['operation'],
  buckets: [10000, 100000, 1000000, 10000000, 50000000, 100000000],
  registers: [register],
});

// PDF page count
export const pdfPageCount = new Histogram({
  name: 'propdf_page_count',
  help: 'Number of pages in processed PDFs',
  labelNames: ['operation'],
  buckets: [1, 5, 10, 20, 50, 100, 200, 500],
  registers: [register],
});

// Active PDF processing jobs
export const activePdfJobs = new Gauge({
  name: 'propdf_active_jobs',
  help: 'Number of active PDF processing jobs',
  labelNames: ['operation'],
  registers: [register],
});

// ===================
// Authentication Metrics
// ===================

// Login attempts
export const loginAttempts = new Counter({
  name: 'propdf_login_attempts_total',
  help: 'Total number of login attempts',
  labelNames: ['status'],
  registers: [register],
});

// Signup attempts
export const signupAttempts = new Counter({
  name: 'propdf_signup_attempts_total',
  help: 'Total number of signup attempts',
  labelNames: ['status'],
  registers: [register],
});

// 2FA verifications
export const twoFactorVerifications = new Counter({
  name: 'propdf_2fa_verifications_total',
  help: 'Total number of 2FA verifications',
  labelNames: ['status'],
  registers: [register],
});

// Active sessions
export const activeSessions = new Gauge({
  name: 'propdf_active_sessions',
  help: 'Number of active user sessions',
  registers: [register],
});

// ===================
// Database Metrics
// ===================

// Database query duration
export const dbQueryDuration = new Histogram({
  name: 'propdf_db_query_duration_seconds',
  help: 'Duration of database queries in seconds',
  labelNames: ['operation', 'table'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 5],
  registers: [register],
});

// Database query counter
export const dbQueryTotal = new Counter({
  name: 'propdf_db_queries_total',
  help: 'Total number of database queries',
  labelNames: ['operation', 'table', 'status'],
  registers: [register],
});

// Database connection pool
export const dbConnectionPool = new Gauge({
  name: 'propdf_db_connections',
  help: 'Number of active database connections',
  labelNames: ['state'],
  registers: [register],
});

// ===================
// Business Metrics
// ===================

// Total users
export const totalUsers = new Gauge({
  name: 'propdf_total_users',
  help: 'Total number of registered users',
  labelNames: ['subscription_type'],
  registers: [register],
});

// Subscription events
export const subscriptionEvents = new Counter({
  name: 'propdf_subscription_events_total',
  help: 'Total number of subscription events',
  labelNames: ['event_type'],
  registers: [register],
});

// API usage by tier
export const apiUsageByTier = new Counter({
  name: 'propdf_api_usage_by_tier_total',
  help: 'Total API usage by subscription tier',
  labelNames: ['tier', 'operation'],
  registers: [register],
});

// ===================
// Error Metrics
// ===================

// Application errors
export const applicationErrors = new Counter({
  name: 'propdf_errors_total',
  help: 'Total number of application errors',
  labelNames: ['type', 'severity'],
  registers: [register],
});

// Rate limit hits
export const rateLimitHits = new Counter({
  name: 'propdf_rate_limit_hits_total',
  help: 'Total number of rate limit hits',
  labelNames: ['endpoint'],
  registers: [register],
});

// ===================
// Helper Functions
// ===================

/**
 * Track HTTP request metrics
 */
export function trackHttpRequest(
  method: string,
  route: string,
  statusCode: number,
  duration: number,
  requestSize?: number,
  responseSize?: number
) {
  httpRequestTotal.inc({ method, route, status_code: statusCode });
  httpRequestDuration.observe({ method, route, status_code: statusCode }, duration);
  
  if (requestSize !== undefined) {
    httpRequestSize.observe({ method, route }, requestSize);
  }
  
  if (responseSize !== undefined) {
    httpResponseSize.observe({ method, route }, responseSize);
  }
}

/**
 * Track PDF processing metrics
 */
export function trackPdfOperation(
  operation: string,
  status: 'success' | 'error',
  duration: number,
  fileSize?: number,
  pageCount?: number
) {
  pdfConversionTotal.inc({ operation, status });
  pdfConversionDuration.observe({ operation, status }, duration);
  
  if (fileSize !== undefined) {
    pdfFileSize.observe({ operation }, fileSize);
  }
  
  if (pageCount !== undefined) {
    pdfPageCount.observe({ operation }, pageCount);
  }
}

/**
 * Track authentication events
 */
export function trackAuthEvent(
  type: 'login' | 'signup' | '2fa',
  status: 'success' | 'failure'
) {
  switch (type) {
    case 'login':
      loginAttempts.inc({ status });
      break;
    case 'signup':
      signupAttempts.inc({ status });
      break;
    case '2fa':
      twoFactorVerifications.inc({ status });
      break;
  }
}

/**
 * Track database query metrics
 */
export function trackDbQuery(
  operation: string,
  table: string,
  status: 'success' | 'error',
  duration: number
) {
  dbQueryTotal.inc({ operation, table, status });
  dbQueryDuration.observe({ operation, table }, duration);
}

/**
 * Track application errors
 */
export function trackError(
  type: string,
  severity: 'low' | 'medium' | 'high' | 'critical'
) {
  applicationErrors.inc({ type, severity });
}

/**
 * Get all metrics
 */
export async function getMetrics() {
  return register.metrics();
}

/**
 * Get metrics content type
 */
export function getContentType() {
  return register.contentType;
}
