
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Shield, Smartphone, Key, Monitor, AlertCircle, CheckCircle2, X } from 'lucide-react';
import { toast } from 'sonner';

interface Session {
  id: string;
  ipAddress?: string;
  userAgent?: string;
  deviceType?: string;
  lastActivity: string;
  createdAt: string;
  expires: string;
}

export function SecuritySettings() {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(false);
  
  // 2FA setup state
  const [showSetup2FA, setShowSetup2FA] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verificationToken, setVerificationToken] = useState('');
  const [setupStep, setSetupStep] = useState<'qr' | 'verify' | 'backup'>('qr');
  
  // 2FA disable state
  const [showDisable2FA, setShowDisable2FA] = useState(false);
  const [disablePassword, setDisablePassword] = useState('');

  useEffect(() => {
    loadSecuritySettings();
    loadSessions();
  }, []);

  const loadSecuritySettings = async () => {
    try {
      const res = await fetch('/api/user/stats');
      if (res.ok) {
        const data = await res.json();
        setTwoFactorEnabled(data.twoFactorEnabled || false);
      }
    } catch (error) {
      console.error('Failed to load security settings:', error);
    }
  };

  const loadSessions = async () => {
    try {
      const res = await fetch('/api/sessions');
      if (res.ok) {
        const data = await res.json();
        setSessions(data.sessions || []);
      }
    } catch (error) {
      console.error('Failed to load sessions:', error);
    }
  };

  const handleSetup2FA = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/2fa/setup', {
        method: 'POST',
      });
      
      if (res.ok) {
        const data = await res.json();
        setQrCode(data.qrCode);
        setSecret(data.secret);
        setBackupCodes(data.backupCodes);
        setShowSetup2FA(true);
        setSetupStep('qr');
      } else {
        const error = await res.json();
        toast.error(error.error || 'Failed to setup 2FA');
      }
    } catch (error) {
      toast.error('Failed to setup 2FA');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2FA = async () => {
    if (!verificationToken) {
      toast.error('Please enter a verification code');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: verificationToken }),
      });
      
      if (res.ok) {
        setSetupStep('backup');
        setTwoFactorEnabled(true);
        toast.success('2FA enabled successfully!');
      } else {
        const error = await res.json();
        toast.error(error.error || 'Invalid verification code');
      }
    } catch (error) {
      toast.error('Failed to verify 2FA');
    } finally {
      setLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    if (!disablePassword) {
      toast.error('Please enter your password');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/2fa/disable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: disablePassword }),
      });
      
      if (res.ok) {
        setTwoFactorEnabled(false);
        setShowDisable2FA(false);
        setDisablePassword('');
        toast.success('2FA disabled successfully');
      } else {
        const error = await res.json();
        toast.error(error.error || 'Failed to disable 2FA');
      }
    } catch (error) {
      toast.error('Failed to disable 2FA');
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    if (!confirm('Are you sure you want to revoke this session?')) {
      return;
    }

    try {
      const res = await fetch('/api/sessions', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });
      
      if (res.ok) {
        toast.success('Session revoked successfully');
        loadSessions();
      } else {
        toast.error('Failed to revoke session');
      }
    } catch (error) {
      toast.error('Failed to revoke session');
    }
  };

  const handleRevokeAllSessions = async () => {
    if (!confirm('Are you sure you want to log out of all other devices?')) {
      return;
    }

    try {
      const res = await fetch('/api/sessions', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ all: true }),
      });
      
      if (res.ok) {
        toast.success('All other sessions have been revoked');
        loadSessions();
      } else {
        toast.error('Failed to revoke sessions');
      }
    } catch (error) {
      toast.error('Failed to revoke sessions');
    }
  };

  const getDeviceInfo = (session: Session) => {
    const ua = session.userAgent || '';
    if (ua.includes('Mobile')) return { icon: Smartphone, type: 'Mobile' };
    return { icon: Monitor, type: 'Desktop' };
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="2fa" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="2fa">Two-Factor Authentication</TabsTrigger>
          <TabsTrigger value="sessions">Active Sessions</TabsTrigger>
        </TabsList>

        <TabsContent value="2fa" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Two-Factor Authentication
                  </CardTitle>
                  <CardDescription>
                    Add an extra layer of security to your account
                  </CardDescription>
                </div>
                {twoFactorEnabled && (
                  <Badge variant="default" className="gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Enabled
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {!twoFactorEnabled ? (
                <>
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Two-factor authentication adds an additional layer of security to your account by requiring
                      a code from your phone in addition to your password.
                    </AlertDescription>
                  </Alert>
                  <Button onClick={handleSetup2FA} disabled={loading}>
                    <Smartphone className="mr-2 h-4 w-4" />
                    Enable 2FA
                  </Button>
                </>
              ) : (
                <div className="space-y-4">
                  <Alert>
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertDescription>
                      Your account is protected with two-factor authentication.
                    </AlertDescription>
                  </Alert>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setShowDisable2FA(true)}>
                      Disable 2FA
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Monitor className="h-5 w-5" />
                    Active Sessions
                  </CardTitle>
                  <CardDescription>
                    Manage your active sessions across all devices
                  </CardDescription>
                </div>
                {sessions.length > 1 && (
                  <Button variant="outline" size="sm" onClick={handleRevokeAllSessions}>
                    Revoke All Other Sessions
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sessions.map((session) => {
                  const { icon: DeviceIcon, type } = getDeviceInfo(session);
                  return (
                    <div
                      key={session.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-start gap-4">
                        <DeviceIcon className="h-5 w-5 mt-1 text-muted-foreground" />
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{type}</p>
                            <Badge variant="secondary" className="text-xs">Current</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {session.ipAddress || 'Unknown location'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Last active: {new Date(session.lastActivity).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRevokeSession(session.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  );
                })}
                {sessions.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No active sessions found
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 2FA Setup Dialog */}
      <Dialog open={showSetup2FA} onOpenChange={setShowSetup2FA}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Enable Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              {setupStep === 'qr' && 'Scan the QR code with your authenticator app'}
              {setupStep === 'verify' && 'Enter the code from your authenticator app'}
              {setupStep === 'backup' && 'Save your backup codes'}
            </DialogDescription>
          </DialogHeader>

          {setupStep === 'qr' && (
            <div className="space-y-4">
              {qrCode && (
                <div className="flex justify-center">
                  <img src={qrCode} alt="QR Code" className="w-64 h-64" />
                </div>
              )}
              <div>
                <Label>Or enter this code manually:</Label>
                <Input value={secret} readOnly className="font-mono text-xs mt-2" />
              </div>
              <Button onClick={() => setSetupStep('verify')} className="w-full">
                Next
              </Button>
            </div>
          )}

          {setupStep === 'verify' && (
            <div className="space-y-4">
              <div>
                <Label>Verification Code</Label>
                <Input
                  placeholder="Enter 6-digit code"
                  value={verificationToken}
                  onChange={(e) => setVerificationToken(e.target.value)}
                  maxLength={6}
                  className="font-mono text-center text-lg"
                />
              </div>
              <Button onClick={handleVerify2FA} disabled={loading} className="w-full">
                Verify & Enable 2FA
              </Button>
            </div>
          )}

          {setupStep === 'backup' && (
            <div className="space-y-4">
              <Alert>
                <Key className="h-4 w-4" />
                <AlertDescription>
                  Save these backup codes in a safe place. You can use them to access your account if you lose
                  your device.
                </AlertDescription>
              </Alert>
              <div className="grid grid-cols-2 gap-2 font-mono text-sm p-4 bg-muted rounded-lg">
                {backupCodes.map((code, index) => (
                  <div key={index} className="text-center">
                    {code}
                  </div>
                ))}
              </div>
              <Button onClick={() => setShowSetup2FA(false)} className="w-full">
                Done
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Disable 2FA Dialog */}
      <Dialog open={showDisable2FA} onOpenChange={setShowDisable2FA}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Disable Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              Enter your password to disable 2FA
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Password</Label>
              <Input
                type="password"
                value={disablePassword}
                onChange={(e) => setDisablePassword(e.target.value)}
                placeholder="Enter your password"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDisable2FA(false)}>
              Cancel
            </Button>
            <Button onClick={handleDisable2FA} disabled={loading}>
              Disable 2FA
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
