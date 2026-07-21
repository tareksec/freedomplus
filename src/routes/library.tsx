import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Star, BookOpen, Search } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { books, articles } from "@/lib/demo-data";

export const Route = createFileRoute("/library")({
  head: () => ({
    meta: [
      { title: "Library — Zolve" },
      { name: "description", content: "Browse your collection of books and articles across every topic you love." },
      { property: "og:title", content: "Library — Zolve" },
      { property: "og:description", content: "Browse your books and articles." },
    ],
  }),
  component: LibraryPage,
});

const categories = ["All", "Science", "History", "Philosophy", "Poetry", "Fiction", "Self-Development"];

function LibraryPage() {
  const [cat, setCat] = useState("All");
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    return books.filter(
      (b) =>
        (cat === "All" || b.category === cat) &&
        (q === "" || (b.title + b.author).toLowerCase().includes(q.toLowerCase())),
    );
  }, [cat, q]);

  return (
    <AppShell>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Your Library</h1>
          <p className="text-sm text-slate-600 mt-1">
            {books.length} books · {articles.length} articles curated for you.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 border border-white/70 w-full sm:w-72">
          <Search className="h-4 w-4 text-slate-500" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search titles, authors..."
            className="w-full bg-transparent text-sm outline-none"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
              cat === c
                ? "bg-slate-900 text-white"
                : "bg-white/70 text-slate-700 hover:bg-white"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {filtered.map((b) => (
          <Link
            key={b.id}
            to="/books/$id"
            params={{ id: b.id }}
            className="group rounded-3xl glass-card p-3 hover:-translate-y-1 transition"
          >
            <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-slate-100">
              <img
                src={b.cover}
                alt={b.title}
                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
            </div>
            <div className="mt-3 px-1">
              <div className="text-[10px] uppercase tracking-wider text-slate-500">{b.category}</div>
              <div className="mt-0.5 text-sm font-semibold text-slate-900 line-clamp-2">{b.title}</div>
              <div className="text-xs text-slate-600 mt-0.5">{b.author}</div>
              <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                <span className="inline-flex items-center gap-1">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> {b.rating}
                </span>
                <span className="inline-flex items-center gap-1">
                  <BookOpen className="h-3 w-3" /> {b.pages}p
                </span>
              </div>
              <div className="mt-2 h-1.5 rounded-full bg-slate-200 overflow-hidden">
                <div
                  className="h-full bg-emerald-500"
                  style={{ width: `${b.progress}%` }}
                />
              </div>
            </div>
          </Link>
        ))}
      </div>

      <h2 className="mt-12 mb-4 text-xl font-semibold text-slate-900">Articles</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {articles.map((a) => (
          <Link
            key={a.id}
            to="/articles/$id"
            params={{ id: a.id }}
            className="flex gap-4 rounded-3xl glass-card p-3 hover:-translate-y-0.5 transition"
          >
            <div className="h-24 w-32 flex-shrink-0 rounded-2xl overflow-hidden bg-slate-100">
              <img src={a.cover} alt={a.title} className="h-full w-full object-cover" loading="lazy" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[10px] uppercase tracking-wider text-slate-500">{a.category}</div>
              <div className="text-sm font-semibold text-slate-900 line-clamp-2">{a.title}</div>
              <p className="text-xs text-slate-600 mt-1 line-clamp-2">{a.excerpt}</p>
              <div className="text-[11px] text-slate-500 mt-2">{a.author} · {a.readTime}</div>
            </div>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}
