
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <Header />
      
      <main className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50">
          <h1 className="text-3xl font-bold text-white mb-8">Privacy Policy</h1>
          
          <div className="space-y-6 text-slate-300 prose prose-invert max-w-none">
            <section>
              <h2 className="text-xl font-semibold text-white mb-4">1. Information We Collect</h2>
              <p>
                We collect information you provide directly to us, such as when you create an account, 
                upload files, or contact us for support.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">2. How We Use Your Information</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>To provide, operate, and maintain our services</li>
                <li>To process your payments and manage subscriptions</li>
                <li>To communicate with you about our services</li>
                <li>To improve our services and develop new features</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">3. File Storage and Security</h2>
              <p>
                <strong>Guest Users:</strong> Files are processed and immediately deleted. No permanent storage.
              </p>
              <p>
                <strong>Premium Users:</strong> Files are encrypted and stored securely in the cloud. 
                You can manage and delete files through your dashboard at any time.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">4. Data Encryption</h2>
              <p>
                All files and data are encrypted both in transit and at rest using industry-standard encryption protocols.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">5. Third-Party Services</h2>
              <p>
                We use trusted third-party services for:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>Payment processing (Stripe)</li>
                <li>Authentication (Google SSO)</li>
                <li>Cloud storage (AWS S3)</li>
                <li>Analytics (aggregated and anonymized)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">6. Data Retention</h2>
              <p>
                We retain your personal information only for as long as necessary to provide our services. 
                You may request deletion of your account and data at any time.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">7. Your Rights</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>Access to your personal information</li>
                <li>Correction of inaccurate information</li>
                <li>Deletion of your account and data</li>
                <li>Data portability</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">8. Contact Us</h2>
              <p>
                For any privacy-related questions or requests, contact us at privacy@propdf.com
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
