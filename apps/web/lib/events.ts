// IEEE IGNITE '26 events, served straight from the site (no database).
// Exported from the live events table on 2026-10-03; while on-site accounts are switched off
// (see _backend/README.md), this file is where events are added or edited.

export type EventState = "PUBLISHED" | "REGISTRATION_OPEN" | "REGISTRATION_CLOSED" | "LIVE" | "COMPLETED";

export type SiteEvent = {
  /** URL id: /events/<slug> */
  slug: string;
  /** The event's id in the old database, so previously shared /events/<uuid> links still open */
  legacyId: string;
  name: string;
  summary: string;
  description: string;
  state: EventState;
  category: { name: string };
  organization: { name: string };
  /** ISO timestamps (UTC) */
  startAt: string;
  endAt: string;
  registrationEndAt: string | null;
  timezone: string;
  capacity: number | null;
  imageUrl: string | null;
};

const ORGANIZER = { name: "IEEE Student Branch, SKIT Jaipur" };

export const EVENTS: SiteEvent[] = [
  {
    slug: "ieee-ignite-symposium-2026",
    legacyId: "255e4eb2-1366-40dd-815a-6015c9d94377",
    name: "IEEE IGNITE Symposium 2026",
    summary: "Recent Advancements in RF, Microwave, EMI/EMC · 12–13 October 2026 · SKIT Jaipur",
    description: "IEEE IGNITE Symposium 2026 is a free, two-day technical symposium on recent advancements in RF, Microwave, EMI and EMC. Through expert-led sessions, hands-on workshops, interactive activities and a technical quiz, it aims to bridge the gap between theory and practical application.\n\nOrganized by the IEEE Student Branch, SKIT Jaipur, in association with the IEEE MTT-S Student Branch Chapter, SKIT Jaipur.\n\nDay 1 (12 October): 7F’11, Civil Block, SKIT. Day 2 (13 October): ECL-06, CS Block, SKIT. Free registration, limited to 200 participants; registration closes on 8 October 2026.",
    state: "REGISTRATION_OPEN",
    category: { name: "Symposium" },
    organization: ORGANIZER,
    startAt: "2026-10-12T05:30:00Z",
    endAt: "2026-10-13T10:30:00Z",
    registrationEndAt: "2026-10-08T18:29:59Z",
    timezone: "Asia/Kolkata",
    capacity: 200,
    imageUrl: null,
  },
  {
    slug: "round-table-conference-2026",
    legacyId: "a0fef016-5ed6-44ad-a49d-e1665865f866",
    name: "Round Table Conference 2026",
    summary: "“Leveraging Technology for a Better Tomorrow” · Connecting Innovation, Sustainability and Society · 13 October 2026 · SKIT Jaipur",
    description: "A round table conference on “Leveraging Technology for a Better Tomorrow”, connecting innovation, sustainability and society. A keynote address and an integrated panel discussion cover emerging technologies, AI, sustainability, future skills and responsible innovation, followed by an “Ask the Experts” audience session and key recommendations.\n\n13 October 2026 · 10:30 AM - 1:30 PM · Community Hall, Idea Lab, SKIT Jaipur. No registration required.",
    state: "PUBLISHED",
    category: { name: "Conference" },
    organization: ORGANIZER,
    startAt: "2026-10-13T05:00:00Z",
    endAt: "2026-10-13T08:00:00Z",
    registrationEndAt: null,
    timezone: "Asia/Kolkata",
    capacity: null,
    imageUrl: null,
  },
  {
    slug: "ieee-ignite-panel-discussion",
    legacyId: "433a1223-41c3-488f-8689-08428da33f83",
    name: "IEEE IGNITE Panel Discussion",
    summary: "Experts on emerging technologies, innovation and industry trends · 13 October 2026 · JC Bose, SKIT Jaipur",
    description: "An interactive session where experts share insights and perspectives on emerging technologies, innovation, and industry trends.\n\n13 October 2026 · 11:00 AM - 2:00 PM · JC Bose, SKIT Jaipur. Individual participation, free registration. Organized by IEEE, CS CSC, TEC SBC and WIE AG.",
    state: "REGISTRATION_OPEN",
    category: { name: "Panel Discussion" },
    organization: ORGANIZER,
    startAt: "2026-10-13T05:30:00Z",
    endAt: "2026-10-13T08:30:00Z",
    registrationEndAt: null,
    timezone: "Asia/Kolkata",
    capacity: null,
    imageUrl: null,
  },
  {
    slug: "ieee-ignite-expert-talk",
    legacyId: "d3a5ae8e-ed8c-4e93-8b0f-e9d503c20150",
    name: "IEEE IGNITE Expert Talk",
    summary: "Expert talk during the IEEE IGNITE Hackathon · 14–15 October 2026 · Indoor Sports Complex, SKIT Jaipur",
    description: "An expert talk held during the 24-hour IEEE IGNITE Hackathon 2026 at the Indoor Sports Complex, SKIT Jaipur. Free, with no registration needed.\n\nOrganized by IEEE, CSE/IT, ECE, IDEA Lab, IIC, CS SBC, MTTs SBC, TEC SBC and WIE AG.",
    state: "PUBLISHED",
    category: { name: "Expert Talk" },
    organization: ORGANIZER,
    startAt: "2026-10-14T04:30:00Z",
    endAt: "2026-10-15T04:30:00Z",
    registrationEndAt: null,
    timezone: "Asia/Kolkata",
    capacity: null,
    imageUrl: null,
  },
  {
    slug: "ieee-ignite-hackathon-2026",
    legacyId: "641a6cc1-a708-4cd4-9d11-883c3f93c14a",
    name: "IEEE IGNITE Hackathon 2026",
    summary: "24-Hour Software & Hardware Hackathon · 14–15 October 2026 · SKIT Jaipur",
    description: "IEEE IGNITE is a 24-hour, fully offline software and hardware hackathon held at Swami Keshvanand Institute of Technology, Management & Gramothan (SKIT), Jaipur. It is open to eligible student teams from SKIT and from other institutions, subject to the rules in the official rulebook.\n\nTeams of 1 to 4 members (all from the same institution and campus) build a working solution during a continuous 24-hour window. Problem statements and tracks are revealed at the start of the event, and a team's selection is final. Open to currently enrolled UG, PG, diploma and PhD students.\n\nBy registering, every participant agrees to follow the rulebook and all instructions issued by the organizing committee.",
    state: "REGISTRATION_OPEN",
    category: { name: "Hackathon" },
    organization: ORGANIZER,
    startAt: "2026-10-14T04:30:00Z",
    endAt: "2026-10-15T04:30:00Z",
    registrationEndAt: null,
    timezone: "Asia/Kolkata",
    capacity: null,
    imageUrl: null,
  },
];

/** Finds an event by its slug, or by its old database id. */
export function findEvent(idOrSlug: string) {
  return EVENTS.find((e) => e.slug === idOrSlug || e.legacyId === idOrSlug);
}

/** Why sign-ups are closed right now, or null while they're open (deadline / event over). */
export function registrationClosedReason(event: SiteEvent, now = Date.now()) {
  if (Date.parse(event.endAt) < now) return "This event has already ended.";
  if (event.registrationEndAt && Date.parse(event.registrationEndAt) < now) return "Registrations for this event have closed.";
  return null;
}
