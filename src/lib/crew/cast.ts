export type CrewId = "dana" | "marcus" | "priya" | "walt" | "lena" | "theo";

export interface CrewMember {
  id: CrewId;
  name: string;
  initials: string;
  color: string;
  tagline: string;
  /** the emoji this person reaches for */
  reacts: string[];
}

/**
 * A cast of characters who live in the app. They are openly fictional — the card says so —
 * and they only ever "see" what's on this phone, because everything they say is computed here.
 */
export const CREW: CrewMember[] = [
  { id: "dana", name: "Dana", initials: "D", color: "#7c5cff", tagline: "14 months in · at goal, maintaining", reacts: ["❤️", "👏"] },
  { id: "marcus", name: "Marcus", initials: "M", color: "#0f9d9a", tagline: "started this August too · semaglutide", reacts: ["🔥", "💪", "😂"] },
  { id: "priya", name: "Priya", initials: "P", color: "#e08a00", tagline: "runner · C25K took her three tries", reacts: ["🏃", "🔥", "👏"] },
  { id: "walt", name: "Walt", initials: "W", color: "#2f6fe4", tagline: "62 · a year on tirzepatide", reacts: ["👍"] },
  { id: "lena", name: "Lena", initials: "L", color: "#d63d8a", tagline: "spreadsheet person · trend-line believer", reacts: ["📈", "👏"] },
  { id: "theo", name: "Theo", initials: "T", color: "#1f9d55", tagline: "week 3 · still nervous with the pen", reacts: ["🙌", "🤯"] },
];

export const crewById = (id: CrewId): CrewMember => CREW.find((m) => m.id === id)!;