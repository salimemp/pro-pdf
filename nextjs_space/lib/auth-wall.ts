/**
 * Premium Service Auth Wall
 * 
 * Middleware and utilities to restrict premium features to paid subscribers
 */

import { Session } from 'next-auth';
import { NextResponse } from 'next/server';

export type SubscriptionTier = 'free' | 'pro' | 'enterprise';

export interface PremiumFeature {
  name: string;
  requiredTier: SubscriptionTier;
  description: string;
}

// Define premium features and their requirements
export const PREMIUM_FEATURES: Record<string, PremiumFeature> = {
  BATCH_PROCESSING: {
    name: 'Batch Processing',
    requiredTier: 'pro',
    description: 'Process multiple files simultaneously',
  },
  NO_WATERMARK: {
    name: 'No Watermark',
    requiredTier: 'pro',
    description: 'Remove watermarks from processed files',
  },
  CLOUD_STORAGE: {
    name: 'Cloud Storage',
    requiredTier: 'pro',
    description: 'Store files in secure cloud storage',
  },
  API_ACCESS: {
    name: 'API Access',
    requiredTier: 'pro',
    description: 'Access PRO PDF programmatically via API',
  },
  PRIORITY_SUPPORT: {
    name: 'Priority Support',
    requiredTier: 'pro',
    description: 'Get priority customer support',
  },
  ADVANCED_ENCRYPTION: {
    name: 'Advanced Encryption',
    requiredTier: 'pro',
    description: 'Access to advanced encryption features',
  },
  UNLIMITED_FILE_SIZE: {
    name: 'Unlimited File Size',
    requiredTier: 'pro',
    description: 'Upload files larger than 50MB',
  },
  TEAM_COLLABORATION: {
    name: 'Team Collaboration',
    requiredTier: 'enterprise',
    description: 'Collaborate with team members',
  },
  CUSTOM_BRANDING: {
    name: 'Custom Branding',
    requiredTier: 'enterprise',
    description: 'Add your company branding to processed files',
  },
  SSO: {
    name: 'Single Sign-On',
    requiredTier: 'enterprise',
    description: 'Enterprise SSO integration',
  },
};

// Tier hierarchy for comparison
const TIER_HIERARCHY: Record<SubscriptionTier, number> = {
  free: 0,
  pro: 1,
  enterprise: 2,
};

/**
 * Check if a user has access to a premium feature
 */
export function hasFeatureAccess(
  userTier: SubscriptionTier,
  feature: string
): boolean {
  const featureConfig = PREMIUM_FEATURES[feature];
  if (!featureConfig) {
    // If feature is not defined as premium, allow access
    return true;
  }
  
  const userTierLevel = TIER_HIERARCHY[userTier] || 0;
  const requiredTierLevel = TIER_HIERARCHY[featureConfig.requiredTier] || 0;
  
  return userTierLevel >= requiredTierLevel;
}

/**
 * Get user's subscription tier from session
 */
export function getUserTier(session: Session | null): SubscriptionTier {
  if (!session?.user) return 'free';
  
  const subscriptionType = (session.user as any).subscriptionType;
  
  if (subscriptionType === 'premium' || subscriptionType === 'pro') {
    return 'pro';
  }
  
  if (subscriptionType === 'enterprise') {
    return 'enterprise';
  }
  
  return 'free';
}

/**
 * Middleware function to protect API routes
 */
export function requireFeatureAccess(feature: string) {
  return (session: Session | null) => {
    const userTier = getUserTier(session);
    const hasAccess = hasFeatureAccess(userTier, feature);
    
    if (!hasAccess) {
      const featureConfig = PREMIUM_FEATURES[feature];
      return {
        hasAccess: false,
        error: {
          message: `This feature requires ${featureConfig.requiredTier} subscription`,
          feature: featureConfig.name,
          requiredTier: featureConfig.requiredTier,
          userTier,
        },
      };
    }
    
    return { hasAccess: true };
  };
}

/**
 * Check file size limits based on subscription tier
 */
export function getFileSizeLimit(userTier: SubscriptionTier): number {
  switch (userTier) {
    case 'free':
      return 10 * 1024 * 1024; // 10MB
    case 'pro':
      return 100 * 1024 * 1024; // 100MB
    case 'enterprise':
      return 500 * 1024 * 1024; // 500MB
    default:
      return 10 * 1024 * 1024;
  }
}

/**
 * Check daily file limit based on subscription tier
 */
export function getDailyFileLimit(userTier: SubscriptionTier): number | null {
  switch (userTier) {
    case 'free':
      return 5; // 5 files per day
    case 'pro':
      return 100; // 100 files per day
    case 'enterprise':
      return null; // Unlimited
    default:
      return 5;
  }
}

/**
 * Check if user should see ads
 */
export function shouldShowAds(userTier: SubscriptionTier): boolean {
  return userTier === 'free';
}

/**
 * Check if user should see watermark on processed files
 */
export function shouldShowWatermark(userTier: SubscriptionTier): boolean {
  return userTier === 'free';
}

/**
 * Get available features for a subscription tier
 */
export function getAvailableFeatures(userTier: SubscriptionTier): string[] {
  return Object.keys(PREMIUM_FEATURES).filter(feature =>
    hasFeatureAccess(userTier, feature)
  );
}

/**
 * Get features that require an upgrade
 */
export function getLockedFeatures(userTier: SubscriptionTier): PremiumFeature[] {
  return Object.entries(PREMIUM_FEATURES)
    .filter(([feature]) => !hasFeatureAccess(userTier, feature))
    .map(([_, config]) => config);
}
