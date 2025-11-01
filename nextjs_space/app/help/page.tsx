
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  FileText, 
  Scissors, 
  Archive, 
  Type, 
  FileImage, 
  PenTool,
  HelpCircle,
  Shield,
  Zap
} from "lucide-react";

const helpTopics = [
  {
    icon: FileText,
    title: "Merge PDFs",
    description: "Combine multiple PDF files into a single document",
    steps: [
      "Upload multiple PDF files",
      "Arrange them in your desired order",
      "Click 'Merge PDFs' to combine them",
      "Download your merged document"
    ]
  },
  {
    icon: Scissors,
    title: "Split PDFs",
    description: "Extract specific pages or split into multiple files",
    steps: [
      "Upload your PDF document",
      "Select the pages you want to extract",
      "Choose split method (by pages or ranges)",
      "Download the split documents"
    ]
  },
  {
    icon: Archive,
    title: "Compress PDFs",
    description: "Reduce file size while maintaining quality",
    steps: [
      "Upload your PDF file",
      "Choose compression level",
      "Wait for processing to complete",
      "Download the compressed PDF"
    ]
  },
  {
    icon: Type,
    title: "Extract Text",
    description: "Get text content from PDF documents",
    steps: [
      "Upload your PDF document",
      "Wait for text extraction",
      "Copy or download the extracted text",
      "Use OCR for scanned documents"
    ]
  },
  {
    icon: FileImage,
    title: "Format Conversion",
    description: "Convert PDFs to other formats and vice versa",
    steps: [
      "Upload your document",
      "Select target format (Word, Excel, etc.)",
      "Wait for conversion to complete",
      "Download the converted file"
    ]
  },
  {
    icon: PenTool,
    title: "E-Signatures",
    description: "Add digital signatures to PDF documents",
    steps: [
      "Upload your PDF document",
      "Position signature fields",
      "Sign or upload signature image",
      "Download the signed document"
    ]
  }
];

const faqs = [
  {
    question: "Is my data secure?",
    answer: "Yes, we use bank-grade encryption for all files. Guest files are automatically deleted after processing, while premium users have full control over their stored files."
  },
  {
    question: "What file size limits apply?",
    answer: "Guest users can upload files up to 10MB each. Premium users can upload files up to 1GB each."
  },
  {
    question: "How long are files stored?",
    answer: "Guest files are processed and immediately deleted. Premium users' files are stored until they choose to delete them or cancel their subscription."
  },
  {
    question: "Can I use PRO PDF without an account?",
    answer: "Yes! Guest mode allows you to use all tools without creating an account, though with file size limits and temporary processing."
  },
  {
    question: "What formats are supported?",
    answer: "We support PDF, Word (DOCX), Excel (XLSX), PowerPoint (PPTX), and common image formats (PNG, JPG, GIF, BMP)."
  },
  {
    question: "How do I cancel my subscription?",
    answer: "You can cancel your subscription anytime from your account settings. You'll continue to have access until the end of your billing period."
  }
];

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <Header />
      
      <main className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="space-y-12">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              Help Center
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Learn how to use PRO PDF tools effectively and get answers to common questions.
            </p>
          </div>

          {/* Tool Guides */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-8">How to Use Our Tools</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {helpTopics.map((topic, index) => (
                <Card key={index} className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="flex items-center text-white">
                      <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                        <topic.icon className="w-4 h-4 text-white" />
                      </div>
                      {topic.title}
                    </CardTitle>
                    <p className="text-slate-400 text-sm">{topic.description}</p>
                  </CardHeader>
                  <CardContent>
                    <ol className="space-y-2">
                      {topic.steps.map((step, stepIndex) => (
                        <li key={stepIndex} className="text-sm text-slate-300 flex">
                          <span className="text-blue-400 font-medium mr-2">{stepIndex + 1}.</span>
                          {step}
                        </li>
                      ))}
                    </ol>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* FAQs */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-8">Frequently Asked Questions</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {faqs.map((faq, index) => (
                <Card key={index} className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="flex items-center text-white text-lg">
                      <HelpCircle className="w-5 h-5 text-blue-400 mr-2" />
                      {faq.question}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-300">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Quick Tips */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-8">Quick Tips</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3 mb-3">
                    <Shield className="w-6 h-6 text-green-400" />
                    <h3 className="font-semibold text-white">Security Best Practices</h3>
                  </div>
                  <ul className="space-y-2 text-sm text-slate-300">
                    <li>• Use strong passwords for your account</li>
                    <li>• Don't share sensitive documents publicly</li>
                    <li>• Log out when using shared computers</li>
                    <li>• Enable two-factor authentication</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3 mb-3">
                    <Zap className="w-6 h-6 text-yellow-400" />
                    <h3 className="font-semibold text-white">Performance Tips</h3>
                  </div>
                  <ul className="space-y-2 text-sm text-slate-300">
                    <li>• Use stable internet for large files</li>
                    <li>• Process files during off-peak hours</li>
                    <li>• Compress images before creating PDFs</li>
                    <li>• Use batch operations when possible</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3 mb-3">
                    <FileText className="w-6 h-6 text-blue-400" />
                    <h3 className="font-semibold text-white">File Management</h3>
                  </div>
                  <ul className="space-y-2 text-sm text-slate-300">
                    <li>• Organize files with clear names</li>
                    <li>• Regular cleanup of old files</li>
                    <li>• Use folders for project organization</li>
                    <li>• Keep backup copies when needed</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Contact Support */}
          <section className="text-center">
            <Card className="bg-slate-800/50 border-slate-700 max-w-2xl mx-auto">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-white mb-4">Still Need Help?</h2>
                <p className="text-slate-300 mb-6">
                  Can't find what you're looking for? Our support team is here to help you.
                </p>
                <div className="flex justify-center space-x-4">
                  <a 
                    href="/contact"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    Contact Support
                  </a>
                  <a 
                    href="mailto:support@propdf.com"
                    className="border border-slate-600 hover:bg-slate-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    Email Us
                  </a>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
