/**
 * Project case studies.
 *
 * Eight engagements across identity, systems, art direction, and packaging.
 * `featured` projects surface on the home page; every project has a detail
 * page at /work/[slug] with overview, challenge, solution, sticky meta, and
 * a next-project link.
 */

export type Project = {
  slug: string;
  title: string;
  client: string;
  year: string;
  sector: string;
  location: string;
  summary: string;
  cover: string;
  coverAlt: string;
  /** Rendered cover orientation — drives the mixed editorial grid rhythm. */
  coverAspect: "landscape" | "portrait";
  services: string[];
  deliverables: string[];
  overview: string[];
  challenge: string;
  solution: string;
  outcome: string;
  details: ReadonlyArray<{
    src: string;
    alt: string;
    caption: string;
    /** Rendered orientation: wide banners, landscape, or portrait studies. */
    aspect: "wide" | "landscape" | "portrait";
  }>;
  featured: boolean;
};

export const PROJECTS: readonly Project[] = [
  {
    slug: "alder-pine",
    title: "Alder & Pine",
    client: "Alder & Pine Goods Co.",
    year: "2024",
    sector: "Home Goods",
    location: "Portland, OR",
    summary: "A letterpress-inflected identity for a boutique home goods studio expanding from market stall to national retail.",
    cover: "/images/alder-pine-cover.webp",
    coverAspect: "landscape",
    coverAlt: "Letterpress business cards and letterhead in warm sage and cream tones on natural linen",
    services: ["Brand Identity", "Packaging & Print"],
    deliverables: ["Identity system", "Packaging suite", "Stationery program", "Retail guidelines"],
    overview: [
      "Alder & Pine began as a weekend market stall selling small-batch wooden home goods, and grew into a studio with national wholesale accounts almost before its founders noticed. What had been a charming hand-lettered stall sign was now being photographed next to mass-market competitors in buyers' showrooms, and the gap showed.",
      "We built an identity with the warmth of the original stall but the discipline of a national brand — a letterpress-inflected wordmark, a sage-and-cream palette drawn from the studio's own materials, and a packaging system that survives both a craft-paper shipping box and a polished retail shelf.",
    ],
    challenge:
      "The founders wanted growth without losing the hand-made credibility their customers paid a premium for. Every visual shortcut to 'looking bigger' — glossier finishes, tighter grids, colder color — read as a betrayal of the product itself. The identity had to scale up without cooling down.",
    solution:
      "The system leans into craft rather than apologizing for it. A debossed monogram anchors the smallest surfaces; letterpress-textured stationery carries the wholesale program; and the palette stays within the warm neutrals of the workshop — wood, linen, sage, cream — with a single rust accent held in reserve for seasonal lines.",
    outcome:
      "Alder & Pine entered 40 new retail doors in the year following launch, with packaging that buyers photograph unprompted. The founders report that the most common customer comment — 'the box was too nice to throw away' — now doubles as their positioning statement.",
    details: [
      {
        src: "/images/detail-monogram.webp",
        alt: "Blind-deboss monogram pressed into thick cotton paper",
        caption: "The debossed monogram, applied blind on cotton stock — no ink, all pressure.",
        aspect: "wide",
      },
      {
        src: "/images/detail-alder-pine-portrait.webp",
        alt: "Sage and cream letterpress stationery pieces arranged vertically on natural linen",
        caption: "The wholesale stationery program — sage and cream, letterpress throughout.",
        aspect: "portrait",
      },
    ],
    featured: true,
  },
  {
    slug: "vantage",
    title: "Vantage Studio",
    client: "Vantage Studio Architecture",
    year: "2024",
    sector: "Architecture",
    location: "Chicago, IL",
    summary: "A drafting-inspired identity and design system for an architecture practice moving from residential to civic work.",
    cover: "/images/vantage-portrait.webp",
    coverAspect: "portrait",
    coverAlt: "Architectural brand poster with bold serif typography and drafting lines on off-white paper",
    services: ["Brand Identity", "Visual Design System"],
    deliverables: ["Identity system", "Design tokens", "Template library", "Proposal suite"],
    overview: [
      "Vantage Studio had spent a decade building quietly meticulous residential work, and was now shortlisted for its first civic commissions — projects won or lost on paper long before ground breaks. Their proposals, boards, and submission materials were engineering-grade in content and afterthought-grade in form.",
      "The new identity borrows from the practice's own tools: drafting weights, grid paper, and the discipline of a title block. A serif wordmark sits inside a hairline rule structure that flexes from business card to presentation board, and a token system keeps every document — from fee proposal to competition panel — unmistakably theirs.",
    ],
    challenge:
      "Civic juries evaluate dozens of submissions in a sitting. Vantage needed materials that communicated rigor in the first three seconds of contact and rewarded closer reading — while a dozen architects, all with opinions and InDesign, kept producing documents on their own.",
    solution:
      "We designed the constraint set before the visuals: a fixed grid derived from their title-block standard, a two-weight type system, and a token palette that maps to their drawing conventions. The identity is deliberately quiet — it frames the work, never competes with it — and the template library makes the correct way the easy way for the whole studio.",
    outcome:
      "Vantage won two of the three civic projects it was shortlisted for in the following year, and credits the submission system directly. Internally, document production time dropped by roughly a third once the template library replaced ad-hoc layouts.",
    details: [
      {
        src: "/images/detail-pattern.webp",
        alt: "Minimal geometric brand pattern of fine black lines with rust accents on textured cream paper",
        caption: "The drafting-line pattern, used at varying densities as a signature texture.",
        aspect: "wide",
      },
      {
        src: "/images/detail-vantage-portrait.webp",
        alt: "Architectural drafting grid detail with a title block on textured off-white paper",
        caption: "The title-block grid, drawn at full sheet scale before it became a template.",
        aspect: "portrait",
      },
    ],
    featured: true,
  },
  {
    slug: "emberline",
    title: "Emberline",
    client: "Emberline Coffee Roasters",
    year: "2023",
    sector: "Food & Beverage",
    location: "Seattle, WA",
    summary: "A typographic packaging system for a specialty roaster whose shelf presence had fallen behind its roasting.",
    cover: "/images/emberline-cover.webp",
    coverAspect: "landscape",
    coverAlt: "Kraft paper coffee bags and cream boxes with minimal typographic labels and terracotta accents",
    services: ["Brand Identity", "Packaging & Print"],
    deliverables: ["Packaging system", "Label architecture", "Merch line", "Café collateral"],
    overview: [
      "Emberline's coffee placed in regional cupping competitions two years running; their bags, meanwhile, were indistinguishable from the aisle's generic-craft cohort. Roasters know that specialty buyers shop the label as hard as the bean, and Emberline's roast profiles deserved a package that carried their ambition.",
      "The system is built on typography with a mechanic's honesty — weight and scale carry all the hierarchy — over kraft stocks in the roastery's own warm register, with a terracotta accent allocated to the seasonal program. Every element was specified for the roastery's actual print vendor and short-run equipment.",
    ],
    challenge:
      "Specialty coffee packaging collapses under its own information: origin, process, altitude, roast date, tasting notes, certifications. Most roasters solve it with clutter; the challenge was a label architecture that felt composed at twelve expressions per year instead of chaotic.",
    solution:
      "We fixed a strict label grid — origin and process as the typographic event, everything else in a quiet supporting register — and gave each coffee a single printed variable: a numbered index mark on the seam. The system absorbs an unlimited number of releases while making each one feel deliberate.",
    outcome:
      "Emberline's wholesale accounts doubled in the eighteen months after relaunch, and the numbered seam became a collector's detail among subscribers. The seasonal terracotta program now sells through cafés faster than the roastery can print it.",
    details: [
      {
        src: "/images/detail-typography.webp",
        alt: "Macro photograph of large letterpress type blocks arranged in a wooden tray",
        caption: "The label type specimen — set, proofed, and rejected twice before the final cut.",
        aspect: "wide",
      },
      {
        src: "/images/detail-emberline-portrait.webp",
        alt: "Kraft coffee bag and cream box with minimal typographic labels and a terracotta accent",
        caption: "Bag and box at retail scale — one single-origin, one blend, one grid.",
        aspect: "portrait",
      },
    ],
    featured: true,
  },
  {
    slug: "solace",
    title: "Solace",
    client: "Solace Wellbeing",
    year: "2024",
    sector: "Health & Wellness",
    location: "Remote / Austin, TX",
    summary: "A calm, accessible digital brand system for a mental-wellbeing platform scaling past two million sessions.",
    cover: "/images/solace-portrait.webp",
    coverAspect: "portrait",
    coverAlt: "Minimal calm interface on a tablet resting on cream linen beside dried eucalyptus",
    services: ["Visual Design System", "Brand Guidelines"],
    deliverables: ["Token architecture", "Component library spec", "Accessibility standards", "Brand guidelines"],
    overview: [
      "Solace entered mental wellbeing at startup speed and inherited a visual language to match: high-contrast purples, gamified streaks, celebration confetti — patterns borrowed from fitness apps that felt actively wrong for people in a hard moment. As the platform passed two million sessions, the cost of that dissonance became impossible to ignore.",
      "The redesign is built on a simple premise: calm is a design specification. A warm neutral palette, a rounded serif for human moments, generous spacing as a load-bearing element, and an accessibility standard that treats WCAG AAA contrast as the floor rather than the ceiling.",
    ],
    challenge:
      "The product team shipped weekly, across web and both mobile platforms, with designers distributed on three continents. Any system that required a designer's intervention per screen would fail — the brand had to live in tokens and components, not in documents nobody rereads.",
    solution:
      "We shipped a token architecture (color, type, space, motion) with semantic aliases so the same component reads correctly in light, dark, and the platform's low-sensory mode; a component library specified to the pixel for the three platforms; and a guidelines site written for engineers, with code snippets beside every rule.",
    outcome:
      "Post-launch, Solace's support tickets mentioning visual confusion dropped by half, and session-completion rates in the redesigned flows rose measurably. The low-sensory mode, built directly on the token system, has become the platform's most-praised accessibility feature.",
    details: [
      {
        src: "/images/detail-palette.webp",
        alt: "Hand-painted color palette study cards in warm neutral tones",
        caption: "The calm register — painted, tested for contrast, then hardened into semantic tokens.",
        aspect: "wide",
      },
      {
        src: "/images/detail-solace-portrait.webp",
        alt: "Tablet showing a calm neutral interface beside a ceramic cup and folded linen",
        caption: "The interface at rest — neutral tokens, generous space, nothing competing.",
        aspect: "portrait",
      },
    ],
    featured: true,
  },
  {
    slug: "meridian",
    title: "Meridian",
    client: "Meridian Journal",
    year: "2023",
    sector: "Publishing",
    location: "New York, NY",
    summary: "Quarterly art direction for an independent journal of place, landscape, and slow travel.",
    cover: "/images/meridian-cover.webp",
    coverAspect: "landscape",
    coverAlt: "Open editorial magazine spread with elegant serif typography and generous white space",
    services: ["Art Direction"],
    deliverables: ["Editorial design language", "Photography direction", "Four seasonal issues", "Cover system"],
    overview: [
      "Meridian publishes long-form writing about place — essays that take months to report and an afternoon to read. The journal's founding art direction had been loving but improvised, and as circulation passed twenty thousand, the editors wanted an issue that looked as deliberate as the writing felt.",
      "I directed the editorial design language across four seasonal issues: a typographic system with an essay-first hierarchy, a photography register favoring quiet light and human absence, and a cover system built on a single typographic gesture that mutates with each issue's terrain.",
    ],
    challenge:
      "A quarterly with a small staff and an even smaller art budget cannot art-direct its way through commissioned shoots for every essay. The direction had to make a strong issue from two commissioned photo essays and a file of submitted work of wildly uneven quality.",
    solution:
      "We built the issue around typographic confidence — layout carries the identity, photography supports it — and invested the commissioning budget where it multiplied: one anchor photo essay per issue shot to a tight brief, a consistent duotone treatment that levels the submitted archive, and captions typographed as carefully as headlines.",
    outcome:
      "The redesigned issues sold through their print runs for the first time in the journal's history, and the cover system was shortlisted for a stack award. Two of the four issues have since been added to university design-periodical collections.",
    details: [
      {
        src: "/images/detail-typography.webp",
        alt: "Macro photograph of large letterpress type blocks arranged in a wooden tray",
        caption: "The journal's display face, proofed in letterpress to check its behavior at caption sizes.",
        aspect: "wide",
      },
      {
        src: "/images/workspace.webp",
        alt: "Minimal designer studio desk with typography sketches and printed type specimens",
        caption: "Issue layout studies — grids sketched, then argued over, before any page was set.",
        aspect: "landscape",
      },
    ],
    featured: false,
  },
  {
    slug: "foundry",
    title: "The Foundry",
    client: "Foundry Collective",
    year: "2022",
    sector: "Creative Services",
    location: "Brooklyn, NY",
    summary: "A stationery-led identity for a creative collective that pitches as one studio and works as eleven.",
    cover: "/images/foundry-portrait.webp",
    coverAspect: "portrait",
    coverAlt: "Stacked black and cream business cards with a debossed geometric mark and copper foil edges",
    services: ["Brand Identity", "Packaging & Print"],
    deliverables: ["Identity system", "Stationery system", "Pitch materials", "Onboarding kit"],
    overview: [
      "The Foundry is a collective — eleven independent designers, photographers, and strategists who assemble into a studio for large commissions and disband between them. Clients hire the collective's name, then meet eleven personal styles on day one. The identity had to hold a room of strong voices together without asking anyone to disappear.",
      "The answer was an identity that behaves like the collective itself: a fixed frame and a variable signature. A debossed geometric mark and strict stationery architecture stay constant, while each member's card carries their name in their own chosen typeface from a curated library — individuality as a designed feature, not a brand problem.",
    ],
    challenge:
      "Collective members are, definitionally, designers with opinions. Any identity that arrived as a finished decree would be quietly disobeyed within a quarter. The system needed to be something eleven professionals would choose to follow on its merits.",
    solution:
      "We designed the constraints collaboratively in two workshops — the mark, the stock, the copper edge, and the type library were group decisions, which made compliance a matter of pride. The stationery architecture is strict about structure and silent about personal typography, drawing a clean line between what represents the collective and what represents the member.",
    outcome:
      "The collective's pitch win rate rose in the year after launch — members credit materials that present eleven people as one confident studio. The member-card ritual has become a small onboarding ceremony, and no one has broken the system yet.",
    details: [
      {
        src: "/images/detail-monogram.webp",
        alt: "Blind-deboss monogram pressed into thick cotton paper under raking light",
        caption: "The collective mark, blind-debossed — present in the light, invisible to the touch.",
        aspect: "wide",
      },
      {
        src: "/images/detail-pattern.webp",
        alt: "Minimal geometric brand pattern of fine black lines with rust accents",
        caption: "The geometric mark, exploded into a pattern for the pitch template's closing pages.",
        aspect: "landscape",
      },
    ],
    featured: false,
  },
  {
    slug: "haven-press",
    title: "Haven Press",
    client: "Haven Press",
    year: "2023",
    sector: "Publishing",
    location: "Boston, MA",
    summary: "A spine-first cover system for an independent publisher whose books live or die on the shelf.",
    cover: "/images/haven-cover.webp",
    coverAspect: "landscape",
    coverAlt: "Stack of published books with minimalist typographic covers in cream, charcoal, and rust",
    services: ["Art Direction", "Packaging & Print"],
    deliverables: ["Cover system", "Spine architecture", "Seasonal catalog", "Sales collateral"],
    overview: [
      "Haven Press publishes eight to ten titles a year in literary nonfiction, and sells the overwhelming majority of them the old way: face-out on an independent bookseller's table, or spine-out in a section a browser walks past. The publisher's covers had been beautiful one-offs; as a body on a shelf, they were strangers to each other.",
      "The system we built is spine-first — designed for the two inches of shelf a browser actually sees — with a cover architecture of restrained typographic fronts in cream, charcoal, and rust, and a spine grid whose type scale is legible at four meters. Each title keeps its own photographer or typographic moment; the architecture guarantees the shelf.",
    ],
    challenge:
      "A cover system for a literary list must respect that each book is someone's five-year labor with its own sensibility — while still reading as a press at a glance. Too much system and the list flattens; too little and the shelf effect evaporates.",
    solution:
      "We fixed three variables — palette, typeface for author and title, and the spine grid — and freed everything else. The result is a list where no two covers repeat, but any bookseller can shelve a Haven title correctly from across the room. The seasonal catalog was redesigned around the same grid, so sales and shelf speak one language.",
    outcome:
      "Haven's list began appearing in booksellers' staff-pick tables at a rate the publisher calls 'unprecedented for our size,' and the spine system survived its first two seasons without a single exception requested by an author.",
    details: [
      {
        src: "/images/detail-typography.webp",
        alt: "Macro photograph of large letterpress type blocks in a wooden tray",
        caption: "Spine type at shelf scale — proofed at size before the first title was set.",
        aspect: "wide",
      },
      {
        src: "/images/detail-palette.webp",
        alt: "Hand-painted color study cards in cream, charcoal, and rust",
        caption: "The three-ink palette, held to across the whole list so covers rhyme on the shelf.",
        aspect: "landscape",
      },
    ],
    featured: false,
  },
  {
    slug: "latitude",
    title: "Latitude",
    client: "Latitude Gallery",
    year: "2022",
    sector: "Arts & Culture",
    location: "Santa Fe, NM",
    summary: "An environmental identity for a contemporary gallery expanding into a second, larger space.",
    cover: "/images/latitude-portrait.webp",
    coverAspect: "portrait",
    coverAlt: "Large sans-serif gallery signage letters mounted on a warm concrete wall with architectural shadows",
    services: ["Brand Identity", "Packaging & Print"],
    deliverables: ["Identity system", "Environmental graphics", "Exhibition kit", "Announcement series"],
    overview: [
      "Latitude's first space was a converted adobe house whose intimacy did half the gallery's branding for free. The second space — a former warehouse, four times the size — removed that subsidy overnight. The gallery needed an identity that could command volume without the preciousness that contemporary art audiences read instantly as insecurity.",
      "The system is environmental at its core: a mounting-letter wordmark scaled for the new building's longest wall, an announcement series on oversized cream stock that reads as an artwork label from a distance, and an exhibition kit that lets each show's designer work inside a fixed, generous frame.",
    ],
    challenge:
      "Galleries serve two audiences with opposite instincts — collectors who want the gallery's authority confirmed, and artists who want the space to disappear behind the work. Every application had to feel substantial to one and reticent to the other, at architectural scale.",
    solution:
      "We spent the identity's entire personality budget on the wordmark and the wall — everything else recedes deliberately. Announcements carry exhibition information in a fixed label grid; the environmental letters are fabricated in a warm neutral that photographs differently through the day; and the exhibition kit's frame is strict enough to unify a season and loose enough that no artist has asked to leave it.",
    outcome:
      "The opening season at the warehouse drew record attendance, and the announcement series — nearly a meter tall — became briefly famous for being spotted folded into collectors' carry bags at fairs. The gallery has since extended the system to its residency program.",
    details: [
      {
        src: "/images/detail-pattern.webp",
        alt: "Minimal geometric pattern of fine lines with warm accents on textured paper",
        caption: "The exhibition kit's frame — the only fixed element each designer inherits.",
        aspect: "wide",
      },
      {
        src: "/images/workspace.webp",
        alt: "Minimal studio desk with brand collateral and type specimens in warm tones",
        caption: "Signage maquettes at desk scale, before fabrication at wall scale.",
        aspect: "landscape",
      },
    ],
    featured: false,
  },
] as const;

export const FEATURED_PROJECTS = PROJECTS.filter((p) => p.featured);

export function getProject(slug: string): Project | undefined {
  return PROJECTS.find((p) => p.slug === slug);
}

export function getNextProject(slug: string): Project {
  const index = PROJECTS.findIndex((p) => p.slug === slug);
  const next = PROJECTS[(index + 1) % PROJECTS.length];
  if (!next) throw new Error(`Project not found: ${slug}`);
  return next;
}

/** Builds the 24-item marquee sequence: covers, detail imagery, and typographic tiles.
 *
 * Image items carry a `shape` (tall / wide / landscape) so the strip renders as a
 * mixed-aspect gallery — portrait covers stand tall, landscape covers run wide,
 * studio details sit between, and the typographic tiles square off the rhythm. */
export function getMarqueeItems(): ReadonlyArray<
  | { kind: "image"; src: string; alt: string; label: string; shape: "tall" | "wide" | "landscape" }
  | { kind: "tile"; label: string; sub: string }
> {
  const imageItems = PROJECTS.map((p) => ({
    kind: "image" as const,
    src: p.cover,
    alt: p.coverAlt,
    label: p.title,
    shape: p.coverAspect === "portrait" ? ("tall" as const) : ("wide" as const),
  }));

  const detailItems = [
    { src: "/images/detail-typography.webp", alt: "Letterpress type blocks in a wooden tray", label: "Type studies" },
    { src: "/images/detail-palette.webp", alt: "Hand-painted palette study cards", label: "Palette studies" },
    { src: "/images/detail-pattern.webp", alt: "Fine-line geometric brand pattern", label: "Pattern system" },
    { src: "/images/detail-monogram.webp", alt: "Debossed monogram on cotton paper", label: "Monogram detail" },
    { src: "/images/workspace.webp", alt: "Studio desk with printed type specimens", label: "The studio desk" },
  ].map((d) => ({ kind: "image" as const, shape: "landscape" as const, ...d }));

  const tileItems = [
    { label: "Identity", sub: "01" },
    { label: "Systems", sub: "02" },
    { label: "Direction", sub: "03" },
    { label: "Guidelines", sub: "04" },
    { label: "Naming", sub: "05" },
    { label: "Packaging", sub: "06" },
    { label: "Editorial", sub: "—" },
    { label: "Typography", sub: "—" },
    { label: "Strategy", sub: "—" },
    { label: "Print", sub: "—" },
    { label: "Signal", sub: "—" },
  ].map((t) => ({ kind: "tile" as const, ...t }));

  // 8 covers + 5 studio details + 11 typographic tiles = 24 items per loop.
  return [...imageItems, ...detailItems, ...tileItems];
}
