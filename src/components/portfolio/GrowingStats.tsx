// GrowingStats — "What it's grown into" animated stats strip.
// Desktop (≥860px container): one scene, a watering can moves pot → pot.
// Stacked (<860px — phones and narrow tablets): three stacked cards, each plays when scrolled into view.
// Respects prefers-reduced-motion (shows the finished state).
import { useCallback, useEffect, useRef, useState } from "react";
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
    fmt: (v) => `${v} mo`,
    caption: "from virtual assistant to cofounder",
    href: "#schooltrips",
    tone: "accent",
  },
  {
    target: 50,
    fmt: (v) => `+${v}%`,
    caption: "a client paid over my quote",
    href: "#hannah",
    tone: "accent",
  },
  {
    target: 100,
    fmt: (v) => `${v}+`,
    caption: "orders delivered without me",
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
const ROW = 560;
const GAP = 16;
const CENTERS = [16.667, 50, 83.333];

type Trio = [number, number, number];
type State = {
  canX: number;
  rot: number;
  canM: Trio;
  rotM: Trio;
  pour: number;
  drip: boolean;
  grow: Trio;
  bloom: Trio;
  show: Trio;
  val: Trio;
  q2: boolean;
  wet: Trio;
};
type TrioKey = "canM" | "rotM" | "grow" | "bloom" | "show" | "val" | "wet";

const initial = (): State => ({
  canX: -1,
  rot: 0,
  canM: [-1, -1, -1],
  rotM: [0, 0, 0],
  pour: -1,
  drip: false,
  grow: [0, 0, 0],
  bloom: [0, 0, 0],
  show: [0, 0, 0],
  val: [0, 0, 0],
  q2: false,
  wet: [0, 0, 0],
});
const FINISHED: State = {
  canX: 3,
  rot: 0,
  canM: [1, 1, 1],
  rotM: [0, 0, 0],
  pour: -1,
  drip: false,
  grow: [1, 2, 1],
  bloom: [1, 1, 1],
  show: [1, 1, 1],
  val: [4, 50, 100],
  q2: true,
  wet: [1, 1, 1],
};
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
/** thrown to stop a sequence that a newer run has replaced */
const CANCELLED = new Error("cancelled");

export function GrowingStats() {
  const wrapRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const col0 = useRef<HTMLDivElement>(null);
  const col1 = useRef<HTMLDivElement>(null);
  const col2 = useRef<HTMLDivElement>(null);
  const colRefs = [col0, col1, col2];
  const tok = useRef([0, 0, 0]);
  const [mobile, setMobile] = useState(false);
  const [st, setSt] = useState(initial);
  const [reduced, setReduced] = useState(false);

  const patch = (obj: Partial<State> | ((s: State) => Partial<State>)) =>
    setSt((s) => ({ ...s, ...(typeof obj === "function" ? obj(s) : obj) }));
  const setAt = (k: TrioKey, i: number, v: number) =>
    setSt((s) => {
      const a = s[k].slice() as Trio;
      a[i] = v;
      return { ...s, [k]: a };
    });

  const count = (i: number, alive: () => boolean, dur: number) => {
    const t0 = performance.now();
    const f = (now: number) => {
      if (!alive()) return;
      const p = Math.min(1, (now - t0) / dur);
      setAt("val", i, Math.round(STATS[i]!.target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) requestAnimationFrame(f);
    };
    requestAnimationFrame(f);
  };

  const seq = useCallback(async (i: number, isMobile: boolean, tDesk?: number) => {
    const key = isMobile ? i : 0;
    const t = isMobile ? ++tok.current[i]! : tDesk!;
    const alive = () => t === tok.current[key];
    const go = async (ms: number) => {
      await sleep(ms);
      if (!alive()) throw CANCELLED;
    };
    const arrive = () => (isMobile ? setAt("canM", i, 0) : patch({ canX: i }));
    const tilt = (d: number) => (isMobile ? setAt("rotM", i, d) : patch({ rot: d }));
    const leave = () => {
      if (isMobile) setAt("canM", i, 1);
      else if (i === 2) patch({ canX: 3 });
    };
    const run = async () => {
      if (isMobile) {
        (["grow", "bloom", "show", "val", "wet", "rotM"] as const).forEach((k) => setAt(k, i, 0));
        setAt("canM", i, -1);
        if (i === 1) patch({ q2: false });
        await go(300);
      }
      arrive();
      await go(850);
      if (i < 2) {
        tilt(-30);
        await go(300);
        patch({ pour: i });
        setAt("wet", i, 1);
        await go(380);
        if (i === 0) {
          setAt("grow", 0, 1);
          await go(1150);
        } else {
          setAt("grow", 1, 1);
          await go(1000);
          setAt("grow", 1, 2);
          patch({ q2: true });
          await go(850);
        }
        patch((s) => ({ pour: s.pour === i ? -1 : s.pour }));
        tilt(0);
        await go(150);
        setAt("bloom", i, 1);
        await go(350);
        setAt("show", i, 1);
        count(i, alive, 800);
        if (isMobile) {
          await go(300);
          leave();
        }
        await go(500);
      } else {
        tilt(-12);
        await go(350);
        patch({ drip: true });
        setAt("wet", 2, 1);
        await go(500);
        tilt(0);
        await go(250);
        leave();
        setAt("grow", 2, 1);
        await go(500);
        setAt("show", 2, 1);
        count(2, alive, 1800);
        await go(2200);
        patch({ drip: false });
      }
    };
    if (isMobile) {
      try {
        await run();
      } catch {
        /* replaced by a newer run */
      }
    } else await run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const runAll = useCallback(async () => {
    const t = ++tok.current[0]!;
    setSt(initial());
    try {
      await sleep(400);
      for (let i = 0; i < 3; i++) await seq(i, false, t);
    } catch {
      /* replaced by a newer run */
    }
  }, [seq]);

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  // breakpoint by container width
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setMobile(el.clientWidth < 860));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // start on scroll into view (re-arms when layout switches)
  useEffect(() => {
    tok.current = tok.current.map((t) => t + 1);
    if (reduced) {
      setSt(FINISHED);
      return;
    }
    setSt(initial());
    const started = new Set<number>();
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const i = mobile ? colRefs.findIndex((r) => r.current === e.target) : -1;
          if (started.has(i)) return;
          started.add(i);
          if (i < 0) runAll();
          else seq(i, true);
        }),
      { threshold: 0.45 },
    );
    if (mobile) colRefs.forEach((r) => r.current && io.observe(r.current));
    else if (stageRef.current) io.observe(stageRef.current);
    return () => {
      io.disconnect();
      tok.current = tok.current.map((t) => t + 1);
    };
  }, [mobile, reduced]); // eslint-disable-line react-hooks/exhaustive-deps

  const replay = () => {
    if (reduced) return;
    if (mobile) [0, 1, 2].forEach((i) => seq(i, true));
    else runAll();
  };

  const s = st;
  const soil = (i: number) => (s.wet[i] ? "var(--accent-900)" : "var(--accent-700)");
  const blooms = Math.floor(s.val[2] / 20);
  const offLeft = "-190px";
  const offRight = "calc(100% + 80px)";
  const cans = mobile
    ? [0, 1, 2].map((i) => ({
        top: i * (ROW + GAP) + 30,
        rot: s.rotM[i]!,
        left: s.canM[i]! < 0 ? offLeft : s.canM[i]! > 0 ? offRight : "calc(50% + 4px)",
      }))
    : [
        {
          top: 30,
          rot: s.rot,
          left: s.canX < 0 ? offLeft : s.canX > 2 ? offRight : `calc(${CENTERS[s.canX]}% + 4px)`,
        },
      ];
  const shelves = mobile ? [0, 1, 2].map((i) => i * (ROW + GAP) + 402) : [402];

  return (
    <section
      ref={wrapRef}
      className={`gs ${mobile ? "gs--mobile" : ""}`}
      aria-label="What it's grown into"
    >
      <div className="gs-head">
        <h2>What it’s grown into</h2>
        <button type="button" className="gs-replay" onClick={replay}>
          Water again ↻
        </button>
      </div>
      <p className="gs-sub">Three things I planted. Two needed watering. One waters itself.</p>

      <div ref={stageRef} className="gs-stage" style={{ height: mobile ? ROW * 3 + GAP * 2 : 540 }}>
        {shelves.map((top) => (
          <div key={top} className="gs-shelf" style={{ top }} />
        ))}

        <div className="gs-grid">
          {/* 1 · Sunflower on a ruler: Assistant → Cofounder */}
          <div ref={col0} className="gs-col">
            <div className="gs-ruler" />
            <div className="gs-tick" style={{ bottom: 262 }} />
            <span className="gs-ticklabel" style={{ bottom: 256 }}>
              Assistant
            </span>
            <div className="gs-tick gs-tick--top" style={{ bottom: 434 }} />
            <span className="gs-ticklabel gs-ticklabel--top" style={{ bottom: 428 }}>
              Cofounder
            </span>
            <div
              className="gs-stem"
              style={{ bottom: 246, height: s.grow[0] ? 190 : 0, transitionDuration: "1.2s" }}
            />
            <div
              className="gs-leaf gs-leaf--l"
              style={{
                bottom: 326,
                transform: `rotate(-22deg) scale(${s.grow[0] ? 1 : 0})`,
                transitionDelay: ".5s",
              }}
            />
            <div
              className="gs-leaf gs-leaf--r"
              style={{
                bottom: 370,
                transform: `rotate(22deg) scale(${s.grow[0] ? 1 : 0})`,
                transitionDelay: ".8s",
              }}
            />
            <div
              className="gs-sunflower"
              style={{ transform: `scale(${s.bloom[0]}) rotate(${s.bloom[0] ? 0 : -120}deg)` }}
            >
              {Array.from({ length: 12 }, (_, k) => (
                <span key={k} style={{ transform: `rotate(${k * 30}deg)` }} />
              ))}
              <i />
            </div>
            <Pot bottom={138} w={130} h={100} soil={soil(0)} />
            {s.pour === 0 && <Drops />}
          </div>

          {/* 2 · Tulip past the quote line */}
          <div ref={col1} className="gs-col">
            <div className="gs-line" style={{ bottom: 356 }} />
            <span className="gs-linelabel" style={{ bottom: 362 }}>
              the quote
            </span>
            <div
              className="gs-line gs-line--accent"
              style={{ bottom: 416, opacity: s.q2 ? 1 : 0 }}
            />
            <span
              className="gs-linelabel gs-linelabel--accent"
              style={{ bottom: 422, opacity: s.q2 ? 1 : 0 }}
            >
              what she paid
            </span>
            <div
              className="gs-stem"
              style={{ bottom: 236, height: [0, 120, 180][s.grow[1]], transitionDuration: ".8s" }}
            />
            <div
              className="gs-leaf gs-leaf--l gs-leaf--wide"
              style={{
                bottom: 290,
                transform: `rotate(-30deg) scale(${s.grow[1] ? 1 : 0})`,
                transitionDelay: ".3s",
              }}
            />
            <div
              className="gs-leaf gs-leaf--r gs-leaf--wide"
              style={{
                bottom: 318,
                transform: `rotate(30deg) scale(${s.grow[1] ? 1 : 0})`,
                transitionDelay: ".5s",
              }}
            />
            <div className="gs-tulip" style={{ transform: `scale(${s.bloom[1]})` }}>
              <span />
              <span />
              <span />
            </div>
            <Pot bottom={138} w={120} h={90} soil={soil(1)} small />
            {s.pour === 1 && <Drops />}
          </div>

          {/* 3 · Self-watering: drip line, daisies pop as the count climbs */}
          <div ref={col2} className="gs-col">
            <div className="gs-pipe-h" />
            <div className="gs-pipe-v" />
            <span className="gs-nozzle" />
            <span className="gs-autopilot" style={{ opacity: s.drip || s.show[2] ? 1 : 0 }}>
              on autopilot
            </span>
            {s.drip && <Drips />}
            {BUSH.map((b, k) => (
              <div key={k}>
                <div
                  className="gs-bushstem"
                  style={{
                    left: `calc(50% + ${b.x}px)`,
                    height: s.grow[2] ? b.h : 0,
                    transitionDelay: `${k * 0.12}s`,
                  }}
                />
                <div
                  className="gs-daisy"
                  style={{
                    left: `calc(50% + ${b.x}px)`,
                    bottom: 226 + b.h - 14,
                    transform: `scale(${blooms > k ? 1.25 : 0})`,
                  }}
                >
                  {[0, 72, 144, 216, 288].map((r) => (
                    <span key={r} style={{ transform: `rotate(${r}deg)` }} />
                  ))}
                  <i />
                </div>
              </div>
            ))}
            <Pot bottom={138} w={110} h={80} soil={soil(2)} smallest />
          </div>
        </div>

        {STATS.map((m, i) => (
          <div
            key={i}
            className={`gs-stat gs-stat--${m.tone}`}
            style={{
              top: mobile ? i * (ROW + GAP) + 432 : 432,
              left: mobile ? 0 : `${i * 33.333}%`,
              width: mobile ? "100%" : "33.333%",
              opacity: s.show[i] ? 1 : 0,
              transform: `translateY(${s.show[i] ? 0 : 12}px)`,
            }}
          >
            <span className="gs-num">{m.fmt(s.val[i]!)}</span>
            <span className="gs-cap">{m.caption}</span>
            <a href={m.href}>See receipt ↓</a>
          </div>
        ))}

        {cans.map((c, i) => (
          <div
            key={i}
            className="gs-can"
            aria-hidden="true"
            style={{ top: c.top, left: c.left, transform: `rotate(${c.rot}deg)` }}
          >
            <span className="gs-can-handle" />
            <span className="gs-can-spout" />
            <span className="gs-can-rose" />
            <span className="gs-can-body" />
            <span className="gs-can-moon" />
          </div>
        ))}
      </div>
    </section>
  );
}

function Pot({
  bottom,
  w,
  h,
  soil,
  small,
  smallest,
}: {
  bottom: number;
  w: number;
  h: number;
  soil: string;
  small?: boolean;
  smallest?: boolean;
}) {
  const rimW = smallest ? 128 : small ? 140 : 150;
  const soilW = smallest ? 92 : small ? 102 : 112;
  return (
    <>
      <div className="gs-pot" style={{ bottom, width: w, height: h }} />
      <div className="gs-rim" style={{ bottom: bottom + h - 6, width: rimW }} />
      <div
        className="gs-soil"
        style={{ bottom: bottom + h + 10, width: soilW, background: soil }}
      />
    </>
  );
}
function Drops() {
  return (
    <div className="gs-drops">
      {[-10, 4, -3, 11, -7, 7].map((x, k) => (
        <span key={k} style={{ left: x, animationDelay: `${k * 0.09}s` }} />
      ))}
    </div>
  );
}
function Drips() {
  return (
    <div className="gs-drips">
      {[0, 1, 2].map((k) => (
        <span key={k} style={{ animationDelay: `${k * 0.3}s` }} />
      ))}
    </div>
  );
}
