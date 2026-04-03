// app/(app)/admin/clubs/new/new-club-client.tsx
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Plus, X } from "lucide-react";
import Link from "next/link";
import { createClub } from "@/app/(app)/clubs/actions";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const CATEGORIES = ["STEM", "HUMANITIES", "ARTS", "BUSINESS", "SERVICE", "SPORTS", "FAITH", "OTHER"];
const COMMITMENTS = ["LOW", "MEDIUM", "HIGH"];

const GRADIENT_PRESETS = [
  { from: "#1a3a6e", to: "#0c2a52", label: "Navy" },
  { from: "#8B1A1A", to: "#5c1010", label: "Crimson" },
  { from: "#0a3d2e", to: "#071f17", label: "Forest" },
  { from: "#2d1b6e", to: "#1a0a4a", label: "Violet" },
  { from: "#3d2b00", to: "#1f1600", label: "Bronze" },
  { from: "#1a1a2e", to: "#0d0d1a", label: "Midnight" },
  { from: "#6a1c1c", to: "#3d0f0f", label: "Burgundy" },
  { from: "#1b4332", to: "#0a2218", label: "Emerald" },
];

export function NewClubClient() {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [form, setForm] = useState({
    name:        "",
    emoji:       "🏛️",
    tagline:     "",
    description: "",
    category:    "OTHER",
    commitment:  "MEDIUM",
    meetingDay:  "",
    meetingTime: "",
    meetingRoom: "",
    requiresApp: false,
    tags:        [] as string[],
    gradientFrom: "#1a3a6e",
    gradientTo:   "#0c2a52",
  });
  const [newTag, setNewTag] = useState("");

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const addTag = () => {
    const t = newTag.trim().toLowerCase();
    if (t && !form.tags.includes(t)) {
      setForm((f) => ({ ...f, tags: [...f.tags, t] }));
    }
    setNewTag("");
  };

  const removeTag = (tag: string) => setForm((f) => ({ ...f, tags: f.tags.filter((t) => t !== tag) }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.description.trim()) return;

    startTransition(async () => {
      const result = await createClub(form);
      if (result?.error) {
        toast({ title: "Failed to create club", description: result.error, variant: "destructive" });
      } else if (result?.slug) {
        toast({ title: `${form.emoji} ${form.name} created!` });
        router.push(`/clubs/${result.slug}`);
      }
    });
  };

  return (
    <div className="max-w-2xl space-y-7">
      {/* Header */}
      <div>
        <Link href="/admin" className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-muted-foreground hover:text-foreground transition-colors mb-5">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Admin
        </Link>
        <p className="text-[10.5px] font-bold tracking-[.10em] uppercase text-crimson mb-2">Administration</p>
        <h1 className="font-display text-[30px] font-semibold text-foreground tracking-tight">Create New Club</h1>
      </div>

      {/* Preview */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl overflow-hidden border border-border shadow-card">
        <div
          className="h-24 flex items-end pb-3 pl-4 relative"
          style={{ background: `linear-gradient(135deg, ${form.gradientFrom}, ${form.gradientTo})` }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-3/4 text-4xl">{form.emoji}</div>
          <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-black/50" />
          <span className="relative text-[9px] font-bold uppercase tracking-wide px-2 py-1 rounded-full bg-white/15 text-white/85 backdrop-blur-sm border border-white/14">
            {form.category.charAt(0) + form.category.slice(1).toLowerCase()}
          </span>
        </div>
        <div className="px-4 py-3 bg-card">
          <p className="font-display text-[15px] font-semibold text-foreground">{form.name || "Club Name"}</p>
          <p className="text-[12px] text-muted-foreground line-clamp-2 mt-0.5">{form.description || "Club description will appear here."}</p>
        </div>
      </motion.div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic info */}
        <Section label="Basic Information">
          <div className="grid grid-cols-[80px_1fr] gap-3">
            <Field label="Emoji">
              <input
                value={form.emoji}
                onChange={set("emoji")}
                className="w-full px-3 py-2.5 text-2xl text-center bg-muted border border-transparent rounded-xl outline-none focus:bg-card focus:border-border transition-all"
                maxLength={2}
              />
            </Field>
            <Field label="Club Name *">
              <input
                required
                value={form.name}
                onChange={set("name")}
                placeholder="e.g. Model United Nations"
                className={inputCls}
              />
            </Field>
          </div>

          <Field label="Tagline">
            <input
              value={form.tagline}
              onChange={set("tagline")}
              placeholder="One-line description (shown on the club card)"
              className={inputCls}
              maxLength={80}
            />
          </Field>

          <Field label="Full Description *">
            <textarea
              required
              value={form.description}
              onChange={set("description")}
              placeholder="Describe what this club does, who it's for, and what members can expect…"
              rows={4}
              className={inputCls + " resize-none"}
            />
          </Field>
        </Section>

        {/* Classification */}
        <Section label="Classification">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Category">
              <select value={form.category} onChange={set("category")} className={selectCls}>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c.charAt(0) + c.slice(1).toLowerCase()}</option>
                ))}
              </select>
            </Field>
            <Field label="Commitment Level">
              <select value={form.commitment} onChange={set("commitment")} className={selectCls}>
                {COMMITMENTS.map((c) => (
                  <option key={c} value={c}>{c.charAt(0) + c.slice(1).toLowerCase()}</option>
                ))}
              </select>
            </Field>
          </div>

          {/* Tags */}
          <Field label="Tags">
            <div className="flex flex-wrap gap-2 mb-2">
              {form.tags.map((tag) => (
                <span key={tag} className="flex items-center gap-1 px-2.5 py-1 bg-muted rounded-full text-[12px] font-medium text-foreground/70">
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)} className="text-muted-foreground hover:text-foreground transition-colors">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                placeholder="Add a tag (e.g. competitive, travel)"
                className={cn(inputCls, "flex-1")}
              />
              <button type="button" onClick={addTag} className="px-4 py-2.5 bg-muted rounded-xl text-[13px] font-medium hover:bg-muted/70 transition-colors">
                Add
              </button>
            </div>
          </Field>
        </Section>

        {/* Meeting */}
        <Section label="Meeting Schedule">
          <div className="grid grid-cols-3 gap-3">
            <Field label="Day(s)">
              <input value={form.meetingDay} onChange={set("meetingDay")} placeholder="e.g. Tuesday & Thursday" className={inputCls} />
            </Field>
            <Field label="Time">
              <input value={form.meetingTime} onChange={set("meetingTime")} placeholder="e.g. 3:15 PM" className={inputCls} />
            </Field>
            <Field label="Room">
              <input value={form.meetingRoom} onChange={set("meetingRoom")} placeholder="e.g. Room 214" className={inputCls} />
            </Field>
          </div>
        </Section>

        {/* Gradient */}
        <Section label="Club Color">
          <p className="text-[12px] text-muted-foreground mb-3">Choose a gradient for this club&apos;s card.</p>
          <div className="grid grid-cols-4 gap-2">
            {GRADIENT_PRESETS.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => setForm((f) => ({ ...f, gradientFrom: p.from, gradientTo: p.to }))}
                className={cn(
                  "h-14 rounded-xl transition-all border-2",
                  form.gradientFrom === p.from ? "border-white scale-105 shadow-lg" : "border-transparent hover:scale-102"
                )}
                style={{ background: `linear-gradient(135deg, ${p.from}, ${p.to})` }}
                title={p.label}
              />
            ))}
          </div>
        </Section>

        {/* Options */}
        <Section label="Options">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.requiresApp}
              onChange={(e) => setForm((f) => ({ ...f, requiresApp: e.target.checked }))}
              className="w-4 h-4 accent-crimson rounded"
            />
            <div>
              <p className="text-[13.5px] font-medium text-foreground">Requires Application</p>
              <p className="text-[12px] text-muted-foreground">Students must apply to join this club.</p>
            </div>
          </label>
        </Section>

        {/* Submit */}
        <div className="flex items-center gap-3 pt-2">
          <Link href="/admin" className="px-5 py-2.5 border border-border rounded-xl text-[13.5px] font-medium text-muted-foreground hover:bg-muted transition-colors">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isPending || !form.name.trim()}
            className="flex items-center gap-2 px-6 py-2.5 bg-crimson text-white rounded-xl text-[13.5px] font-medium hover:bg-crimson/90 disabled:opacity-50 transition-all shadow-lg shadow-crimson/25"
          >
            <Plus className="h-4 w-4" />
            {isPending ? "Creating…" : "Create Club"}
          </button>
        </div>
      </form>
    </div>
  );
}

const inputCls  = "w-full px-4 py-2.5 bg-muted border border-transparent rounded-xl text-[13.5px] outline-none focus:bg-card focus:border-border focus:ring-2 focus:ring-crimson/10 transition-all placeholder:text-muted-foreground";
const selectCls = "w-full px-4 py-2.5 bg-muted border border-transparent rounded-xl text-[13.5px] outline-none focus:bg-card focus:border-border transition-all";

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-[.09em] text-muted-foreground/60 mb-3 pb-2.5 border-b border-border">{label}</p>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[12.5px] font-semibold text-foreground/80">{label}</label>
      {children}
    </div>
  );
}
