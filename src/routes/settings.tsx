import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { User, Bell, Globe, Shield, LogOut, Target, Loader2 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Loading, RequireAuth } from "@/components/states";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { myProfileQuery } from "@/lib/queries";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Account Settings — Freedom Plus" },
      {
        name: "description",
        content:
          "Manage your Freedom Plus profile, daily reading goal, notification preferences, password and account.",
      },
      { property: "og:title", content: "Account Settings — Freedom Plus" },
      { property: "og:description", content: "Manage your profile, reading goal and notifications." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-600 mt-1">Personalize your reading experience.</p>
      </div>
      <RequireAuth what="your settings">
        <SettingsBody />
      </RequireAuth>
    </AppShell>
  ),
});

function SettingsBody() {
  const { user, userId } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { data: profile, isLoading } = useQuery(myProfileQuery(userId));

  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [goal, setGoal] = useState(30);
  const [notif, setNotif] = useState({ daily: true, weekly: true, achievements: false });
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    if (!profile) return;
    setFullName(profile.full_name ?? "");
    setAvatarUrl(profile.avatar_url ?? "");
    setGoal(profile.reading_goal_minutes_per_day);
    setNotif({
      daily: profile.notify_daily,
      weekly: profile.notify_weekly,
      achievements: profile.notify_achievements,
    });
  }, [profile]);

  const saveProfile = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error("Not signed in");
      if (fullName.trim().length > 100) throw new Error("Name is too long");
      if (goal < 5 || goal > 600) throw new Error("Goal must be between 5 and 600 minutes");
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName.trim() || null,
          avatar_url: avatarUrl.trim() || null,
          reading_goal_minutes_per_day: goal,
          notify_daily: notif.daily,
          notify_weekly: notif.weekly,
          notify_achievements: notif.achievements,
        })
        .eq("id", userId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Settings saved");
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Couldn't save"),
  });

  const changePassword = useMutation({
    mutationFn: async () => {
      if (newPassword.length < 8) throw new Error("Password must be at least 8 characters");
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
    },
    onSuccess: () => {
      setNewPassword("");
      toast.success("Password updated");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Couldn't update password"),
  });

  const deleteAccount = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error("Not signed in");
      // Deleting the profile row cascades to progress, notes, bookmarks and sessions.
      const { error } = await supabase.from("profiles").delete().eq("id", userId);
      if (error) throw error;
      await supabase.auth.signOut();
    },
    onSuccess: () => {
      queryClient.clear();
      toast.success("Your data has been deleted");
      navigate({ to: "/", replace: true });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Couldn't delete account"),
  });

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  if (isLoading) return <Loading label="Loading your profile..." />;

  const sections = [
    { icon: User, label: "Profile" },
    { icon: Target, label: "Goal" },
    { icon: Bell, label: "Notifications" },
    { icon: Shield, label: "Security" },
    { icon: Globe, label: "Account" },
  ];

  return (
    <div className="grid grid-cols-12 gap-5">
      <aside className="col-span-12 lg:col-span-3 rounded-3xl glass-card p-3 h-fit">
        <ul className="space-y-1">
          {sections.map((s, i) => (
            <li key={s.label}>
              <a
                href={`#${s.label.toLowerCase()}`}
                className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium ${
                  i === 0 ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-white/60"
                }`}
              >
                <s.icon className="h-4 w-4" /> {s.label}
              </a>
            </li>
          ))}
          <li className="pt-2 mt-2 border-t border-slate-200">
            <button
              onClick={signOut}
              className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm text-rose-600 hover:bg-rose-50"
            >
              <LogOut className="h-4 w-4" /> Log out
            </button>
          </li>
        </ul>
      </aside>

      <div className="col-span-12 lg:col-span-9 space-y-5">
        <section id="profile" className="rounded-3xl glass-card p-6">
          <h3 className="text-base font-semibold text-slate-900 mb-4">Profile</h3>
          <div className="flex items-center gap-4 mb-5">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Your avatar" className="h-16 w-16 rounded-full object-cover ring-4 ring-white" />
            ) : (
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-orange-300 to-rose-400 ring-4 ring-white" />
            )}
            <div className="flex-1">
              <Field label="Avatar image URL" value={avatarUrl} onChange={setAvatarUrl} placeholder="https://..." />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Full name" value={fullName} onChange={setFullName} maxLength={100} />
            <label className="block">
              <span className="text-xs font-medium text-slate-600">Email</span>
              <input
                value={user?.email ?? ""}
                disabled
                className="mt-1 w-full rounded-xl bg-slate-100 border border-white/70 px-3 py-2 text-sm text-slate-500"
              />
            </label>
          </div>
          {profile && (
            <p className="mt-3 text-[11px] text-slate-500">
              Member since {new Date(profile.joined_date).toLocaleDateString()}
            </p>
          )}
        </section>

        <section id="goal" className="rounded-3xl glass-card p-6">
          <h3 className="text-base font-semibold text-slate-900 mb-4">Daily reading goal</h3>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min={5}
              max={180}
              step={5}
              value={goal}
              onChange={(e) => setGoal(Number(e.target.value))}
              className="flex-1"
            />
            <span className="w-24 text-sm font-semibold text-slate-800">{goal} min/day</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-500">
            Your progress against this goal shows on the{" "}
            <Link to="/analytics" className="underline">
              analytics page
            </Link>
            .
          </p>
        </section>

        <section id="notifications" className="rounded-3xl glass-card p-6">
          <h3 className="text-base font-semibold text-slate-900 mb-4">Notifications</h3>
          <div className="space-y-3">
            <Toggle
              label="Daily reading reminders"
              desc="Nudge me to hit my daily goal"
              checked={notif.daily}
              onChange={(v) => setNotif((n) => ({ ...n, daily: v }))}
            />
            <Toggle
              label="Weekly progress digest"
              desc="Sunday summary of what you read"
              checked={notif.weekly}
              onChange={(v) => setNotif((n) => ({ ...n, weekly: v }))}
            />
            <Toggle
              label="Achievement unlocks"
              desc="Celebrate milestones and streaks"
              checked={notif.achievements}
              onChange={(v) => setNotif((n) => ({ ...n, achievements: v }))}
            />
          </div>
        </section>

        <div className="flex justify-end">
          <button
            onClick={() => saveProfile.mutate()}
            disabled={saveProfile.isPending}
            className="rounded-full bg-emerald-500 px-5 py-2 text-sm font-medium text-white shadow-lg shadow-emerald-500/30 inline-flex items-center gap-2 disabled:opacity-60"
          >
            {saveProfile.isPending && <Loader2 className="h-4 w-4 animate-spin" />} Save changes
          </button>
        </div>

        <section id="security" className="rounded-3xl glass-card p-6">
          <h3 className="text-base font-semibold text-slate-900 mb-4">Change password</h3>
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[220px]">
              <Field
                label="New password"
                type="password"
                value={newPassword}
                onChange={setNewPassword}
                maxLength={72}
                placeholder="At least 8 characters"
              />
            </div>
            <button
              onClick={() => changePassword.mutate()}
              disabled={changePassword.isPending || !newPassword}
              className="rounded-full bg-slate-900 px-5 py-2 text-sm font-medium text-white disabled:opacity-60"
            >
              Update password
            </button>
          </div>
        </section>

        <section id="account" className="rounded-3xl glass-card p-6">
          <h3 className="text-base font-semibold text-slate-900 mb-1">Delete account</h3>
          <p className="text-xs text-slate-600 mb-4">
            This permanently erases your profile, reading progress, notes and bookmarks. It can't be undone.
          </p>
          <button
            onClick={() => {
              if (window.confirm("Permanently delete your Freedom Plus data? This cannot be undone.")) {
                deleteAccount.mutate();
              }
            }}
            disabled={deleteAccount.isPending}
            className="rounded-full bg-rose-600 px-5 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            Delete my account
          </button>
        </section>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  maxLength,
}: {
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
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        maxLength={maxLength}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-xl bg-white/80 border border-white/70 px-3 py-2 text-sm outline-none focus:border-slate-400"
      />
    </label>
  );
}

function Toggle({
  label,
  desc,
  checked,
  onChange,
}: {
  label: string;
  desc: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-white/50 p-3">
      <div>
        <div className="text-sm font-medium text-slate-800">{label}</div>
        <div className="text-[11px] text-slate-500">{desc}</div>
      </div>
      <button
        onClick={() => onChange(!checked)}
        aria-label={label}
        className={`relative h-6 w-11 rounded-full transition ${checked ? "bg-emerald-500" : "bg-slate-300"}`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${checked ? "left-[22px]" : "left-0.5"}`}
        />
      </button>
    </div>
  );
}
