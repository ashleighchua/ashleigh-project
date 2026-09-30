/*
 * "Before you go": a kitchen drawn in CSS that you can poke at. The scene is one
 * container-query box, so every part is sized in `cqw` and the whole room scales
 * with its width — wide and landscape on a desktop, portrait on a phone.
 *
 * Four things are live. The coffee machine pulls a shot (and then offers a real one
 * on Ko-fi), the oven bakes a loaf on an 8s timer, the notepad opens the sticker
 * sheet, and every magnet on the fridge opens the postcard behind it.
 *
 * A sticker or note goes two places: onto the fridge door (kept in this browser, so
 * other visitors don't see it) and into Ashleigh's inbox via /api/sticker, which
 * sends it with Resend.
 */
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import monasteryPhoto from "@/assets/monastery.jpg";
import spainPhoto from "@/assets/spain-camino.jpg";
import greatWallTents from "@/assets/great-wall-tents.jpg";
import { Flag, Stamp, TableSticker } from "./art";
import {
  BAKE_MS,
  BREW_MS,
  COFFEE_COUNTS,
  COFFEE_PRICE,
  LINKS,
  PLACES,
  TABLE_STICKERS,
  type Place,
  type PlaceKind,
  type StickerKind,
} from "./data";
import "./Kitchen.css";

const PHOTOS = { monastery: monasteryPhoto, spain: spainPhoto, wall: greatWallTents };

/** Stickers and notes this visitor has stuck on the door. */
type Stuck = {
  id: number;
  kind: StickerKind | null;
  text: string;
  name: string;
  /** on the door, in % of the door's width; the door is its own container */
  x: number;
  y: number;
  r: number;
};

const STORE = "ashleigh-kitchen-fridge-v2";
const MAX_STUCK = 12;
/** face values on the stamps, so the cards do not all carry the same one */
const STAMP_VALUES = ["20", "35", "50", "75", "90", "15", "60"];
/** below 640px the room turns portrait */
const NARROW = 640;

const coffees = (n: number) => `${n} coffee${n === 1 ? "" : "s"}`;

/* ── the hanging plants: three trailing vines each, leaf counts picked by hand ── */
const VINES = {
  wide: [
    { left: 27, string: 8, dur: 3.6, pot: "var(--color-neutral-100)", vines: [6, 9, 5] },
    { left: 46.6, string: 5, dur: 4.2, pot: "var(--color-accent-500)", vines: [7, 4, 8] },
    { left: 86, string: 3, dur: 3.9, pot: "var(--color-accent-2-200)", vines: [4, 7, 5] },
  ],
  tall: [
    { left: 50, string: 14, dur: 3.8, pot: "var(--color-neutral-100)", vines: [5, 8, 4] },
    { left: 88.5, string: 3, dur: 4.3, pot: "var(--color-accent-2-200)", vines: [4, 6, 5] },
  ],
};

function Plants({ layout }: { layout: "wide" | "tall" }) {
  return (
    <>
      {VINES[layout].map((p) => (
        <div
          key={p.left}
          className="pf-k-plant"
          style={{
            ["--left" as string]: `${p.left}cqw`,
            ["--string" as string]: `${p.string}cqw`,
            ["--dur" as string]: `${p.dur}s`,
            ["--pot" as string]: p.pot,
          }}
        >
          <span className="pf-k-hang" />
          <span className="pf-k-foliage">
            <i className="pf-k-sling pf-k-sling--l" />
            <i className="pf-k-sling pf-k-sling--r" />
            <i className="pf-k-frond pf-k-frond--l" />
            <i className="pf-k-frond pf-k-frond--c" />
            <i className="pf-k-frond pf-k-frond--r" />
            <i className="pf-k-pot" />
            <span className="pf-k-vines">
              {p.vines.map((n, v) => (
                <i key={v} className="pf-k-vine">
                  {Array.from({ length: n }, (_, l) => (
                    <b key={l} className="pf-k-leaf" />
                  ))}
                </i>
              ))}
            </span>
          </span>
        </div>
      ))}
    </>
  );
}

/* ── the magnets, one per place, in real-world colours rather than theme tokens ── */
const MAGNETS: Record<PlaceKind, ReactNode> = {
  /* Kuching, which means cat in Malay, and has the statues to prove it */
  kch: (
    <div className="pf-k-mag pf-k-mag--kch">
      <i className="pf-k-kch-tail" />
      <i className="pf-k-kch-body" />
      <i className="pf-k-kch-ear pf-k-kch-ear--l" />
      <i className="pf-k-kch-ear pf-k-kch-ear--r" />
      <i className="pf-k-kch-head">
        <b className="pf-k-kch-eye pf-k-kch-eye--l" />
        <b className="pf-k-kch-eye pf-k-kch-eye--r" />
        <b className="pf-k-kch-nose" />
      </i>
      <i className="pf-k-kch-collar">KCH</i>
    </div>
  ),
  /* a Chiang Mai paper lantern */
  cnx: (
    <div className="pf-k-mag pf-k-mag--cnx">
      CNX
      <i className="pf-k-cnx-tassel" />
    </div>
  ),
  /* a Beijing lantern, ribbed, with brass caps */
  pek: (
    <div className="pf-k-mag pf-k-mag--pek">
      <i className="pf-k-pek-cap" />
      <span className="pf-k-pek-body">PEK</span>
      <i className="pf-k-pek-cap" />
      <i className="pf-k-pek-tail" />
    </div>
  ),
  /* a tiered Bangkok temple roof */
  bkk: (
    <div className="pf-k-mag pf-k-mag--bkk">
      <i className="pf-k-bkk-spire" />
      <i className="pf-k-bkk-roof pf-k-bkk-roof--1" />
      <i className="pf-k-bkk-eave pf-k-bkk-eave--1" />
      <i className="pf-k-bkk-roof pf-k-bkk-roof--2" />
      <i className="pf-k-bkk-eave pf-k-bkk-eave--2" />
      <i className="pf-k-bkk-roof pf-k-bkk-roof--3" />
      <span className="pf-k-bkk-wall">BKK</span>
    </div>
  ),
  /* a durian */
  sin: (
    <div className="pf-k-mag pf-k-mag--sin">
      <i className="pf-k-sin-husk" />
      <span className="pf-k-sin-flesh">SIN</span>
      <i className="pf-k-sin-stem" />
    </div>
  ),
  /* a Hokkaido ski pass on its lanyard clips */
  hkd: (
    <div className="pf-k-mag pf-k-mag--hkd">
      HKD
      <i className="pf-k-hkd-clip pf-k-hkd-clip--l" />
      <i className="pf-k-hkd-clip pf-k-hkd-clip--r" />
    </div>
  ),
  /* a Hanoi conical hat, with the city on a ribbon below */
  han: (
    <div className="pf-k-mag pf-k-mag--han">
      <i className="pf-k-han-hat" />
      <i className="pf-k-han-band">HAN</i>
    </div>
  ),
  /* the scallop shell and yellow arrow that mark the Camino */
  scq: (
    <div className="pf-k-mag pf-k-mag--scq">
      <i className="pf-k-scq-shell" />
      <i className="pf-k-scq-arrow-bar" />
      <i className="pf-k-scq-arrow-head" />
      <span className="pf-k-scq-name">SCQ</span>
    </div>
  ),
  /* the Petronas Towers and their skybridge */
  kul: (
    <div className="pf-k-mag pf-k-mag--kul">
      <i className="pf-k-kul-tower pf-k-kul-tower--l" />
      <i className="pf-k-kul-tower pf-k-kul-tower--r" />
      <i className="pf-k-kul-spire pf-k-kul-spire--l" />
      <i className="pf-k-kul-spire pf-k-kul-spire--r" />
      <i className="pf-k-kul-bridge" />
      <span className="pf-k-kul-name">KUL</span>
      <i className="pf-k-magnet-dot" />
    </div>
  ),
  /* a Brussels waffle, cream and a strawberry on top */
  bru: (
    <div className="pf-k-mag pf-k-mag--bru">
      <i className="pf-k-bru-waffle">
        <b className="pf-k-bru-cream" />
        <b className="pf-k-bru-berry" />
        <b className="pf-k-bru-name">BRU</b>
      </i>
    </div>
  ),
  /* a Routemaster */
  ldn: (
    <div className="pf-k-mag pf-k-mag--ldn">
      <i className="pf-k-ldn-windows pf-k-ldn-windows--top" />
      <span className="pf-k-ldn-blind">LDN</span>
      <i className="pf-k-ldn-windows pf-k-ldn-windows--low" />
      <i className="pf-k-ldn-wheel pf-k-ldn-wheel--l" />
      <i className="pf-k-ldn-wheel pf-k-ldn-wheel--r" />
    </div>
  ),
  /* the Málaga shoreline */
  agp: (
    <div className="pf-k-mag pf-k-mag--agp">
      <i className="pf-k-agp-sun" />
      <i className="pf-k-agp-surf" />
      <span className="pf-k-agp-name">AGP</span>
      <i className="pf-k-magnet-dot" />
    </div>
  ),
  /* a Melbourne tram, pole up */
  mel: (
    <div className="pf-k-mag pf-k-mag--mel">
      <i className="pf-k-mel-pole" />
      <i className="pf-k-mel-body">
        <b className="pf-k-mel-windows" />
        <b className="pf-k-mel-name">MEL</b>
      </i>
      <i className="pf-k-mel-wheel pf-k-mel-wheel--l" />
      <i className="pf-k-mel-wheel pf-k-mel-wheel--r" />
    </div>
  ),
};

/** The door: magnets across the top, whatever the visitor stuck on below them. */
function FridgeDoor({
  layout,
  stuck,
  fresh,
  onPick,
}: {
  layout: "wide" | "tall";
  stuck: Stuck[];
  fresh: number | null;
  onPick: (i: number) => void;
}) {
  return (
    <div className={`pf-k-fridge pf-k-fridge--${layout}`}>
      <span className="pf-k-fridge-split" aria-hidden="true" />
      <span className="pf-k-fridge-grip pf-k-fridge-grip--freezer" aria-hidden="true" />
      <span className="pf-k-fridge-grip pf-k-fridge-grip--door" aria-hidden="true" />
      <div className="pf-k-magnets" role="group" aria-label="Postcards on the fridge">
        {PLACES.map((p, i) => (
          <button
            key={p.kind}
            type="button"
            className="pf-k-magnet"
            style={{
              ["--x" as string]: `${p.x}cqw`,
              ["--y" as string]: `${p.y}cqw`,
              ["--r" as string]: `${p.r}deg`,
            }}
            aria-label={`Postcard from ${p.name}`}
            onClick={() => onPick(i)}
          >
            <span className="pf-k-magnet-art" aria-hidden="true">
              {MAGNETS[p.kind]}
            </span>
          </button>
        ))}
      </div>
      {stuck.map((it) => {
        const hasText = !!it.text;
        return (
          <div
            key={it.id}
            className={`pf-k-stuck${hasText ? " pf-k-stuck--note" : ""}`}
            style={{
              ["--x" as string]: `${it.x}cqw`,
              ["--y" as string]: `${it.y}cqw`,
              ["--r" as string]: `${it.r}deg`,
            }}
          >
            <div className={it.id === fresh ? "pf-k-pop" : undefined}>
              {hasText && (
                <div className="pf-k-fnote">
                  <span className="pf-k-tape" aria-hidden="true" />
                  <p>{it.text}</p>
                  <p className="pf-k-fnote-sign">— {it.name || "a friend"}</p>
                </div>
              )}
              {it.kind && (
                <span className={`pf-k-fsticker${hasText ? " pf-k-fsticker--corner" : ""}`}>
                  <TableSticker kind={it.kind} size={100} />
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function Kitchen() {
  /* The server cannot know the viewport, so the first render is always the wide
     room and the effect below corrects it — the frame's own media query already
     gives the box its portrait height, so nothing moves when the swap happens. */
  const [layout, setLayout] = useState<"wide" | "tall">("wide");
  const [modal, setModal] = useState<null | "coffee" | "note" | "place">(null);
  const [placeIdx, setPlaceIdx] = useState(0);
  /** postcards open picture-side up and turn over to the written side */
  const [flipped, setFlipped] = useState(false);

  const [brew, setBrew] = useState<"idle" | "brewing" | "done">("idle");
  const [count, setCount] = useState(3);
  const [bake, setBake] = useState<"idle" | "baking" | "done">("idle");
  const [left, setLeft] = useState(Math.round(BAKE_MS / 1000));

  const [kind, setKind] = useState<StickerKind | null>(null);
  const [msg, setMsg] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");
  const [thanks, setThanks] = useState("");
  const [stuck, setStuck] = useState<Stuck[]>([]);
  const [fresh, setFresh] = useState<number | null>(null);

  const brewT = useRef<number | undefined>(undefined);
  const bakeT = useRef<number | undefined>(undefined);
  const dialog = useRef<HTMLDivElement>(null);

  /* the stickers and notes this visitor left last time */
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORE) ?? "[]") as Stuck[];
      if (Array.isArray(saved)) setStuck(saved.slice(-MAX_STUCK));
    } catch {
      /* storage blocked: start with a clean door */
    }
  }, []);

  /* the room only changes shape on a width change: a phone's URL bar sliding away
     fires a resize too, and re-laying out on that is what used to make it jump */
  useEffect(() => {
    let w = 0;
    const measure = () => {
      if (window.innerWidth === w) return;
      w = window.innerWidth;
      setLayout(w < NARROW ? "tall" : "wide");
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  useEffect(
    () => () => {
      window.clearTimeout(brewT.current);
      window.clearTimeout(bakeT.current);
    },
    [],
  );

  /* the oven counts down out loud, then holds on DONE */
  useEffect(() => {
    if (bake !== "baking") return;
    const until = Date.now() + BAKE_MS;
    const id = window.setInterval(() => {
      const secs = Math.max(0, Math.ceil((until - Date.now()) / 1000));
      setLeft(secs);
      if (secs === 0) setBake("done");
    }, 250);
    return () => window.clearInterval(id);
  }, [bake]);

  /* Escape closes whatever is open */
  useEffect(() => {
    if (!modal) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setModal(null);
    };
    window.addEventListener("keydown", onKey);
    dialog.current?.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, [modal]);

  /** every visit to the machine pours a fresh one, from empty */
  const startBrew = () => {
    window.clearTimeout(brewT.current);
    setBrew("idle");
    brewT.current = window.setTimeout(() => {
      setBrew("brewing");
      brewT.current = window.setTimeout(() => setBrew("done"), BREW_MS);
    }, 350);
  };
  const startBake = () => {
    window.clearTimeout(bakeT.current);
    setBake("idle");
    setLeft(Math.round(BAKE_MS / 1000));
    bakeT.current = window.setTimeout(() => setBake("baking"), 120);
  };

  const openCoffee = () => {
    setModal("coffee");
    startBrew();
  };
  /* the oven bakes where it stands: no popup, just a loaf rising behind the glass */
  const runBake = () => {
    if (bake !== "baking") startBake();
  };
  /* every card comes up picture-side first */
  const openPlace = (i: number) => {
    setPlaceIdx(i);
    setFlipped(false);
    setModal("place");
  };

  /** Put it on the door, below the magnets. A note is wider and taller than a bare
   *  sticker, so it gets less room to roam and has to stop higher up the door. */
  const stick = (k: StickerKind | null, text: string, who: string) => {
    const id = Date.now();
    const next = [
      ...stuck,
      {
        id,
        kind: k,
        text,
        name: who,
        x: 6 + Math.random() * (text ? 48 : 62),
        y: 118 + Math.random() * (text ? 42 : 60),
        r: Math.round(Math.random() * 14 - 7),
      },
    ].slice(-MAX_STUCK);
    setStuck(next);
    setFresh(id);
    try {
      localStorage.setItem(STORE, JSON.stringify(next));
    } catch {
      /* storage blocked: it still shows until they leave */
    }
  };

  const send = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const text = msg.trim();
    const who = name.trim();
    const honey = (e.currentTarget.elements.namedItem("_honey") as HTMLInputElement | null)?.value;
    if ((!kind && !text) || status === "sending") return;
    setStatus("sending");
    try {
      const res = await fetch("/api/sticker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, name: who, note: text, honey }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean };
      if (!res.ok || !data.ok) throw new Error("not sent");
      stick(kind, text, who);
      setThanks(`Stuck! Thanks${who ? `, ${who}` : ""}. It’s on the fridge.`);
      setKind(null);
      setMsg("");
      setName("");
      setStatus("idle");
      setModal(null);
    } catch {
      setStatus("error");
    }
  };

  const baking = bake === "baking";
  const baked = bake === "done";
  const brewed = brew === "done";
  /* placeIdx is always wrapped into range, so there is always a card */
  const place = PLACES[placeIdx] as Place;
  const nothingToSend = !kind && !msg.trim();

  /* the live parts of the drawing, handed to CSS as custom properties */
  const ovenVars = {
    ["--glow" as string]: baking ? 1 : baked ? 0.35 : 0,
    ["--loaf-scale" as string]: bake === "idle" ? 0.7 : 1,
    ["--loaf-color" as string]:
      bake === "idle" ? "var(--color-neutral-300)" : "var(--color-accent-600)",
    ["--score-op" as string]: bake === "idle" ? 0 : 1,
    ["--bake-secs" as string]: `${bake === "idle" ? 0 : BAKE_MS / 1000}s`,
  };
  const brewVars = {
    ["--stream" as string]: brew === "brewing" ? 1 : 0,
    ["--fill" as string]: `${brew === "idle" ? 0 : 78}%`,
    ["--fill-secs" as string]: `${brew === "idle" ? 0 : BREW_MS / 1000}s`,
    ["--needle" as string]: `${brew === "idle" ? -50 : 40}deg`,
    ["--lamp" as string]: brew === "idle" ? "var(--color-accent-700)" : "var(--color-accent-2-300)",
  };
  const ovenDisplay = baking ? `0:${String(left).padStart(2, "0")}` : baked ? "DONE" : "OFF";

  const oven = (
    <button
      type="button"
      className="pf-k-oven"
      style={ovenVars}
      aria-label={baking ? "Baking sourdough" : baked ? "Bake another loaf" : "Bake sourdough"}
      onClick={runBake}
    >
      <span className="pf-k-oven-panel" aria-hidden="true">
        <i className="pf-k-knobs">
          <b />
          <b />
        </i>
        <i className="pf-k-readout">{ovenDisplay}</i>
        <i className="pf-k-knobs">
          <b />
          <b />
        </i>
      </span>
      <span className="pf-k-oven-handle" aria-hidden="true" />
      <span className="pf-k-oven-window" aria-hidden="true">
        <i className="pf-k-oven-glow" />
        <i className="pf-k-oven-rack" />
        <i className="pf-k-loaf">
          <b className="pf-k-score" />
        </i>
        <i className="pf-k-dutch">
          <b className="pf-k-dutch-ear pf-k-dutch-ear--l" />
          <b className="pf-k-dutch-ear pf-k-dutch-ear--r" />
        </i>
      </span>
    </button>
  );

  const machine = (
    <button
      type="button"
      className="pf-k-machine"
      style={brewVars}
      aria-label="Brew a coffee"
      onClick={openCoffee}
    >
      <span className="pf-k-mach-back" aria-hidden="true" />
      <span className="pf-k-mach-head" aria-hidden="true">
        <i className="pf-k-gauge">
          <b className="pf-k-needle" />
        </i>
        <i className="pf-k-lamp" />
      </span>
      <span className="pf-k-group" aria-hidden="true" />
      <span className="pf-k-mach-foot" aria-hidden="true" />
      <span className="pf-k-stream" aria-hidden="true" />
      <span className="pf-k-glass" aria-hidden="true">
        <i className="pf-k-glass-wall" />
        <i className="pf-k-glass-well">
          <b className="pf-k-glass-fill" />
        </i>
        {brewed && (
          <i className="pf-k-steam">
            <b />
            <b />
            <b />
          </i>
        )}
      </span>
      <span className="pf-k-grille" aria-hidden="true" />
    </button>
  );

  const notepad = (
    <button
      type="button"
      className="pf-k-pad"
      aria-label="Leave a note or sticker"
      onClick={() => setModal("note")}
    >
      <span className="pf-k-sheet-of-stickers" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
      </span>
      <span className="pf-k-notepad" aria-hidden="true">
        <i className="pf-k-tape" />
        <b className="pf-k-pad-title">notes &amp; stickers</b>
        <b className="pf-k-pad-sub">say hi…</b>
      </span>
      <span className="pf-k-pencil" aria-hidden="true" />
    </button>
  );

  return (
    <section className="pf-kitchen" id="bye">
      <div className="pf-kitchen-head">
        <h2>Before you go</h2>
        <p>
          Come into my kitchen. Brew a coffee, bake some bread, leave a note or a sticker on the
          fridge. The postcards are from everywhere I’ve been this year.
        </p>
      </div>

      <div className="pf-k-frame">
        <div className={`pf-k-scene pf-k-scene--${layout}`}>
          <span className="pf-k-ceiling" aria-hidden="true" />

          {layout === "wide" ? (
            <>
              <span className="pf-k-window" aria-hidden="true">
                <i className="pf-k-sun" />
                <i className="pf-k-hill pf-k-hill--l" />
                <i className="pf-k-hill pf-k-hill--r" />
                <i className="pf-k-mullion pf-k-mullion--v" />
                <i className="pf-k-mullion pf-k-mullion--h" />
              </span>
              <span className="pf-k-sill" aria-hidden="true" />
              <span className="pf-k-sprout" aria-hidden="true">
                <i className="pf-k-sprout-leaf pf-k-sprout-leaf--l" />
                <i className="pf-k-sprout-leaf pf-k-sprout-leaf--r" />
                <i className="pf-k-sprout-pot" />
              </span>
              <span className="pf-k-succulent" aria-hidden="true">
                <i className="pf-k-succulent-top" />
                <i className="pf-k-succulent-pot" />
              </span>

              <span className="pf-k-shelf" aria-hidden="true" />
              <span className="pf-k-jar pf-k-jar--1" aria-hidden="true">
                <i />
                <b />
              </span>
              <span className="pf-k-jar pf-k-jar--2" aria-hidden="true">
                <i />
                <b />
              </span>
              <span className="pf-k-jar pf-k-jar--3" aria-hidden="true">
                <i />
                <b />
              </span>
              <span className="pf-k-crock" aria-hidden="true">
                <i className="pf-k-crock-lid" />
                <b className="pf-k-crock-body" />
                <u className="pf-k-crock-spoon" />
              </span>

              <Plants layout="wide" />

              <span className="pf-k-tiles" aria-hidden="true" />
              <span className="pf-k-floor" aria-hidden="true" />

              <span className="pf-k-carcass" aria-hidden="true" />
              <span className="pf-k-door pf-k-door--1" aria-hidden="true">
                <i />
              </span>
              <span className="pf-k-door pf-k-door--2" aria-hidden="true">
                <i />
              </span>
              <span className="pf-k-drawers" aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
              <span className="pf-k-door pf-k-door--3" aria-hidden="true">
                <i />
              </span>
              <span className="pf-k-counter" aria-hidden="true" />

              {oven}
              {machine}
              {notepad}
            </>
          ) : (
            <>
              <span className="pf-k-window" aria-hidden="true">
                <i className="pf-k-sun" />
                <i className="pf-k-hill pf-k-hill--l" />
                <i className="pf-k-hill pf-k-hill--r" />
                <i className="pf-k-mullion pf-k-mullion--v" />
                <i className="pf-k-mullion pf-k-mullion--h" />
              </span>
              <span className="pf-k-sill" aria-hidden="true" />
              <Plants layout="tall" />
              <span className="pf-k-tiles" aria-hidden="true" />
              <span className="pf-k-carcass" aria-hidden="true" />
              <span className="pf-k-counter" aria-hidden="true" />
              <span className="pf-k-floor" aria-hidden="true" />
              {machine}
              {notepad}
              {oven}
            </>
          )}

          <FridgeDoor layout={layout} stuck={stuck} fresh={fresh} onPick={openPlace} />
        </div>
      </div>

      <p className="pf-k-hint">
        {layout === "wide"
          ? "Tap the coffee machine, the oven, the notepad or any postcard. The cat too."
          : "Tap the coffee machine, the oven, the notepad or anything on the fridge."}
      </p>
      <p className="pf-k-said" role="status">
        {thanks ||
          (baking ? `Sourdough in the oven. ${left}s to go.` : baked ? "Fresh loaf, out." : "")}
      </p>

      {modal && (
        <div
          className="pf-k-scrim"
          role="presentation"
          onPointerDown={(e) => {
            if (e.target === e.currentTarget) setModal(null);
          }}
        >
          <div
            className="pf-k-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="pf-k-modal-h"
            tabIndex={-1}
            ref={dialog}
          >
            <button
              type="button"
              className="pf-k-close"
              aria-label="Close"
              onClick={() => setModal(null)}
            >
              ×
            </button>

            {modal === "coffee" && (
              <>
                <div className="pf-k-brewstage" style={brewVars} aria-hidden="true">
                  <span className="pf-k-stream" />
                  <span className="pf-k-glass">
                    <i className="pf-k-glass-wall" />
                    <i className="pf-k-glass-well">
                      <b className="pf-k-glass-fill" />
                    </i>
                    <i className="pf-k-glass-shine" />
                    {brewed && (
                      <i className="pf-k-steam">
                        <b />
                        <b />
                        <b />
                      </i>
                    )}
                  </span>
                  <span className="pf-k-saucer" />
                </div>
                <h3 id="pf-k-modal-h">{brewed ? "One coffee, made." : "Brewing…"}</h3>
                <p>
                  {brewed
                    ? "That one’s on the house. If you feel called to send a real one, it goes into the next side project."
                    : "Pulling a shot for you. Give it a sec."}
                </p>
                {brewed && (
                  <>
                    <div className="pf-k-picks" role="group" aria-label="How many coffees">
                      {COFFEE_COUNTS.map((n) => (
                        <button
                          key={n}
                          type="button"
                          aria-pressed={count === n}
                          onClick={() => setCount(n)}
                        >
                          {coffees(n)}
                        </button>
                      ))}
                    </div>
                    <a
                      href={LINKS.kofi}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary pf-k-cta"
                      onClick={() => setModal(null)}
                    >
                      Send {coffees(count)} · ${count * COFFEE_PRICE}
                    </a>
                  </>
                )}
              </>
            )}

            {modal === "place" && (
              <>
                {/* the dialog's name; the card itself is a button, which cannot hold a heading */}
                <h3 id="pf-k-modal-h" className="sr-only">
                  Postcard from {place.name}
                </h3>
                <div className="pf-k-card-wrap">
                  <button
                    type="button"
                    className={`pf-k-card${flipped ? " pf-k-card--turned" : ""}`}
                    style={{
                      ["--bg" as string]: place.bg,
                      ["--ink" as string]: place.ink,
                    }}
                    aria-pressed={flipped}
                    aria-label={flipped ? "Turn the postcard back over" : "Turn the postcard over"}
                    onClick={() => setFlipped((f) => !f)}
                  >
                    <span className="pf-k-postcard" aria-hidden={flipped}>
                      <i className="pf-k-flag">
                        <svg viewBox="0 0 60 40" aria-hidden="true">
                          <Flag code={place.flag} />
                        </svg>
                      </i>
                      <i className="pf-k-greet">greetings from</i>
                      <b
                        className="pf-k-place"
                        /* the longer the name, the smaller it has to start, or
                           Santiago de Compostela runs off the card */
                        data-len={
                          place.name.length > 14 ? "long" : place.name.length > 9 ? "mid" : "short"
                        }
                      >
                        {place.name}
                      </b>
                    </span>
                    <span className="pf-k-postback" aria-hidden={!flipped}>
                      <i className="pf-k-pb-stamp">
                        <Stamp
                          tone={place.bg}
                          value={STAMP_VALUES[placeIdx % STAMP_VALUES.length] ?? "20"}
                        />
                      </i>
                      <i className="pf-k-pb-chop" />
                      <i className="pf-k-pb-split" />
                      <i className="pf-k-pb-address" />
                      <i className="pf-k-pb-note">{place.line}</i>
                      {place.line && (
                        <b className="pf-k-pb-sign">
                          love always,
                          <span>Ashleigh</span>
                        </b>
                      )}
                    </span>
                  </button>
                </div>
                <p
                  className={`pf-k-flip-hint${flipped ? " pf-k-flip-hint--gone" : ""}`}
                  aria-hidden="true"
                >
                  <svg viewBox="0 0 64 34" aria-hidden="true">
                    <path d="M4 30C10 8 36 2 56 10" />
                    <path d="M47 4L57 10L48 17" />
                  </svg>
                  flip it over
                </p>
              </>
            )}

            {modal === "note" && (
              <form className="pf-k-note" onSubmit={send}>
                <h3 id="pf-k-modal-h">Leave me a note</h3>
                <p>
                  Pick a sticker, write a little something, or both. It goes straight on the fridge
                  — and into my inbox.
                </p>
                <div className="pf-k-stickers" role="radiogroup" aria-labelledby="pf-k-modal-h">
                  {TABLE_STICKERS.map((t) => (
                    <button
                      key={t.kind}
                      type="button"
                      role="radio"
                      aria-checked={kind === t.kind}
                      aria-label={t.label}
                      onClick={() => {
                        setKind((c) => (c === t.kind ? null : t.kind));
                        setThanks("");
                      }}
                    >
                      <TableSticker kind={t.kind} size={100} />
                    </button>
                  ))}
                </div>
                <textarea
                  aria-label="Leave me a message (optional)"
                  placeholder="Leave me a message…"
                  value={msg}
                  onChange={(e) => setMsg(e.target.value)}
                  maxLength={120}
                  rows={3}
                />
                <input
                  type="text"
                  name="_honey"
                  className="pf-k-honey"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                />
                <label>
                  <span className="sr-only">Your name</span>
                  <input
                    type="text"
                    placeholder="— your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={24}
                    autoComplete="name"
                  />
                </label>
                <button
                  type="submit"
                  className="btn btn-primary pf-k-cta"
                  disabled={nothingToSend || status === "sending"}
                >
                  {status === "sending" ? "Sticking…" : "Stick it on the fridge"}
                </button>
                {status === "error" && (
                  <p className="pf-k-note-msg" role="alert">
                    That didn’t go through. Try again, or{" "}
                    <a href={`mailto:${LINKS.email}`}>email me instead</a>.
                  </p>
                )}
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
