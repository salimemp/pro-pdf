
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <Header />
      
      <main className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50">
          <h1 className="text-3xl font-bold text-white mb-8">Terms of Service</h1>
          
          <div className="space-y-6 text-slate-300 prose prose-invert max-w-none">
            <section>
              <h2 className="text-xl font-semibold text-white mb-4">1. Acceptance of Terms</h2>
              <p>
                By accessing and using PRO PDF, you accept and agree to be bound by the terms and provision of this agreement.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">2. Service Description</h2>
              <p>
                PRO PDF provides online PDF conversion, editing, and management tools. We offer both free guest access and premium subscription services.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">3. User Accounts</h2>
              <p>
                When you create an account with us, you must provide information that is accurate, complete, and current at all times.
                You are responsible for safeguarding the password and for any activities that occur under your account.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">4. Privacy and Data Security</h2>
              <p>
                We take your privacy seriously. Guest files are automatically deleted after processing. 
                Premium users' files are stored securely with encryption and can be managed through their dashboard.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">5. Subscription Terms</h2>
              <p>
                Premium subscriptions are billed monthly or annually. You may cancel your subscription at any time. 
                Refunds are available within 30 days of purchase.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">6. File Usage and Restrictions</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>Guest users: Maximum 10MB per file</li>
                <li>Premium users: Maximum 1GB per file</li>
                <li>Do not upload copyrighted material without permission</li>
                <li>Do not upload malicious or harmful content</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">7. Service Availability</h2>
              <p>
                We strive to maintain 99.9% uptime but do not guarantee uninterrupted service. 
                Scheduled maintenance will be announced in advance when possible.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">8. Contact Information</h2>
              <p>
                If you have any questions about these Terms of Service, please contact us at support@propdf.com
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
