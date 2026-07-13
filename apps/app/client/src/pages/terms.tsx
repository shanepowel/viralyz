import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ViralyzWordmark } from "@/components/ViralyzWordmark";

export default function Terms() {
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
        <h1 className="text-4xl font-bold mb-8">Terms of Use</h1>
        <div className="prose prose-invert prose-slate max-w-none space-y-6 text-muted-foreground">
          <p className="text-muted-foreground">Last updated: January 2026</p>
          
          <h2 className="text-2xl font-semibold text-foreground mt-8">1. Acceptance of Terms</h2>
          <p>By accessing or using Viralyz, you agree to be bound by these Terms of Use. If you do not agree to these terms, please do not use our services.</p>

          <h2 className="text-2xl font-semibold text-foreground mt-8">2. Description of Service</h2>
          <p>Viralyz provides AI-powered content analysis tools that help creators optimize their content for better performance on social media platforms. Our services include viral score analysis, content recommendations, and performance tracking.</p>

          <h2 className="text-2xl font-semibold text-foreground mt-8">3. User Accounts</h2>
          <p>To use certain features, you must create an account. You are responsible for:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Maintaining the confidentiality of your account</li>
            <li>All activities that occur under your account</li>
            <li>Providing accurate and complete information</li>
          </ul>

          <h2 className="text-2xl font-semibold text-foreground mt-8">4. Acceptable Use</h2>
          <p>You agree not to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Use the service for any illegal purpose</li>
            <li>Upload content that infringes intellectual property rights</li>
            <li>Attempt to gain unauthorized access to our systems</li>
            <li>Interfere with or disrupt the service</li>
            <li>Use automated means to access the service without permission</li>
          </ul>

          <h2 className="text-2xl font-semibold text-foreground mt-8">5. Subscription and Payments</h2>
          <p>Paid subscriptions are billed in advance on a monthly basis. You may cancel at any time, but refunds are not provided for partial months. Prices are subject to change with reasonable notice.</p>

          <h2 className="text-2xl font-semibold text-foreground mt-8">6. Intellectual Property</h2>
          <p>You retain ownership of content you upload. By uploading content, you grant us a limited license to analyze and process it for the purpose of providing our services.</p>

          <h2 className="text-2xl font-semibold text-foreground mt-8">7. Disclaimer</h2>
          <p>Our viral scores are predictions based on AI analysis and are not guarantees of actual performance. Results may vary based on numerous factors outside our control.</p>

          <h2 className="text-2xl font-semibold text-foreground mt-8">8. Limitation of Liability</h2>
          <p>To the maximum extent permitted by law, Viralyz shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the service.</p>

          <h2 className="text-2xl font-semibold text-foreground mt-8">9. Changes to Terms</h2>
          <p>We may modify these terms at any time. Continued use of the service after changes constitutes acceptance of the modified terms.</p>

          <h2 className="text-2xl font-semibold text-foreground mt-8">10. Contact</h2>
          <p>For questions about these Terms, contact us at legal@viralyz.app</p>
        </div>
      </motion.main>
    </div>
  );
}
