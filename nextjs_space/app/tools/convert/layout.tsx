
import { generateToolMetadata } from "@/lib/seo-config";

export const metadata = generateToolMetadata("convert");

export default function ConvertLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
