import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Search, Star, Clock, Plus, X, ExternalLink } from "lucide-react";
import { z } from "zod";
import { AppShell } from "@/components/app-shell";
import { EmptyState, ErrorState, Loading } from "@/components/states";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { contentListQuery, myTopicsQuery } from "@/lib/queries";

const searchSchema = z.object({
  q: z.string().max(100).optional(),
  type: z.enum(["book", "article", "news"]).optional(),
  category: z.string().max(60).optional(),
});

export const Route = createFileRoute("/library")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Free Library — Books, Articles & News | Freedom Plus" },
      {
        name: "description",
        content:
          "Browse the Freedom Plus library: public-domain books you can read in full, educational articles and ad-free news. Search, filter and sort by topic, type and read time.",
      },
      { property: "og:title", content: "Free Library — Freedom Plus" },
      { property: "og:description", content: "Read free books, articles and news. No ads, no subscriptions." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LibraryPage,
});

type Sort = "newest" | "shortest" | "longest" | "title";

function LibraryPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/library" });
  const { userId } = useAuth();
  const queryClient = useQueryClient();

  const { data: content, isLoading, error } = useQuery(contentListQuery());
  const { data: topics } = useQuery(myTopicsQuery(userId));

  const [sort, setSort] = useState<Sort>("newest");
  const [newTopic, setNewTopic] = useState("");
  const [adding, setAdding] = useState(false);

  const q = search.q ?? "";
  const type = search.type;
  const category = search.category ?? "All";

  const categories = useMemo(
    () => ["All", ...Array.from(new Set((content ?? []).map((c) => c.category))).sort()],
    [content],
  );

  const filtered = useMemo(() => {
    const list = (content ?? []).filter((c) => {
      if (type && c.type !== type) return false;
      if (category !== "All" && c.category !== category) return false;
      if (q) {
        const hay = `${c.title} ${c.author_name} ${c.category}`.toLowerCase();
        if (!hay.includes(q.toLowerCase())) return false;
      }
      return true;
    });
    const sorted = [...list];
    if (sort === "newest") sorted.sort((a, b) => b.published_date.localeCompare(a.published_date));
    if (sort === "shortest") sorted.sort((a, b) => a.read_time_minutes - b.read_time_minutes);
    if (sort === "longest") sorted.sort((a, b) => b.read_time_minutes - a.read_time_minutes);
    if (sort === "title") sorted.sort((a, b) => a.title.localeCompare(b.title));
    return sorted;
  }, [content, q, type, category, sort]);

  const addTopic = useMutation({
    mutationFn: async (topic: string) => {
      if (!userId) throw new Error("Sign in to follow topics");
      const t = topic.trim();
      if (!t) throw new Error("Enter a topic name");
      if (t.length > 60) throw new Error("Topic names are limited to 60 characters");
      const { error: err } = await supabase.from("followed_topics").insert({ user_id: userId, topic: t });
      if (err) throw err;
    },
    onSuccess: () => {
      setNewTopic("");
      setAdding(false);
      toast.success("Topic added to your reading list");
      queryClient.invalidateQueries({ queryKey: ["followed_topics"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Couldn't add topic"),
  });

  const removeTopic = useMutation({
    mutationFn: async (id: string) => {
      const { error: err } = await supabase.from("followed_topics").delete().eq("id", id);
      if (err) throw err;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["followed_topics"] }),
    onError: (e) => toast.error(e instanceof Error ? e.message : "Couldn't remove topic"),
  });

  const setParam = (patch: Record<string, string | undefined>) =>
    navigate({ search: (prev: Record<string, unknown>) => ({ ...prev, ...patch }) as never });

  return (
    <AppShell>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Free Library</h1>
          <p className="text-sm text-slate-600 mt-1">
            {content ? `${content.length} titles` : "Loading"} · public-domain books, articles and ad-free news.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 border border-white/70 w-full sm:w-72">
          <Search className="h-4 w-4 text-slate-500" />
          <input
            value={q}
            maxLength={100}
            onChange={(e) => setParam({ q: e.target.value || undefined })}
            placeholder="Search titles, authors, topics..."
            className="w-full bg-transparent text-sm outline-none"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {(["All", "book", "article", "news"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setParam({ type: t === "All" ? undefined : t })}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium capitalize transition ${
              (t === "All" && !type) || type === t ? "bg-slate-900 text-white" : "bg-white/70 text-slate-700 hover:bg-white"
            }`}
          >
            {t === "All" ? "All types" : `${t}s`}
          </button>
        ))}
        <span className="mx-1 h-4 w-px bg-slate-300" />
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as Sort)}
          className="rounded-full bg-white/70 border border-white/70 px-3 py-1.5 text-xs text-slate-700 outline-none"
        >
          <option value="newest">Newest first</option>
          <option value="shortest">Shortest read</option>
          <option value="longest">Longest read</option>
          <option value="title">Title A–Z</option>
        </select>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setParam({ category: c === "All" ? undefined : c })}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
              category === c ? "bg-emerald-600 text-white" : "bg-white/70 text-slate-700 hover:bg-white"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Followed topics / custom reading list */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-slate-700">My topics:</span>
        {(topics ?? []).map((t) => (
          <span
            key={t.id}
            className="inline-flex items-center gap-1.5 rounded-full bg-white/80 border border-white/70 px-3 py-1.5 text-xs text-slate-700"
          >
            <button onClick={() => setParam({ q: t.topic })} className="hover:underline">
              {t.topic}
            </button>
            <button onClick={() => removeTopic.mutate(t.id)} className="text-slate-400 hover:text-rose-600">
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        {!userId && <span className="text-xs text-slate-500">
          <Link to="/auth" className="underline">Sign in</Link> to follow topics
        </span>}
        {userId && !adding && (
          <button
            onClick={() => setAdding(true)}
            className="inline-flex items-center gap-1 rounded-full bg-slate-900 px-3 py-1.5 text-xs text-white"
          >
            <Plus className="h-3 w-3" /> Add
          </button>
        )}
        {userId && adding && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              addTopic.mutate(newTopic);
            }}
            className="inline-flex items-center gap-1"
          >
            <input
              autoFocus
              value={newTopic}
              maxLength={60}
              onChange={(e) => setNewTopic(e.target.value)}
              placeholder="e.g. Philosophy"
              className="rounded-full bg-white/80 border border-white/70 px-3 py-1.5 text-xs outline-none"
            />
            <button type="submit" className="rounded-full bg-emerald-600 px-3 py-1.5 text-xs text-white">
              Save
            </button>
            <button type="button" onClick={() => setAdding(false)} className="text-xs text-slate-500 px-1">
              Cancel
            </button>
          </form>
        )}
      </div>

      {isLoading ? (
        <Loading label="Loading the library..." />
      ) : error ? (
        <ErrorState error={error} />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="Nothing matches those filters"
          description="Try a different search term, topic or content type."
        />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filtered.map((c) => (
            <Link
              key={c.id}
              to="/read/$slug"
              params={{ slug: c.slug }}
              className="group rounded-3xl glass-card p-3 hover:-translate-y-1 transition"
            >
              <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-slate-100">
                {c.cover_image_url && (
                  <img
                    src={c.cover_image_url}
                    alt={c.title}
                    loading="lazy"
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                )}
              </div>
              <div className="mt-3 px-1">
                <div className="text-[10px] uppercase tracking-wider text-slate-500">
                  {c.type} · {c.category}
                </div>
                <div className="mt-0.5 text-sm font-semibold text-slate-900 line-clamp-2">{c.title}</div>
                <div className="text-xs text-slate-600 mt-0.5">{c.author_name}</div>
                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                  {c.rating ? (
                    <span className="inline-flex items-center gap-1">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> {c.rating}
                    </span>
                  ) : (
                    <span />
                  )}
                  {c.read_time_minutes > 0 ? (
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {c.read_time_minutes}m
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-amber-700">
                      Link <ExternalLink className="h-3 w-3" />
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </AppShell>
  );
}
