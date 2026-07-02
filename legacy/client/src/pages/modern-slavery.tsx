import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ViralyzWordmark } from "@/components/ViralyzWordmark";

export default function ModernSlavery() {
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
        <h1 className="text-4xl font-bold mb-8">Modern Slavery Statement</h1>
        <div className="prose prose-invert prose-slate max-w-none space-y-6 text-slate-300">
          <p className="text-slate-400">Financial Year 2025-2026</p>
          
          <h2 className="text-2xl font-semibold text-white mt-8">Our Commitment</h2>
          <p>Viralyz is committed to preventing modern slavery and human trafficking in our operations and supply chain. We have zero tolerance for any form of modern slavery, including forced labor, child labor, and human trafficking.</p>

          <h2 className="text-2xl font-semibold text-white mt-8">Our Business</h2>
          <p>Viralyz is a technology company providing AI-powered content analysis services to content creators worldwide. Our operations are primarily digital, with team members working remotely across various locations.</p>

          <h2 className="text-2xl font-semibold text-white mt-8">Our Supply Chain</h2>
          <p>Our supply chain primarily consists of:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Cloud infrastructure providers</li>
            <li>Software and technology vendors</li>
            <li>Payment processing services</li>
            <li>Professional services providers</li>
          </ul>

          <h2 className="text-2xl font-semibold text-white mt-8">Due Diligence</h2>
          <p>We conduct due diligence on our suppliers and partners to ensure they share our commitment to ethical practices. This includes:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Reviewing supplier policies and certifications</li>
            <li>Including anti-slavery clauses in contracts</li>
            <li>Monitoring supplier compliance</li>
          </ul>

          <h2 className="text-2xl font-semibold text-white mt-8">Reporting Concerns</h2>
          <p>If you have any concerns about modern slavery or human trafficking related to our business, please contact us at ethics@viralyz.app</p>
        </div>
      </motion.main>
    </div>
  );
}
