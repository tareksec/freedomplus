import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import {
  Clock, BookOpen, StickyNote, CheckCircle2,
  Plus, ChevronRight, Tag,
} from "lucide-react";
import books3d from "@/assets/books-3d.png";
import courseBook from "@/assets/course-book.png";
import { AppShell } from "@/components/app-shell";
import { useAuth } from "@/hooks/use-auth";
import {
  authorsQuery,
  contentListQuery,
  myNotesQuery,
  myProgressQuery,
  type Author,
} from "@/lib/queries";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Freedom Plus | Free Learning Platform – Read Free Books, Articles & News" },
      { name: "description", content: "Freedom Plus is a free learning platform where everyone can read free books, explore educational articles, and stay updated with the latest news. Enjoy an ad-free reading experience and unlimited access to knowledge." },
      { property: "og:title", content: "Freedom Plus | Free Learning Platform – Read Free Books, Articles & News" },
      { property: "og:description", content: "Freedom Plus is a free learning platform where everyone can read free books, explore educational articles, and stay updated with the latest news. Enjoy an ad-free reading experience and unlimited access to knowledge." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const { userId } = useAuth();
  const { data: content } = useQuery(contentListQuery());
  const { data: authors } = useQuery(authorsQuery());
  const { data: progress } = useQuery(myProgressQuery(userId));
  const { data: notes } = useQuery(myNotesQuery(userId));

  const topics = useMemo(() => {
    const counts = new Map<string, number>();
    (content ?? []).forEach((c) => counts.set(c.category, (counts.get(c.category) ?? 0) + 1));
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([label]) => label);
  }, [content]);

  const recent = (content ?? []).slice(0, 4);
  const progressByContent = useMemo(
    () => new Map((progress ?? []).map((p) => [p.content_id, p])),
    [progress],
  );

  const totalMinutes = (progress ?? []).reduce((s, p) => s + Number(p.total_minutes_spent), 0);
  const completed = (progress ?? []).filter((p) => p.status === "completed").length;
  const started = (progress ?? []).length;
  const hasData = started > 0 || (notes ?? []).length > 0;

  const featured = (authors ?? []).filter((a) => a.is_featured);
  const others = (authors ?? []).filter((a) => !a.is_featured);

  const stats = [
    { icon: Clock, label: "Time Read", value: `${Math.round(totalMinutes)} min`, tint: "from-sky-100 to-sky-50" },
    { icon: BookOpen, label: "Titles Started", value: String(started), tint: "from-emerald-100 to-emerald-50" },
    { icon: CheckCircle2, label: "Completed", value: String(completed), tint: "from-violet-100 to-violet-50" },
    { icon: StickyNote, label: "Notes Taken", value: String((notes ?? []).length), tint: "from-amber-100 to-amber-50" },
  ];

  return (
    <AppShell>
      <div className="grid grid-cols-12 gap-5">
        {/* Left rail */}
        <aside className="col-span-12 md:col-span-2 lg:col-span-1 flex md:flex-col gap-3 items-start">
          <div className="text-sm font-semibold text-slate-800 leading-tight w-24 md:w-auto">
            Curated<br />Topics
          </div>
          <div className="flex md:flex-col gap-3">
            {topics.map((t) => (
              <Link
                key={t}
                to="/library"
                search={{ category: t }}
                title={t}
                className="grid h-12 w-12 place-items-center rounded-2xl glass-card hover:scale-105 transition"
              >
                <Tag className="h-5 w-5 text-slate-700" />
              </Link>
            ))}
            <Link
              to="/library"
              className="flex h-12 w-12 flex-col items-center justify-center rounded-2xl bg-slate-900/90 text-white hover:bg-slate-900 transition"
              title="Follow more topics"
            >
              <Plus className="h-4 w-4" />
              <span className="text-[9px] mt-0.5">Add</span>
            </Link>
          </div>
        </aside>

        {/* Hero */}
        <section className="col-span-12 md:col-span-10 lg:col-span-6 relative">
          <h1 className="text-3xl md:text-4xl lg:text-[42px] font-bold leading-tight text-slate-900">
            Learn Freely.<br />Read Freely. Grow Freely.
          </h1>
          <p className="mt-3 text-sm md:text-base text-slate-700 max-w-md">
            Freedom Plus is a free learning platform — public-domain books, expert articles, and trusted news. No subscriptions. No ads. Just knowledge.
          </p>
          <div className="relative mt-6 h-[380px]">
            <img
              src={books3d}
              alt="Iridescent stack of glass books above an open book"
              className="absolute inset-0 mx-auto h-full w-auto object-contain animate-float"
              width={900}
              height={900}
            />
            <div className="absolute left-2 bottom-24 text-xs text-slate-700">
              <div className="font-medium">Titles available</div>
              <div className="text-slate-500">{content?.length ?? 0} free to read</div>
            </div>
            <div className="absolute right-4 top-32 text-xs text-slate-700 text-right">
              <div className="font-medium">Authors</div>
              <div className="text-slate-500">{authors?.length ?? 0} voices</div>
            </div>
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-white/70 backdrop-blur px-4 py-1.5 text-xs text-slate-600 border border-white/60 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              100% ad-free library
            </div>
          </div>
        </section>

        {/* Right column */}
        <section className="col-span-12 lg:col-span-5 space-y-5">
          <div className="rounded-3xl glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-slate-900">Reading Statistics</h3>
              <Link to="/analytics" className="text-xs text-slate-500 hover:text-slate-900 underline underline-offset-2">See all</Link>
            </div>
            {!userId ? (
              <div className="rounded-2xl bg-white/60 p-5 text-center">
                <p className="text-sm text-slate-700">Sign in to track your reading.</p>
                <Link to="/auth" className="mt-3 inline-block rounded-full bg-slate-900 px-4 py-1.5 text-xs font-medium text-white">
                  Sign in — it's free
                </Link>
              </div>
            ) : !hasData ? (
              <div className="rounded-2xl bg-white/60 p-5 text-center">
                <p className="text-sm text-slate-700">Start reading to see your stats.</p>
                <Link to="/library" className="mt-3 inline-block rounded-full bg-slate-900 px-4 py-1.5 text-xs font-medium text-white">
                  Browse the library
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {stats.map((s) => (
                  <div key={s.label} className={`rounded-2xl bg-gradient-to-br ${s.tint} p-3 border border-white/70`}>
                    <div className="flex items-center gap-2">
                      <div className="grid h-7 w-7 place-items-center rounded-lg bg-white/80">
                        <s.icon className="h-3.5 w-3.5 text-slate-700" />
                      </div>
                      <div className="text-[11px] text-slate-600">{s.label}</div>
                    </div>
                    <div className="mt-1.5 text-sm font-semibold text-slate-900">{s.value}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-5 gap-5">
            <div className="col-span-3 rounded-3xl glass-soft p-5 relative overflow-hidden">
              <h4 className="text-lg font-bold text-slate-900 leading-tight">
                Featured Path:<br />Technology & AI
              </h4>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed max-w-[60%]">
                Programming guides, cybersecurity content, and machine learning explainers — all free.
              </p>
              <Link to="/library" search={{ q: "technology" }} className="inline-block mt-3 rounded-full bg-slate-900 px-4 py-1.5 text-xs font-medium text-white">
                Start Learning
              </Link>
              <img
                src={courseBook}
                alt="Technology course book"
                className="absolute -right-4 bottom-0 h-32 w-32 object-contain"
                loading="lazy"
              />
            </div>

            <div className="col-span-2 space-y-4">
              <AuthorGroup title="Featured authors on Freedom Plus" authors={featured.slice(0, 2)} />
              <AuthorGroup title="Discover more voices" authors={others.slice(0, 4)} small />
            </div>
          </div>
        </section>

        {/* Recent Discoveries */}
        <section className="col-span-12 lg:col-start-4 lg:col-span-9 rounded-3xl glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-slate-900">Recent Discoveries</h3>
            <Link to="/library" className="text-xs text-slate-500 hover:text-slate-900 underline underline-offset-2">See all</Link>
          </div>
          {recent.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-500">Loading the library…</p>
          ) : (
            <ul className="divide-y divide-slate-200/60">
              {recent.map((c) => {
                const p = progressByContent.get(c.id);
                const status = p?.status === "completed" ? "Read" : p ? "In Progress" : "New";
                return (
                  <li key={c.id}>
                    <Link
                      to="/read/$slug"
                      params={{ slug: c.slug }}
                      className="flex items-center justify-between py-3 hover:bg-white/40 rounded-xl px-2 -mx-2 transition"
                    >
                      <div className="flex items-center gap-3">
                        <div className="grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                          {c.category[0]}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-slate-800">{c.title}</div>
                          <div className="text-[11px] text-slate-500">
                            {c.category} · {c.read_time_minutes} min read
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                            status === "Read"
                              ? "bg-emerald-100 text-emerald-700"
                              : status === "In Progress"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-sky-100 text-sky-700"
                          }`}
                        >
                          {status}
                        </span>
                        <span className="text-xs text-slate-500 w-24 text-right hidden sm:block">
                          {new Date(c.published_date).toLocaleDateString()}
                        </span>
                        <ChevronRight className="h-4 w-4 text-slate-400" />
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </AppShell>
  );
}

function AuthorGroup({ title, authors, small }: { title: string; authors: Author[]; small?: boolean }) {
  return (
    <div className="rounded-3xl glass-soft p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="text-[11px] leading-tight text-slate-700 max-w-[70%]">{title}</div>
        <Link to="/library" className="text-[10px] text-slate-500 underline">See all</Link>
      </div>
      {authors.length === 0 ? (
        <p className="text-[10px] text-slate-500">No authors yet.</p>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {authors.map((a) => (
            <Link key={a.id} to="/authors/$slug" params={{ slug: a.slug }} className="flex flex-col items-center gap-1">
              <img
                src={a.avatar_url ?? ""}
                alt={a.name}
                className={`${small ? "h-10 w-10" : "h-14 w-14"} rounded-full object-cover ring-2 ring-white bg-slate-200`}
                loading="lazy"
              />
              <span className="text-[10px] text-slate-700 text-center leading-tight">{a.name.split(" ")[0]}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
