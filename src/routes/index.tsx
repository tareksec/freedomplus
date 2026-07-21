import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Search, Bell, Clock, Brain, BookOpen, StickyNote,
  Globe2, Atom, PenSquare, Plus, ChevronRight, Sparkles, Library,
  BarChart3, Settings as SettingsIcon,
} from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";
import books3d from "@/assets/books-3d.png";
import courseBook from "@/assets/course-book.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Zolve — অক্ষর পাঠাগার | Your Reading Journey" },
      { name: "description", content: "Curate topics, track comprehension, and discover great books in a serene reading dashboard." },
      { property: "og:title", content: "Zolve — অক্ষর পাঠাগার" },
      { property: "og:description", content: "Curate topics, track comprehension, discover great books." },
    ],
  }),
  component: Index,
});

const topics = [
  { icon: Globe2, label: "Geography" },
  { icon: Atom, label: "Science" },
  { icon: PenSquare, label: "Writing" },
];

const stats = [
  { icon: Clock, label: "Time Read", value: "2.1 Hours/Day", tint: "from-sky-100 to-sky-50" },
  { icon: Brain, label: "Comprehension", value: "92%", tint: "from-violet-100 to-violet-50" },
  { icon: BookOpen, label: "Pages/Day", value: "45", tint: "from-emerald-100 to-emerald-50" },
  { icon: StickyNote, label: "Notes Taken", value: "12", tint: "from-amber-100 to-amber-50" },
];

const authors = [
  { name: "উইক্টর হুগো", img: "https://i.pravatar.cc/120?img=47" },
  { name: "জ্যামিন অস্টার", img: "https://i.pravatar.cc/120?img=45" },
];

const authors2 = [
  { name: "রবীন্দ্রনাথ", img: "https://i.pravatar.cc/120?img=12" },
  { name: "মিসিং কাফু", img: "https://i.pravatar.cc/120?img=33" },
  { name: "নিসিও কাফু", img: "https://i.pravatar.cc/120?img=52" },
  { name: "অসমা প্রীতমযুক্ত", img: "https://i.pravatar.cc/120?img=48" },
];

const discoveries = [
  { icon: "📜", title: "Article: Ancient Mesopotamia", status: "Read", date: "Nov 12, 2024", tone: "emerald" },
  { icon: "📖", title: "Book: A Brief History of Time", status: "In Progress", date: "Oct 27, 2024", tone: "amber" },
  { icon: "🎨", title: "Research: Pre-Columbian Art", status: "Read", date: "Nov 16, 2024", tone: "emerald" },
];

function Index() {
  const [active, setActive] = useState("Library");
  const nav = [
    { label: "Library", icon: Library },
    { label: "Reading Analytics", icon: BarChart3 },
    { label: "Settings", icon: SettingsIcon },
  ];

  return (
    <div
      className="min-h-screen w-full bg-cover bg-center bg-no-repeat p-4 md:p-8 lg:p-12"
      style={{ backgroundImage: `url(${heroBg})` }}
    >
      <div className="mx-auto max-w-[1300px] rounded-[32px] glass-panel p-5 md:p-8">
        {/* Header */}
        <header className="flex flex-wrap items-center gap-4 justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/90 text-white shadow-lg shadow-emerald-500/30">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="flex items-baseline gap-3">
              <span className="text-xl font-bold tracking-tight text-slate-900">zolve</span>
              <span className="font-bangla text-sm text-slate-600">অক্ষর পাঠাগার</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            {nav.map((n) => (
              <button
                key={n.label}
                onClick={() => setActive(n.label)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  active === n.label
                    ? "bg-slate-900 text-white shadow-md"
                    : "text-slate-700 hover:bg-white/60"
                }`}
              >
                {n.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 border border-white/60 w-64">
              <Search className="h-4 w-4 text-slate-500" />
              <input
                placeholder="Search"
                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
              />
            </div>
            <button className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 transition">
              Upgrade
            </button>
            <button className="grid h-9 w-9 place-items-center rounded-full bg-white/70 border border-white/60">
              <Bell className="h-4 w-4 text-slate-700" />
            </button>
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-orange-300 to-rose-400 ring-2 ring-white" />
          </div>
        </header>

        {/* Main grid */}
        <div className="mt-8 grid grid-cols-12 gap-5">
          {/* Left rail — Curated Topics */}
          <aside className="col-span-12 md:col-span-2 lg:col-span-1 flex md:flex-col gap-3 items-start">
            <div className="text-sm font-semibold text-slate-800 leading-tight w-24 md:w-auto">
              Curated<br />Topics
            </div>
            <div className="flex md:flex-col gap-3">
              {topics.map((t) => (
                <button
                  key={t.label}
                  title={t.label}
                  className="grid h-12 w-12 place-items-center rounded-2xl glass-card hover:scale-105 transition"
                >
                  <t.icon className="h-5 w-5 text-slate-700" />
                </button>
              ))}
              <button className="flex h-12 w-12 flex-col items-center justify-center rounded-2xl bg-slate-900/90 text-white hover:bg-slate-900 transition">
                <Plus className="h-4 w-4" />
                <span className="text-[9px] mt-0.5">Add</span>
              </button>
            </div>
          </aside>

          {/* Hero */}
          <section className="col-span-12 md:col-span-10 lg:col-span-6 relative">
            <h1 className="font-bangla text-3xl md:text-4xl lg:text-[42px] font-bold leading-tight text-slate-900">
              অক্ষর পাঠাগার: আপনার<br />জ্ঞানযাত্রা শুরু করুন
            </h1>

            <div className="relative mt-6 h-[380px]">
              <img
                src={books3d}
                alt="Iridescent stack of glass books above an open book"
                className="absolute inset-0 mx-auto h-full w-auto object-contain animate-float"
                width={900}
                height={900}
              />
              {/* Data annotations */}
              <div className="absolute left-2 bottom-24 text-xs text-slate-700">
                <div className="font-medium">Semantic Density</div>
                <div className="text-slate-500">0.749 ± 0.02°</div>
              </div>
              <div className="absolute right-4 top-32 text-xs text-slate-700 text-right">
                <div className="font-medium">Citation Index</div>
                <div className="text-slate-500">0.253 ± 0.01ᶜ</div>
              </div>
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-white/70 backdrop-blur px-4 py-1.5 text-xs text-slate-600 border border-white/60 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Scanning...
              </div>
            </div>
          </section>

          {/* Right column — stats + course */}
          <section className="col-span-12 lg:col-span-5 space-y-5">
            {/* Reading Statistics */}
            <div className="rounded-3xl glass-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-slate-900">Reading Statistics</h3>
                <button className="text-xs text-slate-500 hover:text-slate-900 underline underline-offset-2">See all</button>
              </div>
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
            </div>

            {/* Course card + authors grid */}
            <div className="grid grid-cols-5 gap-5">
              <div className="col-span-3 rounded-3xl glass-soft p-5 relative overflow-hidden">
                <h4 className="font-bangla text-lg font-bold text-slate-900 leading-tight">
                  প্রস্তাবিত কোর্স:<br />তথ্য প্রযুক্তি
                </h4>
                <p className="font-bangla mt-2 text-xs text-slate-600 leading-relaxed max-w-[60%]">
                  নতুন টেকনোলজি কম্পিউটিং কোর্স। ভর্তি হয়ে নিন।
                </p>
                <button className="mt-3 font-bangla rounded-full bg-slate-900 px-4 py-1.5 text-xs font-medium text-white">
                  ভর্তি হোন
                </button>
                <img
                  src={courseBook}
                  alt="Course book"
                  className="absolute -right-4 bottom-0 h-32 w-32 object-contain"
                  loading="lazy"
                />
              </div>

              <div className="col-span-2 space-y-4">
                <AuthorGroup title="শীর্ষ লেখকদের অনুসরণ করুন" authors={authors} />
                <AuthorGroup title="শীর্ষ লেখকদের অনুসরণ করুন" authors={authors2} small />
              </div>
            </div>
          </section>

          {/* Recent Discoveries — full width bottom */}
          <section className="col-span-12 lg:col-start-4 lg:col-span-9 rounded-3xl glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-slate-900">Recent Discoveries</h3>
              <button className="text-xs text-slate-500 hover:text-slate-900 underline underline-offset-2">See all</button>
            </div>
            <ul className="divide-y divide-slate-200/60">
              {discoveries.map((d) => (
                <li key={d.title} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div className="grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-base">
                      {d.icon}
                    </div>
                    <div className="text-sm font-medium text-slate-800">{d.title}</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                        d.tone === "emerald"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {d.status}
                    </span>
                    <span className="text-xs text-slate-500 w-24 text-right hidden sm:block">{d.date}</span>
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

function AuthorGroup({
  title,
  authors,
  small,
}: {
  title: string;
  authors: { name: string; img: string }[];
  small?: boolean;
}) {
  return (
    <div className="rounded-3xl glass-soft p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="font-bangla text-[11px] leading-tight text-slate-700 max-w-[70%]">{title}</div>
        <button className="text-[10px] text-slate-500 underline">See all</button>
      </div>
      <div className={`grid ${small ? "grid-cols-2" : "grid-cols-2"} gap-2`}>
        {authors.map((a) => (
          <div key={a.name} className="flex flex-col items-center gap-1">
            <img
              src={a.img}
              alt={a.name}
              className={`${small ? "h-10 w-10" : "h-14 w-14"} rounded-full object-cover ring-2 ring-white`}
              loading="lazy"
            />
            <span className="font-bangla text-[10px] text-slate-700 text-center leading-tight">{a.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
