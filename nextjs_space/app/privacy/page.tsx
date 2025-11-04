
import { Header } from "@/components/header";
import { AdPlaceholder } from "@/components/ad-placeholder";
import { Footer } from "@/components/footer";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <Header />
      
      <main className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="space-y-8">
          {/* Top Ad */}
          <AdPlaceholder variant="banner" />
          
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50">
            <h1 className="text-3xl font-bold text-white mb-8">Privacy Policy</h1>
            <p className="text-sm text-slate-400 mb-8">Last Updated: November 4, 2025</p>
          
          <div className="space-y-6 text-slate-300 prose prose-invert max-w-none">
            <section>
              <h2 className="text-xl font-semibold text-white mb-4">1. Overview</h2>
              <p>
                PRO PDF ("we," "us," or "our") is committed to protecting your privacy and personal information. 
                This Privacy Policy explains how we collect, use, disclose, and safeguard your data when you use 
                our PDF processing services. We comply with GDPR (General Data Protection Regulation), HIPAA 
                (Health Insurance Portability and Accountability Act), and PIPEDA (Personal Information Protection 
                and Electronic Documents Act).
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">2. Information We Collect</h2>
              
              <h3 className="text-lg font-semibold text-white mb-3">2.1 Personal Information</h3>
              <p>We collect the following personal information when you create an account:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Email address (required for account creation and communication)</li>
                <li>Name (if provided)</li>
                <li>Password (encrypted and hashed)</li>
                <li>Two-factor authentication details (if enabled)</li>
                <li>Payment information (processed securely through Stripe)</li>
              </ul>

              <h3 className="text-lg font-semibold text-white mb-3 mt-4">2.2 Usage Information</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>IP address and browser information</li>
                <li>Device type and operating system</li>
                <li>Pages visited and features used</li>
                <li>Date and time of access</li>
                <li>File processing history (metadata only, not file contents)</li>
              </ul>

              <h3 className="text-lg font-semibold text-white mb-3 mt-4">2.3 File Data</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>PDF files you upload are processed entirely client-side in your browser</li>
                <li>Premium users can optionally store encrypted files in cloud storage</li>
                <li>File metadata (name, size, upload date) is stored for session management</li>
                <li>We never access or read the contents of your PDF files</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">3. How We Use Your Information</h2>
              <p>We use your personal information for the following purposes:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Service Provision:</strong> To provide, operate, and maintain our PDF processing services</li>
                <li><strong>Account Management:</strong> To create and manage your account, process authentication, and enable 2FA</li>
                <li><strong>Payment Processing:</strong> To process subscriptions and manage billing through Stripe</li>
                <li><strong>Communication:</strong> To send service-related emails, notifications, and support responses</li>
                <li><strong>Security:</strong> To protect against fraud, abuse, and unauthorized access</li>
                <li><strong>Improvement:</strong> To analyze usage patterns and improve our services (anonymized data only)</li>
                <li><strong>Legal Compliance:</strong> To comply with legal obligations and enforce our Terms of Service</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">4. Data Processing and Storage</h2>
              
              <h3 className="text-lg font-semibold text-white mb-3">4.1 Client-Side Processing</h3>
              <p>
                All PDF processing (conversion, merging, splitting, compression, encryption, signing) happens 
                entirely in your web browser using JavaScript. Your files never leave your device during processing.
              </p>

              <h3 className="text-lg font-semibold text-white mb-3 mt-4">4.2 Cloud Storage (Premium Only)</h3>
              <p>
                Premium users can optionally store processed files in encrypted cloud storage (AWS S3). Key points:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Files are encrypted using AES-256 encryption before upload</li>
                <li>You maintain full control and can delete files anytime</li>
                <li>Files are stored in secure, redundant data centers</li>
                <li>Storage is optional - you can use the service without storing files</li>
              </ul>

              <h3 className="text-lg font-semibold text-white mb-3 mt-4">4.3 Guest Users</h3>
              <p>
                Guest users (non-registered) can use all PDF tools without creating an account. No files or 
                personal data are stored. All processing happens in-browser and data is cleared on page close.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">5. Data Security</h2>
              <p>We implement industry-standard security measures to protect your information:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Encryption:</strong> All data transmitted via HTTPS/TLS. Files encrypted with AES-256.</li>
                <li><strong>Password Protection:</strong> Passwords hashed with bcrypt (industry-standard algorithm)</li>
                <li><strong>Access Controls:</strong> Strict access controls and authentication requirements</li>
                <li><strong>Rate Limiting:</strong> Protection against brute-force attacks and abuse</li>
                <li><strong>Session Management:</strong> Secure session handling with automatic expiration</li>
                <li><strong>Regular Audits:</strong> Security assessments and vulnerability scanning</li>
                <li><strong>Data Backup:</strong> Regular backups with encryption and secure storage</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">6. Third-Party Services</h2>
              <p>We use the following trusted third-party services:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Stripe:</strong> Payment processing (PCI DSS compliant)</li>
                <li><strong>AWS S3:</strong> Cloud file storage (encrypted, HIPAA-eligible)</li>
                <li><strong>SendGrid/SMTP:</strong> Email delivery for notifications and verification</li>
                <li><strong>Abacus.AI:</strong> AI chatbot assistant (no file content shared)</li>
              </ul>
              <p className="mt-3">
                These services are contractually obligated to protect your data and use it only for 
                providing their specific services.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">7. Data Retention and Deletion</h2>
              
              <h3 className="text-lg font-semibold text-white mb-3">7.1 Account Data</h3>
              <p>
                We retain your account information for as long as your account is active. You can delete 
                your account at any time through your Account Settings.
              </p>

              <h3 className="text-lg font-semibold text-white mb-3 mt-4">7.2 File Storage</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Guest Users:</strong> No files stored. Processing happens in-browser only.</li>
                <li><strong>Premium Users:</strong> Files stored until you delete them or cancel your subscription</li>
                <li><strong>Automatic Cleanup:</strong> Inactive files deleted after 90 days (configurable in settings)</li>
              </ul>

              <h3 className="text-lg font-semibold text-white mb-3 mt-4">7.3 Account Deletion</h3>
              <p>
                When you delete your account, we permanently delete:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>All personal information (email, name, preferences)</li>
                <li>All stored files and file metadata</li>
                <li>All session data and authentication tokens</li>
                <li>All usage history and logs (except anonymized analytics)</li>
              </ul>
              <p className="mt-3">
                Some information may be retained for legal compliance (e.g., payment records for tax purposes) 
                but is deleted after the required retention period.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">8. Your Privacy Rights</h2>
              
              <h3 className="text-lg font-semibold text-white mb-3">8.1 GDPR Rights (European Union)</h3>
              <p>If you are located in the EU/EEA, you have the following rights:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Right to Access:</strong> Request a copy of all personal data we hold about you</li>
                <li><strong>Right to Rectification:</strong> Correct inaccurate or incomplete information</li>
                <li><strong>Right to Erasure:</strong> Request deletion of your personal data ("right to be forgotten")</li>
                <li><strong>Right to Restrict Processing:</strong> Limit how we use your data</li>
                <li><strong>Right to Data Portability:</strong> Receive your data in a machine-readable format</li>
                <li><strong>Right to Object:</strong> Object to processing based on legitimate interests</li>
                <li><strong>Right to Withdraw Consent:</strong> Withdraw consent for data processing at any time</li>
              </ul>

              <h3 className="text-lg font-semibold text-white mb-3 mt-4">8.2 PIPEDA Rights (Canada)</h3>
              <p>If you are located in Canada, you have the following rights:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Right to know why we collect, use, and disclose your information</li>
                <li>Right to access your personal information</li>
                <li>Right to challenge the accuracy and completeness of your information</li>
                <li>Right to withdraw consent for data collection and use</li>
              </ul>

              <h3 className="text-lg font-semibold text-white mb-3 mt-4">8.3 HIPAA Compliance (Health Information)</h3>
              <p>
                If you process documents containing Protected Health Information (PHI):
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>All processing is done client-side; we never access PHI</li>
                <li>Our cloud storage is HIPAA-eligible and uses Business Associate Agreements (BAA)</li>
                <li>Files are encrypted both in transit and at rest</li>
                <li>Audit logs are maintained for compliance purposes</li>
              </ul>

              <h3 className="text-lg font-semibold text-white mb-3 mt-4">8.4 Exercising Your Rights</h3>
              <p>
                To exercise any of these rights, contact us at <strong>privacy@propdf.com</strong> or use the 
                settings in your account dashboard. We will respond within 30 days.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">9. Cookies and Tracking</h2>
              <p>We use cookies and similar technologies for:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Essential Cookies:</strong> Required for authentication and session management (cannot be disabled)</li>
                <li><strong>Functional Cookies:</strong> Remember your preferences (language, theme) - optional</li>
                <li><strong>Analytics Cookies:</strong> Understand usage patterns (anonymized) - optional</li>
              </ul>
              <p className="mt-3">
                You can manage cookie preferences through our Cookie Consent banner or browser settings.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">10. International Data Transfers</h2>
              <p>
                Your data may be transferred to and stored in countries outside your country of residence. 
                We ensure appropriate safeguards are in place:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Standard Contractual Clauses (SCCs) for EU data transfers</li>
                <li>Adequate protection measures as required by GDPR and PIPEDA</li>
                <li>Data stored in secure, reputable data centers (AWS)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">11. Children's Privacy</h2>
              <p>
                Our services are not intended for children under 16 years of age. We do not knowingly collect 
                personal information from children. If you believe we have collected information from a child, 
                please contact us immediately at privacy@propdf.com.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">12. Data Breach Notification</h2>
              <p>
                In the unlikely event of a data breach that affects your personal information, we will:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Notify you within 72 hours (as required by GDPR)</li>
                <li>Provide details about the breach and its impact</li>
                <li>Explain the steps we're taking to resolve the issue</li>
                <li>Offer recommendations to protect your information</li>
                <li>Notify relevant supervisory authorities as required by law</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">13. Changes to This Privacy Policy</h2>
              <p>
                We may update this Privacy Policy from time to time to reflect changes in our practices or legal 
                requirements. We will notify you of significant changes by:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Posting the updated policy on our website</li>
                <li>Sending an email notification to registered users</li>
                <li>Displaying an in-app notification</li>
              </ul>
              <p className="mt-3">
                Your continued use of our services after the effective date constitutes acceptance of the updated policy.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">14. Contact Information</h2>
              <p>For privacy-related questions, requests, or concerns:</p>
              <ul className="list-none space-y-2 ml-4 mt-3">
                <li><strong>Email:</strong> privacy@propdf.com</li>
                <li><strong>Data Protection Officer:</strong> dpo@propdf.com</li>
                <li><strong>Response Time:</strong> Within 30 days</li>
              </ul>
              <p className="mt-4">
                <strong>EU Representative:</strong> For GDPR-related inquiries, you can contact our EU representative 
                at eu-representative@propdf.com
              </p>
              <p className="mt-3">
                <strong>Supervisory Authority:</strong> You have the right to lodge a complaint with your local 
                data protection authority if you believe your privacy rights have been violated.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">15. Legal Basis for Processing (GDPR)</h2>
              <p>We process your personal data based on the following legal grounds:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Contract Performance:</strong> Processing necessary to provide services you requested</li>
                <li><strong>Consent:</strong> You have given explicit consent for specific processing activities</li>
                <li><strong>Legitimate Interests:</strong> Processing necessary for our legitimate business interests 
                (fraud prevention, service improvement)</li>
                <li><strong>Legal Obligation:</strong> Processing required to comply with legal requirements</li>
              </ul>
            </section>

            <div className="mt-8 p-4 bg-slate-700/30 rounded-lg border border-slate-600">
              <p className="text-sm text-slate-300">
                <strong>Summary:</strong> We take your privacy seriously. Your files are processed client-side, 
                we encrypt all data, comply with GDPR/HIPAA/PIPEDA, and give you full control over your information. 
                Contact privacy@propdf.com for any questions.
              </p>
            </div>
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
