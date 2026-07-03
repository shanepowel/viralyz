import { Shell } from "@/components/layout/Shell";
import { BookOpen, PlayCircle, Trophy, MoreHorizontal, ArrowRight, Star, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Link } from "wouter";
import { useCourses } from "@/lib/api";

const MY_COURSES = [
  {
    id: 1,
    title: "Cinematography Masterclass 101",
    instructor: "Mike Astro",
    progress: 35,
    gradient: "from-blue-600 via-purple-600 to-pink-500",
    lastLesson: "The Three Point Lighting Setup"
  },
  {
    id: 2,
    title: "Digital Art Fundamentals",
    instructor: "Neon Dreamer",
    progress: 12,
    gradient: "from-cyan-500 via-teal-500 to-emerald-500",
    lastLesson: "Layer Blending Modes"
  }
];

const RECOMMENDED_COURSES = [
  {
    id: 3,
    title: "Sound Design for Films",
    instructor: "Audio Labs",
    rating: 4.9,
    students: "12k",
    gradient: "from-pink-500 via-red-500 to-orange-500",
    category: "Audio"
  },
  {
    id: 4,
    title: "Screenwriting Structure",
    instructor: "Story Tellers",
    rating: 4.8,
    students: "8.5k",
    gradient: "from-indigo-500 via-purple-500 to-pink-500",
    category: "Writing"
  },
    {
    id: 5,
    title: "VFX Pipeline Basics",
    instructor: "Tech Insider",
    rating: 4.7,
    students: "5k",
    gradient: "from-green-500 via-emerald-500 to-cyan-500",
    category: "VFX"
  }
];

export default function Learning() {
  const { data: courses, isLoading } = useCourses();
  const coursesList = courses || [];

  return (
    <Shell>
       <div className="flex flex-col gap-10">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
             <div>
                <h1 className="text-3xl font-bold font-display text-white mb-2">My Classrooms</h1>
                <p className="text-muted-foreground">Pick up where you left off.</p>
             </div>
             <Button className="gap-2 bg-white/10 text-white hover:bg-white/20 border-white/10 backdrop-blur-md" variant="outline">
                <Trophy size={16} className="text-yellow-500" /> View Certificates
             </Button>
          </div>

          {/* Continue Learning - Carousel/Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {MY_COURSES.map(course => (
                <Link key={course.id} href="/course/1">
                   <div className="group relative overflow-hidden rounded-2xl bg-card border border-white/10 hover:border-primary/50 transition-all cursor-pointer">
                      <div className="flex h-40 md:h-48">
                         <div className={`w-1/3 relative bg-gradient-to-br ${course.gradient}`}>
                            <div className="absolute inset-0 bg-black/20" />
                            <div className="absolute inset-0 flex items-center justify-center">
                               <PlayCircle className="text-white fill-white/20 w-12 h-12 opacity-60 group-hover:opacity-100 transition-opacity" />
                            </div>
                         </div>
                         <div className="flex-1 p-6 flex flex-col justify-between bg-gradient-to-r from-card to-transparent">
                            <div>
                               <h3 className="text-xl font-bold font-display text-white mb-1 group-hover:text-primary transition-colors">{course.title}</h3>
                               <p className="text-sm text-muted-foreground mb-4">Instructor: {course.instructor}</p>
                            </div>
                            <div>
                               <div className="flex justify-between text-xs mb-2">
                                  <span className="text-white font-medium">{course.progress}% Complete</span>
                                  <span className="text-muted-foreground">Continue: {course.lastLesson}</span>
                                </div>
                               <Progress value={course.progress} className="h-2" />
                            </div>
                         </div>
                      </div>
                   </div>
                </Link>
             ))}
          </div>

          {/* Browse Section */}
          <div className="space-y-6">
             <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold font-display text-white">Explore Topics</h2>
                <Button variant="link" className="text-primary gap-1">Browse All <ArrowRight size={16} /></Button>
             </div>
             
             {isLoading ? (
               <div className="flex justify-center py-12">
                 <Loader2 className="h-8 w-8 animate-spin text-primary" />
               </div>
             ) : coursesList.length === 0 ? (
               <div className="py-12 text-center">
                 <p className="text-muted-foreground">No courses available</p>
               </div>
             ) : (
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                 {coursesList.map(course => (
                   <div key={course.id} className="group flex flex-col rounded-xl overflow-hidden bg-white/5 border border-white/10 hover:border-white/20 transition-all" data-testid={`course-${course.id}`}>
                     <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-primary/40 via-card to-accent/30 flex items-center justify-center">
                       {course.thumbnail ? (
                         <img 
                           src={course.thumbnail} 
                           className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                         />
                       ) : (
                         <BookOpen className="h-12 w-12 text-white/40 group-hover:text-white/60 transition-colors" />
                       )}
                       {course.level && (
                         <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-xs font-bold text-white border border-white/10">
                           {course.level}
                         </div>
                       )}
                     </div>
                     <div className="p-4 flex-1 flex flex-col">
                       <h3 className="font-bold text-white text-lg mb-1 group-hover:text-primary transition-colors line-clamp-1">{course.title}</h3>
                       <p className="text-sm text-muted-foreground mb-4">{course.description || 'Learn at your own pace'}</p>
                       
                       <div className="mt-auto flex items-center justify-between text-sm">
                         {course.duration && (
                           <span className="text-muted-foreground">{Math.floor(course.duration / 60)} hours</span>
                         )}
                       </div>
                     </div>
                   </div>
                 ))}
               </div>
             )}
          </div>
       </div>
    </Shell>
  );
}
