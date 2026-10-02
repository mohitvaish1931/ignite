// IEEE IGNITE Symposium 2026: official rulebook & participant guidelines.
import type { EventGuide } from "./types";

const DAY1_VENUE = "7F’11, Civil Block, SKIT";
const DAY2_VENUE = "ECL-06, CS Block, SKIT";
// Official Google Form; /viewform shows the form while it is open and Google's "closed" notice otherwise
const REGISTER_URL = "https://docs.google.com/forms/d/e/1FAIpQLScHbFm80SFMSRm0_R9gvYCItvWTfgchPgsVWwR1jW72LuQ4SQ/viewform";

export const SYMPOSIUM_GUIDE: EventGuide = {
  slug: "ieee-ignite-symposium-2026",
  name: "IEEE IGNITE Symposium 2026",
  kicker: "Rulebook & Participant Guidelines",
  title: { lead: "IEEE IGNITE", accent: "Symposium 2026" },
  tagline: "Recent Advancements in RF, Microwave, EMI/EMC · 12-13 October 2026 · SKIT Jaipur",
  organizedBy:
    "Organized by the IEEE Student Branch, SKIT Jaipur, in association with the IEEE MTT-S Student Branch Chapter, SKIT Jaipur.",
  about:
    "IEEE IGNITE Symposium 2026 is a free, two-day technical symposium on recent advancements in RF, Microwave, EMI and EMC. Through expert-led sessions, hands-on workshops, interactive activities and a technical quiz, it aims to bridge the gap between theory and practical application.",
  agreement: "By registering, every participant agrees to follow this rulebook and all instructions issued by the organizing committee.",
  facts: [
    { label: "Event", value: "IEEE IGNITE Symposium 2026", wide: true },
    { label: "Theme", value: "Recent Advancements in RF, Microwave, EMI/EMC", wide: true },
    { label: "Dates", value: "12-13 October 2026" },
    { label: "Registration fee", value: "Free" },
    { label: "Venue", value: `Day 1: ${DAY1_VENUE} · Day 2: ${DAY2_VENUE}`, wide: true },
    { label: "Registration deadline", value: "8 October 2026" },
    { label: "Capacity", value: "Maximum 200 participants" },
    { label: "Participation", value: "Individual" },
  ],
  sections: [
    {
      id: "event-structure",
      number: 1,
      title: "Event Structure",
      lead: "The symposium runs over two days at two different venues; check the venue for each day before arriving.",
      blocks: [
        {
          type: "table",
          columns: ["Day", "Venue", "Activities"],
          rows: [
            ["Day 1 - 12 October 2026", "7F’11", "Inauguration Ceremony · Expert Session · Technical Hands-on Workshop · Interactive Technical Activities"],
            ["Day 2 - 13 October 2026", "ECL-06", "Expert Session · Technical Hands-on Workshop · Technical Quiz · Valedictory Session · Recognition / Distribution of Eligible Benefits"],
          ],
        },
        { type: "note", text: "The concluding activities on 13 October 2026 will be held in the presence of Mr. Jeet Ghosh from LNMIIT." },
      ],
    },
    {
      id: "eligibility",
      number: 2,
      title: "Eligibility",
      lead: "The symposium is open to students from any college or university, up to a maximum of 200 participants.",
      blocks: [
        {
          type: "points",
          items: [
            { text: "Students from any institution are welcome to participate." },
            { text: "Participation is individual." },
            { text: "Students from any academic discipline may participate, subject to the relevance of the technical sessions." },
            { text: "A valid college/institution ID card is mandatory." },
          ],
        },
      ],
    },
    {
      id: "registration",
      number: 3,
      title: "Registration Guidelines",
      lead: "Registration is free and closes on 8 October 2026; seats are limited to 200.",
      blocks: [
        {
          type: "points",
          items: [
            { title: "Registration form", text: "Register through the official form linked via the QR code." },
            { title: "Deadline", text: "The last date for registration is 8 October 2026." },
            { title: "Accurate details", text: "Participants must provide correct information while registering." },
            { title: "One registration per person", text: "Submit only one form unless the organizers instruct otherwise." },
            { title: "Seat availability", text: "Registration is subject to seat availability, with a maximum of 200 participants." },
          ],
        },
      ],
    },
    {
      id: "attendance",
      number: 4,
      title: "Attendance",
      lead: "Participants are strongly encouraged to attend both days for the complete learning experience.",
      blocks: [
        {
          type: "points",
          items: [
            { text: "Attendance will be recorded during individual sessions." },
            { text: "Participants are expected to attend the sessions they have registered for." },
            { text: "Participants must follow the instructions provided by the organizing team." },
          ],
        },
      ],
    },
    {
      id: "certificates",
      number: 5,
      title: "Certificate Eligibility",
      lead: "IEEE-powered certificates are awarded based on criteria set by the organizers, and the organizing committee's decision is final.",
      blocks: [
        {
          type: "cards",
          label: "Factor",
          items: [
            { title: "Quiz performance", text: "Considered when determining certificate eligibility" },
            { title: "Participant feedback", text: "Considered when determining certificate eligibility" },
            { title: "Attendance & participation", text: "Participants will be required to maintain appropriate attendance and participation" },
          ],
        },
      ],
    },
    {
      id: "workshops",
      number: 6,
      title: "Technical Workshop & Hands-on Sessions",
      lead: "The workshops offer practical exposure to RF, Microwave, EMI/EMC and related technologies. Any required software or tools will be communicated to registered participants in advance.",
      blocks: [
        {
          type: "points",
          items: [
            { text: "Follow the instructions of the resource person or workshop instructor." },
            { text: "Participate actively in the practical activities." },
            { text: "Follow all laboratory, computer-room and equipment safety instructions." },
            { text: "Do not make unauthorized changes to systems or equipment." },
            { text: "Use only the software, tools and resources permitted by the organizers." },
            { text: "Ask the coordinators for help whenever required." },
          ],
        },
      ],
    },
    {
      id: "laptops",
      number: 7,
      title: "Laptop Guidelines",
      lead: "A laptop is optional, but participants who want the maximum practical benefit from the hands-on sessions are encouraged to bring one.",
      blocks: [
        {
          type: "checklist",
          title: "Laptop checklist",
          items: [
            "Bring your laptop and charger",
            "Install the required software/tools before the workshop, once the requirements are communicated",
            "Make sure the laptop is adequately charged",
            "Carry any required adapters or accessories",
          ],
        },
        {
          type: "points",
          items: [
            { text: "You are responsible for your own laptop, charger and accessories." },
            { text: "The organizers will not be responsible for loss, theft or damage to personal electronic devices." },
          ],
        },
      ],
    },
    {
      id: "quiz",
      number: 8,
      title: "Quiz Guidelines",
      lead: "An individual technical quiz will be held on both days, and its result counts toward certificates and recognition.",
      blocks: [
        {
          type: "points",
          items: [
            { text: "Participation in the quiz is individual." },
            { text: "The format, number of questions and duration will be decided and announced by the organizers." },
            { text: "Questions may cover topics related to the symposium and its technical sessions." },
            { text: "Participants must follow all instructions announced before the quiz." },
            { text: "Use of unfair means or unauthorized assistance is strictly prohibited." },
            { text: "Any malpractice may result in disqualification from the quiz and related benefits." },
          ],
        },
      ],
    },
    {
      id: "feedback",
      number: 9,
      title: "Feedback",
      lead: "Genuine, constructive feedback is requested from every participant and may count toward certificates and recognition, along with quiz performance and participation.",
      blocks: [
        {
          type: "chips",
          label: "Feedback may be collected on",
          items: ["Expert sessions", "Technical workshops", "Hands-on activities", "Learning experience", "Technical content", "Overall event organization"],
        },
      ],
    },
    {
      id: "goodies",
      number: 10,
      title: "IEEE Goodies",
      lead: "IEEE goodies will be given to eligible participants, and the organizing committee's decision on distribution is final.",
      blocks: [
        {
          type: "points",
          items: [{ text: "Distribution may depend on participation, quiz performance, feedback, availability, and any other criteria communicated by the organizers." }],
        },
      ],
    },
    {
      id: "conduct",
      number: 11,
      title: "Code of Conduct",
      lead: "All participants must maintain professional and respectful conduct throughout the symposium.",
      blocks: [
        {
          type: "points",
          items: [
            { text: "Respect speakers, faculty members, organizers, volunteers and fellow participants." },
            { text: "Maintain discipline and cleanliness at the venue." },
            { text: "Follow instructions from organizers and venue authorities." },
            { text: "Respect college property and event infrastructure, and use technical facilities responsibly." },
            { text: "Avoid disruptive behaviour." },
          ],
        },
      ],
    },
    {
      id: "prohibited",
      number: 12,
      title: "Prohibited Activities",
      lead: "The following are strictly prohibited; violators may be removed from the relevant activity or the event.",
      blocks: [
        {
          type: "points",
          items: [
            { title: "Unfair means", text: "Cheating or using unfair means during the quiz." },
            { title: "Security violations", text: "Unauthorized access to computer systems, networks or devices, or attempts to disrupt event infrastructure or network services." },
            { title: "Damage and misuse", text: "Damaging college/event property, or misusing workshop equipment or software." },
            { title: "Misconduct", text: "Harassment or inappropriate conduct toward any participant, speaker, faculty member or organizer." },
            { title: "Other violations", text: "Any activity that breaks institutional rules or applicable law." },
          ],
        },
      ],
    },
    {
      id: "college-id",
      number: 13,
      title: "College ID Card",
      lead: "A valid college/institution ID card is mandatory and must be carried throughout the symposium.",
      blocks: [
        {
          type: "points",
          items: [{ text: "You may be asked to show it during registration, entry, attendance verification, workshop sessions, the quiz, and certificate verification." }],
        },
      ],
    },
    {
      id: "belongings",
      number: 14,
      title: "Personal Belongings",
      lead: "Participants are responsible for their own belongings, including mobile phones, laptops, chargers, bags, accessories and personal documents. The organizers and host institution are not responsible for loss, theft or damage.",
      blocks: [],
    },
    {
      id: "dates",
      number: 15,
      title: "Venue & Important Dates",
      lead: "Registration closes on 8 October 2026, and each day of the symposium is held at a different venue.",
      blocks: [
        {
          type: "table",
          columns: ["Date", "Event", "Venue"],
          rows: [
            ["8 October 2026", "Registration deadline", "-"],
            ["12 October 2026", "Day 1 - Inauguration, Expert Session & Hands-on Workshop", "7F’11"],
            ["13 October 2026", "Day 2 - Expert Session, Hands-on Workshop, Quiz & Valedictory Session", "ECL-06"],
          ],
        },
      ],
    },
    {
      id: "general",
      number: 16,
      title: "General Guidelines",
      blocks: [
        {
          type: "points",
          items: [
            { text: "Report to the venue well before the scheduled session." },
            { text: "Late entry may be restricted during ongoing expert sessions or technical demonstrations." },
            { text: "Follow the instructions of the session coordinators." },
            { text: "Workshop-specific instructions will be announced by the respective resource person." },
            { text: "Software requirements, if any, will be communicated to registered participants." },
            { text: "Keep your registration details available when required." },
            { text: "The organizers may modify the session sequence or timings if operational circumstances require it." },
            { text: "Check official communication channels regularly for updates." },
            { text: "Certificates and other participant benefits are subject to the eligibility criteria communicated by the organizers." },
            { text: "The organizing committee's decision on event administration, participation and eligibility is final." },
          ],
        },
      ],
    },
    {
      id: "disclaimer",
      number: 17,
      title: "Disclaimer",
      lead: "The organizers reserve the right to make reasonable changes to the schedule, session structure, venue, technical requirements, quiz format or other arrangements due to operational requirements. Any major changes will be communicated to registered participants through official channels.",
      blocks: [],
    },
    {
      id: "declaration",
      number: 18,
      title: "Participant Declaration",
      lead: "By registering for IEEE IGNITE Symposium 2026, the participant acknowledges that they:",
      blocks: [
        {
          type: "points",
          items: [
            { text: "Have read and understood the event guidelines." },
            { text: "Agree to follow the rules and instructions of the organizers." },
            { text: "Will maintain professional conduct throughout the event." },
            { text: "Will carry their valid college/institution ID card." },
            { text: "Understand that a laptop is optional but recommended for hands-on activities." },
            { text: "Understand that certificate and recognition eligibility is subject to the criteria specified by the organizers." },
            { text: "Agree to comply with the rules of SKIT Jaipur and the event organizing committee." },
          ],
        },
      ],
    },
  ],
  closing: [
    "IEEE Student Branch, SKIT Jaipur · IEEE MTT-S Student Branch Chapter, SKIT Jaipur",
    "Free Registration · Limited to 200 Participants",
  ],
  cta: { label: "REGISTER NOW", href: REGISTER_URL },

  venue: "Day 1: 7F’11, Civil Block · Day 2: ECL-06, CS Block · SKIT Jaipur",
  keyRules: [
    "Free registration through the official form, closing on 8 October 2026. Limited to 200 participants.",
    "Individual participation, open to students from any college or university.",
    "Carry a valid college/institution ID card throughout the symposium.",
    "Day 1 and Day 2 are at different venues, so check the venue before you arrive.",
    "Certificates consider quiz performance, feedback, and attendance & participation.",
    "A laptop is optional, but recommended for the hands-on workshops.",
  ],
  schedule: [
    {
      day: "Day 1",
      date: "12 October 2026",
      venue: DAY1_VENUE,
      activities: ["Inauguration Ceremony", "Expert Session", "Technical Hands-on Workshop", "Interactive Technical Activities"],
    },
    {
      day: "Day 2",
      date: "13 October 2026",
      venue: DAY2_VENUE,
      activities: ["Expert Session", "Technical Hands-on Workshop", "Technical Quiz", "Valedictory Session", "Recognition / Distribution of Eligible Benefits"],
    },
  ],
  registration: { mode: "external", url: REGISTER_URL },
  details: [
    { label: "Time", value: "11:00 AM – 4:00 PM, both days" },
    { label: "Organized by", value: "IEEE, ECE, MTTs" },
    { label: "Arenas", value: "Signals & Wireless Communication · Hardware & Silicon" },
  ],
  coordinators: [
    {
      title: "Faculty Coordinators",
      people: [
        { name: "Dr. Shubhi Jain", phone: "9468783437" },
        { name: "Dr. Harshal Nigam", phone: "9460005284" },
        { name: "Dr. Joohi Garg", phone: "6367171561" },
      ],
    },
    {
      title: "Student Coordinators",
      people: [
        { name: "Anshul Garg", phone: "8177891214" },
        { name: "Shivang Gupta", phone: "9664326466" },
        { name: "Shagun Gautam", phone: "8829944484" },
        { name: "Vineet Sharma", phone: "8949167671" },
      ],
    },
  ],
};
