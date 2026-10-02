// Round Table Conference 2026: detailed programme schedule.
import type { EventGuide, ProgrammeItem } from "./types";

const VENUE = "Community Hall, IDEA Lab, SKIT Jaipur";
const THEME = "“Leveraging Technology for a Better Tomorrow”";

const PROGRAMME: ProgrammeItem[] = [
  { time: "10:30 – 10:40 AM", duration: "10 min", title: "Registration of Participants", details: "Registration, welcome kit distribution, and participant check-in" },
  { time: "10:40 – 10:48 AM", duration: "8 min", title: "Arrival & Seating of Dignitaries", details: "Seating of dignitaries, keynote speaker, panelists, moderators, and invited guests" },
  { time: "10:48 – 10:53 AM", duration: "5 min", title: "Ceremonial Inauguration", details: "Lamp lighting / formal inauguration" },
  { time: "10:53 – 11:00 AM", duration: "7 min", title: "Felicitation of Guests & Panelists", details: "Formal honoring and felicitation of guests and panelists prior to the conference start" },
  { time: "11:00 – 11:07 AM", duration: "7 min", title: "Welcome Address", details: "Welcome by the Conference Chair/Convener and brief introduction to the conference theme" },
  { time: "11:07 – 11:15 AM", duration: "8 min", title: "Opening Remarks", details: "Institutional vision on technology, innovation, sustainability, and industry–academia collaboration" },
  {
    time: "11:15 – 11:30 AM",
    duration: "15 min",
    title: "Keynote Address",
    details: `${THEME} – broad perspective on emerging technologies, AI, sustainability, future skills, and responsible innovation`,
    highlight: true,
  },
  { time: "11:30 – 11:35 AM", duration: "5 min", title: "Introduction of Panelists", details: "Introduction of all panelists and overview of the round table discussion" },
  {
    time: "11:35 AM – 12:35 PM",
    duration: "60 min",
    title: "Round Table Discussion",
    details: `${THEME} – All panelists participate in an integrated discussion covering technology, sustainability, innovation, and future skills`,
    highlight: true,
  },
  { time: "12:35 – 12:45 PM", duration: "10 min", title: "Audience Interaction – “Ask the Experts”", details: "Interactive Q&A session with questions from the audience" },
  { time: "12:45 – 12:53 PM", duration: "8 min", title: "Key Recommendations & Action Points", details: "Presentation of key takeaways and recommendations emerging from the discussion" },
  { time: "12:53 – 1:00 PM", duration: "7 min", title: "Valedictory Remarks", details: "Closing remarks by the senior institutional authority" },
  { time: "1:00 – 1:10 PM", duration: "10 min", title: "Vote of Thanks & Wrap-up", details: "Formal acknowledgement of dignitaries, speakers, panelists, and participants; official conclusion of the RTC session" },
  { time: "1:10 – 1:20 PM", duration: "10 min", title: "Group Photograph", details: "Commemorative photo session with dignitaries, panelists, and participants" },
  { time: "1:20 – 1:30 PM", duration: "10 min", title: "Informal Interaction & Networking", details: "Informal interaction, networking, and departure" },
];

export const ROUND_TABLE_GUIDE: EventGuide = {
  slug: "round-table-conference-2026",
  name: "Round Table Conference 2026",
  kicker: "Detailed Programme Schedule",
  title: { lead: "Round Table", accent: "Conference 2026" },
  tagline: `${THEME} · Connecting Innovation, Sustainability and Society`,
  about:
    "A collaborative forum for IEEE leaders to exchange ideas, best practices, challenges, and opportunities. This round table conference is on leveraging technology for a better tomorrow, connecting innovation, sustainability and society. A keynote address and an integrated panel discussion cover emerging technologies, AI, sustainability, future skills and responsible innovation, followed by an “Ask the Experts” audience session and key recommendations.",
  facts: [
    { label: "Event", value: "Round Table Conference 2026", wide: true },
    { label: "Theme", value: THEME, wide: true },
    { label: "Date", value: "13 October 2026" },
    { label: "Time", value: "10:30 AM – 1:30 PM" },
    { label: "Venue", value: VENUE, wide: true },
    { label: "Registration", value: "Not required" },
  ],
  sections: [
    {
      id: "programme",
      number: 1,
      title: "Programme Schedule",
      lead: `Time: 10:30 AM – 1:30 PM · 13 October 2026 · ${VENUE}`,
      blocks: [{ type: "timeline", items: PROGRAMME }],
    },
  ],
  cta: { label: "VIEW EVENT", href: "/events/round-table-conference-2026" },

  venue: VENUE,
  programme: PROGRAMME,
  details: [
    { label: "Participation", value: "Individual · Free" },
    { label: "Organized by", value: "IEEE, CS SBC, MTTs SBC, WIE AG, TEC SBC" },
  ],
  coordinators: [
    {
      title: "Faculty Coordinators",
      people: [
        { name: "Dr. Nilam", phone: "9829803880" },
        { name: "Ms. Barkha Jain", phone: "9929073391" },
        { name: "Dr. Pooja Jain", phone: "9785050506" },
        { name: "Ms. Kiran Ahuja", phone: "9828046570" },
      ],
    },
    {
      title: "Student Coordinators",
      people: [
        { name: "Kratika Sharma", phone: "7014320955" },
        { name: "Aashi Goyal", phone: "9461801555" },
        { name: "Mohit Lalwani", phone: "7878888924" },
      ],
    },
  ],
  registration: { mode: "none", note: "No registration required. Please be seated by 10:40 AM, before the dignitaries arrive." },
};
