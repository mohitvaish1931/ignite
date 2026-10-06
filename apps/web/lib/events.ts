// IEEE IGNITE '26 events, served straight from the site (no database).
// Exported from the live events table on 2026-10-03; while on-site accounts are switched off
// (see _backend/README.md), this file is where events are added or edited.

export type EventState = "PUBLISHED" | "REGISTRATION_OPEN" | "REGISTRATION_CLOSED" | "LIVE" | "COMPLETED";

/** A photo on the Unsplash CDN (free Unsplash licence: commercial use, no attribution required). */
export type EventPhoto = {
  /** Unsplash image id, e.g. "photo-1610457642191-05328cdf34ff" */
  id: string;
  /** Which part to keep when cropping (imgix crop modes), e.g. "top" for subjects near the top */
  crop?: "top" | "bottom" | "left" | "right" | "entropy" | "faces,center";
};

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
  /** card: the picture on event cards (outside) · banner: the wide image atop the event page (inside) */
  images: { card: EventPhoto; banner: EventPhoto };
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
    // radio telescope under the Milky Way · oscilloscope waveform on a lab bench
    images: { card: { id: "photo-1610457642191-05328cdf34ff" }, banner: { id: "photo-1621638363255-9c092fa8d4ab", crop: "top" } },
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
    // oval conference table · leaders seated in a circle for a forum
    images: { card: { id: "photo-1775492783108-5714035b298b" }, banner: { id: "photo-1561489396-888724a1543d" } },
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
    // stage microphones · a panel on stage before an audience
    images: { card: { id: "photo-1682258370582-377d685156bc" }, banner: { id: "photo-1735679356705-7c06b780c7a4" } },
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
    // speaker on a lit stage · speaker facing a packed theatre
    images: { card: { id: "photo-1773829020694-413e879d2957" }, banner: { id: "photo-1774094474808-904ab1ad8586" } },
  },
  {
    slug: "ieee-ignite-hackathon-2026",
    legacyId: "641a6cc1-a708-4cd4-9d11-883c3f93c14a",
    name: "IEEE IGNITE Hackathon 2026",
    summary: "24-Hour Software & Hardware Hackathon · 14–15 October 2026 · SKIT Jaipur",
    description: "IEEE IGNITE is a 24-hour, fully offline software and hardware hackathon held at Swami Keshvanand Institute of Technology, Management & Gramothan (SKIT), Jaipur. It is open to eligible student teams from SKIT and from other institutions, subject to the rules in the official rulebook.\n\nTeams of 1 to 4 members (all from the same institution and campus) build a working solution during a continuous 24-hour window. The problem statements are live on this website (25 across 4 themes), and a team's selection is final. Open to currently enrolled UG, PG, diploma and PhD students.\n\nBy registering, every participant agrees to follow the rulebook and all instructions issued by the organizing committee.",
    state: "REGISTRATION_OPEN",
    category: { name: "Hackathon" },
    organization: ORGANIZER,
    startAt: "2026-10-14T04:30:00Z",
    endAt: "2026-10-15T04:30:00Z",
    registrationEndAt: null,
    timezone: "Asia/Kolkata",
    capacity: null,
    // code on a red-lit screen · teams hacking at night
    images: { card: { id: "photo-1653387300291-bfa1eeb90e16" }, banner: { id: "photo-1504384764586-bb4cdc1707b0" } },
  },
];

/** Unsplash CDN URL for a photo, resized and cropped on their servers (auto picks AVIF/WebP). */
export function photoUrl(photo: EventPhoto, width: number, height: number) {
  const crop = photo.crop ? `&crop=${photo.crop}` : "";
  return `https://images.unsplash.com/${photo.id}?auto=format&fit=crop&w=${width}&h=${height}&q=75${crop}`;
}

/** The card picture at 3:2, in 1x and 2x for sharp screens. */
export function cardImage(event: SiteEvent) {
  const { card } = event.images;
  return { src: photoUrl(card, 480, 320), srcSet: `${photoUrl(card, 480, 320)} 480w, ${photoUrl(card, 960, 640)} 960w` };
}

/** The wide banner picture (about 2.6:1), sized for laptops up to large retina screens. */
export function bannerImage(event: SiteEvent) {
  const { banner } = event.images;
  return {
    src: photoUrl(banner, 1600, 620),
    srcSet: [1000, 1600, 2400].map((w) => `${photoUrl(banner, w, Math.round(w / 2.58))} ${w}w`).join(", "),
  };
}

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
