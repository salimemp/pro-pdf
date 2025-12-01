'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import {
  Download,
  Trash2,
  Shield,
  Cookie,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from 'lucide-react';

interface ComplianceStatus {
  user: any;
  region: {
    gdpr: boolean;
    ccpa: boolean;
    pipeda: boolean;
    hipaa: boolean;
  };
  complianceStatus: {
    gdprCompliant: boolean;
    ccpaCompliant: boolean;
    pipedaCompliant: boolean;
    hasActiveConsent: boolean;
    pendingDeletion: boolean;
  };
}

export function PrivacyDashboard() {
  const [status, setStatus] = useState<ComplianceStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [cookieConsent, setCookieConsent] = useState({
    analytics: true,
    marketing: false,
    functional: true,
  });
  const [ccpaOptOut, setCcpaOptOut] = useState(false);

  useEffect(() => {
    loadComplianceStatus();
  }, []);

  const loadComplianceStatus = async () => {
    try {
      const response = await fetch('/api/compliance/status');
      const data = await response.json();
      
      if (data.success) {
        setStatus(data);
        
        // Load cookie consent
        if (data.user.cookieConsent) {
          setCookieConsent(data.user.cookieConsent);
        }
        
        // Load CCPA opt-out
        setCcpaOptOut(data.user.ccpaOptOut || false);
      }
    } catch (error) {
      console.error('Failed to load compliance status:', error);
      toast.error('Failed to load privacy settings');
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = async () => {
    try {
      toast.info('Preparing your data export...');
      
      const response = await fetch('/api/compliance/export', {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Export failed');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `user-data-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Data exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data');
    }
  };

  const handleRequestDeletion = async () => {
    try {
      const response = await fetch('/api/compliance/delete-account', {
        method: 'POST',
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('Account deletion scheduled');
        await loadComplianceStatus();
      } else {
        toast.error('Failed to request deletion');
      }
    } catch (error) {
      console.error('Deletion request error:', error);
      toast.error('Failed to request deletion');
    }
  };

  const handleCancelDeletion = async () => {
    try {
      const response = await fetch('/api/compliance/delete-account', {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('Account deletion canceled');
        await loadComplianceStatus();
      } else {
        toast.error('Failed to cancel deletion');
      }
    } catch (error) {
      console.error('Cancel deletion error:', error);
      toast.error('Failed to cancel deletion');
    }
  };

  const handleUpdateCookies = async () => {
    try {
      const response = await fetch('/api/compliance/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          consentType: 'cookies',
          ...cookieConsent,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('Cookie preferences updated');
      } else {
        toast.error('Failed to update preferences');
      }
    } catch (error) {
      console.error('Cookie update error:', error);
      toast.error('Failed to update preferences');
    }
  };

  const handleUpdateCCPA = async (optOut: boolean) => {
    try {
      const response = await fetch('/api/compliance/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          consentType: 'ccpa',
          optOut,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setCcpaOptOut(optOut);
        toast.success('CCPA preferences updated');
      } else {
        toast.error('Failed to update preferences');
      }
    } catch (error) {
      console.error('CCPA update error:', error);
      toast.error('Failed to update preferences');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!status) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Failed to load privacy settings</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Compliance Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Privacy & Compliance Status
          </CardTitle>
          <CardDescription>
            Your data protection and privacy compliance status
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Applicable Regulations */}
            <div>
              <h4 className="text-sm font-medium mb-2">Applicable Regulations</h4>
              <div className="space-y-2">
                {status.region.gdpr && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm">GDPR (EU)</span>
                    {status.complianceStatus.gdprCompliant ? (
                      <Badge variant="default" className="bg-green-500">
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        Compliant
                      </Badge>
                    ) : (
                      <Badge variant="destructive">
                        <XCircle className="mr-1 h-3 w-3" />
                        Action Needed
                      </Badge>
                    )}
                  </div>
                )}
                {status.region.ccpa && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm">CCPA (California)</span>
                    {status.complianceStatus.ccpaCompliant ? (
                      <Badge variant="default" className="bg-green-500">
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        Compliant
                      </Badge>
                    ) : (
                      <Badge variant="destructive">
                        <XCircle className="mr-1 h-3 w-3" />
                        Action Needed
                      </Badge>
                    )}
                  </div>
                )}
                {status.region.pipeda && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm">PIPEDA (Canada)</span>
                    {status.complianceStatus.pipedaCompliant ? (
                      <Badge variant="default" className="bg-green-500">
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        Compliant
                      </Badge>
                    ) : (
                      <Badge variant="destructive">
                        <XCircle className="mr-1 h-3 w-3" />
                        Action Needed
                      </Badge>
                    )}
                  </div>
                )}
                {!status.region.gdpr && !status.region.ccpa && !status.region.pipeda && (
                  <p className="text-sm text-muted-foreground">No specific regulations apply</p>
                )}
              </div>
            </div>

            {/* Consent Status */}
            <div>
              <h4 className="text-sm font-medium mb-2">Consent Status</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Terms & Conditions</span>
                  {status.user.acceptedTermsAt ? (
                    <Badge variant="default" className="bg-green-500">
                      <CheckCircle2 className="mr-1 h-3 w-3" />
                      Accepted
                    </Badge>
                  ) : (
                    <Badge variant="secondary">Not Accepted</Badge>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Privacy Policy</span>
                  {status.user.acceptedPrivacyAt ? (
                    <Badge variant="default" className="bg-green-500">
                      <CheckCircle2 className="mr-1 h-3 w-3" />
                      Accepted
                    </Badge>
                  ) : (
                    <Badge variant="secondary">Not Accepted</Badge>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Marketing</span>
                  {status.user.acceptedMarketingAt ? (
                    <Badge variant="default" className="bg-green-500">
                      <CheckCircle2 className="mr-1 h-3 w-3" />
                      Opted In
                    </Badge>
                  ) : (
                    <Badge variant="secondary">Opted Out</Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cookie Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cookie className="h-5 w-5" />
            Cookie Preferences
          </CardTitle>
          <CardDescription>
            Manage your cookie and tracking preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="analytics">Analytics Cookies</Label>
                <p className="text-sm text-muted-foreground">
                  Help us improve our service by collecting usage data
                </p>
              </div>
              <Switch
                id="analytics"
                checked={cookieConsent.analytics}
                onCheckedChange={(checked) =>
                  setCookieConsent({ ...cookieConsent, analytics: checked })
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="marketing">Marketing Cookies</Label>
                <p className="text-sm text-muted-foreground">
                  Used for targeted advertising and promotions
                </p>
              </div>
              <Switch
                id="marketing"
                checked={cookieConsent.marketing}
                onCheckedChange={(checked) =>
                  setCookieConsent({ ...cookieConsent, marketing: checked })
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="functional">Functional Cookies</Label>
                <p className="text-sm text-muted-foreground">
                  Essential for site functionality (always enabled)
                </p>
              </div>
              <Switch
                id="functional"
                checked={cookieConsent.functional}
                disabled
              />
            </div>
          </div>
          <Button onClick={handleUpdateCookies} className="w-full">
            Save Cookie Preferences
          </Button>
        </CardContent>
      </Card>

      {/* CCPA Privacy Rights */}
      {status.region.ccpa && (
        <Card>
          <CardHeader>
            <CardTitle>California Privacy Rights (CCPA)</CardTitle>
            <CardDescription>
              Exercise your rights under the California Consumer Privacy Act
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Do Not Sell My Personal Information</Label>
                <p className="text-sm text-muted-foreground">
                  Opt out of the sale of your personal information
                </p>
              </div>
              <Switch
                checked={ccpaOptOut}
                onCheckedChange={handleUpdateCCPA}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Data Subject Rights */}
      <Card>
        <CardHeader>
          <CardTitle>Your Data Rights</CardTitle>
          <CardDescription>
            Access, export, or delete your personal data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Button
              variant="outline"
              onClick={handleExportData}
              className="w-full"
            >
              <Download className="mr-2 h-4 w-4" />
              Export My Data
            </Button>

            {status.complianceStatus.pendingDeletion ? (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="w-full">
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    Cancel Deletion Request
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Cancel Account Deletion?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Your account is currently scheduled for deletion. Do you want to cancel this request?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>No, Keep Scheduled</AlertDialogCancel>
                    <AlertDialogAction onClick={handleCancelDeletion}>
                      Yes, Cancel Deletion
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            ) : (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="w-full">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete My Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will schedule your account for deletion in 30 days. You can cancel this request during the grace period.
                      All your data will be permanently deleted after the grace period.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleRequestDeletion}>
                      Yes, Delete My Account
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>

          {status.complianceStatus.pendingDeletion && (
            <div className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Account Deletion Scheduled</p>
                  <p className="mt-1 text-sm">
                    Your account will be permanently deleted on{' '}
                    {new Date(status.user.dataDeletionScheduledAt).toLocaleDateString()}.
                    You can cancel this request before that date.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
