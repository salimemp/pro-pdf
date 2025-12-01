
'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Mail, Lock, User, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { PasswordStrengthIndicator, validatePasswordStrength } from "@/components/password-strength-indicator";
import { PasswordGenerator } from "@/components/password-generator";
import { SocialLogin } from "./social-login";

export function SignupForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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

    // Validate password strength
    const passwordValidation = validatePasswordStrength(formData.password);
    if (!passwordValidation.valid) {
      toast.error(passwordValidation.message);
      setIsLoading(false);
      return;
    }

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
            <div className="flex justify-between items-center">
              <Label htmlFor="password" className="text-slate-200">
                Password
              </Label>
              <PasswordGenerator
                onPasswordGenerated={(pwd) => {
                  setFormData({ ...formData, password: pwd, confirmPassword: pwd });
                }}
              />
            </div>
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
            {formData.password && (
              <PasswordStrengthIndicator password={formData.password} />
            )}
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

        {/* Social Login */}
        <SocialLogin />
      </form>
    </div>
  );
}
