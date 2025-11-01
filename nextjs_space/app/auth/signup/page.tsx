
import { SignupForm } from "@/components/auth/signup-form";
import { Header } from "@/components/header";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <Header />
      <div className="container mx-auto max-w-md px-4 py-12">
        <div className="mb-8">
          <Link 
            href="/"
            className="inline-flex items-center text-slate-400 hover:text-blue-400 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">Get Started</h1>
          <p className="text-slate-400">
            Create your account and unlock premium PDF tools
          </p>
        </div>
        
        <SignupForm />
        
        <div className="mt-6 text-center">
          <p className="text-slate-400">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-blue-400 hover:text-blue-300">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
