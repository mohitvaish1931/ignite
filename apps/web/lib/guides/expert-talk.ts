// IEEE IGNITE Expert Talk (during the hackathon), as listed on Tech Pravah 2026 (pravah.skit.ac.in, event #68).
import type { EventGuide } from "./types";

export const EXPERT_TALK_GUIDE: EventGuide = {
  slug: "ieee-ignite-expert-talk",
  name: "IEEE IGNITE Expert Talk",
  kicker: "Event Details",
  title: { lead: "IEEE IGNITE", accent: "Expert Talk" },
  tagline: "During the IEEE IGNITE Hackathon · 14-15 October 2026 · SKIT Jaipur",
  about: "An expert talk held during the 24-hour IEEE IGNITE Hackathon 2026.",
  facts: [],
  // No rulebook of its own: the event page carries everything
  sections: [],
  cta: { label: "VIEW EVENT", href: "/events/ieee-ignite-expert-talk" },

  venue: "Indoor Sports Complex, SKIT Jaipur",
  when: { dates: "14 - 15 October 2026", time: "During the hackathon" },
  details: [
    { label: "Fee", value: "Free" },
    { label: "Organized by", value: "IEEE, CSE/IT, ECE, IDEA Lab, IIC, CS SBC, MTTs SBC, TEC SBC, WIE AG" },
    { label: "Arenas", value: "Software & Intelligence · Ideation & Leadership" },
  ],
  coordinators: [
    {
      title: "Faculty Coordinators",
      people: [
        { name: "Dr. Mithlesh Arya", phone: "9413942204" },
        { name: "Ms. Abha Jain", phone: "8407999882" },
        { name: "Dr. Megha Gupta", phone: "8949806733" },
      ],
    },
    {
      title: "Student Coordinators",
      people: [
        { name: "Shanker Joshi", phone: "9602376488" },
        { name: "Tanvi Jain", phone: "7597561329" },
        { name: "Monika Verma", phone: "8005857574" },
        { name: "Ankur Singh", phone: "8290267239" },
        { name: "Yashneel Singh", phone: "7728936816" },
      ],
    },
  ],
  related: { label: "ABOUT THE HACKATHON", href: "/events?tab=hackathons" },
  registration: { mode: "none", note: "No registration needed. The talk takes place during the IEEE IGNITE Hackathon." },
};
