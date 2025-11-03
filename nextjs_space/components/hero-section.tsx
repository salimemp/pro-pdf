
'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/file-upload";
import { ArrowRight, Shield, Zap, Cloud, Star } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n/context";

export function HeroSection() {
  const { t } = useTranslation();
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  return (
    <section className="relative overflow-hidden pt-20 pb-16">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-blue-500/5 to-cyan-500/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            {/* Trust Indicators */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span className="text-sm text-slate-400">{t('hero.trustedBy')}</span>
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-white via-blue-100 to-cyan-100 bg-clip-text text-transparent">
                  {t('hero.title1')}
                </span>
                <br />
                <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  {t('hero.title2')}
                </span>
              </h1>
              <p className="text-xl text-slate-300 leading-relaxed max-w-lg">
                {t('hero.subtitle')}
              </p>
            </div>

            {/* Feature Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="flex items-center space-x-2 bg-slate-800/50 rounded-lg p-3"
              >
                <Shield className="w-5 h-5 text-green-400" />
                <span className="text-sm text-slate-300">{t('hero.secure')}</span>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="flex items-center space-x-2 bg-slate-800/50 rounded-lg p-3"
              >
                <Zap className="w-5 h-5 text-yellow-400" />
                <span className="text-sm text-slate-300">{t('hero.fast')}</span>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="flex items-center space-x-2 bg-slate-800/50 rounded-lg p-3"
              >
                <Cloud className="w-5 h-5 text-blue-400" />
                <span className="text-sm text-slate-300">{t('hero.cloud')}</span>
              </motion.div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3" asChild>
                <Link href="/auth/signup">
                  {t('hero.startFreeTrial')}
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-slate-700 hover:bg-slate-800" asChild>
                <Link href="#features">
                  {t('hero.viewFeatures')}
                </Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 pt-8 border-t border-slate-800">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.5 }}
                className="text-center"
              >
                <div className="text-2xl font-bold text-white">10M+</div>
                <div className="text-sm text-slate-400">{t('hero.filesProcessed')}</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.6 }}
                className="text-center"
              >
                <div className="text-2xl font-bold text-white">99.9%</div>
                <div className="text-sm text-slate-400">{t('hero.uptime')}</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.7 }}
                className="text-center"
              >
                <div className="text-2xl font-bold text-white">100K+</div>
                <div className="text-sm text-slate-400">{t('hero.happyUsers')}</div>
              </motion.div>
            </div>
          </motion.div>

          {/* Right Content - File Upload */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50 shadow-2xl">
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {t('hero.tryNow')}
                  </h3>
                  <p className="text-slate-400 text-sm">
                    {t('hero.uploadInfo')}
                  </p>
                </div>
                
                <FileUpload 
                  onFilesSelected={setUploadedFiles}
                  maxFiles={5}
                  maxSize={10 * 1024 * 1024} // 10MB for guest users
                />
                
                {uploadedFiles.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-2"
                  >
                    <p className="text-sm text-slate-300">
                      {uploadedFiles.length} {t('hero.filesReady')}
                    </p>
                    <Button className="w-full bg-green-600 hover:bg-green-700" asChild>
                      <Link href="/tools/merge">
                        {t('hero.continueToTools')}
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Link>
                    </Button>
                  </motion.div>
                )}
              </div>
            </div>
            
            {/* Floating Elements */}
            <motion.div
              animate={{ y: [-10, 10, -10] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute -top-6 -right-6 w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center"
            >
              <Shield className="w-6 h-6 text-blue-400" />
            </motion.div>
            <motion.div
              animate={{ y: [10, -10, 10] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute -bottom-6 -left-6 w-12 h-12 bg-cyan-500/20 rounded-full flex items-center justify-center"
            >
              <Zap className="w-6 h-6 text-cyan-400" />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
