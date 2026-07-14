import { Link } from "wouter";
import {
  ArrowRight, CheckCircle2, Eye, Filter, Briefcase,
  ShieldCheck, Sparkles, TrendingUp, Users, Check, Menu,
  Radar, Network, FileText, Building2, BarChart3,
} from "lucide-react";
import React, { useEffect, useState } from "react";

const viralyzTheme = `
.viralyz-theme {
  --bg-color: #FFF8F1;
  --bg-alt: #F4EBE1;
  --text-dark: #2A2522;
  --text-muted: #6B625E;
  --accent: #E85D3B;
  --accent-hover: #D15030;
  --card-bg: #FFFFFF;
  --border-subtle: rgba(42, 37, 34, 0.08);
  font-family: 'Inter Tight', system-ui, sans-serif;
  background-color: var(--bg-color);
  color: var(--text-dark);
  min-height: 100vh;
}
.viralyz-theme ::selection { background: var(--accent); color: white; }
.vir-btn-primary {
  background: var(--accent); color: white; border-radius: 9999px;
  padding: 0.75rem 1.5rem; font-weight: 500; transition: all 0.2s ease;
  border: 0; cursor: pointer; display: inline-flex; align-items: center; justify-content: center;
}
.vir-btn-primary:hover { background: var(--accent-hover); transform: translateY(-1px); }
.vir-btn-secondary {
  background: var(--card-bg); color: var(--text-dark);
  border: 1px solid var(--border-subtle); border-radius: 9999px;
  padding: 0.75rem 1.5rem; font-weight: 500; transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0,0,0,0.02); cursor: pointer;
  display: inline-flex; align-items: center; justify-content: center;
}
.vir-btn-secondary:hover { border-color: rgba(42,37,34,0.2); transform: translateY(-1px); }
.vir-card {
  background: var(--card-bg); border-radius: 24px;
  border: 1px solid var(--border-subtle);
  box-shadow: 0 4px 20px rgba(0,0,0,0.03); padding: 2rem;
}
@keyframes vir-float-slow   { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
@keyframes vir-float-medium { 0%,100% { transform: translateY(0) rotate(-2deg); } 50% { transform: translateY(-15px) rotate(0deg); } }
@keyframes vir-float-fast   { 0%,100% { transform: translateY(0) rotate(2deg); } 50% { transform: translateY(-8px) rotate(3deg); } }
.vir-float-slow   { animation: vir-float-slow 6s ease-in-out infinite; }
.vir-float-medium { animation: vir-float-medium 5s ease-in-out infinite; }
.vir-float-fast   { animation: vir-float-fast 4s ease-in-out infinite; }
`;

export default function Landing() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="viralyz-theme">
      <style dangerouslySetInnerHTML={{ __html: viralyzTheme }} />

      {/* Sticky Nav */}
      <header
        className={`sticky top-0 z-50 backdrop-blur-md border-b transition-colors ${
          scrolled ? "bg-[#FFF8F1]/90 border-[rgba(42,37,34,0.08)]" : "bg-[#FFF8F1]/80 border-[rgba(42,37,34,0.05)]"
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 cursor-pointer" data-testid="link-home">
            <div className="w-8 h-8 rounded-lg bg-[#E85D3B] flex items-center justify-center">
              <div className="w-3 h-3 bg-white rounded-sm" />
            </div>
            <span className="font-semibold text-xl tracking-tight">Viralyz</span>
            <span className="ml-1 text-xs font-medium text-[#6B625E] tracking-wide">Signal</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-[#6B625E] font-medium text-sm">
            <a href="#how-it-works" className="hover:text-[#2A2522] transition-colors">Product</a>
            <a href="#modules" className="hover:text-[#2A2522] transition-colors">Modules</a>
            <a href="#pricing" className="hover:text-[#2A2522] transition-colors">Pricing</a>
            <a href="#icp" className="hover:text-[#2A2522] transition-colors">Who it's for</a>
          </nav>
          <div className="hidden md:flex items-center gap-4">
            <a href="/api/login" className="text-sm font-medium hover:text-[#E85D3B] transition-colors" data-testid="link-signin">Sign in</a>
            <a href="#contact" className="vir-btn-primary text-sm py-2 px-4" data-testid="button-cta-nav">Book a demo</a>
          </div>
          <button className="md:hidden text-[#2A2522]" aria-label="Open menu">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-24 pb-20 overflow-hidden relative">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[rgba(42,37,34,0.1)] text-xs font-medium text-[#6B625E] mb-6">
                <Sparkles className="w-3.5 h-3.5 text-[#E85D3B]" />
                <span>Competitive content intelligence for B2B marketing</span>
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight mb-6 text-[#2A2522]">
                Stop guessing what your <span className="text-[#E85D3B]">competitors are really winning with.</span>
              </h1>
              <p className="text-lg md:text-xl text-[#6B625E] mb-8 max-w-lg leading-relaxed">
                You instrument your own content within an inch of its life. Then you look at competitors and scroll LinkedIn, counting likes. Viralyz Signal tells you which of their content is actually driving pipeline, hiring, and category authority. Not which got the most reactions.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <a href="#contact" className="vir-btn-primary w-full sm:w-auto gap-2 text-lg px-8 py-3.5" data-testid="button-cta-hero">
                  Book a demo <ArrowRight className="w-5 h-5" />
                </a>
                <a href="#how-it-works" className="vir-btn-secondary w-full sm:w-auto text-lg px-8 py-3.5" data-testid="button-see-how">
                  See how it works
                </a>
              </div>
              <div className="mt-8 flex items-center gap-4 text-sm text-[#6B625E]">
                <Building2 className="w-5 h-5 text-[#E85D3B]" />
                <p>Built for VPs of Marketing &amp; CMOs at $10&ndash;100M ARR B2B SaaS</p>
              </div>
            </div>

            {/* Right Visuals — Pulse mockups */}
            <div className="relative h-[500px] lg:h-[600px] hidden md:block">
              {/* Top right: weekly pulse card */}
              <div className="absolute top-10 right-4 w-80 bg-white rounded-2xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] border border-[rgba(42,37,34,0.05)] p-5 vir-float-slow z-20">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <div className="text-[10px] font-bold tracking-wider text-[#6B625E] uppercase">This week's pulse</div>
                    <div className="text-sm font-semibold text-[#2A2522]">Acme Cloud</div>
                  </div>
                  <div className="px-2 py-1 bg-[#E85D3B]/10 text-[#E85D3B] text-[10px] font-bold rounded uppercase tracking-wider">+38%</div>
                </div>
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#6B625E]">Themes pushed</span>
                    <span className="font-medium text-[#2A2522]">"AI agents", "compliance"</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#6B625E]">Qualified engagement</span>
                    <span className="font-medium text-[#2A2522]">142 buyer-shaped</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#6B625E]">Velocity vs last month</span>
                    <span className="font-medium text-emerald-600">↑ 38%</span>
                  </div>
                </div>
              </div>

              {/* Middle left: signal correlation */}
              <div className="absolute top-48 -left-8 w-80 bg-white rounded-2xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] border border-[rgba(42,37,34,0.05)] p-4 vir-float-medium z-30">
                <div className="flex items-center gap-2 mb-3">
                  <Network className="w-4 h-4 text-[#E85D3B]" />
                  <span className="text-sm font-semibold">Pattern detected</span>
                </div>
                <div className="bg-[#FFF8F1] p-3 rounded-xl border border-[rgba(42,37,34,0.05)] mb-3">
                  <p className="text-xs text-[#2A2522] leading-relaxed">Competitor X published 4 posts about <span className="font-semibold text-[#E85D3B]">enterprise security</span> in 30 days, hired 3 enterprise AEs, and got their CRO on 2 podcasts.</p>
                  <p className="text-[11px] text-[#6B625E] mt-2 font-medium">→ This is a category push, not a content experiment.</p>
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 bg-[#2A2522] text-white text-xs font-medium py-2 rounded-lg">View brief</button>
                  <button className="flex-1 bg-white border border-[rgba(42,37,34,0.1)] text-[#2A2522] text-xs font-medium py-2 rounded-lg">Share</button>
                </div>
              </div>

              {/* Bottom right: qualified engagement chart */}
              <div className="absolute bottom-20 right-12 w-64 bg-white rounded-2xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] border border-[rgba(42,37,34,0.05)] p-5 vir-float-fast z-10">
                <div className="flex justify-between items-end mb-4">
                  <div>
                    <div className="text-xs text-[#6B625E] mb-1">Qualified engagement</div>
                    <div className="text-2xl font-bold">312</div>
                    <div className="text-[10px] text-[#6B625E]">vs 2,840 raw likes</div>
                  </div>
                  <div className="flex items-center text-[#E85D3B] text-xs font-medium bg-[#E85D3B]/10 px-2 py-1 rounded">
                    <Filter className="w-3 h-3 mr-1" /> 11%
                  </div>
                </div>
                <div className="h-12 flex items-end gap-1">
                  {[40, 60, 35, 80, 55, 90, 70].map((h, i) => (
                    <div key={i} className="flex-1 bg-[#F4EBE1] rounded-t-sm" style={{ height: `${h}%` }}>
                      <div className="bg-[#E85D3B] w-full rounded-t-sm" style={{ height: `${h * 0.4}%` }} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The asymmetry strip */}
      <section className="py-12 border-y border-[rgba(42,37,34,0.05)] bg-white/50">
        <div className="max-w-5xl mx-auto px-6 grid md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-2xl font-bold text-[#2A2522]">Crayon, Klue, Kompyte</div>
            <p className="text-sm text-[#6B625E] mt-1">Own product CI: launches, pricing pages, battlecards.</p>
          </div>
          <div className="border-x border-[rgba(42,37,34,0.08)] px-4">
            <div className="text-2xl font-bold text-[#E85D3B]">Viralyz Signal</div>
            <p className="text-sm text-[#6B625E] mt-1">Owns content CI: themes, amplifiers, qualified engagement, category velocity.</p>
          </div>
          <div>
            <div className="text-2xl font-bold text-[#2A2522]">Your team today</div>
            <p className="text-sm text-[#6B625E] mt-1">Scrolls LinkedIn. Counts likes. Quietly suspects it doesn't mean anything.</p>
          </div>
        </div>
      </section>

      {/* The wedge */}
      <section id="how-it-works" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FFF8F1] border border-[rgba(42,37,34,0.1)] text-xs font-medium text-[#6B625E] mb-4">
              <Eye className="w-3.5 h-3.5 text-[#E85D3B]" />
              The wedge
            </div>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">Engagement is not the same as working.</h2>
            <p className="text-lg text-[#6B625E] leading-relaxed">
              A post with 2,000 likes from random creators tells you nothing. A post with 80 thoughtful replies from VPs of Engineering at companies in your competitor's ICP tells you the entire strategy. Viralyz Signal is the first content intelligence platform that filters competitor signals through an ICP-shaped lens, then connects what they're publishing to the outcomes that actually move pipeline.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <Radar className="w-5 h-5 text-[#E85D3B]" />, title: "Themes", desc: "What every tracked competitor is pushing this week, and what's new vs. last month." },
              { icon: <Users className="w-5 h-5 text-[#E85D3B]" />, title: "Amplifiers", desc: "Which employees, execs and adjacent voices are actively carrying their content." },
              { icon: <Filter className="w-5 h-5 text-[#E85D3B]" />, title: "Qualified engagement", desc: "Replies and reposts from buyer-shaped accounts. Not vanity likes from creators." },
              { icon: <TrendingUp className="w-5 h-5 text-[#E85D3B]" />, title: "Velocity", desc: "Output cadence and momentum changes. Spot a category push before your CMO does." },
            ].map((step) => (
              <div key={step.title} className="bg-[#FFF8F1] rounded-2xl p-6 border border-[rgba(42,37,34,0.05)]" data-testid={`card-pillar-${step.title.toLowerCase().replace(/\s+/g, "-")}`}>
                <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center mb-4">{step.icon}</div>
                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-[#6B625E] leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Three modules */}
      <section id="modules" className="py-24 bg-[#FFF8F1]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Three modules. One discipline.</h2>
            <p className="text-lg text-[#6B625E]">Built in the order they create value: surface, then explain, then synthesise.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                num: "01",
                tag: "Live now",
                tagColor: "bg-emerald-100 text-emerald-700",
                icon: <Radar className="w-6 h-6" />,
                title: "Competitor Content Pulse",
                desc: "A weekly digest per tracked competitor: themes pushed, who amplified, qualified engagement only, velocity change vs. last month. The wedge. The thing your CMO wants on Monday morning.",
              },
              {
                num: "02",
                tag: "In build",
                tagColor: "bg-amber-100 text-amber-700",
                icon: <Network className="w-6 h-6" />,
                title: "Signal Correlation",
                desc: "Connects content patterns to outcome signals: hiring velocity in revenue roles, funding moves, exec podcast appearances, G2 review velocity. Tells you when content is a category push, not an experiment.",
              },
              {
                num: "03",
                tag: "Q3 2026",
                tagColor: "bg-[#E85D3B]/10 text-[#E85D3B]",
                icon: <FileText className="w-6 h-6" />,
                title: "Strategic Briefs",
                desc: "Quarterly synthesised reports per competitor. Prose, not dashboards. Written by AI, reviewed by a named human analyst. Explains what the strategy actually is and what your team should do about it.",
              },
            ].map((m) => (
              <div key={m.num} className="vir-card group" data-testid={`card-module-${m.num}`}>
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 rounded-xl bg-[#F4EBE1] text-[#2A2522] flex items-center justify-center group-hover:bg-[#E85D3B] group-hover:text-white transition-colors">
                    {m.icon}
                  </div>
                  <span className={`px-2 py-1 text-[10px] font-bold rounded uppercase tracking-wider ${m.tagColor}`}>{m.tag}</span>
                </div>
                <div className="text-[10px] font-bold tracking-wider text-[#6B625E] mb-1">MODULE {m.num}</div>
                <h3 className="text-xl font-semibold mb-3">{m.title}</h3>
                <p className="text-[#6B625E] leading-relaxed text-sm">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The promise / why now */}
      <section className="py-24 bg-[#2A2522] text-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/10 text-xs font-medium text-white/80 mb-6">
                <BarChart3 className="w-3.5 h-3.5 text-[#E85D3B]" />
                The asymmetry, ended
              </div>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">Know which competitor content is actually driving their growth.</h2>
              <p className="text-xl text-white/60 mb-8 leading-relaxed">
                B2B marketing teams instrument their own content within an inch of its life. UTMs, attribution models, content scoring. Then they look at competitors and count likes. The asymmetry is absurd, and it persists because everyone gave up trying. The signals are public. We just put them together.
              </p>
              <ul className="space-y-4">
                {[
                  "ICP-aware engagement filtering: replies from buyer-shaped accounts, not creator vanity.",
                  "Compounding benchmarks: the more competitors tracked, the sharper every comparison.",
                  "Built for the quarterly board slide. Stops being terrible.",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-[#E85D3B] shrink-0" />
                    <span className="text-white/80">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl relative">
              <div className="absolute top-4 right-4 flex items-center gap-2 bg-[#E85D3B]/20 text-[#E85D3B] px-3 py-1.5 rounded-full text-xs font-bold border border-[#E85D3B]/30">
                <Briefcase className="w-3.5 h-3.5" />
                BOARD-READY
              </div>
              <div className="mt-8 mb-4">
                <div className="text-[10px] font-bold tracking-wider text-white/50 uppercase mb-1">Q2 brief preview</div>
                <div className="text-lg font-semibold text-white">Acme Cloud — content strategy</div>
              </div>
              <div className="space-y-4">
                {[
                  { label: "What they're doing", value: "Pivoting from \"developer tools\" to \"AI security platform\"" },
                  { label: "What's working", value: "CRO podcast tour, technical deep-dives by VPE" },
                  { label: "Where the gap is", value: "No mid-market case studies. We can own that lane." },
                ].map((row, i) => (
                  <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <div className="text-[10px] font-bold tracking-wider text-white/40 uppercase mb-1">{row.label}</div>
                    <p className="text-sm text-white/90">{row.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ICP */}
      <section id="icp" className="py-24 bg-[#FFF8F1]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Built for a specific kind of team.</h2>
            <p className="text-lg text-[#6B625E]">If most of these are true, the wedge probably fits.</p>
          </div>
          <div className="vir-card max-w-3xl mx-auto">
            <ul className="space-y-4">
              {[
                "B2B SaaS, $10–100M ARR, content is a meaningful pipeline driver.",
                "5–15 named competitors you actively track, with a quarterly board slide that's currently terrible.",
                "Content team of 3–10, a marketing ops function, and a CMO who reports pipeline contribution monthly.",
                "You publish original research. Your CEO or CMO posts on LinkedIn weekly. You have a podcast.",
                "You already pay for competitive intelligence (Crayon, Klue) or content marketing tooling north of $50k/year.",
              ].map((row, i) => (
                <li key={i} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-[#E85D3B] shrink-0 mt-1" />
                  <span className="text-[#2A2522]">{row}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Annual contracts. Built to expand.</h2>
            <p className="text-lg text-[#6B625E]">This isn't self-serve. Every plan starts with a scoped pilot.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="vir-card flex flex-col">
              <h3 className="text-xl font-bold mb-1">Pulse</h3>
              <p className="text-[#6B625E] text-sm mb-6">Module 1. The wedge.</p>
              <div className="mb-6">
                <span className="text-4xl font-bold tracking-tight">$2k</span>
                <span className="text-[#6B625E]">/month</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1 text-sm">
                {["Up to 5 tracked competitors", "Weekly Pulse digest per competitor", "Qualified engagement filtering", "Themes, amplifiers, velocity", "Slack &amp; email delivery"].map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="w-4 h-4 text-[#E85D3B] shrink-0 mt-0.5" />
                    <span className="text-[#2A2522]" dangerouslySetInnerHTML={{ __html: feature }} />
                  </li>
                ))}
              </ul>
              <a href="#contact" className="vir-btn-secondary w-full py-3" data-testid="button-pricing-pulse">Start a pilot</a>
            </div>

            <div className="vir-card border-2 border-[#E85D3B] flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-[#E85D3B] text-white text-xs font-bold px-3 py-1 rounded-bl-xl">MOST POPULAR</div>
              <h3 className="text-xl font-bold mb-1">Signal</h3>
              <p className="text-[#6B625E] text-sm mb-6">Pulse + correlation IP.</p>
              <div className="mb-6">
                <span className="text-4xl font-bold tracking-tight">$5k</span>
                <span className="text-[#6B625E]">/month</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1 text-sm">
                {["Up to 15 tracked competitors", "Everything in Pulse", "Module 2: Signal Correlation", "Hiring, funding, podcast cross-refs", "Pattern alerts (\"category push detected\")", "Quarterly business review"].map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="w-4 h-4 text-[#E85D3B] shrink-0 mt-0.5" />
                    <span className="text-[#2A2522]">{feature}</span>
                  </li>
                ))}
              </ul>
              <a href="#contact" className="vir-btn-primary w-full py-3" data-testid="button-pricing-signal">Talk to sales</a>
            </div>

            <div className="vir-card flex flex-col">
              <h3 className="text-xl font-bold mb-1">Strategic</h3>
              <p className="text-[#6B625E] text-sm mb-6">Everything. Plus a human.</p>
              <div className="mb-6">
                <span className="text-4xl font-bold tracking-tight">$10k</span>
                <span className="text-[#6B625E]">/month</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1 text-sm">
                {["Unlimited tracked competitors", "Everything in Signal", "Module 3: Quarterly briefs", "Named human analyst", "Custom benchmarks", "Direct Slack channel"].map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="w-4 h-4 text-[#E85D3B] shrink-0 mt-0.5" />
                    <span className="text-[#2A2522]">{feature}</span>
                  </li>
                ))}
              </ul>
              <a href="#contact" className="vir-btn-secondary w-full py-3" data-testid="button-pricing-strategic">Talk to sales</a>
            </div>
          </div>
          <p className="text-center text-xs text-[#6B625E] mt-8">All plans annual. Pilot pricing available for design partners.</p>
        </div>
      </section>

      {/* CTA Band */}
      <section id="contact" className="py-24 bg-[#E85D3B] text-white text-center">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">End the asymmetry.</h2>
          <p className="text-xl text-white/80 mb-10">A 30-minute call. We bring a live pulse on three of your competitors. You decide if the wedge fits.</p>
          <a
            href="/api/login"
            className="inline-block bg-[#2A2522] text-white hover:bg-[#1A1614] rounded-full px-8 py-4 text-lg font-bold transition-all hover:scale-105 active:scale-95 shadow-xl"
            data-testid="button-cta-bottom"
          >
            Book a demo
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-12 border-t border-[rgba(42,37,34,0.05)]">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <Link href="/" className="flex items-center gap-2 cursor-pointer">
            <div className="w-6 h-6 rounded bg-[#E85D3B] flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-sm" />
            </div>
            <span className="font-semibold text-lg">Viralyz</span>
            <span className="text-xs text-[#6B625E] tracking-wide">Signal</span>
          </Link>
          <div className="flex gap-8 text-sm font-medium text-[#6B625E]">
            <Link href="/terms" className="hover:text-[#2A2522]">Terms</Link>
            <Link href="/privacy" className="hover:text-[#2A2522]">Privacy</Link>
            <Link href="/accessibility" className="hover:text-[#2A2522]">Accessibility</Link>
          </div>
          <p className="text-sm text-[#6B625E]">© {new Date().getFullYear()} Viralyz Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
