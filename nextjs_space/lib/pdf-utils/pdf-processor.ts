
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

  /**
   * Compress PDF by optimizing and removing unnecessary data
   */
  static async compressPDF(
    pdfFile: File,
    options: CompressOptions
  ): Promise<Uint8Array> {
    try {
      const pdfBytes = await pdfFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(pdfBytes);

      // Save with compression options
      const compressedPdfBytes = await pdfDoc.save({
        useObjectStreams: true,
        addDefaultPage: false,
        objectsPerTick: 50,
      });

      return compressedPdfBytes;
    } catch (error) {
      console.error('Error compressing PDF:', error);
      throw new Error(`Failed to compress PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Encrypt PDF with password protection
   * Note: Current pdf-lib version doesn't support password encryption.
   * This is a placeholder for future implementation with a specialized encryption library.
   */
  static async encryptPDF(
    pdfFile: File,
    ownerPassword: string,
    userPassword: string,
    permissions?: {
      printing?: boolean;
      modifying?: boolean;
      copying?: boolean;
      annotating?: boolean;
    }
  ): Promise<Uint8Array> {
    try {
      // For now, just return the original PDF
      // TODO: Implement proper encryption using pdf-lib-encrypt or similar library
      const pdfBytes = await pdfFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(pdfBytes);

      // Save PDF (without encryption for now)
      const savedPdfBytes = await pdfDoc.save();

      return savedPdfBytes;
    } catch (error) {
      console.error('Error processing PDF:', error);
      throw new Error(`Failed to process PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Split PDF into page ranges
   */
  static async splitPDFByRanges(
    pdfFile: File,
    ranges: { start: number; end: number }[]
  ): Promise<Uint8Array[]> {
    try {
      const pdfBytes = await pdfFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const splitPdfs: Uint8Array[] = [];

      for (const range of ranges) {
        const newPdf = await PDFDocument.create();
        const pageIndices = [];
        
        for (let i = range.start - 1; i < range.end && i < pdfDoc.getPageCount(); i++) {
          pageIndices.push(i);
        }

        const copiedPages = await newPdf.copyPages(pdfDoc, pageIndices);
        copiedPages.forEach(page => newPdf.addPage(page));
        
        const pdfBytes = await newPdf.save();
        splitPdfs.push(pdfBytes);
      }

      return splitPdfs;
    } catch (error) {
      console.error('Error splitting PDF by ranges:', error);
      throw new Error(`Failed to split PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Convert images to PDF
   */
  static async imagesToPDF(imageFiles: File[]): Promise<Uint8Array> {
    try {
      const pdfDoc = await PDFDocument.create();

      for (const imageFile of imageFiles) {
        const imageBytes = await imageFile.arrayBuffer();
        let image;

        // Determine image type and embed
        if (imageFile.type === 'image/png' || imageFile.name.toLowerCase().endsWith('.png')) {
          image = await pdfDoc.embedPng(imageBytes);
        } else if (
          imageFile.type === 'image/jpeg' ||
          imageFile.type === 'image/jpg' ||
          imageFile.name.toLowerCase().endsWith('.jpg') ||
          imageFile.name.toLowerCase().endsWith('.jpeg')
        ) {
          image = await pdfDoc.embedJpg(imageBytes);
        } else {
          throw new Error(`Unsupported image format: ${imageFile.type || imageFile.name}`);
        }

        // Create page with image dimensions
        const page = pdfDoc.addPage([image.width, image.height]);
        page.drawImage(image, {
          x: 0,
          y: 0,
          width: image.width,
          height: image.height,
        });
      }

      const pdfBytes = await pdfDoc.save();
      return pdfBytes;
    } catch (error) {
      console.error('Error converting images to PDF:', error);
      throw new Error(`Failed to convert images to PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Convert PDF to images (PNG format)
   */
  static async pdfToImages(pdfFile: File, scale: number = 2.0): Promise<Blob[]> {
    try {
      // Dynamic import for pdfjs
      const pdfjsLib = await import('pdfjs-dist');
      
      // Set worker path
      if (typeof window !== 'undefined') {
        pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
      }

      const arrayBuffer = await pdfFile.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      
      const images: Blob[] = [];

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale });

        // Create canvas
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) throw new Error('Could not get canvas context');

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        // Render page to canvas
        await page.render({
          canvasContext: context,
          viewport: viewport,
        }).promise;

        // Convert canvas to blob
        const blob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob((blob) => {
            if (blob) resolve(blob);
            else reject(new Error('Failed to create blob'));
          }, 'image/png');
        });

        images.push(blob);
      }

      return images;
    } catch (error) {
      console.error('Error converting PDF to images:', error);
      throw new Error(`Failed to convert PDF to images: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Extract text from PDF
   */
  static async extractTextFromPDF(pdfFile: File): Promise<string> {
    try {
      // Dynamic import for pdfjs
      const pdfjsLib = await import('pdfjs-dist');
      
      // Set worker path
      if (typeof window !== 'undefined') {
        pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
      }

      const arrayBuffer = await pdfFile.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      
      let fullText = '';

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        
        fullText += `\n--- Page ${pageNum} ---\n${pageText}\n`;
      }

      return fullText.trim();
    } catch (error) {
      console.error('Error extracting text from PDF:', error);
      throw new Error(`Failed to extract text from PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Convert plain text to PDF
   */
  static async textToPDF(textFile: File): Promise<Uint8Array> {
    try {
      const text = await textFile.text();
      const pdfDoc = await PDFDocument.create();
      
      const page = pdfDoc.addPage();
      const { width, height } = page.getSize();
      const fontSize = 12;
      const lineHeight = fontSize * 1.2;
      const margin = 50;
      const maxWidth = width - 2 * margin;
      
      const lines = text.split('\n');
      let yPosition = height - margin;
      
      for (const line of lines) {
        // Simple word wrapping
        const words = line.split(' ');
        let currentLine = '';
        
        for (const word of words) {
          const testLine = currentLine + (currentLine ? ' ' : '') + word;
          const testWidth = testLine.length * (fontSize * 0.5); // Approximate width
          
          if (testWidth > maxWidth && currentLine) {
            page.drawText(currentLine, {
              x: margin,
              y: yPosition,
              size: fontSize,
              color: rgb(0, 0, 0),
            });
            yPosition -= lineHeight;
            currentLine = word;
            
            // Add new page if needed
            if (yPosition < margin) {
              const newPage = pdfDoc.addPage();
              yPosition = newPage.getSize().height - margin;
            }
          } else {
            currentLine = testLine;
          }
        }
        
        // Draw remaining text
        if (currentLine) {
          page.drawText(currentLine, {
            x: margin,
            y: yPosition,
            size: fontSize,
            color: rgb(0, 0, 0),
          });
          yPosition -= lineHeight;
          
          // Add new page if needed
          if (yPosition < margin) {
            const newPage = pdfDoc.addPage();
            yPosition = newPage.getSize().height - margin;
          }
        }
      }
      
      return await pdfDoc.save();
    } catch (error) {
      console.error('Error converting text to PDF:', error);
      throw new Error(`Failed to convert text to PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Convert Markdown to PDF with basic formatting
   */
  static async markdownToPDF(markdownFile: File): Promise<Uint8Array> {
    try {
      const markdown = await markdownFile.text();
      const pdfDoc = await PDFDocument.create();
      
      let currentPage = pdfDoc.addPage();
      let { width, height } = currentPage.getSize();
      const margin = 50;
      const maxWidth = width - 2 * margin;
      let yPosition = height - margin;
      
      // Parse markdown lines
      const lines = markdown.split('\n');
      
      for (const line of lines) {
        let fontSize = 12;
        let text = line;
        let isBold = false;
        
        // Handle headers
        if (line.startsWith('# ')) {
          fontSize = 24;
          text = line.substring(2);
          isBold = true;
        } else if (line.startsWith('## ')) {
          fontSize = 20;
          text = line.substring(3);
          isBold = true;
        } else if (line.startsWith('### ')) {
          fontSize = 16;
          text = line.substring(4);
          isBold = true;
        } else if (line.startsWith('#### ')) {
          fontSize = 14;
          text = line.substring(5);
          isBold = true;
        }
        
        // Remove bold/italic markers (simple implementation)
        text = text.replace(/\*\*/g, '').replace(/\*/g, '').replace(/__/g, '').replace(/_/g, '');
        
        const lineHeight = fontSize * 1.2;
        
        // Check if we need a new page
        if (yPosition < margin + lineHeight) {
          currentPage = pdfDoc.addPage();
          yPosition = currentPage.getSize().height - margin;
        }
        
        // Draw text
        if (text.trim()) {
          // Simple word wrapping
          const words = text.split(' ');
          let currentLine = '';
          
          for (const word of words) {
            const testLine = currentLine + (currentLine ? ' ' : '') + word;
            const testWidth = testLine.length * (fontSize * 0.5);
            
            if (testWidth > maxWidth && currentLine) {
              currentPage.drawText(currentLine, {
                x: margin,
                y: yPosition,
                size: fontSize,
                color: rgb(0, 0, 0),
              });
              yPosition -= lineHeight;
              currentLine = word;
              
              if (yPosition < margin) {
                currentPage = pdfDoc.addPage();
                yPosition = currentPage.getSize().height - margin;
              }
            } else {
              currentLine = testLine;
            }
          }
          
          if (currentLine) {
            currentPage.drawText(currentLine, {
              x: margin,
              y: yPosition,
              size: fontSize,
              color: rgb(0, 0, 0),
            });
            yPosition -= lineHeight;
          }
        } else {
          // Empty line
          yPosition -= fontSize * 0.5;
        }
      }
      
      return await pdfDoc.save();
    } catch (error) {
      console.error('Error converting markdown to PDF:', error);
      throw new Error(`Failed to convert markdown to PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Convert CSV to PDF with table formatting
   */
  static async csvToPDF(csvFile: File): Promise<Uint8Array> {
    try {
      const csvText = await csvFile.text();
      const pdfDoc = await PDFDocument.create();
      
      let currentPage = pdfDoc.addPage();
      let { width, height } = currentPage.getSize();
      const margin = 40;
      const fontSize = 10;
      const lineHeight = fontSize * 1.5;
      let yPosition = height - margin;
      
      // Parse CSV
      const rows = csvText.split('\n').map(row => {
        // Simple CSV parser (handles basic cases)
        const cells: string[] = [];
        let currentCell = '';
        let inQuotes = false;
        
        for (let i = 0; i < row.length; i++) {
          const char = row[i];
          
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === ',' && !inQuotes) {
            cells.push(currentCell.trim());
            currentCell = '';
          } else {
            currentCell += char;
          }
        }
        
        cells.push(currentCell.trim());
        return cells;
      }).filter(row => row.some(cell => cell));
      
      if (rows.length === 0) {
        throw new Error('CSV file is empty');
      }
      
      // Calculate column widths
      const numColumns = Math.max(...rows.map(row => row.length));
      const columnWidth = (width - 2 * margin) / numColumns;
      
      // Draw table
      for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
        const row = rows[rowIndex];
        
        // Check if we need a new page
        if (yPosition < margin + lineHeight) {
          currentPage = pdfDoc.addPage();
          yPosition = currentPage.getSize().height - margin;
        }
        
        // Draw header with background (first row)
        if (rowIndex === 0) {
          currentPage.drawRectangle({
            x: margin,
            y: yPosition - lineHeight + 2,
            width: width - 2 * margin,
            height: lineHeight,
            color: rgb(0.9, 0.9, 0.9),
          });
        }
        
        // Draw cells
        for (let colIndex = 0; colIndex < row.length; colIndex++) {
          const cell = row[colIndex];
          const xPosition = margin + colIndex * columnWidth;
          
          // Truncate text if too long
          let displayText = cell;
          const maxChars = Math.floor(columnWidth / (fontSize * 0.5));
          if (displayText.length > maxChars) {
            displayText = displayText.substring(0, maxChars - 3) + '...';
          }
          
          currentPage.drawText(displayText, {
            x: xPosition + 5,
            y: yPosition,
            size: fontSize,
            color: rgb(0, 0, 0),
          });
          
          // Draw cell border
          currentPage.drawLine({
            start: { x: xPosition, y: yPosition - lineHeight + 2 },
            end: { x: xPosition, y: yPosition + lineHeight - 2 },
            thickness: 0.5,
            color: rgb(0.7, 0.7, 0.7),
          });
        }
        
        // Draw horizontal line
        currentPage.drawLine({
          start: { x: margin, y: yPosition - lineHeight + 2 },
          end: { x: width - margin, y: yPosition - lineHeight + 2 },
          thickness: rowIndex === 0 ? 1 : 0.5,
          color: rgb(0.7, 0.7, 0.7),
        });
        
        yPosition -= lineHeight;
      }
      
      // Draw final borders
      currentPage.drawLine({
        start: { x: margin, y: yPosition + lineHeight },
        end: { x: width - margin, y: yPosition + lineHeight },
        thickness: 0.5,
        color: rgb(0.7, 0.7, 0.7),
      });
      
      currentPage.drawLine({
        start: { x: width - margin, y: height - margin + lineHeight - 2 },
        end: { x: width - margin, y: yPosition + lineHeight },
        thickness: 0.5,
        color: rgb(0.7, 0.7, 0.7),
      });
      
      return await pdfDoc.save();
    } catch (error) {
      console.error('Error converting CSV to PDF:', error);
      throw new Error(`Failed to convert CSV to PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Add page numbers to PDF
   */
  static async addPageNumbers(
    pdfFile: File,
    options?: {
      position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
      format?: 'number' | 'page-x-of-y';
      fontSize?: number;
      color?: { r: number; g: number; b: number };
      startFrom?: number;
    }
  ): Promise<Uint8Array> {
    try {
      const pdfBytes = await pdfFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const pages = pdfDoc.getPages();

      const position = options?.position ?? 'bottom-center';
      const format = options?.format ?? 'page-x-of-y';
      const fontSize = options?.fontSize ?? 12;
      const color = options?.color ?? { r: 0, g: 0, b: 0 };
      const startFrom = options?.startFrom ?? 1;

      pages.forEach((page, index) => {
        const { width, height } = page.getSize();
        const pageNumber = index + startFrom;
        const totalPages = pages.length;
        
        let text = '';
        if (format === 'number') {
          text = pageNumber.toString();
        } else {
          text = `Page ${pageNumber} of ${totalPages}`;
        }

        // Calculate position
        let x = 0;
        let y = 0;
        const margin = 30;

        if (position.includes('left')) {
          x = margin;
        } else if (position.includes('center')) {
          x = width / 2 - (text.length * fontSize) / 4;
        } else if (position.includes('right')) {
          x = width - margin - (text.length * fontSize) / 2;
        }

        if (position.includes('top')) {
          y = height - margin;
        } else if (position.includes('bottom')) {
          y = margin;
        }

        page.drawText(text, {
          x,
          y,
          size: fontSize,
          color: rgb(color.r, color.g, color.b),
        });
      });

      const numberedPdfBytes = await pdfDoc.save();
      return numberedPdfBytes;
    } catch (error) {
      console.error('Error adding page numbers:', error);
      throw new Error(`Failed to add page numbers: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Organize PDF pages (reorder or delete)
   */
  static async organizePDF(
    pdfFile: File,
    pageOrder: number[] // Array of page numbers in desired order (1-based)
  ): Promise<Uint8Array> {
    try {
      const pdfBytes = await pdfFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const newPdf = await PDFDocument.create();

      const pageIndices = pageOrder.map(num => num - 1);
      const copiedPages = await newPdf.copyPages(pdfDoc, pageIndices);
      copiedPages.forEach(page => newPdf.addPage(page));

      const organizedPdfBytes = await newPdf.save();
      return organizedPdfBytes;
    } catch (error) {
      console.error('Error organizing PDF:', error);
      throw new Error(`Failed to organize PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Crop PDF pages
   */
  static async cropPDF(
    pdfFile: File,
    margins: {
      top?: number;
      bottom?: number;
      left?: number;
      right?: number;
    }
  ): Promise<Uint8Array> {
    try {
      const pdfBytes = await pdfFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const pages = pdfDoc.getPages();

      const top = margins.top ?? 0;
      const bottom = margins.bottom ?? 0;
      const left = margins.left ?? 0;
      const right = margins.right ?? 0;

      pages.forEach(page => {
        const { width, height } = page.getSize();
        page.setCropBox(
          left,
          bottom,
          width - left - right,
          height - top - bottom
        );
      });

      const croppedPdfBytes = await pdfDoc.save();
      return croppedPdfBytes;
    } catch (error) {
      console.error('Error cropping PDF:', error);
      throw new Error(`Failed to crop PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Add text annotation to PDF (basic edit)
   */
  static async addTextAnnotation(
    pdfFile: File,
    annotations: Array<{
      text: string;
      pageNumber: number;
      x: number;
      y: number;
      fontSize?: number;
      color?: { r: number; g: number; b: number };
    }>
  ): Promise<Uint8Array> {
    try {
      const pdfBytes = await pdfFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const pages = pdfDoc.getPages();

      annotations.forEach(annotation => {
        const pageIndex = annotation.pageNumber - 1;
        if (pageIndex >= 0 && pageIndex < pages.length) {
          const page = pages[pageIndex];
          const fontSize = annotation.fontSize ?? 12;
          const color = annotation.color ?? { r: 0, g: 0, b: 0 };

          page.drawText(annotation.text, {
            x: annotation.x,
            y: annotation.y,
            size: fontSize,
            color: rgb(color.r, color.g, color.b),
          });
        }
      });

      const annotatedPdfBytes = await pdfDoc.save();
      return annotatedPdfBytes;
    } catch (error) {
      console.error('Error adding text annotation:', error);
      throw new Error(`Failed to add text annotation: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
