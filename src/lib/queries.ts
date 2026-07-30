import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Content = Tables<"content">;
export type Author = Tables<"authors">;
export type Progress = Tables<"reading_progress">;
export type Note = Tables<"notes">;
export type Profile = Tables<"profiles">;

export const contentListQuery = (type?: "book" | "article" | "news") =>
  queryOptions({
    queryKey: ["content", type ?? "all"],
    queryFn: async (): Promise<Content[]> => {
      let q = supabase.from("content").select("*").order("published_date", { ascending: false });
      if (type) q = q.eq("type", type);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });

export const contentBySlugQuery = (slug: string) =>
  queryOptions({
    queryKey: ["content", "slug", slug],
    queryFn: async (): Promise<Content | null> => {
      const { data, error } = await supabase.from("content").select("*").eq("slug", slug).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

export const authorsQuery = () =>
  queryOptions({
    queryKey: ["authors"],
    queryFn: async (): Promise<Author[]> => {
      const { data, error } = await supabase.from("authors").select("*").order("name");
      if (error) throw error;
      return data ?? [];
    },
  });

export const authorBySlugQuery = (slug: string) =>
  queryOptions({
    queryKey: ["authors", slug],
    queryFn: async (): Promise<Author | null> => {
      const { data, error } = await supabase.from("authors").select("*").eq("slug", slug).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

export const authorContentQuery = (authorId: string | undefined) =>
  queryOptions({
    queryKey: ["authors", authorId, "content"],
    enabled: !!authorId,
    queryFn: async (): Promise<Content[]> => {
      const { data, error } = await supabase
        .from("content")
        .select("*")
        .eq("author_id", authorId!)
        .order("published_date", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

export const myProgressQuery = (userId: string | null) =>
  queryOptions({
    queryKey: ["reading_progress", userId],
    enabled: !!userId,
    queryFn: async (): Promise<Progress[]> => {
      const { data, error } = await supabase.from("reading_progress").select("*");
      if (error) throw error;
      return data ?? [];
    },
  });

export const myNotesQuery = (userId: string | null, contentId?: string) =>
  queryOptions({
    queryKey: ["notes", userId, contentId ?? "all"],
    enabled: !!userId,
    queryFn: async (): Promise<Note[]> => {
      let q = supabase.from("notes").select("*").order("created_at", { ascending: false });
      if (contentId) q = q.eq("content_id", contentId);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });

export const myBookmarksQuery = (userId: string | null) =>
  queryOptions({
    queryKey: ["bookmarks", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase.from("bookmarks").select("*");
      if (error) throw error;
      return data ?? [];
    },
  });

export const myTopicsQuery = (userId: string | null) =>
  queryOptions({
    queryKey: ["followed_topics", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("followed_topics")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

export const myProfileQuery = (userId: string | null) =>
  queryOptions({
    queryKey: ["profile", userId],
    enabled: !!userId,
    queryFn: async (): Promise<Profile | null> => {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", userId!).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

export function readerPath(c: Pick<Content, "slug">) {
  return { to: "/read/$slug" as const, params: { slug: c.slug } };
}
