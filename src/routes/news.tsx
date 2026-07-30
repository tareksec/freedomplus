import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Newspaper, Clock } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { EmptyState, ErrorState, Loading } from "@/components/states";
import { contentListQuery } from "@/lib/queries";

export const Route = createFileRoute("/news")({
  head: () => ({
    meta: [
      { title: "Latest News — Freedom Plus" },
      {
        name: "description",
        content:
          "Trusted, ad-free news covering technology, science, education, AI and cybersecurity — free to read, always.",
      },
      { property: "og:title", content: "Latest News — Freedom Plus" },
      { property: "og:description", content: "Ad-free news across tech, science and education." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: NewsPage,
});

function NewsPage() {
  const { data: news, isLoading, error } = useQuery(contentListQuery("news"));

  return (
    <AppShell>
      <div className="mb-6 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Latest News</h1>
          <p className="text-sm text-slate-600 mt-1">
            Trusted reporting across technology, science and education — always ad-free.
          </p>
        </div>
        {news && (
          <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1.5 text-xs text-slate-700 border border-white/70">
            <Newspaper className="h-3.5 w-3.5" />
            {news.length} stories
          </span>
        )}
      </div>

      {isLoading ? (
        <Loading label="Loading the newsroom..." />
      ) : error ? (
        <ErrorState error={error} />
      ) : !news || news.length === 0 ? (
        <EmptyState title="No stories yet" description="Check back soon — the newsroom publishes weekly." />
      ) : (
        <>
          <Link
            to="/read/$slug"
            params={{ slug: news[0].slug }}
            className="block rounded-3xl glass-card overflow-hidden mb-6 group"
          >
            <div className="grid md:grid-cols-2">
              <div className="aspect-[16/10] md:aspect-auto overflow-hidden bg-slate-100">
                {news[0].cover_image_url && (
                  <img
                    src={news[0].cover_image_url}
                    alt={news[0].title}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                )}
              </div>
              <div className="p-6 md:p-8 flex flex-col justify-center">
                <span className="text-[10px] uppercase tracking-widest text-emerald-700 font-semibold">
                  Featured · {news[0].category}
                </span>
                <h2 className="mt-2 text-2xl md:text-3xl font-bold text-slate-900 leading-tight">{news[0].title}</h2>
                <p className="mt-3 text-sm text-slate-600 leading-relaxed">{news[0].excerpt}</p>
                <div className="mt-4 flex items-center gap-3 text-xs text-slate-500">
                  <span>{news[0].author_name}</span>
                  <span>·</span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {new Date(news[0].published_date).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </Link>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {news.slice(1).map((n) => (
              <Link
                key={n.id}
                to="/read/$slug"
                params={{ slug: n.slug }}
                className="rounded-3xl glass-card overflow-hidden group hover:-translate-y-1 transition"
              >
                <div className="aspect-[16/10] overflow-hidden bg-slate-100">
                  {n.cover_image_url && (
                    <img
                      src={n.cover_image_url}
                      alt={n.title}
                      loading="lazy"
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  )}
                </div>
                <div className="p-4">
                  <div className="text-[10px] uppercase tracking-wider text-slate-500">{n.category}</div>
                  <div className="mt-1 text-sm font-semibold text-slate-900 line-clamp-2 leading-snug">{n.title}</div>
                  <p className="mt-2 text-xs text-slate-600 line-clamp-2">{n.excerpt}</p>
                  <div className="mt-3 text-[11px] text-slate-500">
                    {new Date(n.published_date).toLocaleDateString()}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </AppShell>
  );
}
