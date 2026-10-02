import { memo, useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { ArrowDown, Check, MapPin, Menu, X } from "lucide-react";
import portraitPhoto from "@/assets/portrait-birthday.jpg";
import stHome from "@/assets/st-home.jpg";
import stProblem from "@/assets/st-problem.jpg";
import hjPublic from "@/assets/hj-public.jpg";
import hjAdmin from "@/assets/hj-admin.jpg";
import { LunarPipeline, MoonMark, SceneArt, StickerFace, TableObject, type Look } from "./art";
import { CatSvg, type CatRefs } from "./cat";
import { GrowingStats } from "./GrowingStats";
import { Kitchen } from "./Kitchen";
import {
  COL,
  DSP,
  HISS,
  LINKS,
  HANNAH_REVIEWS,
  LUNAR_REVIEWS,
  MEOWS,
  MSP,
  OBJ,
  PATH,
  PIPELINE,
  PLAY,
  SH,
  RECEIPTS,
  STK,
  ZONES,
  ROLES,
  DECOR,
} from "./data";
import "./portfolio.css";

type StickerProps = {
  i: number;
  k: number;
  ko: number;
  refs: {
    post: React.MutableRefObject<(HTMLButtonElement | null)[]>;
    faceS: React.MutableRefObject<(HTMLDivElement | null)[]>;
    faceO: React.MutableRefObject<(HTMLDivElement | null)[]>;
    reshuffle: React.MutableRefObject<(() => void)[]>;
  };
  onPoke: (i: number) => void;
  onHover: (i: number) => void;
};

/** One hero sticker. Owns its colour/shape so a tap re-renders only this sticker, not the page. */
const Sticker = memo(function Sticker({ i, k, ko, refs, onPoke, onHover }: StickerProps) {
  const p = STK[i]!;
  const [look, setLook] = useState<Look>({ c: p.c, s: p.s });
  refs.reshuffle.current[i] = () =>
    setLook((L) => ({
      c: (L.c + 1 + Math.floor(Math.random() * (COL.length - 1))) % COL.length,
      s: (L.s + 1 + Math.floor(Math.random() * (SH.length - 1))) % SH.length,
    }));
  return (
    <button
      type="button"
      ref={(el) => {
        refs.post.current[i] = el;
      }}
      aria-label={p.label.replace("/", " ")}
      className="pf-post"
      onClick={() => onPoke(i)}
      onMouseEnter={() => onHover(i)}
    >
      <div
        className="pf-face"
        ref={(el) => {
          refs.faceS.current[i] = el;
        }}
      >
        <StickerFace i={i} look={look} k={k} />
      </div>
      <div
        className="pf-face"
        style={{ opacity: 0 }}
        ref={(el) => {
          refs.faceO.current[i] = el;
        }}
      >
        <TableObject objKey={p.obj} k={ko} />
      </div>
    </button>
  );
});

/** "Ashleigh Chua" with a crescent moon standing in for the C */
function Wordmark() {
  return (
    <span className="pf-wordmark" role="img" aria-label="Ashleigh Chua">
      Ashleigh <span className="pf-moon" />
      hua
    </span>
  );
}

/** A star rating out of five. The filled row is clipped to the score, so 4.3 reads as
 *  four stars and a bit rather than being rounded up to five. */
function Stars({ n }: { n: number }) {
  return (
    <span className="pf-stars" role="img" aria-label={`${n} out of 5 stars`}>
      <span className="pf-stars-on" style={{ width: `${(n / 5) * 100}%` }}>
        ★★★★★
      </span>
      ★★★★★
    </span>
  );
}

type Review = { quote: string; by: string; where?: string; stars?: number };

/** One review at a time, with arrows and dots to page through the rest */
function Reviews({ title, shop, list }: { title: string; shop: string; list: Review[] }) {
  const [idx, setIdx] = useState(0);
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    <div className="pf-rev">
      <div className="pf-rev-head">
        <h4>{title}</h4>
      </div>
      <div className="pf-rev-paged">
        {/* every receipt sits in the same cell, so the stack is as tall as the longest one */}
        <div className="pf-rev-stack">
          {list.map((r, i) => (
            <figure key={i} className="pf-rev-card" aria-hidden={i !== idx} data-on={i === idx}>
              <header className="pf-rc-top">
                <b>{shop}</b>
                <span>
                  Receipt no. {pad(i + 1)} / {pad(list.length)}
                </span>
              </header>
              {r.stars != null && <Stars n={r.stars} />}
              <blockquote>{r.quote}</blockquote>
              <figcaption>
                <span className="pf-rc-row">
                  <span>Customer</span>
                  <b>{r.by}</b>
                </span>
                {r.where && (
                  <span className="pf-rc-row">
                    <span>From</span>
                    <b>{r.where}</b>
                  </span>
                )}
              </figcaption>
              <footer className="pf-rc-foot">
                <span className="pf-rc-bars" aria-hidden />
                Thank you, come again
              </footer>
            </figure>
          ))}
        </div>
        <div className="pf-rev-nav">
          <button
            className="pf-rev-btn"
            aria-label="Previous review"
            onClick={() => setIdx((i) => (i - 1 + list.length) % list.length)}
          >
            ←
          </button>
          <span className="pf-rev-dots">
            {list.map((_, i) => (
              <button
                key={i}
                className={`pf-rev-dot${i === idx ? " pf-rev-dot--on" : ""}`}
                aria-label={`Review ${i + 1}`}
                onClick={() => setIdx(i)}
              />
            ))}
          </span>
          <button
            className="pf-rev-btn"
            aria-label="Next review"
            onClick={() => setIdx((i) => (i + 1) % list.length)}
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
}

/** the longest role sets the height of the typed line, so it fits exactly and never resizes */
const LONGEST_ROLE = `${ROLES.reduce((a, b) => (b.length > a.length ? b : a))}.`;

/** "I'm a ___" pill: types each word out, holds it, backspaces, then types the next.
 *  Renders the lead-in line too, so its "a"/"an" can follow the current word. */
function RotatingRole({ lead }: { lead: string }) {
  const [i, setI] = useState(0);
  const [n, setN] = useState(ROLES[0]!.length + 1);
  const [erasing, setErasing] = useState(false);
  const [still, setStill] = useState(true);
  const word = `${ROLES[i]}.`;
  useEffect(() => {
    setStill(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);
  useEffect(() => {
    if (still) return;
    let wait: number;
    let next: () => void;
    if (!erasing && n < word.length) {
      wait = 70 + Math.random() * 60;
      next = () => setN(n + 1);
    } else if (!erasing) {
      wait = 1400;
      next = () => setErasing(true);
    } else if (n > 0) {
      wait = 32;
      next = () => setN(n - 1);
    } else {
      wait = 250;
      next = () => {
        setErasing(false);
        setI((i + 1) % ROLES.length);
      };
    }
    const id = window.setTimeout(next, wait);
    return () => window.clearTimeout(id);
  }, [still, erasing, n, i, word.length]);
  const article = /^[aeiou]/i.test(ROLES[i]!) ? "an" : "a";
  return (
    <>
      <span aria-hidden="true">
        {lead} {article}
      </span>
      <span className="pf-role" aria-hidden="true">
        <span className="pf-role-sizer">{LONGEST_ROLE}</span>
        <span className="pf-role-word">
          {word.slice(0, n)}
          {!still && <span className="pf-caret" />}
        </span>
      </span>
    </>
  );
}

/* ── Config (the "props" from the design reference) ── */
const SHOW_CAT = true;
type CatMood = "sweet" | "aloof" | "grumpy";
const CAT_MOOD = "aloof" as CatMood;
const CAT_SPEED = 45; // px/s
const DRIFT = 14; // px
const MOBILE_BP = 760;
/** [ignore chance, hiss chance] per mood */
const MOODS: Record<CatMood, [number, number]> = {
  sweet: [0.15, 0.06],
  aloof: [0.4, 0.2],
  grumpy: [0.35, 0.42],
};

const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const back = (t: number) => {
  const c = 1.9;
  return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2);
};
const rnd = (a: number, b: number) => a + Math.random() * (b - a);

type Box = { cx: number; cy: number; hw: number; hh: number };
/** Positions relative to the page root, plus the viewport height the loop should
 *  treat as fixed. Re-measured on layout changes only. */
type Layout = {
  hx: number;
  hy: number;
  W: number;
  H: number;
  /** each sticker's landing spot relative to the root: centre, plus its top edge */
  slots: { tx: number; ty: number; top: number }[];
  /** timeline: its offset down the page and how far the track has to travel */
  tlTop: number;
  tlDist: number;
  vh: number;
};

/** Bounds of what's actually drawn in the hero text: the lines of text, not their (wider) boxes */
function inkBox(root: HTMLElement) {
  const b = { left: Infinity, right: -Infinity, top: Infinity, bottom: -Infinity };
  const add = (r: DOMRect) => {
    if (!r.width || !r.height) return;
    b.left = Math.min(b.left, r.left);
    b.right = Math.max(b.right, r.right);
    b.top = Math.min(b.top, r.top);
    b.bottom = Math.max(b.bottom, r.bottom);
  };
  const range = document.createRange();
  for (const child of Array.from(root.children)) {
    if (child.textContent?.trim()) {
      range.selectNodeContents(child);
      for (const r of Array.from(range.getClientRects())) add(r);
      if (child.classList.contains("pf-avail")) add(child.getBoundingClientRect());
    } else add(child.getBoundingClientRect());
  }
  return b.left === Infinity ? root.getBoundingClientRect() : b;
}

type Sim = {
  spot: number;
  sx: number;
  sy: number;
  jx: number;
  jy: number;
  rot: number;
  trot: number;
  pop: number;
  dip: number;
  ph: number;
  sp: number;
  init: boolean;
};
type CatState = {
  x: number;
  dir: number;
  mode: "walk" | "sit" | "hiss" | "zoom";
  until: number;
  nextSit: number;
  phase: number;
  flick: number;
};
type Bubble = { text: string; kind: "talk" | "hiss" | "ignore"; right: boolean } | null;

export function PortfolioPage() {
  const [mobile, setMobile] = useState(false);
  const [vw, setVw] = useState(1400);
  const [bubble, setBubble] = useState<Bubble>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  /** the fixed nav gets a background once the page has scrolled */
  const [navSolid, setNavSolid] = useState(false);
  useEffect(() => {
    const onScroll = () => setNavSolid(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const [hjView, setHjView] = useState<"public" | "admin">("public");
  /** Lunar pipeline teaser: -1 idle, 0..n-1 running step, n done */
  const [lunar, setLunar] = useState(-1);
  const lunarTimers = useRef<number[]>([]);

  /* DOM refs written to directly by the rAF loop */
  const rootRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const heroTextRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const tlBarRef = useRef<HTMLDivElement>(null);
  const postEls = useRef<(HTMLButtonElement | null)[]>([]);
  const slotEls = useRef<(HTMLDivElement | null)[]>([]);
  const faceS = useRef<(HTMLDivElement | null)[]>([]);
  const faceO = useRef<(HTMLDivElement | null)[]>([]);
  const reshuffle = useRef<(() => void)[]>([]);
  const [stickerRefs] = useState(() => ({ post: postEls, faceS, faceO, reshuffle }));
  /** Headline keep-clear box, relative to the hero; measured on layout changes, not every frame */
  const headBox = useRef<Box | null>(null);
  /** Everything else the loop needs that only moves when the layout does. Measuring it
   *  per frame meant a dozen forced reflows per frame, which is what made scrolling
   *  stutter on a phone. */
  const layout = useRef<Layout | null>(null);
  const landed = useRef<boolean[]>([]);
  const catEl = useRef<HTMLDivElement>(null);
  const catFlip = useRef<HTMLDivElement>(null);
  const catParts = useRef<CatRefs>({ legs: [], bodyG: null, tail: null, eyes: null, mouth: null });

  /* Animation state kept out of React */
  const sim = useRef<Sim[]>(
    STK.map((_, i) => {
      const rot = rnd(-22, 22);
      return {
        spot: i,
        sx: 0.5,
        sy: 0.45,
        jx: rnd(-0.02, 0.02),
        jy: rnd(-0.018, 0.018),
        rot,
        trot: rot,
        pop: 0,
        dip: 0,
        ph: rnd(0, 6.28),
        sp: rnd(0.5, 1.1),
        init: false,
      };
    }),
  );
  const cat = useRef<CatState>({
    x: 40,
    dir: 1,
    mode: "walk",
    until: 0,
    nextSit: 7,
    phase: 0,
    flick: -9,
  });
  const t0 = useRef(0);
  const mobileRef = useRef(false);
  const reduceRef = useRef(false);
  const bubbleTimer = useRef<number | undefined>(undefined);
  const petting = useRef({ clicks: 0, last: -99, meow: -1 });

  useEffect(() => {
    reduceRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let lastW = 0;
    let tlH = -1;
    const onResize = () => {
      const w = window.innerWidth;
      // A phone fires resize when its URL bar collapses mid-scroll. That changes the
      // height only, and reacting to it would re-measure the page under the reader's
      // thumb, so only a real width change counts as a new layout.
      if (w === lastW) return;
      lastW = w;
      const m = w < MOBILE_BP;
      mobileRef.current = m;
      setMobile(m);
      setVw(w);
      measure();
    };
    window.addEventListener("resize", onResize);

    const measureHead = () => {
      const tEl = heroTextRef.current;
      const hero = heroRef.current;
      if (!tEl || !hero) return;
      const h = hero.getBoundingClientRect();
      const a1 = inkBox(tEl);
      const l = a1.left - h.left - 16;
      const rt = a1.right - h.left + 16;
      const tp = a1.top - h.top - 16;
      const bt = a1.bottom - h.top + 16;
      headBox.current = {
        cx: (l + rt) / 2,
        cy: (tp + bt) / 2,
        hw: (rt - l) / 2,
        hh: (bt - tp) / 2,
      };
    };
    /** everything the loop would otherwise read from the DOM on every frame */
    const measure = () => {
      measureHead();
      const root = rootRef.current;
      const hero = heroRef.current;
      const tl = tlRef.current;
      const track = trackRef.current;
      if (!root || !hero) return;
      const rr = root.getBoundingClientRect();
      const hr = hero.getBoundingClientRect();
      layout.current = {
        hx: hr.left - rr.left,
        hy: hr.top - rr.top,
        W: hr.width,
        H: hr.height,
        slots: STK.map((_, i) => {
          const el = slotEls.current[i];
          if (!el) return { tx: 0, ty: 0, top: 0 };
          const sr = el.getBoundingClientRect();
          return {
            tx: sr.left - rr.left + sr.width / 2,
            ty: sr.top - rr.top + sr.height / 2,
            top: sr.top - rr.top,
          };
        }),
        tlTop: tl ? tl.getBoundingClientRect().top - rr.top : 0,
        tlDist: track ? Math.max(0, track.scrollWidth - window.innerWidth) : 0,
        // held steady on purpose: see onResize
        vh: window.innerHeight,
      };
      if (tl && layout.current.tlDist !== tlH) {
        tl.style.height = `calc(${layout.current.tlDist}px + 100svh)`;
        tlH = layout.current.tlDist;
        // the timeline just changed height, so everything below it moved
        const rr2 = root.getBoundingClientRect();
        layout.current.tlTop = tl.getBoundingClientRect().top - rr2.top;
        layout.current.slots = STK.map((_, i) => {
          const el = slotEls.current[i];
          if (!el) return { tx: 0, ty: 0, top: 0 };
          const sr = el.getBoundingClientRect();
          return {
            tx: sr.left - rr2.left + sr.width / 2,
            ty: sr.top - rr2.top + sr.height / 2,
            top: sr.top - rr2.top,
          };
        });
      }
    };
    onResize();
    document.fonts?.ready.then(measure);
    const ro = new ResizeObserver(measure);
    if (heroTextRef.current) ro.observe(heroTextRef.current);
    if (heroRef.current) ro.observe(heroRef.current);
    if (rootRef.current) ro.observe(rootRef.current);

    t0.current = performance.now();
    let last = t0.current;
    let raf = 0;

    const tick = (now: number) => {
      const t = (now - t0.current) / 1000;
      const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
      last = now;
      const reduce = reduceRef.current;
      const root = rootRef.current;
      const L = layout.current;
      // one forced layout per frame, at the top, before anything is written back
      const scroll = root ? -root.getBoundingClientRect().top : 0;

      /* stickers: float in hero → morph into table objects on scroll */
      if (root && L && L.W > 0) {
        const { hx, hy, W, H, vh } = L;
        const drift = reduce ? 0 : DRIFT;
        const spots = mobileRef.current ? MSP : DSP;

        const hb = headBox.current;
        const E: Box | null = hb ? { ...hb, cx: hb.cx + hx, cy: hb.cy + hy } : null;
        // time-based easing: same feel at 60Hz and 120Hz, and quicker off the mark than a fixed lerp
        const fPos = 1 - Math.exp(-dt * 7.5);
        const fRot = 1 - Math.exp(-dt * 9);
        const popDecay = Math.exp(-dt * 6.5);

        // the sticker is an <svg>, which has no offsetWidth; its width/height attributes
        // are its size, and reading those costs nothing (no layout is forced)
        const reads = STK.map((_, i) => {
          const kid = faceS.current[i]?.firstElementChild as SVGSVGElement | null;
          return { kw: kid ? kid.width.baseVal.value : 0, kh: kid ? kid.height.baseVal.value : 0 };
        });

        // Pass 1: each sticker's own target spot, drift and headline avoidance — same as
        // before, just collected instead of written straight to the DOM, so pass 2 can
        // push overlapping pairs apart before anything is painted.
        const pos = STK.map((_, i) => {
          const s = sim.current[i]!;
          const sp = spots[s.spot]!;
          const tsx = sp[0] + s.jx;
          const tsy = sp[1] + s.jy;
          if (!s.init) {
            s.sx = tsx;
            s.sy = tsy;
            s.init = true;
          }
          s.sx += (tsx - s.sx) * fPos;
          s.sy += (tsy - s.sy) * fPos;
          s.rot += (s.trot - s.rot) * fRot;
          s.pop *= popDecay;
          s.dip *= popDecay;

          let fx = hx + s.sx * W + Math.sin(t * s.sp + s.ph) * drift;
          let fy = hy + s.sy * H + Math.cos(t * s.sp * 0.8 + s.ph) * drift;
          const rd = reads[i]!;
          const hw = rd.kw / 2 + 14;
          const hh = rd.kh / 2 + 14;
          // the label sits well inside the card's outer edge, so a much smaller box is
          // what actually needs to stay clear of a neighbour — the card shapes themselves
          // are allowed to overlap at their edges
          const tw = rd.kw * 0.34 + 4;
          const th = rd.kh * 0.3 + 4;
          fx = clamp(fx, hx + hw, hx + W - hw);
          fy = clamp(fy, hy + hh, hy + H - hh);
          // keep stickers off the headline
          if (E) {
            const dx = fx - E.cx;
            const dy = fy - E.cy;
            const ox = E.hw + hw - Math.abs(dx);
            const oy = E.hh + hh - Math.abs(dy);
            if (ox > 0 && oy > 0) {
              const nx = fx + (dx < 0 ? -1 : 1) * ox;
              const xOk = nx >= hx + hw && nx <= hx + W - hw;
              if (oy < ox || !xOk) fy += (dy < 0 ? -1 : 1) * oy;
              else fx = nx;
            }
            fx = clamp(fx, hx + hw, hx + W - hw);
            fy = clamp(fy, hy + hh, hy + H - hh);
          }
          return { fx, fy, hw, hh, tw, th };
        });

        // Pass 2: push every pair whose LABELS would overlap apart, along whichever axis
        // clears it with the smaller nudge, then re-clamp the outer shape to the hero box.
        // The cards themselves are free to overlap at their edges — only the text has to
        // stay legible. Stickers can resize (click) or swap spots (poke) at any time, so
        // this runs fresh every frame rather than relying on the starting layout to fit.
        // A fraction of the push also feeds back into the sticker's own eased position
        // (sx/sy), not just this frame's render — otherwise the easing pulls it straight
        // back toward the overlapping spot every frame and the push has to redo the full
        // correction each time, which reads as a shove rather than a settle.
        const SGAP = 4;
        const PUSHBACK = 0.3;
        for (let i = 0; i < pos.length; i++) {
          for (let j = i + 1; j < pos.length; j++) {
            const a = pos[i]!;
            const b = pos[j]!;
            const dx = b.fx - a.fx;
            const dy = b.fy - a.fy;
            const ox = a.tw + b.tw + SGAP - Math.abs(dx);
            const oy = a.th + b.th + SGAP - Math.abs(dy);
            if (ox <= 0 || oy <= 0) continue;
            if (ox < oy) {
              const push = (ox / 2) * (dx < 0 ? -1 : 1);
              a.fx -= push;
              b.fx += push;
              sim.current[i]!.sx -= (push * PUSHBACK) / W;
              sim.current[j]!.sx += (push * PUSHBACK) / W;
            } else {
              const push = (oy / 2) * (dy < 0 ? -1 : 1);
              a.fy -= push;
              b.fy += push;
              sim.current[i]!.sy -= (push * PUSHBACK) / H;
              sim.current[j]!.sy += (push * PUSHBACK) / H;
            }
          }
        }
        for (const p of pos) {
          p.fx = clamp(p.fx, hx + p.hw, hx + W - p.hw);
          p.fy = clamp(p.fy, hy + p.hh, hy + H - p.hh);
        }

        STK.forEach((_, i) => {
          const el = postEls.current[i];
          const fS = faceS.current[i];
          const fO = faceO.current[i];
          const s = sim.current[i]!;
          if (!el || !fS || !fO) return;
          const a = reduce ? 1 : clamp((t - 0.2 - i * 0.09) / 0.75);
          const { fx, fy } = pos[i]!;

          const { tx, ty, top } = L.slots[i]!;
          const end = Math.max(1, top - vh * 0.6);
          const k = (i % 2) * 0.07;
          const e = reduce ? 1 : easeInOut(clamp((scroll / end - k) / (1 - k)));
          const arc = Math.sin(e * Math.PI) * (i % 2 ? 80 : -80);
          const x = fx + (tx - fx) * e + arc;
          const y = fy + (ty - fy) * e;
          el.style.transform = `translate3d(${x}px,${y}px,0) rotate(${s.rot * (1 - e)}deg)`;
          el.style.opacity = String(a);
          const m2 = clamp((e - 0.7) / 0.3);
          fS.style.opacity = String(1 - m2);
          fS.style.pointerEvents = m2 > 0.5 ? "none" : "auto";
          // dip drives a quick shrink-then-grow on click: the shape/colour swap (see
          // poke()) is timed to land near the bottom of it, where the cut is smallest
          // and least noticeable, instead of snapping at full size
          fS.style.transform = `translate(-50%,-50%) scale(${(1 - 0.35 * m2) * back(a) * (1 + s.pop * 0.2) * (1 - s.dip * 0.6)})`;
          fO.style.opacity = String(m2);
          fO.style.pointerEvents = m2 > 0.5 ? "auto" : "none";
          fO.style.transform = `translate(-50%,-50%) scale(${(0.7 + 0.3 * m2) * (1 + s.pop * 0.18)})`;
          landed.current[i] = e > 0.85;
        });
      }

      /* pinned horizontal timeline — its height and travel are set in measure(), and
         the tail is 100svh in CSS rather than innerHeight, so a collapsing URL bar
         cannot resize this section under the reader's thumb */
      const track = trackRef.current;
      if (track && L) {
        const p = clamp((scroll - L.tlTop) / Math.max(1, L.tlDist));
        track.style.transform = `translate3d(${-p * L.tlDist}px,0,0)`;
        if (tlBarRef.current) tlBarRef.current.style.width = `${p * 100}%`;
      }

      tickCat(t, dt);
    };

    const tickCat = (t: number, dt: number) => {
      const el = catEl.current;
      const flip = catFlip.current;
      if (!el || !flip) return;
      const c = cat.current;
      const parts = catParts.current;
      const W = window.innerWidth;
      if (c.mode !== "walk" && t > c.until) {
        c.mode = c.mode === "hiss" ? "zoom" : "walk";
        if (c.mode === "zoom") {
          c.until = t + 1.4;
          c.dir = Math.random() < 0.5 ? -1 : 1;
        }
      }
      if (c.mode === "walk" && t > c.nextSit) {
        c.mode = "sit";
        c.until = t + rnd(2.2, 4);
        c.nextSit = c.until + rnd(6, 12);
      }
      const moving = !reduceRef.current && (c.mode === "walk" || c.mode === "zoom");
      const speed = c.mode === "zoom" ? CAT_SPEED * 5 : CAT_SPEED;
      if (moving) {
        c.x += c.dir * speed * dt;
        c.phase += dt * speed * 0.22;
        if (c.x < 8) {
          c.x = 8;
          c.dir = 1;
        }
        if (c.x > W - 92) {
          c.x = W - 92;
          c.dir = -1;
        }
      }
      const hiss = c.mode === "hiss";
      el.style.transform = `translateX(${c.x}px)`;
      flip.style.transform = `scaleX(${c.dir})`;
      const a = moving ? Math.sin(c.phase) * (c.mode === "zoom" ? 38 : 26) : 0;
      parts.legs.forEach((l, i) => {
        if (l) l.style.transform = `rotate(${i === 0 || i === 3 ? a : -a}deg)`;
      });
      if (parts.tail) {
        const flick = t - c.flick < 0.7;
        parts.tail.style.transform = `rotate(${hiss ? -30 : flick ? Math.sin(t * 28) * 22 : Math.sin(t * (moving ? 3 : 1.6)) * 14}deg)`;
        parts.tail.setAttribute("stroke-width", hiss ? "9" : "5");
      }
      if (parts.bodyG)
        parts.bodyG.style.transform = hiss
          ? "translateY(-6px) scaleY(1.1)"
          : `translateY(${moving ? Math.abs(Math.sin(c.phase)) * -1.5 : 0}px)`;
      if (parts.eyes)
        parts.eyes.style.transform = `scaleY(${hiss ? 0.4 : t % 4.3 < 0.13 ? 0.12 : 1})`;
      if (parts.mouth) parts.mouth.style.opacity = hiss ? "1" : "0";
    };

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      tick(now);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      ro.disconnect();
      window.clearTimeout(bubbleTimer.current);
      lunarTimers.current.forEach((t) => window.clearTimeout(t));
    };
  }, []);

  /* Click a floating sticker: swap spots with another, new tilt, new colour + shape */
  const poke = useCallback((i: number) => {
    const s = sim.current[i]!;
    s.dip = 1;
    if (landed.current[i]) return;
    let j = Math.floor(Math.random() * (STK.length - 1));
    if (j >= i) j++;
    const o = sim.current[j]!;
    [s.spot, o.spot] = [o.spot, s.spot];
    s.jx = rnd(-0.02, 0.02);
    s.jy = rnd(-0.018, 0.018);
    s.trot = rnd(-24, 24);
    o.trot = rnd(-24, 24);
    o.pop = 0.5;
    // the shape/colour change is an instant cut with nothing to animate between two
    // unrelated SVGs, so it's timed to land mid-dip (see the pop-driven scale in tick()),
    // when the sticker is smallest and the cut isn't what the eye is looking at
    window.setTimeout(() => reshuffle.current[i]?.(), 110);
  }, []);
  const hover = useCallback((i: number) => {
    const s = sim.current[i]!;
    s.pop = Math.max(s.pop, 0.35);
  }, []);

  const say = (text: string, kind: "talk" | "hiss" | "ignore", ms: number) => {
    setBubble({ text, kind, right: cat.current.x > window.innerWidth - 260 });
    window.clearTimeout(bubbleTimer.current);
    bubbleTimer.current = window.setTimeout(() => setBubble(null), ms);
  };

  /* The cat only sometimes responds */
  const petCat = () => {
    const c = cat.current;
    const pet = petting.current;
    const t = (performance.now() - t0.current) / 1000;
    if (c.mode === "hiss" || c.mode === "zoom") return;
    pet.clicks = t - pet.last < 6 ? pet.clicks + 1 : 1;
    pet.last = t;
    const [ig, baseHiss] = MOODS[CAT_MOOD];
    const hs = baseHiss + (pet.clicks - 1) * 0.12;
    const r = Math.random();
    if (r < ig) {
      c.flick = t;
      if (Math.random() < 0.35) say("…", "ignore", 1200);
      return;
    }
    if (r < ig + hs) {
      c.mode = "hiss";
      c.until = t + 1.3;
      say(HISS[Math.floor(Math.random() * HISS.length)]!, "hiss", 1600);
      return;
    }
    pet.meow = (pet.meow + 1) % MEOWS.length;
    c.mode = "sit";
    c.until = t + 4;
    say(MEOWS[pet.meow]!, "talk", 3800);
  };

  const k = mobile ? Math.min(0.72, vw / 610) : Math.min(1.18, vw / 1180);
  const ko = mobile ? 0.8 : 1;
  const zoneH = mobile ? 240 : 290;

  const runOrder = () => {
    lunarTimers.current.forEach((t) => window.clearTimeout(t));
    if (reduceRef.current) {
      setLunar(PIPELINE.length);
      return;
    }
    setLunar(0);
    lunarTimers.current = PIPELINE.map((_, j) =>
      window.setTimeout(() => setLunar(j + 1), 1100 * (j + 1)),
    );
  };

  const navLinks = [
    ["Work", "#work"],
    ["Path", "#path"],
    ["Playground", "#play"],
    ["About", "#now"],
  ] as const;

  return (
    <div className="pf" ref={rootRef} id="top">
      {/* ═════ Hero ═════ */}
      <div className="pf-top">
        <nav className={`pf-nav${navSolid || menuOpen ? " pf-nav-solid" : ""}`}>
          <a href="#top" className="pf-brand">
            <Wordmark />
          </a>
          <div className="pf-links">
            {navLinks.map(([label, href]) => (
              <a key={href} href={href}>
                {label}
              </a>
            ))}
            <a href="#contact" className="btn btn-primary pf-talk">
              Let's talk
            </a>
          </div>
          <button
            type="button"
            className="btn pf-menu"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
          >
            {menuOpen ? <X size={18} strokeWidth={2.75} /> : <Menu size={18} strokeWidth={2.75} />}
          </button>
          {menuOpen && (
            <div className="pf-menu-panel">
              {[...navLinks, ["Let's talk", "#contact"] as const].map(([label, href]) => (
                <a key={href} href={href} onClick={() => setMenuOpen(false)}>
                  {label}
                </a>
              ))}
            </div>
          )}
        </nav>
        <header className="pf-hero" ref={heroRef}>
          <div className="pf-hero-text" ref={heroTextRef}>
            <div className="pf-hero-logo">
              <MoonMark size={76} />
            </div>
            <h1>
              I turn ideas into <span>real&nbsp;products</span>
            </h1>
            <p>Start with one project. Stay for as long as it makes sense.</p>
            <p className="pf-avail">
              <span aria-hidden="true" />
              Open to freelance, contract and long-term work.
            </p>
          </div>
          <a href="#table" className="pf-scroll" aria-label="Scroll down">
            <ArrowDown size={18} strokeWidth={2.75} />
          </a>
        </header>
      </div>

      {/* ═════ What I bring to the table ═════ */}
      <section className="pf-table-sec" id="table">
        <div className="pf-head">
          <h2>What I bring to the table</h2>
          <p>
            Most people I work with have a good idea and no clear way to make it real. I find the
            path, build the product, and help it grow from there.
          </p>
        </div>
        <div className="pf-cloth">
          {ZONES.map(([title, body, dot], zi) => (
            <div className="pf-setting" key={title}>
              <div className="pf-objarea" style={{ height: zoneH }}>
                {STK.map((p, i) => {
                  if (p.z !== zi) return null;
                  const o = OBJ[p.obj];
                  return (
                    <div
                      key={i}
                      ref={(el) => {
                        slotEls.current[i] = el;
                      }}
                      className="pf-slot"
                      style={{ left: `${o.x}%`, top: o.y * ko, width: o.w * ko, height: o.h * ko }}
                    />
                  );
                })}
                {DECOR.filter((d) => d.z === zi).map(({ obj }) => {
                  const o = OBJ[obj];
                  return (
                    <div
                      key={obj}
                      className="pf-slot"
                      style={{ left: `${o.x}%`, top: o.y * ko, width: o.w * ko, height: o.h * ko }}
                    >
                      <TableObject objKey={obj} k={ko} />
                    </div>
                  );
                })}
              </div>
              <div className="pf-place">
                <div className="pf-place-top">
                  <span className="pf-num" style={{ background: dot }}>
                    {zi + 1}
                  </span>
                  <h3>{title}</h3>
                </div>
                <p>{body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═════ Proof: water the pots, the numbers grow ═════ */}
      <GrowingStats />

      {/* ═════ Timeline ═════ */}
      <section className="pf-tl" ref={tlRef} id="path">
        <div className="pf-tl-pin">
          <div className="pf-tl-head">
            <div>
              <span className="pf-kicker">How I got here</span>
              <h2>
                I took the <span>scenic route.</span>
              </h2>
            </div>
            <div className="pf-tl-progress">
              <span>Keep scrolling</span>
              <div className="pf-tl-bar">
                <div ref={tlBarRef} />
              </div>
            </div>
          </div>
          <div className="pf-tl-track" ref={trackRef}>
            {PATH.map((s, i) => (
              <article
                key={s.h}
                className="pf-tl-card"
                style={{ background: s.bg, color: s.fg, transform: `rotate(${s.r}deg)` }}
              >
                <div className="pf-tl-scene" style={{ background: s.panel }}>
                  <SceneArt scene={s.scene} />
                  <span className="pf-tl-n">{i + 1}</span>
                </div>
                <span className="pf-tl-span" style={{ color: s.muted }}>
                  {s.span}
                </span>
                <h3>{s.h}</h3>
                <span className="pf-tl-at" style={{ color: s.muted }}>
                  <MapPin size={14} strokeWidth={2.75} aria-hidden="true" />
                  {s.at}
                </span>
                <p style={{ color: s.muted }}>{s.b}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ═════ The receipts: same parts, same order, in all three ═════ */}
      <section className="pf-receipts" id="work">
        <div className="pf-receipts-head">
          <h2>The receipts</h2>
          <p>Three things I built. All three are out in the world, doing their job.</p>
        </div>
        {RECEIPTS.map((r) => (
          <article key={r.id} id={r.id} className={`pf-rcard pf-rcard-${r.id}`}>
            <div className="pf-rcard-copy">
              <div className="pf-pills">
                <span className="pf-pill pf-pill-role">
                  {r.n} · {r.role}
                </span>
                <span className="pf-pill pf-pill-status">● {r.status}</span>
              </div>
              <h3>{r.h}</h3>
              <p>{r.body}</p>
              <p className="pf-rcard-mine">
                <b>My part:</b> {r.mine}
              </p>
              {r.quote && (
                <figure className="pf-rcard-quote">
                  <blockquote>{r.quote}</blockquote>
                  <figcaption>{r.quoteBy}</figcaption>
                </figure>
              )}
              <a
                href={r.href}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary pf-btn-lg"
              >
                {r.cta} ↗
              </a>
            </div>
            {r.id === "schooltrips" ? (
              <a
                href={LINKS.planner}
                target="_blank"
                rel="noopener noreferrer"
                className="pf-st-shots"
                aria-label="Open the SchoolTrips.ai beta"
              >
                <figure className="pf-snap pf-snap-a">
                  <span className="pf-tape" />
                  <img
                    src={stHome}
                    alt="SchoolTrips.ai home: school trip planning, without the overwhelm"
                    loading="lazy"
                  />
                </figure>
                <figure className="pf-snap pf-snap-b">
                  <span className="pf-tape pf-tape-sage" />
                  <img
                    src={stProblem}
                    alt="SchoolTrips.ai: AI guidance, educator reviews, proven itineraries, risk templates"
                    loading="lazy"
                  />
                </figure>
              </a>
            ) : r.id === "hannah" ? (
              <div className="pf-hj-view">
                <div className="pf-toggle" role="group" aria-label="Switch view">
                  <button
                    type="button"
                    className="pf-demo"
                    aria-pressed={hjView === "public"}
                    onClick={() => setHjView("public")}
                  >
                    What collectors see
                  </button>
                  <button
                    type="button"
                    className="pf-demo"
                    aria-pressed={hjView === "admin"}
                    onClick={() => setHjView("admin")}
                  >
                    What Hannah manages
                  </button>
                </div>
                <div className="pf-browser">
                  <div className="pf-browser-bar">
                    <span />
                    <span />
                    <span />
                    <em>
                      {hjView === "public"
                        ? "byhannahjackson.com"
                        : "byhannahjackson.com · her dashboard"}
                    </em>
                  </div>
                  <img
                    src={hjView === "public" ? hjPublic : hjAdmin}
                    alt={
                      hjView === "public"
                        ? "Hannah Jackson's site: her original paintings with sizes and prices"
                        : "Hannah's dashboard: her paintings list with prices and offer status, editable"
                    }
                  />
                </div>
                <p className="pf-hj-cap">
                  {hjView === "public"
                    ? "Her originals, sizes, prices and offer status."
                    : "The same paintings. She adds, prices and publishes them herself."}
                </p>
              </div>
            ) : (
              <div className="pf-pipe" data-step={lunar}>
                <div className="pf-pipe-head">
                  <span>Every order, start to finish</span>
                  <button
                    type="button"
                    className="pf-demo pf-pipe-run"
                    onClick={runOrder}
                    disabled={lunar >= 0 && lunar < PIPELINE.length}
                  >
                    {lunar < 0
                      ? "Run a test order ▸"
                      : lunar < PIPELINE.length
                        ? "Running…"
                        : "Run it again ↺"}
                  </button>
                </div>
                <LunarPipeline step={lunar} />
                <ol className="pf-pipe-steps">
                  {PIPELINE.map((st, j) => {
                    const state = lunar > j ? "done" : lunar === j ? "active" : "idle";
                    return (
                      <li key={st.h} className={state}>
                        <span className="pf-pipe-dot">
                          {state === "done" ? <Check size={14} strokeWidth={3} /> : j + 1}
                        </span>
                        <b>{st.h}</b>
                      </li>
                    );
                  })}
                </ol>
                {/* the detail that used to sit under all four steps at once, shown
                    one at a time for whichever step is running */}
                <p className="pf-pipe-foot" aria-live="polite">
                  {lunar >= 0 && lunar < PIPELINE.length
                    ? PIPELINE[lunar]?.b
                    : lunar >= PIPELINE.length
                      ? "Four steps. Fully handled."
                      : "A replay of what happens with every real order."}
                </p>
              </div>
            )}
            {r.id === "hannah" && (
              <Reviews title="What Hannah said" shop="Ashleigh Chua" list={HANNAH_REVIEWS} />
            )}
            {r.id === "lunar" && (
              <Reviews title="What buyers said" shop="The Lunar Playground" list={LUNAR_REVIEWS} />
            )}
          </article>
        ))}
      </section>

      {/* ═════ Playground ═════ */}
      <section className="pf-play" id="play">
        <div className="pf-play-head">
          <span className="pf-kicker pf-kicker-soft">Nobody asked for these</span>
          <h2>The playground.</h2>
          <p>
            Side projects, useful experiments, and ideas I wanted to see working. Some are live.
            Some are still happily being tinkered with.
          </p>
        </div>
        <div className="pf-tiles">
          {PLAY.map((t) => {
            const inner = (
              <>
                <span
                  className="pf-tile-stk"
                  style={{ background: t.sbg, color: t.sfg, "--r": `${t.r}deg` } as CSSProperties}
                >
                  {t.s}
                </span>
                <span className="pf-tile-h">{t.h}</span>
                <span className="pf-tile-b">{t.b}</span>
              </>
            );
            const style = { background: t.bg, color: t.fg };
            return t.href ? (
              <a
                key={t.h}
                href={t.href}
                target="_blank"
                rel="noopener noreferrer"
                className="pf-tile"
                style={style}
              >
                {inner}
              </a>
            ) : (
              <div key={t.h} className="pf-tile pf-tile-static" style={style}>
                {inner}
              </div>
            );
          })}
        </div>
      </section>

      {/* ═════ About ═════ */}
      <section className="pf-now" id="now">
        <div className="pf-about-top">
          <div className="pf-about-copy">
            <span className="pf-kicker pf-kicker-soft">About me</span>
            <h2 className="pf-iam">
              <span className="sr-only">Hi, I’m Ashleigh and I’m a {ROLES.join("; ")}.</span>
              <RotatingRole lead="Hi, I’m Ashleigh and I’m" />
            </h2>
          </div>
          <figure className="pf-polaroid pf-me">
            <div>
              <img
                src={portraitPhoto}
                alt="Ashleigh smiling behind a birthday cake"
                loading="lazy"
              />
            </div>
            <figcaption>that’s me!</figcaption>
          </figure>
        </div>
      </section>

      <Kitchen />

      {/* ═════ Contact ═════ */}
      <section className="pf-contact" id="contact">
        <div className="pf-contact-box">
          <h2>Let’s talk.</h2>
          <p>
            Anything with a real problem in it, big or small. Bonus points for sustainability, where
            good ideas still have to prove they work in practice.
          </p>
          <div className="pf-contact-ctas">
            <a href={`mailto:${LINKS.email}`} className="btn pf-contact-cta">
              Email me
            </a>
          </div>
          <div className="pf-foot">
            <a href={LINKS.linkedin} target="_blank" rel="noopener noreferrer">
              LinkedIn
            </a>
            <a href={LINKS.github} target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
            <span className="pf-foot-c">
              <Wordmark /> © 2026
            </span>
          </div>
        </div>
      </section>

      {/* ═════ Sticker layer (positioned by the rAF loop) ═════ */}
      <div className="pf-posts">
        {STK.map((_, i) => (
          <Sticker key={i} i={i} k={k} ko={ko} refs={stickerRefs} onPoke={poke} onHover={hover} />
        ))}
      </div>

      {/* ═════ Cat ═════ */}
      {SHOW_CAT && (
        <div
          className="pf-cat"
          ref={catEl}
          onClick={petCat}
          role="button"
          tabIndex={0}
          aria-label="Pet the cat"
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              petCat();
            }
          }}
        >
          {bubble && (
            <div
              className={`pf-bubble pf-bubble-${bubble.kind}`}
              style={bubble.right ? { right: 0 } : { left: 0 }}
            >
              {bubble.text}
            </div>
          )}
          <CatSvg refs={catParts.current} flipRef={catFlip} />
        </div>
      )}
    </div>
  );
}
