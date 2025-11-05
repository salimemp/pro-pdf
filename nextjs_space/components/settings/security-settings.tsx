
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
import { Shield, Smartphone, Key, Monitor, AlertCircle, CheckCircle2, X, Activity, MapPin, Clock, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { PasswordStrengthIndicator, validatePasswordStrength } from '@/components/password-strength-indicator';
import { PasswordGenerator } from '@/components/password-generator';

interface Session {
  id: string;
  ipAddress?: string;
  userAgent?: string;
  deviceType?: string;
  lastActivity: string;
  createdAt: string;
  expires: string;
}

interface SecurityLog {
  id: string;
  eventType: string;
  description: string;
  ipAddress?: string;
  location?: string;
  deviceType?: string;
  success: boolean;
  createdAt: string;
}

export function SecuritySettings() {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [securityLogs, setSecurityLogs] = useState<SecurityLog[]>([]);
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

  // Password change state
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    loadSecuritySettings();
    loadSessions();
    loadSecurityLogs();
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

  const loadSecurityLogs = async () => {
    try {
      const res = await fetch('/api/security/logs?limit=20');
      if (res.ok) {
        const data = await res.json();
        setSecurityLogs(data.logs || []);
      }
    } catch (error) {
      console.error('Failed to load security logs:', error);
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

  const handleChangePassword = async () => {
    const { currentPassword, newPassword, confirmPassword } = passwordData;

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('All fields are required');
      return;
    }

    // Validate new password strength
    const passwordValidation = validatePasswordStrength(newPassword);
    if (!passwordValidation.valid) {
      toast.error(passwordValidation.message);
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      
      if (res.ok) {
        toast.success('Password changed successfully! A confirmation email has been sent.');
        setShowChangePassword(false);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        loadSecurityLogs(); // Reload logs to show password change event
      } else {
        const error = await res.json();
        toast.error(error.error || 'Failed to change password');
      }
    } catch (error) {
      toast.error('Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const getDeviceInfo = (session: Session) => {
    const ua = session.userAgent || '';
    if (ua.includes('Mobile')) return { icon: Smartphone, type: 'Mobile' };
    return { icon: Monitor, type: 'Desktop' };
  };

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'login':
      case 'signup':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'failed_login':
        return <X className="h-4 w-4 text-red-500" />;
      case 'suspicious_login':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'password_change':
        return <Key className="h-4 w-4 text-blue-500" />;
      case '2fa_enabled':
      case '2fa_disabled':
        return <Shield className="h-4 w-4 text-purple-500" />;
      case 'session_revoked':
        return <X className="h-4 w-4 text-orange-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getEventBadgeColor = (eventType: string) => {
    switch (eventType) {
      case 'login':
      case 'signup':
        return 'bg-green-500/10 text-green-500';
      case 'failed_login':
        return 'bg-red-500/10 text-red-500';
      case 'suspicious_login':
        return 'bg-yellow-500/10 text-yellow-500';
      case 'password_change':
        return 'bg-blue-500/10 text-blue-500';
      case '2fa_enabled':
      case '2fa_disabled':
        return 'bg-purple-500/10 text-purple-500';
      default:
        return 'bg-gray-500/10 text-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="password" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="password">Password</TabsTrigger>
          <TabsTrigger value="activity">Activity Log</TabsTrigger>
          <TabsTrigger value="2fa">2FA</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
        </TabsList>

        {/* Password Tab */}
        <TabsContent value="password" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Change Password
              </CardTitle>
              <CardDescription>
                Update your password to keep your account secure
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={() => setShowChangePassword(true)}>
                Change Password
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Log Tab */}
        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Security Activity Log
              </CardTitle>
              <CardDescription>
                Recent security events and account activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {securityLogs.length > 0 ? (
                  securityLogs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="mt-1">{getEventIcon(log.eventType)}</div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className={getEventBadgeColor(log.eventType)}>
                            {log.eventType.replace('_', ' ').toUpperCase()}
                          </Badge>
                          {!log.success && (
                            <Badge variant="destructive" className="text-xs">
                              FAILED
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm">{log.description}</p>
                        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                          {log.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {log.location}
                            </span>
                          )}
                          {log.ipAddress && (
                            <span className="flex items-center gap-1">
                              <Monitor className="h-3 w-3" />
                              {log.ipAddress}
                            </span>
                          )}
                          {log.deviceType && (
                            <span className="capitalize">{log.deviceType}</span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(log.createdAt).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    No activity logs found
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

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

      {/* Change Password Dialog */}
      <Dialog open={showChangePassword} onOpenChange={setShowChangePassword}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Enter your current password and choose a new strong password
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Current Password</Label>
              <div className="relative">
                <Input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, currentPassword: e.target.value })
                  }
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showCurrentPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>New Password</Label>
                <PasswordGenerator
                  onPasswordGenerated={(pwd) => {
                    setPasswordData({ ...passwordData, newPassword: pwd, confirmPassword: pwd });
                  }}
                  buttonVariant="ghost"
                  buttonSize="sm"
                />
              </div>
              <div className="relative">
                <Input
                  type={showNewPassword ? 'text' : 'password'}
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, newPassword: e.target.value })
                  }
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showNewPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {passwordData.newPassword && (
                <PasswordStrengthIndicator password={passwordData.newPassword} />
              )}
            </div>

            <div className="space-y-2">
              <Label>Confirm New Password</Label>
              <Input
                type={showNewPassword ? 'text' : 'password'}
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                }
                placeholder="Confirm new password"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowChangePassword(false);
                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleChangePassword} disabled={loading}>
              {loading ? 'Changing...' : 'Change Password'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
