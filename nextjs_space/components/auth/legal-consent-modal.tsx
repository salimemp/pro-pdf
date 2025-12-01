'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, Shield, CheckCircle, XCircle } from 'lucide-react';

interface LegalConsentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
  onDecline: () => void;
}

export function LegalConsentModal({
  isOpen,
  onClose,
  onAccept,
  onDecline,
}: LegalConsentModalProps) {
  const [activeTab, setActiveTab] = useState('terms');

  const handleAccept = () => {
    onAccept();
    onClose();
  };

  const handleDecline = () => {
    onDecline();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] bg-slate-800 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
            <FileText className="h-6 w-6 text-blue-400" />
            Legal Documents
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Please review our Terms of Service and Privacy Policy before creating your account.
            You must accept these documents to continue.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-slate-900">
            <TabsTrigger value="terms" className="data-[state=active]:bg-slate-700">
              Terms of Service
            </TabsTrigger>
            <TabsTrigger value="privacy" className="data-[state=active]:bg-slate-700">
              Privacy Policy
            </TabsTrigger>
          </TabsList>

          <TabsContent value="terms" className="mt-4">
            <ScrollArea className="h-[50vh] rounded-lg border border-slate-700 bg-slate-900/50 p-6">
              <div className="space-y-6 text-slate-300 text-sm">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Terms of Service Summary</h3>
                  <p className="text-slate-400 mb-4">
                    Last Updated: November 4, 2025
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-white mb-2">Key Points:</h4>
                    <ul className="list-disc list-inside space-y-2 text-slate-300">
                      <li>You must be at least 16 years old to use PRO PDF</li>
                      <li>You are responsible for keeping your account secure</li>
                      <li>Use the service lawfully and respect intellectual property rights</li>
                      <li>Free users have file size and processing limits</li>
                      <li>Premium subscriptions ($5.99/month) offer unlimited processing</li>
                      <li>We may suspend accounts for violations of these terms</li>
                      <li>We process your files client-side for maximum privacy</li>
                      <li>Guest files are not stored; premium users can optionally store files</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-blue-900/20 rounded-lg border border-blue-700/30">
                    <p className="text-sm text-blue-200">
                      <strong>📄 Full Document:</strong> The complete Terms of Service document contains
                      detailed information about account usage, subscriptions, prohibited activities,
                      intellectual property rights, and legal disclaimers.
                    </p>
                    <Button
                      variant="link"
                      className="text-blue-400 hover:text-blue-300 p-0 h-auto mt-2"
                      onClick={() => window.open('/terms', '_blank')}
                    >
                      Read Full Terms of Service →
                    </Button>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="privacy" className="mt-4">
            <ScrollArea className="h-[50vh] rounded-lg border border-slate-700 bg-slate-900/50 p-6">
              <div className="space-y-6 text-slate-300 text-sm">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Privacy Policy Summary</h3>
                  <p className="text-slate-400 mb-4">
                    Last Updated: November 4, 2025
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-white mb-2">How We Protect Your Privacy:</h4>
                    <ul className="list-disc list-inside space-y-2 text-slate-300">
                      <li><strong>Client-Side Processing:</strong> Your files never leave your device during processing</li>
                      <li><strong>No Content Access:</strong> We never read or analyze the content of your files</li>
                      <li><strong>Encrypted Storage:</strong> Premium files stored with AES-256 encryption</li>
                      <li><strong>HTTPS/TLS:</strong> All data transmission is encrypted</li>
                      <li><strong>Guest Privacy:</strong> No account required; no data stored for guests</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-white mb-2 mt-4">Data We Collect:</h4>
                    <ul className="list-disc list-inside space-y-2 text-slate-300">
                      <li>Email address and name (for account creation)</li>
                      <li>Usage information (pages visited, features used)</li>
                      <li>File metadata (name, size, date) - not file contents</li>
                      <li>Payment information (processed securely through Stripe)</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-white mb-2 mt-4">Your Rights:</h4>
                    <ul className="list-disc list-inside space-y-2 text-slate-300">
                      <li><strong>GDPR (EU):</strong> Right to access, rectify, erase, and port your data</li>
                      <li><strong>CCPA (California):</strong> Right to know and delete your information</li>
                      <li><strong>PIPEDA (Canada):</strong> Right to access and challenge your data</li>
                      <li><strong>HIPAA:</strong> Client-side processing ensures PHI protection</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-green-900/20 rounded-lg border border-green-700/30">
                    <p className="text-sm text-green-200">
                      <strong>🔒 Privacy First:</strong> We are committed to GDPR, CCPA, PIPEDA, and HIPAA
                      compliance. You have full control over your data and can export or delete it at any time.
                    </p>
                    <Button
                      variant="link"
                      className="text-green-400 hover:text-green-300 p-0 h-auto mt-2"
                      onClick={() => window.open('/privacy', '_blank')}
                    >
                      Read Full Privacy Policy →
                    </Button>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleDecline}
            className="w-full sm:w-auto border-red-700 text-red-400 hover:bg-red-900/20 hover:text-red-300"
          >
            <XCircle className="mr-2 h-4 w-4" />
            Decline
          </Button>
          <Button
            onClick={handleAccept}
            className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white"
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            I Accept
          </Button>
        </DialogFooter>

        <p className="text-xs text-slate-500 text-center mt-2">
          By clicking "I Accept", you agree to our Terms of Service and Privacy Policy
        </p>
      </DialogContent>
    </Dialog>
  );
}
