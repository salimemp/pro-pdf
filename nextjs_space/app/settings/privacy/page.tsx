import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { PrivacyDashboard } from '@/components/compliance/privacy-dashboard';

export const metadata: Metadata = {
  title: 'Privacy Settings | PRO PDF',
  description: 'Manage your privacy settings and data preferences',
};

export default async function PrivacySettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/login');
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Privacy & Compliance Settings</h1>
          <p className="text-muted-foreground">
            Manage your privacy preferences, data rights, and compliance settings
          </p>
        </div>
        
        <PrivacyDashboard />
      </div>
    </div>
  );
}
