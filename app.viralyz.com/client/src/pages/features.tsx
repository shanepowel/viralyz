import { Button } from "@/components/ui/button";
import { Film, Users, BookOpen, BarChart3, Target, Sparkles, TrendingUp, Play, Zap, Shield, Globe, Clock, ArrowRight, Star } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "wouter";

export default function Features() {
  return (
    <div className="min-h-screen bg-background text-white">
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 backdrop-blur-xl bg-background/80 border-b border-white/5">
        <Link href="/">
          <div className="flex items-center gap-2 cursor-pointer">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-white" />
            </div>
            <span className="text-xl font-bold font-display tracking-tight">Viralyz</span>
          </div>
        </Link>
        <div className="hidden md:flex items-center gap-8">
          <Link href="/features" className="text-white font-medium">Features</Link>
          <Link href="/pricing" className="text-white/60 hover:text-white transition-colors">Pricing</Link>
          <Link href="/about" className="text-white/60 hover:text-white transition-colors">About</Link>
          <Link href="/contact" className="text-white/60 hover:text-white transition-colors">Contact</Link>
        </div>
        <div className="flex items-center gap-4">
          <a href="/api/login">
            <Button variant="ghost" className="text-white/80 hover:text-white">Log In</Button>
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
              <span className="text-primary">Powerful Features</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black font-display tracking-tight mb-6">
              Everything you need to <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">succeed</span>
            </h1>
            <p className="text-xl text-white/60 max-w-2xl mx-auto">
              From content creation to community building to monetization, Viralyz has all the tools you need in one platform.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto space-y-32">
          <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="h-14 w-14 rounded-2xl bg-primary/20 flex items-center justify-center">
                <Film className="h-7 w-7 text-primary" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold font-display">Multi-Format Content Hub</h2>
              <p className="text-white/60 text-lg leading-relaxed">
                Upload and share any type of content - short clips, long-form films, ephemeral stories, or stunning photography. 
                Our adaptive player handles everything seamlessly.
              </p>
              <ul className="space-y-3">
                {["Vertical & horizontal video support", "Auto-transcoding for all devices", "Scheduled publishing", "Draft saving & collaboration"].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-white/80">
                    <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center">
                      <Zap className="h-3 w-3 text-primary" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="aspect-video rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-br from-primary/30 via-card to-accent/20 flex items-center justify-center">
                <div className="relative">
                  <div className="h-20 w-20 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center">
                    <Film className="h-10 w-10 text-primary" />
                  </div>
                  <div className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-accent flex items-center justify-center">
                    <Play className="h-3 w-3 text-white fill-white" />
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 h-20 w-20 bg-primary/30 rounded-full blur-2xl" />
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative order-2 lg:order-1">
              <div className="aspect-video rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-br from-accent/30 via-card to-primary/20 flex items-center justify-center">
                <div className="flex -space-x-3">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="h-12 w-12 rounded-full bg-white/10 backdrop-blur border-2 border-card flex items-center justify-center">
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=user${i}`} className="h-10 w-10 rounded-full" />
                    </div>
                  ))}
                  <div className="h-12 w-12 rounded-full bg-accent/20 border-2 border-card flex items-center justify-center text-xs font-bold text-accent">+99</div>
                </div>
              </div>
              <div className="absolute -top-4 -left-4 h-20 w-20 bg-accent/30 rounded-full blur-2xl" />
            </div>
            <div className="space-y-6 order-1 lg:order-2">
              <div className="h-14 w-14 rounded-2xl bg-accent/20 flex items-center justify-center">
                <Users className="h-7 w-7 text-accent" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold font-display">Community Tribes</h2>
              <p className="text-white/60 text-lg leading-relaxed">
                Build engaged communities around your content. Tribes let your fans connect, share, and support each other - 
                creating a loyal audience that grows organically.
              </p>
              <ul className="space-y-3">
                {["Topic-based discussion threads", "Real-time chat channels", "Member roles & moderation", "Exclusive member content"].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-white/80">
                    <div className="h-5 w-5 rounded-full bg-accent/20 flex items-center justify-center">
                      <Zap className="h-3 w-3 text-accent" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="h-14 w-14 rounded-2xl bg-purple-500/20 flex items-center justify-center">
                <BookOpen className="h-7 w-7 text-purple-400" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold font-display">Creator Courses</h2>
              <p className="text-white/60 text-lg leading-relaxed">
                Monetize your expertise with structured courses. Create modules, track student progress, 
                and build a sustainable income stream from your knowledge.
              </p>
              <ul className="space-y-3">
                {["Drag-and-drop course builder", "Progress tracking for students", "Certificates & achievements", "Multiple pricing tiers"].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-white/80">
                    <div className="h-5 w-5 rounded-full bg-purple-500/20 flex items-center justify-center">
                      <Zap className="h-3 w-3 text-purple-400" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="aspect-video rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-br from-purple-500/30 via-card to-pink-500/20 flex items-center justify-center">
                <div className="text-center">
                  <div className="h-16 w-16 mx-auto rounded-2xl bg-purple-500/20 backdrop-blur flex items-center justify-center mb-3">
                    <BookOpen className="h-8 w-8 text-purple-400" />
                  </div>
                  <div className="flex items-center justify-center gap-1">
                    {[1,2,3,4,5].map(i => (
                      <Star key={i} className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    ))}
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 h-20 w-20 bg-purple-500/30 rounded-full blur-2xl" />
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-20 px-6 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-display mb-4">More powerful features</h2>
            <p className="text-white/60">Everything else you need to grow your audience</p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: BarChart3, color: "green", title: "Advanced Analytics", desc: "Deep insights into your audience behavior and content performance" },
              { icon: Target, color: "orange", title: "Smart Discovery", desc: "AI-powered recommendations to get your content seen by the right people" },
              { icon: Shield, color: "blue", title: "Content Protection", desc: "Watermarking and download controls to protect your work" },
              { icon: Globe, color: "cyan", title: "Global CDN", desc: "Lightning-fast content delivery to viewers worldwide" },
              { icon: Clock, color: "pink", title: "Scheduling", desc: "Plan and schedule your content calendar in advance" },
              { icon: Sparkles, color: "yellow", title: "AI Enhancements", desc: "Auto-captions, thumbnails, and content suggestions" },
            ].map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all"
              >
                <feature.icon className={`h-8 w-8 text-${feature.color}-400 mb-4`} />
                <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                <p className="text-white/60 text-sm">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="p-12 rounded-3xl bg-gradient-to-br from-primary/20 via-accent/10 to-purple-500/10 border border-white/10">
            <h2 className="text-3xl md:text-4xl font-bold font-display mb-4">Ready to get started?</h2>
            <p className="text-white/60 mb-8">Join thousands of creators already using Viralyz</p>
            <a href="/api/login">
              <Button size="lg" className="rounded-full bg-white text-black hover:bg-white/90 gap-2 font-bold px-10 h-14 text-lg">
                Start Free Trial <ArrowRight size={20} />
              </Button>
            </a>
          </motion.div>
        </div>
      </section>

      <footer className="py-12 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer">
              <div className="h-6 w-6 rounded bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <TrendingUp className="h-3 w-3 text-white" />
              </div>
              <span className="font-bold font-display">Viralyz</span>
            </div>
          </Link>
          <p className="text-sm text-white/40">&copy; 2026 Viralyz. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
