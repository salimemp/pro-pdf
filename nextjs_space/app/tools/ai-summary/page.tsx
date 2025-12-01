"use client";

import React, { useState } from "react";
import { Sparkles, Upload, FileText, Lightbulb, ListChecks, Zap, Download, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

interface SummaryResult {
  quickSummary: string;
  keyPoints: string[];
  insights: string[];
  actionItems: string[];
  sentiment: string;
  wordCount: number;
  readingTime: number;
}

export default function AISummaryPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<SummaryResult | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.type !== "application/pdf") {
      toast.error("Please select a PDF file");
      return;
    }

    setFile(selectedFile);
    setResult(null);
    toast.success("PDF loaded successfully!");
  };

  const generateSummary = async () => {
    if (!file) return;

    setIsLoading(true);
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/ai-summary", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to generate summary");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let partialRead = "";

      while (true) {
        const { done, value } = await reader!.read();
        if (done) break;

        partialRead += decoder.decode(value, { stream: true });
        let lines = partialRead.split("\n");
        partialRead = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") {
              return;
            }
            try {
              const parsed = JSON.parse(data);
              if (parsed.status === "processing") {
                setProgress(prev => Math.min(prev + 5, 95));
              } else if (parsed.status === "completed") {
                setResult(parsed.result);
                setProgress(100);
                toast.success("Summary generated successfully!");
                return;
              } else if (parsed.status === "error") {
                throw new Error(parsed.message || "Generation failed");
              }
            } catch (e) {
              console.error("Parse error:", e);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to generate summary");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const downloadSummary = () => {
    if (!result) return;

    const content = `
# AI-Generated PDF Summary

## Quick Summary
${result.quickSummary}

## Key Points
${result.keyPoints.map((point, i) => `${i + 1}. ${point}`).join("\n")}

## Insights
${result.insights.map((insight, i) => `${i + 1}. ${insight}`).join("\n")}

## Action Items
${result.actionItems.map((item, i) => `${i + 1}. ${item}`).join("\n")}

## Document Statistics
- Sentiment: ${result.sentiment}
- Word Count: ${result.wordCount}
- Estimated Reading Time: ${result.readingTime} minutes
    `.trim();

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `summary-${file?.name.replace(".pdf", "")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Summary downloaded!");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-purple-500 mb-4">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-2">AI-Powered PDF Summary</h1>
          <p className="text-muted-foreground">
            Generate intelligent summaries, key points, and insights from your PDFs
          </p>
        </div>

        <Card className="p-8 mb-6">
          <div className="space-y-6">
            {/* File Upload */}
            <div>
              <label htmlFor="file-upload" className="block mb-2 text-sm font-medium">
                Upload PDF Document
              </label>
              <Input
                id="file-upload"
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="cursor-pointer"
                disabled={isLoading}
              />
              {file && (
                <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <span>{file.name}</span>
                  <Badge variant="outline">{(file.size / 1024 / 1024).toFixed(2)} MB</Badge>
                </div>
              )}
            </div>

            {/* Generate Button */}
            <Button
              onClick={generateSummary}
              disabled={!file || isLoading}
              className="w-full h-12 text-lg"
            >
              {isLoading ? (
                <>
                  <Zap className="h-5 w-5 mr-2 animate-pulse" />
                  Generating Summary...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5 mr-2" />
                  Generate AI Summary
                </>
              )}
            </Button>

            {/* Progress */}
            {isLoading && (
              <div className="space-y-2">
                <Progress value={progress} className="h-2" />
                <p className="text-xs text-center text-muted-foreground">
                  Analyzing document... {progress}%
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Results */}
        {result && (
          <Card className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Summary Results</h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => copyToClipboard(result.quickSummary)}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
                <Button variant="outline" size="sm" onClick={downloadSummary}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>

            <Tabs defaultValue="summary" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="summary">
                  <FileText className="h-4 w-4 mr-2" />
                  Summary
                </TabsTrigger>
                <TabsTrigger value="keypoints">
                  <ListChecks className="h-4 w-4 mr-2" />
                  Key Points
                </TabsTrigger>
                <TabsTrigger value="insights">
                  <Lightbulb className="h-4 w-4 mr-2" />
                  Insights
                </TabsTrigger>
                <TabsTrigger value="actions">
                  <Zap className="h-4 w-4 mr-2" />
                  Actions
                </TabsTrigger>
              </TabsList>

              <TabsContent value="summary" className="mt-6 space-y-4">
                <div className="prose dark:prose-invert max-w-none">
                  <p className="text-lg leading-relaxed">{result.quickSummary}</p>
                </div>
                <div className="flex gap-4 pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Sentiment: {result.sentiment}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{result.wordCount} words</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{result.readingTime} min read</Badge>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="keypoints" className="mt-6">
                <ul className="space-y-3">
                  {result.keyPoints.map((point, index) => (
                    <li key={index} className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </span>
                      <span className="text-base leading-relaxed">{point}</span>
                    </li>
                  ))}
                </ul>
              </TabsContent>

              <TabsContent value="insights" className="mt-6">
                <div className="space-y-4">
                  {result.insights.map((insight, index) => (
                    <Card key={index} className="p-4 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-950/20 border-violet-200 dark:border-violet-800">
                      <div className="flex gap-3">
                        <Lightbulb className="h-5 w-5 text-violet-600 dark:text-violet-400 flex-shrink-0 mt-0.5" />
                        <p className="text-base leading-relaxed">{insight}</p>
                      </div>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="actions" className="mt-6">
                <div className="space-y-3">
                  {result.actionItems.map((item, index) => (
                    <Card key={index} className="p-4">
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          className="mt-1 h-4 w-4 rounded border-gray-300"
                        />
                        <span className="text-base leading-relaxed">{item}</span>
                      </div>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        )}
      </div>
    </div>
  );
}
