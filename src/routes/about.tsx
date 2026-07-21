import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BookOpen, Newspaper, FileText, ShieldOff, Globe2, Zap, Check,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Freedom Plus — Free Learning for Everyone" },
      { name: "description", content: "Freedom Plus is a free, ad-free learning platform. Read free books, educational articles, and the latest news — no subscriptions, no distractions." },
      { property: "og:title", content: "About Freedom Plus — Free Learning for Everyone" },
      { property: "og:description", content: "Free books, articles, and news. No ads. No subscriptions. Just knowledge." },
    ],
    scripts: [{
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: [
          { "@type": "Question", name: "Is Freedom Plus free?", acceptedAnswer: { "@type": "Answer", text: "Yes. Freedom Plus is completely free to use." } },
          { "@type": "Question", name: "Do I need a subscription?", acceptedAnswer: { "@type": "Answer", text: "No. You can access learning resources without paying." } },
          { "@type": "Question", name: "Does Freedom Plus have ads?", acceptedAnswer: { "@type": "Answer", text: "No. Freedom Plus offers a completely ad-free reading experience." } },
          { "@type": "Question", name: "Can I read books online?", acceptedAnswer: { "@type": "Answer", text: "Yes. You can read free books online from anywhere." } },
          { "@type": "Question", name: "What content is available?", acceptedAnswer: { "@type": "Answer", text: "Books, educational articles, learning resources, and the latest news." } },
        ],
      }),
    }],
  }),
  component: AboutPage,
});

const features = [
  { icon: BookOpen, title: "Read Free Books", body: "Thousands of free books across technology, programming, cybersecurity, business, literature, history, science, and personal development." },
  { icon: FileText, title: "Educational Articles", body: "Expert-written articles that help you learn new skills and understand complex topics." },
  { icon: Newspaper, title: "Latest News", body: "Trusted news across technology, education, science, business, AI, cybersecurity, and global events." },
  { icon: ShieldOff, title: "Completely Ad-Free", body: "No advertisements, no pop-ups, no distractions — ever." },
  { icon: Globe2, title: "Learn Anywhere", body: "Fully responsive on desktop, tablet, and mobile." },
  { icon: Zap, title: "Fast & Simple", body: "Lightweight and built for speed and accessibility." },
];

const audiences = [
  "Students", "Teachers", "Researchers", "Developers",
  "Professionals", "Entrepreneurs", "Lifelong Learners", "Book Lovers",
];

const benefits = [
  "Read unlimited free books",
  "Learn new skills every day",
  "Discover high-quality educational articles",
  "Stay updated with trusted news",
  "Enjoy a clean reading experience",
  "No advertisements",
  "No distractions",
  "Completely free",
];

const faqs = [
  { q: "Is Freedom Plus free?", a: "Yes. Freedom Plus is completely free to use." },
  { q: "Do I need a subscription?", a: "No. You can access learning resources without paying." },
  { q: "Does Freedom Plus have ads?", a: "No. Freedom Plus offers a completely ad-free reading experience." },
  { q: "Can I read books online?", a: "Yes. You can read free books online from anywhere." },
  { q: "What content is available?", a: "Books, educational articles, learning resources, and the latest news." },
];

function AboutPage() {
  return (
    <AppShell>
      {/* Hero */}
      <section className="rounded-3xl glass-card p-8 md:p-12 text-center">
        <span className="inline-block rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold px-3 py-1">
          100% Free · Ad-Free · No Subscriptions
        </span>
        <h1 className="mt-4 text-4xl md:text-5xl font-bold text-slate-900 leading-tight">
          Learn Freely. Read Freely. Grow Freely.
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-slate-700 leading-relaxed">
          Freedom Plus is a modern free learning platform created for everyone who believes knowledge should be
          accessible without barriers. Read free books, explore high-quality articles, and stay informed with the
          latest news — all in one clean, distraction-free place.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link to="/library" className="rounded-full bg-slate-900 text-white px-5 py-2.5 text-sm font-medium hover:bg-slate-800">
            Explore the Library
          </Link>
          <Link to="/news" className="rounded-full bg-white/80 text-slate-900 px-5 py-2.5 text-sm font-medium border border-white/70 hover:bg-white">
            Read Latest News
          </Link>
        </div>
      </section>

      {/* Why */}
      <section className="mt-8 rounded-3xl glass-soft p-8">
        <h2 className="text-2xl font-bold text-slate-900">Why Choose Freedom Plus?</h2>
        <p className="mt-3 max-w-3xl text-slate-700 leading-relaxed">
          Learning should never depend on your budget. Freedom Plus makes education open and accessible by offering
          carefully organized books, informative articles, and reliable news that anyone can access anytime — with a
          fast website, clean interface, and zero advertising interruptions.
        </p>
      </section>

      {/* Features */}
      <section className="mt-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-5">Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => (
            <div key={f.title} className="rounded-3xl glass-card p-5">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500/90 text-white shadow-md shadow-emerald-500/30">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">{f.title}</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Mission */}
      <section className="mt-8 rounded-3xl glass-card p-8">
        <h2 className="text-2xl font-bold text-slate-900">Our Mission</h2>
        <p className="mt-3 max-w-3xl text-slate-700 leading-relaxed">
          Freedom Plus believes that knowledge should be free. Our mission is to create an open learning ecosystem
          where students, professionals, researchers, and lifelong learners can access valuable educational resources
          without subscriptions or advertisements. We are building a community where curiosity grows through free
          access to books, articles, and reliable information.
        </p>
      </section>

      {/* Audiences */}
      <section className="mt-8 rounded-3xl glass-soft p-8">
        <h2 className="text-2xl font-bold text-slate-900">Who Is Freedom Plus For?</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {audiences.map((a) => (
            <span key={a} className="rounded-full bg-white/80 border border-white/70 px-4 py-1.5 text-sm text-slate-700">
              {a}
            </span>
          ))}
          <span className="rounded-full bg-slate-900 text-white px-4 py-1.5 text-sm">
            Anyone who loves learning
          </span>
        </div>
      </section>

      {/* Benefits */}
      <section className="mt-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-5">Benefits</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {benefits.map((b) => (
            <div key={b} className="flex items-center gap-3 rounded-2xl glass-card p-4">
              <div className="grid h-7 w-7 place-items-center rounded-full bg-emerald-500 text-white flex-shrink-0">
                <Check className="h-4 w-4" />
              </div>
              <span className="text-sm text-slate-800">{b}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Difference */}
      <section className="mt-8 rounded-3xl glass-card p-8">
        <h2 className="text-2xl font-bold text-slate-900">Why Freedom Plus Is Different</h2>
        <p className="mt-3 max-w-3xl text-slate-700 leading-relaxed">
          Many websites overload visitors with pop-ups, banners, and intrusive advertisements. Freedom Plus focuses
          on one thing: helping people learn. Every feature is designed to make reading faster, easier, and more enjoyable.
        </p>
      </section>

      {/* FAQ */}
      <section className="mt-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-5">Frequently Asked Questions</h2>
        <div className="space-y-3">
          {faqs.map((f) => (
            <details key={f.q} className="rounded-2xl glass-card p-5 group">
              <summary className="cursor-pointer list-none flex items-center justify-between text-sm font-semibold text-slate-900">
                {f.q}
                <span className="text-slate-400 group-open:rotate-180 transition-transform">▾</span>
              </summary>
              <p className="mt-3 text-sm text-slate-600 leading-relaxed">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mt-8 rounded-3xl glass-soft p-10 text-center">
        <h2 className="text-3xl font-bold text-slate-900">Start Learning Today</h2>
        <p className="mt-3 max-w-2xl mx-auto text-slate-700">
          Join thousands of readers who believe knowledge should be free. Explore books, discover articles, and stay
          informed with the latest news — without advertisements.
        </p>
        <p className="mt-4 text-sm font-semibold text-emerald-700">
          Freedom Plus — Learn More. Read More. Grow More.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link to="/library" className="rounded-full bg-slate-900 text-white px-6 py-3 text-sm font-medium hover:bg-slate-800">
            Browse Free Books
          </Link>
          <Link to="/news" className="rounded-full bg-white/80 text-slate-900 px-6 py-3 text-sm font-medium border border-white/70 hover:bg-white">
            Read the Latest News
          </Link>
        </div>
      </section>
    </AppShell>
  );
}
