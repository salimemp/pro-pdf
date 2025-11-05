
import { generateToolMetadata } from "@/lib/seo-config";

export const metadata = generateToolMetadata("crop");

export default function CropLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
