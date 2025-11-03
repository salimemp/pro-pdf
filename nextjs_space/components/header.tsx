
'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { FileText, Menu, X, User, LogOut, Settings, Clock, Shield } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { EncryptionManager } from "@/components/encryption-manager";
import { retrieveKeyFromBrowser } from "@/lib/encryption";

export function Header() {
  const { data: session, status } = useSession() || {};
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showEncryptionManager, setShowEncryptionManager] = useState(false);
  const [hasEncryptionKey, setHasEncryptionKey] = useState(false);

  useEffect(() => {
    checkForEncryptionKey();
  }, []);

  const checkForEncryptionKey = async () => {
    const keyId = localStorage.getItem('current_encryption_key_id');
    if (keyId) {
      const key = await retrieveKeyFromBrowser(keyId);
      if (key) {
        setHasEncryptionKey(true);
      }
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-slate-950/80 backdrop-blur-lg border-b border-slate-800">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="relative">
              <FileText className="h-8 w-8 text-blue-500" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-400 rounded-full animate-pulse" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              PRO PDF
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <nav className="flex items-center space-x-6">
              <Link href="/#features" className="text-slate-300 hover:text-blue-400 transition-colors">
                Features
              </Link>
              <Link href="/#pricing" className="text-slate-300 hover:text-blue-400 transition-colors">
                Pricing
              </Link>
              {session && (
                <>
                  <Link href="/dashboard" className="text-slate-300 hover:text-blue-400 transition-colors">
                    Dashboard
                  </Link>
                  <Link href="/jobs" className="text-slate-300 hover:text-blue-400 transition-colors">
                    Jobs
                  </Link>
                </>
              )}
            </nav>

            {/* User Actions */}
            <div className="flex items-center space-x-4">
              {/* Encryption Toggle */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowEncryptionManager(true)}
                      className="relative"
                    >
                      <Shield className={hasEncryptionKey ? "h-5 w-5 text-blue-400" : "h-5 w-5 text-slate-400"} />
                      {hasEncryptionKey && (
                        <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{hasEncryptionKey ? 'Encryption Active' : 'Enable Encryption'}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {status === "loading" ? (
                <div className="w-8 h-8 bg-slate-800 rounded-full animate-pulse" />
              ) : session ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={session.user?.image || ""} alt={session.user?.name || ""} />
                        <AvatarFallback className="bg-blue-600">
                          {session.user?.name?.charAt(0)?.toUpperCase() || <User className="h-4 w-4" />}
                        </AvatarFallback>
                      </Avatar>
                      {(session.user as any)?.isPremium && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full" />
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end">
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium">{session.user?.name}</p>
                        <p className="w-[200px] truncate text-sm text-muted-foreground">
                          {session.user?.email}
                        </p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/jobs" className="flex items-center">
                        <Clock className="mr-2 h-4 w-4" />
                        Jobs Queue
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings" className="flex items-center">
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950"
                      onClick={() => signOut({ callbackUrl: '/' })}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center space-x-3">
                  <Button variant="ghost" asChild>
                    <Link href="/auth/login">Sign In</Link>
                  </Button>
                  <Button className="bg-blue-600 hover:bg-blue-700" asChild>
                    <Link href="/auth/signup">Get Started</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-slate-900/50 rounded-lg mt-2">
              <Link
                href="/#features"
                className="block px-3 py-2 text-slate-300 hover:text-blue-400 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </Link>
              <Link
                href="/#pricing"
                className="block px-3 py-2 text-slate-300 hover:text-blue-400 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Pricing
              </Link>
              {session && (
                <>
                  <Link
                    href="/dashboard"
                    className="block px-3 py-2 text-slate-300 hover:text-blue-400 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/jobs"
                    className="block px-3 py-2 text-slate-300 hover:text-blue-400 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Jobs
                  </Link>
                </>
              )}
              {!session && (
                <div className="flex flex-col space-y-2 px-3 pt-2">
                  <Button variant="ghost" asChild>
                    <Link href="/auth/login">Sign In</Link>
                  </Button>
                  <Button className="bg-blue-600 hover:bg-blue-700" asChild>
                    <Link href="/auth/signup">Get Started</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Encryption Manager Dialog */}
      <EncryptionManager
        open={showEncryptionManager}
        onOpenChange={setShowEncryptionManager}
        onKeyReady={() => {
          setHasEncryptionKey(true);
          checkForEncryptionKey();
        }}
      />
    </header>
  );
}
