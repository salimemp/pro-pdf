
import { generateToolMetadata } from "@/lib/seo-config";

export const metadata = generateToolMetadata("edit");

export default function EditLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
