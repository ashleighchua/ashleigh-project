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
  | "keys"
  | "cake";

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
  cake: { w: 92, h: 92, x: 14, y: 176, r: -6 },
};

/** Table objects with no sticker of their own; they're already set out on the table */
export const DECOR: { obj: ObjKey; z: number }[] = [
  { obj: "compass", z: 0 },
  { obj: "jar", z: 1 },
  { obj: "phone", z: 2 },
  { obj: "keys", z: 3 },
  { obj: "cake", z: 3 },
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
/** Mobile: one staggered row across the top, one across the bottom, so they read as
 *  scattered rather than stacked in two clumps. Per-sticker jitter varies it further. */
export const MSP: [number, number][] = [
  [0.07, 0.15],
  [0.36, 0.045],
  [0.65, 0.155],
  [0.93, 0.05],
  [0.07, 0.85],
  [0.36, 0.955],
  [0.65, 0.845],
  [0.93, 0.95],
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
  /* TODO (Ashleigh): a line from the person it was built for, and who said it.
   * Hannah's testimonial goes on card 02, a Lunar Playground review on card 03.
   * Leave them out and the card renders exactly as it does now. Real words only —
   * get their say-so before putting a name to one. */
  quote?: string;
  quoteBy?: string;
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
    body: "Hannah asked for a website. I built her a dashboard too, so she can add paintings, change prices and mark work as sold whenever she likes, without touching code.",
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
    mine: "I designed the prompt structure, the report format and the delivery workflow, so an order becomes a finished PDF without me touching it. I handled customer communication myself; the reports were automated.",
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

/* ── What buyers said about the reports the pipeline delivered ──
 * Real reviews from the Fiverr listing, copied as written. Trimmed only where the
 * ellipsis shows, never reworded. `stars` is the rating that buyer left, so a part
 * rating (heyhelena's 4.3) shows as a part-filled star rather than being rounded up. */

/** the figures above the reviews, each set as its own chip; the last wears a star */
export const LUNAR_STATS: [figure: string, label: string, star?: true][] = [
  ["100+", "orders"],
  ["12", "countries"],
  ["4.8", "average", true],
];

export const LUNAR_REVIEWS: {
  quote: string;
  by: string;
  where: string;
  stars: number;
}[] = [
  {
    quote:
      "I went in just curious about my astrocartography since I didn't know how to read it, and came out understanding a lot… Lots of things resonated and it felt very personal.",
    by: "sakiptoo",
    where: "United States",
    stars: 5,
  },
  {
    quote:
      "…inspired me to consider traveling and possibly relocating to the places that were revealed and analyzed.",
    by: "staceyd4u",
    where: "United States",
    stars: 5,
  },
  {
    quote: "This report was beautifully written.",
    by: "theseveredlink",
    where: "Germany",
    stars: 5,
  },
  {
    quote:
      "I loved my report, it is very clear to understand. The report was delivered prior to the delivery date.",
    by: "heyhelena",
    where: "United States",
    stars: 4.3,
  },
  {
    quote: "The report is so informative and detailed. Would highly recommend!",
    by: "marisav03",
    where: "United States",
    stars: 5,
  },
  /* this one is about me, not the report — it stays only as long as the card says
   * I answered the messages myself */
  {
    quote:
      "They explained everything clearly, answered every question thoroughly, and made the entire process easy to understand… I would not hesitate to work with them again.",
    by: "sose29910",
    where: "United States",
    stars: 5,
  },
];

/* Hannah's review of the build, as she wrote it. No star rating: she didn't leave one. */
export const HANNAH_REVIEWS: { quote: string; by: string; where?: string; stars?: number }[] = [
  "You are excellent at understanding the desired outcome and then working backward to execute.",
  "You are fastttttt.",
  "Feels like you are on my team. Like not just a paid product, I feel like you genuinely care about it.",
  "You went above and beyond in the last 24hrs to make sure it was perfect.",
  "I was so happy I didn’t feel the quote matched the level that was delivered so I overpaid you.",
].map((quote) => ({ quote, by: "Hannah Jackson" }));

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
    b: "Chaotic spec in, readable docs out. Built after a technical writing interview where they told me I'd suit product better ↗",
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

/* ── The kitchen: the magnets on the fridge door ── */

/** Whose post a card would have gone through; art.tsx draws the flag. */
export type FlagCode = "th" | "cn" | "sg" | "jp" | "vn" | "my" | "es" | "be" | "gb" | "au";

export type PlaceKind =
  | "kch"
  | "cnx"
  | "pek"
  | "bkk"
  | "sin"
  | "hkd"
  | "han"
  | "scq"
  | "kul"
  | "bru"
  | "ldn"
  | "agp"
  | "mel";

export type Place = {
  /** picks the drawn magnet, and doubles as its airport code */
  kind: PlaceKind;
  name: string;
  /** where it sits on the door, in % of the door's width (the door is its own container) */
  x: number;
  y: number;
  /** how crooked it hangs, in degrees */
  r: number;
  /** the postcard: a solid block of this, with the name set in the ink */
  bg: string;
  ink: string;
  /** whose post it would have gone through; picks the flag drawn on the stamp */
  flag: FlagCode;
  /** what she wrote on the back */
  line?: string;
};

/* Read left to right, top to bottom, the way they hang on the door. x and y are the
 * magnet's top-left corner in % of the door's width. The door is not the whole
 * rectangle: the top corners are rounded off by 10, the right 3.5 is the side of the
 * fridge, and the handles run down 89.6–92.6. So a magnet lands inside x 3–86 and
 * y 12–115, and below that is where visitors' notes go. */
export const PLACES: Place[] = [
  {
    kind: "cnx",
    name: "Chiang Mai",
    x: 6,
    y: 13,
    r: -7,
    bg: "#f6c177",
    ink: "#5a2c06",
    flag: "th",
    line: "My dad is one of ten siblings, so when the whole family came to visit, obviously I had to show up as everyone’s favourite niece. Then Songkran happened. Thai New Year, three days of water fights, and absolutely no chance of staying dry. I gave up pretending to be a respectable adult pretty quickly.",
  },
  {
    kind: "pek",
    name: "Beijing",
    x: 23,
    y: 19,
    r: 5,
    bg: "#c81d25",
    ink: "#ffe08a",
    flag: "cn",
    line: "Camped by the Great Wall with 150-odd students. Also a glow-worm cave, tea leaves picked on a mountainside, and a village so far out the road ran out before we did.",
  },
  {
    kind: "bkk",
    name: "Bangkok",
    x: 43,
    y: 11,
    r: -3,
    bg: "#c8102e",
    ink: "#fff4d6",
    flag: "th",
    line: "After a year of calling Bangkok home, I spent a week at a monastery on a mindfulness retreat, eating what the monks ate. Then came the goodbye. I left Bangkok and started moving properly. The longest I’ve stayed anywhere this year is six weeks. She moves quick.",
  },
  {
    kind: "sin",
    name: "Singapore",
    x: 64,
    y: 17,
    r: 9,
    bg: "#6b8e23",
    ink: "#fffbe6",
    flag: "sg",
    line: "Saw my brother’s new place, and squeezed in three kaya toast breakfasts before the next trip. I stand by all three.",
  },
  {
    kind: "hkd",
    name: "Hokkaido",
    x: 5,
    y: 45,
    r: -5,
    bg: "#1e3a8a",
    ink: "#ffffff",
    flag: "jp",
    line: "Tried snowboarding for the first time. Snowboard in the day and then onsen after. Did this on repeat for 10 days. Pure bliss. Loved it enough to decide this was now a personality trait. My body disagreed and ached for about a month afterwards.",
  },
  {
    kind: "han",
    name: "Hanoi",
    x: 36,
    y: 40,
    r: 6,
    bg: "#da251d",
    ink: "#ffdd00",
    flag: "vn",
    line: "Finally met my cofounder in person. I joined for the school trip season, drank far too many egg and salt coffees, and it’s my base now — though most of the season is spent on trips in China.",
  },
  {
    kind: "kch",
    name: "Kuching",
    x: 64,
    y: 40,
    r: -4,
    bg: "#1f6f54",
    ink: "#ffd97a",
    flag: "my",
    line: "My parents still live here, so technically this is home. Except I left 10 years ago, and coming back feels weirdly familiar and foreign at the same time. I know where everything is, but somehow I’m still a visitor. I do, however, have incredibly restful sleep here.",
  },
  {
    kind: "scq",
    name: "Santiago de Compostela",
    x: 4,
    y: 64,
    r: -6,
    bg: "#1d4e9e",
    ink: "#f7c600",
    flag: "es",
    line: "Walked 120km with my best friend, then went to Finisterre alone. There was something very nice about finishing the walk with someone and then having a little time by myself at what was once considered the end of the world. Also, the sunset was ridiculous.",
  },
  {
    kind: "kul",
    name: "Kuala Lumpur",
    x: 32,
    y: 68,
    r: 4,
    bg: "#8fd0f0",
    ink: "#173b63",
    flag: "my",
    line: "The plan was early nights and sensible behaviour. Instead, I stayed up talking with friends until the sun came up. Three times. We talked about everything and absolutely nothing, which is probably my favourite kind of night.",
  },
  {
    kind: "bru",
    name: "Brussels",
    x: 63,
    y: 66,
    r: 8,
    bg: "#e0a458",
    ink: "#4a2c10",
    flag: "be",
    line: "My connecting flight was cancelled and the next one wasn’t for another week, so apparently I lived in Belgium now. EU compensation and travel insurance meant my expenses were covered, so I was basically being paid to travel around Belgium.",
  },
  {
    kind: "ldn",
    name: "London",
    x: 6,
    y: 94,
    r: -3,
    bg: "#d0021b",
    ink: "#ffffff",
    flag: "gb",
    line: "Caught London in suspiciously good weather. Sun the entire time, which I’m told is basically a miracle. Picnics in parks, wandering around, and The Book of Mormon, which was deeply inappropriate and extremely funny.",
  },
  {
    kind: "agp",
    name: "Málaga",
    x: 33,
    y: 92,
    r: -6,
    bg: "#1e8fc6",
    ink: "#ffffff",
    flag: "es",
    line: "Visited the bestie for five weeks. Experienced San Juan. Jumped into the sea at midnight, over bonfires, and into the World Cup with about 20% understanding of what was happening (I think I finally sort of understand what an offside is?). Also beach. Lots of beach.",
  },
  {
    kind: "mel",
    name: "Melbourne",
    x: 62,
    y: 96,
    r: 5,
    bg: "#2e6b3a",
    ink: "#f3e7c3",
    flag: "au",
    line: "My brother married his best friend, then I stayed on for a month to au pair two little girls. It was such a special little pocket of life. I looked after them, took them on adventures, and helped their mum Hannah build an art website somewhere in between.",
  },
];

/* ── Before you go ── */

/** Keep in step with the coffee price set on Ko-fi */
export const COFFEE_PRICE = 5;
export const COFFEE_COUNTS = [1, 3, 5];

/** How long the oven and the coffee machine take, in ms. The oven counts down. */
export const BAKE_MS = 8000;
export const BREW_MS = 3200;

export type StickerKind = "hi" | "hire" | "coffee" | "love" | "build" | "moon" | "yay" | "thanks";

/** Stickers a visitor can leave on the fridge */
export const TABLE_STICKERS: { kind: StickerKind; label: string }[] = [
  { kind: "hi", label: "Hi!" },
  { kind: "hire", label: "Hire her" },
  { kind: "coffee", label: "Coffee soon?" },
  { kind: "love", label: "Love this" },
  { kind: "build", label: "Let’s build" },
  { kind: "moon", label: "Moon" },
  { kind: "yay", label: "Yay" },
  { kind: "thanks", label: "Thank you" },
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
