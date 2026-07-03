import { Shell } from "@/components/layout/Shell";
import { Hash, Volume2, Mic, Video, Users, Settings, Plus, MessageSquare, Bell, Image as ImageIcon, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useState } from "react";

const CHANNELS = [
  { id: "general", name: "general", type: "text" },
  { id: "showcase", name: "art-showcase", type: "text" },
  { id: "resources", name: "resources", type: "text" },
  { id: "help", name: "help-desk", type: "text" },
  { id: "voice-lounge", name: "Lounge", type: "voice", users: 5 },
  { id: "voice-gaming", name: "Gaming", type: "voice", users: 2 },
];

const MESSAGES = [
  { id: 1, user: "NeonDreamer", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=neondreamer", content: "Has anyone tried the new denoising filter in the latest update? It's insane.", time: "10:42 AM" },
  { id: 2, user: "VFX_Wizard", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=vfxwizard", content: "Yeah! It cleaned up my night shots perfectly. Almost zero artifacts.", time: "10:45 AM" },
  { id: 3, user: "RetroWave", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=retrowave", content: "I'm still getting some banding in the shadows though. Might be my export settings.", time: "10:48 AM" },
  { id: 4, user: "NeonDreamer", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=neondreamer", content: "Try increasing the bitrate. That usually fixes it for me.", time: "10:50 AM" },
];

function ChannelsSidebar({ activeChannel, setActiveChannel }: { activeChannel: string, setActiveChannel: (id: string) => void }) {
  return (
    <div className="flex flex-col h-full bg-black/20">
       {/* Server Header */}
       <div className="p-4 border-b border-white/10 hover:bg-white/5 transition-colors cursor-pointer flex items-center justify-between group h-14">
          <h2 className="font-bold text-white font-display">Neon City</h2>
          <Settings size={16} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
       </div>

       {/* Channels List */}
       <ScrollArea className="flex-1 p-3">
          <div className="space-y-6">
             <div>
                <h3 className="px-2 text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center justify-between">
                   Text Channels <Plus size={12} className="cursor-pointer hover:text-white" />
                </h3>
                <div className="space-y-1">
                   {CHANNELS.filter(c => c.type === 'text').map(channel => (
                      <div 
                         key={channel.id}
                         onClick={() => setActiveChannel(channel.id)}
                         className={cn(
                            "flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-colors group",
                            activeChannel === channel.id ? "bg-white/10 text-white" : "text-muted-foreground hover:bg-white/5 hover:text-white"
                         )}
                      >
                         <Hash size={16} className="text-muted-foreground/50 group-hover:text-muted-foreground" />
                         <span className="text-sm font-medium">{channel.name}</span>
                      </div>
                   ))}
                </div>
             </div>

             <div>
                <h3 className="px-2 text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center justify-between">
                   Voice Channels <Plus size={12} className="cursor-pointer hover:text-white" />
                </h3>
                <div className="space-y-1">
                   {CHANNELS.filter(c => c.type === 'voice').map(channel => (
                      <div key={channel.id} className="group">
                         <div className="flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer text-muted-foreground hover:bg-white/5 hover:text-white transition-colors">
                            <Volume2 size={16} className="text-muted-foreground/50 group-hover:text-muted-foreground" />
                            <span className="text-sm font-medium">{channel.name}</span>
                         </div>
                         {/* Active Users in Voice */}
                         <div className="pl-8 pb-2 space-y-1">
                            {Array.from({ length: channel.users || 0 }).map((_, i) => (
                               <div key={i} className="flex items-center gap-2">
                                  <Avatar className="h-5 w-5 border border-white/10">
                                     <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`} />
                                  </Avatar>
                                  <span className="text-xs text-muted-foreground">User {i+1}</span>
                               </div>
                            ))}
                         </div>
                      </div>
                   ))}
                </div>
             </div>
          </div>
       </ScrollArea>

       {/* User Status Footer */}
       <div className="p-3 bg-black/40 flex items-center gap-3 border-t border-white/10">
          <div className="relative">
             <Avatar className="h-8 w-8">
                <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=neondreamer" />
             </Avatar>
             <div className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-background"></div>
          </div>
          <div className="flex-1 min-w-0">
             <div className="text-xs font-bold text-white truncate">NeonDreamer</div>
             <div className="text-[10px] text-muted-foreground truncate">#4921</div>
          </div>
          <div className="flex gap-1">
             <Button size="icon" variant="ghost" className="h-7 w-7"><Mic size={14} /></Button>
             <Button size="icon" variant="ghost" className="h-7 w-7"><Settings size={14} /></Button>
          </div>
       </div>
    </div>
  );
}

export default function CommunityHub() {
  const [activeChannel, setActiveChannel] = useState("general");
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <Shell>
       <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 h-[calc(100vh-140px)] border border-white/10 rounded-2xl overflow-hidden bg-card">
          
          {/* Desktop Channels Sidebar */}
          <div className="hidden lg:flex lg:col-span-3 flex-col border-r border-white/10">
             <ChannelsSidebar activeChannel={activeChannel} setActiveChannel={setActiveChannel} />
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-9 flex flex-col bg-background/50">
             {/* Chat Header */}
             <div className="h-14 border-b border-white/10 flex items-center justify-between px-4 bg-white/5">
                <div className="flex items-center gap-2">
                   {/* Mobile Menu Trigger */}
                   <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                      <SheetTrigger asChild>
                         <Button variant="ghost" size="icon" className="lg:hidden -ml-2 text-muted-foreground">
                            <Menu size={20} />
                         </Button>
                      </SheetTrigger>
                      <SheetContent side="left" className="p-0 border-r border-white/10 bg-card w-[85vw] sm:w-[350px]">
                         <ChannelsSidebar activeChannel={activeChannel} setActiveChannel={(id) => { setActiveChannel(id); setSheetOpen(false); }} />
                      </SheetContent>
                   </Sheet>

                   <Hash size={20} className="text-muted-foreground hidden lg:block" />
                   <h3 className="font-bold text-white">{activeChannel}</h3>
                   <span className="text-xs text-muted-foreground border-l border-white/10 pl-2 ml-2 hidden sm:block">Topic of discussion goes here...</span>
                </div>
                <div className="flex items-center gap-4">
                   <Bell size={18} className="text-muted-foreground hover:text-white cursor-pointer" />
                   <Users size={18} className="text-muted-foreground hover:text-white cursor-pointer" />
                   <div className="relative w-48 hidden md:block">
                      <input 
                         type="text" 
                         placeholder="Search" 
                         className="w-full bg-black/20 border-none rounded text-xs px-2 py-1 text-white focus:outline-hidden" 
                      />
                   </div>
                </div>
             </div>

             {/* Messages */}
             <ScrollArea className="flex-1 p-4">
                <div className="space-y-6">
                   {/* Date Divider */}
                   <div className="relative flex items-center justify-center">
                      <div className="absolute inset-0 flex items-center">
                         <div className="w-full border-t border-white/5"></div>
                      </div>
                      <span className="relative bg-background px-4 text-xs text-muted-foreground">Today</span>
                   </div>

                   {MESSAGES.map((msg) => (
                      <div key={msg.id} className="flex gap-4 group hover:bg-white/5 p-2 -mx-2 rounded-lg transition-colors">
                         <Avatar className="h-10 w-10 mt-1 cursor-pointer hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] transition-all">
                            <AvatarImage src={msg.avatar} />
                         </Avatar>
                         <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                               <span className="font-bold text-white cursor-pointer hover:underline">{msg.user}</span>
                               <span className="text-[10px] text-muted-foreground">{msg.time}</span>
                            </div>
                            <p className="text-sm text-white/90 leading-relaxed">{msg.content}</p>
                         </div>
                      </div>
                   ))}
                </div>
             </ScrollArea>

             {/* Input Area */}
             <div className="p-4 bg-white/5 mx-4 mb-4 rounded-xl border border-white/10">
                <div className="flex items-center gap-2">
                   <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-white rounded-full bg-white/5">
                      <Plus size={16} />
                   </Button>
                   <input 
                      type="text" 
                      placeholder={`Message #${activeChannel}`}
                      className="flex-1 bg-transparent border-none text-sm text-white placeholder:text-muted-foreground focus:outline-hidden"
                   />
                   <div className="flex gap-2">
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-white">
                         <ImageIcon size={18} />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-white">
                         <Mic size={18} />
                      </Button>
                   </div>
                </div>
             </div>
          </div>
       </div>
    </Shell>
  );
}
