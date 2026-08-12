import type { SeverityKey, ConsultationStatus } from "./types";

export const SEVERITIES: {
  key: SeverityKey;
  label: string;
  color: string;
  desc: string;
}[] = [
  { key: "low",      label: "Mild",     color: "#10b981", desc: "Minor / manageable" },
  { key: "medium",   label: "Moderate", color: "#f59e0b", desc: "Affecting daily activity" },
  { key: "high",     label: "Severe",   color: "#f97316", desc: "Significant distress" },
  { key: "critical", label: "Critical", color: "#ef4444", desc: "Urgent — needs immediate care" },
];

export const BODY_SYSTEMS = [
  "Head / Neurological",
  "Eyes / Ears / Nose / Throat",
  "Chest / Respiratory",
  "Heart / Cardiovascular",
  "Abdomen / Digestive",
  "Urinary / Reproductive",
  "Skin / Musculoskeletal",
  "Mental / Psychological",
  "Other / General",
] as const;

export const DURATIONS = [
  "Today only",
  "2–3 days",
  "4–7 days",
  "1–2 weeks",
  "More than 2 weeks",
] as const;

export const ONSET = [
  "Sudden (came on quickly)",
  "Gradual (slowly got worse)",
] as const;

export const YES_NO = ["Yes", "No", "Not sure"] as const;

export const STATUS_COLORS: Record<ConsultationStatus, string> = {
  submitted:    "#f59e0b",
  under_review: "#3b82f6",
  assigned:     "#8b5cf6",
  responded:    "#10b981",
  closed:       "#6b7280",
};

export const SEVERITY_COLORS: Record<SeverityKey, string> = {
  low:      "#10b981",
  medium:   "#f59e0b",
  high:     "#f97316",
  critical: "#ef4444",
};
