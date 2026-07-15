import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, Download, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ViralyzWordmark } from "@/components/ViralyzWordmark";


export default function Press() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <nav className="border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <ViralyzWordmark size={28} variant="light" className="cursor-pointer" />
            </Link>
            <Link href="/">
              <Button variant="ghost" className="text-slate-400 hover:text-white">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto px-6 py-12"
      >
        <h1 className="text-4xl font-bold mb-4">Press Centre</h1>
        <p className="text-xl text-slate-400 mb-12">Resources for journalists and media professionals</p>
        
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-4">About Viralyz</h2>
            <p className="text-slate-400 mb-4">
              Viralyz is the "Grammarly for viral content" - an AI-powered platform that analyzes content before posting to predict viral potential and provide optimization recommendations.
            </p>
            <p className="text-slate-400">
              Founded in 2025, Viralyz helps over 10,000 content creators optimize their videos, images, and posts for maximum engagement across YouTube, TikTok, Instagram, and other platforms.
            </p>
          </div>

          <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-4">Key Facts</h2>
            <ul className="space-y-3 text-slate-400">
              <li><strong className="text-white">Founded:</strong> 2025</li>
              <li><strong className="text-white">Headquarters:</strong> San Francisco, CA</li>
              <li><strong className="text-white">Users:</strong> 10,000+ content creators</li>
              <li><strong className="text-white">Platforms:</strong> YouTube, TikTok, Instagram, Twitter, LinkedIn</li>
              <li><strong className="text-white">Prediction Accuracy:</strong> 78% average</li>
            </ul>
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Brand Assets</h2>
          <p className="text-slate-400 mb-6">Download our logo and brand assets for press use.</p>
          <div className="flex flex-wrap gap-4">
            <div className="bg-slate-800/50 rounded-xl p-6 flex items-center gap-4">
              <ViralyzWordmark size={56} variant="light" />
              <div>
                <p className="font-medium">Viralyz Full Logo</p>
                <p className="text-sm text-slate-400">PNG - Primary Brand Asset</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-4">Media Contact</h2>
          <p className="text-slate-400 mb-4">For press inquiries, interviews, or additional information:</p>
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-indigo-400" />
            <a href="mailto:press@viralyz.app" className="text-indigo-400 hover:text-indigo-300 transition-colors">
              press@viralyz.app
            </a>
          </div>
        </div>
      </motion.main>
    </div>
  );
}
