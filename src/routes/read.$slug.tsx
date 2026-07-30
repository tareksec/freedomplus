import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Bookmark, CheckCircle2, Clock, ExternalLink, Loader2, StickyNote, Trash2 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { EmptyState, ErrorState, Loading } from "@/components/states";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { contentBySlugQuery, myNotesQuery, type Content } from "@/lib/queries";

export const Route = createFileRoute("/read/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `Read ${params.slug.replace(/-/g, " ")} — Freedom Plus` },
      {
        name: "description",
        content:
          "Read this title free and ad-free on Freedom Plus. Track your progress, take notes and keep learning.",
      },
      { property: "og:title", content: "Read free on Freedom Plus" },
      { property: "og:description", content: "Free, ad-free reading with progress tracking and notes." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ReaderPage,
});

function ReaderPage() {
  const { slug } = Route.useParams();
  const { userId } = useAuth();
  const queryClient = useQueryClient();
  const { data: content, isLoading, error } = useQuery(contentBySlugQuery(slug));

  if (isLoading) return <AppShell><Loading label="Opening..." /></AppShell>;
  if (error) return <AppShell><ErrorState error={error} /></AppShell>;
  if (!content)
    return (
      <AppShell>
        <EmptyState
          title="We couldn't find that title"
          description="It may have been moved or removed."
          action={<Link to="/library" className="rounded-full bg-slate-900 px-5 py-2 text-sm text-white">Browse library</Link>}
        />
      </AppShell>
    );

  return <Reader key={content.id} content={content} userId={userId} queryClient={queryClient} />;
}

type ContentRow = Content;

function Reader({
  content,
  userId,
  queryClient,
}: {
  content: ContentRow;
  userId: string | null;
  queryClient: ReturnType<typeof useQueryClient>;
}) {
  const paragraphs = (content.body_text ?? "").split("\n\n").filter(Boolean);

  const { data: progress } = useQuery({
    queryKey: ["reading_progress", userId, content.id],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reading_progress")
        .select("*")
        .eq("content_id", content.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: notes } = useQuery(myNotesQuery(userId, content.id));

  // --- real reading-time tracking -------------------------------------------
  const baselineRef = useRef<number>(0);
  const secondsRef = useRef(0);
  const flushedSecondsRef = useRef(0);
  useEffect(() => {
    baselineRef.current = Number(progress?.total_minutes_spent ?? 0);
  }, [progress?.total_minutes_spent]);

  useEffect(() => {
    if (!userId || !content.body_text) return;
    let active = true;

    const tick = setInterval(() => {
      if (document.visibilityState === "visible") secondsRef.current += 1;
    }, 1000);

    const flush = async () => {
      if (secondsRef.current < 5) return;
      const minutes = baselineRef.current + secondsRef.current / 60;
      await supabase.from("reading_progress").upsert(
        {
          user_id: userId,
          content_id: content.id,
          total_minutes_spent: Number(minutes.toFixed(2)),
          last_read_at: new Date().toISOString(),
          status: progress?.status === "completed" ? "completed" : "in_progress",
          percent_complete: progress?.percent_complete ?? 0,
        },
        { onConflict: "user_id,content_id" },
      );

      // Per-day session log powers the analytics charts.
      const today = new Date().toISOString().slice(0, 10);
      const delta = (secondsRef.current - flushedSecondsRef.current) / 60;
      if (delta > 0) {
        const { data: existing } = await supabase
          .from("reading_sessions")
          .select("id, minutes")
          .eq("content_id", content.id)
          .eq("session_date", today)
          .maybeSingle();
        if (existing) {
          await supabase
            .from("reading_sessions")
            .update({ minutes: Number((Number(existing.minutes) + delta).toFixed(2)) })
            .eq("id", existing.id);
        } else {
          await supabase.from("reading_sessions").insert({
            user_id: userId,
            content_id: content.id,
            session_date: today,
            minutes: Number(delta.toFixed(2)),
          });
        }
        flushedSecondsRef.current = secondsRef.current;
      }
    };

    const saver = setInterval(() => { if (active) void flush(); }, 30000);
    return () => {
      active = false;
      clearInterval(tick);
      clearInterval(saver);
      void flush().then(() => queryClient.invalidateQueries({ queryKey: ["reading_progress"] }));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, content.id]);

  // --- scroll progress ------------------------------------------------------
  const articleRef = useRef<HTMLDivElement>(null);
  const [scrollPct, setScrollPct] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const el = articleRef.current;
      if (!el) return;
      const total = el.scrollHeight - window.innerHeight;
      const pct = total > 0 ? Math.min(100, Math.max(0, Math.round(((window.scrollY - el.offsetTop) / total) * 100))) : 0;
      setScrollPct(pct);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const markRead = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error("Sign in to track your reading");
      const { error } = await supabase.from("reading_progress").upsert(
        {
          user_id: userId,
          content_id: content.id,
          status: "completed",
          percent_complete: 100,
          last_read_at: new Date().toISOString(),
          total_minutes_spent: Number((baselineRef.current + secondsRef.current / 60).toFixed(2)),
        },
        { onConflict: "user_id,content_id" },
      );
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Marked as read");
      queryClient.invalidateQueries({ queryKey: ["reading_progress"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Couldn't save"),
  });

  const toggleBookmark = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error("Sign in to save titles");
      const { data: existing } = await supabase
        .from("bookmarks")
        .select("id")
        .eq("content_id", content.id)
        .maybeSingle();
      if (existing) {
        const { error } = await supabase.from("bookmarks").delete().eq("id", existing.id);
        if (error) throw error;
        return "removed" as const;
      }
      const { error } = await supabase.from("bookmarks").insert({ user_id: userId, content_id: content.id });
      if (error) throw error;
      return "added" as const;
    },
    onSuccess: (r) => {
      toast.success(r === "added" ? "Saved to bookmarks" : "Removed from bookmarks");
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Couldn't save"),
  });

  const [noteText, setNoteText] = useState("");
  const addNote = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error("Sign in to take notes");
      const text = noteText.trim();
      if (!text) throw new Error("Write something first");
      if (text.length > 2000) throw new Error("Notes are limited to 2000 characters");
      const { error } = await supabase.from("notes").insert({ user_id: userId, content_id: content.id, note_text: text });
      if (error) throw error;
    },
    onSuccess: () => {
      setNoteText("");
      toast.success("Note saved");
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Couldn't save note"),
  });

  const deleteNote = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("notes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Note deleted");
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Couldn't delete"),
  });

  return (
    <AppShell>
      <Link to="/library" className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 mb-6">
        <ArrowLeft className="h-4 w-4" /> Back to library
      </Link>

      <div className="grid grid-cols-12 gap-5">
        <article ref={articleRef} className="col-span-12 lg:col-span-8 rounded-3xl glass-card p-6 md:p-9">
          <div className="text-xs uppercase tracking-wider text-emerald-700 font-semibold">
            {content.type} · {content.category}
          </div>
          <h1 className="mt-2 text-3xl md:text-4xl font-bold text-slate-900 leading-tight">{content.title}</h1>
          {content.title_bn && <div className="font-bangla mt-1 text-lg text-slate-600">{content.title_bn}</div>}
          <div className="mt-2 text-slate-700 text-sm">
            by <span className="font-medium">{content.author_name}</span>
            {content.read_time_minutes > 0 && (
              <span className="text-slate-500">
                {" "}· <Clock className="inline h-3 w-3" /> {content.read_time_minutes} min read
              </span>
            )}
          </div>

          {content.cover_image_url && (
            <img
              src={content.cover_image_url}
              alt={content.title}
              className="mt-6 aspect-[16/9] w-full rounded-2xl object-cover"
            />
          )}

          {content.body_text ? (
            <div className="mt-7 space-y-4 text-[15px] leading-relaxed text-slate-800">
              {paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          ) : (
            <div className="mt-7 rounded-2xl bg-amber-50 border border-amber-200 p-5 text-sm text-amber-900">
              <p className="font-semibold">Curated recommendation — not in the public-domain library</p>
              <p className="mt-1">{content.excerpt}</p>
              <p className="mt-2">
                Freedom Plus never hosts copyrighted text. Borrow it free from a library or buy a copy through a legal
                source.
              </p>
              {content.external_url && (
                <a
                  href={content.external_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-4 py-2 text-xs font-medium text-white"
                >
                  Find it legally <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          )}

          {content.is_public_domain && content.external_url && (
            <a
              href={content.external_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center gap-1.5 text-xs text-slate-600 underline"
            >
              Read the complete public-domain edition <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </article>

        <aside className="col-span-12 lg:col-span-4 space-y-5">
          <div className="rounded-3xl glass-card p-5">
            <div className="flex items-center justify-between text-xs text-slate-600 mb-1.5">
              <span>Reading progress</span>
              <span className="font-semibold text-slate-800">
                {progress?.status === "completed" ? 100 : scrollPct}%
              </span>
            </div>
            <div className="h-2.5 rounded-full bg-slate-200 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all"
                style={{ width: `${progress?.status === "completed" ? 100 : scrollPct}%` }}
              />
            </div>
            {progress && (
              <p className="mt-2 text-[11px] text-slate-500">
                {Math.round(Number(progress.total_minutes_spent))} minutes spent so far
              </p>
            )}
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={() => markRead.mutate()}
                disabled={markRead.isPending}
                className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-4 py-2 text-xs font-medium text-white disabled:opacity-60"
              >
                {markRead.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                Mark as read
              </button>
              <button
                onClick={() => toggleBookmark.mutate()}
                disabled={toggleBookmark.isPending}
                className="inline-flex items-center gap-1.5 rounded-full bg-white/70 border border-white/70 px-4 py-2 text-xs font-medium text-slate-700 disabled:opacity-60"
              >
                <Bookmark className="h-3.5 w-3.5" /> Save
              </button>
            </div>
            {!userId && (
              <p className="mt-3 text-[11px] text-slate-500">
                <Link to="/auth" className="underline">
                  Sign in
                </Link>{" "}
                to save progress and notes.
              </p>
            )}
          </div>

          <div className="rounded-3xl glass-card p-5">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <StickyNote className="h-4 w-4" /> Your notes
            </h3>
            {userId ? (
              <>
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  maxLength={2000}
                  rows={3}
                  placeholder="Write a note about this passage..."
                  className="mt-3 w-full rounded-xl bg-white/80 border border-white/70 p-3 text-sm outline-none focus:border-slate-400"
                />
                <button
                  onClick={() => addNote.mutate()}
                  disabled={addNote.isPending}
                  className="mt-2 w-full rounded-full bg-emerald-500 px-4 py-2 text-xs font-medium text-white disabled:opacity-60"
                >
                  {addNote.isPending ? "Saving..." : "Add note"}
                </button>
                <ul className="mt-4 space-y-2">
                  {(notes ?? []).map((n) => (
                    <li key={n.id} className="rounded-xl bg-white/60 p-3 text-xs text-slate-700">
                      <div className="flex items-start justify-between gap-2">
                        <p className="whitespace-pre-wrap">{n.note_text}</p>
                        <button onClick={() => deleteNote.mutate(n.id)} className="text-slate-400 hover:text-rose-600">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div className="mt-1 text-[10px] text-slate-400">
                        {new Date(n.created_at).toLocaleDateString()}
                      </div>
                    </li>
                  ))}
                  {notes && notes.length === 0 && (
                    <li className="text-xs text-slate-500">No notes on this title yet.</li>
                  )}
                </ul>
              </>
            ) : (
              <p className="mt-2 text-xs text-slate-600">
                <Link to="/auth" className="underline">
                  Sign in
                </Link>{" "}
                to take notes while you read.
              </p>
            )}
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
