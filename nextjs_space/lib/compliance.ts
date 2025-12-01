/**
 * Compliance Library
 * 
 * Handles GDPR, HIPAA, PIPEDA, and CCPA compliance requirements
 */

import { prisma } from './db';
import { User } from '@prisma/client';

export interface ComplianceRegion {
  gdpr: boolean;  // EU/EEA countries
  ccpa: boolean;  // California, USA
  pipeda: boolean; // Canada
  hipaa: boolean; // Healthcare data (US)
}

export interface ConsentData {
  terms: boolean;
  privacy: boolean;
  marketing: boolean;
  analytics: boolean;
  functional: boolean;
}

export interface PrivacySettings {
  dataRetention: boolean;
  profileVisibility: 'public' | 'private' | 'contacts';
  activityTracking: boolean;
  personalization: boolean;
}

/**
 * Determine user's compliance region based on country
 */
export function getComplianceRegion(country?: string | null): ComplianceRegion {
  if (!country) {
    return { gdpr: false, ccpa: false, pipeda: false, hipaa: false };
  }
  
  const countryUpper = country.toUpperCase();
  
  // GDPR countries (EU/EEA)
  const gdprCountries = [
    'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR',
    'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL',
    'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE', 'IS', 'LI', 'NO', 'GB'
  ];
  
  return {
    gdpr: gdprCountries.includes(countryUpper),
    ccpa: countryUpper === 'US', // More specifically California, but we apply to all US
    pipeda: countryUpper === 'CA',
    hipaa: false, // HIPAA applies to healthcare data, not geography
  };
}

/**
 * Log audit event for compliance tracking
 */
export async function logAuditEvent({
  userId,
  eventType,
  resourceType,
  resourceId,
  action,
  description,
  ipAddress,
  userAgent,
  metadata,
}: {
  userId?: string;
  eventType: string;
  resourceType: string;
  resourceId?: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'export';
  description: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: any;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        eventType,
        resourceType,
        resourceId,
        action,
        description,
        ipAddress,
        userAgent,
        metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : null,
      },
    });
  } catch (error) {
    console.error('Failed to log audit event:', error);
  }
}

/**
 * Log data access for HIPAA compliance
 */
export async function logDataAccess({
  userId,
  accessedBy,
  resourceType,
  resourceId,
  accessType,
  ipAddress,
  userAgent,
  purpose,
}: {
  userId: string;
  accessedBy: string;
  resourceType: string;
  resourceId: string;
  accessType: 'view' | 'download' | 'edit' | 'delete';
  ipAddress?: string;
  userAgent?: string;
  purpose?: string;
}) {
  try {
    await prisma.dataAccessLog.create({
      data: {
        userId,
        accessedBy,
        resourceType,
        resourceId,
        accessType,
        ipAddress,
        userAgent,
        purpose,
      },
    });
  } catch (error) {
    console.error('Failed to log data access:', error);
  }
}

/**
 * Update user consent settings
 */
export async function updateConsent(
  userId: string,
  consent: Partial<ConsentData>,
  ipAddress?: string,
  userAgent?: string
) {
  const updates: any = {};
  
  if (consent.terms !== undefined) {
    updates.acceptedTermsAt = consent.terms ? new Date() : null;
  }
  
  if (consent.privacy !== undefined) {
    updates.acceptedPrivacyAt = consent.privacy ? new Date() : null;
    updates.gdprConsent = consent.privacy;
  }
  
  if (consent.marketing !== undefined) {
    updates.acceptedMarketingAt = consent.marketing ? new Date() : null;
  }
  
  const user = await prisma.user.update({
    where: { id: userId },
    data: updates,
  });
  
  // Log audit event
  await logAuditEvent({
    userId,
    eventType: 'consent_change',
    resourceType: 'user',
    resourceId: userId,
    action: 'update',
    description: `User consent updated: ${JSON.stringify(consent)}`,
    ipAddress,
    userAgent,
    metadata: consent,
  });
  
  return user;
}

/**
 * Export all user data (GDPR Right to Data Portability)
 */
export async function exportUserData(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      accounts: true,
      sessions: true,
      files: true,
      conversionHistory: true,
      subscriptions: true,
      jobs: true,
      securityLogs: true,
      auditLogs: true,
    },
  });
  
  if (!user) {
    throw new Error('User not found');
  }
  
  // Remove sensitive fields
  const exportData = {
    ...user,
    password: undefined,
    twoFactorSecret: undefined,
    backupCodes: undefined,
    verificationToken: undefined,
    resetToken: undefined,
  };
  
  // Update last export timestamp
  await prisma.user.update({
    where: { id: userId },
    data: { dataExportRequestedAt: new Date() },
  });
  
  // Log audit event
  await logAuditEvent({
    userId,
    eventType: 'data_export',
    resourceType: 'user',
    resourceId: userId,
    action: 'export',
    description: 'User data exported',
  });
  
  return exportData;
}

/**
 * Request account deletion (with 30-day grace period)
 */
export async function requestAccountDeletion(
  userId: string,
  ipAddress?: string,
  userAgent?: string
) {
  const deletionDate = new Date();
  deletionDate.setDate(deletionDate.getDate() + 30); // 30-day grace period
  
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      dataDeletionRequestedAt: new Date(),
      dataDeletionScheduledAt: deletionDate,
    },
  });
  
  // Log audit event
  await logAuditEvent({
    userId,
    eventType: 'data_deletion',
    resourceType: 'user',
    resourceId: userId,
    action: 'delete',
    description: `Account deletion requested, scheduled for ${deletionDate.toISOString()}`,
    ipAddress,
    userAgent,
  });
  
  return user;
}

/**
 * Cancel account deletion request
 */
export async function cancelAccountDeletion(userId: string) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      dataDeletionRequestedAt: null,
      dataDeletionScheduledAt: null,
    },
  });
  
  // Log audit event
  await logAuditEvent({
    userId,
    eventType: 'data_deletion_canceled',
    resourceType: 'user',
    resourceId: userId,
    action: 'update',
    description: 'Account deletion request canceled',
  });
  
  return user;
}

/**
 * Permanently delete user account and all associated data
 */
export async function deleteUserAccount(userId: string) {
  // Delete in order to respect foreign key constraints
  await prisma.dataAccessLog.deleteMany({ where: { userId } });
  await prisma.auditLog.deleteMany({ where: { userId } });
  await prisma.securityLog.deleteMany({ where: { userId } });
  await prisma.job.deleteMany({ where: { userId } });
  await prisma.subscription.deleteMany({ where: { userId } });
  await prisma.conversionHistory.deleteMany({ where: { userId } });
  await prisma.file.deleteMany({ where: { userId } });
  await prisma.session.deleteMany({ where: { userId } });
  await prisma.account.deleteMany({ where: { userId } });
  
  // Finally delete the user
  await prisma.user.delete({ where: { id: userId } });
}

/**
 * Update CCPA opt-out status
 */
export async function updateCCPAOptOut(
  userId: string,
  optOut: boolean,
  ipAddress?: string,
  userAgent?: string
) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { ccpaOptOut: optOut },
  });
  
  // Log audit event
  await logAuditEvent({
    userId,
    eventType: 'ccpa_opt_out',
    resourceType: 'user',
    resourceId: userId,
    action: 'update',
    description: optOut ? 'CCPA opt-out enabled' : 'CCPA opt-out disabled',
    ipAddress,
    userAgent,
  });
  
  return user;
}

/**
 * Update cookie consent preferences
 */
export async function updateCookieConsent(
  userId: string,
  cookiePreferences: {
    analytics: boolean;
    marketing: boolean;
    functional: boolean;
  }
) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      cookieConsent: JSON.parse(JSON.stringify(cookiePreferences)),
    },
  });
  
  // Log audit event
  await logAuditEvent({
    userId,
    eventType: 'cookie_consent',
    resourceType: 'user',
    resourceId: userId,
    action: 'update',
    description: 'Cookie consent preferences updated',
    metadata: cookiePreferences,
  });
  
  return user;
}

/**
 * Check if user data should be deleted (grace period expired)
 */
export async function getAccountsPendingDeletion() {
  const now = new Date();
  
  return await prisma.user.findMany({
    where: {
      dataDeletionScheduledAt: {
        lte: now,
      },
    },
  });
}

/**
 * Get user's compliance status summary
 */
export async function getComplianceStatus(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      country: true,
      gdprConsent: true,
      ccpaOptOut: true,
      acceptedTermsAt: true,
      acceptedPrivacyAt: true,
      acceptedMarketingAt: true,
      cookieConsent: true,
      dataRetentionConsent: true,
      dataDeletionRequestedAt: true,
      dataDeletionScheduledAt: true,
      dataExportRequestedAt: true,
    },
  });
  
  if (!user) {
    throw new Error('User not found');
  }
  
  const region = getComplianceRegion(user.country);
  
  return {
    user,
    region,
    complianceStatus: {
      gdprCompliant: !region.gdpr || user.gdprConsent,
      ccpaCompliant: !region.ccpa || user.ccpaOptOut !== undefined,
      pipedaCompliant: !region.pipeda || (user.acceptedPrivacyAt !== null),
      hasActiveConsent: user.acceptedTermsAt !== null && user.acceptedPrivacyAt !== null,
      pendingDeletion: user.dataDeletionScheduledAt !== null,
    },
  };
}
