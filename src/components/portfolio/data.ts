/*
 * Page data. Float/scroll maths follow the design reference (Portfolio Site v3.dc.html);
 * the sticker set, shapes and table objects have since been reworked so every
 * sticker makes a real claim and lands as an object that means something.
 */

export type ObjKey =
  | "notebook"
  | "cup"
  | "compass"
  | "plate"
  | "notes"
  | "jar"
  | "laptop"
  | "parcel"
  | "phone"
  | "plant"
  | "card"
  | "keys";

export type Sticker = {
  /** `/` = line break */
  label: string;
  obj: ObjKey;
  /** which table setting (zone) it lands in */
  z: number;
  /** starting shape index into SH */
  s: number;
  /** starting colour index into COL */
  c: number;
  /** size multiplier */
  m: number;
};

/** Order sets the starting spot: even = left of the headline, odd = right (top to bottom).
 *  "Built to go live" (left) and "Built to last" (right) are kept apart on purpose. */
export const STK: Sticker[] = [
  { label: "FIND THE/REAL PROBLEM", obj: "notebook", z: 0, s: 11, c: 0, m: 0.9 },
  { label: "BUILT TO/LAST", obj: "plant", z: 3, s: 9, c: 6, m: 0.9 },
  { label: "NO ROADMAP?/WE CAN START/ANYWAY", obj: "cup", z: 0, s: 2, c: 3, m: 0.84 },
  { label: "12 SHEETS,/ONE WORKING/SYSTEM", obj: "notes", z: 1, s: 1, c: 5, m: 0.86 },
  { label: "BUILT TO/GO LIVE", obj: "laptop", z: 2, s: 7, c: 0, m: 0.88 },
  { label: "MAKE THE MESS/LEGIBLE", obj: "plate", z: 1, s: 4, c: 2, m: 0.9 },
  { label: "SHIPPED,/NOT SHELVED", obj: "parcel", z: 2, s: 8, c: 4, m: 0.88 },
  { label: "IN IT FOR/THE LONG/HAUL", obj: "card", z: 3, s: 5, c: 1, m: 0.86 },
];

/** Sticker shapes; a click cycles to a different one */
export const SH = [
  "square",
  "ticket",
  "circle",
  "tag",
  "wide",
  "stamp",
  "scallop",
  "tape",
  "arch",
  "burst",
  "flower",
  "blob",
] as const;
export type Shape = (typeof SH)[number];

export type ObjSpec = { w: number; h: number; x: number; y: number; r: number };

/** Viewbox size (w, h), centre x as % of the setting, top y in px, rotation */
export const OBJ: Record<ObjKey, ObjSpec> = {
  notebook: { w: 150, h: 180, x: 34, y: 10, r: -8 },
  cup: { w: 110, h: 100, x: 80, y: 36, r: 0 },
  compass: { w: 92, h: 92, x: 74, y: 178, r: 14 },
  plate: { w: 170, h: 170, x: 38, y: 8, r: 0 },
  notes: { w: 130, h: 104, x: 72, y: 178, r: 7 },
  jar: { w: 72, h: 100, x: 86, y: 34, r: -6 },
  laptop: { w: 190, h: 136, x: 46, y: 22, r: 6 },
  parcel: { w: 104, h: 90, x: 26, y: 182, r: -9 },
  phone: { w: 64, h: 118, x: 80, y: 160, r: 12 },
  plant: { w: 150, h: 150, x: 36, y: 12, r: 0 },
  card: { w: 130, h: 100, x: 68, y: 178, r: 9 },
  keys: { w: 86, h: 86, x: 84, y: 40, r: -12 },
};

/** Table objects with no sticker of their own; they're already set out on the table */
export const DECOR: { obj: ObjKey; z: number }[] = [
  { obj: "compass", z: 0 },
  { obj: "jar", z: 1 },
  { obj: "phone", z: 2 },
  { obj: "keys", z: 3 },
];

export const ZONES: [title: string, body: string, dot: string][] = [
  [
    "Finding the real problem",
    "I ask the questions that get to the real problem, so we build the right thing, not just the first idea.",
    "var(--color-accent)",
  ],
  [
    "Making the mess make sense",
    "I turn a pile of information into a system people can follow, like twelve spreadsheets becoming one working system.",
    "var(--color-accent-2-600)",
  ],
  [
    "Turning the plan into something useful",
    "Once the direction is clear, I build the practical version: a site, a tool, or a workflow people can pick up and use.",
    "var(--color-accent-700)",
  ],
  [
    "Built for the long run",
    "Whatever I build is simple enough for anyone on your team to use, tech-savvy or not.",
    "var(--color-accent-2-800)",
  ],
];

/** [background, text] pairs */
export const COL: [string, string][] = [
  ["var(--color-accent-300)", "var(--color-accent-800)"],
  ["var(--color-accent-2-300)", "var(--color-accent-2-900)"],
  ["var(--color-accent-200)", "var(--color-accent-700)"],
  ["var(--color-accent-2-100)", "var(--color-accent-2-800)"],
  ["var(--color-accent-500)", "var(--color-neutral-900)"],
  ["var(--color-neutral-200)", "var(--color-neutral-800)"],
  ["var(--color-accent-2-500)", "var(--color-accent-2-900)"],
];

/** Sticker spots as fractions of the hero rect, one per sticker: two clusters beside the headline */
export const DSP: [number, number][] = [
  [0.13, 0.14],
  [0.87, 0.15],
  [0.16, 0.38],
  [0.85, 0.39],
  [0.12, 0.62],
  [0.88, 0.62],
  [0.16, 0.86],
  [0.84, 0.86],
];
/** Mobile: two rows above the headline and two below */
export const MSP: [number, number][] = [
  [0.26, 0.08],
  [0.74, 0.07],
  [0.3, 0.2],
  [0.72, 0.21],
  [0.27, 0.8],
  [0.74, 0.79],
  [0.3, 0.93],
  [0.72, 0.93],
];

export const MEOWS = [
  "meow. i’m the only one here who hasn’t shipped anything.",
  "hire her. i need a bigger cardboard box.",
  "she went from assistant to cofounder. i went from floor to sofa.",
  "the SchoolTrips.ai planner is in beta. go poke it.",
  "she makes complicated work less annoying. i make Zoom calls less productive.",
  "don’t be fooled by the face. i am available for consulting.",
];
export const HISS = [
  "HSSSSS.",
  "hsss. personal space.",
  "HISS. (affectionately)",
  "that was not a pet. that was an administrative error.",
  "hss. i’m on break.",
];

/* ── Timeline ── */

export type Scene = "flask" | "violin" | "binders" | "signpost" | "inbox" | "coach";
export type Chapter = {
  scene: Scene;
  /** how long, in words — never a date */
  span: string;
  h: string;
  /** where */
  at: string;
  b: string;
  bg: string;
  panel: string;
  fg: string;
  muted: string;
  r: number;
};

const light = { fg: "var(--color-text)", muted: "var(--color-neutral-800)" };

export const PATH: Chapter[] = [
  {
    ...light,
    scene: "flask",
    span: "4 years",
    h: "Chemical engineering",
    at: "University",
    b: "Engineering school taught me to think in systems: how the parts connect, and how to work through a problem step by step.",
    bg: "var(--color-surface)",
    panel: "var(--color-accent-100)",
    r: -1,
  },
  {
    ...light,
    scene: "violin",
    span: "10 years",
    h: "Violin & viola",
    at: "State orchestra",
    b: "I played both instruments, depending on what the score needed. Ten years in an orchestra taught me how to keep time with forty other people and make music that only exists when everyone shows up.",
    bg: "var(--color-accent-2-200)",
    panel: "var(--color-accent-2-100)",
    muted: "var(--color-accent-2-900)",
    r: 1,
  },
  {
    ...light,
    scene: "binders",
    span: "3 years",
    h: "Regulatory consulting",
    at: "Big Four",
    b: "I helped clients turn dense regulatory requirements into next steps they could act on. It taught me that the right question early saves weeks of work later.",
    bg: "var(--color-accent-100)",
    panel: "var(--color-bg)",
    r: -0.5,
  },
  {
    ...light,
    scene: "signpost",
    span: "1 year",
    h: "Figuring things out",
    at: "On my own",
    b: "I launched The Lunar Playground, published a kids’ book, and built websites for clients. Some ideas worked; others joined my idea graveyard, where I learned to test quickly and keep what’s useful.",
    bg: "var(--color-surface)",
    panel: "var(--color-neutral-100)",
    r: 1.2,
  },
  {
    ...light,
    scene: "inbox",
    span: "A few months",
    h: "Virtual assistant",
    at: "Beyond Classrooms",
    b: "I cold-emailed a stack of companies and joined Beyond Classrooms as a virtual assistant. I said yes to whatever needed doing, and before long I was building SchoolTrips.ai.",
    bg: "var(--color-accent-2-200)",
    panel: "var(--color-accent-2-100)",
    muted: "var(--color-accent-2-900)",
    r: -1,
  },
  {
    scene: "coach",
    span: "Now",
    h: "Cofounder",
    at: "SchoolTrips.ai",
    b: "The more I built, the more I owned. Now I’m a cofounder at SchoolTrips.ai.",
    bg: "var(--color-neutral-900)",
    panel: "var(--color-neutral-800)",
    fg: "var(--color-neutral-100)",
    muted: "var(--color-neutral-300)",
    r: 0.5,
  },
];

/* ── The receipts: every card has the same parts, in the same order ── */

export const RECEIPTS: {
  id: "schooltrips" | "hannah" | "lunar";
  n: string;
  role: string;
  status: string;
  h: string;
  body: string;
  mine: string;
  cta: string;
  href: string;
}[] = [
  {
    id: "schooltrips",
    n: "01",
    role: "Cofounder",
    status: "In beta",
    h: "SchoolTrips.ai",
    body: "Teachers are tired of the admin that comes with every trip. SchoolTrips.ai takes it off their plate, and it gets smarter every time a trip is run and reviewed.",
    mine: "I lead product and build it. I also go on the ground on real school trips to learn about the entire process from planning a trip to seeing it through.",
    cta: "Try the beta",
    href: "https://demo.schooltrips.ai",
  },
  {
    id: "hannah",
    n: "02",
    role: "Client build",
    status: "Live",
    h: "Hannah Jackson",
    body: "Hannah asked for a website. I built her a dashboard too, so she can update her work, prices, and offers herself whenever she needs to, without touching code.",
    mine: "I designed and built the site and her dashboard. Not needing me was worth more to her than the site.",
    cta: "See her site",
    href: "https://byhannahjackson.com",
  },
  {
    id: "lunar",
    n: "03",
    role: "Solo product",
    status: "Live, fully automated",
    h: "The Lunar Playground",
    body: "Astrology as a reflective tool, not a fortune: the answers aren’t really in the stars, they’re in you. People come for natal and relocation readings, and stay for the free tools (birth chart, BaZi, Human Design, numerology and more) and the blog.",
    mine: "I built the whole pipeline, from the order form to the finished PDF. It runs without me touching each order.",
    cta: "Visit the site",
    href: "https://thelunarplayground.com",
  },
];

/* ── Lunar Playground pipeline teaser ── */

export const PIPELINE = [
  { h: "Order in", b: "A relocation reading, with the client's birth details attached." },
  {
    h: "Chart calculated",
    b: "Astrocartography lines are plotted for the places that matter to them.",
  },
  { h: "Reading written", b: "The results are interpreted and laid out as a report." },
  { h: "PDF delivered", b: "It lands in the client’s inbox." },
];

/* ── Playground ── */

export const PLAY: {
  h: string;
  b: string;
  /** status sticker */
  s: string;
  bg: string;
  fg: string;
  sbg: string;
  sfg: string;
  /** sticker tilt, degrees */
  r: number;
  /** no link = private project, shown as a tile you can't click */
  href?: string;
}[] = [
  {
    h: "100 Things to Do Before Dinner",
    b: "A children’s book I wrote and published. On Amazon ↗",
    s: "Published",
    bg: "var(--color-accent)",
    fg: "var(--color-bg)",
    sbg: "var(--color-bg)",
    sfg: "var(--color-accent-800)",
    r: 10,
    href: "https://www.amazon.sg/dp/B0GNJP8PK1",
  },
  {
    h: "Career Compass",
    b: "Scores your career history against the role you want ↗",
    s: "In progress",
    bg: "var(--color-accent-2)",
    fg: "var(--color-bg)",
    sbg: "var(--color-bg)",
    sfg: "var(--color-accent-2-800)",
    r: -12,
    href: "https://career-compass-eight-chi.vercel.app/",
  },
  {
    h: "Clarity",
    b: "Chaotic spec in, readable docs out. Squirro said I might suit product better ↗",
    s: "Live",
    bg: "var(--color-surface)",
    fg: "var(--color-text)",
    sbg: "var(--color-accent-2-200)",
    sfg: "var(--color-accent-2-800)",
    r: -4,
    href: "https://clarity-henna.vercel.app",
  },
  {
    h: "Celestial",
    b: "Astrology and personality frameworks, pulled into one AI reading ↗",
    s: "Live",
    bg: "var(--color-neutral-900)",
    fg: "var(--color-bg)",
    sbg: "var(--color-accent-2-200)",
    sfg: "var(--color-accent-2-800)",
    r: -8,
    href: "https://astrology-app-hazel.vercel.app",
  },
  {
    h: "Mandarin Survival Kit",
    b: "Real-world lessons, flashcards and pronunciation drills. No coffee ordering ↗",
    s: "Live",
    bg: "var(--color-accent-2-200)",
    fg: "var(--color-accent-2-900)",
    sbg: "var(--color-bg)",
    sfg: "var(--color-accent-2-800)",
    r: 6,
    href: "https://mandarin-survival-kit.vercel.app",
  },
  {
    h: "Bangkok expat newsletter",
    b: "A Python pipeline that scrapes, cleans and scores city events, so only the good ones make it in.",
    s: "Behind the scenes",
    bg: "var(--color-accent-200)",
    fg: "var(--color-accent-900)",
    sbg: "var(--color-bg)",
    sfg: "var(--color-accent-800)",
    r: -10,
  },
];

/* ── About ── */

/** Cycles in "I'm a ___." */
export const ROLES = [
  "cofounder",
  "product builder",
  "chemical engineer",
  "violinist and violist (and pianist)",
  "recovering consultant",
  "children's book author",
  "serial side-project starter",
];

export type Adventure = {
  h: string;
  b: string;
  /** photo key in PortfolioPage; none = the big-number card */
  photo?: "monastery" | "spain" | "wall";
  alt?: string;
  /** polaroid tilt, degrees */
  r: number;
};

export const ADVENTURES: Adventure[] = [
  {
    h: "A week in a monastery",
    b: "A mindfulness retreat. I lived and ate with the monks.",
    photo: "monastery",
    alt: "Evening exercise in a field below misty hills at the monastery",
    r: -2,
  },
  {
    h: "120km across Spain",
    b: "On foot, with my best friend.",
    photo: "spain",
    alt: "Ashleigh and her best friend beside a Camino marker reading Km 100",
    r: 1.5,
  },
  {
    h: "75,625 km flown",
    b: "Nearly twice around the Earth, and the work kept shipping the whole way.",
    r: -1,
  },
  {
    h: "A night at the Great Wall",
    b: "Camped out with 150 students on a school trip.",
    photo: "wall",
    alt: "Tents lit up at night by the Great Wall",
    r: 2,
  },
];

/* ── Before you go ── */

/** Keep in step with the coffee price set on Ko-fi */
export const COFFEE_PRICE = 5;
export const COFFEE_COUNTS = [1, 3, 5];

export type StickerKind = "hi" | "hire" | "coffee" | "love" | "build" | "moon";

/** Stickers a visitor can leave on the table */
export const TABLE_STICKERS: { kind: StickerKind; label: string }[] = [
  { kind: "hi", label: "Hi!" },
  { kind: "hire", label: "Hire her" },
  { kind: "coffee", label: "Coffee soon?" },
  { kind: "love", label: "Love this" },
  { kind: "build", label: "Let’s build" },
  { kind: "moon", label: "Moon" },
];

export const LINKS = {
  email: "ashleighchua@gmail.com",
  linkedin: "https://www.linkedin.com/in/ashleigh-chua120/",
  github: "https://github.com/ashleighchua",
  planner: "https://demo.schooltrips.ai",
  hannah: "https://byhannahjackson.com",
  lunar: "https://thelunarplayground.com",
  kofi: "https://ko-fi.com/ashleighchua",
};
