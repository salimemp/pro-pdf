
'use client';

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { FileUpload } from "@/components/file-upload";
import { 
  FileText, 
  Scissors, 
  Archive, 
  Type, 
  FileImage, 
  PenTool,
  Crown,
  Upload,
  History,
  Settings,
  BarChart3
} from "lucide-react";
import { motion } from "framer-motion";

const pdfTools = [
  {
    id: 'merge',
    title: 'Merge PDFs',
    description: 'Combine multiple PDF files',
    icon: FileText,
    color: 'bg-blue-500'
  },
  {
    id: 'split',
    title: 'Split PDF',
    description: 'Extract pages from PDF',
    icon: Scissors,
    color: 'bg-green-500'
  },
  {
    id: 'compress',
    title: 'Compress PDF',
    description: 'Reduce file size',
    icon: Archive,
    color: 'bg-yellow-500'
  },
  {
    id: 'extract-text',
    title: 'Extract Text',
    description: 'Get text from PDF',
    icon: Type,
    color: 'bg-purple-500'
  },
  {
    id: 'convert',
    title: 'Convert',
    description: 'PDF to Word, Excel, etc.',
    icon: FileImage,
    color: 'bg-pink-500'
  },
  {
    id: 'sign',
    title: 'E-Sign',
    description: 'Add digital signatures',
    icon: PenTool,
    color: 'bg-red-500'
  }
];

export function DashboardContent() {
  const { data: session } = useSession() || {};
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);

  const isPremium = (session?.user as any)?.isPremium;
  const maxFileSize = isPremium ? 1024 * 1024 * 1024 : 10 * 1024 * 1024; // 1GB vs 10MB

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <Header />
      
      <main className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Welcome back, {session?.user?.name?.split(' ')[0] || 'User'}!
              </h1>
              <p className="text-slate-400">
                Choose a tool to get started with your PDF workflow
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              {isPremium ? (
                <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                  <Crown className="w-3 h-3 mr-1" />
                  Premium
                </Badge>
              ) : (
                <Button variant="outline" className="border-blue-500 text-blue-400 hover:bg-blue-500/10">
                  <Crown className="w-4 h-4 mr-2" />
                  Upgrade to Premium
                </Button>
              )}
            </div>
          </div>

          {/* Usage Stats */}
          {isPremium && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-400">
                    Files Processed
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">127</div>
                  <p className="text-xs text-green-400">+12 this month</p>
                </CardContent>
              </Card>
              
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-400">
                    Storage Used
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">2.4 GB</div>
                  <Progress value={24} className="mt-2 h-1" />
                  <p className="text-xs text-slate-400 mt-1">24% of 10GB</p>
                </CardContent>
              </Card>
              
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-400">
                    Time Saved
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">47h</div>
                  <p className="text-xs text-blue-400">This month</p>
                </CardContent>
              </Card>
            </div>
          )}
        </motion.div>

        {/* File Upload Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-8"
        >
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <Upload className="w-5 h-5 mr-2" />
                Upload Files
              </CardTitle>
              <CardDescription className="text-slate-400">
                Upload your PDFs and other documents to get started
                {!isPremium && " (Max 10MB per file)"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FileUpload
                onFilesSelected={setSelectedFiles}
                maxFiles={isPremium ? 50 : 5}
                maxSize={maxFileSize}
                acceptedTypes={[
                  'application/pdf',
                  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                  'image/*'
                ]}
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* PDF Tools Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-white mb-6">PDF Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pdfTools.map((tool, index) => (
              <motion.div
                key={tool.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
                whileHover={{ scale: 1.02 }}
                className="cursor-pointer"
                onClick={() => setSelectedTool(tool.id)}
              >
                <Card className={`bg-slate-800/50 border-slate-700 hover:border-blue-500/50 transition-all duration-300 h-full ${
                  selectedTool === tool.id ? 'ring-2 ring-blue-500/50 border-blue-500' : ''
                }`}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className={`w-10 h-10 rounded-lg ${tool.color} flex items-center justify-center`}>
                        <tool.icon className="w-5 h-5 text-white" />
                      </div>
                      {selectedFiles.length > 0 && selectedTool === tool.id && (
                        <Badge className="bg-green-500/20 text-green-300">
                          Ready
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardTitle className="text-white text-lg mb-1">
                      {tool.title}
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                      {tool.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Process Button */}
        {selectedFiles.length > 0 && selectedTool && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <Button 
              size="lg" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
              onClick={() => {
                const toolRoutes: Record<string, string> = {
                  merge: '/tools/merge',
                  split: '/tools/split', 
                  compress: '/tools/compress',
                  'extract-text': '/tools/convert',
                  convert: '/tools/convert',
                  sign: '/tools/convert'
                };
                const route = toolRoutes[selectedTool] || '/tools/merge';
                window.location.href = route;
              }}
            >
              Process {selectedFiles.length} File{selectedFiles.length > 1 ? 's' : ''} 
              with {pdfTools.find(t => t.id === selectedTool)?.title}
            </Button>
          </motion.div>
        )}

        {/* Quick Access Sidebar */}
        <div className="fixed right-4 top-1/2 transform -translate-y-1/2 space-y-2 hidden xl:block">
          <Button
            variant="outline"
            size="icon"
            className="bg-slate-800/50 border-slate-600 hover:bg-slate-700"
          >
            <History className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="bg-slate-800/50 border-slate-600 hover:bg-slate-700"
          >
            <BarChart3 className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="bg-slate-800/50 border-slate-600 hover:bg-slate-700"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </main>
    </div>
  );
}
