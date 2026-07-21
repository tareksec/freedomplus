import { Link, useRouterState } from "@tanstack/react-router";
import { Search, Bell, Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import heroBg from "@/assets/hero-bg.jpg";

const nav = [
  { label: "Library", to: "/library" },
  { label: "Reading Analytics", to: "/analytics" },
  { label: "Settings", to: "/settings" },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div
      className="min-h-screen w-full bg-cover bg-center bg-fixed bg-no-repeat p-4 md:p-8 lg:p-12"
      style={{ backgroundImage: `url(${heroBg})` }}
    >
      <div className="mx-auto max-w-[1300px] rounded-[32px] glass-panel p-5 md:p-8">
        <header className="flex flex-wrap items-center gap-4 justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/90 text-white shadow-lg shadow-emerald-500/30">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="flex items-baseline gap-3">
              <span className="text-xl font-bold tracking-tight text-slate-900">zolve</span>
              <span className="font-bangla text-sm text-slate-600 hidden sm:inline">
                অক্ষর পাঠাগার
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {nav.map((n) => {
              const active = pathname === n.to || (n.to !== "/" && pathname.startsWith(n.to));
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    active
                      ? "bg-slate-900 text-white shadow-md"
                      : "text-slate-700 hover:bg-white/60"
                  }`}
                >
                  {n.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 border border-white/60 w-56">
              <Search className="h-4 w-4 text-slate-500" />
              <input
                placeholder="Search books, articles..."
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

        <div className="mt-8">{children}</div>
      </div>
    </div>
  );
}
