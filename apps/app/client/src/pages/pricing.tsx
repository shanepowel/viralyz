import { Button } from "@/components/ui/button";
import { TrendingUp, Check, Sparkles, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "wouter";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for getting started",
    features: [
      "Up to 10 video uploads/month",
      "Basic analytics",
      "1 Community Tribe",
      "Standard video quality",
      "Community support",
    ],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Creator",
    price: "$19",
    period: "/month",
    description: "For growing creators",
    features: [
      "Unlimited video uploads",
      "Advanced analytics",
      "5 Community Tribes",
      "HD video quality",
      "Course creation (1 course)",
      "Priority support",
      "Custom branding",
    ],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "Pro",
    price: "$49",
    period: "/month",
    description: "For professional creators",
    features: [
      "Everything in Creator",
      "4K video quality",
      "Unlimited Tribes",
      "Unlimited courses",
      "Team collaboration",
      "API access",
      "Dedicated support",
      "Custom domain",
    ],
    cta: "Start Free Trial",
    popular: false,
  },
];

export default function Pricing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 backdrop-blur-xl bg-background/80 border-b border-border">
        <Link href="/">
          <div className="flex items-center gap-2 cursor-pointer">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-foreground" />
            </div>
            <span className="text-xl font-bold font-display tracking-tight">Viralyz</span>
          </div>
        </Link>
        <div className="hidden md:flex items-center gap-8">
          <Link href="/features" className="text-foreground/60 hover:text-foreground transition-colors">Features</Link>
          <Link href="/pricing" className="text-foreground font-medium">Pricing</Link>
          <Link href="/about" className="text-foreground/60 hover:text-foreground transition-colors">About</Link>
          <Link href="/contact" className="text-foreground/60 hover:text-foreground transition-colors">Contact</Link>
        </div>
        <div className="flex items-center gap-4">
          <a href="/api/login">
            <Button variant="ghost" className="text-foreground/80 hover:text-foreground">Log In</Button>
          </a>
          <a href="/api/login">
            <Button className="bg-primary hover:bg-primary/90 rounded-full px-6">Get Started Free</Button>
          </a>
        </div>
      </nav>

      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-4 py-2 text-sm mb-6">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-primary">Simple Pricing</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black font-display tracking-tight mb-6">
              Choose your <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">plan</span>
            </h1>
            <p className="text-xl text-foreground/60 max-w-2xl mx-auto">
              Start free and upgrade as you grow. No hidden fees, cancel anytime.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="pb-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className={`relative p-8 rounded-3xl border ${
                  plan.popular 
                    ? 'bg-gradient-to-b from-primary/20 to-transparent border-primary/50' 
                    : 'bg-secondary border-border'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white text-sm font-bold px-4 py-1 rounded-full">
                    Most Popular
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black">{plan.price}</span>
                    <span className="text-foreground/60">{plan.period}</span>
                  </div>
                  <p className="text-foreground/60 text-sm mt-2">{plan.description}</p>
                </div>
                
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-3 text-sm">
                      <div className={`h-5 w-5 rounded-full ${plan.popular ? 'bg-primary/20' : 'bg-secondary'} flex items-center justify-center`}>
                        <Check className={`h-3 w-3 ${plan.popular ? 'text-primary' : 'text-foreground/60'}`} />
                      </div>
                      <span className="text-foreground/80">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <a href="/api/login" className="block">
                  <Button 
                    className={`w-full rounded-full h-12 font-bold ${
                      plan.popular 
                        ? 'bg-white text-black hover:bg-white/90' 
                        : 'bg-secondary text-foreground hover:bg-white/20'
                    }`}
                  >
                    {plan.cta}
                  </Button>
                </a>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6 border-t border-border">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold font-display text-center mb-12">Frequently Asked Questions</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              { q: "Can I switch plans anytime?", a: "Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately." },
              { q: "Is there a free trial?", a: "Yes, all paid plans come with a 14-day free trial. No credit card required." },
              { q: "What payment methods do you accept?", a: "We accept all major credit cards, PayPal, and bank transfers for annual plans." },
              { q: "Can I cancel anytime?", a: "Absolutely. You can cancel your subscription at any time with no cancellation fees." },
            ].map((faq, i) => (
              <div key={i} className="p-6 rounded-2xl bg-secondary border border-border">
                <h3 className="font-bold mb-2">{faq.q}</h3>
                <p className="text-foreground/60 text-sm">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="p-12 rounded-3xl bg-gradient-to-br from-primary/20 via-accent/10 to-purple-500/10 border border-border">
            <h2 className="text-3xl md:text-4xl font-bold font-display mb-4">Still have questions?</h2>
            <p className="text-foreground/60 mb-8">Our team is here to help you find the perfect plan</p>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="rounded-full border-border bg-secondary text-foreground hover:bg-white/20 gap-2 h-14 px-8">
                Contact Sales <ArrowRight size={20} />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      <footer className="py-12 px-6 border-t border-border">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer">
              <div className="h-6 w-6 rounded bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <TrendingUp className="h-3 w-3 text-foreground" />
              </div>
              <span className="font-bold font-display">Viralyz</span>
            </div>
          </Link>
          <p className="text-sm text-muted-foreground">&copy; 2026 Viralyz. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
