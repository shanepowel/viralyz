import { Button } from "@/components/ui/button";
import { TrendingUp, Mail, MessageSquare, MapPin, Sparkles, Send } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { useState } from "react";

export default function Contact() {
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

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
          <Link href="/pricing" className="text-foreground/60 hover:text-foreground transition-colors">Pricing</Link>
          <Link href="/about" className="text-foreground/60 hover:text-foreground transition-colors">About</Link>
          <Link href="/contact" className="text-foreground font-medium">Contact</Link>
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
              <span className="text-primary">Get in Touch</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black font-display tracking-tight mb-6">
              We'd love to <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">hear from you</span>
            </h1>
            <p className="text-xl text-foreground/60 max-w-2xl mx-auto">
              Have a question, feedback, or just want to say hi? We're here to help.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="pb-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-1 space-y-8">
              <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                <h2 className="text-2xl font-bold font-display mb-6">Contact Info</h2>
                
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold mb-1">Email</h3>
                      <p className="text-foreground/60">hello@viralyz.app</p>
                      <p className="text-foreground/60">support@viralyz.app</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-xl bg-accent/20 flex items-center justify-center shrink-0">
                      <MessageSquare className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-bold mb-1">Live Chat</h3>
                      <p className="text-foreground/60">Available 9am - 6pm EST</p>
                      <p className="text-foreground/60">Monday to Friday</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-xl bg-purple-500/20 flex items-center justify-center shrink-0">
                      <MapPin className="h-5 w-5 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="font-bold mb-1">Office</h3>
                      <p className="text-foreground/60">123 Creator Way</p>
                      <p className="text-foreground/60">San Francisco, CA 94107</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
            
            <motion.div 
              initial={{ opacity: 0, x: 20 }} 
              whileInView={{ opacity: 1, x: 0 }} 
              viewport={{ once: true }}
              className="lg:col-span-2"
            >
              <div className="p-8 rounded-3xl bg-secondary border border-border">
                {submitted ? (
                  <div className="text-center py-12">
                    <div className="h-16 w-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
                      <Send className="h-8 w-8 text-green-500" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">Message sent!</h3>
                    <p className="text-foreground/60">We'll get back to you as soon as possible.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium mb-2">Name</label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl bg-secondary border border-border focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                          placeholder="Your name"
                          data-testid="input-name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Email</label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl bg-secondary border border-border focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                          placeholder="you@example.com"
                          data-testid="input-email"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Subject</label>
                      <select
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-secondary border border-border focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        data-testid="select-subject"
                      >
                        <option value="">Select a topic</option>
                        <option value="general">General Inquiry</option>
                        <option value="support">Technical Support</option>
                        <option value="sales">Sales</option>
                        <option value="partnership">Partnership</option>
                        <option value="feedback">Feedback</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Message</label>
                      <textarea
                        required
                        rows={5}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-secondary border border-border focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                        placeholder="How can we help you?"
                        data-testid="textarea-message"
                      />
                    </div>
                    
                    <Button type="submit" size="lg" className="w-full rounded-xl h-14 font-bold" data-testid="button-submit">
                      Send Message <Send className="ml-2 h-5 w-5" />
                    </Button>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
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
