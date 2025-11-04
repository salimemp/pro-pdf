
export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "sonner";
import { OnboardingSlides } from "@/components/onboarding-slides";
import { CookieConsent } from "@/components/cookie-consent";
import { I18nProvider } from "@/lib/i18n/context";
import { FloatingChatbot } from "@/components/floating-chatbot";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL || "http://localhost:3000"),
  title: "PRO PDF - Professional PDF Converter & Editor",
  description: "Convert, merge, split, compress PDFs and more. Professional PDF tools with secure cloud storage and premium features.",
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "PRO PDF - Professional PDF Converter & Editor",
    description: "Convert, merge, split, compress PDFs and more. Professional PDF tools with secure cloud storage and premium features.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "PRO PDF - Professional PDF Converter",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PRO PDF - Professional PDF Converter & Editor",
    description: "Convert, merge, split, compress PDFs and more. Professional PDF tools with secure cloud storage and premium features.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Providers>
            <I18nProvider>
              {children}
              <Toaster />
              <SonnerToaster position="top-right" richColors />
              <OnboardingSlides />
              <CookieConsent />
              <FloatingChatbot />
            </I18nProvider>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
