// GrowingStats — "Welcome to my garden".
// Top card: two plants in a raised bed and a watering can you pick up and drag over them (or tap, and it
// waters the next pot for you). Each stem grows while you pour, then its number counts up.
// Bottom card: the third pot waters itself on a drip line and grows when scrolled into view.
// Scenes are laid out at a design size and scaled to fit, so phones get the same picture.
// Respects prefers-reduced-motion (shows everything grown).
import { useCallback, useEffect, useRef, useState, type PointerEvent } from "react";
import "./GrowingStats.css";

type Stat = {
  target: number;
  fmt: (v: number) => string;
  caption: string;
  href: string;
  tone: "accent" | "sage";
};

const STATS: Stat[] = [
  {
    target: 4,
    fmt: (v) => `${v} month${v === 1 ? "" : "s"}`,
    caption: "from virtual assistant to cofounder",
    href: "#schooltrips",
    tone: "accent",
  },
  {
    target: 50,
    fmt: (v) => `+${v}%`,
    caption: "a client tipped 50% above my quote",
    href: "#hannah",
    tone: "accent",
  },
  {
    target: 100,
    fmt: (v) => `${v}+`,
    caption: "orders, from a system I built once",
    href: "#lunar",
    tone: "sage",
  },
];
const BUSH = [
  { x: -36, h: 70 },
  { x: -20, h: 112 },
  { x: -4, h: 88 },
  { x: 14, h: 60 },
  { x: -50, h: 44 },
];

/** design sizes: the top scene is two 360px columns, the bottom one column */
const TOP_W = 720;
const AUTO_W = 360;
/** only the part above the shelf is shown; plants are placed from the scene's bottom */
const SCENE_H = 540;
const SHOW_H = 440;
const SHELF_Y = 402;
/** the can resting on the shelf, between the pots */
const CAN_W = 130;
const CAN_H = 64;
/** where the spout's tip is, inside the can's box */
const SPOUT = { x: 10, y: 0 };
/** how long it takes to water a pot fully */
const POUR_S = 1.8;
/** watering has three beats: the stem climbs first, then the leaves, then the bloom */
const STEM_END = 0.62;
const LEAF_A = 0.72;
const LEAF_B = 0.86;

/** module-level so it is stable: the count effect keys off it */
const AUTO_FMT = (v: number) => `${v}+`;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const clamp = (v: number) => Math.max(0, Math.min(1, v));
/** how far up the stem has climbed, for a pot that is `w` watered */
const stemP = (w: number) => clamp(w / STEM_END);

/** scales a scene to the width it has; `k` also feeds the label sizes so they stay readable */
function useFit(design: number) {
  const ref = useRef<HTMLDivElement>(null);
  const [k, setK] = useState(1);
  const [w, setW] = useState(design);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      setW(el.clientWidth);
      setK(Math.min(1, el.clientWidth / design));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [design]);
  return { ref, k, sceneW: k < 1 ? design : w };
}

/** Counts up to `target`, writing the number straight into the node. Holding it in
 *  React state re-rendered the whole scene on every frame of the count, which is what
 *  made scrolling past this section stutter. `onStep` fires only when the number
 *  actually changes, so the blooms it drives cost five renders, not a hundred. */
function useCountTo(
  ref: React.RefObject<HTMLElement | null>,
  target: number,
  on: boolean,
  dur: number,
  fmt: (v: number) => string,
  idle: string,
  onStep?: (v: number) => void,
) {
  const step = useRef(onStep);
  step.current = onStep;
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!on) {
      el.textContent = idle;
      step.current?.(0);
      return;
    }
    let raf = 0;
    let shownV = -1;
    const t0 = performance.now();
    const f = (now: number) => {
      const p = dur > 0 ? Math.min(1, (now - t0) / dur) : 1;
      const v = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (v !== shownV) {
        shownV = v;
        el.textContent = fmt(v);
        step.current?.(v);
      }
      if (p < 1) raf = requestAnimationFrame(f);
    };
    raf = requestAnimationFrame(f);
    return () => cancelAnimationFrame(raf);
  }, [ref, target, on, dur, fmt, idle]);
}

function StatBlock({ m, shown, idle }: { m: Stat; shown: boolean; idle: string }) {
  const num = useRef<HTMLSpanElement>(null);
  useCountTo(num, m.target, shown, 800, m.fmt, "?");
  return (
    <div className={`gs-stat gs-stat--${m.tone}${shown ? "" : " gs-stat--idle"}`}>
      <span className="gs-num" ref={num}>
        ?
      </span>
      <span className="gs-cap">{shown ? m.caption : idle}</span>
      <a href={m.href}>Receipt ↓</a>
    </div>
  );
}

export function GrowingStats() {
  const [reduced, setReduced] = useState(false);
  const [round, setRound] = useState(0);
  /** both cards report in; there is nothing to start over until they have all grown */
  const [topDone, setTopDone] = useState(false);
  const [autoDone, setAutoDone] = useState(false);
  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);
  const grown = topDone && autoDone;

  return (
    <section className="gs" aria-labelledby="gs-h">
      <div className="pf-head">
        <h2 id="gs-h">Welcome to my garden</h2>
        <p>What you water grows.</p>
      </div>
      <WaterMe key={`w${round}`} reduced={reduced} onDone={setTopDone} />
      <AutoPot key={`a${round}`} reduced={reduced} onDone={setAutoDone} />
      {/* sits below everything it replays, and holds its row even while hidden */}
      {!reduced && (
        <div className="gs-foot">
          <button
            type="button"
            className={`gs-replay${grown ? "" : " gs-replay--waiting"}`}
            onClick={() => setRound((r) => r + 1)}
          >
            Start over ↻
          </button>
        </div>
      )}
    </section>
  );
}

/* ── top card: water them yourself ── */

type Drag = { id: number; sx: number; sy: number; cx: number; cy: number; moved: boolean };

function WaterMe({ reduced, onDone }: { reduced: boolean; onDone: (v: boolean) => void }) {
  const { ref, k, sceneW } = useFit(TOP_W);
  const home = useCallback(() => ({ x: sceneW / 2 - CAN_W / 2, y: SHELF_Y - CAN_H }), [sceneW]);
  const [water, setWater] = useState<[number, number]>([0, 0]);
  const [can, setCan] = useState(home);
  const [held, setHeld] = useState(false);
  const [auto, setAuto] = useState(false);
  const drag = useRef<Drag | null>(null);
  const dragCleanup = useRef<(() => void) | null>(null);
  const waterRef = useRef(water);
  waterRef.current = water;

  useEffect(() => {
    if (reduced) setWater([1, 1]);
  }, [reduced]);

  // keep the resting can centred when the width changes
  useEffect(() => {
    if (!held && !auto) setCan(home());
  }, [home, held, auto]);

  const tip = { x: can.x + SPOUT.x, y: can.y + SPOUT.y };
  const potX = [sceneW / 4, (sceneW * 3) / 4];
  // pouring: the spout is over a pot that still needs water, above its soil
  const over = potX.findIndex((px) => Math.abs(tip.x - px) < 75 && tip.y < 280);
  const pouring = (held || auto) && over >= 0 && water[over]! < 1 ? over : -1;

  // grow whichever pot is being poured on
  useEffect(() => {
    if (pouring < 0) return;
    let raf = 0;
    let last = performance.now();
    const f = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      setWater((w) => {
        const n: [number, number] = [w[0], w[1]];
        n[pouring] = clamp(n[pouring]! + dt / POUR_S);
        return n;
      });
      raf = requestAnimationFrame(f);
    };
    raf = requestAnimationFrame(f);
    return () => cancelAnimationFrame(raf);
  }, [pouring]);

  /** tap or keyboard: carry the can to the next dry pot, pour, bring it back */
  const waterNext = async () => {
    const i = waterRef.current.findIndex((w) => w < 1);
    if (i < 0 || auto) return;
    setAuto(true);
    setCan({ x: potX[i]! - SPOUT.x + 8, y: 110 });
    await sleep(700);
    while (waterRef.current[i]! < 1) await sleep(100);
    await sleep(250);
    setCan(home());
    await sleep(600);
    setAuto(false);
  };

  /** Dragging is driven by window-level listeners rather than native pointer capture.
   *  Capture has two failure modes we hit in practice on mobile: some browsers drop the
   *  pointerup/pointercancel it owes a captured element, leaving the page unable to
   *  scroll or respond to taps ever again; others lose capture outright when the
   *  captured element sits under a CSS `transform: scale()` ancestor, which this scene
   *  always has on a phone. A window listener doesn't depend on capture at all, so
   *  neither failure mode applies, and it's trivial to guarantee cleanup on pointerup. */
  const onDown = (e: PointerEvent<HTMLButtonElement>) => {
    if (auto) return;
    const id = e.pointerId;
    const startK = k;
    const startSceneW = sceneW;
    const d: Drag = { id, sx: e.clientX, sy: e.clientY, cx: can.x, cy: can.y, moved: false };
    drag.current = d;

    const move = (ev: globalThis.PointerEvent) => {
      if (ev.pointerId !== id) return;
      const dx = (ev.clientX - d.sx) / startK;
      const dy = (ev.clientY - d.sy) / startK;
      if (!d.moved && Math.hypot(dx, dy) < 6) return;
      if (!d.moved) {
        d.moved = true;
        setHeld(true);
      }
      setCan({
        x: Math.max(-20, Math.min(startSceneW - CAN_W + 20, d.cx + dx)),
        y: Math.max(20, Math.min(SHELF_Y - CAN_H, d.cy + dy)),
      });
    };
    const cleanup = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      dragCleanup.current = null;
    };
    const up = (ev: globalThis.PointerEvent) => {
      if (ev.pointerId !== id) return;
      cleanup();
      drag.current = null;
      if (!d.moved) {
        waterNext();
        return;
      }
      setHeld(false);
      setCan({ x: startSceneW / 2 - CAN_W / 2, y: SHELF_Y - CAN_H });
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    dragCleanup.current = cleanup;
  };
  // if the card unmounts mid-drag (e.g. "Start over"), the window listeners above would
  // otherwise outlive it
  useEffect(() => () => dragCleanup.current?.(), []);

  const [w0, w1] = water;
  const done = w0 >= 1 && w1 >= 1;
  useEffect(() => {
    onDone(done);
  }, [done, onDone]);
  const soil = (w: number) => (w > 0 ? "var(--accent-900)" : "var(--accent-700)");

  return (
    <div className="gs-card">
      <div ref={ref} className="gs-stage" style={{ height: SHOW_H * k, ["--k" as string]: k }}>
        <div
          className="gs-scene"
          style={{
            width: k < 1 ? TOP_W : "100%",
            height: SCENE_H,
            transform: k < 1 ? `scale(${k})` : undefined,
          }}
        >
          <Garden />
          <div className="gs-grid gs-grid--2">
            {/* 1 · Sunflower up a ruler: Assistant → Cofounder */}
            <div className="gs-col">
              {/* the ruler shows up once watering starts; Cofounder as the flower gets there */}
              <div className="gs-ruler gs-fade" style={{ opacity: w0 > 0 ? 1 : 0 }} />
              <div className="gs-tick gs-fade" style={{ bottom: 262, opacity: w0 > 0 ? 1 : 0 }} />
              <span
                className="gs-ticklabel gs-fade"
                style={{ bottom: 256, opacity: w0 > 0 ? 1 : 0 }}
              >
                Assistant
              </span>
              <div
                className="gs-tick gs-tick--top gs-fade"
                style={{ bottom: 434, opacity: w0 > 0.9 ? 1 : 0 }}
              />
              <span
                className="gs-ticklabel gs-ticklabel--top gs-fade"
                style={{ bottom: 428, opacity: w0 > 0.9 ? 1 : 0 }}
              >
                Cofounder
              </span>
              <div
                className="gs-stem gs-stem--live"
                style={{ bottom: 246, height: 190 * stemP(w0) }}
              />
              <div
                className="gs-leaf gs-leaf--l"
                style={{ bottom: 326, transform: `rotate(-22deg) scale(${w0 > LEAF_A ? 1 : 0})` }}
              />
              <div
                className="gs-leaf gs-leaf--r"
                style={{ bottom: 370, transform: `rotate(22deg) scale(${w0 > LEAF_B ? 1 : 0})` }}
              />
              <div
                className="gs-sunflower"
                style={{
                  transform: `scale(${w0 >= 1 ? 1 : 0}) rotate(${w0 >= 1 ? 0 : -120}deg)`,
                }}
              >
                {Array.from({ length: 12 }, (_, j) => (
                  <span key={j} style={{ transform: `rotate(${j * 30}deg)` }} />
                ))}
                <i />
              </div>
              <Patch bottom={240} soil={soil(w0)} />
            </div>

            {/* 2 · Tulip past the quote line */}
            <div className="gs-col">
              {/* the quote line shows up once watering starts; what she paid when it blooms */}
              <div className="gs-line" style={{ bottom: 356, opacity: w1 > 0 ? 1 : 0 }} />
              <span className="gs-linelabel" style={{ bottom: 362, opacity: w1 > 0 ? 1 : 0 }}>
                the quote
              </span>
              <div
                className="gs-line gs-line--accent"
                style={{ bottom: 416, opacity: w1 >= 1 ? 1 : 0 }}
              />
              <span
                className="gs-linelabel gs-linelabel--accent"
                style={{ bottom: 422, opacity: w1 >= 1 ? 1 : 0 }}
              >
                what she paid
              </span>
              <div
                className="gs-stem gs-stem--live"
                style={{ bottom: 236, height: 180 * stemP(w1) }}
              />
              <div
                className="gs-leaf gs-leaf--l gs-leaf--wide"
                style={{ bottom: 290, transform: `rotate(-30deg) scale(${w1 > LEAF_A ? 1 : 0})` }}
              />
              <div
                className="gs-leaf gs-leaf--r gs-leaf--wide"
                style={{ bottom: 318, transform: `rotate(30deg) scale(${w1 > LEAF_B ? 1 : 0})` }}
              />
              <div className="gs-tulip" style={{ transform: `scale(${w1 >= 1 ? 1 : 0})` }}>
                <span />
                <span />
                <span />
              </div>
              <Patch bottom={240} soil={soil(w1)} />
            </div>
          </div>

          {pouring >= 0 && (
            <div
              className="gs-pour"
              style={{ left: tip.x, top: tip.y + 8, ["--fall" as string]: `${290 - tip.y}px` }}
            >
              {[-8, 3, -2, 9, -6, 6].map((x, j) => (
                <span key={j} style={{ left: x, animationDelay: `${j * 0.09}s` }} />
              ))}
            </div>
          )}

          {!reduced && (
            <button
              type="button"
              className={`gs-can gs-can--grab${held ? " gs-can--held" : ""}`}
              aria-label={done ? "Watering can (both plants are watered)" : "Water the next plant"}
              style={{
                left: can.x,
                top: can.y,
                transform: `rotate(${pouring >= 0 ? -30 : held ? -8 : 0}deg)`,
              }}
              onPointerDown={onDown}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  waterNext();
                }
              }}
            >
              <span className="gs-can-handle" />
              <span className="gs-can-spout" />
              <span className="gs-can-rose" />
              <span className="gs-can-body" />
              <span className="gs-can-moon" />
            </button>
          )}
        </div>
        {!reduced && !done && (
          <p className="gs-hint" aria-hidden="true">
            Pick up the watering can and water each plant
          </p>
        )}
      </div>
      <div className="gs-stats gs-stats--2">
        <StatBlock m={STATS[0]!} shown={w0 >= 1} idle="water me to find out" />
        <StatBlock m={STATS[1]!} shown={w1 >= 1} idle="water me to find out" />
      </div>
    </div>
  );
}

/* ── bottom card: waters itself ── */

function AutoPot({ reduced, onDone }: { reduced: boolean; onDone: (v: boolean) => void }) {
  const { ref, k } = useFit(AUTO_W);
  const [on, setOn] = useState(false);
  const [grown, setGrown] = useState(false);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (reduced) {
      setOn(true);
      setGrown(true);
      setShown(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    let alive = true;
    const io = new IntersectionObserver(
      async (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        setOn(true);
        await sleep(900);
        if (alive) setGrown(true);
        await sleep(500);
        if (alive) setShown(true);
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => {
      alive = false;
      io.disconnect();
    };
  }, [reduced, ref]);

  useEffect(() => {
    onDone(shown);
  }, [shown, onDone]);

  const num = useRef<HTMLSpanElement>(null);
  const [blooms, setBlooms] = useState(0);
  const onStep = useCallback((v: number) => setBlooms(Math.floor(v / 20)), []);
  useCountTo(num, 100, shown, reduced ? 0 : 1800, AUTO_FMT, "…", onStep);

  return (
    <div className="gs-card gs-card--auto">
      <div ref={ref} className="gs-stage" style={{ height: SHOW_H * k, ["--k" as string]: k }}>
        <div
          className="gs-scene"
          style={{
            width: AUTO_W,
            height: SCENE_H,
            transform: k < 1 ? `scale(${k})` : undefined,
          }}
        >
          <Garden small />
          <div className="gs-grid gs-grid--1">
            <div className="gs-col">
              <div className="gs-pipe-h" />
              <div className="gs-pipe-v" />
              <span className="gs-nozzle" />
              <span className="gs-autopilot" style={{ opacity: on ? 1 : 0 }}>
                on autopilot
              </span>
              {on && !reduced && <Drips />}
              {BUSH.map((b, j) => (
                <div key={j}>
                  <div
                    className="gs-bushstem"
                    style={{
                      left: `calc(50% + ${b.x}px)`,
                      height: b.h,
                      transform: `scaleY(${grown ? 1 : 0})`,
                      transitionDelay: `${j * 0.12}s`,
                    }}
                  />
                  <div
                    className="gs-daisy"
                    style={{
                      left: `calc(50% + ${b.x}px)`,
                      bottom: 226 + b.h - 14,
                      transform: `scale(${blooms > j ? 1.25 : 0})`,
                    }}
                  >
                    {[0, 72, 144, 216, 288].map((r) => (
                      <span key={r} style={{ transform: `rotate(${r}deg)` }} />
                    ))}
                    <i />
                  </div>
                </div>
              ))}
              <Patch bottom={224} soil={on ? "var(--accent-900)" : "var(--accent-700)"} />
            </div>
          </div>
        </div>
      </div>
      <div className="gs-stats gs-stats--auto">
        <div className={`gs-stat gs-stat--sage${shown ? "" : " gs-stat--idle"}`}>
          <span className="gs-num" ref={num}>
            …
          </span>
          <span className="gs-cap">{STATS[2]!.caption}</span>
          <a href={STATS[2]!.href}>Receipt ↓</a>
        </div>
      </div>
    </div>
  );
}

/** The scenery both cards share: sky, sun, a picket fence, grass, and one long
 *  raised bed the plants grow out of. Purely decoration; the plants sit on top. */
function Garden({ small }: { small?: boolean }) {
  // the bed tops out where the stems start: scene bottom 250, or 234 for the small card
  return (
    <div className="gs-garden" aria-hidden="true">
      <span className="gs-sun" />
      <span className="gs-cloud" style={{ left: small ? "8%" : "14%", top: 46 }} />
      {!small && <span className="gs-cloud gs-cloud--sm" style={{ left: "58%", top: 84 }} />}
      <div className="gs-fence">
        {Array.from({ length: small ? 12 : 24 }, (_, j) => (
          <span key={j} />
        ))}
      </div>
      <div className="gs-grass" />
      <div className={`gs-bed${small ? " gs-bed--sm" : ""}`}>
        <span className="gs-bed-soil" />
        {(small ? [16, 84] : [8, 40, 50, 60, 92]).map((x) => (
          <span key={x} className="gs-sprout" style={{ left: `${x}%` }} />
        ))}
      </div>
      {(small ? [12, 82] : [6, 30, 66, 92]).map((x, j) => (
        <span key={j} className="gs-tuft" style={{ left: `${x}%` }} />
      ))}
      {!small && <span className="gs-butterfly" />}
    </div>
  );
}

/** the patch of bed this plant grows from: it darkens once it's been watered */
function Patch({ bottom, soil }: { bottom: number; soil: string }) {
  return <div className="gs-soil" style={{ bottom, width: 96, background: soil }} />;
}
function Drips() {
  return (
    <div className="gs-drips">
      {[0, 1, 2].map((j) => (
        <span key={j} style={{ animationDelay: `${j * 0.3}s` }} />
      ))}
    </div>
  );
}
