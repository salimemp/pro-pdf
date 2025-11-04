
'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Mail, Lock, User, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function SignupForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
    acceptDataProcessing: false,
    acceptMarketing: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords don't match");
      setIsLoading(false);
      return;
    }

    if (!formData.acceptTerms) {
      toast.error("Please accept the Terms of Service and Privacy Policy");
      setIsLoading(false);
      return;
    }

    if (!formData.acceptDataProcessing) {
      toast.error("Please consent to data processing (required for account creation)");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          acceptTerms: formData.acceptTerms,
          acceptDataProcessing: formData.acceptDataProcessing,
          acceptMarketing: formData.acceptMarketing,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      toast.success("Account created successfully!");
      
      // Automatically sign in the user
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        router.push('/auth/login');
      } else {
        router.replace('/dashboard');
      }
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      await signIn("google", { callbackUrl: '/dashboard' });
    } catch (error) {
      toast.error("Google sign-in failed");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name Fields */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName" className="text-slate-200">
              First Name
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                id="firstName"
                name="firstName"
                type="text"
                placeholder="John"
                value={formData.firstName}
                onChange={handleInputChange}
                className="pl-10 bg-slate-900/50 border-slate-600 text-white placeholder-slate-400"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName" className="text-slate-200">
              Last Name
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                id="lastName"
                name="lastName"
                type="text"
                placeholder="Doe"
                value={formData.lastName}
                onChange={handleInputChange}
                className="pl-10 bg-slate-900/50 border-slate-600 text-white placeholder-slate-400"
                required
              />
            </div>
          </div>
        </div>

        {/* Email Field */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-slate-200">
            Email Address
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="john@example.com"
              value={formData.email}
              onChange={handleInputChange}
              className="pl-10 bg-slate-900/50 border-slate-600 text-white placeholder-slate-400"
              required
            />
          </div>
        </div>

        {/* Password Fields */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password" className="text-slate-200">
              Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a strong password"
                value={formData.password}
                onChange={handleInputChange}
                className="pl-10 pr-10 bg-slate-900/50 border-slate-600 text-white placeholder-slate-400"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-slate-200">
              Confirm Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showPassword ? "text" : "password"}
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="pl-10 bg-slate-900/50 border-slate-600 text-white placeholder-slate-400"
                required
              />
            </div>
          </div>
        </div>

        {/* Consent and Permissions */}
        <div className="space-y-3 p-4 bg-slate-800/30 rounded-lg border border-slate-700">
          <p className="text-sm font-medium text-slate-200">Permissions & Consent (GDPR Compliant)</p>
          
          {/* Terms and Conditions - Required */}
          <div className="flex items-start space-x-2">
            <Checkbox
              id="acceptTerms"
              checked={formData.acceptTerms}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, acceptTerms: checked as boolean })
              }
              className="border-slate-600 mt-1"
            />
            <Label htmlFor="acceptTerms" className="text-sm text-slate-300">
              <span className="text-red-400">*</span> I agree to the{" "}
              <a href="/terms" target="_blank" className="text-blue-400 hover:text-blue-300 underline">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="/privacy" target="_blank" className="text-blue-400 hover:text-blue-300 underline">
                Privacy Policy
              </a>
            </Label>
          </div>

          {/* Data Processing Consent - Required */}
          <div className="flex items-start space-x-2">
            <Checkbox
              id="acceptDataProcessing"
              checked={formData.acceptDataProcessing}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, acceptDataProcessing: checked as boolean })
              }
              className="border-slate-600 mt-1"
            />
            <Label htmlFor="acceptDataProcessing" className="text-sm text-slate-300">
              <span className="text-red-400">*</span> I consent to the processing of my personal data as described in the Privacy Policy. 
              This includes account management, file processing, and service provision. (Required)
            </Label>
          </div>

          {/* Marketing Consent - Optional */}
          <div className="flex items-start space-x-2">
            <Checkbox
              id="acceptMarketing"
              checked={formData.acceptMarketing}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, acceptMarketing: checked as boolean })
              }
              className="border-slate-600 mt-1"
            />
            <Label htmlFor="acceptMarketing" className="text-sm text-slate-300">
              I agree to receive promotional emails, product updates, and special offers. 
              You can unsubscribe anytime. (Optional)
            </Label>
          </div>

          <p className="text-xs text-slate-400 mt-2">
            <span className="text-red-400">*</span> Required for account creation. 
            You can review and modify your consent preferences in Account Settings at any time.
          </p>
        </div>

        {/* Sign Up Button */}
        <Button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating Account...
            </>
          ) : (
            "Create Account"
          )}
        </Button>

        {/* Divider */}
        <div className="relative">
          <Separator className="bg-slate-600" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="bg-slate-800 px-2 text-sm text-slate-400">
              or continue with
            </span>
          </div>
        </div>

        {/* Google Sign In */}
        <Button
          type="button"
          variant="outline"
          className="w-full border-slate-600 hover:bg-slate-700"
          onClick={handleGoogleSignIn}
          disabled={isGoogleLoading}
        >
          {isGoogleLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
