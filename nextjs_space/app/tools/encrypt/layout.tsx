
import { generateToolMetadata } from "@/lib/seo-config";

export const metadata = generateToolMetadata("encrypt");

export default function EncryptLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
