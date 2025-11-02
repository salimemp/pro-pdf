
import { getServerSession } from "next-auth";
import { AdPlaceholder } from "@/components/ad-placeholder";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { JobsContent } from "@/components/jobs/jobs-content";

export const dynamic = "force-dynamic";

export default async function JobsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/login");
  }

  return <JobsContent />;
}
