
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { AdPlaceholder } from "@/components/ad-placeholder";
import { Shield, Zap, Users, Award } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <Header />
      
      <main className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="space-y-8">
          {/* Top Ad */}
          <AdPlaceholder variant="banner" />
          
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              About PRO PDF
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Professional PDF tools designed for modern workflows with enterprise-grade security and performance.
            </p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50">
            <div className="space-y-6 text-slate-300">
              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">Our Mission</h2>
                <p>
                  We believe working with PDFs shouldn't be complicated or compromise your privacy. 
                  PRO PDF provides powerful, secure tools that respect your data while delivering professional results.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">Why Choose PRO PDF?</h2>
                <div className="grid md:grid-cols-2 gap-6 mt-6">
                  <div className="flex items-start space-x-3">
                    <Shield className="w-6 h-6 text-green-400 mt-1" />
                    <div>
                      <h3 className="font-semibold text-white mb-1">Security First</h3>
                      <p className="text-sm">Bank-grade encryption and automatic file deletion for guest users</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Zap className="w-6 h-6 text-yellow-400 mt-1" />
                    <div>
                      <h3 className="font-semibold text-white mb-1">Lightning Fast</h3>
                      <p className="text-sm">Optimized servers process files in seconds, not minutes</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Users className="w-6 h-6 text-blue-400 mt-1" />
                    <div>
                      <h3 className="font-semibold text-white mb-1">User-Centric</h3>
                      <p className="text-sm">Designed based on real user feedback and workflows</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Award className="w-6 h-6 text-purple-400 mt-1" />
                    <div>
                      <h3 className="font-semibold text-white mb-1">Professional Quality</h3>
                      <p className="text-sm">Enterprise-grade tools accessible to everyone</p>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">Our Commitment</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-white mb-2">Privacy by Design</h3>
                    <p>
                      Your files are your business. We process them securely and delete them immediately for guest users. 
                      Premium users have full control over their stored files.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-2">Continuous Innovation</h3>
                    <p>
                      We're constantly improving our tools and adding new features based on user feedback and emerging needs.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-2">Transparent Pricing</h3>
                    <p>
                      No hidden fees, no surprise charges. Try our tools for free, upgrade when you need more power.
                    </p>
                  </div>
                </div>
              </section>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50 text-center">
            <h2 className="text-2xl font-semibold text-white mb-4">Get Started Today</h2>
            <p className="text-slate-300 mb-6">
              Join thousands of professionals who trust PRO PDF for their document workflows.
            </p>
            <div className="flex justify-center space-x-4">
              <a 
                href="/auth/signup"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Start Free Trial
              </a>
              <a 
                href="/contact"
                className="border border-slate-600 hover:bg-slate-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Contact Us
              </a>
            </div>
          </div>
          
          {/* Bottom Ad */}
          <AdPlaceholder variant="rectangle" />
        </div>
      </main>

      <Footer />
    </div>
  );
}
