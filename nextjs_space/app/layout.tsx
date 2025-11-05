
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
  metadataBase: new URL("https://www.getpropdf.com"),
  title: {
    default: "PRO PDF - Free Online PDF Converter & Editor Tools",
    template: "%s | PRO PDF",
  },
  description: "Free online PDF tools to convert, merge, split, compress, edit, rotate, watermark, and sign PDFs. Fast, secure, and easy to use. No registration required for basic features.",
  keywords: [
    "PDF converter",
    "PDF editor",
    "merge PDF",
    "split PDF",
    "compress PDF",
    "PDF to Word",
    "Word to PDF",
    "Excel to PDF",
    "PowerPoint to PDF",
    "image to PDF",
    "PDF to JPG",
    "rotate PDF",
    "watermark PDF",
    "sign PDF",
    "encrypt PDF",
    "decrypt PDF",
    "organize PDF",
    "edit PDF online",
    "free PDF tools",
    "online PDF converter",
    "HTML to PDF",
    "Markdown to PDF",
    "CSV to PDF",
    "crop PDF",
    "add page numbers to PDF",
  ],
  authors: [{ name: "PRO PDF Team" }],
  creator: "PRO PDF",
  publisher: "PRO PDF",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://www.getpropdf.com",
  },
  icons: {
    icon: "/favicon.svg",
    apple: "/favicon.svg",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.getpropdf.com",
    siteName: "PRO PDF",
    title: "PRO PDF - Free Online PDF Converter & Editor Tools",
    description: "Free online PDF tools to convert, merge, split, compress, edit, rotate, watermark, and sign PDFs. Fast, secure, and easy to use.",
    images: [
      {
        url: "https://www.getpropdf.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "PRO PDF - Professional PDF Converter & Editor",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PRO PDF - Free Online PDF Converter & Editor Tools",
    description: "Free online PDF tools to convert, merge, split, compress, edit, rotate, watermark, and sign PDFs. Fast, secure, and easy to use.",
    images: ["https://www.getpropdf.com/og-image.png"],
    creator: "@propdf",
  },
  verification: {
    google: "google-site-verification-code",
  },
  category: "Technology",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": "https://www.getpropdf.com/#website",
        url: "https://www.getpropdf.com",
        name: "PRO PDF",
        description: "Free online PDF tools to convert, merge, split, compress, edit, rotate, watermark, and sign PDFs.",
        publisher: {
          "@id": "https://www.getpropdf.com/#organization",
        },
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: "https://www.getpropdf.com/?s={search_term_string}",
          },
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "Organization",
        "@id": "https://upload.wikimedia.org/wikipedia/commons/4/4b/PDF_Association_logo.svg",
        name: "PRO PDF",
        url: "https://www.getpropdf.com",
        logo: {
          "@type": "ImageObject",
          url: "https://upload.wikimedia.org/wikipedia/commons/0/06/WebPDF.pro_Icon.svg",
        },
        sameAs: [
          "https://twitter.com/propdf",
        ],
      },
      {
        "@type": "WebApplication",
        name: "PRO PDF Tools",
        description: "Free online PDF converter and editor with 15+ tools including merge, split, compress, convert, rotate, watermark, and more.",
        applicationCategory: "UtilitiesApplication",
        operatingSystem: "Web Browser",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: "4.8",
          ratingCount: "1250",
        },
      },
    ],
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
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