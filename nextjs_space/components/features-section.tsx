
'use client';

import { motion } from "framer-motion";
import { 
  FileText, 
  Scissors, 
  Archive, 
  Type, 
  FileImage, 
  PenTool,
  Shield,
  Zap,
  Cloud,
  Users,
  Download,
  Upload
} from "lucide-react";

const features = [
  {
    icon: FileText,
    title: "Merge PDFs",
    description: "Combine multiple PDF files into one document with custom ordering and page selection."
  },
  {
    icon: Scissors,
    title: "Split PDFs", 
    description: "Extract specific pages or split large PDFs into smaller, manageable documents."
  },
  {
    icon: Archive,
    title: "Compress PDFs",
    description: "Reduce file size while maintaining quality with advanced compression algorithms."
  },
  {
    icon: Type,
    title: "PDF to Text",
    description: "Extract text content from PDFs with OCR support for scanned documents."
  },
  {
    icon: FileImage,
    title: "Format Conversion",
    description: "Convert PDFs to Word, Excel, PowerPoint, or images. Convert documents back to PDF."
  },
  {
    icon: PenTool,
    title: "E-Signatures",
    description: "Add digital signatures to your PDFs with legal compliance and verification."
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "Bank-grade encryption, secure processing, and automatic file deletion for privacy."
  },
  {
    icon: Cloud,
    title: "Cloud Storage",
    description: "Store and access your files from anywhere with secure cloud synchronization."
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Process files in seconds with our optimized servers and advanced algorithms."
  }
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 bg-slate-900/50">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center space-y-4 mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
            <span className="bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              Powerful PDF Tools
            </span>
          </h2>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto">
            Everything you need to work with PDFs professionally. From simple conversions to advanced editing, 
            we've got you covered with enterprise-grade tools.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              className="group bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 hover:border-blue-500/50 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-blue-500/10"
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-slate-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 p-8 bg-gradient-to-r from-slate-800/30 to-slate-900/30 rounded-2xl border border-slate-700/50"
        >
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Users className="w-5 h-5 text-blue-400 mr-2" />
              <span className="text-2xl font-bold text-white">100K+</span>
            </div>
            <p className="text-sm text-slate-400">Active Users</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <FileText className="w-5 h-5 text-green-400 mr-2" />
              <span className="text-2xl font-bold text-white">10M+</span>
            </div>
            <p className="text-sm text-slate-400">Files Processed</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Zap className="w-5 h-5 text-yellow-400 mr-2" />
              <span className="text-2xl font-bold text-white">99.9%</span>
            </div>
            <p className="text-sm text-slate-400">Uptime</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Shield className="w-5 h-5 text-red-400 mr-2" />
              <span className="text-2xl font-bold text-white">100%</span>
            </div>
            <p className="text-sm text-slate-400">Secure</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
