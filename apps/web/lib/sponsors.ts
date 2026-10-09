// IEEE IGNITE '26 sponsors and partners, shown on /sponsors.
// To add a sponsor: put its logo in public/sponsors/ (a transparent PNG or an SVG reads best on
// the dark theme) and add an entry below. Tiers render in the order listed in SPONSOR_TIERS, and
// a tier with no sponsors is skipped; while the list is empty the page says "to be announced".

export type SponsorTierId = "title" | "gold" | "silver" | "partner";

export const SPONSOR_TIERS: { id: SponsorTierId; name: string }[] = [
  { id: "title", name: "Title Sponsor" },
  { id: "gold", name: "Gold Sponsors" },
  { id: "silver", name: "Silver Sponsors" },
  { id: "partner", name: "Partners" },
];

export type Sponsor = {
  name: string;
  tier: SponsorTierId;
  /** Path under public/, e.g. "/sponsors/acme.png". Without one, the name is shown instead. */
  logo?: string;
  /** The sponsor's website, opened in a new tab. */
  url?: string;
};

export const SPONSORS: Sponsor[] = [];

/** The sponsorship team, from the organizing committee; phone numbers as already listed on the event pages. */
export const SPONSORSHIP_CONTACTS = [
  { name: "Mohit Lalwani", role: "Technical & Sponsorship Head", photo: "/team/mohit-lalwani.webp", phone: "7878888924" },
  { name: "Anshuman Pareek", role: "Sponsorship", photo: "/team/anshuman-pareek.webp" },
  { name: "Yashneel Singh", role: "Sponsorship · Hackathon Coordinator", photo: "/team/yashneel-singh.webp", phone: "7728936816" },
];
