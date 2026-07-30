import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/app-shell";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Choose a new password — Freedom Plus" },
      { name: "description", content: "Set a new password for your free Freedom Plus learning account." },
      { property: "og:title", content: "Reset password — Freedom Plus" },
      { property: "og:description", content: "Set a new password for your Freedom Plus account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) return toast.error("Password must be at least 8 characters");
    if (password !== confirm) return toast.error("Passwords don't match");
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Password updated");
    navigate({ to: "/", replace: true });
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-md rounded-3xl glass-card p-7">
        <h1 className="text-2xl font-bold text-slate-900">Choose a new password</h1>
        <p className="mt-1 text-sm text-slate-600">
          Open this page from the reset link in your email, then set a new password.
        </p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-3">
          {[
            { label: "New password", value: password, set: setPassword },
            { label: "Confirm password", value: confirm, set: setConfirm },
          ].map((f) => (
            <label key={f.label} className="block">
              <span className="text-xs font-medium text-slate-600">{f.label}</span>
              <div className="mt-1 flex items-center gap-2 rounded-xl bg-white/80 border border-white/70 px-3 py-2">
                <Lock className="h-4 w-4 text-slate-500" />
                <input
                  type="password"
                  value={f.value}
                  maxLength={72}
                  onChange={(e) => f.set(e.target.value)}
                  className="w-full bg-transparent text-sm outline-none"
                />
              </div>
            </label>
          ))}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-full bg-slate-900 px-5 py-2.5 text-sm font-medium text-white disabled:opacity-60 inline-flex items-center justify-center gap-2"
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />} Update password
          </button>
        </form>
      </div>
    </AppShell>
  );
}
