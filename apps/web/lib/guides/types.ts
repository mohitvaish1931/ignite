// Shape of an event's official rulebook. The rulebook page (/rulebooks/[slug]) and
// the event page both render from it, so each event's rules live in one place.

export type GuidePoint = { title?: string; text: string };

/** One slot of a timed programme, e.g. 10:30 - 10:40 AM, Registration of Participants. */
export type ProgrammeItem = { time: string; duration: string; title: string; details: string; highlight?: boolean };

export type GuideBlock =
  | { type: "points"; intro?: string; items: GuidePoint[] }
  | { type: "table"; columns: string[]; rows: string[][] }
  | { type: "compare"; allowed: string[]; notAllowed: string[] }
  | { type: "cards"; label: string; items: { title: string; text: string }[] }
  | { type: "checklist"; title: string; items: string[] }
  | { type: "chips"; label: string; items: string[] }
  | { type: "note"; title?: string; text: string }
  | { type: "timeline"; items: ProgrammeItem[] };

export type GuideSection = { id: string; number: number; title: string; lead?: string; blocks: GuideBlock[] };

export type ScheduleDay = { day: string; date: string; venue: string; activities: string[] };

export type CoordinatorGroup = { title: string; people: { name: string; phone: string }[] };

export type EventGuide = {
  /** The event's slug, which is also the rulebook URL. Events with no sections have no rulebook page. */
  slug: string;
  name: string;
  kicker: string;
  title: { lead: string; accent: string };
  tagline: string;
  organizedBy?: string;
  about: string;
  agreement?: string;
  facts: { label: string; value: string; wide?: boolean }[];
  sections: GuideSection[];
  closing?: string[];
  /** Main button on the rulebook page. */
  cta: { label: string; href: string };

  // Event page
  venue: string;
  keyRules?: string[];
  schedule?: ScheduleDay[];
  programme?: ProgrammeItem[];
  /** More rows for the event page's details panel, e.g. Organized by. */
  details?: { label: string; value: string }[];
  coordinators?: CoordinatorGroup[];
  /** Shown instead of exact start/end times, for events without a fixed slot (e.g. "During Hackathon"). */
  when?: { dates: string; time: string };
  /** A closely tied event, e.g. the hackathon an expert talk runs during. */
  related?: { label: string; href: string };
  /** Where people sign up: an external form, this site's form (with a QR ticket), or not at all. */
  registration: { mode: "external"; url: string } | { mode: "site" } | { mode: "none"; note: string };
  /** Shown beside the "I agree" checkbox when registering on this site. */
  agreementDetail?: string;
  /** Only current students may register (hides "Graduated"). */
  studentsOnly?: boolean;
};
