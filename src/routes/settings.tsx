import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { User, Bell, Palette, Globe, Shield, LogOut } from "lucide-react";
import { AppShell } from "@/components/app-shell";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Zolve" },
      { name: "description", content: "Manage your Zolve profile, notifications, appearance, and reading preferences." },
      { property: "og:title", content: "Settings — Zolve" },
      { property: "og:description", content: "Manage your profile and preferences." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const [name, setName] = useState("Anika Rahman");
  const [email, setEmail] = useState("anika@zolve.app");
  const [lang, setLang] = useState("Bangla");
  const [notif, setNotif] = useState({ daily: true, weekly: true, achievements: false });
  const [theme, setTheme] = useState<"light" | "auto" | "dark">("light");

  const sections = [
    { icon: User, label: "Profile" },
    { icon: Bell, label: "Notifications" },
    { icon: Palette, label: "Appearance" },
    { icon: Globe, label: "Language" },
    { icon: Shield, label: "Privacy" },
  ];

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-600 mt-1">Personalize your reading experience.</p>
      </div>

      <div className="grid grid-cols-12 gap-5">
        {/* Side nav */}
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
              <button className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm text-rose-600 hover:bg-rose-50">
                <LogOut className="h-4 w-4" /> Log out
              </button>
            </li>
          </ul>
        </aside>

        {/* Content */}
        <div className="col-span-12 lg:col-span-9 space-y-5">
          {/* Profile */}
          <section id="profile" className="rounded-3xl glass-card p-6">
            <h3 className="text-base font-semibold text-slate-900 mb-4">Profile</h3>
            <div className="flex items-center gap-4 mb-5">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-orange-300 to-rose-400 ring-4 ring-white" />
              <div>
                <button className="rounded-full bg-slate-900 px-4 py-1.5 text-xs font-medium text-white">Change photo</button>
                <p className="text-[11px] text-slate-500 mt-1.5">JPG or PNG. Max 2MB.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Full name" value={name} onChange={setName} />
              <Field label="Email" value={email} onChange={setEmail} type="email" />
            </div>
          </section>

          {/* Notifications */}
          <section id="notifications" className="rounded-3xl glass-card p-6">
            <h3 className="text-base font-semibold text-slate-900 mb-4">Notifications</h3>
            <div className="space-y-3">
              <Toggle
                label="Daily reading reminders"
                desc="Nudge me to read at least 15 minutes each day"
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

          {/* Appearance */}
          <section id="appearance" className="rounded-3xl glass-card p-6">
            <h3 className="text-base font-semibold text-slate-900 mb-4">Appearance</h3>
            <div className="grid grid-cols-3 gap-3">
              {(["light", "auto", "dark"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  className={`rounded-2xl p-4 border text-sm capitalize transition ${
                    theme === t
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 bg-white/60 text-slate-700 hover:bg-white"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </section>

          {/* Language */}
          <section id="language" className="rounded-3xl glass-card p-6">
            <h3 className="text-base font-semibold text-slate-900 mb-4">Language</h3>
            <div className="flex flex-wrap gap-2">
              {["English", "Bangla", "Hindi", "Arabic"].map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    lang === l ? "bg-slate-900 text-white" : "bg-white/70 text-slate-700"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </section>

          <div className="flex justify-end gap-2">
            <button className="rounded-full bg-white/70 px-5 py-2 text-sm font-medium text-slate-700 border border-white/70">
              Cancel
            </button>
            <button className="rounded-full bg-emerald-500 px-5 py-2 text-sm font-medium text-white shadow-lg shadow-emerald-500/30">
              Save changes
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function Field({
  label, value, onChange, type = "text",
}: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-slate-600">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-xl bg-white/80 border border-white/70 px-3 py-2 text-sm outline-none focus:border-slate-400"
      />
    </label>
  );
}

function Toggle({
  label, desc, checked, onChange,
}: { label: string; desc: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-white/50 p-3">
      <div>
        <div className="text-sm font-medium text-slate-800">{label}</div>
        <div className="text-[11px] text-slate-500">{desc}</div>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 rounded-full transition ${checked ? "bg-emerald-500" : "bg-slate-300"}`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${
            checked ? "left-[22px]" : "left-0.5"
          }`}
        />
      </button>
    </div>
  );
}
