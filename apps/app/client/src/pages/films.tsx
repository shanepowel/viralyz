import { Shell } from "@/components/layout/Shell";
import { Play, Info, Calendar, Bell, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useContent } from "@/lib/api";

const Countdown = () => {
    const [timeLeft, setTimeLeft] = useState({ h: 2, m: 14, s: 59 });

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev.s > 0) return { ...prev, s: prev.s - 1 };
                if (prev.m > 0) return { ...prev, m: prev.m - 1, s: 59 };
                if (prev.h > 0) return { ...prev, h: prev.h - 1, m: 59, s: 59 };
                return prev;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="flex gap-4 font-mono text-2xl md:text-4xl font-bold text-white tracking-widest">
            <div className="bg-black/40 backdrop-blur-md rounded-lg px-3 py-2 border border-white/10">0{timeLeft.h}</div>
            <span className="self-center animate-pulse">:</span>
            <div className="bg-black/40 backdrop-blur-md rounded-lg px-3 py-2 border border-white/10">{timeLeft.m < 10 ? '0'+timeLeft.m : timeLeft.m}</div>
            <span className="self-center animate-pulse">:</span>
            <div className="bg-black/40 backdrop-blur-md rounded-lg px-3 py-2 border border-white/10 text-primary">{timeLeft.s < 10 ? '0'+timeLeft.s : timeLeft.s}</div>
        </div>
    );
};

const FILMS = [
  {
    id: 1,
    title: "The Last Cybercafe",
    gradient: "from-blue-600 via-amber-600 to-pink-500",
    duration: "45:20",
    author: "Digital Frontier",
    views: "1.2M",
    description: "A documentary exploring the remains of net cafes in 2077."
  },
  {
    id: 2,
    title: "Neon Rain: A Short Film",
    gradient: "from-cyan-500 via-blue-600 to-amber-700",
    duration: "12:15",
    author: "Night Owl Studios",
    views: "890K",
    description: "Atmospheric storytelling in the rain-slicked streets."
  },
  {
    id: 3,
    title: "Synthwave Production Masterclass",
    gradient: "from-pink-500 via-red-500 to-orange-500",
    duration: "1:20:00",
    author: "Audio Labs",
    views: "340K",
    description: "Learn how to create retro sounds from scratch."
  },
    {
    id: 4,
    title: "Exploring the Deep Web",
    gradient: "from-green-600 via-emerald-600 to-cyan-600",
    duration: "28:45",
    author: "Tech Insider",
    views: "2.1M",
    description: "What lies beneath the surface of the internet?"
  }
];

export default function Films() {
  const { data: films, isLoading } = useContent("film");
  
  const filmsList = films || [];

  return (
    <Shell>
      {/* Featured Hero with Countdown */}
      <div className="relative mb-12 overflow-hidden rounded-3xl border border-white/10 bg-black/40 aspect-video md:aspect-[21/9] group">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-900 via-blue-900 to-cyan-900 opacity-60 transition-transform duration-1000 group-hover:scale-105">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(245, 158, 11,0.3),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,rgba(34,211,238,0.2),transparent_50%)]" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
            <span className="mb-6 inline-flex items-center gap-2 rounded-full bg-red-500/20 px-4 py-1.5 text-sm font-bold uppercase tracking-wider text-red-400 backdrop-blur-md border border-red-500/20 animate-pulse">
                <Calendar size={14} /> Global Premiere Event
            </span>
            
            <h1 className="mb-6 text-4xl md:text-7xl font-black font-display text-white tracking-tight drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]">
                ECHOES OF TOMORROW
            </h1>

            <div className="mb-8">
                <p className="text-white/60 text-sm font-bold uppercase tracking-widest mb-4">Starts In</p>
                <Countdown />
            </div>

            <div className="flex flex-wrap gap-4 justify-center">
                <Button size="lg" className="rounded-full bg-white text-black hover:bg-white/90 gap-2 font-bold text-md px-8 h-12 shadow-[0_0_20px_rgba(255,255,255,0.4)]">
                    <Bell className="fill-black" size={20} /> Remind Me
                </Button>
                <Button size="lg" variant="outline" className="rounded-full border-white/20 bg-white/10 text-white hover:bg-white/20 gap-2 h-12 backdrop-blur-md">
                    <Info size={20} /> Trailer
                </Button>
            </div>
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-10">
        <section>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold font-display text-white">Recommended Films</h2>
                <Button variant="link" className="text-primary">View All</Button>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center py-12" data-testid="loading-spinner">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filmsList.length === 0 ? (
              <div className="py-12 text-center" data-testid="empty-state">
                <p className="text-muted-foreground">No films available</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {filmsList.map(film => {
                  const minutes = film.duration ? Math.floor(film.duration / 60) : 0;
                  const seconds = film.duration ? film.duration % 60 : 0;
                  const formattedDuration = `${minutes}:${seconds.toString().padStart(2, '0')}`;
                  
                  return (
                    <div key={film.id} className="group cursor-pointer" data-testid={`film-${film.id}`}>
                      <div className="relative aspect-video mb-3 overflow-hidden rounded-xl border border-white/10 bg-card">
                        <img 
                          src={film.thumbnail || film.src} 
                          alt={film.title || 'Film'} 
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" 
                        />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
                        {film.duration && (
                          <div className="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 py-0.5 text-xs font-bold text-white backdrop-blur-sm">
                            {formattedDuration}
                          </div>
                        )}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="rounded-full bg-white/20 p-3 backdrop-blur-md">
                            <Play className="fill-white text-white" size={24} />
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="h-10 w-10 shrink-0 rounded-full bg-white/10" />
                        <div>
                          <h3 className="font-bold text-white leading-tight mb-1 group-hover:text-primary transition-colors">
                            {film.title || 'Untitled Film'}
                          </h3>
                          <p className="text-sm text-muted-foreground">{film.views} views</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
        </section>

        <section>
            <h2 className="text-2xl font-bold font-display text-white mb-6">Continue Watching</h2>
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 flex flex-col md:flex-row items-center gap-6">
                <div className="relative aspect-video w-full md:w-64 shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-amber-600 via-blue-600 to-cyan-600">
                     <div className="absolute inset-0 bg-black/20" />
                     <div className="absolute bottom-0 left-0 h-1 w-[65%] bg-primary" />
                     <div className="absolute inset-0 flex items-center justify-center">
                        <Play className="fill-white text-white" size={32} />
                     </div>
                </div>
                <div className="flex-1 text-center md:text-left">
                    <h3 className="text-xl font-bold text-white mb-2">The Architecture of light</h3>
                    <p className="text-muted-foreground mb-4">You have 15 minutes left.</p>
                    <Button variant="secondary" className="rounded-full">Resume</Button>
                </div>
            </div>
        </section>
      </div>
    </Shell>
  );
}
