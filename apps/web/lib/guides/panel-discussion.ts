// IEEE IGNITE Panel Discussion, as listed on Tech Pravah 2026 (pravah.skit.ac.in, event #66).
import type { EventGuide } from "./types";

export const PANEL_DISCUSSION_GUIDE: EventGuide = {
  slug: "ieee-ignite-panel-discussion",
  name: "IEEE IGNITE Panel Discussion",
  kicker: "Event Details",
  title: { lead: "IEEE IGNITE", accent: "Panel Discussion" },
  tagline: "Emerging technologies, innovation and industry trends · 13 October 2026 · SKIT Jaipur",
  about: "An interactive session where experts share insights and perspectives on emerging technologies, innovation, and industry trends.",
  facts: [],
  // No rulebook of its own: the event page carries everything
  sections: [],
  cta: { label: "VIEW EVENT", href: "/events/ieee-ignite-panel-discussion" },

  venue: "JC Bose, SKIT Jaipur",
  details: [
    { label: "Participation", value: "Individual · Free" },
    { label: "Organized by", value: "IEEE, CS CSC, TEC SBC, WIE AG" },
    { label: "Arenas", value: "Ideation & Leadership · Software & Intelligence · Hardware & Silicon" },
  ],
  coordinators: [
    {
      title: "Faculty Coordinators",
      people: [
        { name: "Dr. Nilam", phone: "9829803880" },
        { name: "Dr. Aakriti", phone: "9829800727" },
        { name: "Sneha Sharma", phone: "8561099062" },
        { name: "Dr. Archika Jain", phone: "7597161891" },
      ],
    },
    {
      title: "Student Coordinators",
      people: [
        { name: "Aditya Mangal", phone: "9352899257" },
        { name: "Mohit Swami", phone: "7073173507" },
      ],
    },
  ],
  registration: {
    mode: "external",
    url: "https://docs.google.com/forms/d/e/1FAIpQLSfBRCLAo7_TwX8N_8SaUBFZ2m1jwDi-awdSaqNDM_KQH1r3fQ/viewform",
  },
};
