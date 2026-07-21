import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Clock, Bookmark, Share2 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { articles } from "@/lib/demo-data";

export const Route = createFileRoute("/articles/$id")({
  loader: ({ params }) => {
    const article = articles.find((a) => a.id === params.id);
    if (!article) throw notFound();
    return { article };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Article not found — Zolve" }, { name: "robots", content: "noindex" }] };
    }
    const { article } = loaderData;
    return {
      meta: [
        { title: `${article.title} — Zolve` },
        { name: "description", content: article.excerpt },
        { property: "og:title", content: article.title },
        { property: "og:description", content: article.excerpt },
        { property: "og:image", content: article.cover },
        { property: "og:type", content: "article" },
        { name: "twitter:image", content: article.cover },
      ],
    };
  },
  notFoundComponent: () => (
    <AppShell>
      <div className="text-center py-24">
        <h1 className="text-2xl font-bold text-slate-900">Article not found</h1>
        <Link to="/library" className="mt-4 inline-block text-sm text-emerald-600 underline">
          Browse library
        </Link>
      </div>
    </AppShell>
  ),
  component: ArticlePage,
});

function ArticlePage() {
  const { article } = Route.useLoaderData();
  return (
    <AppShell>
      <Link to="/library" className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 mb-6">
        <ArrowLeft className="h-4 w-4" /> Back to library
      </Link>

      <article className="rounded-3xl glass-card overflow-hidden">
        <div className="aspect-[21/9] bg-slate-100 overflow-hidden">
          <img src={article.cover} alt={article.title} className="h-full w-full object-cover" />
        </div>
        <div className="p-6 md:p-10 max-w-3xl mx-auto">
          <div className="text-xs uppercase tracking-wider text-emerald-600 font-semibold">
            {article.category}
          </div>
          <h1 className="mt-2 text-3xl md:text-4xl font-bold text-slate-900 leading-tight">
            {article.title}
          </h1>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-4 text-sm text-slate-600 border-b border-slate-200 pb-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-sky-300 to-violet-400" />
              <div>
                <div className="font-medium text-slate-800">{article.author}</div>
                <div className="text-xs text-slate-500 flex items-center gap-2">
                  <span>{article.date}</span>
                  <span>·</span>
                  <Clock className="h-3 w-3" />
                  <span>{article.readTime}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="grid h-9 w-9 place-items-center rounded-full bg-white/70 border border-white/70">
                <Bookmark className="h-4 w-4 text-slate-700" />
              </button>
              <button className="grid h-9 w-9 place-items-center rounded-full bg-white/70 border border-white/70">
                <Share2 className="h-4 w-4 text-slate-700" />
              </button>
            </div>
          </div>

          <p className="mt-6 text-lg text-slate-700 leading-relaxed italic">{article.excerpt}</p>

          <div className="mt-6 space-y-5 text-slate-800 leading-relaxed">
            {article.content.map((p: string, i: number) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>
      </article>
    </AppShell>
  );
}
