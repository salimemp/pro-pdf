
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Download, Trash2, Shield, Mail, FileCheck, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';

export function PrivacySettings() {
  const router = useRouter();
  const [isLoadingConsent, setIsLoadingConsent] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [acceptMarketing, setAcceptMarketing] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteConfirmation, setDeleteConfirmation] = useState('');

  // Load consent preferences
  useEffect(() => {
    fetchConsentPreferences();
  }, []);

  const fetchConsentPreferences = async () => {
    try {
      const response = await fetch('/api/user/consent');
      if (!response.ok) throw new Error('Failed to load preferences');
      
      const data = await response.json();
      setAcceptMarketing(data.hasAcceptedMarketing);
    } catch (error) {
      console.error('Error loading consent preferences:', error);
      toast.error('Failed to load preferences');
    } finally {
      setIsLoadingConsent(false);
    }
  };

  const handleUpdateConsent = async (acceptMarketing: boolean) => {
    try {
      const response = await fetch('/api/user/consent', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ acceptMarketing }),
      });

      if (!response.ok) throw new Error('Failed to update consent');

      setAcceptMarketing(acceptMarketing);
      toast.success('Preferences updated successfully');
    } catch (error) {
      console.error('Error updating consent:', error);
      toast.error('Failed to update preferences');
    }
  };

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const response = await fetch('/api/user/data-export');
      
      if (!response.ok) throw new Error('Failed to export data');

      // Download the JSON file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `propdf-data-export-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Data exported successfully');
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'DELETE MY ACCOUNT') {
      toast.error('Please type "DELETE MY ACCOUNT" to confirm');
      return;
    }

    if (!deletePassword) {
      toast.error('Please enter your password');
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch('/api/user/delete-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: deletePassword,
          confirmation: deleteConfirmation,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete account');
      }

      toast.success('Account deleted successfully');
      
      // Sign out and redirect to home page
      await signOut({ redirect: false });
      router.push('/');
    } catch (error: any) {
      console.error('Error deleting account:', error);
      toast.error(error.message || 'Failed to delete account');
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Privacy Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Privacy & Data Management
          </CardTitle>
          <CardDescription>
            Manage your privacy settings, data, and account in compliance with GDPR, HIPAA, and PIPEDA regulations.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Consent Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Consent Preferences</CardTitle>
          <CardDescription>
            Manage your consent for data processing and communications.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="marketing-consent" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Marketing Communications
              </Label>
              <p className="text-sm text-muted-foreground">
                Receive promotional emails, product updates, and special offers.
              </p>
            </div>
            <Switch
              id="marketing-consent"
              checked={acceptMarketing}
              onCheckedChange={handleUpdateConsent}
              disabled={isLoadingConsent}
            />
          </div>

          <Separator />

          <div className="flex items-start gap-2 p-3 bg-muted rounded-lg">
            <FileCheck className="h-5 w-5 text-green-500 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium">Essential Data Processing (Always Active)</p>
              <p className="text-muted-foreground">
                Required for account management, authentication, and service provision. 
                This consent cannot be withdrawn while maintaining an active account.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Export (GDPR Right to Data Portability) */}
      <Card>
        <CardHeader>
          <CardTitle>Export Your Data</CardTitle>
          <CardDescription>
            Download a copy of all your personal data in JSON format (GDPR Article 20).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            This export includes your account information, settings, upload history, scheduled jobs, 
            and consent records. Files stored in cloud storage are not included but can be accessed 
            from your Dashboard.
          </p>
          <Button
            onClick={handleExportData}
            disabled={isExporting}
            className="w-full sm:w-auto"
          >
            {isExporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Download My Data
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Account Deletion (GDPR Right to Erasure) */}
      <Card className="border-red-500/50">
        <CardHeader>
          <CardTitle className="text-red-500">Delete Account</CardTitle>
          <CardDescription>
            Permanently delete your account and all associated data (GDPR Article 17 - Right to Erasure).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
            <p className="text-sm font-medium text-red-500 mb-2">Warning: This action is irreversible</p>
            <p className="text-sm text-muted-foreground">
              Deleting your account will permanently remove:
            </p>
            <ul className="list-disc list-inside text-sm text-muted-foreground mt-2 space-y-1">
              <li>All personal information and account data</li>
              <li>All files stored in cloud storage</li>
              <li>All upload history and sessions</li>
              <li>All scheduled jobs and configurations</li>
              <li>Your subscription (if applicable)</li>
            </ul>
            <p className="text-sm text-muted-foreground mt-3">
              Some anonymized analytics data may be retained for legal compliance purposes.
            </p>
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full sm:w-auto">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete My Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="max-w-md">
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your account 
                  and remove all your data from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="delete-password">Enter your password</Label>
                  <Input
                    id="delete-password"
                    type="password"
                    placeholder="Password"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="delete-confirmation">
                    Type <strong>DELETE MY ACCOUNT</strong> to confirm
                  </Label>
                  <Input
                    id="delete-confirmation"
                    type="text"
                    placeholder="DELETE MY ACCOUNT"
                    value={deleteConfirmation}
                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                  />
                </div>
              </div>

              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => {
                  setDeletePassword('');
                  setDeleteConfirmation('');
                }}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                  className="bg-red-500 hover:bg-red-600"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    'Delete Account'
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>

      {/* Privacy Information */}
      <Card>
        <CardHeader>
          <CardTitle>Your Privacy Rights</CardTitle>
          <CardDescription>
            Learn about your data protection rights under GDPR, HIPAA, and PIPEDA.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>You have the following rights:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li><strong>Right to Access:</strong> Request access to your personal data</li>
              <li><strong>Right to Rectification:</strong> Correct inaccurate or incomplete data</li>
              <li><strong>Right to Erasure:</strong> Request deletion of your personal data</li>
              <li><strong>Right to Data Portability:</strong> Receive your data in a machine-readable format</li>
              <li><strong>Right to Object:</strong> Object to certain types of data processing</li>
              <li><strong>Right to Withdraw Consent:</strong> Withdraw consent at any time</li>
            </ul>
            <p className="mt-4">
              For questions about your privacy rights or to exercise any of these rights, 
              contact us at <a href="mailto:privacy@propdf.com" className="text-primary hover:underline">privacy@propdf.com</a>
            </p>
            <p>
              View our full{' '}
              <a href="/privacy" target="_blank" className="text-primary hover:underline">Privacy Policy</a>
              {' '}and{' '}
              <a href="/terms" target="_blank" className="text-primary hover:underline">Terms of Service</a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
