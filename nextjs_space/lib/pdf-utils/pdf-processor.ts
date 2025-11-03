
// PDF Processing utilities using pdf-lib
import { PDFDocument, rgb, degrees } from 'pdf-lib';

export interface SignatureOptions {
  signatureImage: string; // Base64 data URL
  pageNumber: number;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
}

export interface MergeOptions {
  files: File[];
  includePages?: { [fileIndex: number]: number[] };
}

export interface CompressOptions {
  quality: 'low' | 'medium' | 'high';
  removeMetadata?: boolean;
}

export class PDFProcessor {
  /**
   * Add a signature to a PDF document
   */
  static async addSignatureToPDF(
    pdfFile: File,
    options: SignatureOptions
  ): Promise<Uint8Array> {
    try {
      // Load the PDF
      const pdfBytes = await pdfFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(pdfBytes);

      // Get the specified page
      const pages = pdfDoc.getPages();
      if (options.pageNumber < 1 || options.pageNumber > pages.length) {
        throw new Error('Invalid page number');
      }
      const page = pages[options.pageNumber - 1];

      // Load the signature image
      const signatureBytes = await fetch(options.signatureImage).then(res => res.arrayBuffer());
      let signatureImage;
      
      if (options.signatureImage.startsWith('data:image/png')) {
        signatureImage = await pdfDoc.embedPng(signatureBytes);
      } else if (options.signatureImage.startsWith('data:image/jpeg') || 
                 options.signatureImage.startsWith('data:image/jpg')) {
        signatureImage = await pdfDoc.embedJpg(signatureBytes);
      } else {
        throw new Error('Unsupported image format. Use PNG or JPEG');
      }

      // Add the signature to the page
      const { width, height } = page.getSize();
      page.drawImage(signatureImage, {
        x: options.x,
        y: height - options.y - options.height, // Flip Y coordinate
        width: options.width,
        height: options.height,
        rotate: degrees(options.rotation || 0),
        opacity: 1.0,
      });

      // Save the modified PDF
      const modifiedPdfBytes = await pdfDoc.save();
      return modifiedPdfBytes;
    } catch (error) {
      console.error('Error adding signature:', error);
      throw new Error(`Failed to add signature: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Merge multiple PDF documents
   */
  static async mergePDFs(options: MergeOptions): Promise<Uint8Array> {
    try {
      const mergedPdf = await PDFDocument.create();

      for (let i = 0; i < options.files.length; i++) {
        const file = options.files[i];
        const pdfBytes = await file.arrayBuffer();
        const pdf = await PDFDocument.load(pdfBytes);

        const pagesToInclude = options.includePages?.[i];
        const pageIndices = pagesToInclude || Array.from({ length: pdf.getPageCount() }, (_, idx) => idx);

        const copiedPages = await mergedPdf.copyPages(pdf, pageIndices);
        copiedPages.forEach(page => mergedPdf.addPage(page));
      }

      const mergedPdfBytes = await mergedPdf.save();
      return mergedPdfBytes;
    } catch (error) {
      console.error('Error merging PDFs:', error);
      throw new Error(`Failed to merge PDFs: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Split a PDF into individual pages
   */
  static async splitPDF(pdfFile: File): Promise<Uint8Array[]> {
    try {
      const pdfBytes = await pdfFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const pageCount = pdfDoc.getPageCount();

      const splitPdfs: Uint8Array[] = [];

      for (let i = 0; i < pageCount; i++) {
        const newPdf = await PDFDocument.create();
        const [copiedPage] = await newPdf.copyPages(pdfDoc, [i]);
        newPdf.addPage(copiedPage);
        const pdfBytes = await newPdf.save();
        splitPdfs.push(pdfBytes);
      }

      return splitPdfs;
    } catch (error) {
      console.error('Error splitting PDF:', error);
      throw new Error(`Failed to split PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Extract specific pages from a PDF
   */
  static async extractPages(
    pdfFile: File,
    pageNumbers: number[]
  ): Promise<Uint8Array> {
    try {
      const pdfBytes = await pdfFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const newPdf = await PDFDocument.create();

      const pageIndices = pageNumbers.map(num => num - 1);
      const copiedPages = await newPdf.copyPages(pdfDoc, pageIndices);
      copiedPages.forEach(page => newPdf.addPage(page));

      const extractedPdfBytes = await newPdf.save();
      return extractedPdfBytes;
    } catch (error) {
      console.error('Error extracting pages:', error);
      throw new Error(`Failed to extract pages: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get PDF metadata
   */
  static async getPDFMetadata(pdfFile: File): Promise<{
    pageCount: number;
    title?: string;
    author?: string;
    subject?: string;
    creator?: string;
    producer?: string;
    creationDate?: Date;
    modificationDate?: Date;
  }> {
    try {
      const pdfBytes = await pdfFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(pdfBytes);

      return {
        pageCount: pdfDoc.getPageCount(),
        title: pdfDoc.getTitle(),
        author: pdfDoc.getAuthor(),
        subject: pdfDoc.getSubject(),
        creator: pdfDoc.getCreator(),
        producer: pdfDoc.getProducer(),
        creationDate: pdfDoc.getCreationDate(),
        modificationDate: pdfDoc.getModificationDate(),
      };
    } catch (error) {
      console.error('Error getting PDF metadata:', error);
      throw new Error(`Failed to get PDF metadata: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Rotate PDF pages
   */
  static async rotatePDF(
    pdfFile: File,
    rotation: 90 | 180 | 270,
    pageNumbers?: number[]
  ): Promise<Uint8Array> {
    try {
      const pdfBytes = await pdfFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const pages = pdfDoc.getPages();

      const pagesToRotate = pageNumbers?.map(n => n - 1) || pages.map((_, idx) => idx);

      pagesToRotate.forEach(pageIndex => {
        if (pageIndex >= 0 && pageIndex < pages.length) {
          pages[pageIndex].setRotation(degrees(rotation));
        }
      });

      const rotatedPdfBytes = await pdfDoc.save();
      return rotatedPdfBytes;
    } catch (error) {
      console.error('Error rotating PDF:', error);
      throw new Error(`Failed to rotate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Add watermark to PDF
   */
  static async addWatermark(
    pdfFile: File,
    watermarkText: string,
    options?: {
      opacity?: number;
      rotation?: number;
      fontSize?: number;
      color?: { r: number; g: number; b: number };
    }
  ): Promise<Uint8Array> {
    try {
      const pdfBytes = await pdfFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const pages = pdfDoc.getPages();

      const opacity = options?.opacity ?? 0.3;
      const rotation = options?.rotation ?? 45;
      const fontSize = options?.fontSize ?? 48;
      const color = options?.color ?? { r: 0.5, g: 0.5, b: 0.5 };

      pages.forEach(page => {
        const { width, height } = page.getSize();
        page.drawText(watermarkText, {
          x: width / 2 - (watermarkText.length * fontSize) / 4,
          y: height / 2,
          size: fontSize,
          color: rgb(color.r, color.g, color.b),
          opacity,
          rotate: degrees(rotation),
        });
      });

      const watermarkedPdfBytes = await pdfDoc.save();
      return watermarkedPdfBytes;
    } catch (error) {
      console.error('Error adding watermark:', error);
      throw new Error(`Failed to add watermark: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
