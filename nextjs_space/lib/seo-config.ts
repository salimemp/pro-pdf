
import { Metadata } from "next";

interface SEOConfig {
  title: string;
  description: string;
  keywords: string[];
  path: string;
}

export const toolSEOConfig: Record<string, SEOConfig> = {
  convert: {
    title: "Free PDF Converter - Convert Images, Text & More to PDF",
    description: "Convert images (JPG, PNG), text files, Markdown, CSV, and HTML to PDF online for free. Fast, secure, and easy to use PDF converter with batch support.",
    keywords: [
      "PDF converter",
      "image to PDF",
      "JPG to PDF",
      "PNG to PDF",
      "text to PDF",
      "Markdown to PDF",
      "CSV to PDF",
      "HTML to PDF",
      "convert to PDF online",
      "free PDF converter",
    ],
    path: "/tools/convert",
  },
  merge: {
    title: "Merge PDF Files Online Free - Combine Multiple PDFs",
    description: "Merge multiple PDF files into one document online for free. Combine PDFs in any order with our fast and secure PDF merger tool.",
    keywords: [
      "merge PDF",
      "combine PDF",
      "PDF merger",
      "join PDF files",
      "merge PDF online free",
      "combine multiple PDFs",
    ],
    path: "/tools/merge",
  },
  split: {
    title: "Split PDF Online Free - Extract Pages from PDF",
    description: "Split PDF files by page range or extract specific pages online for free. Fast and secure PDF splitter with preview support.",
    keywords: [
      "split PDF",
      "PDF splitter",
      "extract PDF pages",
      "split PDF online",
      "divide PDF",
      "separate PDF pages",
    ],
    path: "/tools/split",
  },
  compress: {
    title: "Compress PDF Online Free - Reduce PDF File Size",
    description: "Compress PDF files to reduce size while maintaining quality. Free online PDF compression with adjustable quality levels and encryption support.",
    keywords: [
      "compress PDF",
      "reduce PDF size",
      "PDF compressor",
      "shrink PDF",
      "compress PDF online free",
      "make PDF smaller",
    ],
    path: "/tools/compress",
  },
  rotate: {
    title: "Rotate PDF Online Free - Change PDF Page Orientation",
    description: "Rotate PDF pages online for free. Change page orientation of single or multiple pages with our easy-to-use PDF rotation tool.",
    keywords: [
      "rotate PDF",
      "PDF rotator",
      "rotate PDF pages",
      "change PDF orientation",
      "rotate PDF online free",
    ],
    path: "/tools/rotate",
  },
  watermark: {
    title: "Add Watermark to PDF Free - Protect Your PDF Documents",
    description: "Add text or image watermarks to PDF files online for free. Customize position, opacity, and rotation to protect your documents.",
    keywords: [
      "watermark PDF",
      "add watermark to PDF",
      "PDF watermark",
      "protect PDF",
      "watermark PDF online free",
    ],
    path: "/tools/watermark",
  },
  sign: {
    title: "Sign PDF Online Free - Add Digital Signature to PDF",
    description: "Sign PDF documents online for free. Draw, type, or upload your signature and add it to any PDF file securely.",
    keywords: [
      "sign PDF",
      "PDF signature",
      "digital signature PDF",
      "e-sign PDF",
      "sign PDF online free",
    ],
    path: "/tools/sign",
  },
  encrypt: {
    title: "Encrypt PDF Online Free - Password Protect PDF Files",
    description: "Encrypt PDF files with password protection online for free. Secure your sensitive documents with AES-256 encryption.",
    keywords: [
      "encrypt PDF",
      "password protect PDF",
      "secure PDF",
      "PDF encryption",
      "protect PDF with password",
    ],
    path: "/tools/encrypt",
  },
  decrypt: {
    title: "Decrypt PDF Online Free - Remove PDF Password Protection",
    description: "Remove password protection from PDF files online for free. Decrypt and unlock PDFs you have the password for.",
    keywords: [
      "decrypt PDF",
      "unlock PDF",
      "remove PDF password",
      "PDF decryption",
      "unlock protected PDF",
    ],
    path: "/tools/decrypt",
  },
  organize: {
    title: "Organize PDF Pages - Reorder and Arrange PDF Pages",
    description: "Organize and reorder PDF pages online for free. Drag and drop to rearrange pages in any order with visual preview.",
    keywords: [
      "organize PDF",
      "reorder PDF pages",
      "rearrange PDF",
      "PDF page organizer",
      "reorganize PDF pages",
    ],
    path: "/tools/organize",
  },
  "page-numbers": {
    title: "Add Page Numbers to PDF Free - Number PDF Pages",
    description: "Add page numbers to PDF documents online for free. Customize position, format, and starting number.",
    keywords: [
      "add page numbers to PDF",
      "PDF page numbers",
      "number PDF pages",
      "page numbering PDF",
      "add pagination to PDF",
    ],
    path: "/tools/page-numbers",
  },
  "html-to-pdf": {
    title: "HTML to PDF Converter - Convert Web Pages to PDF Free",
    description: "Convert HTML to PDF online for free. Transform web pages and HTML code into PDF documents with preserved formatting.",
    keywords: [
      "HTML to PDF",
      "convert HTML to PDF",
      "web page to PDF",
      "HTML to PDF converter",
      "save webpage as PDF",
    ],
    path: "/tools/html-to-pdf",
  },
  crop: {
    title: "Crop PDF Online Free - Trim PDF Pages and Margins",
    description: "Crop PDF pages online for free. Remove margins and unwanted areas from PDF documents with visual cropping tool.",
    keywords: [
      "crop PDF",
      "trim PDF",
      "PDF cropper",
      "remove PDF margins",
      "crop PDF pages online",
    ],
    path: "/tools/crop",
  },
  edit: {
    title: "Edit PDF Online Free - Modify PDF Documents",
    description: "Edit PDF files online for free. Add text, images, and annotations to PDF documents with our easy-to-use PDF editor.",
    keywords: [
      "edit PDF",
      "PDF editor",
      "modify PDF",
      "edit PDF online free",
      "PDF editing tool",
    ],
    path: "/tools/edit",
  },
};

export function generateToolMetadata(tool: string): Metadata {
  const config = toolSEOConfig[tool];
  const baseUrl = "https://www.getpropdf.com";

  if (!config) {
    return {};
  }

  return {
    title: config.title,
    description: config.description,
    keywords: config.keywords,
    alternates: {
      canonical: `${baseUrl}${config.path}`,
    },
    openGraph: {
      title: config.title,
      description: config.description,
      url: `${baseUrl}${config.path}`,
      type: "website",
      images: [
        {
          url: `${baseUrl}/og-image.png`,
          width: 1200,
          height: 630,
          alt: config.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: config.title,
      description: config.description,
      images: [`${baseUrl}/og-image.png`],
    },
  };
}
