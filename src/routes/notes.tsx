import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Pencil, Trash2, Check, X } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { EmptyState, Loading, RequireAuth } from "@/components/states";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { contentListQuery, myNotesQuery } from "@/lib/queries";

export const Route = createFileRoute("/notes")({
  head: () => ({
    meta: [
      { title: "My Notes — Freedom Plus" },
      { name: "description", content: "All the notes you've taken while reading on Freedom Plus, in one place." },
      { property: "og:title", content: "My Notes — Freedom Plus" },
      { property: "og:description", content: "Every note you've taken while reading, saved and searchable." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">My Notes</h1>
        <p className="text-sm text-slate-600 mt-1">Everything you've written down while reading.</p>
      </div>
      <RequireAuth what="your notes">
        <NotesList />
      </RequireAuth>
    </AppShell>
  ),
});

function NotesList() {
  const { userId } = useAuth();
  const queryClient = useQueryClient();
  const { data: notes, isLoading } = useQuery(myNotesQuery(userId));
  const { data: content } = useQuery(contentListQuery());
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  const save = useMutation({
    mutationFn: async ({ id, text }: { id: string; text: string }) => {
      const trimmed = text.trim();
      if (!trimmed) throw new Error("Note can't be empty");
      if (trimmed.length > 2000) throw new Error("Notes are limited to 2000 characters");
      const { error } = await supabase.from("notes").update({ note_text: trimmed }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      setEditing(null);
      toast.success("Note updated");
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Couldn't update"),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("notes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Note deleted");
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Couldn't delete"),
  });

  if (isLoading) return <Loading label="Loading your notes..." />;
  if (!notes || notes.length === 0)
    return (
      <EmptyState
        title="No notes yet"
        description="Open any book or article and use the notes panel while you read."
        action={
          <Link to="/library" className="rounded-full bg-slate-900 px-5 py-2 text-sm text-white">
            Find something to read
          </Link>
        }
      />
    );

  const titleFor = (id: string) => content?.find((c) => c.id === id);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {notes.map((n) => {
        const c = titleFor(n.content_id);
        return (
          <div key={n.id} className="rounded-3xl glass-card p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                {c ? (
                  <Link to="/read/$slug" params={{ slug: c.slug }} className="text-sm font-semibold text-slate-900 hover:underline">
                    {c.title}
                  </Link>
                ) : (
                  <span className="text-sm font-semibold text-slate-900">Untitled</span>
                )}
                <div className="text-[11px] text-slate-500">
                  {new Date(n.updated_at).toLocaleString()}
                </div>
              </div>
              <div className="flex gap-1">
                {editing === n.id ? (
                  <>
                    <button onClick={() => save.mutate({ id: n.id, text: draft })} className="text-emerald-600">
                      <Check className="h-4 w-4" />
                    </button>
                    <button onClick={() => setEditing(null)} className="text-slate-400">
                      <X className="h-4 w-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setEditing(n.id);
                        setDraft(n.note_text);
                      }}
                      className="text-slate-400 hover:text-slate-700"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button onClick={() => remove.mutate(n.id)} className="text-slate-400 hover:text-rose-600">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
            {editing === n.id ? (
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                rows={4}
                maxLength={2000}
                className="mt-3 w-full rounded-xl bg-white/80 border border-white/70 p-3 text-sm outline-none"
              />
            ) : (
              <p className="mt-3 whitespace-pre-wrap text-sm text-slate-700">{n.note_text}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
