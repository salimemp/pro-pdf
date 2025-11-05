
import { generateToolMetadata } from "@/lib/seo-config";

export const metadata = generateToolMetadata("organize");

export default function OrganizeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
