import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ViralyzWordmark } from "@/components/ViralyzWordmark";

export default function Privacy() {
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
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
        <div className="prose prose-invert prose-slate max-w-none space-y-6 text-slate-300">
          <p className="text-slate-400">Last updated: January 2026</p>
          
          <h2 className="text-2xl font-semibold text-white mt-8">1. Information We Collect</h2>
          <p>We collect information you provide directly to us, such as when you create an account, upload content for analysis, or contact us for support. This may include:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Account information (name, email address)</li>
            <li>Content you upload for viral score analysis</li>
            <li>Usage data and analytics</li>
            <li>Payment information (processed securely via PayPal)</li>
          </ul>

          <h2 className="text-2xl font-semibold text-white mt-8">2. How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Provide, maintain, and improve our services</li>
            <li>Process your content analyses and generate viral scores</li>
            <li>Send you technical notices and support messages</li>
            <li>Respond to your comments and questions</li>
          </ul>

          <h2 className="text-2xl font-semibold text-white mt-8">3. Information Sharing</h2>
          <p>We do not sell, trade, or otherwise transfer your personal information to third parties. We may share information only in the following circumstances:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>With your consent</li>
            <li>To comply with legal obligations</li>
            <li>To protect our rights and prevent fraud</li>
          </ul>

          <h2 className="text-2xl font-semibold text-white mt-8">4. Data Security</h2>
          <p>We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>

          <h2 className="text-2xl font-semibold text-white mt-8">5. Your Rights</h2>
          <p>You have the right to access, correct, or delete your personal information. You may also request a copy of your data or ask us to restrict processing in certain circumstances.</p>

          <h2 className="text-2xl font-semibold text-white mt-8">6. Contact Us</h2>
          <p>If you have any questions about this Privacy Policy, please contact us at privacy@viralyz.app</p>
        </div>
      </motion.main>
    </div>
  );
}
