
import { generateToolMetadata } from "@/lib/seo-config";

export const metadata = generateToolMetadata("sign");

export default function SignLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
