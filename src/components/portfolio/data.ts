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

export const STK: Sticker[] = [
  { label: "FIND THE/REAL PROBLEM", obj: "notebook", z: 0, s: 11, c: 0, m: 0.9 },
  { label: "NO ROADMAP?/WE CAN START/ANYWAY", obj: "cup", z: 0, s: 2, c: 3, m: 0.84 },
  { label: "MAKE THE MESS/LEGIBLE", obj: "plate", z: 1, s: 4, c: 2, m: 0.9 },
  { label: "12 SHEETS,/ONE WORKING/SYSTEM", obj: "notes", z: 1, s: 1, c: 5, m: 0.86 },
  { label: "BUILT TO/GO LIVE", obj: "laptop", z: 2, s: 7, c: 0, m: 0.88 },
  { label: "SHIPPED,/NOT SHELVED", obj: "parcel", z: 2, s: 8, c: 4, m: 0.88 },
  { label: "YOU WON'T/NEED ME/FOREVER", obj: "plant", z: 3, s: 9, c: 6, m: 0.9 },
  { label: "HANDOVER,/DONE PROPERLY", obj: "keys", z: 3, s: 5, c: 1, m: 0.86 },
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
  { obj: "card", z: 3 },
];

export const ZONES: [title: string, body: string, dot: string][] = [
  [
    "Finding the real problem",
    "I start with what’s stuck. Sometimes it’s a decision nobody has made. Sometimes it’s a process everyone quietly works around.",
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
    "Leaving it easy to run",
    "I make the handover clear, so the work keeps moving long after I’ve stepped back.",
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
    b: "Engineering school taught me to notice where a system gets stuck, and I still look for the bottleneck holding everything else up.",
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
    b: "I launched The Lunar Playground, published a kids’ book, and built websites for clients. Some ideas worked; others joined my idea graveyard, where I learned to fail faster and take the useful lesson with me.",
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
    b: "I cold-emailed a stack of companies and joined Beyond Classrooms as a virtual assistant. I kept spotting things that could work better and fixing them, and before long I was building SchoolTrips.ai.",
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
    b: "The more I built, the more I owned. Eventually the title caught up. I’m now a cofounder at SchoolTrips.ai.",
    bg: "var(--color-neutral-900)",
    panel: "var(--color-neutral-800)",
    fg: "var(--color-neutral-100)",
    muted: "var(--color-neutral-300)",
    r: 0.5,
  },
];

/* ── Playground ── */

const live = { bg: "var(--color-accent-2-200)", fg: "var(--color-accent-2-800)" };
const use = { bg: "var(--color-accent-200)", fg: "var(--color-accent-800)" };
const wip = { bg: "var(--color-neutral-200)", fg: "var(--color-neutral-800)" };

export const PLAY: {
  h: string;
  b: string;
  s: string;
  bg: string;
  fg: string;
  r: number;
  /** no link = private project, shown as a tile you can't click */
  href?: string;
}[] = [
  {
    h: "100 Things to Do Before Dinner",
    b: "A children's book I wrote and published. Now on Amazon.",
    s: "Published",
    bg: "var(--color-accent)",
    fg: "var(--color-neutral-900)",
    r: 1.4,
    href: "https://www.amazon.sg/dp/B0GNJP8PK1",
  },
  {
    h: "Career Compass",
    b: "Turns career history into evidence, then scores it against the role you want.",
    s: "In progress",
    ...wip,
    r: -1,
    href: "https://github.com/ashleighchua/Career-Compass",
  },
  {
    h: "Clarity",
    b: "Turns a chaotic spec into readable documentation. I built it for a technical writer application at Squirro. They thought I might suit product better.",
    s: "Live",
    ...live,
    r: 1,
    href: "https://clarity-henna.vercel.app",
  },
  {
    h: "Celestial",
    b: "Brings together astrology, personality frameworks, and other ways people try to understand themselves. It ends with an AI reading that pulls it into one profile.",
    s: "Live",
    ...live,
    r: 0.5,
    href: "https://astrology-app-hazel.vercel.app",
  },
  {
    h: "Bangkok expat newsletter",
    b: "A Python pipeline that scrapes events across Bangkok, extracts them into a clean format and scores them, so the newsletter only features the good ones.",
    s: "Private repo",
    ...wip,
    r: -1.2,
  },
  {
    h: "Mandarin Survival Kit",
    b: "Real-world lessons, spaced-repetition flashcards and pronunciation drills. Built because every app kept teaching me to order coffee I don't drink.",
    s: "Live",
    ...live,
    r: 1.2,
    href: "https://mandarin-survival-kit.vercel.app",
  },
  {
    h: "Remote job tracker",
    b: "Checks listings daily for specific filters and sends me a clean shortlist.",
    s: "In use",
    ...use,
    r: -0.5,
    href: "https://github.com/ashleighchua/remote-job-tracker",
  },
  {
    h: "Trading dashboard",
    b: "Journals trades and checks whether my signals hold up. Runs trades autonomously without me when signals are hit.",
    s: "In use",
    ...use,
    r: 0.8,
    href: "https://github.com/ashleighchua/trading-dashboard",
  },
  {
    h: "Reddit monitor",
    b: "Drafts posts for The Lunar Playground so I can review and share them.",
    s: "In use",
    ...use,
    r: -1,
    href: "https://github.com/ashleighchua/lunar-reddit-monitor",
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
  { h: "PDF delivered", b: "It lands in the client’s inbox!" },
];

/* ── About ── */

/** Cycles in "Hi, I'm Ashleigh. I'm a ___." */
export const ROLES = [
  "cofounder",
  "product builder",
  "chemical engineer",
  "violist (and violinist)",
  "recovering consultant",
  "children's book author",
  "professional airport sitter",
  "serial side-project starter",
];

export type Adventure = {
  /** big line on the card */
  h: string;
  b: string;
  /** photo key in PortfolioPage; none = type-only card */
  photo?: "wall";
  kind?: "pass";
  bg: string;
  fg: string;
  r: number;
};

export const ADVENTURES: Adventure[] = [
  {
    h: "A week in a monastery",
    b: "Yes, really. Seven whole days.",
    bg: "var(--color-accent-2-300)",
    fg: "var(--color-accent-2-900)",
    r: -2.5,
  },
  {
    h: "120km across Spain",
    b: "On foot, with my best friend.",
    bg: "var(--color-accent-300)",
    fg: "var(--color-accent-900)",
    r: 1.8,
  },
  {
    h: "35",
    b: "flights so far this year, and it isn't over.",
    kind: "pass",
    bg: "var(--color-neutral-100)",
    fg: "var(--color-text)",
    r: -1.2,
  },
  {
    h: "A night at the Great Wall",
    b: "Camped out with 150 students on a school trip.",
    photo: "wall",
    bg: "var(--color-neutral-100)",
    fg: "var(--color-text)",
    r: 2.2,
  },
];

export const LINKS = {
  email: "ashleighchua@gmail.com",
  linkedin: "https://www.linkedin.com/in/ashleigh-chua120/",
  github: "https://github.com/ashleighchua",
  planner: "https://demo.schooltrips.ai",
  hannah: "https://byhannahjackson.com",
  lunar: "https://thelunarplayground.com",
};
