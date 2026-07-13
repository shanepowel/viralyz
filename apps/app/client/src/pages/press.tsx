import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, Download, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ViralyzWordmark } from "@/components/ViralyzWordmark";


export default function Press() {
  return (
    <div className="min-h-screen bg-card text-foreground">
      <nav className="border-b border-border bg-card/80 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <ViralyzWordmark size={28} variant="light" className="cursor-pointer" />
            </Link>
            <Link href="/">
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
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
        <p className="text-xl text-muted-foreground mb-12">Resources for journalists and media professionals</p>
        
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-secondary border border-border rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-4">About Viralyz</h2>
            <p className="text-muted-foreground mb-4">
              Viralyz is the "Grammarly for viral content" - an AI-powered platform that analyzes content before posting to predict viral potential and provide optimization recommendations.
            </p>
            <p className="text-muted-foreground">
              Founded in 2025, Viralyz helps over 10,000 content creators optimize their videos, images, and posts for maximum engagement across YouTube, TikTok, Instagram, and other platforms.
            </p>
          </div>

          <div className="bg-secondary border border-border rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-4">Key Facts</h2>
            <ul className="space-y-3 text-muted-foreground">
              <li><strong className="text-foreground">Founded:</strong> 2025</li>
              <li><strong className="text-foreground">Headquarters:</strong> San Francisco, CA</li>
              <li><strong className="text-foreground">Users:</strong> 10,000+ content creators</li>
              <li><strong className="text-foreground">Platforms:</strong> YouTube, TikTok, Instagram, Twitter, LinkedIn</li>
              <li><strong className="text-foreground">Prediction Accuracy:</strong> 78% average</li>
            </ul>
          </div>
        </div>

        <div className="bg-secondary border border-border rounded-2xl p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Brand Assets</h2>
          <p className="text-muted-foreground mb-6">Download our logo and brand assets for press use.</p>
          <div className="flex flex-wrap gap-4">
            <div className="bg-secondary rounded-xl p-6 flex items-center gap-4">
              <ViralyzWordmark size={56} variant="light" />
              <div>
                <p className="font-medium">Viralyz Full Logo</p>
                <p className="text-sm text-muted-foreground">PNG - Primary Brand Asset</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-4">Media Contact</h2>
          <p className="text-muted-foreground mb-4">For press inquiries, interviews, or additional information:</p>
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-primary" />
            <a href="mailto:press@viralyz.app" className="text-primary hover:text-primary transition-colors">
              press@viralyz.app
            </a>
          </div>
        </div>
      </motion.main>
    </div>
  );
}
