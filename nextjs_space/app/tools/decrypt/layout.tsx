
import { generateToolMetadata } from "@/lib/seo-config";

export const metadata = generateToolMetadata("decrypt");

export default function DecryptLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
