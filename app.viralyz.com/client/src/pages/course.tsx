import { Shell } from "@/components/layout/Shell";
import { Play, BookOpen, CheckCircle, Lock, MoreHorizontal, Users, MessageSquare, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Link } from "wouter";
import { cn } from "@/lib/utils";

interface Lesson {
  id: number;
  title: string;
  duration: string;
  completed?: boolean;
  current?: boolean;
  locked?: boolean;
}

const MODULES: { id: number; title: string; lessons: Lesson[] }[] = [
  {
    id: 1,
    title: "Module 1: Fundamentals of Light",
    lessons: [
      { id: 101, title: "Introduction to Color Theory", duration: "10:00", completed: true },
      { id: 102, title: "Understanding Exposure", duration: "15:30", completed: true },
      { id: 103, title: "The Three Point Lighting Setup", duration: "12:45", completed: false, current: true },
    ]
  },
  {
    id: 2,
    title: "Module 2: Advanced Composition",
    lessons: [
      { id: 201, title: "Rule of Thirds vs. Golden Ratio", duration: "20:00", locked: true },
      { id: 202, title: "Leading Lines in Urban Environments", duration: "18:15", locked: true },
    ]
  }
];

function CurriculumList() {
    return (
        <div className="bg-card border border-white/10 rounded-2xl overflow-hidden flex flex-col h-full lg:h-fit lg:sticky lg:top-6">
           <div className="p-6 border-b border-white/10 bg-white/5">
              <h3 className="font-bold font-display text-white text-lg mb-2">Course Content</h3>
              <div className="flex items-center justify-between text-sm mb-2">
                 <span className="text-muted-foreground">35% Completed</span>
                 <span className="text-white font-mono">3/8</span>
              </div>
              <Progress value={35} className="h-2" />
           </div>

           <div className="overflow-y-auto max-h-[calc(100vh-200px)] lg:max-h-[600px]">
              {MODULES.map((module) => (
                 <div key={module.id} className="border-b border-white/5 last:border-0">
                    <div className="bg-white/5 px-6 py-3 text-sm font-bold text-white/80 sticky top-0 backdrop-blur-sm z-10">
                       {module.title}
                    </div>
                    <div>
                       {module.lessons.map((lesson) => (
                          <div 
                             key={lesson.id} 
                             className={cn(
                                "flex items-center gap-3 px-6 py-4 hover:bg-white/5 transition-colors cursor-pointer border-l-2",
                                lesson.current ? "bg-primary/10 border-primary" : "border-transparent",
                                lesson.locked && "opacity-50 cursor-not-allowed hover:bg-transparent"
                             )}
                          >
                             {lesson.completed ? (
                                <CheckCircle className="w-5 h-5 text-primary shrink-0" />
                             ) : lesson.locked ? (
                                <Lock className="w-5 h-5 text-muted-foreground shrink-0" />
                             ) : (
                                <div className="w-5 h-5 rounded-full border-2 border-white/30 shrink-0" />
                             )}
                             
                             <div className="flex-1 min-w-0">
                                <p className={cn("text-sm font-medium truncate", lesson.current ? "text-primary" : "text-white")}>
                                   {lesson.title}
                                </p>
                                <span className="text-xs text-muted-foreground">{lesson.duration}</span>
                             </div>

                             {lesson.current && (
                                <div className="text-[10px] font-bold bg-primary px-2 py-0.5 rounded text-white">
                                   NOW
                                </div>
                             )}
                          </div>
                       ))}
                    </div>
                 </div>
              ))}
           </div>
        </div>
    );
}

export default function Course() {
  return (
    <Shell>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Video Player */}
          <div className="relative aspect-video rounded-2xl overflow-hidden bg-gradient-to-br from-purple-900 via-blue-900 to-cyan-900 border border-white/10 shadow-2xl">
             <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10 pointer-events-none" />
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(168,85,247,0.3),transparent_50%)]" />
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,rgba(34,211,238,0.2),transparent_50%)]" />
             <div className="absolute inset-0 flex items-center justify-center z-20">
                <div className="rounded-full bg-white/20 p-4 backdrop-blur-md cursor-pointer hover:scale-110 transition-transform">
                  <Play className="w-8 h-8 fill-white text-white" />
                </div>
             </div>
             <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                <h2 className="text-xl md:text-2xl font-bold font-display text-white mb-2 line-clamp-1">The Three Point Lighting Setup</h2>
                <div className="flex flex-wrap items-center gap-4 text-sm text-white/80">
                   <span className="flex items-center gap-1"><Users size={14} /> 1,204 watching</span>
                   <span>•</span>
                   <span>Module 1, Lesson 3</span>
                </div>
             </div>
          </div>

          {/* Mobile Curriculum Trigger */}
          <div className="lg:hidden">
              <Sheet>
                  <SheetTrigger asChild>
                      <Button className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/10" variant="outline">
                          <BookOpen className="mr-2 h-4 w-4" /> View Curriculum
                      </Button>
                  </SheetTrigger>
                  <SheetContent side="bottom" className="h-[80vh] p-0 bg-card border-t border-white/10">
                      <CurriculumList />
                  </SheetContent>
              </Sheet>
          </div>

          {/* Description & Tabs */}
          <Tabs defaultValue="overview">
             <TabsList className="bg-white/5 border border-white/10">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="discussion">Discussion</TabsTrigger>
                <TabsTrigger value="resources">Resources</TabsTrigger>
             </TabsList>
             
             <TabsContent value="overview" className="space-y-6 mt-6">
                <div className="flex items-start justify-between">
                   <div>
                      <h1 className="text-3xl font-bold font-display text-white mb-2">Cinematography Masterclass 101</h1>
                      <div className="flex items-center gap-2">
                         <Avatar className="h-8 w-8">
                            <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=mikeastro" />
                            <AvatarFallback>AM</AvatarFallback>
                         </Avatar>
                         <span className="text-muted-foreground">Instructor: <span className="text-white font-medium">Mike Astro</span></span>
                      </div>
                   </div>
                   <Button variant="outline" className="border-white/20">Share</Button>
                </div>
                
                <p className="text-muted-foreground leading-relaxed">
                   In this lesson, we break down the industry standard for lighting interviews, narrative scenes, and product shots. 
                   We'll cover key light placement, fill ratios, and how to use backlighting to separate your subject from the background.
                </p>

                <div className="grid grid-cols-3 gap-4">
                   <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
                      <div className="text-2xl font-bold text-primary mb-1">Beginner</div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wider">Level</div>
                   </div>
                   <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
                      <div className="text-2xl font-bold text-accent mb-1">4.5h</div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wider">Total Duration</div>
                   </div>
                   <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
                      <div className="text-2xl font-bold text-purple-400 mb-1">Cert</div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wider">On Completion</div>
                   </div>
                </div>
             </TabsContent>

             <TabsContent value="discussion">
                <div className="p-8 text-center text-muted-foreground bg-white/5 rounded-xl border border-white/10">
                   <MessageSquare className="mx-auto h-10 w-10 mb-4 opacity-50" />
                   <h3 className="text-lg font-bold text-white">Class Discussion</h3>
                   <p>Join 45 other students discussing this lesson.</p>
                   <Button className="mt-4" variant="secondary">Join Chat</Button>
                </div>
             </TabsContent>
          </Tabs>
        </div>

        {/* Desktop Sidebar: Curriculum */}
        <div className="hidden lg:block">
            <CurriculumList />
        </div>
      </div>
    </Shell>
  );
}
