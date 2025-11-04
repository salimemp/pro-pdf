'use client';

import { useState } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { EncryptedFileUpload } from "@/components/encrypted-file-upload";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Edit, Download, Plus } from "lucide-react";
import { toast } from "sonner";
import { PDFProcessor } from "@/lib/pdf-utils";

interface Annotation {
  text: string;
  pageNumber: number;
  x: number;
  y: number;
  fontSize: number;
}

export default function EditPage() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string>('');
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [currentAnnotation, setCurrentAnnotation] = useState<Annotation>({
    text: '',
    pageNumber: 1,
    x: 50,
    y: 750,
    fontSize: 12
  });

  const addAnnotation = () => {
    if (!currentAnnotation.text) {
      toast.error("Please enter annotation text");
      return;
    }
    setAnnotations([...annotations, currentAnnotation]);
    setCurrentAnnotation({
      text: '',
      pageNumber: 1,
      x: 50,
      y: 750,
      fontSize: 12
    });
  };

  const handleEdit = async () => {
    if (selectedFiles.length === 0) {
      toast.error("Please select a PDF file");
      return;
    }

    if (annotations.length === 0) {
      toast.error("Please add at least one annotation");
      return;
    }

    setIsProcessing(true);
    
    try {
      const editedBytes = await PDFProcessor.addTextAnnotation(selectedFiles[0], annotations);

      const blob = new Blob([editedBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      setDownloadUrl(url);
      toast.success("PDF edited successfully!");
      setIsProcessing(false);
    } catch (error) {
      console.error('Error:', error);
      toast.error("Failed to edit PDF. Please try again.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <Header />
      
      <main className="container mx-auto max-w-4xl px-4 py-16">
        <div className="space-y-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-600 to-purple-600 flex items-center justify-center">
              <Edit className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">Edit PDF</h1>
              <p className="text-slate-400">Add text annotations</p>
            </div>
          </div>

          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white">Upload PDF</CardTitle>
            </CardHeader>
            <CardContent>
              <EncryptedFileUpload
                onFilesSelected={setSelectedFiles}
                acceptedTypes={["application/pdf"]}
                maxFiles={1}
                maxSize={10 * 1024 * 1024}
              />
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white">Add Annotation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-slate-200">Text</Label>
                <Textarea
                  value={currentAnnotation.text}
                  onChange={(e) => setCurrentAnnotation({ ...currentAnnotation, text: e.target.value })}
                  className="bg-slate-700/50 border-slate-600 text-white"
                  placeholder="Enter annotation text"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-200">Page Number</Label>
                  <Input
                    type="number"
                    min="1"
                    value={currentAnnotation.pageNumber}
                    onChange={(e) => setCurrentAnnotation({ ...currentAnnotation, pageNumber: parseInt(e.target.value) || 1 })}
                    className="bg-slate-700/50 border-slate-600 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-200">Font Size</Label>
                  <Input
                    type="number"
                    min="8"
                    max="72"
                    value={currentAnnotation.fontSize}
                    onChange={(e) => setCurrentAnnotation({ ...currentAnnotation, fontSize: parseInt(e.target.value) || 12 })}
                    className="bg-slate-700/50 border-slate-600 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-200">X Position</Label>
                  <Input
                    type="number"
                    value={currentAnnotation.x}
                    onChange={(e) => setCurrentAnnotation({ ...currentAnnotation, x: parseInt(e.target.value) || 0 })}
                    className="bg-slate-700/50 border-slate-600 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-200">Y Position</Label>
                  <Input
                    type="number"
                    value={currentAnnotation.y}
                    onChange={(e) => setCurrentAnnotation({ ...currentAnnotation, y: parseInt(e.target.value) || 0 })}
                    className="bg-slate-700/50 border-slate-600 text-white"
                  />
                </div>
              </div>
              <Button
                onClick={addAnnotation}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Annotation
              </Button>
            </CardContent>
          </Card>

          {annotations.length > 0 && (
            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white">Annotations ({annotations.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {annotations.map((ann, index) => (
                    <div key={index} className="p-3 bg-slate-700/30 rounded-lg text-slate-200 text-sm">
                      <div>Page {ann.pageNumber}: "{ann.text}"</div>
                      <div className="text-xs text-slate-400">Position: ({ann.x}, {ann.y}), Size: {ann.fontSize}px</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Button
            size="lg"
            onClick={handleEdit}
            disabled={isProcessing || selectedFiles.length === 0}
            className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white"
          >
            {isProcessing ? "Processing..." : "Edit PDF"}
          </Button>

          {downloadUrl && (
            <Button
              size="lg"
              asChild
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              <a href={downloadUrl} download={`edited_${selectedFiles[0]?.name || 'document.pdf'}`}>
                <Download className="mr-2 h-4 w-4" />
                Download
              </a>
            </Button>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
