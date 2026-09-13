/**
 * Site-wide configuration and studio content.
 *
 * Single source of truth for the persona, navigation, services catalogue,
 * approach principles, and recognition lists. Pages compose from this data
 * rather than hard-coding copy, so content edits never touch markup.
 */

export const SITE = {
  name: "Elena Vance",
  role: "Designer & Brand Strategist",
  shortLabel: "Design & Brand Strategy",
  location: "New York, NY",
  availability: "Booking select projects for 2026",
  email: "studio@elenavance.com",
  description:
    "Elena Vance is an independent designer and brand strategist in New York, building considered identities, design systems, and art direction for ambitious companies and cultural institutions.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  /** Content revision date — the deterministic stamp used by the sitemap. */
  contentUpdatedAt: "2026-09-13",
} as const;

export const NAV_LINKS = [
  { href: "/work", label: "Work" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/contact", label: "Contact" },
] as const;

export const SOCIAL_LINKS = [
  { href: "https://www.instagram.com/", label: "Instagram", handle: "@elenavance.studio" },
  { href: "https://www.linkedin.com/", label: "LinkedIn", handle: "in/elenavance" },
  { href: "https://x.com/", label: "X", handle: "@elenavance" },
] as const;

/* ---------------------------------------------------------------------------
 * Services catalogue — six numbered practices.
 * `estimatorId` links a service to the investment estimator on /contact.
 * ------------------------------------------------------------------------ */

export type Service = {
  id: string;
  number: string;
  name: string;
  tagline: string;
  description: string;
  includes: string[];
  bestFor: string;
  estimatorId: EstimatorServiceId | null;
};

export const SERVICES: readonly Service[] = [
  {
    id: "brand-identity",
    number: "01",
    name: "Brand Identity",
    tagline: "The face, voice, and posture of the business.",
    description:
      "A complete identity built from strategy up — positioning workshops, a distinctive mark, a considered type and color system, and the starter assets a team needs to show up consistently from day one. The result is a brand that reads as intentional at every size, from a favicon to a trade-show wall.",
    includes: [
      "Positioning and audience definition",
      "Primary mark, secondary mark, and monogram",
      "Type pairing and color system",
      "Core collateral suite (cards, letterhead, deck)",
      "Launch-ready asset library",
    ],
    bestFor: "New ventures and companies approaching a renaming or repositioning.",
    estimatorId: "brand-identity",
  },
  {
    id: "visual-design-system",
    number: "02",
    name: "Visual Design System",
    tagline: "One system, every surface, zero drift.",
    description:
      "For teams shipping product fast, a design system is how the brand stays coherent without a designer approving every pixel. I audit the current surface area, define the component and token architecture, and document it so engineers and designers speak the same language long after the engagement ends.",
    includes: [
      "Interface and component audit",
      "Token architecture (color, type, space, motion)",
      "Core component library specification",
      "Accessibility contrast and focus standards",
      "Usage documentation and governance model",
    ],
    bestFor: "Product teams scaling past the founding-designer phase.",
    estimatorId: "visual-design-system",
  },
  {
    id: "art-direction",
    number: "03",
    name: "Art Direction",
    tagline: "A point of view, applied consistently.",
    description:
      "Retainer art direction for campaigns, editorial, and content programs. I set the visual direction — photography, casting, styling, set, and layout language — and steward it across every production so the work accumulates into a recognizable signature rather than a folder of one-offs.",
    includes: [
      "Visual territory and mood development",
      "Photography and production direction",
      "Editorial layout language",
      "Campaign and seasonal toolkits",
      "Ongoing critique and quality stewardship",
    ],
    bestFor: "Brands with an in-house team that needs a senior external eye.",
    estimatorId: "art-direction",
  },
  {
    id: "brand-guidelines",
    number: "04",
    name: "Brand Guidelines",
    tagline: "The documents that keep the brand honest.",
    description:
      "Guidelines written for the people who actually use them. Part reference, part training — covering clear-space rules, misuse examples, tone, and real-world templates, structured so a new hire can onboard themselves in an afternoon and never guess.",
    includes: [
      "Identity rules with correct/incorrect examples",
      "Typography and color usage in context",
      "Photography and illustration direction",
      "Verbal identity and tone framework",
      "Template pack for everyday scenarios",
    ],
    bestFor: "Organizations with distributed teams applying the brand.",
    estimatorId: "brand-guidelines",
  },
  {
    id: "naming-verbal-identity",
    number: "05",
    name: "Naming & Verbal Identity",
    tagline: "What the brand says, and how it says it.",
    description:
      "Name development and voice, done alongside the visual work so words and form reinforce each other. Covers competitive language audits, name territories with screening support, messaging architecture, and a voice that survives being written by many hands.",
    includes: [
      "Competitive language and tone audit",
      "Name territories with rationale and screening support",
      "Messaging architecture and proof points",
      "Voice principles with before/after examples",
      "Microcopy patterns for product and web",
    ],
    bestFor: "Companies whose name or voice has fallen behind the strategy.",
    estimatorId: null,
  },
  {
    id: "packaging-print",
    number: "06",
    name: "Packaging & Print",
    tagline: "The brand, held in the hand.",
    description:
      "Physical expressions of the identity — packaging systems, print programs, and environmental graphics — specified for real production. I work directly with printers and fabricators on materials, finishes, and dielines so what ships matches what was designed.",
    includes: [
      "Structural and dieline development",
      "Materials, finish, and print specification",
      "Packaging system across the product line",
      "Print program (stationery, sales, events)",
      "Environmental and signage applications",
    ],
    bestFor: "Consumer brands and cultural institutions with a physical presence.",
    estimatorId: null,
  },
] as const;

/* ---------------------------------------------------------------------------
 * About — approach principles and recognition.
 * ------------------------------------------------------------------------ */

export const APPROACH_PRINCIPLES = [
  {
    number: "01",
    title: "Listen before drawing",
    body: "Every engagement begins with the people who already know the business — founders, operators, customers. The strongest identities are not imposed; they are uncovered, articulated, and sharpened. I ask more questions in the first two weeks than most designers ask in an entire project, because the material those answers produce is what the design is made from.",
  },
  {
    number: "02",
    title: "Systems over styling",
    body: "A logo is a moment; a system is a decade. I design the rules, relationships, and constraints that let a brand stay itself across hundreds of surfaces and dozens of hands — so the work holds up when I am not in the room, and the tenth application is as considered as the first.",
  },
  {
    number: "03",
    title: "Craft is strategy",
    body: "Kerning, paper weight, timing curves — audiences cannot name these things, but they feel them, and they quietly read them as a proxy for how the company does everything else. Precision is not decoration. It is the most honest brand message a company can send.",
  },
] as const;

export const AWARDS = [
  { year: "2025", title: "Site of the Day", org: "Awwwards" },
  { year: "2024", title: "Best Reviewed Identity, Q3", org: "Brand New (UnderConsideration)" },
  { year: "2024", title: "Wood Pencil, Branding", org: "D&AD" },
  { year: "2023", title: "Certificate of Typographic Excellence", org: "Type Directors Club" },
  { year: "2022", title: "Honoree, Visual Identity", org: "Webby Awards" },
] as const;

export const BEYOND_WORK = [
  {
    title: "Teaching",
    body: "Adjunct lecturer in Brand Systems at the School of Visual Arts, where I run a semester-long studio course taking students from positioning research through a complete identity system and guidelines.",
  },
  {
    title: "Mentoring",
    body: "I keep four pro-bono mentoring slots each year for designers moving into strategy work — biweekly sessions covering positioning, presenting, and the business of independent practice.",
  },
  {
    title: "Speaking",
    body: "Recent talks on editorial identity systems and long-term brand stewardship at Typographics, the Brand Design Conference, and AIGA chapter events across the Northeast.",
  },
] as const;

/* ---------------------------------------------------------------------------
 * Investment estimator configuration (referenced by /contact).
 * ------------------------------------------------------------------------ */

export type EstimatorServiceId =
  | "brand-identity"
  | "visual-design-system"
  | "art-direction"
  | "brand-guidelines";

export const ESTIMATOR_SERVICES: ReadonlyArray<{
  id: EstimatorServiceId;
  label: string;
  baseLow: number;
  baseHigh: number;
}> = [
  { id: "brand-identity", label: "Brand Identity", baseLow: 30000, baseHigh: 50000 },
  { id: "visual-design-system", label: "Visual Design System", baseLow: 25000, baseHigh: 45000 },
  { id: "art-direction", label: "Art Direction", baseLow: 15000, baseHigh: 30000 },
  { id: "brand-guidelines", label: "Brand Guidelines", baseLow: 10000, baseHigh: 25000 },
];

export const COMPANY_STAGES: ReadonlyArray<{ id: string; label: string; multiplier: number }> = [
  { id: "startup", label: "Startup", multiplier: 0.8 },
  { id: "growing", label: "Growing", multiplier: 1 },
  { id: "established", label: "Established", multiplier: 1.2 },
  { id: "enterprise", label: "Enterprise", multiplier: 1.5 },
];

export const TIMELINES: ReadonlyArray<{ id: string; label: string; multiplier: number }> = [
  { id: "flexible", label: "Flexible (12+ weeks)", multiplier: 1 },
  { id: "standard", label: "Standard (8-12 weeks)", multiplier: 1.1 },
  { id: "accelerated", label: "Accelerated (6-8 weeks)", multiplier: 1.25 },
  { id: "rush", label: "Rush (under 6 weeks)", multiplier: 1.5 },
];

export const SCOPES: ReadonlyArray<{ id: string; label: string; multiplier: number }> = [
  { id: "core", label: "Core Essentials", multiplier: 0.8 },
  { id: "comprehensive", label: "Comprehensive", multiplier: 1 },
  { id: "full-system", label: "Full System", multiplier: 1.3 },
];

/* ---------------------------------------------------------------------------
 * Engagement process — the "How we work together" section on /services.
 * ------------------------------------------------------------------------ */

export const PROCESS_STEPS = [
  {
    number: "01",
    title: "Discover",
    body: "Every engagement opens with the people who know the business best — founders, operators, customers. Two weeks of structured interviews, positioning groundwork, and honest questions produce the material everything else is made from. Nothing is designed yet, and that is the point: the strongest identities are uncovered, not imposed.",
  },
  {
    number: "02",
    title: "Strategy",
    body: "Strategy before styling. We fix the positioning, the audience, and the decisions the identity must carry, then translate them into a creative brief with named territories. This is where scope, timing, and investment are agreed in writing — the discipline that keeps the design phase fast and the surprises out of it.",
  },
  {
    number: "03",
    title: "Design",
    body: "Identity and system work happens in structured rounds — territories first, then the chosen direction developed across real applications rather than presentation theater. You see the brand where it will actually live: the packaging line, the product surface, the tradeshow wall, the twelfth slide of the sales deck.",
  },
  {
    number: "04",
    title: "Refinement",
    body: "The chosen direction meets the real world: edge cases, print proofs, screen sizes, and the hands that will actually use the system. We tighten kerning, resolve contrast at every weight, and stress-test the applications that matter most — because a brand that only works on the presentation slide is not done.",
  },
  {
    number: "05",
    title: "Delivery",
    body: "Launch is a beginning, not a handoff. Every engagement ships with the asset library, the guidelines written for the people who use them, and a stewardship window while the system meets the real world. The measure of the work is the tenth application made without me in the room.",
  },
] as const;

/* ---------------------------------------------------------------------------
 * Common questions — the FAQ section on /services.
 * ------------------------------------------------------------------------ */

export const FAQ_ITEMS = [
  {
    question: "What does an engagement typically cost?",
    answer:
      "The four core practices carry honest starting ranges — Brand Identity $30k–$50k, Visual Design Systems $25k–$45k, Art Direction $15k–$30k, and Brand Guidelines $10k–$25k — adjusted by company stage, timeline, and scope. The estimator on the contact page shows how those multipliers combine. Final investment is set together after a scoping call, in writing, before any work begins.",
  },
  {
    question: "How long does a project take?",
    answer:
      "A full identity runs ten to fourteen weeks; systems and guidelines engagements run six to ten. Accelerated timelines are possible and priced honestly for what they demand — a rush compresses decision cycles, not craft. The schedule with named milestones is part of the written proposal, so timing is a commitment rather than a hope.",
  },
  {
    question: "Do you work with early-stage companies?",
    answer:
      "Yes — roughly a third of the practice is ventures under two years old. The estimator carries a startup adjustment because early work carries different decisions: what to fix now, what to leave loose, and how to build an identity that survives the next two rounds of what the company becomes. Positioning discipline matters most when there is the least history to lean on.",
  },
  {
    question: "Who owns the work when it's done?",
    answer:
      "You do, completely. Full IP transfers on final payment — source files, fonts licensing where applicable, and the asset library included. The only thing I retain is the right to show the work. Deliverables and ownership terms are itemized in the proposal before the engagement begins, not discovered at the end.",
  },
  {
    question: "Do you work with in-house teams?",
    answer:
      "Often, and gladly. Systems engagements are built for in-house designers and engineers — tokens, components, and governance they can extend without permission slips. Art direction retainers exist precisely for teams that want a senior external eye on a cadence. The system is designed to survive my absence, and that is a feature, not a risk.",
  },
  {
    question: "What does a project actually start with?",
    answer:
      "A 30-minute scoping call about the business — where it is headed, what decision is in front of it, and whether I am honestly the right designer for that. If the fit is right, you receive a written proposal with scope, timing, investment, and deliverables within a week. No surprises later is a design principle here, not a slogan.",
  },
] as const;
