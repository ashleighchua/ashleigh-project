/*
 * How I got here, as a Camino walk. The section pins while you scroll, and scrolling
 * walks the cat along the route: the world slides past in parallax, and at each stop
 * she hops, the skill bubble pops, and its stamp lands in the strip below. Cofounder is
 * the current stop, not the finish: the road keeps going.
 *
 * Scroll is handled in one rAF-throttled handler that writes transforms straight to
 * the DOM. React only re-renders when something is collected, landed, or finished.
 *
 * Scene units: 500 tall, ground at SG, world 3820 wide. How much of the world is in view
 * (V) depends on the box: a wide screen sees more road rather than bigger art, and a
 * phone gets a closer camera so the signposts stay readable.
 */
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import {
  ArrowDown,
  Fish,
  FlaskConical,
  Key,
  Mail,
  Moon,
  Music,
  RotateCcw,
  Search,
  type LucideIcon,
} from "lucide-react";
import { CatSvg } from "./cat";
import { CAMINO_END, STOPS, type StopIcon } from "./data";
import "./Camino.css";

const ICON: Record<StopIcon, LucideIcon> = {
  flask: FlaskConical,
  music: Music,
  search: Search,
  moon: Moon,
  mail: Mail,
  key: Key,
};
function StopGlyph({ icon, size, color }: { icon: StopIcon; size: number; color: string }) {
  const I = ICON[icon];
  return <I size={size} color={color} strokeWidth={2.75} aria-hidden="true" />;
}

/* ── the world ── */
const SH = 500;
const SG = 372;
const WORLD = 3820;
/** the "Still walking →" sign */
const MORE_X = 3520;
const SX = (i: number) => 600 + i * 480;
/** fish treats every 84 units, clear of the stops */
const TREATS: number[] = [];
for (let x = 330; x < 3340; x += 84)
  if (!STOPS.some((_, i) => Math.abs(SX(i) - x) < 60)) TREATS.push(x);
/** where she stops, in world units: just short of the "Still walking →" sign */
const WALK_END = MORE_X - 40;
/** the widest view of the road, and the closest a small screen zooms out to */
const MAX_V = 1500;
const MIN_K = 0.75;
const STAMP_ROT = [-8, 6, -4, 9, -10, 5];

const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const at = (left: number, top: number, width?: number, height?: number): CSSProperties => ({
  position: "absolute",
  left,
  top,
  width,
  height,
});

/** The scallop shell on the pack: a fan of seven scalloped lobes from a hinge */
const SHELL = (() => {
  const cx = 34;
  const cy = 25.5;
  const r = 9.6;
  const n = 7;
  const a0 = Math.PI * 1.17;
  const a1 = Math.PI * 1.83;
  const pt = (a: number, rr: number) =>
    [cx + Math.cos(a) * rr, cy + Math.sin(a) * rr].map((v) => v.toFixed(2)).join(" ");
  let d = `M${cx} ${cy} L${pt(a0, r)}`;
  const ribs: string[] = [];
  for (let k = 0; k < n; k++) {
    const a = a0 + ((a1 - a0) * (k + 1)) / n;
    const am = a0 + ((a1 - a0) * (k + 0.5)) / n;
    d += ` Q${pt(am, r + 2.4)} ${pt(a, r)}`;
    if (k < n - 1) ribs.push(`M${cx} ${cy} L${pt(a, r - 0.4)}`);
  }
  return { outline: `${d} Z`, ribs };
})();

/** the pilgrim pack, in the cat's own 84 × 58 space; it swells as it fills */
function Pack({ colors }: { colors: string[] }) {
  return (
    <g className="cm-pack" style={{ transform: `scale(${1 + colors.length * 0.075})` }}>
      {colors.map((c, k) => (
        <circle key={k} cx={28 + (k % 3) * 6} cy={6 - Math.floor(k / 3) * 3.4} r={3} fill={c} />
      ))}
      <path
        d="M30 6 Q 34 0.5 38 6"
        stroke="var(--color-accent-800)"
        strokeWidth={2}
        fill="none"
        strokeLinecap="round"
      />
      <rect x={22} y={5} width={24} height={23} rx={9} fill="var(--color-accent-2-600)" />
      <rect x={22} y={5} width={24} height={10} rx={7} fill="var(--color-accent-2-700)" />
      <rect x={32.5} y={11.5} width={3} height={4.5} rx={1} fill="var(--color-accent-200)" />
      <path
        d={SHELL.outline}
        fill="var(--color-accent-100)"
        stroke="var(--color-accent-400)"
        strokeWidth={0.7}
        strokeLinejoin="round"
      />
      {SHELL.ribs.map((d) => (
        <path
          key={d}
          d={d}
          stroke="var(--color-accent-400)"
          strokeWidth={0.8}
          strokeLinecap="round"
        />
      ))}
      <path
        d="M30.6 26.6 L31.6 24.4 L36.4 24.4 L37.4 26.6 Q 34 27.6 30.6 26.6 Z"
        fill="var(--color-accent-200)"
        stroke="var(--color-accent-400)"
        strokeWidth={0.6}
        strokeLinejoin="round"
      />
    </g>
  );
}

/** a confetti burst: `n` bits flung outward */
function Burst({
  n,
  r,
  colors,
  delay = 0,
  dur = 0.7,
  lift = 0,
  style,
}: {
  n: number;
  r: [number, number];
  colors: string[];
  delay?: number;
  dur?: number;
  lift?: number;
  style: CSSProperties;
}) {
  return (
    <div className="cm-burst" style={style} aria-hidden="true">
      {Array.from({ length: n }, (_, k) => {
        const a = (k / n) * Math.PI * 2;
        return (
          <span
            key={k}
            style={
              {
                borderRadius: k % 2 ? 999 : 3,
                background: colors[k % colors.length],
                animationDuration: `${dur}s`,
                animationDelay: `${delay + (k % 3) * 0.05}s`,
                "--dx": `${Math.cos(a) * r[0]}px`,
                "--dy": `${Math.sin(a) * r[1] - lift}px`,
              } as CSSProperties
            }
          />
        );
      })}
    </div>
  );
}

type Geo = { k: number; V: number; catBase: number; cam: number; walk: number };
/** a stop's bubble arcing into the pack, from where it was on screen when collected */
type Toss = { i: number; sx: number; sy: number; px: number; py: number };

export function Camino({ onInView }: { onInView?: (inView: boolean) => void }) {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  /* collected, landed in the pack (0.8s later), and what's still in the air */
  const [got, setGot] = useState(0);
  const [landed, setLanded] = useState(0);
  const [tosses, setTosses] = useState<Toss[]>([]);
  const [popped, setPopped] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const [started, setStarted] = useState(false);

  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const skyRef = useRef<HTMLDivElement>(null);
  const sunRef = useRef<HTMLDivElement>(null);
  const layerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const catRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const fishRef = useRef<HTMLSpanElement>(null);
  const treatRefs = useRef<(HTMLDivElement | null)[]>([]);

  /** everything the scroll handler keeps between frames */
  const run = useRef({ p: 0, reach: 0, got: 0, eaten: 0, dir: 1, done: false, started: false });
  const walkTimer = useRef<number | undefined>(undefined);
  const timers = useRef<number[]>([]);
  useEffect(
    () => () => {
      timers.current.forEach(clearTimeout);
      clearTimeout(walkTimer.current);
    },
    [],
  );

  /* how big the scene is drawn, and how much road is in view */
  const [box, setBox] = useState({ w: 820, h: 500 });
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setBox({ w: el.clientWidth, h: el.clientHeight }));
    ro.observe(el);
    return () => ro.disconnect();
  }, [reduced]);
  const k = Math.max(0.3, Math.min(box.h / SH, Math.max(box.w / 820, MIN_K)));
  const V = Math.min(box.w / k, MAX_V);
  const catBase = Math.min(220, V * 0.3);
  const cam = WORLD - V;
  // she holds her spot while the world scrolls, then walks the last stretch on screen.
  // Both share one road at one speed, so the walk doesn't rush once the camera stops.
  const walk = cam + Math.max(0, WALK_END - cam - catBase);
  const geo = useRef<Geo>({ k, V, catBase, cam, walk });
  geo.current = { k, V, catBase, cam, walk };

  /** one frame of scroll: move the world and the cat, eat treats, collect stops */
  const update = useCallback((moved: boolean) => {
    const sec = sectionRef.current;
    if (!sec) return;
    const R = run.current;
    const G = geo.current;
    // measured against the pinned stage, not innerHeight: a phone's URL bar changes
    // innerHeight mid-scroll, which made the whole walk lurch
    const pin = stageRef.current?.offsetHeight ?? window.innerHeight;
    const max = sec.offsetHeight - pin;
    const p = clamp(-sec.getBoundingClientRect().top / Math.max(1, max));
    const d = p * G.walk;
    const camX = Math.min(d, G.cam);
    const catX = G.catBase + Math.max(0, d - G.cam);
    const world = camX + catX;

    layerRefs.current.forEach((el) => {
      if (el) el.style.transform = `translate3d(${-camX * Number(el.dataset["f"])}px,0,0)`;
    });
    const warm = Math.round(p * 60);
    if (skyRef.current)
      skyRef.current.style.background = `linear-gradient(var(--color-bg) 0%, color-mix(in oklch, var(--color-accent-100) ${40 + warm}%, var(--color-bg)) 70%)`;
    if (sunRef.current) {
      const s = sunRef.current.style;
      s.left = `${120 + (G.V - 260) * p}px`;
      s.top = `${150 - Math.sin(p * Math.PI) * 80}px`;
      s.background = `color-mix(in oklch, var(--color-accent-300) ${30 + warm}%, var(--color-accent-100))`;
    }

    // she faces the way you're scrolling, and walks while the scroll keeps coming
    const cat = catRef.current;
    if (cat) {
      if (p !== R.p) R.dir = p < R.p ? -1 : 1;
      cat.style.left = `${catX - 75}px`;
      cat.classList.toggle("is-back", R.dir < 0);
      if (moved && p !== R.p && p < 1) {
        cat.classList.add("is-walking");
        clearTimeout(walkTimer.current);
        walkTimer.current = window.setTimeout(() => cat.classList.remove("is-walking"), 160);
      }
    }
    R.p = p;
    if (fillRef.current) fillRef.current.style.width = `${p * 100}%`;

    // treats get eaten as she passes them, and stay eaten
    R.reach = Math.max(R.reach, world);
    while (R.eaten < TREATS.length && TREATS[R.eaten]! < R.reach - 8) {
      treatRefs.current[R.eaten]?.classList.add("is-eaten");
      R.eaten++;
    }
    if (fishRef.current) fishRef.current.textContent = `${R.eaten}/${TREATS.length}`;

    // collecting is one way: scrolling back doesn't put anything back
    let n = R.got;
    const fresh: Toss[] = [];
    while (n < STOPS.length && SX(n) <= R.reach + 10) {
      const px = R.dir < 0 ? catX + 14 : catX - 14;
      const py = SG - 48;
      fresh.push({ i: n, sx: SX(n) - camX - px, sy: SG - 190 - py, px, py });
      n++;
    }
    if (fresh.length) {
      R.got = n;
      setGot(n);
      setTosses((t) => [...t, ...fresh]);
      setPopped(n - 1);
      timers.current.push(
        window.setTimeout(() => {
          setLanded((l) => Math.max(l, n));
          setTosses((t) => t.filter((x) => x.i >= n));
        }, 800),
        window.setTimeout(() => setPopped((v) => (v === n - 1 ? null : v)), 2400),
      );
    }
    const isDone = R.got === STOPS.length && p > 0.97;
    if (isDone !== R.done) {
      R.done = isDone;
      setDone(isDone);
    }
    const isStarted = p >= 0.015 || R.got > 0;
    if (isStarted !== R.started) {
      R.started = isStarted;
      setStarted(isStarted);
    }
  }, []);

  useEffect(() => {
    if (reduced) return;
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        update(true);
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [reduced, update]);
  // re-place everything (without walking) when the view changes size
  useLayoutEffect(() => {
    if (!reduced) update(false);
  }, [reduced, update, k, V]);

  // one cat on the page: while she's out walking, the roaming cat steps aside
  useEffect(() => {
    const el = stageRef.current;
    if (!el || !onInView) return;
    const io = new IntersectionObserver((e) => onInView(e[0]!.isIntersecting), {
      threshold: 0.3,
    });
    io.observe(el);
    return () => {
      io.disconnect();
      onInView(false);
    };
  }, [onInView, reduced]);

  const restart = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    run.current = { p: 0, reach: 0, got: 0, eaten: 0, dir: 1, done: false, started: false };
    treatRefs.current.forEach((t) => t?.classList.remove("is-eaten"));
    setGot(0);
    setLanded(0);
    setTosses([]);
    setPopped(null);
    setDone(false);
    setStarted(false);
    // jump, don't glide: a smooth scroll back would walk her through every stop again
    const sec = sectionRef.current;
    if (sec)
      window.scrollTo({
        top: sec.getBoundingClientRect().top + window.scrollY,
        behavior: "instant",
      });
    update(false);
  };

  const srList = (
    <ol className="cm-sr">
      {STOPS.map((s) => (
        <li key={s.place}>
          {s.place}, {s.meta}: {s.skill}
        </li>
      ))}
    </ol>
  );
  const head = (
    <div className="cm-top">
      <div className="pf-head">
        <h2 id="cm-h">How I got here</h2>
        <p>I took the scenic route.</p>
      </div>
    </div>
  );

  /* reduced motion: no walk, just the stops in a row and every stamp in place */
  if (reduced) {
    return (
      <section className="cm cm--still" id="path" aria-labelledby="cm-h" ref={sectionRef}>
        <div className="cm-stage" ref={stageRef}>
          {head}
          {srList}
          <ol className="cm-posts" aria-hidden="true">
            {STOPS.map((s) => (
              <li key={s.place}>
                <Signpost s={s} />
              </li>
            ))}
          </ol>
          <Stamps landed={STOPS.length} />
        </div>
      </section>
    );
  }

  const stage = Math.min(STOPS.length, got + 1);
  const here = STOPS[Math.min(STOPS.length - 1, got)]!;
  const packColors = STOPS.slice(0, landed).map((s) => s.color);

  return (
    <section className="cm" id="path" aria-labelledby="cm-h" ref={sectionRef}>
      <div className="cm-stage" ref={stageRef}>
        {head}
        {srList}

        <div className="cm-box" ref={boxRef}>
          <div
            className={`cm-view${done ? " is-done" : ""}`}
            style={{ width: V * k, height: SH * k }}
          >
            <div
              className="cm-scene"
              aria-hidden="true"
              style={{ width: V, height: SH, transform: `scale(${k})`, "--k": k } as CSSProperties}
            >
              <div className="cm-sky" ref={skyRef} />
              <div className="cm-sun" ref={sunRef} />
              <Layer f={0.08} refs={layerRefs} i={0}>
                {Array.from({ length: 7 }, (_, j) => (
                  <div
                    key={j}
                    className="cm-mountain"
                    style={at(-80 + j * 230, SG - 230 + (j % 3) * 26, 300, 300)}
                  />
                ))}
              </Layer>
              <Layer f={0.15} refs={layerRefs} i={1}>
                {Array.from({ length: 10 }, (_, j) => (
                  <div key={j} style={at(80 + j * 300 + (j % 2) * 90, 80 + (j % 3) * 34)}>
                    <div className="cm-cloud" style={at(0, 14, 120, 32)} />
                    <div className="cm-cloud" style={at(30, 0, 56, 44)} />
                  </div>
                ))}
              </Layer>
              <Layer f={0.35} refs={layerRefs} i={2}>
                {Array.from({ length: 8 }, (_, j) => (
                  <div
                    key={j}
                    className="cm-hill"
                    style={at(-120 + j * 380, SG - 150 + (j % 3) * 34, 560, 420)}
                  />
                ))}
              </Layer>
              <Layer f={0.65} refs={layerRefs} i={3}>
                {Array.from({ length: 12 }, (_, j) => (
                  <div key={j} style={at(60 + j * 300 + (j % 2) * 70, SG - 120 - (j % 3) * 22)}>
                    <div className="cm-trunk" style={at(24, 52, 12, 80)} />
                    <div
                      className={`cm-crown${j % 2 ? " cm-crown--b" : ""}`}
                      style={at(0, 0, 60, 70)}
                    />
                  </div>
                ))}
              </Layer>

              <Layer f={1} refs={layerRefs} i={4} z={2}>
                <World got={got} treatRefs={treatRefs} tosses={tosses} />
              </Layer>

              {/* the skill tokens arcing into her pack */}
              {tosses.map((t) => (
                <div
                  key={`toss${t.i}`}
                  className="cm-toss"
                  style={
                    {
                      ...at(t.px - 22, t.py - 22, 44, 44),
                      background: STOPS[t.i]!.color,
                      "--sx": `${t.sx}px`,
                      "--sy": `${t.sy}px`,
                    } as CSSProperties
                  }
                >
                  <StopGlyph icon={STOPS[t.i]!.icon} size={20} color="#fff" />
                </div>
              ))}

              <div className="cm-cat" ref={catRef} style={at(catBase - 75, SG + 30 - 104)}>
                <div key={`hop${got}`} className={got ? "cm-hop" : undefined}>
                  <div className="cm-bob">
                    <div className="cm-flip">
                      <CatSvg width={150}>
                        <Pack colors={packColors} />
                      </CatSvg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* HUD, at real size so it reads on a phone */}
            <div className="cm-hud" aria-hidden="true">
              <div className="cm-hud-stage">
                <b>
                  STAGE {stage}/{STOPS.length}
                </b>
                <span>{here.place}</span>
              </div>
              <div className="cm-hud-track">
                <div className="cm-hud-fill" ref={fillRef} />
                {STOPS.map((s, i) => (
                  <span
                    key={s.place}
                    style={{
                      left: `${clamp((SX(i) - 10 - catBase) / walk) * 100}%`,
                      background: i < got ? s.color : undefined,
                    }}
                  />
                ))}
              </div>
              <div className="cm-hud-fish">
                <Fish
                  size={18}
                  strokeWidth={2.75}
                  color="var(--color-accent-700)"
                  fill="var(--color-accent-200)"
                />
                <span ref={fishRef}>0/{TREATS.length}</span>
              </div>
            </div>

            {!started && (
              <div className="cm-start" aria-hidden="true">
                <span>Scroll to start</span>
                <ArrowDown size={26} strokeWidth={2.75} />
              </div>
            )}

            {popped !== null && (
              <div key={`pop${popped}`} className="cm-picked" aria-hidden="true">
                <span className="cm-picked-dot" style={{ background: STOPS[popped]!.color }}>
                  <StopGlyph icon={STOPS[popped]!.icon} size={18} color="#fff" />
                </span>
                <span>
                  <small>Stamped</small>
                  <b>{STOPS[popped]!.skill}</b>
                </span>
              </div>
            )}

            {done && <Passport fish={run.current.eaten} onRestart={restart} />}
          </div>
        </div>

        {/* folds away once the passport opens, so the stamps aren't shown twice */}
        <div className={`cm-strip-fold${done ? " is-folded" : ""}`}>
          <div inert={done}>
            <Stamps landed={landed} onRestart={restart} />
          </div>
        </div>
      </div>
    </section>
  );
}

/** a parallax layer: the scroll handler slides it by camX × f */
function Layer({
  f,
  i,
  z = 0,
  refs,
  children,
}: {
  f: number;
  i: number;
  z?: number;
  refs: React.MutableRefObject<(HTMLDivElement | null)[]>;
  children: React.ReactNode;
}) {
  return (
    <div
      className="cm-layer"
      data-f={f}
      style={{ zIndex: z }}
      ref={(el) => {
        refs.current[i] = el;
      }}
    >
      {children}
    </div>
  );
}

function Signpost({ s }: { s: (typeof STOPS)[number] }) {
  return (
    <div className="cm-board">
      <small>{s.kicker}</small>
      <b>{s.place}</b>
      <span>{s.meta}</span>
    </div>
  );
}

/** the ground, the path, the stops and the treats: everything that moves at f = 1 */
function World({
  got,
  treatRefs,
  tosses,
}: {
  got: number;
  treatRefs: React.MutableRefObject<(HTMLDivElement | null)[]>;
  tosses: Toss[];
}) {
  return (
    <>
      <div className="cm-ground" style={at(-40, SG, WORLD + 80, SH - SG)} />
      <div className="cm-dirt" style={at(-40, SG + 14, WORLD + 80, 30)} />
      <div className="cm-dash" style={at(0, SG + 27, WORLD)} />
      {Array.from({ length: 60 }, (_, j) => {
        const gx = 40 + j * 64 + (j % 4) * 9;
        const gy = SG + 58 + (j % 3) * 22;
        return (
          <div key={j}>
            <div className="cm-tuft" style={at(gx, gy)}>
              {[10, 16, 12].map((h, q) => (
                <i key={q} style={{ height: h }} />
              ))}
            </div>
            {j % 5 === 2 && (
              <div
                className={`cm-flower${j % 2 ? " cm-flower--b" : ""}`}
                style={at(gx + 26, gy - 2, 9, 9)}
              />
            )}
          </div>
        );
      })}
      {Array.from({ length: 15 }, (_, j) => (
        <div key={j} style={at(140 + j * 250 + (j % 3) * 30, SG - 26)}>
          <div className="cm-bush" style={at(0, 0, 46, 40)} />
          <div className="cm-bush cm-bush--b" style={at(30, 8, 36, 32)} />
        </div>
      ))}

      {STOPS.map((s, i) => {
        const x = SX(i);
        const isGot = i < got;
        const tint = (q: number) => `color-mix(in oklch, ${s.color} ${q}%, var(--color-bg))`;
        const popping = tosses.some((t) => t.i === i);
        return (
          <div key={s.place}>
            <div style={at(x - 300, SG - 120, 190, 138)}>
              <div className="cm-post" style={at(89, 50, 12, 88)} />
              <div className="cm-board-at">
                <Signpost s={s} />
              </div>
            </div>
            {!isGot && (
              <div style={at(x - 62, SG - 252, 124, 124)} className="cm-bubble-at">
                <div
                  className="cm-bubble"
                  style={{
                    background: `radial-gradient(circle at 50% 40%, ${tint(10)} 0 45%, ${tint(35)} 100%)`,
                    borderColor: s.color,
                    boxShadow: `0 0 0 ${i === got ? 10 : 6}px ${tint(22)}, 0 0 36px ${tint(60)}`,
                    animationDelay: `${i * 0.3}s`,
                  }}
                >
                  <i className="cm-shine" />
                  <i className="cm-shine cm-shine--dot" />
                  <span className="cm-bubble-dot" style={{ background: s.color }}>
                    <StopGlyph icon={s.icon} size={17} color="#fff" />
                  </span>
                  <small>Skill</small>
                  <b>{s.skill}</b>
                </div>
              </div>
            )}
            {popping && (
              <>
                <div
                  className="cm-ring"
                  style={{ ...at(x - 70, SG - 260, 140, 140), borderColor: s.color }}
                />
                <Burst
                  n={10}
                  r={[90, 90]}
                  colors={[s.color, "var(--color-accent-300)"]}
                  style={at(x - 5, SG - 195)}
                />
              </>
            )}
          </div>
        );
      })}

      {TREATS.map((x, j) => (
        <div
          key={x}
          className="cm-treat"
          ref={(el) => {
            treatRefs.current[j] = el;
          }}
          style={at(x - 11, SG - 18)}
        >
          <Fish
            size={22}
            strokeWidth={2.4}
            color="var(--color-accent-700)"
            fill="var(--color-accent-200)"
            style={{ animationDelay: `${(j % 5) * 0.2}s` }}
          />
        </div>
      ))}

      <div style={at(MORE_X, SG - 112, 200, 130)}>
        <div className="cm-post cm-post--light" style={at(94, 40, 12, 90)} />
        <div className="cm-more" style={at(0, 0, 200)}>
          <small>{CAMINO_END.sign.kicker}</small>
          <b>{CAMINO_END.sign.h}</b>
        </div>
      </div>
    </>
  );
}

/** one rubber stamp: dashed outer ring, solid inner ring, the stop's icon */
function Stamp({ s, on, delay }: { s: (typeof STOPS)[number]; on: boolean; delay?: number }) {
  return (
    <span
      className={`cm-stamp${on ? " is-on" : ""}`}
      style={{ color: on ? s.color : undefined, animationDelay: delay ? `${delay}s` : undefined }}
    >
      <span>
        <StopGlyph icon={s.icon} size={18} color="currentColor" />
      </span>
    </span>
  );
}

/** The end of the walk: her pilgrim's passport, every stamp in, and a blank one
 *  waiting for whatever's next. Two facing pages on a wide screen, one on a phone. */
function Passport({ fish, onRestart }: { fish: number; onRestart: () => void }) {
  const P = CAMINO_END.passport;
  return (
    <div className="cm-passport" role="group" aria-label="Completed passport">
      <div className="cm-pp-page cm-pp-cover">
        <small>{P.kicker}</small>
        <b>{P.name}</b>
        <dl>
          <div>
            <dt>Stops</dt>
            <dd>{STOPS.length}</dd>
          </div>
          <div>
            <dt>Fish eaten</dt>
            <dd>
              {fish}/{TREATS.length}
            </dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd>{P.status}</dd>
          </div>
        </dl>
        <a className="cm-pp-next" href="#contact">
          <span className="cm-pp-blank" aria-hidden="true">
            ?
          </span>
          <span>
            <b>{P.next} →</b>
            <em>{P.nextNote}</em>
          </span>
        </a>
      </div>
      <ol className="cm-pp-page cm-pp-stamps">
        {STOPS.map((s, i) => (
          <li key={s.place} style={{ "--rot": `${STAMP_ROT[i]}deg` } as CSSProperties}>
            <Stamp s={s} on delay={0.5 + i * 0.14} />
            <em>{s.skill}</em>
          </li>
        ))}
      </ol>
      <Burst
        n={16}
        r={[160, 110]}
        lift={20}
        dur={1.2}
        delay={0.3}
        colors={STOPS.map((x) => x.color)}
        style={{ left: "50%", top: "45%" }}
      />
      <button
        type="button"
        className="btn btn-ghost cm-pp-again"
        onClick={onRestart}
        aria-label="Walk it again from the start"
      >
        <RotateCcw size={16} strokeWidth={2.75} aria-hidden="true" />
      </button>
    </div>
  );
}

/** the strip under the scene: a stamp per skill, thumped in as each one lands */
function Stamps({ landed, onRestart }: { landed: number; onRestart?: () => void }) {
  return (
    <div className="cm-strip">
      <b className="cm-strip-head">Skills collected along the way</b>
      <ol className="cm-page" aria-hidden="true">
        {STOPS.map((s, i) => {
          const on = i < landed;
          return (
            <li key={s.place} style={{ "--rot": `${STAMP_ROT[i]}deg` } as CSSProperties}>
              <Stamp s={s} on={on} />
              <em className={on ? "is-on" : undefined}>{s.skill}</em>
            </li>
          );
        })}
      </ol>
      {onRestart && (
        <button
          type="button"
          className="btn btn-ghost cm-restart"
          onClick={onRestart}
          aria-label="Walk it again from the start"
        >
          <RotateCcw size={18} strokeWidth={2.75} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
