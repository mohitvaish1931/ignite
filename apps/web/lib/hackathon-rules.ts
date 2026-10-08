// IEEE IGNITE Hackathon 2026: official rulebook content and the limits the app enforces.
// The rulebook page, the hackathon gate and the hub all read from here.
import type { EventGuide, GuideBlock } from "./guides/types";
import { PS_PAGE_PATH } from "./problem-statements";

/** §2 Team Formation: teams have between 1 and 4 members. */
export const MIN_TEAM_SIZE = 1;
export const MAX_TEAM_SIZE = 4;

export const HACKATHON_SLUG = "ieee-ignite-hackathon-2026";
export const RULEBOOK_PATH = `/rulebooks/${HACKATHON_SLUG}`;

/** For now hackathon registration happens on the SKIT ERP, with no login on this site. */
export const HACKATHON_REGISTER_URL = "https://erp.skit.ac.in/register/r/tp26hackathon";

/** A hackathon is any event with tracks, or one filed under a "Hackathon" category. */
export function isHackathonEvent(event: { category?: { name: string } | null; _count?: { hackathonTracks?: number }; hackathonTracks?: unknown[] }) {
  const tracks = event._count?.hackathonTracks ?? event.hackathonTracks?.length ?? 0;
  return tracks > 0 || /hackathon/i.test(event.category?.name ?? "");
}

export const HACKATHON = {
  name: "IEEE IGNITE Hackathon 2026",
  tagline: "24-Hour Software & Hardware Hackathon",
  dates: "14 - 15 October 2026",
  venue: "Indoor Sports Complex, SKIT Jaipur",
  fee: "₹500 per team",
  prizePool: "₹5 Lakh",
  venueFull: "Swami Keshvanand Institute of Technology, Management & Gramothan (SKIT), Jaipur",
  mode: "Offline only",
  duration: "24 hours, continuous",
  teamSize: `${MIN_TEAM_SIZE} to ${MAX_TEAM_SIZE} members`,
  openTo: "Currently enrolled UG, PG, diploma and PhD students",
};

export const AT_A_GLANCE = [
  { label: "Event", value: `IEEE IGNITE - ${HACKATHON.tagline}` },
  { label: "Dates", value: HACKATHON.dates },
  { label: "Venue", value: HACKATHON.venue },
  { label: "Registration fee", value: `${HACKATHON.fee} (non-refundable)` },
  { label: "Prize pool", value: HACKATHON.prizePool },
  { label: "Mode", value: "Offline only (no online participation)" },
  { label: "Duration", value: HACKATHON.duration },
  { label: "Team size", value: HACKATHON.teamSize },
  { label: "Open to", value: HACKATHON.openTo },
];

export const ABOUT =
  "IEEE IGNITE is a 24-hour, fully offline software and hardware hackathon held at Swami Keshvanand Institute of Technology, Management & Gramothan (SKIT), Jaipur. It is open to eligible student teams from SKIT and from other institutions, subject to the rules in this rulebook.";

export const AGREEMENT =
  "By registering, every participant agrees to follow this rulebook and all instructions issued by the organizing committee.";

type Point = { title?: string; text: string };
export type RuleSection = { id: string; number: number; title: string; lead: string; points: Point[]; note?: Point };

export const SECTIONS: RuleSection[] = [
  {
    id: "eligibility",
    number: 1,
    title: "Eligibility",
    lead: "The hackathon is open to students currently enrolled at a recognized college or institute.",
    points: [
      { text: "Undergraduate, postgraduate, diploma and PhD students are eligible. Final-year students may participate." },
      { text: "School students and full-time working professionals are not eligible." },
      { text: "Teams may include members from different years and departments." },
      { text: "Teams from institutions other than SKIT are welcome to register." },
    ],
  },
  {
    id: "team-formation",
    number: 2,
    title: "Team Formation",
    lead: "Each team must have between 1 and 4 members, all from the same institution and campus.",
    points: [
      { title: "Team size", text: "Minimum 1, maximum 4 members." },
      { title: "Same institution", text: "All members must belong to the same college/institute and study at the same campus. Inter-college and inter-institution teams are strictly prohibited." },
      { title: "One team per person", text: "A participant may register with only one team. Duplicate registrations or membership in multiple teams may lead to cancellation of candidature or disqualification." },
      { title: "Team Leader", text: "Every team must nominate one Team Leader, who is the primary point of contact and must be physically present throughout the event." },
      { title: "Gender composition", text: "There is no requirement for female members." },
      { title: "Member changes", text: "Routine changes are not permitted after registration. In an emergency or unavoidable circumstance, organizers may allow a team to continue with fewer members." },
      { title: "No online participation", text: "All members must participate in person." },
      { title: "Absences", text: "Any member who will be absent must be reported to the organizing team in advance." },
    ],
  },
  {
    id: "registration",
    number: 3,
    title: "Registration & Verification",
    lead: "Seats are limited and allotted on a first-come, first-served basis; every member must be verified in person before the hackathon begins.",
    points: [
      { title: "Registration fee", text: "As specified in the official registration form. The fee is non-refundable once registration is complete." },
      { title: "In-person verification", text: "All registered members must be physically present for verification before the start of the event." },
      { title: "Identity documents", text: "Each participant must carry both an original college ID card and a government-issued photo ID." },
      { title: "Identity mismatch", text: "Any mismatch in name or photograph between the submitted IDs may lead to immediate disqualification of the participant and the entire team on grounds of cheating and unfair practice." },
      { title: "Exceptions", text: "Late arrival and other exceptional verification cases are handled at the organizers' discretion." },
    ],
  },
  {
    id: "problem-statements",
    number: 4,
    title: "Problem Statements & Participation",
    lead: "The problem statements are live on the official website, and a team's selection is final.",
    points: [
      // The rulebook planned to release them at the start of the event; they went live early on this website
      { text: "Problem statements and tracks are published on the official IEEE IGNITE website/portal: 25 problem statements across 4 themes." },
      { text: "Teams must select their problem statement through the designated portal." },
      { text: "Once selected, a problem statement cannot be changed." },
    ],
  },
  {
    id: "development",
    number: 5,
    title: "Development & Originality",
    lead: "The core solution must be built during the official 24-hour window, and the team alone is responsible for what it submits.",
    points: [],
    note: {
      title: "Accountability",
      text: "Every team member must understand the submitted implementation and be able to explain the code and technical decisions to the judges. Using AI or external tools does not shift responsibility for the correctness, originality or explainability of the work away from the participating team.",
    },
  },
  {
    id: "hardware",
    number: 6,
    title: "Hardware & Infrastructure",
    lead: "IEEE IGNITE covers both software and hardware builds; teams bring their own equipment and must keep it safe.",
    points: [
      { text: "Teams may bring and use their own hardware and components, and are responsible for everything their solution requires." },
      { text: "Each team is advised to bring one extension cord or power strip." },
      { text: "Prohibited items include unsafe equipment, exposed high-voltage systems, hazardous substances, weapons and any other dangerous equipment." },
      { text: "Venue infrastructure must be used responsibly. Damaging or tampering with event facilities is not allowed." },
    ],
  },
  {
    id: "conduct",
    number: 7,
    title: "Code of Conduct & Fair Play",
    lead: "Participants must behave professionally and respectfully at all times; the following are strictly prohibited.",
    points: [
      { title: "Academic dishonesty", text: "Plagiarism, cheating, code theft, deliberate sabotage and misrepresentation of work." },
      { title: "Misconduct", text: "Harassment, discrimination, threatening behaviour and any other inappropriate conduct." },
      { title: "Security violations", text: "Unauthorized access to event systems, attacks on the event network or another team's systems, malware deployment and infrastructure tampering." },
      { title: "Outside help", text: "Obtaining substantial implementation work from people outside the registered team." },
    ],
    note: { text: "Teams may discuss ideas with mentors and seek general technical guidance from them." },
  },
  {
    id: "submission",
    number: 8,
    title: "Submission & Demonstration",
    lead: "Teams must submit a working, demonstrable solution through the official mechanism before the announced deadline.",
    points: [
      { text: "Submit the completed solution through the submission mechanism specified by the organizers. A GitHub repository may be required for source code." },
      { text: "Maintain a clear README with setup and usage instructions, where requested." },
      { text: "The solution should be demonstrable as a working prototype or functional implementation." },
      { text: "All submissions must meet the deadline and format announced by the organizing team." },
    ],
  },
  {
    id: "judging",
    number: 9,
    title: "Judging & Final Authority",
    lead: "Projects are judged on six criteria, and the panel's decision is final and binding.",
    points: [
      { text: "Judges may ask any team member to explain the project's architecture, implementation, code or technical decisions." },
      { text: "Failure to demonstrate or explain substantial parts of the solution may affect evaluation and may lead to disqualification where applicable." },
      { text: "The decision of the judging panel and organizing committee is final and binding." },
    ],
  },
  {
    id: "organizer-rights",
    number: 10,
    title: "Organizer Rights",
    lead: "The organizing committee may adjust arrangements when necessary and act on any situation this rulebook does not expressly cover.",
    points: [
      { text: "The committee may make reasonable changes to the schedule or operational arrangements and will announce updates through official channels." },
      { text: "The organizers reserve the right to take appropriate action in cases of rule violations, safety concerns, unfair practices, or circumstances not expressly covered here." },
      { text: "Participants should follow the official IEEE IGNITE communication channels and event portal for the latest instructions and announcements." },
    ],
  },
];

/** §5 Development & Originality: rows pair what is allowed with what is not. */
export const PERMITTED = [
  "Standard programming languages, frameworks, open-source libraries, development tools and templates",
  "Third-party APIs and pre-trained AI/ML models, where relevant",
  "Generative-AI tools such as ChatGPT, Gemini, Claude, Copilot and similar",
];
export const NOT_PERMITTED = [
  "Submitting a completely pre-built project as the team's hackathon solution",
  "Developing the core solution outside the official 24-hour period",
  "Obtaining substantial implementation work from anyone outside the registered team",
];

/** §6 Hardware & Infrastructure: what every team brings on the day. */
export const CHECKLIST = [
  "Original college ID for every member",
  "Government-issued photo ID for every member",
  "Laptops, chargers and required hardware/components",
  "One extension cord / power strip",
];

/** §9 Judging & Final Authority. */
export const JUDGING_CRITERIA = [
  { title: "Problem understanding", text: "Clarity on the problem and who it affects" },
  { title: "Innovation", text: "Originality of the idea and approach" },
  { title: "Technical implementation", text: "Quality of architecture, code and engineering" },
  { title: "Functionality", text: "How well the prototype works in the demo" },
  { title: "Feasibility / impact", text: "Practicality and potential real-world value" },
  { title: "Presentation / Q&A", text: "Clarity of the pitch and answers to judges" },
];

/** How the day runs, from registration to results (drawn from §2-§9). */
export const MISSION_STEPS = [
  { step: "01", title: "Register", text: "Sign up and form a team of 1-4 from the same institution and campus." },
  { step: "02", title: "Verify", text: "Every member checks in at SKIT with an original college ID and a government photo ID." },
  { step: "03", title: "Lock a problem", text: "Pick from 25 live problem statements across 4 themes. Your selection is final." },
  { step: "04", title: "Build 24 hours", text: "Software or hardware, built offline on-site in one continuous 24-hour window." },
  { step: "05", title: "Demo & judging", text: "Submit before the deadline, demo a working prototype and answer the judges." },
];

// Extra blocks some sections carry around their points (in rulebook order)
const SECTION_EXTRAS: Record<string, { before?: GuideBlock[]; after?: GuideBlock[] }> = {
  development: { before: [{ type: "compare", allowed: PERMITTED, notAllowed: NOT_PERMITTED }] },
  hardware: { after: [{ type: "checklist", title: "Team checklist", items: CHECKLIST }] },
  judging: { before: [{ type: "cards", label: "Criterion", items: JUDGING_CRITERIA }] },
};

export const HACKATHON_GUIDE: EventGuide = {
  slug: HACKATHON_SLUG,
  name: HACKATHON.name,
  kicker: "Official Rulebook & Participant Guidelines",
  title: { lead: "IEEE IGNITE", accent: "Hackathon 2026" },
  tagline: `${HACKATHON.tagline} · ${HACKATHON.dates} · SKIT Jaipur`,
  about: ABOUT,
  agreement: AGREEMENT,
  facts: AT_A_GLANCE.map((f) => ({ ...f, wide: f.label === "Event" || f.label === "Open to" })),
  sections: SECTIONS.map(({ id, number, title, lead, points, note }) => ({
    id,
    number,
    title,
    lead,
    blocks: [
      ...(SECTION_EXTRAS[id]?.before ?? []),
      ...(points.length ? [{ type: "points" as const, items: points }] : []),
      ...(SECTION_EXTRAS[id]?.after ?? []),
      ...(note ? [{ type: "note" as const, ...note }] : []),
    ],
  })),
  cta: { label: "VIEW PROBLEM STATEMENTS", href: PS_PAGE_PATH },

  venue: `${HACKATHON.venue} · Offline only`,
  details: [
    { label: "Prize pool", value: HACKATHON.prizePool },
    { label: "Registration fee", value: `${HACKATHON.fee}, non-refundable once registration is complete` },
    { label: "Organized by", value: "IEEE, CSE/IT, ECE, IDEA Lab, IIC, CS SBC, MTTs SBC, TEC SBC, WIE AG" },
    { label: "Arenas", value: "Software & Intelligence · Hardware & Silicon" },
  ],
  coordinators: [
    {
      title: "Faculty Coordinators",
      people: [
        { name: "Dr. Nilam Choudhary", phone: "9829803880" },
        { name: "Dr. Loveleen Kumar", phone: "9460826889" },
        { name: "Mr. Rajesh Rajaan", phone: "9887507364" },
        { name: "Ms. Suniti Chouhan", phone: "9425789003" },
        { name: "Dr. Aakriti Sharma", phone: "9829800727" },
        { name: "Mr. Vinod Yadav", phone: "8290010833" },
      ],
    },
    {
      title: "Student Coordinators",
      people: [
        { name: "Shanker Joshi", phone: "9602376488" },
        { name: "Tanvi Jain", phone: "7597561329" },
        { name: "Monika Verma", phone: "8005857574" },
        { name: "Ankur Singh", phone: "8290267239" },
        // Pravah's hackathon page repeats Ankur's number here; the Expert Talk page lists this one for Yashneel
        { name: "Yashneel Singh", phone: "7728936816" },
      ],
    },
  ],
  keyRules: [
    `Teams of ${MIN_TEAM_SIZE} to ${MAX_TEAM_SIZE} members, all from the same institution and campus.`,
    "One team per person. Duplicate registrations can lead to disqualification.",
    "Offline only: every member must be present in person and verified before the start.",
    "Carry an original college ID and a government-issued photo ID.",
    `Registration fee: ${HACKATHON.fee}, non-refundable once registration is complete.`,
    "The 25 problem statements are live on this website. Once selected, a problem statement can't be changed.",
  ],
  registration: { mode: "external", url: HACKATHON_REGISTER_URL },
  agreementDetail: `including teams of ${MIN_TEAM_SIZE}-${MAX_TEAM_SIZE} from the same institution and in-person ID verification`,
  studentsOnly: true,
};
