import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { MessageSquare, Send, ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface ConversationPreview {
  id: string;
  otherUser: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    profileImageUrl: string | null;
  } | null;
  lastMessage: {
    text: string;
    senderId: string;
    createdAt: string;
  } | null;
  unreadCount: number;
  lastMessageAt: string;
}

interface ChatMessage {
  id: string;
  text: string;
  senderId: string;
  readAt: string | null;
  createdAt: string;
  senderFirstName: string | null;
  senderProfileImage: string | null;
}

export default function Messages() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const currentUserId = (user as any)?.id;
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<ConversationPreview["otherUser"] | null>(null);
  const [messageText, setMessageText] = useState("");
  const [search, setSearch] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [location] = useLocation();

  const params = new URLSearchParams(location.split("?")[1] || "");
  const recipientId = params.get("to");

  useEffect(() => {
    if (recipientId && currentUserId && recipientId !== currentUserId) {
      fetch("/api/messages/conversation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipientId }),
      })
        .then((res) => res.json())
        .then((conv) => {
          setSelectedConversation(conv.id);
          queryClient.invalidateQueries({ queryKey: ["/api/messages/conversations"] });
        });
    }
  }, [recipientId, currentUserId]);

  const { data: conversations, isLoading } = useQuery<ConversationPreview[]>({
    queryKey: ["/api/messages/conversations"],
    queryFn: async () => {
      const res = await fetch("/api/messages/conversations");
      if (!res.ok) return [];
      return res.json();
    },
    refetchInterval: 5000,
  });

  const { data: messages } = useQuery<ChatMessage[]>({
    queryKey: ["/api/messages", selectedConversation],
    queryFn: async () => {
      if (!selectedConversation) return [];
      const res = await fetch(`/api/messages/${selectedConversation}`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!selectedConversation,
    refetchInterval: 3000,
  });

  useEffect(() => {
    if (selectedConversation) {
      fetch(`/api/messages/${selectedConversation}/read`, { method: "POST" });
      queryClient.invalidateQueries({ queryKey: ["/api/messages/conversations"] });
    }
  }, [selectedConversation, messages?.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (selectedConversation && conversations) {
      const conv = conversations.find((c) => c.id === selectedConversation);
      if (conv) setSelectedUser(conv.otherUser);
    }
  }, [selectedConversation, conversations]);

  const sendMutation = useMutation({
    mutationFn: async (text: string) => {
      const res = await fetch(`/api/messages/${selectedConversation}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error("Failed to send");
      return res.json();
    },
    onSuccess: () => {
      setMessageText("");
      queryClient.invalidateQueries({ queryKey: ["/api/messages", selectedConversation] });
      queryClient.invalidateQueries({ queryKey: ["/api/messages/conversations"] });
    },
  });

  const handleSend = () => {
    if (!messageText.trim() || !selectedConversation) return;
    sendMutation.mutate(messageText.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const filteredConversations = conversations?.filter((c) => {
    if (!search.trim()) return true;
    const name = `${c.otherUser?.firstName || ""} ${c.otherUser?.lastName || ""}`.toLowerCase();
    return name.includes(search.toLowerCase());
  }) || [];

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return date.toLocaleDateString([], { weekday: "short" });
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto" data-testid="page-messages">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <MessageSquare className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold" data-testid="text-messages-title">Messages</h1>
          </div>
          <p className="text-muted-foreground">Chat with other creators in the community</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-secondary border border-border rounded-2xl overflow-hidden"
          style={{ height: "calc(100vh - 260px)", minHeight: "500px" }}
        >
          <div className="flex h-full">
            {/* Conversation List */}
            <div className={`w-full md:w-80 border-r border-border flex flex-col ${selectedConversation ? "hidden md:flex" : "flex"}`}>
              <div className="p-3 border-b border-border">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search conversations..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-secondary border border-border/50 rounded-lg text-sm text-foreground placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
                    data-testid="input-search-conversations"
                  />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto">
                {isLoading ? (
                  <div className="p-4 space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center gap-3 animate-pulse">
                        <div className="h-10 w-10 rounded-full bg-secondary" />
                        <div className="flex-1 space-y-2">
                          <div className="h-3 w-24 bg-secondary rounded" />
                          <div className="h-2 w-32 bg-secondary rounded" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredConversations.length === 0 ? (
                  <div className="p-8 text-center">
                    <MessageSquare className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">
                      {search ? "No conversations found" : "No messages yet. Visit the Community page to start a conversation!"}
                    </p>
                  </div>
                ) : (
                  filteredConversations.map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => setSelectedConversation(conv.id)}
                      className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-secondary/40 transition-colors text-left ${
                        selectedConversation === conv.id ? "bg-secondary/60 border-l-2 border-indigo-500" : ""
                      }`}
                      data-testid={`conversation-${conv.id}`}
                    >
                      {conv.otherUser?.profileImageUrl ? (
                        <img
                          src={conv.otherUser.profileImageUrl}
                          alt=""
                          className="h-10 w-10 rounded-full object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                          {conv.otherUser?.firstName?.[0] || "?"}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-foreground text-sm truncate">
                            {conv.otherUser?.firstName || "User"} {conv.otherUser?.lastName?.[0] ? `${conv.otherUser.lastName[0]}.` : ""}
                          </span>
                          {conv.lastMessage && (
                            <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                              {formatTime(conv.lastMessage.createdAt)}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-muted-foreground truncate">
                            {conv.lastMessage
                              ? conv.lastMessage.senderId === currentUserId
                                ? `You: ${conv.lastMessage.text}`
                                : conv.lastMessage.text
                              : "No messages yet"}
                          </p>
                          {conv.unreadCount > 0 && (
                            <span className="ml-2 flex-shrink-0 h-5 min-w-[20px] px-1.5 rounded-full bg-indigo-500 text-foreground text-xs flex items-center justify-center font-medium">
                              {conv.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Chat Area */}
            <div className={`flex-1 flex flex-col ${!selectedConversation ? "hidden md:flex" : "flex"}`}>
              {selectedConversation ? (
                <>
                  {/* Chat Header */}
                  <div className="px-4 py-3 border-b border-border flex items-center gap-3">
                    <button
                      onClick={() => setSelectedConversation(null)}
                      className="md:hidden text-muted-foreground hover:text-foreground"
                      data-testid="button-back-to-conversations"
                    >
                      <ArrowLeft className="h-5 w-5" />
                    </button>
                    {selectedUser?.profileImageUrl ? (
                      <img src={selectedUser.profileImageUrl} alt="" className="h-8 w-8 rounded-full object-cover" />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                        {selectedUser?.firstName?.[0] || "?"}
                      </div>
                    )}
                    <span className="font-medium text-foreground">
                      {selectedUser?.firstName || "User"} {selectedUser?.lastName?.[0] ? `${selectedUser.lastName[0]}.` : ""}
                    </span>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {messages && messages.length === 0 && (
                      <div className="text-center py-12">
                        <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                        <p className="text-muted-foreground text-sm">Send a message to start the conversation</p>
                      </div>
                    )}
                    {messages?.map((msg) => {
                      const isOwn = msg.senderId === currentUserId;
                      return (
                        <div key={msg.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`} data-testid={`message-${msg.id}`}>
                          <div className={`flex items-end gap-2 max-w-[75%] ${isOwn ? "flex-row-reverse" : ""}`}>
                            {!isOwn && (
                              msg.senderProfileImage ? (
                                <img src={msg.senderProfileImage} alt="" className="h-6 w-6 rounded-full object-cover flex-shrink-0" />
                              ) : (
                                <div className="h-6 w-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                                  {msg.senderFirstName?.[0] || "?"}
                                </div>
                              )
                            )}
                            <div
                              className={`px-3 py-2 rounded-2xl text-sm ${
                                isOwn
                                  ? "bg-indigo-600 text-foreground rounded-br-md"
                                  : "bg-secondary text-foreground rounded-bl-md"
                              }`}
                            >
                              <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                              <p className={`text-[10px] mt-1 ${isOwn ? "text-primary" : "text-muted-foreground"}`}>
                                {formatTime(msg.createdAt)}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input */}
                  <div className="p-3 border-t border-border">
                    <div className="flex items-end gap-2">
                      <textarea
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type a message..."
                        rows={1}
                        className="flex-1 px-4 py-2.5 bg-secondary border border-border/50 rounded-xl text-foreground placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 resize-none text-sm"
                        style={{ maxHeight: "120px" }}
                        data-testid="input-message"
                      />
                      <Button
                        size="icon"
                        className="bg-indigo-600 hover:bg-indigo-700 rounded-xl h-10 w-10 flex-shrink-0"
                        onClick={handleSend}
                        disabled={!messageText.trim() || sendMutation.isPending}
                        data-testid="button-send-message"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-muted-foreground mb-2">Select a conversation</h3>
                    <p className="text-sm text-muted-foreground">Choose a conversation from the list or message someone from the Community page</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
