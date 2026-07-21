import { createFileRoute, Link } from "@tanstack/react-router";
import { Newspaper, Clock } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { news } from "@/lib/demo-data";

export const Route = createFileRoute("/news")({
  head: () => ({
    meta: [
      { title: "Latest News — Freedom Plus" },
      { name: "description", content: "Trusted, ad-free news covering technology, science, business, AI, cybersecurity, education, and global events." },
      { property: "og:title", content: "Latest News — Freedom Plus" },
      { property: "og:description", content: "Ad-free news across tech, science, business, and world events." },
    ],
  }),
  component: NewsPage,
});

function NewsPage() {
  const [featured, ...rest] = news;

  return (
    <AppShell>
      <div className="mb-6 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Latest News</h1>
          <p className="text-sm text-slate-600 mt-1">
            Trusted reporting across technology, science, business, and world events — always ad-free.
          </p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1.5 text-xs text-slate-700 border border-white/70">
          <Newspaper className="h-3.5 w-3.5" />
          {news.length} stories this week
        </span>
      </div>

      <Link
        to="/news/$id"
        params={{ id: featured.id }}
        className="block rounded-3xl glass-card overflow-hidden mb-6 group"
      >
        <div className="grid md:grid-cols-2">
          <div className="aspect-[16/10] md:aspect-auto overflow-hidden bg-slate-100">
            <img
              src={featured.cover}
              alt={featured.title}
              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
          <div className="p-6 md:p-8 flex flex-col justify-center">
            <span className="text-[10px] uppercase tracking-widest text-emerald-700 font-semibold">
              Featured · {featured.category}
            </span>
            <h2 className="mt-2 text-2xl md:text-3xl font-bold text-slate-900 leading-tight">
              {featured.title}
            </h2>
            <p className="mt-3 text-sm text-slate-600 leading-relaxed">{featured.excerpt}</p>
            <div className="mt-4 flex items-center gap-3 text-xs text-slate-500">
              <span>{featured.source}</span>
              <span>·</span>
              <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {featured.date}</span>
            </div>
          </div>
        </div>
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {rest.map((n) => (
          <Link
            key={n.id}
            to="/news/$id"
            params={{ id: n.id }}
            className="rounded-3xl glass-card overflow-hidden group hover:-translate-y-1 transition"
          >
            <div className="aspect-[16/10] overflow-hidden bg-slate-100">
              <img
                src={n.cover}
                alt={n.title}
                loading="lazy"
                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="p-4">
              <div className="text-[10px] uppercase tracking-wider text-slate-500">{n.category}</div>
              <div className="mt-1 text-sm font-semibold text-slate-900 line-clamp-2 leading-snug">{n.title}</div>
              <p className="mt-2 text-xs text-slate-600 line-clamp-2">{n.excerpt}</p>
              <div className="mt-3 text-[11px] text-slate-500">{n.date}</div>
            </div>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}
