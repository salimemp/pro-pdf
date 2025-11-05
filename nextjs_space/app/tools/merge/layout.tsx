
import { generateToolMetadata } from "@/lib/seo-config";

export const metadata = generateToolMetadata("merge");

export default function MergeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
