import { createFileRoute } from "@tanstack/react-router";
import { Clock, Brain, BookOpen, StickyNote, TrendingUp, Flame } from "lucide-react";
import { AppShell } from "@/components/app-shell";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Reading Analytics — Freedom Plus" },
      { name: "description", content: "See how your reading habits evolve — time, comprehension, pages, and streaks." },
      { property: "og:title", content: "Reading Analytics — Freedom Plus" },
      { property: "og:description", content: "Track your reading habits over time." },
    ],
  }),
  component: AnalyticsPage,
});

const bars = [1.2, 2.4, 1.8, 3.1, 2.7, 4.2, 3.6, 2.9, 3.8, 4.5, 3.2, 4.8];
const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const overview = [
  { icon: Clock, label: "Total Time Read", value: "127h", note: "This year", tint: "from-sky-100 to-sky-50" },
  { icon: BookOpen, label: "Books Finished", value: "18", note: "+4 vs last year", tint: "from-emerald-100 to-emerald-50" },
  { icon: Brain, label: "Avg Comprehension", value: "92%", note: "Excellent", tint: "from-violet-100 to-violet-50" },
  { icon: StickyNote, label: "Notes Taken", value: "342", note: "Across 27 books", tint: "from-amber-100 to-amber-50" },
  { icon: Flame, label: "Current Streak", value: "23 days", note: "Personal best!", tint: "from-rose-100 to-rose-50" },
  { icon: TrendingUp, label: "Pages / Day", value: "45", note: "+12% this month", tint: "from-indigo-100 to-indigo-50" },
];

const topics = [
  { name: "Science", pct: 34, color: "bg-emerald-500" },
  { name: "History", pct: 24, color: "bg-sky-500" },
  { name: "Philosophy", pct: 18, color: "bg-violet-500" },
  { name: "Poetry", pct: 14, color: "bg-rose-500" },
  { name: "Fiction", pct: 10, color: "bg-amber-500" },
];

function AnalyticsPage() {
  const max = Math.max(...bars);
  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Reading Analytics</h1>
        <p className="text-sm text-slate-600 mt-1">Your reading journey, measured with care.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {overview.map((o) => (
          <div key={o.label} className={`rounded-2xl bg-gradient-to-br ${o.tint} p-4 border border-white/70`}>
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-white/80">
              <o.icon className="h-4 w-4 text-slate-700" />
            </div>
            <div className="mt-3 text-xl font-bold text-slate-900">{o.value}</div>
            <div className="text-[11px] text-slate-600">{o.label}</div>
            <div className="text-[10px] text-slate-500 mt-1">{o.note}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-12 lg:col-span-8 rounded-3xl glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-semibold text-slate-900">Hours Read per Month</h3>
              <p className="text-xs text-slate-500">2024 · Daily average shown</p>
            </div>
            <div className="text-xs text-slate-500">Avg <span className="font-semibold text-slate-800">3.2h</span></div>
          </div>
          <div className="flex items-end justify-between gap-2 h-56">
            {bars.map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full rounded-t-lg bg-gradient-to-t from-emerald-400 to-emerald-500/70"
                  style={{ height: `${(v / max) * 100}%` }}
                />
                <div className="text-[10px] text-slate-500">{months[i]}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4 rounded-3xl glass-card p-6">
          <h3 className="text-base font-semibold text-slate-900 mb-4">Topics Distribution</h3>
          <div className="space-y-3">
            {topics.map((t) => (
              <div key={t.name}>
                <div className="flex items-center justify-between text-xs text-slate-700 mb-1">
                  <span>{t.name}</span>
                  <span className="text-slate-500">{t.pct}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                  <div className={`h-full ${t.color}`} style={{ width: `${t.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
