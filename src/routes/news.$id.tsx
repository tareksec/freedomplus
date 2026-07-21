import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Clock, Share2 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { news } from "@/lib/demo-data";

export const Route = createFileRoute("/news/$id")({
  loader: ({ params }) => {
    const item = news.find((n) => n.id === params.id);
    if (!item) throw notFound();
    return { item };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "News not found — Freedom Plus" }, { name: "robots", content: "noindex" }] };
    }
    const { item } = loaderData;
    return {
      meta: [
        { title: `${item.title} — Freedom Plus` },
        { name: "description", content: item.excerpt },
        { property: "og:title", content: item.title },
        { property: "og:description", content: item.excerpt },
        { property: "og:image", content: item.cover },
        { property: "og:type", content: "article" },
        { name: "twitter:image", content: item.cover },
      ],
    };
  },
  notFoundComponent: () => (
    <AppShell>
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold text-slate-900">Story not found</h1>
        <Link to="/news" className="mt-4 inline-block text-emerald-700 underline">Back to News</Link>
      </div>
    </AppShell>
  ),
  component: NewsDetail,
});

function NewsDetail() {
  const { item } = Route.useLoaderData();
  return (
    <AppShell>
      <Link to="/news" className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900 mb-4">
        <ArrowLeft className="h-4 w-4" /> All news
      </Link>
      <article className="rounded-3xl glass-card overflow-hidden">
        <div className="aspect-[21/9] bg-slate-100">
          <img src={item.cover} alt={item.title} className="h-full w-full object-cover" />
        </div>
        <div className="p-6 md:p-10 max-w-3xl">
          <span className="text-[10px] uppercase tracking-widest text-emerald-700 font-semibold">{item.category}</span>
          <h1 className="mt-2 text-3xl md:text-4xl font-bold text-slate-900 leading-tight">{item.title}</h1>
          <div className="mt-3 flex items-center gap-3 text-xs text-slate-500">
            <span>{item.source}</span>
            <span>·</span>
            <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {item.date}</span>
            <button className="ml-auto inline-flex items-center gap-1 text-slate-600 hover:text-slate-900">
              <Share2 className="h-3.5 w-3.5" /> Share
            </button>
          </div>
          <div className="mt-6 space-y-4 text-slate-700 leading-relaxed">
            {item.content.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>
      </article>
    </AppShell>
  );
}
