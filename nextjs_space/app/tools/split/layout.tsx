
import { generateToolMetadata } from "@/lib/seo-config";

export const metadata = generateToolMetadata("split");

export default function SplitLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
