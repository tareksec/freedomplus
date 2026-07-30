import { Link } from "@tanstack/react-router";
import { Loader2, Inbox, LogIn } from "lucide-react";
import type { ReactNode } from "react";
import { useAuth } from "@/hooks/use-auth";

export function Loading({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-16 text-sm text-slate-600">
      <Loader2 className="h-4 w-4 animate-spin" /> {label}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-3xl glass-card p-10 text-center">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-white/70">
        <Inbox className="h-5 w-5 text-slate-500" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-slate-900">{title}</h3>
      {description && <p className="mt-1 text-sm text-slate-600">{description}</p>}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}

export function ErrorState({ error }: { error: unknown }) {
  const message = error instanceof Error ? error.message : "Something went wrong.";
  return (
    <div className="rounded-3xl glass-card p-8 text-center">
      <h3 className="text-base font-semibold text-slate-900">Couldn't load this</h3>
      <p className="mt-1 text-sm text-slate-600">{message}</p>
    </div>
  );
}

/** Renders children only for signed-in users; otherwise an inline login prompt. */
export function RequireAuth({ children, what }: { children: ReactNode; what: string }) {
  const { user, loading } = useAuth();

  if (loading) return <Loading />;
  if (user) return <>{children}</>;

  return (
    <div className="rounded-3xl glass-card p-10 text-center max-w-lg mx-auto">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-emerald-500/90 text-white">
        <LogIn className="h-5 w-5" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-slate-900">Sign in to see {what}</h3>
      <p className="mt-1 text-sm text-slate-600">
        Freedom Plus is free forever — an account just keeps your progress, notes and stats in sync.
      </p>
      <div className="mt-5 flex justify-center gap-2">
        <Link
          to="/auth"
          className="rounded-full bg-slate-900 px-5 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          Sign in
        </Link>
        <Link
          to="/library"
          className="rounded-full bg-white/70 border border-white/70 px-5 py-2 text-sm font-medium text-slate-700"
        >
          Browse library
        </Link>
      </div>
    </div>
  );
}
