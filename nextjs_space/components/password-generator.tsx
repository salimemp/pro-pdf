
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Wand2, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

interface PasswordGeneratorProps {
  onPasswordGenerated: (password: string) => void;
  buttonVariant?: 'default' | 'outline' | 'ghost';
  buttonSize?: 'default' | 'sm' | 'lg';
}

export function PasswordGenerator({ 
  onPasswordGenerated,
  buttonVariant = 'outline',
  buttonSize = 'sm',
}: PasswordGeneratorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [length, setLength] = useState([16]);
  const [options, setOptions] = useState({
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
  });
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [copied, setCopied] = useState(false);

  const generatePassword = () => {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '@$!%*#?&';

    let chars = '';
    let password = '';

    if (options.uppercase) chars += uppercase;
    if (options.lowercase) chars += lowercase;
    if (options.numbers) chars += numbers;
    if (options.symbols) chars += symbols;

    if (chars === '') {
      toast.error('Please select at least one character type');
      return;
    }

    // Ensure at least one character from each selected type
    if (options.uppercase) password += uppercase[Math.floor(Math.random() * uppercase.length)];
    if (options.lowercase) password += lowercase[Math.floor(Math.random() * lowercase.length)];
    if (options.numbers) password += numbers[Math.floor(Math.random() * numbers.length)];
    if (options.symbols) password += symbols[Math.floor(Math.random() * symbols.length)];

    // Fill remaining length with random characters
    for (let i = password.length; i < length[0]; i++) {
      password += chars[Math.floor(Math.random() * chars.length)];
    }

    // Shuffle the password
    password = password.split('').sort(() => Math.random() - 0.5).join('');

    setGeneratedPassword(password);
  };

  const handleUsePassword = () => {
    if (generatedPassword) {
      onPasswordGenerated(generatedPassword);
      toast.success('Password applied!');
      setIsOpen(false);
      setGeneratedPassword('');
    }
  };

  const handleCopy = async () => {
    if (generatedPassword) {
      await navigator.clipboard.writeText(generatedPassword);
      setCopied(true);
      toast.success('Password copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant={buttonVariant} size={buttonSize} type="button">
          <Wand2 className="w-4 h-4 mr-2" />
          Generate Password
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Password Generator</h4>
            <p className="text-sm text-muted-foreground">
              Create a secure password with custom options
            </p>
          </div>

          {/* Password Length */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>Length: {length[0]}</Label>
            </div>
            <Slider
              value={length}
              onValueChange={setLength}
              min={8}
              max={32}
              step={1}
              className="w-full"
            />
          </div>

          {/* Character Options */}
          <div className="space-y-2">
            <Label>Include:</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="uppercase"
                  checked={options.uppercase}
                  onCheckedChange={(checked) =>
                    setOptions({ ...options, uppercase: checked as boolean })
                  }
                />
                <Label htmlFor="uppercase" className="text-sm font-normal cursor-pointer">
                  Uppercase (A-Z)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="lowercase"
                  checked={options.lowercase}
                  onCheckedChange={(checked) =>
                    setOptions({ ...options, lowercase: checked as boolean })
                  }
                />
                <Label htmlFor="lowercase" className="text-sm font-normal cursor-pointer">
                  Lowercase (a-z)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="numbers"
                  checked={options.numbers}
                  onCheckedChange={(checked) =>
                    setOptions({ ...options, numbers: checked as boolean })
                  }
                />
                <Label htmlFor="numbers" className="text-sm font-normal cursor-pointer">
                  Numbers (0-9)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="symbols"
                  checked={options.symbols}
                  onCheckedChange={(checked) =>
                    setOptions({ ...options, symbols: checked as boolean })
                  }
                />
                <Label htmlFor="symbols" className="text-sm font-normal cursor-pointer">
                  Symbols (@$!%*#?&)
                </Label>
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <Button onClick={generatePassword} className="w-full" variant="secondary">
            <Wand2 className="w-4 h-4 mr-2" />
            Generate
          </Button>

          {/* Generated Password */}
          {generatedPassword && (
            <div className="space-y-2">
              <Label>Generated Password</Label>
              <div className="flex gap-2">
                <Input
                  value={generatedPassword}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopy}
                  type="button"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <Button onClick={handleUsePassword} className="w-full">
                Use This Password
              </Button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
