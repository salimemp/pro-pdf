
import { generateToolMetadata } from "@/lib/seo-config";

export const metadata = generateToolMetadata("compress");

export default function CompressLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
