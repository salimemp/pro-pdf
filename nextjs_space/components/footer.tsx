
'use client';

import Link from "next/link";
import { FileText, Mail, MapPin, Phone } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-800">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="relative">
                <FileText className="h-8 w-8 text-blue-500" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-400 rounded-full animate-pulse" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                PRO PDF
              </span>
            </Link>
            <p className="text-slate-400 text-sm max-w-xs">
              Professional PDF tools for modern professionals. Convert, edit, and manage PDFs with enterprise-grade security.
            </p>
          </div>

          {/* Product Links */}
          <div className="space-y-4">
            <h4 className="text-white font-semibold">Tools</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/tools/merge" className="text-slate-400 hover:text-blue-400 transition-colors">
                  Merge PDFs
                </Link>
              </li>
              <li>
                <Link href="/tools/split" className="text-slate-400 hover:text-blue-400 transition-colors">
                  Split PDFs
                </Link>
              </li>
              <li>
                <Link href="/tools/compress" className="text-slate-400 hover:text-blue-400 transition-colors">
                  Compress PDFs
                </Link>
              </li>
              <li>
                <Link href="/tools/convert" className="text-slate-400 hover:text-blue-400 transition-colors">
                  Convert PDFs
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div className="space-y-4">
            <h4 className="text-white font-semibold">Company</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="text-slate-400 hover:text-blue-400 transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-slate-400 hover:text-blue-400 transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/help" className="text-slate-400 hover:text-blue-400 transition-colors">
                  Help Center
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-white font-semibold">Get in Touch</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-slate-400" />
                <span className="text-slate-400">support@propdf.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-slate-400" />
                <span className="text-slate-400">1-800-PDF-HELP</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span className="text-slate-400">San Francisco, CA</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-800">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-slate-400">
              © 2024 PRO PDF. All rights reserved.
            </div>
            <div className="flex items-center space-x-6 text-sm">
              <Link href="/privacy" className="text-slate-400 hover:text-blue-400 transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-slate-400 hover:text-blue-400 transition-colors">
                Terms of Service
              </Link>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full" />
                <span className="text-slate-400">All systems operational</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
