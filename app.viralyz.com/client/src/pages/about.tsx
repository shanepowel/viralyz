import { Button } from "@/components/ui/button";
import { TrendingUp, Heart, Target, Users, Sparkles, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "wouter";

const team = [
  { name: "Alex Rivera", role: "CEO & Founder", avatar: "Alex", bio: "Former YouTube creator with 2M+ subscribers" },
  { name: "Jordan Kim", role: "CTO", avatar: "Jordan", bio: "Ex-Netflix engineering lead" },
  { name: "Sam Chen", role: "Head of Product", avatar: "Sam", bio: "Built products at TikTok and Instagram" },
  { name: "Taylor Morgan", role: "Head of Community", avatar: "Taylor", bio: "Community building expert, 10+ years" },
];

const values = [
  { icon: Heart, title: "Creator First", description: "Everything we build starts with creators in mind. Your success is our success." },
  { icon: Target, title: "Innovation", description: "We're constantly pushing boundaries to give you the best tools possible." },
  { icon: Users, title: "Community", description: "We believe in the power of communities to transform lives and careers." },
];

export default function About() {
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
          <Link href="/features" className="text-white/60 hover:text-white transition-colors">Features</Link>
          <Link href="/pricing" className="text-white/60 hover:text-white transition-colors">Pricing</Link>
          <Link href="/about" className="text-white font-medium">About</Link>
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
              <span className="text-primary">Our Story</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black font-display tracking-tight mb-6">
              Built by <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">creators</span>,
              <br />for creators
            </h1>
            <p className="text-xl text-white/60 max-w-2xl mx-auto">
              We started Viralyz because we experienced firsthand the challenges of building an audience across fragmented platforms.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <div className="aspect-video rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-br from-primary/30 via-card to-accent/20 flex items-center justify-center">
                <div className="text-center">
                  <div className="flex justify-center -space-x-4 mb-4">
                    {team.map((member, i) => (
                      <img 
                        key={i}
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.avatar}`}
                        className="h-16 w-16 rounded-full border-4 border-card bg-white/10"
                      />
                    ))}
                  </div>
                  <p className="text-white/60 text-sm">Building the future of creator tools</p>
                </div>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="space-y-6">
              <h2 className="text-3xl font-bold font-display">Our Mission</h2>
              <p className="text-white/60 text-lg leading-relaxed">
                We believe every creator deserves a platform that helps them thrive. Too many talented people give up 
                because the tools are too complex, too expensive, or too fragmented.
              </p>
              <p className="text-white/60 text-lg leading-relaxed">
                Viralyz brings together everything you need - content hosting, community building, monetization, and 
                analytics - in one beautiful, intuitive platform. We handle the technology so you can focus on what 
                you do best: creating.
              </p>
              <div className="grid grid-cols-3 gap-6 pt-6">
                <div>
                  <div className="text-3xl font-black text-primary">50K+</div>
                  <div className="text-white/60 text-sm">Active creators</div>
                </div>
                <div>
                  <div className="text-3xl font-black text-accent">10M+</div>
                  <div className="text-white/60 text-sm">Monthly views</div>
                </div>
                <div>
                  <div className="text-3xl font-black text-purple-400">$2M+</div>
                  <div className="text-white/60 text-sm">Paid to creators</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-3xl font-bold font-display mb-4">Our Values</h2>
            <p className="text-white/60">The principles that guide everything we do</p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center p-8"
              >
                <div className="h-16 w-16 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-6">
                  <value.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">{value.title}</h3>
                <p className="text-white/60">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-3xl font-bold font-display mb-4">Meet the Team</h2>
            <p className="text-white/60">The people making Viralyz possible</p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="h-32 w-32 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 mx-auto mb-4 overflow-hidden border-2 border-white/10">
                  <img 
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.avatar}`} 
                    alt={member.name}
                    className="w-full h-full"
                  />
                </div>
                <h3 className="font-bold text-lg">{member.name}</h3>
                <p className="text-primary text-sm mb-2">{member.role}</p>
                <p className="text-white/60 text-sm">{member.bio}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="p-12 rounded-3xl bg-gradient-to-br from-primary/20 via-accent/10 to-purple-500/10 border border-white/10">
            <h2 className="text-3xl md:text-4xl font-bold font-display mb-4">Join our journey</h2>
            <p className="text-white/60 mb-8">Be part of the creator revolution</p>
            <a href="/api/login">
              <Button size="lg" className="rounded-full bg-white text-black hover:bg-white/90 gap-2 font-bold px-10 h-14 text-lg">
                Get Started Free <ArrowRight size={20} />
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
