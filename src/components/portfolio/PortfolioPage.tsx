import { useEffect, useRef, useState, type ReactNode } from "react";
import hannahHome from "@/assets/hannah-home.png";
import schoolTripsDashboard from "@/assets/schooltrips-dashboard.png";
import lunarPlaygroundHome from "@/assets/lunar-playground-home.png";
import shandongTrip from "@/assets/shandong-trip.jpg";
import portraitPhoto from "@/assets/portrait.jpg";
import "./portfolio.css";

/* ═══════════════════════ shared bits ═══════════════════════ */

function cl(v: number, a: number, b: number) {
  return v < a ? a : v > b ? b : v;
}
function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}
function ease(t: number) {
  return 1 - Math.pow(1 - t, 3);
}
function mixColor(a: string, b: string, t: number) {
  const A = [parseInt(a.slice(1, 3), 16), parseInt(a.slice(3, 5), 16), parseInt(a.slice(5, 7), 16)];
  const B = [parseInt(b.slice(1, 3), 16), parseInt(b.slice(3, 5), 16), parseInt(b.slice(5, 7), 16)];
  return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i]!, t))).join(",")})`;
}

/**
 * Renders `\n`-delimited lines as a single inline element with real <br/>s.
 * Must stay a single element (not a Fragment of siblings) — the `.sh` shapes
 * are flex containers, so sibling elements would each become their own flex
 * item and lay out side by side instead of stacking as text.
 */
function Lines({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <span>
      {lines.map((line, i) => (
        <span key={i}>
          {line}
          {i < lines.length - 1 && <br />}
        </span>
      ))}
    </span>
  );
}

/** A screenshot slot: shows the real image once one is supplied, otherwise a labeled placeholder. Links out to the live site when `href` is set. */
function Shot({
  chrome,
  src,
  alt,
  label,
  dims = "1200 × 800",
  href,
}: {
  chrome: string;
  src?: string;
  alt: string;
  label: string;
  dims?: string;
  href?: string;
}) {
  const body = (
    <>
      <div className="chr">
        <i /> <i /> <i />
        <span>{chrome}</span>
      </div>
      {src ? (
        <img className="shot-img" src={src} alt={alt} width={1200} height={800} loading="lazy" />
      ) : (
        <div className="ph">
          <b>Screenshot slot</b>
          {label} · {dims}
        </div>
      )}
    </>
  );

  if (href) {
    return (
      <a
        className="shot shot-live"
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Visit ${chrome} (opens in a new tab)`}
      >
        {body}
      </a>
    );
  }

  return <div className="shot">{body}</div>;
}

/** A drawer that auto-sizes to its (possibly changing) content while open. */
function Drawer({ open, children }: { open: boolean; children: ReactNode }) {
  const innerRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState(0);

  useEffect(() => {
    const el = innerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setContentHeight(el.scrollHeight));
    ro.observe(el);
    setContentHeight(el.scrollHeight);
    return () => ro.disconnect();
  }, []);

  return (
    <div className="drawer" style={{ maxHeight: open ? contentHeight + 40 : 0 }}>
      <div className="in" ref={innerRef}>
        {children}
      </div>
    </div>
  );
}

/* ═══════════════════════ scroll stage: chaos → sorted ═══════════════════════ */

type ShapeKind =
  | "note"
  | "circ"
  | "blob"
  | "pill"
  | "card"
  | "tape"
  | "torn"
  | "polaroid"
  | "tab"
  | "hl"
  | "star"
  | "sq";
type Shape = {
  k: ShapeKind;
  t: string;
  c?: string;
  ac?: string;
  x: number;
  y: number;
  r: number;
  cat: 0 | 1 | 2 | 3;
};

const PALETTE = {
  peach: "#F2B183",
  lav: "#C7C1F7",
  sky: "#9DC9F2",
  pink: "#F3A8BF",
  mint: "#A2DCC3",
  butter: "#F6D274",
};

const SHAPES: Shape[] = [
  // 0 — figuring it out
  { k: "note", t: "Chemical\nengineering", c: PALETTE.sky, x: 14, y: 20, r: -8, cat: 0 },
  { k: "circ", t: "Cold email\nnumber 37", c: PALETTE.butter, x: 30, y: 74, r: 5, cat: 0 },
  { k: "hl", t: "no roadmap", ac: PALETTE.butter, x: 76, y: 14, r: 6, cat: 0 },
  {
    k: "torn",
    t: "Learned MCP\nfrom scratch",
    c: "#fff",
    ac: PALETTE.sky,
    x: 88,
    y: 58,
    r: -5,
    cat: 0,
  },
  { k: "tape", t: "figure it out", c: PALETTE.peach, x: 8, y: 48, r: -14, cat: 0 },

  // 1 — structuring the mess
  { k: "card", t: "Big Four\nconsulting", ac: PALETTE.lav, x: 22, y: 40, r: 3, cat: 1 },
  { k: "tab", t: "regulatory risk", c: PALETTE.lav, x: 64, y: 86, r: 4, cat: 1 },
  { k: "note", t: "Ask the obvious\nquestion", c: PALETTE.mint, x: 46, y: 16, r: -6, cat: 1 },
  { k: "blob", t: "voice note\n→ plan", c: PALETTE.pink, x: 84, y: 34, r: 7, cat: 1 },
  { k: "sq", t: "12 sheets,\n1 system", c: PALETTE.sky, x: 38, y: 92, r: -4, cat: 1 },

  // 2 — building the thing
  { k: "polaroid", t: "schooltrips", ac: PALETTE.lav, x: 70, y: 48, r: -7, cat: 2 },
  { k: "note", t: "Ten years,\nstate orchestra", c: PALETTE.pink, x: 54, y: 62, r: 8, cat: 2 },
  { k: "circ", t: "shipped it", c: PALETTE.mint, x: 94, y: 80, r: -6, cat: 2 },
  { k: "pill", t: "Claude Code, Cursor, Vercel", x: 16, y: 88, r: 6, cat: 2 },
  { k: "star", t: "✳", ac: PALETTE.peach, x: 60, y: 34, r: 0, cat: 2 },

  // 3 — making myself unnecessary
  { k: "note", t: "She edits it\nherself", c: PALETTE.peach, x: 34, y: 56, r: -5, cat: 3 },
  { k: "circ", t: "0 lines of\ncode, hers", c: PALETTE.lav, x: 6, y: 66, r: 4, cat: 3 },
  { k: "tape", t: "playbooks that outlive me", c: PALETTE.mint, x: 78, y: 70, r: 9, cat: 3 },
  { k: "card", t: "Automated\nthe inbox", ac: PALETTE.butter, x: 50, y: 82, r: 5, cat: 3 },
  { k: "hl", t: "never needed again", ac: PALETTE.pink, x: 90, y: 22, r: -6, cat: 3 },
];

const COLS = [
  { h: "Figuring it out", s: "Give me the thing nobody has defined yet." },
  { h: "Structuring the mess", s: "Ambiguity in, shape out." },
  { h: "Building the thing", s: "I ship it, not a recommendation of it." },
  { h: "Making myself unnecessary", s: "It keeps running when I leave the room." },
];

const COL_BOX_COLORS = ["#eaf3fc", "#f1effc", "#eaf7f0", "#fdf0e4"];

type Target = { x: number; y: number; s: number };

function ShapeEl({ shape, elRef }: { shape: Shape; elRef: (el: HTMLDivElement | null) => void }) {
  const style: React.CSSProperties & Record<string, string> = {};
  if (shape.c) style.background = shape.c;
  if (shape.ac) style["--ac"] = shape.ac;

  return (
    <div ref={elRef} className={`sh ${shape.k}`} style={style}>
      {shape.k === "polaroid" ? (
        <>
          <div className="sq" style={{ background: shape.ac ?? PALETTE.lav }} />
          <span>{shape.t}</span>
        </>
      ) : shape.k === "hl" ? (
        <b>{shape.t}</b>
      ) : (
        <Lines text={shape.t} />
      )}
    </div>
  );
}

const INTRO_BEATS = [
  "Four years of chemical engineering.",
  "Ten years in a state orchestra.",
  "Then Big Four consulting.",
];

function ScrollStage() {
  const stageRef = useRef<HTMLElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const fieldRef = useRef<HTMLDivElement>(null);
  const colsRef = useRef<HTMLDivElement>(null);
  const stageCopyRef = useRef<HTMLDivElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const cueRef = useRef<HTMLDivElement>(null);
  const sortedTitleRef = useRef<HTMLDivElement>(null);
  const shapeRefs = useRef<Array<HTMLDivElement | null>>([]);
  const headRefs = useRef<Array<HTMLDivElement | null>>([]);
  const colBoxesRef = useRef<HTMLDivElement>(null);
  const boxRefs = useRef<Array<HTMLDivElement | null>>([]);

  const [showBeats, setShowBeats] = useState(true);
  const [beatText, setBeatText] = useState("");

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShowBeats(false);
      return;
    }

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    function finish() {
      if (cancelled) return;
      cancelled = true;
      clearTimeout(timer);
      setShowBeats(false);
    }

    function typeBeat(beatIndex: number) {
      if (cancelled) return;
      if (beatIndex >= INTRO_BEATS.length) {
        timer = setTimeout(finish, 250);
        return;
      }
      const text = INTRO_BEATS[beatIndex]!;
      let i = 0;
      const tick = () => {
        if (cancelled) return;
        i++;
        setBeatText(text.slice(0, i));
        if (i < text.length) {
          timer = setTimeout(tick, 28);
        } else {
          timer = setTimeout(() => {
            if (cancelled) return;
            setBeatText("");
            typeBeat(beatIndex + 1);
          }, 480);
        }
      };
      tick();
    }

    typeBeat(0);
    addEventListener("scroll", finish, { passive: true, once: true });
    addEventListener("wheel", finish, { passive: true, once: true });
    addEventListener("touchstart", finish, { passive: true, once: true });
    addEventListener("pointerdown", finish, { passive: true, once: true });

    return () => {
      cancelled = true;
      clearTimeout(timer);
      removeEventListener("scroll", finish);
      removeEventListener("wheel", finish);
      removeEventListener("touchstart", finish);
      removeEventListener("pointerdown", finish);
    };
  }, []);

  useEffect(() => {
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const stage = stageRef.current!;
    const sticky = stickyRef.current!;
    const stageCopy = stageCopyRef.current!;
    const intro = introRef.current!;
    const cue = cueRef.current!;
    const cols = colsRef.current!;
    const sortedTitle = sortedTitleRef.current!;
    const els = shapeRefs.current;
    const heads = headRefs.current;
    const colBoxes = colBoxesRef.current!;
    const boxes = boxRefs.current;

    let W = 0;
    let H = 0;
    let wide = false;
    let targets: Array<Target | undefined> = [];
    const sizes: Array<{ w: number; h: number }> = SHAPES.map(() => ({ w: 120, h: 60 }));

    function layout() {
      W = sticky.clientWidth;
      H = sticky.clientHeight;
      wide = W >= 900;
      targets = [];
      const perCat: number[][] = [[], [], [], []];
      SHAPES.forEach((s, i) => perCat[s.cat]!.push(i));

      if (wide) {
        const headY = H * 0.3;
        const rowH = Math.min(74, (H * 0.52) / 5);
        perCat.forEach((list, ci) => {
          const cx = W * (0.145 + ci * 0.237);
          const head = heads[ci];
          if (head) {
            const w = Math.min(W * 0.21, 230);
            head.style.left = `${cx}px`;
            head.style.top = `${headY - 64}px`;
            head.style.width = `${w}px`;
            head.style.marginLeft = `${-w / 2}px`;
            head.style.transform = "translate(0,0)";
          }
          list.forEach((i, ri) => {
            targets[i] = { x: cx, y: headY + 40 + ri * rowH, s: 0.78 };
          });
          const box = boxes[ci];
          if (box) {
            const boxW = Math.min(W * 0.21, 230) + 48;
            const lastY = headY + 40 + (list.length - 1) * rowH;
            const boxTop = headY - 86;
            box.style.left = `${cx - boxW / 2}px`;
            box.style.top = `${boxTop}px`;
            box.style.width = `${boxW}px`;
            box.style.height = `${lastY + 62 - boxTop}px`;
          }
        });
      } else {
        const bandH = Math.min(112, (H * 0.6) / 4);
        const top = H * 0.26;
        perCat.forEach((list, ci) => {
          const by = top + ci * bandH;
          const head = heads[ci];
          if (head) {
            const w = Math.min(W * 0.9, 360);
            head.style.left = `${W * 0.5}px`;
            head.style.top = `${by - 26}px`;
            head.style.width = `${w}px`;
            head.style.marginLeft = `${-w / 2}px`;
          }
          const slots = [0.22, 0.5, 0.78];
          list.forEach((i, ri) => {
            const col = ri % 3;
            const row = Math.floor(ri / 3);
            targets[i] = { x: W * slots[col]!, y: by + 22 + row * 30, s: 0.42 };
          });
          const box = boxes[ci];
          if (box) {
            const rows = Math.ceil(list.length / 3);
            const boxW = Math.min(W * 0.94, 380);
            const boxTop = by - 46;
            box.style.left = `${W / 2 - boxW / 2}px`;
            box.style.top = `${boxTop}px`;
            box.style.width = `${boxW}px`;
            box.style.height = `${22 + rows * 30 + 66}px`;
          }
        });
      }
      els.forEach((el, i) => {
        if (el) sizes[i] = { w: el.offsetWidth, h: el.offsetHeight };
      });
    }

    layout();
    const layoutTimer = setTimeout(layout, 60);
    document.fonts?.ready.then(layout);
    addEventListener("resize", layout);

    let mx = 0,
      my = 0,
      cx = 0,
      cy = 0;
    function onMouseMove(e: MouseEvent) {
      mx = e.clientX / innerWidth - 0.5;
      my = e.clientY / innerHeight - 0.5;
    }
    if (!reduce) addEventListener("mousemove", onMouseMove, { passive: true });

    let raf = 0;
    function frame(now: number) {
      cx += (mx - cx) * 0.07;
      cy += (my - cy) * 0.07;
      const rect = stage.getBoundingClientRect();
      const total = stage.offsetHeight - innerHeight;
      const sp = cl(-rect.top / total, 0, 1);

      if (rect.bottom > 0 && rect.top < innerHeight) {
        const sort = ease(cl((sp - 0.2) / 0.42, 0, 1));
        const bg = mixColor("#16161A", "#FAF6EF", sort);
        sticky.style.setProperty("--stagebg", bg);

        const introFade = 1 - cl(sp / 0.16, 0, 1);
        stageCopy.style.opacity = introFade.toFixed(3);
        intro.style.transform = `translateY(${(-cl(sp / 0.16, 0, 1) * 26).toFixed(1)}px)`;
        intro.style.setProperty("--wd", (100 - cl(sp / 0.2, 0, 1) * 22).toFixed(0));
        cue.style.opacity = (1 - cl(sp / 0.1, 0, 1)).toFixed(2);
        cols.style.opacity = cl((sort - 0.42) / 0.42, 0, 1).toFixed(3);
        const boxPop = ease(cl((sort - 0.5) / 0.4, 0, 1));
        colBoxes.style.opacity = boxPop.toFixed(3);
        colBoxes.style.transform = `translateY(${((1 - boxPop) * 14).toFixed(1)}px) scale(${(0.94 + boxPop * 0.06).toFixed(3)})`;
        sortedTitle.style.transform = `translateY(${((1 - cl((sort - 0.3) / 0.5, 0, 1)) * -16).toFixed(1)}px)`;

        for (let i = 0; i < els.length; i++) {
          const el = els[i];
          const t = targets[i];
          if (!el || !t) continue;
          const shape = SHAPES[i]!;
          const { w, h } = sizes[i]!;
          const stag = cl((sort - (i % 5) * 0.05) / 0.72, 0, 1);
          const k = ease(stag);
          const cxp = (shape.x / 100) * W;
          const cyp = (shape.y / 100) * H;
          const depth = 0.45 + (i % 5) * 0.3;
          const driftX = (!reduce ? cx * 44 * depth : 0) * (1 - k);
          const driftY = (!reduce ? cy * 34 * depth : 0) * (1 - k);
          const idlePhase = now / 900 + i * 1.7;
          const idleX = (!reduce ? Math.sin(idlePhase) * 5 * depth : 0) * (1 - k);
          const idleY = (!reduce ? Math.cos(idlePhase * 0.8) * 6 * depth : 0) * (1 - k);
          const tilt = !reduce ? cx * 9 * depth + Math.sin(idlePhase * 0.6) * 2.5 : 0;
          const X = lerp(cxp, t.x, k) + driftX + idleX - w / 2;
          const Y = lerp(cyp, t.y, k) + driftY + idleY - h / 2;
          const R = lerp(shape.r + tilt, 0, k);
          const S = lerp(1, t.s, k);
          el.style.transform = `translate3d(${X.toFixed(1)}px,${Y.toFixed(1)}px,0) rotate(${R.toFixed(2)}deg) scale(${S.toFixed(3)})`;
          if (shape.k === "pill" || shape.k === "hl") {
            el.style.color = mixColor("#FAF6EF", "#16161A", sort);
          }
        }
      }
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);

    return () => {
      clearTimeout(layoutTimer);
      removeEventListener("resize", layout);
      removeEventListener("mousemove", onMouseMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section id="stage" ref={stageRef}>
      <div className="sticky" ref={stickyRef}>
        <div className="col-boxes" ref={colBoxesRef}>
          {COL_BOX_COLORS.map((color, i) => (
            <div
              className="col-box"
              key={i}
              ref={(el) => {
                boxRefs.current[i] = el;
              }}
              style={{ background: color }}
            />
          ))}
        </div>
        <div className="field" ref={fieldRef}>
          {SHAPES.map((shape, i) => (
            <ShapeEl
              key={i}
              shape={shape}
              elRef={(el) => {
                shapeRefs.current[i] = el;
              }}
            />
          ))}
        </div>

        <div className="cols" ref={colsRef}>
          {COLS.map((c, i) => (
            <div
              className="col-h"
              key={c.h}
              ref={(el) => {
                headRefs.current[i] = el;
              }}
            >
              <i />
              <h3>{c.h}</h3>
              <p>{c.s}</p>
            </div>
          ))}
          <div className="sorted-title" ref={sortedTitleRef}>
            <h2 className="d2">What I bring to the table</h2>
            <p>Same pieces. I just know where they go now.</p>
          </div>
        </div>

        <div className="stage-copy" ref={stageCopyRef}>
          <div className="intro" ref={introRef}>
            {showBeats ? (
              <h1 className="d1 beat">
                {beatText}
                <span className="caret" />
              </h1>
            ) : (
              <>
                <h1 className="d1 beat-done">
                  None of this
                  <br />
                  was a plan.
                </h1>
                <p>
                  Engineering, an orchestra, a consulting job, an inbox nobody wanted. Keep
                  scrolling. It adds up.
                </p>
              </>
            )}
          </div>
        </div>

        <div className="cue" ref={cueRef}>
          <span>Scroll</span>
          <i />
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════ path ═══════════════════════ */

const STEPS = [
  {
    yr: "First",
    title: "Chemical engineering",
    body: "Four years of being taught that everything is a system with inputs, failure points and a bottleneck. I still think this way about every product.",
  },
  {
    yr: "Ten years",
    title: "State orchestra",
    body: "A decade of practising something until it is genuinely right, in time with forty other people. Nothing has taught me more about shipping.",
  },
  {
    yr: "Three years",
    title: "Big Four consulting",
    body: "Handed problems with no shape and asked to return structure. Learned to ask the obvious question everyone else had skipped.",
  },
  {
    yr: "2024",
    title: "Remote assistant",
    body: "Cold-emailed a stack of companies. One hired me for admin, then made the mistake of asking what I thought.",
  },
  {
    yr: "2025",
    title: "Builder",
    body: "Websites, automations, a product of my own. The admin stopped being the job.",
  },
  {
    yr: "Now",
    title: "Cofounder",
    body: "Nobody promoted me. I kept building until the job title was wrong.",
    now: true,
  },
];

const STEP_COLORS = ["#dbe9fa", "#e2dffb", "#fbdce5", "#fadfc8", "#dcf0e7", "#faeec0"];

function PathSection() {
  return (
    <section id="path" className="light">
      <div className="wrap">
        <p className="eyebrow rv">Not the LinkedIn version</p>
        <h2 className="d2 rv">
          Six jobs. One
          <br />
          <span className="it" style={{ fontFamily: "var(--pf-text)", fontWeight: 400 }}>
            through-line.
          </span>
        </h2>
      </div>
      <div className="wrap">
        <div className="steps">
          {STEPS.map((step, i) => (
            <div
              className={`step rv${step.now ? " now" : ""}`}
              key={step.title}
              style={{ background: STEP_COLORS[i % STEP_COLORS.length] }}
            >
              <div className="dot">{i + 1}</div>
              <div className="yr">{step.yr}</div>
              <h4 className="d4">{step.title}</h4>
              <p>{step.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════ work ═══════════════════════ */

type Dest = "Shandong" | "Hanoi" | "Kyoto";
const DESTS: Dest[] = ["Shandong", "Hanoi", "Kyoto"];
const DAY_OPTIONS = [3, 5, 7] as const;
const YEAR_GROUPS = ["Y7–9", "Y10–11", "Y12–13"] as const;

const PLANS: Record<Dest, Array<[string, string, string]>> = {
  Shandong: [
    ["Day 1", "Arrive Ji'nan, orientation and safety brief", "Coach 90 min, buffer built in"],
    ["Day 2", "Yishui geology site, guided caves", "Maps to KS4 earth science"],
    ["Day 3", "Linyi community project, student-led", "Assessed reflection task"],
    ["Day 4", "Mountain hike, resilience day", "Weather contingency included"],
    ["Day 5", "Debrief and departure", "Parent report generated"],
    ["Day 6", "Coastal fieldwork extension", "Optional add-on"],
    ["Day 7", "Free study and fly out", "Evidence pack for SLT"],
  ],
  Hanoi: [
    ["Day 1", "Arrive, Old Quarter orientation walk", "Kept light for day one"],
    ["Day 2", "Museum of Ethnology fieldwork", "Worksheet pack attached"],
    ["Day 3", "Rural homestay, service learning", "Risk assessment pre-filled"],
    ["Day 4", "Ha Long day trip", "Travel time flagged as long"],
    ["Day 5", "Student presentations, fly out", "Evidence pack for SLT"],
    ["Day 6", "Craft village workshop", "Small-group split"],
    ["Day 7", "Reflection day", "Summary sent to parents"],
  ],
  Kyoto: [
    ["Day 1", "Arrive, temple district orientation", "Jet lag day, kept gentle"],
    ["Day 2", "Fushimi Inari early start", "6:45am beats the crowds"],
    ["Day 3", "Craft workshop, hands-on", "Groups of four"],
    ["Day 4", "Nara day trip", "The deer will take the worksheets"],
    ["Day 5", "Reflection and departure", "Summary sent to parents"],
    ["Day 6", "Arashiyama fieldwork", "Optional"],
    ["Day 7", "Student showcase", "Evidence pack"],
  ],
};

function OptionPills<T extends string | number>({
  options,
  value,
  onChange,
}: {
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="opts">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          className={`opt${opt === value ? " on" : ""}`}
          onClick={() => onChange(opt)}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

function SchoolTripsDrawer() {
  const [dest, setDest] = useState<Dest>("Shandong");
  const [days, setDays] = useState<(typeof DAY_OPTIONS)[number]>(5);
  const [yearGroup, setYearGroup] = useState<(typeof YEAR_GROUPS)[number]>("Y10–11");
  const [plan, setPlan] = useState<{
    dest: Dest;
    days: number;
    yearGroup: string;
    revealed: number;
  } | null>(null);

  function generate() {
    setPlan({ dest, days, yearGroup, revealed: 0 });
  }

  useEffect(() => {
    if (!plan) return;
    const total = Math.min(plan.days, PLANS[plan.dest].length);
    if (plan.revealed >= total) return;
    const timer = setTimeout(
      () => setPlan((p) => (p ? { ...p, revealed: p.revealed + 1 } : p)),
      85,
    );
    return () => clearTimeout(timer);
  }, [plan]);

  return (
    <>
      <p className="dlbl">Destination</p>
      <OptionPills options={DESTS} value={dest} onChange={setDest} />
      <p className="dlbl">Days</p>
      <OptionPills options={DAY_OPTIONS} value={days} onChange={setDays} />
      <p className="dlbl">Year group</p>
      <OptionPills options={YEAR_GROUPS} value={yearGroup} onChange={setYearGroup} />
      <button className="gen" type="button" onClick={generate}>
        Generate itinerary
      </button>
      {plan && (
        <div style={{ marginTop: 14 }}>
          <p className="dlbl">
            {plan.dest} · {plan.days} days · {plan.yearGroup}
          </p>
          {PLANS[plan.dest].slice(0, Math.min(plan.days, PLANS[plan.dest].length)).map((row, i) => (
            <div className={`day${i < plan.revealed ? " in" : ""}`} key={row[0]}>
              <div className="d">{row[0]}</div>
              <div className="t">
                {row[1]}
                <small>{row[2]}</small>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

const HANNAH_TITLES = [
  "New work, autumn collection",
  "Studio sale, three pieces left",
  "Commissions open for spring",
  "Back from the kiln, finally",
];
const HANNAH_PRICES = ["From £480", "From £520", "From £610", "Price on request"];
const HANNAH_PALETTES = [
  { colors: ["#8B5CF6", "#F2B183", "#4F46E5"] },
  { colors: ["#0F766E", "#A2DCC3", "#134E4A"] },
  { colors: ["#9D174D", "#F3A8BF", "#3B0764"] },
];

function HannahDrawer() {
  const [titleIndex, setTitleIndex] = useState(0);
  const [priceIndex, setPriceIndex] = useState(0);
  const [paletteIndex, setPaletteIndex] = useState(0);
  const [offersOn, setOffersOn] = useState(true);
  const [emailOn, setEmailOn] = useState(true);
  const [titleVisible, setTitleVisible] = useState(true);

  function nextTitle() {
    setTitleVisible(false);
    setTimeout(() => {
      setTitleIndex((i) => (i + 1) % HANNAH_TITLES.length);
      setTitleVisible(true);
    }, 150);
  }

  return (
    <div className="hgrid">
      <div className="hsite">
        <h4 style={{ opacity: titleVisible ? 1 : 0 }}>{HANNAH_TITLES[titleIndex]}</h4>
        <div className="hs">Original paintings · commissions open</div>
        <div className="canvasrow">
          {HANNAH_PALETTES[paletteIndex]!.colors.map((c, i) => (
            <div key={i} style={{ background: c }} />
          ))}
        </div>
        <div className="pr">{HANNAH_PRICES[priceIndex]}</div>
        {offersOn && <span className="bd">Accepting offers</span>}
      </div>
      <div className="hdash">
        <div className="r">
          <label>Headline</label>
          <button className="pill" type="button" onClick={nextTitle}>
            Change
          </button>
        </div>
        <div className="r">
          <label>Palette</label>
          <div className="sws">
            {HANNAH_PALETTES.map((p, i) => (
              <span
                key={i}
                className={`sw${i === paletteIndex ? " sel" : ""}`}
                style={{ background: `linear-gradient(90deg,${p.colors[0]},${p.colors[2]})` }}
                onClick={() => setPaletteIndex(i)}
              />
            ))}
          </div>
        </div>
        <div className="r">
          <label>Pricing</label>
          <button
            className="pill"
            type="button"
            onClick={() => setPriceIndex((i) => (i + 1) % HANNAH_PRICES.length)}
          >
            Update
          </button>
        </div>
        <div className="r">
          <label>Offers</label>
          <button
            className={`pill${offersOn ? " on" : ""}`}
            type="button"
            onClick={() => setOffersOn((v) => !v)}
          >
            {offersOn ? "On" : "Off"}
          </button>
        </div>
        <div className="r">
          <label>Submission emails</label>
          <button
            className={`pill${emailOn ? " on" : ""}`}
            type="button"
            onClick={() => setEmailOn((v) => !v)}
          >
            {emailOn ? "Automated" : "Manual"}
          </button>
        </div>
        <p className="hnote">
          This is her dashboard, not mine. She ships the changes; I don't get a text at 11pm.
        </p>
      </div>
    </div>
  );
}

function WorkSection() {
  const [schoolTripsOpen, setSchoolTripsOpen] = useState(false);
  const [hannahOpen, setHannahOpen] = useState(false);

  return (
    <section id="work" className="light">
      <div className="wrap">
        <p className="eyebrow rv">The receipts</p>

        <article className="proj lav rv">
          <h3 className="d3">SchoolTrips.ai</h3>
          <div className="pmeta">Cofounder · product and build · 2025 to now</div>
          <div className="prow" style={{ marginTop: 16 }}>
            <div>
              <p className="pbody">
                An AI trip planner underneath, a teacher network on top. Teachers find trips, review
                them, and pass on the things that never make it into a brochure.
              </p>
              <div className="ptags">
                <span className="ptag">Claude API</span>
                <span className="ptag">MCP</span>
                <span className="ptag">product strategy</span>
                <span className="ptag">live beta</span>
              </div>
              <div className="tryrow">
                <button
                  className="trybtn"
                  type="button"
                  onClick={() => setSchoolTripsOpen((v) => !v)}
                >
                  Try the planner
                </button>
                <span className="live">
                  <i /> Live beta
                </span>
              </div>
            </div>
            <Shot
              chrome="schooltrips.ai"
              src={schoolTripsDashboard}
              alt="SchoolTrips.ai dashboard"
              label="SchoolTrips dashboard"
              href="https://demo.schooltrips.ai"
            />
          </div>
          <Drawer open={schoolTripsOpen}>
            <SchoolTripsDrawer />
          </Drawer>
        </article>

        <article className="proj peach rv">
          <h3 className="d3">Hannah Jackson</h3>
          <div className="pmeta">Artist website and self-serve dashboard · client</div>
          <div className="prow" style={{ marginTop: 16 }}>
            <div>
              <p className="pbody">
                She asked for a website. I built her a dashboard instead, so she could change her
                own work, prices and offers without me. She paid 50% over my quote. Not needing me
                was worth more than the site was.
              </p>
              <div className="ptags">
                <span className="ptag">full build</span>
                <span className="ptag">custom CMS</span>
                <span className="ptag">bidding flow</span>
                <span className="ptag">email automation</span>
              </div>
              <div className="tryrow">
                <button className="trybtn" type="button" onClick={() => setHannahOpen((v) => !v)}>
                  Use her dashboard
                </button>
                <span className="live">
                  <i /> Interactive
                </span>
              </div>
            </div>
            <Shot
              chrome="byhannahjackson.com"
              src={hannahHome}
              alt="Hannah Jackson artist site homepage"
              label="Artist site homepage"
              href="https://byhannahjackson.com"
            />
          </div>
          <Drawer open={hannahOpen}>
            <HannahDrawer />
          </Drawer>
        </article>

        <article className="proj pink rv">
          <h3 className="d3">The Lunar Playground</h3>
          <div className="pmeta">Solo product · built, priced, launched, ran</div>
          <div className="prow" style={{ marginTop: 16 }}>
            <div>
              <p className="pbody">
                A digital product business from nothing: architecture, content engine, pricing,
                checkout, launch. It taught me the difference between what sells and what merely
                looks finished.
              </p>
              <div className="ptags">
                <span className="ptag">solo build</span>
                <span className="ptag">monetisation</span>
                <span className="ptag">Claude Code</span>
              </div>
              <div className="tryrow">
                <a
                  className="trybtn"
                  style={{ textDecoration: "none", display: "inline-block" }}
                  href="https://thelunarplayground.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Visit the site
                </a>
              </div>
            </div>
            <Shot
              chrome="thelunarplayground.com"
              src={lunarPlaygroundHome}
              alt="The Lunar Playground homepage"
              label="Lunar Playground"
              href="https://thelunarplayground.com"
            />
          </div>
        </article>

        <article className="proj mint rv">
          <h3 className="d3">Trip operations, in the field</h3>
          <div className="pmeta">Trip leader, then rebuilt the systems behind it</div>
          <div className="prow" style={{ marginTop: 16 }}>
            <div>
              <p className="pbody">
                Led Year 12 groups through Shandong, then went home and rebuilt the planning, risk
                and feedback systems around what actually broke on the ground.
              </p>
              <div className="ptags">
                <span className="ptag">operations</span>
                <span className="ptag">field research</span>
                <span className="ptag">systems</span>
              </div>
            </div>
            <Shot
              chrome="Shandong"
              src={shandongTrip}
              alt="Students crossing a glass bridge on a school trip in Shandong"
              label="You, on a trip"
            />
          </div>
        </article>
      </div>
    </section>
  );
}

/* ═══════════════════════ playground ═══════════════════════ */

const TILES = [
  {
    color: PALETTE.peach,
    title: "Career Compass",
    body: "Turns career history into evidence, then scores it against the role you actually want.",
    status: "In progress",
    href: "https://github.com/ashleighchua/Career-Compass",
  },
  {
    color: PALETTE.sky,
    title: "Clarity",
    body: "Turns a raw spec into documentation nobody dreads reading.",
    status: "Live",
    href: "https://clarity-henna.vercel.app",
  },
  {
    color: PALETTE.lav,
    title: "Celestial",
    body: "Five systems, one profile, an AI reading at the end.",
    status: "Live",
    href: "https://astrology-app-hazel.vercel.app",
  },
  {
    color: PALETTE.pink,
    title: "Fruition Passport",
    body: "See what fruit is actually in season, anywhere.",
    status: "Live",
    href: "https://fruition-passport.ashleighchua.workers.dev",
  },
  {
    color: PALETTE.mint,
    title: "Mandarin survival kit",
    body: "Drills for real conversations, not ordering coffee I don't drink.",
    status: "Live",
    href: "https://mandarin-survival-kit.vercel.app",
  },
  {
    color: PALETTE.butter,
    title: "Remote job tracker",
    body: "Scrapes remote listings daily, mails itself a clean shortlist.",
    status: "In use",
    href: "https://github.com/ashleighchua/remote-job-tracker",
  },
  {
    color: PALETTE.peach,
    title: "Trading dashboard",
    body: "Journals trades and checks whether my own signals hold up.",
    status: "In use",
    href: "https://github.com/ashleighchua/trading-dashboard",
  },
  {
    color: PALETTE.sky,
    title: "Reddit monitor",
    body: "Drafts Reddit replies for The Lunar Playground. I approve every one.",
    status: "In use",
    href: "https://github.com/ashleighchua/lunar-reddit-monitor",
  },
];

function PlaygroundSection() {
  return (
    <section id="play" className="light">
      <div className="wrap">
        <p className="eyebrow rv">Nobody asked for these</p>
        <h2 className="d2 rv">
          Built after hours,
          <br />
          <span className="it" style={{ fontFamily: "var(--pf-text)", fontWeight: 400 }}>
            mostly out of curiosity.
          </span>
        </h2>
        <p className="read rv" style={{ marginTop: 18 }}>
          Every tile here is live. Click through to the actual site, not a screenshot of one.
        </p>
        <div className="tiles">
          {TILES.map((tile) => (
            <a
              className="tile rv"
              key={tile.title}
              href={tile.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="dt" style={{ background: tile.color }} />
              <b>{tile.title}</b>
              <span>{tile.body}</span>
              <div className="st">{tile.status}</div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════ about ═══════════════════════ */

function AboutSection() {
  return (
    <section id="about" className="light">
      <div className="wrap">
        <p className="eyebrow rv">Off the clock</p>
        <div className="ab">
          <div className="rv">
            <div className="polaroid-big">
              <img src={portraitPhoto} alt="Ashleigh" width={620} height={775} loading="lazy" />
              <p>Usually somewhere with bad wifi and a good idea.</p>
            </div>
          </div>
          <div>
            <h2 className="d2 rv">
              Happiest in the middle of
              <br />
              something complicated.
            </h2>
            <p className="read rv" style={{ marginTop: 18 }}>
              I'm a generalist. Engineering gave me systems, the orchestra gave me ten years of
              practice and timing, consulting gave me structure. Building is where all three finally
              became useful at once.
            </p>
            <div className="now">
              <div className="rv">
                <b>Right now</b> SchoolTrips.ai is eating most of my week, on purpose
              </div>
              <div className="rv">
                <b>Also</b> figuring out exactly where AI stops and a human has to take over
              </div>
              <div className="rv">
                <b>Home base</b> wherever the wifi is decent, rarely the same time zone twice
              </div>
              <div className="rv">
                <b>Confession</b> twelve tabs open, three of them matter
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════ contact ═══════════════════════ */

function ContactSection() {
  return (
    <section id="contact">
      <div className="wrap">
        <p className="was">They hired me to do the admin</p>
        <h2 className="d1">
          Now I
          <br />
          build things.
        </h2>
        <p className="ask">Got something you want built?</p>
        <a className="cta" href="mailto:hello@ashleighchua.com?subject=the%20messy%20thing">
          Let's make it real
        </a>
        <div className="foot">
          <a href="mailto:hello@ashleighchua.com">Email</a>
          <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer">
            LinkedIn
          </a>
          <span>No polished brief required</span>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════ reveal-on-scroll ═══════════════════════ */

function useRevealOnScroll(rootRef: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const els = Array.from(root.querySelectorAll<HTMLElement>(".rv"));
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -6% 0px" },
    );
    els.forEach((el, i) => {
      el.style.transitionDelay = `${(i % 3) * 70}ms`;
      io.observe(el);
    });
    return () => io.disconnect();
  }, [rootRef]);
}

/* ═══════════════════════ page ═══════════════════════ */

export function PortfolioPage() {
  const rootRef = useRef<HTMLDivElement>(null);
  useRevealOnScroll(rootRef);

  return (
    <div className="pf" ref={rootRef}>
      <nav id="nav">
        <span>Ashleigh Chua</span>
        <span className="lk">
          <a href="#work">Work</a>
          <a href="#path">Path</a>
          <a href="#play">Playground</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
        </span>
      </nav>

      <ScrollStage />

      <svg className="clouds" viewBox="0 0 1200 130" preserveAspectRatio="none" aria-hidden="true">
        <path
          fill="#F1EADE"
          d="M0,130 L0,78 Q50,28 100,72 Q150,18 200,70 Q250,24 300,74 Q350,20 400,68 Q450,26 500,72 Q550,16 600,70 Q650,28 700,74 Q750,18 800,68 Q850,26 900,72 Q950,20 1000,70 Q1050,28 1100,74 Q1150,24 1200,72 L1200,130 Z"
        />
      </svg>
      <svg className="clouds" viewBox="0 0 1200 110" preserveAspectRatio="none" aria-hidden="true">
        <path
          fill="#FAF6EF"
          d="M0,110 L0,66 Q60,14 120,62 Q180,10 240,58 Q300,16 360,64 Q420,8 480,60 Q540,18 600,62 Q660,10 720,58 Q780,16 840,64 Q900,8 960,60 Q1020,18 1080,62 Q1140,12 1200,60 L1200,110 Z"
        />
      </svg>

      <PathSection />
      <WorkSection />
      <PlaygroundSection />
      <AboutSection />
      <ContactSection />
    </div>
  );
}
