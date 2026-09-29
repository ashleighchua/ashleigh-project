import { memo, useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import {
  ArrowDown,
  Check,
  MapPin,
  Menu,
  Plane,
  ShieldCheck,
  Sparkles,
  Star,
  X,
} from "lucide-react";
import portraitPhoto from "@/assets/portrait.jpg";
import greatWallTents from "@/assets/great-wall-tents.jpg";
import stHome from "@/assets/st-home.jpg";
import stProblem from "@/assets/st-problem.jpg";
import hjPublic from "@/assets/hj-public.jpg";
import hjAdmin from "@/assets/hj-admin.jpg";
import { Logo, LunarPipeline, SceneArt, StickerFace, TableObject, type Look } from "./art";
import { CatSvg, type CatRefs } from "./cat";
import {
  COL,
  DSP,
  HISS,
  LINKS,
  MEOWS,
  MSP,
  OBJ,
  PATH,
  PIPELINE,
  PLAY,
  SH,
  STK,
  ZONES,
  ROLES,
  ADVENTURES,
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

/** "I'm a ___" slot. Every word is laid out invisibly in the same cell so the line never jumps. */
function RotatingRole() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setI((n) => (n + 1) % ROLES.length), 2200);
    return () => window.clearInterval(id);
  }, []);
  return (
    <span className="pf-role" aria-hidden="true">
      {ROLES.map((r) => (
        <span key={r} className="pf-role-size">
          {r}.
        </span>
      ))}
      <span key={i} className="pf-role-word">
        {ROLES[i]}.
      </span>
    </span>
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
        jx: rnd(-0.035, 0.035),
        jy: rnd(-0.03, 0.03),
        rot,
        trot: rot,
        pop: 0,
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
    const onResize = () => {
      const m = window.innerWidth < MOBILE_BP;
      mobileRef.current = m;
      setMobile(m);
      setVw(window.innerWidth);
    };
    onResize();
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
    measureHead();
    document.fonts?.ready.then(measureHead);
    const ro = new ResizeObserver(measureHead);
    if (heroTextRef.current) ro.observe(heroTextRef.current);
    if (heroRef.current) ro.observe(heroRef.current);

    t0.current = performance.now();
    let last = t0.current;
    let raf = 0;
    let tlH = 0;

    const tick = (now: number) => {
      const t = (now - t0.current) / 1000;
      const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
      last = now;
      const reduce = reduceRef.current;
      const root = rootRef.current;
      const hero = heroRef.current;
      const vh = window.innerHeight;
      const hr = hero?.getBoundingClientRect();

      /* stickers: float in hero → morph into table objects on scroll */
      if (root && hero && hr && hr.width > 0) {
        const rr = root.getBoundingClientRect();
        const hx = hr.left - rr.left;
        const hy = hr.top - rr.top;
        const W = hr.width;
        const H = hr.height;
        const scroll = -rr.top;
        const drift = reduce ? 0 : DRIFT;
        const spots = mobileRef.current ? MSP : DSP;

        const hb = headBox.current;
        const E: Box | null = hb ? { ...hb, cx: hb.cx + hx, cy: hb.cy + hy } : null;
        // time-based easing: same feel at 60Hz and 120Hz, and quicker off the mark than a fixed lerp
        const fPos = 1 - Math.exp(-dt * 7.5);
        const fRot = 1 - Math.exp(-dt * 9);
        const popDecay = Math.exp(-dt * 6.5);

        // read every size/position first, then write: no forced re-layout per sticker
        const reads = STK.map((_, i) => {
          const slot = slotEls.current[i];
          // the sticker is an <svg>, which has no offsetWidth; its width/height attributes are its size
          const kid = faceS.current[i]?.firstElementChild as SVGSVGElement | null;
          return {
            sr: slot?.getBoundingClientRect(),
            kw: kid ? kid.width.baseVal.value : 0,
            kh: kid ? kid.height.baseVal.value : 0,
          };
        });

        STK.forEach((_, i) => {
          const el = postEls.current[i];
          const slot = slotEls.current[i];
          const fS = faceS.current[i];
          const fO = faceO.current[i];
          const s = sim.current[i]!;
          if (!el || !slot || !fS || !fO) return;
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

          const a = reduce ? 1 : clamp((t - 0.2 - i * 0.09) / 0.75);
          let fx = hx + s.sx * W + Math.sin(t * s.sp + s.ph) * drift;
          let fy = hy + s.sy * H + Math.cos(t * s.sp * 0.8 + s.ph) * drift;
          const rd = reads[i]!;
          const hw = rd.kw / 2 + 14;
          const hh = rd.kh / 2 + 14;
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

          const sr = rd.sr!;
          const tx = sr.left - rr.left + sr.width / 2;
          const ty = sr.top - rr.top + sr.height / 2;
          const end = Math.max(1, sr.top - rr.top - vh * 0.6);
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
          fS.style.transform = `translate(-50%,-50%) scale(${(1 - 0.35 * m2) * back(a) * (1 + s.pop * 0.2)})`;
          fO.style.opacity = String(m2);
          fO.style.pointerEvents = m2 > 0.5 ? "auto" : "none";
          fO.style.transform = `translate(-50%,-50%) scale(${(0.7 + 0.3 * m2) * (1 + s.pop * 0.18)})`;
          landed.current[i] = e > 0.85;
        });
      }

      /* pinned horizontal timeline */
      const tl = tlRef.current;
      const track = trackRef.current;
      if (tl && track) {
        const r = tl.getBoundingClientRect();
        const dist = Math.max(0, track.scrollWidth - window.innerWidth);
        const want = dist + vh;
        if (Math.abs(tlH - want) > 1) {
          tl.style.height = `${want}px`;
          tlH = want;
        }
        const p = clamp(-r.top / Math.max(1, dist));
        track.style.transform = `translate3d(${-p * dist}px,0,0)`;
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
    s.pop = 1;
    if (landed.current[i]) return;
    let j = Math.floor(Math.random() * (STK.length - 1));
    if (j >= i) j++;
    const o = sim.current[j]!;
    [s.spot, o.spot] = [o.spot, s.spot];
    s.jx = rnd(-0.03, 0.03);
    s.jy = rnd(-0.03, 0.03);
    s.trot = rnd(-24, 24);
    o.trot = rnd(-24, 24);
    o.pop = 0.5;
    reshuffle.current[i]?.();
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

  const k = mobile ? Math.min(0.62, vw / 630) : Math.min(1.18, vw / 1180);
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
        <nav className="pf-nav">
          <a href="#top" className="pf-brand">
            <Logo size={34} />
            <span>Ashleigh Chua</span>
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
              <Logo size={88} />
            </div>
            <h1>
              I help turn ideas into <span>real&nbsp;products</span>
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
            Most people I work with know something should be better but can’t see the path yet. I
            help find it, build the thing, and leave it running without me.
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

      {/* ═════ Timeline ═════ */}
      <section className="pf-tl" ref={tlRef} id="path">
        <div className="pf-tl-pin">
          <div className="pf-tl-head">
            <div>
              <span className="pf-kicker">Not the LinkedIn version</span>
              <h2>
                None of this happened in a <span>straight line.</span>
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

      {/* ═════ The receipts ═════ */}
      <section className="pf-receipts" id="work">
        <div className="pf-receipts-head">
          <h2>The receipts</h2>
          <span>Three things I built, and what each one does in the real world.</span>
        </div>

        {/* SchoolTrips.ai */}
        <article className="pf-st">
          <div className="pf-st-glow" />
          <div className="pf-st-copy">
            <div className="pf-pills">
              <span
                className="pf-pill"
                style={{ background: "var(--color-accent)", color: "var(--color-neutral-900)" }}
              >
                01 · Cofounder
              </span>
              <span
                className="pf-pill"
                style={{
                  background: "var(--color-accent-2-300)",
                  color: "var(--color-accent-2-900)",
                }}
              >
                ● In beta
              </span>
            </div>
            <h3>SchoolTrips.ai</h3>
            <p>
              Teachers are tired of the admin that comes with every trip. SchoolTrips.ai takes it
              off their plate, and it gets smarter every time a trip is run and reviewed.
            </p>
            <ul className="pf-st-feats">
              {(
                [
                  [
                    Sparkles,
                    "Gets smarter every trip",
                    "Real reviews and completed trips feed the recommendations, so it compounds instead of guessing.",
                  ],
                  [Star, "Educator reviews", "Notes from teachers who have actually run it."],
                  [
                    ShieldCheck,
                    "The boring bits, handled",
                    "Safeguarding forms and risk assessments, done without the admin slog.",
                  ],
                ] as const
              ).map(([Icon, h, b]) => (
                <li key={h}>
                  <span>
                    <Icon size={18} strokeWidth={2.75} aria-hidden="true" />
                  </span>
                  <div>
                    <b>{h}</b> {b}
                  </div>
                </li>
              ))}
            </ul>
            <p className="pf-st-mine">
              <b>My part:</b> I lead product and build it. I also go on the ground on real school
              trips to learn about the entire process from planning a trip to seeing it through.
            </p>
            <a
              href={LINKS.planner}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary pf-btn-lg"
            >
              Try the beta ↗
            </a>
          </div>
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
        </article>

        {/* Hannah Jackson */}
        <article className="pf-hj">
          <div className="pf-hj-copy">
            <div className="pf-pills">
              <span
                className="pf-pill"
                style={{ background: "var(--color-accent-200)", color: "var(--color-accent-800)" }}
              >
                02 · Client build
              </span>
              <span
                className="pf-pill"
                style={{
                  background: "var(--color-accent-2-200)",
                  color: "var(--color-accent-2-800)",
                }}
              >
                ● Live
              </span>
            </div>
            <h3>Hannah Jackson</h3>
            <p>
              Hannah asked for a website. I built her a dashboard too, so she can update her work,
              prices, and offers herself whenever she needs to, without touching code.
            </p>
            <div className="pf-hj-stat">
              <span>+50%</span>
              <span>
                She paid over my quote. <b>Not needing me was worth more than the site.</b>
              </span>
            </div>
            <a
              href={LINKS.hannah}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost pf-hj-link"
            >
              See her site ↗
            </a>
          </div>
          <div className="pf-hj-view">
            <div className="pf-toggle" role="group" aria-label="Switch view">
              <button
                type="button"
                aria-pressed={hjView === "public"}
                onClick={() => setHjView("public")}
              >
                What collectors see
              </button>
              <button
                type="button"
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
        </article>

        {/* The Lunar Playground */}
        <article className="pf-lp">
          <div className="pf-lp-c1" />
          <div className="pf-lp-c2" />
          <div className="pf-lp-copy">
            <div className="pf-pills">
              <span
                className="pf-pill"
                style={{
                  background: "var(--color-accent-2-100)",
                  color: "var(--color-accent-2-800)",
                }}
              >
                03 · Solo product
              </span>
              <span
                className="pf-pill"
                style={{
                  background: "var(--color-accent-2-700)",
                  color: "var(--color-accent-2-100)",
                }}
              >
                ● Live, fully automated
              </span>
            </div>
            <h3>The Lunar Playground</h3>
            <p>
              Relocation astrology and natal readings. Someone places an order, their chart is
              calculated, their reading is written, and the finished PDF arrives in their inbox. The
              process runs without me touching each order.
            </p>
            <a
              href={LINKS.lunar}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary pf-lp-link"
            >
              Visit the site ↗
            </a>
          </div>
          <div className="pf-pipe" data-step={lunar}>
            <div className="pf-pipe-head">
              <span>Every order, start to finish</span>
              <button
                type="button"
                className="btn pf-pipe-run"
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
                    <div>
                      <b>{st.h}</b>
                      <span>{st.b}</span>
                    </div>
                  </li>
                );
              })}
            </ol>
            <p className="pf-pipe-foot" aria-live="polite">
              {lunar >= PIPELINE.length
                ? "Four steps. Fully handled."
                : "A replay of what happens with every real order."}
            </p>
          </div>
        </article>
      </section>

      {/* ═════ Playground ═════ */}
      <section className="pf-play" id="play">
        <div className="pf-play-grid">
          <div className="pf-play-head">
            <span className="pf-kicker">Nobody asked for these</span>
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
                  <div className="pf-tile-top">
                    <span style={{ background: t.bg, color: t.fg }}>{t.s}</span>
                    {t.href && <span className="pf-tile-arrow">↗</span>}
                  </div>
                  <span className="pf-tile-h">{t.h}</span>
                  <span className="pf-tile-b">{t.b}</span>
                </>
              );
              const style = { "--tilt": `${t.r}deg` } as CSSProperties;
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
        </div>
      </section>

      {/* ═════ About ═════ */}
      <section className="pf-now" id="now">
        <div className="pf-about-intro">
          <span className="pf-kicker">About me</span>
          <h2 aria-label={`Hi, I'm Ashleigh. I'm a ${ROLES.join(", ")}.`}>
            <span aria-hidden="true">Hi, I’m Ashleigh.</span>
            <span aria-hidden="true">I’m a</span>
            <RotatingRole />
          </h2>
        </div>
        <div className="pf-about-me">
          <div className="pf-thats-me" aria-hidden="true">
            <span>that’s me!</span>
            <svg viewBox="0 0 120 70" className="pf-arrow">
              <path d="M6 14 C 40 4, 78 18, 104 50" />
              <path d="M88 46 L 105 52 L 104 34" />
            </svg>
          </div>
          <figure className="pf-postcard pf-me">
            <span className="pf-tape" />
            <div>
              <img src={portraitPhoto} alt="Ashleigh" loading="lazy" />
            </div>
          </figure>
        </div>
        <div className="pf-trips">
          <span className="pf-kicker">This year, so far</span>
          <div className="pf-trips-row">
            {ADVENTURES.map((a) => (
              <figure
                key={a.h}
                className={`pf-trip${a.kind === "pass" ? " pf-trip-pass" : ""}${a.photo ? " pf-trip-photo" : ""}`}
                style={{ background: a.bg, color: a.fg, transform: `rotate(${a.r}deg)` }}
              >
                {a.kind === "pass" && (
                  <div className="pf-trip-planes" aria-hidden="true">
                    {Array.from({ length: Number(a.h) }, (_, j) => (
                      <Plane key={j} size={14} strokeWidth={2.25} />
                    ))}
                  </div>
                )}
                {a.photo === "wall" && (
                  <div className="pf-trip-img">
                    <img
                      src={greatWallTents}
                      alt="Tents lit up at night by the Great Wall"
                      loading="lazy"
                    />
                  </div>
                )}
                <figcaption>
                  <b>{a.h}</b>
                  <span>{a.b}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ═════ Contact ═════ */}
      <section className="pf-contact" id="contact">
        <div className="pf-contact-box">
          <h2>Let’s talk.</h2>
          <p>
            Bring me anything tangled. Especially if it’s circular economy, alternative materials,
            or anything built to last.
          </p>
          <a href={`mailto:${LINKS.email}`} className="btn pf-contact-cta">
            {LINKS.email} ↗
          </a>
          <div className="pf-foot">
            <a href={LINKS.linkedin} target="_blank" rel="noopener noreferrer">
              LinkedIn
            </a>
            <a href={LINKS.github} target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
            <span className="pf-foot-c">© 2026 Ashleigh Chua</span>
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
