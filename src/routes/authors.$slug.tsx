import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { EmptyState, ErrorState, Loading } from "@/components/states";
import { authorBySlugQuery, authorContentQuery } from "@/lib/queries";

export const Route = createFileRoute("/authors/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug.replace(/-/g, " ")} — Author on Freedom Plus` },
      {
        name: "description",
        content: "Explore this author's available works on Freedom Plus — free public-domain reading and legal links.",
      },
      { property: "og:title", content: "Author profile — Freedom Plus" },
      { property: "og:description", content: "Browse this author's free and curated works." },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthorPage,
});

function AuthorPage() {
  const { slug } = Route.useParams();
  const { data: author, isLoading, error } = useQuery(authorBySlugQuery(slug));
  const { data: works, isLoading: worksLoading } = useQuery(authorContentQuery(author?.id));

  if (isLoading) return <AppShell><Loading /></AppShell>;
  if (error) return <AppShell><ErrorState error={error} /></AppShell>;
  if (!author)
    return (
      <AppShell>
        <EmptyState title="Author not found" description="This profile doesn't exist." />
      </AppShell>
    );

  return (
    <AppShell>
      <div className="rounded-3xl glass-card p-6 md:p-8 flex flex-wrap items-center gap-6">
        {author.avatar_url && (
          <img src={author.avatar_url} alt={author.name} className="h-24 w-24 rounded-full object-cover ring-4 ring-white" />
        )}
        <div className="min-w-0 flex-1">
          <h1 className="text-3xl font-bold text-slate-900">{author.name}</h1>
          <p className="mt-2 text-sm text-slate-700 max-w-2xl">{author.bio}</p>
          <span
            className={`mt-3 inline-block rounded-full px-3 py-1 text-[11px] font-medium ${
              author.is_public_domain ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
            }`}
          >
            {author.is_public_domain ? "Public domain — read free in full" : "Copyrighted — curated links only"}
          </span>
        </div>
      </div>

      <h2 className="mt-8 mb-4 text-xl font-semibold text-slate-900">Available on Freedom Plus</h2>
      {worksLoading ? (
        <Loading />
      ) : (works ?? []).length === 0 ? (
        <EmptyState title="No titles yet" description="We haven't added work by this author to the library." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {(works ?? []).map((w) => (
            <Link
              key={w.id}
              to="/read/$slug"
              params={{ slug: w.slug }}
              className="rounded-3xl glass-card p-4 hover:-translate-y-1 transition"
            >
              <div className="aspect-[16/10] rounded-2xl overflow-hidden bg-slate-100">
                {w.cover_image_url && (
                  <img src={w.cover_image_url} alt={w.title} loading="lazy" className="h-full w-full object-cover" />
                )}
              </div>
              <div className="mt-3 text-[10px] uppercase tracking-wider text-slate-500">
                {w.type} · {w.category}
              </div>
              <div className="text-sm font-semibold text-slate-900">{w.title}</div>
              <p className="mt-1 text-xs text-slate-600 line-clamp-2">{w.excerpt}</p>
              <div className="mt-2 text-[11px]">
                {w.is_public_domain ? (
                  <span className="text-emerald-700">Read free in full</span>
                ) : (
                  <span className="text-amber-700 inline-flex items-center gap-1">
                    Legal source <ExternalLink className="h-3 w-3" />
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </AppShell>
  );
}
