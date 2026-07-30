import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Clock, BookOpen, StickyNote, Flame, CheckCircle2, Target } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { EmptyState, Loading, RequireAuth } from "@/components/states";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { contentListQuery, myNotesQuery, myProfileQuery, myProgressQuery } from "@/lib/queries";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Your Reading Analytics — Freedom Plus" },
      {
        name: "description",
        content:
          "See real charts of your reading time, completion rate, favourite categories and notes taken — computed from your own activity on Freedom Plus.",
      },
      { property: "og:title", content: "Reading Analytics — Freedom Plus" },
      { property: "og:description", content: "Real charts from your own reading activity." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Reading Analytics</h1>
        <p className="text-sm text-slate-600 mt-1">Your reading journey, measured from real activity.</p>
      </div>
      <RequireAuth what="your reading analytics">
        <AnalyticsBody />
      </RequireAuth>
    </AppShell>
  ),
});

const PALETTE = ["#10b981", "#0ea5e9", "#8b5cf6", "#f43f5e", "#f59e0b", "#14b8a6"];

function last30Days() {
  const days: string[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

function AnalyticsBody() {
  const { userId } = useAuth();

  const { data: sessions, isLoading: sLoading } = useQuery({
    queryKey: ["reading_sessions", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reading_sessions")
        .select("*")
        .order("session_date", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });
  const { data: progress, isLoading: pLoading } = useQuery(myProgressQuery(userId));
  const { data: notes, isLoading: nLoading } = useQuery(myNotesQuery(userId));
  const { data: content } = useQuery(contentListQuery());
  const { data: profile } = useQuery(myProfileQuery(userId));

  const days = useMemo(last30Days, []);

  const dailyMinutes = useMemo(() => {
    const map = new Map<string, number>();
    (sessions ?? []).forEach((s) => map.set(s.session_date, (map.get(s.session_date) ?? 0) + Number(s.minutes)));
    return days.map((d) => ({
      date: d.slice(5),
      minutes: Math.round((map.get(d) ?? 0) * 10) / 10,
    }));
  }, [sessions, days]);

  const notesPerDay = useMemo(() => {
    const map = new Map<string, number>();
    (notes ?? []).forEach((n) => {
      const d = n.created_at.slice(0, 10);
      map.set(d, (map.get(d) ?? 0) + 1);
    });
    return days.map((d) => ({ date: d.slice(5), notes: map.get(d) ?? 0 }));
  }, [notes, days]);

  const categoryMinutes = useMemo(() => {
    const byContent = new Map((content ?? []).map((c) => [c.id, c.category]));
    const map = new Map<string, number>();
    (sessions ?? []).forEach((s) => {
      const cat = byContent.get(s.content_id) ?? "Other";
      map.set(cat, (map.get(cat) ?? 0) + Number(s.minutes));
    });
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value: Math.round(value) }))
      .filter((e) => e.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [sessions, content]);

  const totalMinutes = (progress ?? []).reduce((sum, p) => sum + Number(p.total_minutes_spent), 0);
  const completed = (progress ?? []).filter((p) => p.status === "completed").length;
  const started = (progress ?? []).length;
  const completionRate = started ? Math.round((completed / started) * 100) : 0;

  const streak = useMemo(() => {
    const set = new Set((sessions ?? []).filter((s) => Number(s.minutes) > 0).map((s) => s.session_date));
    let count = 0;
    const d = new Date();
    while (set.has(d.toISOString().slice(0, 10))) {
      count++;
      d.setDate(d.getDate() - 1);
    }
    return count;
  }, [sessions]);

  const goal = profile?.reading_goal_minutes_per_day ?? 30;
  const todayMinutes = dailyMinutes[dailyMinutes.length - 1]?.minutes ?? 0;

  if (sLoading || pLoading || nLoading) return <Loading label="Crunching your numbers..." />;

  if (started === 0 && (sessions ?? []).length === 0 && (notes ?? []).length === 0) {
    return (
      <EmptyState
        title="Start reading to see your stats"
        description="Open any book or article and your reading time, completion rate and notes will show up here."
      />
    );
  }

  const overview = [
    { icon: Clock, label: "Total Time Read", value: `${Math.round(totalMinutes)}m`, note: "All time", tint: "from-sky-100 to-sky-50" },
    { icon: BookOpen, label: "Titles Started", value: String(started), note: `${completed} finished`, tint: "from-emerald-100 to-emerald-50" },
    { icon: CheckCircle2, label: "Completion Rate", value: `${completionRate}%`, note: "Finished vs started", tint: "from-violet-100 to-violet-50" },
    { icon: StickyNote, label: "Notes Taken", value: String((notes ?? []).length), note: "All time", tint: "from-amber-100 to-amber-50" },
    { icon: Flame, label: "Current Streak", value: `${streak} day${streak === 1 ? "" : "s"}`, note: "Consecutive reading days", tint: "from-rose-100 to-rose-50" },
    { icon: Target, label: "Today vs Goal", value: `${Math.round(todayMinutes)}/${goal}m`, note: "Daily reading goal", tint: "from-indigo-100 to-indigo-50" },
  ];

  return (
    <>
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
          <h3 className="text-base font-semibold text-slate-900">Minutes read per day</h3>
          <p className="text-xs text-slate-500 mb-4">Last 30 days</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyMinutes}>
                <defs>
                  <linearGradient id="mins" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={4} />
                <YAxis tick={{ fontSize: 10 }} width={30} />
                <Tooltip />
                <Area type="monotone" dataKey="minutes" stroke="#10b981" fill="url(#mins)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4 rounded-3xl glass-card p-6">
          <h3 className="text-base font-semibold text-slate-900 mb-4">Most-read categories</h3>
          {categoryMinutes.length === 0 ? (
            <p className="text-sm text-slate-500">No reading time recorded yet.</p>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryMinutes} dataKey="value" nameKey="name" innerRadius={45} outerRadius={80} paddingAngle={3}>
                    {categoryMinutes.map((_, i) => (
                      <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => `${v} min`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
          <ul className="mt-2 space-y-1">
            {categoryMinutes.slice(0, 5).map((c, i) => (
              <li key={c.name} className="flex items-center justify-between text-xs text-slate-700">
                <span className="inline-flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ background: PALETTE[i % PALETTE.length] }} />
                  {c.name}
                </span>
                <span className="text-slate-500">{c.value}m</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="col-span-12 rounded-3xl glass-card p-6">
          <h3 className="text-base font-semibold text-slate-900">Notes taken over time</h3>
          <p className="text-xs text-slate-500 mb-4">Last 30 days</p>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={notesPerDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={4} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10 }} width={30} />
                <Tooltip />
                <Bar dataKey="notes" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </>
  );
}
