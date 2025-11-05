
import { generateToolMetadata } from "@/lib/seo-config";

export const metadata = generateToolMetadata("html-to-pdf");

export default function HtmlToPdfLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
