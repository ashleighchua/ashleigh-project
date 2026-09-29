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
  { label: "NO ROADMAP?/WE CAN START/ANYWAY", obj: "cup", z: 0, s: 2, c: 3, m: 0.82 },
  { label: "ASK WHAT'S/MISSING", obj: "compass", z: 0, s: 9, c: 6, m: 0.8 },
  { label: "MAKE THE MESS/LEGIBLE", obj: "plate", z: 1, s: 4, c: 2, m: 0.9 },
  { label: "12 SHEETS,/ONE WORKING/SYSTEM", obj: "notes", z: 1, s: 1, c: 5, m: 0.85 },
  { label: "TURN SOMETHING/VAGUE INTO/A PLAN", obj: "jar", z: 1, s: 6, c: 1, m: 0.8 },
  { label: "MAKE IT/USEFUL", obj: "laptop", z: 2, s: 8, c: 4, m: 0.9 },
  { label: "BUILT TO/GO LIVE", obj: "parcel", z: 2, s: 7, c: 0, m: 0.85 },
  { label: "READY FOR/REAL PEOPLE", obj: "phone", z: 2, s: 3, c: 3, m: 0.82 },
  { label: "EASY TO/RUN", obj: "plant", z: 3, s: 10, c: 6, m: 0.9 },
  { label: "PLAYBOOKS/PEOPLE CAN/PICK UP", obj: "card", z: 3, s: 5, c: 2, m: 0.85 },
  { label: "HANDOVER,/DONE PROPERLY", obj: "keys", z: 3, s: 0, c: 4, m: 0.8 },
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

export const ZONES: [title: string, body: string, dot: string][] = [
  [
    "Finding the real problem",
    "I start with what is stuck. Sometimes it is a decision. Sometimes it is a process that no longer works.",
    "var(--color-accent)",
  ],
  [
    "Making the mess make sense",
    "I turn a pile of information into a system people can follow.",
    "var(--color-accent-2-600)",
  ],
  [
    "Turning the plan into something useful",
    "Once the direction is clear, I make the practical version of it: a site, a tool, or a workflow people can pick up and use.",
    "var(--color-accent-700)",
  ],
  [
    "Leaving it easy to run",
    "I make the handover clear, so the work can keep moving without someone needing to translate it first.",
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

/** Float spots as fractions of the hero rect — desktop / mobile */
export const DSP: [number, number][] = [
  [0.08, 0.14],
  [0.08, 0.86],
  [0.25, 0.1],
  [0.25, 0.9],
  [0.75, 0.1],
  [0.75, 0.9],
  [0.92, 0.14],
  [0.92, 0.86],
  [0.42, 0.9],
  [0.58, 0.1],
  [0.42, 0.08],
  [0.58, 0.92],
];
/** Mobile: a 3×2 grid above the headline and another below it */
export const MSP: [number, number][] = [
  [0.17, 0.07],
  [0.5, 0.06],
  [0.83, 0.07],
  [0.17, 0.2],
  [0.5, 0.21],
  [0.83, 0.2],
  [0.17, 0.79],
  [0.5, 0.8],
  [0.83, 0.79],
  [0.17, 0.93],
  [0.5, 0.94],
  [0.83, 0.93],
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
    b: "Engineering school taught me to notice where a system gets stuck. I still bring that instinct to product work, looking for the bottleneck holding everything else up.",
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
    b: "I helped clients work through complex requirements and turn them into clear next steps. It taught me to ask the questions that get a conversation moving.",
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
    b: "I cold-emailed a stack of companies and joined Beyond Classrooms as a virtual assistant. Before long, I was asked to work on SchoolTrips.ai.",
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
    b: "I kept finding the work that needed doing and doing it. Eventually the role caught up with me. I’m now a cofounder at SchoolTrips.ai.",
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

export const PLAY = [
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
    h: "Fruition Passport",
    b: "Tells you what fruit is actually in season, in whichever part of the world you choose.",
    s: "Live",
    ...live,
    r: -1.2,
    href: "https://fruition-passport.ashleighchua.workers.dev",
  },
  {
    h: "Dino Kart Mandarin",
    b: "Mandarin practice disguised as a dinosaur kart race. Yes, really.",
    s: "On GitHub",
    bg: "var(--color-neutral-900)",
    fg: "var(--color-neutral-100)",
    r: 1.2,
    href: "https://github.com/liamaspeling/mandarin",
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
    b: "Drafts posts for The Lunar Playground and posts on my behalf.",
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

export const LINKS = {
  email: "ashleighchua@gmail.com",
  linkedin: "https://www.linkedin.com/in/ashleigh-chua120/",
  github: "https://github.com/ashleighchua",
  planner: "https://demo.schooltrips.ai",
  hannah: "https://byhannahjackson.com",
  lunar: "https://thelunarplayground.com",
};
