
import { Header } from "@/components/header";
import { AdPlaceholder } from "@/components/ad-placeholder";
import { Footer } from "@/components/footer";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <Header />
      
      <main className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="space-y-8">
          {/* Top Ad */}
          <AdPlaceholder variant="banner" />
          
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50">
            <h1 className="text-3xl font-bold text-white mb-8">Terms of Service</h1>
            <p className="text-sm text-slate-400 mb-8">Last Updated: November 4, 2025</p>
          
          <div className="space-y-6 text-slate-300 prose prose-invert max-w-none">
            <section>
              <h2 className="text-xl font-semibold text-white mb-4">1. Acceptance of Terms</h2>
              <p>
                By accessing, browsing, or using PRO PDF ("Service," "we," "us," or "our"), you ("user," "you," or "your") 
                acknowledge that you have read, understood, and agree to be bound by these Terms of Service ("Terms") and 
                our Privacy Policy. If you do not agree to these Terms, you must not use our Service.
              </p>
              <p className="mt-3">
                These Terms constitute a legally binding agreement between you and PRO PDF. We reserve the right to modify 
                these Terms at any time, and your continued use of the Service following any changes indicates your acceptance 
                of the modified Terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">2. Service Description</h2>
              <p>
                PRO PDF provides web-based PDF processing tools including, but not limited to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>PDF conversion (to images, text extraction)</li>
                <li>PDF merging and splitting</li>
                <li>PDF compression</li>
                <li>PDF encryption and decryption</li>
                <li>Digital signature application</li>
                <li>Cloud storage for processed files (Premium only)</li>
                <li>AI-powered chatbot assistant</li>
              </ul>
              <p className="mt-3">
                We offer both free guest access and premium subscription services with enhanced features and capabilities.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">3. User Accounts</h2>
              
              <h3 className="text-lg font-semibold text-white mb-3">3.1 Account Creation</h3>
              <p>
                To access certain features, you must create an account by providing accurate, complete, and current information. 
                You agree to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Provide truthful and accurate information during registration</li>
                <li>Maintain and update your account information</li>
                <li>Keep your password secure and confidential</li>
                <li>Notify us immediately of any unauthorized access</li>
                <li>Accept responsibility for all activities under your account</li>
              </ul>

              <h3 className="text-lg font-semibold text-white mb-3 mt-4">3.2 Account Eligibility</h3>
              <p>
                You must be at least 16 years of age to create an account. By creating an account, you represent and warrant 
                that you meet this age requirement and have the legal capacity to enter into these Terms.
              </p>

              <h3 className="text-lg font-semibold text-white mb-3 mt-4">3.3 Account Termination</h3>
              <p>
                We reserve the right to suspend or terminate your account at any time for:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Violation of these Terms</li>
                <li>Fraudulent, abusive, or illegal activity</li>
                <li>Extended periods of inactivity</li>
                <li>At your request</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">4. Acceptable Use Policy</h2>
              
              <h3 className="text-lg font-semibold text-white mb-3">4.1 Permitted Uses</h3>
              <p>
                You may use our Service for lawful purposes only, including:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Personal document processing and management</li>
                <li>Business document workflows</li>
                <li>Educational and research purposes</li>
                <li>Any other legal use that complies with these Terms</li>
              </ul>

              <h3 className="text-lg font-semibold text-white mb-3 mt-4">4.2 Prohibited Uses</h3>
              <p>
                You agree NOT to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Upload, process, or store any illegal, harmful, or offensive content</li>
                <li>Violate any intellectual property rights, including copyright infringement</li>
                <li>Upload malicious files (viruses, malware, trojans, etc.)</li>
                <li>Attempt to reverse engineer, decompile, or hack the Service</li>
                <li>Use automated systems (bots, scrapers) without permission</li>
                <li>Overload or disrupt our servers or networks</li>
                <li>Impersonate others or misrepresent your affiliation</li>
                <li>Collect or harvest user information without consent</li>
                <li>Process documents containing child exploitation material</li>
                <li>Use the Service to send spam or unsolicited communications</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">5. File Usage and Restrictions</h2>
              
              <h3 className="text-lg font-semibold text-white mb-3">5.1 File Size Limits</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Guest Users:</strong> Maximum 10 MB per file, 5 files per session</li>
                <li><strong>Free Registered Users:</strong> Maximum 25 MB per file, 10 files per session</li>
                <li><strong>Premium Users:</strong> Maximum 1 GB per file, unlimited files</li>
              </ul>

              <h3 className="text-lg font-semibold text-white mb-3 mt-4">5.2 File Processing</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>All PDF processing occurs client-side in your browser</li>
                <li>We do not access, read, or analyze the content of your files</li>
                <li>Guest user files are not stored and are deleted immediately after processing</li>
                <li>Registered users can optionally save processed files to secure cloud storage</li>
              </ul>

              <h3 className="text-lg font-semibold text-white mb-3 mt-4">5.3 File Ownership and Responsibility</h3>
              <p>
                You retain all ownership rights to your files. By using our Service, you:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Warrant that you have the right to process and store the files you upload</li>
                <li>Accept full responsibility for the content of your files</li>
                <li>Agree to indemnify us against any claims arising from your file content</li>
                <li>Acknowledge that we are not liable for any loss or corruption of your files</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">6. Subscription Terms and Billing</h2>
              
              <h3 className="text-lg font-semibold text-white mb-3">6.1 Premium Subscriptions</h3>
              <p>
                Premium subscriptions are available on a monthly or annual basis and include:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Larger file size limits (up to 1 GB)</li>
                <li>Unlimited file processing</li>
                <li>Cloud storage for processed files</li>
                <li>Priority support</li>
                <li>Advanced features and tools</li>
                <li>No advertisements</li>
              </ul>

              <h3 className="text-lg font-semibold text-white mb-3 mt-4">6.2 Billing and Payments</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Subscriptions are billed in advance on a recurring basis (monthly or annually)</li>
                <li>Payment is processed securely through Stripe (PCI DSS compliant)</li>
                <li>Prices are subject to change with 30 days notice</li>
                <li>You authorize us to charge your payment method for all subscription fees</li>
                <li>Failed payments may result in service suspension or termination</li>
              </ul>

              <h3 className="text-lg font-semibold text-white mb-3 mt-4">6.3 Cancellation and Refunds</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>You may cancel your subscription at any time from your Account Settings</li>
                <li>Cancellations take effect at the end of the current billing period</li>
                <li>No refunds for partial months or unused portions of the subscription</li>
                <li><strong>Refunds available within 7 days of initial purchase (one-time only)</strong></li>
                <li>Refund requests must be submitted to support@propdf.com with your order details</li>
                <li>Refunds are processed within 5-10 business days to the original payment method</li>
              </ul>

              <h3 className="text-lg font-semibold text-white mb-3 mt-4">6.4 Free Trial</h3>
              <p>
                We may offer free trial periods for Premium subscriptions. Trial terms:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>One free trial per user/household</li>
                <li>Automatic conversion to paid subscription unless cancelled before trial end</li>
                <li>We reserve the right to modify or discontinue free trials at any time</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">7. Fair Usage Policy for Premium Users</h2>
              
              <h3 className="text-lg font-semibold text-white mb-3">7.1 Purpose</h3>
              <p>
                Our Fair Usage Policy ensures that all Premium users have access to high-quality service without 
                disruption from excessive or abusive usage patterns. While Premium subscriptions include "unlimited" 
                file processing, this is subject to reasonable and fair usage as outlined below.
              </p>

              <h3 className="text-lg font-semibold text-white mb-3 mt-4">7.2 Reasonable Usage Guidelines</h3>
              <p>
                Premium users are expected to use the Service in a manner consistent with normal business or personal 
                document processing needs. Reasonable usage includes:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Individual/Personal Use:</strong> Up to 500 file operations per day (approximately 15,000 per month)</li>
                <li><strong>Small Business Use:</strong> Up to 1,000 file operations per day (approximately 30,000 per month)</li>
                <li><strong>Enterprise Use:</strong> Please contact sales@propdf.com for custom enterprise plans</li>
                <li><strong>Cloud Storage:</strong> Up to 50 GB of stored files per account</li>
                <li><strong>File Size:</strong> Individual files up to 1 GB (larger files may require longer processing times)</li>
                <li><strong>Batch Operations:</strong> Up to 100 files per batch operation</li>
              </ul>

              <h3 className="text-lg font-semibold text-white mb-3 mt-4">7.3 Excessive Usage</h3>
              <p>
                The following are considered excessive or abusive usage and may result in account restrictions:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Processing more than 2,000 files per day consistently</li>
                <li>Using automated scripts or bots to submit files without prior approval</li>
                <li>Reselling or redistributing our services to third parties</li>
                <li>Creating multiple accounts to circumvent usage limits</li>
                <li>Using the Service for cryptocurrency mining or similar resource-intensive activities</li>
                <li>Storing more than 50 GB of files without upgrading to a higher-tier plan</li>
                <li>Repeatedly uploading and deleting large files to abuse storage limits</li>
              </ul>

              <h3 className="text-lg font-semibold text-white mb-3 mt-4">7.4 Monitoring and Enforcement</h3>
              <p>
                We monitor usage patterns to ensure compliance with this Fair Usage Policy:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Automated Monitoring:</strong> System alerts for usage exceeding 150% of reasonable limits</li>
                <li><strong>First Warning:</strong> Email notification when usage patterns appear excessive</li>
                <li><strong>Second Warning:</strong> Temporary rate limiting (e.g., cooldown period between operations)</li>
                <li><strong>Final Action:</strong> Account suspension or termination for continued violations</li>
              </ul>

              <h3 className="text-lg font-semibold text-white mb-3 mt-4">7.5 Right to Appeal</h3>
              <p>
                If your account is flagged for excessive usage and you believe this is in error, you may:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Contact support@propdf.com within 14 days with an explanation of your usage needs</li>
                <li>Provide documentation supporting legitimate high-volume usage (e.g., business requirements)</li>
                <li>Request a custom enterprise plan with higher usage limits</li>
              </ul>
              <p className="mt-3">
                We will review your case and may restore full access or recommend an appropriate plan for your needs.
              </p>

              <h3 className="text-lg font-semibold text-white mb-3 mt-4">7.6 Enterprise and High-Volume Users</h3>
              <p>
                If you require higher usage limits or dedicated resources:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Contact sales@propdf.com for custom enterprise pricing</li>
                <li>Enterprise plans include dedicated API access, higher rate limits, and priority support</li>
                <li>Custom SLAs available for mission-critical operations</li>
              </ul>

              <h3 className="text-lg font-semibold text-white mb-3 mt-4">7.7 Policy Updates</h3>
              <p>
                We reserve the right to adjust Fair Usage Policy limits based on:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Infrastructure improvements or constraints</li>
                <li>Changes in operating costs</li>
                <li>Overall usage patterns across the platform</li>
              </ul>
              <p className="mt-3">
                Premium users will be notified at least 30 days before any significant changes to usage limits.
              </p>

              <div className="mt-6 p-4 bg-blue-900/20 rounded-lg border border-blue-700/30">
                <p className="text-sm text-blue-200">
                  <strong>💡 Fair Usage Summary:</strong> Premium users enjoy generous usage limits designed for 
                  normal business and personal needs. If you consistently exceed 500-1,000 file operations per day 
                  or 50 GB storage, we may contact you to discuss upgrading to an enterprise plan. Reasonable usage 
                  ensures quality service for all users.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">8. Privacy and Data Security</h2>
              <p>
                Your privacy is important to us. Our data handling practices include:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Client-side PDF processing (files never sent to our servers during processing)</li>
                <li>End-to-end encryption for stored files (AES-256)</li>
                <li>Secure HTTPS/TLS connections for all data transmission</li>
                <li>Compliance with GDPR, HIPAA, and PIPEDA regulations</li>
                <li>No selling or sharing of personal data with third parties (except service providers)</li>
              </ul>
              <p className="mt-3">
                For detailed information, please review our <a href="/privacy" className="text-blue-400 hover:underline">Privacy Policy</a>.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">9. Intellectual Property Rights</h2>
              
              <h3 className="text-lg font-semibold text-white mb-3">9.1 Our Intellectual Property</h3>
              <p>
                All content, features, and functionality of the Service (including but not limited to text, graphics, logos, 
                icons, images, audio clips, software, and code) are owned by PRO PDF and are protected by copyright, trademark, 
                and other intellectual property laws.
              </p>

              <h3 className="text-lg font-semibold text-white mb-3 mt-4">9.2 Limited License</h3>
              <p>
                We grant you a limited, non-exclusive, non-transferable, revocable license to access and use the Service 
                for personal or business purposes in accordance with these Terms.
              </p>

              <h3 className="text-lg font-semibold text-white mb-3 mt-4">9.3 Your Content</h3>
              <p>
                You retain all rights to your files and content. By using our Service, you grant us a limited license to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Store and process your files as necessary to provide the Service</li>
                <li>Create backups for data protection purposes</li>
                <li>Analyze anonymized usage patterns to improve the Service</li>
              </ul>
              <p className="mt-3">
                This license terminates when you delete your files or account.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">10. Service Availability and Support</h2>
              
              <h3 className="text-lg font-semibold text-white mb-3">10.1 Uptime and Availability</h3>
              <p>
                We strive to maintain 99.9% uptime but do not guarantee uninterrupted or error-free service. The Service 
                may be temporarily unavailable due to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Scheduled maintenance (announced in advance when possible)</li>
                <li>Emergency maintenance or security updates</li>
                <li>Technical difficulties or system failures</li>
                <li>Third-party service disruptions</li>
                <li>Force majeure events</li>
              </ul>

              <h3 className="text-lg font-semibold text-white mb-3 mt-4">10.2 Customer Support</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Free Users:</strong> Community support and AI chatbot assistant</li>
                <li><strong>Premium Users:</strong> Priority email support with 24-48 hour response time</li>
                <li>Support is available in English; other languages may have limited availability</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">11. Disclaimers and Limitations of Liability</h2>
              
              <h3 className="text-lg font-semibold text-white mb-3">11.1 Service "As Is"</h3>
              <p>
                THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, 
                INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
              </p>

              <h3 className="text-lg font-semibold text-white mb-3 mt-4">11.2 No Liability for File Loss</h3>
              <p>
                We are not responsible for any loss, corruption, or unauthorized access to your files. You are solely 
                responsible for maintaining backups of important documents.
              </p>

              <h3 className="text-lg font-semibold text-white mb-3 mt-4">11.3 Limitation of Liability</h3>
              <p>
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, PRO PDF SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, 
                CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, 
                OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES.
              </p>
              <p className="mt-3">
                OUR TOTAL LIABILITY FOR ANY CLAIMS RELATED TO THE SERVICE SHALL NOT EXCEED THE AMOUNT YOU PAID US IN THE 
                12 MONTHS PRECEDING THE CLAIM, OR $100, WHICHEVER IS GREATER.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">12. Indemnification</h2>
              <p>
                You agree to indemnify, defend, and hold harmless PRO PDF, its officers, directors, employees, and agents 
                from and against any claims, liabilities, damages, losses, and expenses (including legal fees) arising out of:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Your use or misuse of the Service</li>
                <li>Your violation of these Terms</li>
                <li>Your violation of any rights of another party</li>
                <li>Your file content or any claims related to your files</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">13. Dispute Resolution and Governing Law</h2>
              
              <h3 className="text-lg font-semibold text-white mb-3">13.1 Governing Law</h3>
              <p>
                These Terms shall be governed by and construed in accordance with the laws of [Your Jurisdiction], 
                without regard to its conflict of law provisions.
              </p>

              <h3 className="text-lg font-semibold text-white mb-3 mt-4">13.2 Dispute Resolution</h3>
              <p>
                Any disputes arising from these Terms or the Service shall be resolved through:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>First, good faith negotiation between the parties</li>
                <li>If negotiation fails, binding arbitration in accordance with [Arbitration Rules]</li>
                <li>Arbitration shall be conducted in English</li>
                <li>Each party bears their own costs unless otherwise awarded</li>
              </ul>

              <h3 className="text-lg font-semibold text-white mb-3 mt-4">13.3 Class Action Waiver</h3>
              <p>
                You agree to resolve disputes on an individual basis only. You waive the right to participate in class actions 
                or class-wide arbitration.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">14. Modification of Terms</h2>
              <p>
                We reserve the right to modify these Terms at any time. We will notify you of significant changes by:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Posting the updated Terms on our website</li>
                <li>Sending an email notification to registered users</li>
                <li>Displaying an in-app notification</li>
              </ul>
              <p className="mt-3">
                Your continued use of the Service after the effective date of the updated Terms constitutes your acceptance 
                of the changes. If you do not agree to the modified Terms, you must stop using the Service and may cancel 
                your account.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">15. Termination</h2>
              <p>
                We may terminate or suspend your access to the Service immediately, without prior notice or liability, for any reason, 
                including:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Breach of these Terms</li>
                <li>Fraudulent or illegal activity</li>
                <li>At your request</li>
                <li>Discontinuation of the Service</li>
              </ul>
              <p className="mt-3">
                Upon termination, your right to use the Service will cease immediately. Stored files will be deleted within 
                30 days of termination unless you request immediate deletion.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">16. Severability</h2>
              <p>
                If any provision of these Terms is found to be unenforceable or invalid, that provision will be limited or 
                eliminated to the minimum extent necessary, and the remaining provisions will remain in full force and effect.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">17. Entire Agreement</h2>
              <p>
                These Terms, together with our Privacy Policy and any other legal notices published on the Service, 
                constitute the entire agreement between you and PRO PDF regarding your use of the Service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">18. Contact Information</h2>
              <p>
                For questions, concerns, or requests regarding these Terms of Service:
              </p>
              <ul className="list-none space-y-2 ml-4 mt-3">
                <li><strong>Email:</strong> support@propdf.com</li>
                <li><strong>Legal Inquiries:</strong> legal@propdf.com</li>
                <li><strong>Response Time:</strong> Within 5 business days</li>
              </ul>
            </section>

            <div className="mt-8 p-4 bg-slate-700/30 rounded-lg border border-slate-600">
              <p className="text-sm text-slate-300">
                <strong>Summary:</strong> By using PRO PDF, you agree to these Terms. Use the Service lawfully, respect 
                intellectual property rights, and maintain account security. We process files client-side, offer premium 
                subscriptions with flexible cancellation, and limit our liability as permitted by law. Contact 
                support@propdf.com with questions.
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
