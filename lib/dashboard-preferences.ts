export type DashboardThemeId =
  | "crimson"
  | "ocean"
  | "emerald"
  | "sunset"
  | "violet"
  | "graphite"
  | "rose";

export const DASHBOARD_THEME_STORAGE_KEY = "hawklife-dashboard-theme";

export const DASHBOARD_THEMES: Array<{
  id: DashboardThemeId;
  name: string;
  description: string;
  preview: string;
}> = [
  {
    id: "crimson",
    name: "Prep Crimson",
    description: "Warm, polished, and close to the current HawkLife feel.",
    preview: "linear-gradient(135deg, #991b1b 0%, #f97316 55%, #facc15 100%)",
  },
  {
    id: "ocean",
    name: "Ocean Glass",
    description: "Cool blue surfaces with strong contrast and a calmer mood.",
    preview: "linear-gradient(135deg, #0f172a 0%, #0ea5e9 52%, #7dd3fc 100%)",
  },
  {
    id: "emerald",
    name: "Emerald Studio",
    description: "Fresh green accents with soft neutrals and readable panels.",
    preview: "linear-gradient(135deg, #064e3b 0%, #10b981 52%, #a7f3d0 100%)",
  },
  {
    id: "sunset",
    name: "Sunset Glow",
    description: "Copper and amber tones with a bright editorial finish.",
    preview: "linear-gradient(135deg, #7c2d12 0%, #f97316 50%, #fde68a 100%)",
  },
  {
    id: "violet",
    name: "Violet Night",
    description: "Deep indigo and lilac with crisp foreground contrast.",
    preview: "linear-gradient(135deg, #312e81 0%, #7c3aed 52%, #c4b5fd 100%)",
  },
  {
    id: "graphite",
    name: "Graphite",
    description: "Minimal monochrome with subtle steel-blue highlights.",
    preview: "linear-gradient(135deg, #111827 0%, #475569 50%, #cbd5e1 100%)",
  },
  {
    id: "rose",
    name: "Rose Quartz",
    description: "Soft blush and berry accents without sacrificing clarity.",
    preview: "linear-gradient(135deg, #881337 0%, #ec4899 50%, #fbcfe8 100%)",
  },
] as const;

export const DEFAULT_DASHBOARD_THEME: DashboardThemeId = "crimson";
