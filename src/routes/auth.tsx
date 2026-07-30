import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Loader2, Mail, Lock, User as UserIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/hooks/use-auth";
import { AppShell } from "@/components/app-shell";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in or create an account — Freedom Plus" },
      {
        name: "description",
        content:
          "Create your free Freedom Plus account to save reading progress, take notes and track your learning stats. Always free, always ad-free.",
      },
      { property: "og:title", content: "Sign in — Freedom Plus" },
      { property: "og:description", content: "Free account. Save progress, notes and reading stats." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

const emailSchema = z.string().trim().email("Enter a valid email address").max(255);
const passwordSchema = z.string().min(8, "Password must be at least 8 characters").max(72);

type Mode = "signin" | "signup" | "forgot";

function AuthPage() {
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState<string | null>(null);
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) navigate({ to: "/", replace: true });
  }, [user, loading, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsedEmail = emailSchema.safeParse(email);
    if (!parsedEmail.success) return toast.error(parsedEmail.error.issues[0].message);

    setBusy(true);
    try {
      if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(parsedEmail.data, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        setSent("We sent you a password reset link. Check your inbox.");
        toast.success("Reset link sent");
        return;
      }

      const parsedPw = passwordSchema.safeParse(password);
      if (!parsedPw.success) return toast.error(parsedPw.error.issues[0].message);

      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: parsedEmail.data,
          password: parsedPw.data,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: fullName.trim() || parsedEmail.data.split("@")[0] },
          },
        });
        if (error) throw error;
        if (!data.session) {
          setSent("Almost there — click the confirmation link we emailed you to activate your account.");
          toast.success("Confirmation email sent");
          return;
        }
        toast.success("Welcome to Freedom Plus!");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: parsedEmail.data,
          password,
        });
        if (error) throw error;
        toast.success("Signed in");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setBusy(false);
      toast.error(result.error.message || "Google sign-in failed");
      return;
    }
    if (result.redirected) return;
    toast.success("Signed in with Google");
    setBusy(false);
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-md rounded-3xl glass-card p-7">
        <h1 className="text-2xl font-bold text-slate-900">
          {mode === "signup" ? "Create your free account" : mode === "forgot" ? "Reset your password" : "Welcome back"}
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          {mode === "forgot"
            ? "We'll email you a secure link to choose a new password."
            : "No subscriptions. No ads. Just knowledge."}
        </p>

        {sent ? (
          <div className="mt-6 rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-sm text-emerald-800">
            {sent}
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="mt-6 space-y-3">
              {mode === "signup" && (
                <LabeledInput
                  icon={UserIcon}
                  label="Full name"
                  value={fullName}
                  onChange={setFullName}
                  placeholder="Anika Rahman"
                  maxLength={100}
                />
              )}
              <LabeledInput
                icon={Mail}
                label="Email"
                type="email"
                value={email}
                onChange={setEmail}
                placeholder="you@example.com"
                maxLength={255}
              />
              {mode !== "forgot" && (
                <LabeledInput
                  icon={Lock}
                  label="Password"
                  type="password"
                  value={password}
                  onChange={setPassword}
                  placeholder="At least 8 characters"
                  maxLength={72}
                />
              )}
              <button
                type="submit"
                disabled={busy}
                className="w-full rounded-full bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60 inline-flex items-center justify-center gap-2"
              >
                {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                {mode === "signup" ? "Create account" : mode === "forgot" ? "Send reset link" : "Sign in"}
              </button>
            </form>

            {mode !== "forgot" && (
              <>
                <div className="my-4 flex items-center gap-3 text-[11px] uppercase tracking-wider text-slate-400">
                  <span className="h-px flex-1 bg-slate-200" /> or <span className="h-px flex-1 bg-slate-200" />
                </div>
                <button
                  onClick={handleGoogle}
                  disabled={busy}
                  className="w-full rounded-full bg-white/80 border border-white/70 px-5 py-2.5 text-sm font-medium text-slate-800 hover:bg-white disabled:opacity-60"
                >
                  Continue with Google
                </button>
              </>
            )}
          </>
        )}

        <div className="mt-6 space-y-1.5 text-center text-xs text-slate-600">
          {mode === "signin" && (
            <>
              <button onClick={() => setMode("signup")} className="underline">
                Don't have an account? Sign up
              </button>
              <br />
              <button onClick={() => { setMode("forgot"); setSent(null); }} className="underline">
                Forgot your password?
              </button>
            </>
          )}
          {mode === "signup" && (
            <button onClick={() => setMode("signin")} className="underline">
              Already have an account? Sign in
            </button>
          )}
          {mode === "forgot" && (
            <button onClick={() => { setMode("signin"); setSent(null); }} className="underline">
              Back to sign in
            </button>
          )}
        </div>

        <p className="mt-6 text-center text-[11px] text-slate-500">
          By continuing you agree that Freedom Plus is{" "}
          <Link to="/about" className="underline">
            free and ad-free
          </Link>
          , forever.
        </p>
      </div>
    </AppShell>
  );
}

function LabeledInput({
  icon: Icon,
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  maxLength,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  maxLength?: number;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-slate-600">{label}</span>
      <div className="mt-1 flex items-center gap-2 rounded-xl bg-white/80 border border-white/70 px-3 py-2 focus-within:border-slate-400">
        <Icon className="h-4 w-4 text-slate-500" />
        <input
          type={type}
          value={value}
          maxLength={maxLength}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent text-sm outline-none"
        />
      </div>
    </label>
  );
}
