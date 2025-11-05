
import { generateToolMetadata } from "@/lib/seo-config";

export const metadata = generateToolMetadata("page-numbers");

export default function PageNumbersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
