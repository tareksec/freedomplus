import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Star, BookOpen, Bookmark } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { books } from "@/lib/demo-data";

export const Route = createFileRoute("/books/$id")({
  loader: ({ params }) => {
    const book = books.find((b) => b.id === params.id);
    if (!book) throw notFound();
    return { book };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Book not found — Zolve" }, { name: "robots", content: "noindex" }] };
    }
    const { book } = loaderData;
    return {
      meta: [
        { title: `${book.title} by ${book.author} — Zolve` },
        { name: "description", content: book.description },
        { property: "og:title", content: book.title },
        { property: "og:description", content: book.description },
        { property: "og:image", content: book.cover },
        { property: "og:type", content: "book" },
        { name: "twitter:image", content: book.cover },
      ],
    };
  },
  notFoundComponent: () => (
    <AppShell>
      <div className="text-center py-24">
        <h1 className="text-2xl font-bold text-slate-900">Book not found</h1>
        <Link to="/library" className="mt-4 inline-block text-sm text-emerald-600 underline">
          Browse library
        </Link>
      </div>
    </AppShell>
  ),
  component: BookPage,
});

function BookPage() {
  const { book } = Route.useLoaderData();

  return (
    <AppShell>
      <Link to="/library" className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 mb-6">
        <ArrowLeft className="h-4 w-4" /> Back to library
      </Link>

      <div className="rounded-3xl glass-card p-6 md:p-10">
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 md:col-span-4">
            <div className="aspect-[3/4] rounded-2xl overflow-hidden shadow-xl">
              <img src={book.cover} alt={book.title} className="h-full w-full object-cover" />
            </div>
          </div>
          <div className="col-span-12 md:col-span-8">
            <div className="text-xs uppercase tracking-wider text-emerald-600 font-semibold">
              {book.category}
            </div>
            <h1 className="mt-2 text-3xl md:text-4xl font-bold text-slate-900 leading-tight">
              {book.title}
            </h1>
            {book.titleBn && (
              <div className="font-bangla mt-1 text-lg text-slate-600">{book.titleBn}</div>
            )}
            <div className="mt-2 text-slate-700">by <span className="font-medium">{book.author}</span></div>

            <div className="mt-5 flex flex-wrap gap-4 text-sm">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 text-amber-800 px-3 py-1">
                <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" /> {book.rating} rating
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-sky-100 text-sky-800 px-3 py-1">
                <BookOpen className="h-3.5 w-3.5" /> {book.pages} pages
              </div>
            </div>

            <p className="mt-6 text-slate-700 leading-relaxed">{book.description}</p>

            <div className="mt-6">
              <div className="flex items-center justify-between text-xs text-slate-600 mb-1.5">
                <span>Reading progress</span>
                <span className="font-semibold text-slate-800">{book.progress}%</span>
              </div>
              <div className="h-2.5 rounded-full bg-slate-200 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500" style={{ width: `${book.progress}%` }} />
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              <button className="rounded-full bg-slate-900 text-white px-5 py-2 text-sm font-medium hover:bg-slate-800">
                {book.progress > 0 ? "Continue reading" : "Start reading"}
              </button>
              <button className="rounded-full bg-white/70 border border-white/70 px-5 py-2 text-sm font-medium text-slate-700 inline-flex items-center gap-1.5">
                <Bookmark className="h-4 w-4" /> Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
