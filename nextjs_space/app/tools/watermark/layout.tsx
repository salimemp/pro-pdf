
import { generateToolMetadata } from "@/lib/seo-config";

export const metadata = generateToolMetadata("watermark");

export default function WatermarkLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
