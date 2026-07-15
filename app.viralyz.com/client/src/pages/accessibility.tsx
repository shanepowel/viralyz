import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ViralyzWordmark } from "@/components/ViralyzWordmark";

export default function Accessibility() {
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
        <h1 className="text-4xl font-bold mb-8">Accessibility Statement</h1>
        <div className="prose prose-invert prose-slate max-w-none space-y-6 text-slate-300">
          <p className="text-slate-400">Last updated: January 2026</p>
          
          <h2 className="text-2xl font-semibold text-white mt-8">Our Commitment</h2>
          <p>Viralyz is committed to ensuring digital accessibility for people with disabilities. We are continually improving the user experience for everyone and applying the relevant accessibility standards.</p>

          <h2 className="text-2xl font-semibold text-white mt-8">Conformance Status</h2>
          <p>We aim to conform to the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA. These guidelines explain how to make web content more accessible for people with disabilities.</p>

          <h2 className="text-2xl font-semibold text-white mt-8">Accessibility Features</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Keyboard navigation support throughout the application</li>
            <li>Screen reader compatible content structure</li>
            <li>Sufficient color contrast ratios</li>
            <li>Resizable text without loss of functionality</li>
            <li>Alternative text for images</li>
            <li>Clear and consistent navigation</li>
          </ul>

          <h2 className="text-2xl font-semibold text-white mt-8">Known Limitations</h2>
          <p>While we strive for full accessibility, some content may have limitations:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Some third-party content may not be fully accessible</li>
            <li>Older PDF documents may not be fully accessible</li>
          </ul>

          <h2 className="text-2xl font-semibold text-white mt-8">Feedback</h2>
          <p>We welcome your feedback on the accessibility of Viralyz. Please let us know if you encounter accessibility barriers:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Email: accessibility@viralyz.app</li>
          </ul>

          <h2 className="text-2xl font-semibold text-white mt-8">Enforcement Procedure</h2>
          <p>If you are not satisfied with our response, you may escalate your complaint to the relevant regulatory authority in your jurisdiction.</p>
        </div>
      </motion.main>
    </div>
  );
}
