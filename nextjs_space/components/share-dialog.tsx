
'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Share2, Copy, Check, Calendar, Lock, Eye, Download as DownloadIcon } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ShareDialogProps {
  fileName: string;
  fileUrl?: string;
  trigger?: React.ReactNode;
}

export function ShareDialog({ fileName, fileUrl, trigger }: ShareDialogProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareSettings, setShareSettings] = useState({
    allowDownload: true,
    allowView: true,
    requirePassword: false,
    password: '',
    expiresIn: '7days',
  });

  // Generate a shareable link (in production, this would be from your backend)
  const shareableLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/share/${btoa(fileName).slice(0, 16)}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareableLink);
      setCopied(true);
      toast.success('Link copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const handleGenerateLink = () => {
    // In production, this would make an API call to generate a secure shareable link
    toast.success('Shareable link generated successfully');
  };

  const expirationOptions = [
    { value: '1hour', label: '1 Hour' },
    { value: '24hours', label: '24 Hours' },
    { value: '7days', label: '7 Days' },
    { value: '30days', label: '30 Days' },
    { value: 'never', label: 'Never Expires' },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="border-slate-600 hover:bg-slate-700">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl">Share Document</DialogTitle>
          <DialogDescription className="text-slate-400">
            Create a secure shareable link for "{fileName}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Shareable Link */}
          <div className="space-y-2">
            <Label className="text-slate-200">Shareable Link</Label>
            <div className="flex gap-2">
              <Input
                value={shareableLink}
                readOnly
                className="bg-slate-800 border-slate-600 text-slate-300 font-mono text-sm"
              />
              <Button
                type="button"
                onClick={handleCopyLink}
                className={cn(
                  "flex-shrink-0",
                  copied ? "bg-green-600 hover:bg-green-700" : "bg-purple-600 hover:bg-purple-700"
                )}
              >
                {copied ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Permissions */}
          <div className="space-y-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
            <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Document Control
            </h4>

            <div className="space-y-3">
              {/* Allow View */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-slate-400" />
                  <Label htmlFor="allowView" className="text-sm text-slate-300 cursor-pointer">
                    Allow viewing
                  </Label>
                </div>
                <Switch
                  id="allowView"
                  checked={shareSettings.allowView}
                  onCheckedChange={(checked) =>
                    setShareSettings({ ...shareSettings, allowView: checked })
                  }
                />
              </div>

              {/* Allow Download */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DownloadIcon className="w-4 h-4 text-slate-400" />
                  <Label htmlFor="allowDownload" className="text-sm text-slate-300 cursor-pointer">
                    Allow downloading
                  </Label>
                </div>
                <Switch
                  id="allowDownload"
                  checked={shareSettings.allowDownload}
                  onCheckedChange={(checked) =>
                    setShareSettings({ ...shareSettings, allowDownload: checked })
                  }
                />
              </div>

              {/* Password Protection */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-slate-400" />
                  <Label htmlFor="requirePassword" className="text-sm text-slate-300 cursor-pointer">
                    Password protection
                  </Label>
                </div>
                <Switch
                  id="requirePassword"
                  checked={shareSettings.requirePassword}
                  onCheckedChange={(checked) =>
                    setShareSettings({ ...shareSettings, requirePassword: checked })
                  }
                />
              </div>

              {shareSettings.requirePassword && (
                <Input
                  type="password"
                  placeholder="Enter password"
                  value={shareSettings.password}
                  onChange={(e) =>
                    setShareSettings({ ...shareSettings, password: e.target.value })
                  }
                  className="bg-slate-900 border-slate-600 text-white placeholder:text-slate-500"
                />
              )}
            </div>
          </div>

          {/* Expiration */}
          <div className="space-y-2">
            <Label className="text-slate-200 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Link Expiration
            </Label>
            <Select
              value={shareSettings.expiresIn}
              onValueChange={(value) =>
                setShareSettings({ ...shareSettings, expiresIn: value })
              }
            >
              <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                {expirationOptions.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    className="text-white focus:bg-slate-700"
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1 border-slate-600 hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleGenerateLink}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              Generate Link
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
