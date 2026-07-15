import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const API_BASE = "/api";

export interface Content {
  id: string;
  userId: string;
  type: "clip" | "film" | "still" | "flash";
  title: string | null;
  description: string | null;
  src: string;
  thumbnail: string | null;
  aspectRatio: string | null;
  duration: number | null;
  likes: number;
  views: number;
  createdAt: string;
}

export interface Tribe {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  icon: string | null;
  banner: string | null;
  members: number;
  createdAt: string;
}

export interface TribePost {
  id: string;
  tribeId: string;
  userId: string;
  title: string;
  content: string;
  image: string | null;
  upvotes: number;
  createdAt: string;
}

export interface Course {
  id: string;
  title: string;
  description: string | null;
  instructorId: string;
  thumbnail: string | null;
  level: string | null;
  duration: number | null;
  createdAt: string;
}

export function useContent(type?: string) {
  return useQuery({
    queryKey: ["content", type],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (type) params.set("type", type);
      const response = await fetch(`${API_BASE}/content?${params}`);
      if (!response.ok) throw new Error("Failed to fetch content");
      return response.json() as Promise<Content[]>;
    },
  });
}

export function useLikeContent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (contentId: string) => {
      const response = await fetch(`${API_BASE}/content/${contentId}/like`, {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to like content");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["content"] });
    },
  });
}

export function useTribes() {
  return useQuery({
    queryKey: ["tribes"],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/tribes`);
      if (!response.ok) throw new Error("Failed to fetch tribes");
      return response.json() as Promise<Tribe[]>;
    },
  });
}

export function useTribePosts(tribeId: string) {
  return useQuery({
    queryKey: ["tribe-posts", tribeId],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/tribes/${tribeId}/posts`);
      if (!response.ok) throw new Error("Failed to fetch tribe posts");
      return response.json() as Promise<TribePost[]>;
    },
    enabled: !!tribeId,
  });
}

export function useCourses() {
  return useQuery({
    queryKey: ["courses"],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/courses`);
      if (!response.ok) throw new Error("Failed to fetch courses");
      return response.json() as Promise<Course[]>;
    },
  });
}
