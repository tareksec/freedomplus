import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Search, Sparkles, LogOut, LogIn } from "lucide-react";
import { useState, type ReactNode } from "react";
import heroBg from "@/assets/hero-bg.jpg";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

const nav = [
  { label: "Library", to: "/library" },
  { label: "News", to: "/news" },
  { label: "About", to: "/about" },
  { label: "Notes", to: "/notes" },
  { label: "Analytics", to: "/analytics" },
  { label: "Settings", to: "/settings" },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [term, setTerm] = useState("");

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

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
              <span className="text-xl font-bold tracking-tight text-slate-900">Freedom Plus</span>
              <span className="text-sm text-slate-600 hidden sm:inline">Learn Freely</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {nav.map((n) => {
              const active = pathname.startsWith(n.to);
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={`rounded-full px-3.5 py-2 text-sm font-medium transition ${
                    active ? "bg-slate-900 text-white shadow-md" : "text-slate-700 hover:bg-white/60"
                  }`}
                >
                  {n.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                navigate({ to: "/library", search: { q: term || undefined } });
              }}
              className="hidden sm:flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 border border-white/60 w-56"
            >
              <Search className="h-4 w-4 text-slate-500" />
              <input
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder="Search books, articles, news..."
                maxLength={100}
                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
              />
            </form>

            {!loading && user ? (
              <>
                <Link
                  to="/settings"
                  title={user.email ?? "Account"}
                  className="h-9 w-9 rounded-full bg-gradient-to-br from-orange-300 to-rose-400 ring-2 ring-white grid place-items-center text-xs font-bold text-white"
                >
                  {(user.email ?? "?")[0].toUpperCase()}
                </Link>
                <button
                  onClick={signOut}
                  title="Sign out"
                  className="grid h-9 w-9 place-items-center rounded-full bg-white/70 border border-white/60 hover:bg-white"
                >
                  <LogOut className="h-4 w-4 text-slate-700" />
                </button>
              </>
            ) : (
              <Link
                to="/auth"
                className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition inline-flex items-center gap-1.5"
              >
                <LogIn className="h-4 w-4" /> Sign in
              </Link>
            )}
          </div>
        </header>

        <div className="mt-8">{children}</div>
      </div>
    </div>
  );
}
