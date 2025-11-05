
import { generateToolMetadata } from "@/lib/seo-config";

export const metadata = generateToolMetadata("rotate");

export default function RotateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
