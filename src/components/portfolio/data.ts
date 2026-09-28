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
  { label: "FIGURE/IT OUT", obj: "notebook", z: 0, s: 0, c: 0, m: 0.9 },
  { label: "NO ROADMAP,/NO PROBLEM", obj: "cup", z: 0, s: 2, c: 3, m: 0.82 },
  { label: "ASK THE/OBVIOUS/QUESTION", obj: "compass", z: 0, s: 5, c: 6, m: 0.8 },
  { label: "STRUCTURE/THE MESS", obj: "plate", z: 1, s: 4, c: 2, m: 0.9 },
  { label: "12 SHEETS IN,/1 SYSTEM OUT", obj: "notes", z: 1, s: 1, c: 5, m: 0.85 },
  { label: "AMBIGUITY IN,/SHAPE OUT", obj: "jar", z: 1, s: 6, c: 1, m: 0.8 },
  { label: "BUILD/THE THING", obj: "laptop", z: 2, s: 0, c: 4, m: 0.9 },
  { label: "SHIPPED,/NOT PITCHED", obj: "parcel", z: 2, s: 7, c: 0, m: 0.85 },
  { label: "LIVE,/NOT A DECK", obj: "phone", z: 2, s: 3, c: 3, m: 0.82 },
  { label: "RUNS/WITHOUT ME", obj: "plant", z: 3, s: 4, c: 6, m: 0.9 },
  { label: "PLAYBOOKS THAT/OUTLIVE ME", obj: "card", z: 3, s: 1, c: 2, m: 0.85 },
  { label: "HANDED/OVER", obj: "keys", z: 3, s: 2, c: 4, m: 0.8 },
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
    "Figuring it out",
    "Give me the thing nobody has defined yet. No roadmap, no problem.",
    "var(--color-accent)",
  ],
  [
    "Structuring the mess",
    "Ambiguity in, shape out. Twelve spreadsheets in, one system out.",
    "var(--color-accent-2-600)",
  ],
  ["Building the thing", "I ship it, not a recommendation of it.", "var(--color-accent-700)"],
  [
    "Making myself unnecessary",
    "It keeps running when I leave the room. The playbooks outlive me.",
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
  [0.08, 0.28],
  [0.1, 0.72],
  [0.27, 0.12],
  [0.28, 0.88],
  [0.72, 0.12],
  [0.71, 0.88],
  [0.92, 0.3],
  [0.9, 0.72],
  [0.18, 0.5],
  [0.82, 0.5],
  [0.49, 0.07],
  [0.5, 0.94],
];
export const MSP: [number, number][] = [
  [0.22, 0.12],
  [0.76, 0.12],
  [0.24, 0.3],
  [0.76, 0.3],
  [0.24, 0.72],
  [0.76, 0.72],
  [0.26, 0.9],
  [0.74, 0.9],
  [0.5, 0.04],
  [0.5, 0.8],
  [0.1, 0.5],
  [0.9, 0.5],
];

export const MEOWS = [
  "meow. I’m the only one here who hasn’t shipped anything.",
  "those stickers up top? I knocked them off the table. she sorted them.",
  "hire her. I need a bigger cardboard box.",
  "she went assistant → cofounder. I went floor → sofa.",
  "the SchoolTrips planner is in beta. go poke it.",
  "twelve tabs open. I’m sitting on three of them.",
];
export const HISS = ["HSSSSS.", "hsss. personal space.", "HISS. (affectionately)"];

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
    b: "Taught that everything is a system with inputs, failure points and a bottleneck. I still think this way about every product.",
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
    b: "Played both, depending on the occasion. A decade of rehearsing until it’s genuinely right, in time with forty other people.",
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
    b: "Handed problems with no shape and asked to return structure. Learned to ask the obvious question everyone else had skipped.",
    bg: "var(--color-accent-100)",
    panel: "var(--color-bg)",
    r: -0.5,
  },
  {
    ...light,
    scene: "signpost",
    span: "1 year",
    h: "Figuring out my life",
    at: "On my own",
    b: "Launched The Lunar Playground, published a kids’ book and built websites for clients. Figuring it out looked a lot like shipping.",
    bg: "var(--color-surface)",
    panel: "var(--color-neutral-100)",
    r: 1.2,
  },
  {
    ...light,
    scene: "inbox",
    span: "A few months",
    h: "Remote assistant",
    at: "SchoolTrips.ai",
    b: "Cold-emailed a stack of companies. One hired me for admin, then made the mistake of asking what I thought.",
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
    b: "Same company that hired me for admin. I made myself so useful the titles couldn’t keep up.",
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
    b: "Turns career history into evidence, scored against the role you want.",
    s: "In progress",
    ...wip,
    r: -1,
    href: "https://github.com/ashleighchua/Career-Compass",
  },
  {
    h: "Clarity",
    b: "Chaotic spec in, readable docs out. Built for a technical writer application at Squirro. They reckoned I’d suit product better.",
    s: "Live",
    ...live,
    r: 1,
    href: "https://clarity-henna.vercel.app",
  },
  {
    h: "Celestial",
    b: "Five systems, one profile, an AI reading at the end.",
    s: "Live",
    ...live,
    r: 0.5,
    href: "https://astrology-app-hazel.vercel.app",
  },
  {
    h: "Fruition Passport",
    b: "What fruit is actually in season, anywhere.",
    s: "Live",
    ...live,
    r: -1.2,
    href: "https://fruition-passport.ashleighchua.workers.dev",
  },
  {
    h: "Dino Kart Mandarin",
    b: "Mandarin drills disguised as a dinosaur kart race. Yes, really.",
    s: "On GitHub",
    bg: "var(--color-neutral-900)",
    fg: "var(--color-neutral-100)",
    r: 1.2,
    href: "https://mandarin-survival-kit.vercel.app",
  },
  {
    h: "Remote job tracker",
    b: "Scrapes listings daily, mails itself a clean shortlist.",
    s: "In use",
    ...use,
    r: -0.5,
    href: "https://github.com/ashleighchua/remote-job-tracker",
  },
  {
    h: "Trading dashboard",
    b: "Journals trades; checks whether my signals hold up.",
    s: "In use",
    ...use,
    r: 0.8,
    href: "https://github.com/ashleighchua/trading-dashboard",
  },
  {
    h: "Reddit monitor",
    b: "Drafts replies for The Lunar Playground. I approve every one.",
    s: "In use",
    ...use,
    r: -1,
    href: "https://github.com/ashleighchua/lunar-reddit-monitor",
  },
];

/* ── Lunar Playground pipeline teaser ── */

export const PIPELINE = [
  { h: "Order in", b: "Relocation reading, birth details attached" },
  { h: "Chart calculated", b: "Astrocartography lines plotted for their places" },
  { h: "Reading written", b: "Interpreted and laid out as a report" },
  { h: "PDF delivered", b: "In the client’s inbox. Nobody lifted a finger." },
];

export const LINKS = {
  email: "ashleighchua@gmail.com",
  linkedin: "https://www.linkedin.com/in/ashleigh-chua120/",
  github: "https://github.com/ashleighchua",
  planner: "https://demo.schooltrips.ai",
  hannah: "https://byhannahjackson.com",
  lunar: "https://thelunarplayground.com",
};
