/*
 * "Before you go": a small kitchen you can poke at. A fridge on the left holds
 * postcards from trips — pick one and it comes off the door. On the right, a table
 * seen from the side with a coffee you make (and can then fund for real) and a sheet
 * of stickers. Pick a sticker, add a note if you like, and it gets stuck on the table
 * and emailed to Ashleigh (via /api/sticker, which sends it with Resend). Your own
 * stickers stay on the table in your browser; other visitors don't see them.
 */
import { useEffect, useRef, useState, type FormEvent } from "react";
import monasteryPhoto from "@/assets/monastery.jpg";
import spainPhoto from "@/assets/spain-camino.jpg";
import greatWallTents from "@/assets/great-wall-tents.jpg";
import { PostcardBack, TableSticker } from "./art";
import {
  COFFEE_COUNTS,
  COFFEE_PRICE,
  LINKS,
  POSTCARDS,
  TABLE_STICKERS,
  type StickerKind,
} from "./data";

const PHOTOS = { monastery: monasteryPhoto, spain: spainPhoto, wall: greatWallTents };

type Stuck = { id: number; kind: StickerKind; x: number; r: number; note: string };

const coffees = (n: number) => `${n} coffee${n === 1 ? "" : "s"}`;
const STORE = "pf-table-stickers";

/** The fridge door. Postcards hang on magnets; picking one brings it forward and
 *  writes its line on the pad below, which keeps its height so nothing shifts. */
function Fridge() {
  const [picked, setPicked] = useState(-1);
  const card = POSTCARDS[picked];
  return (
    <div className="pf-fridge">
      <div className="pf-fridge-body">
        <span className="pf-fridge-split" aria-hidden="true" />
        <span className="pf-fridge-grip pf-fridge-grip--freezer" aria-hidden="true" />
        <span className="pf-fridge-grip pf-fridge-grip--door" aria-hidden="true" />
        <div className="pf-cards" role="group" aria-label="Postcards on the fridge">
          {POSTCARDS.map((pc, i) => (
            <button
              key={pc.h}
              type="button"
              className={`pf-card${picked === i ? " pf-card--picked" : ""}`}
              style={{ ["--r" as string]: `${pc.r}deg` }}
              aria-pressed={picked === i}
              aria-label={pc.h}
              onClick={() => setPicked((p) => (p === i ? -1 : i))}
            >
              <span className="pf-magnet" aria-hidden="true" />
              {pc.photo ? (
                <img src={PHOTOS[pc.photo]} alt={pc.alt} loading="lazy" />
              ) : (
                <PostcardBack />
              )}
            </button>
          ))}
        </div>
        <p className="pf-card-pad" aria-live="polite">
          <b>{card ? card.h : "Postcards"}</b>
          <span>{card ? card.b : "Four of them. Take one off the door."}</span>
        </p>
      </div>
      <span className="pf-fridge-shadow" aria-hidden="true" />
    </div>
  );
}

export function BeforeYouGo() {
  const [open, setOpen] = useState(false);
  /** the mug starts empty; the first tap brews it, and only then is a real one offered */
  const [brew, setBrew] = useState<"empty" | "pouring" | "made">("empty");
  const [count, setCount] = useState(3);
  const brewTimer = useRef<number | undefined>(undefined);
  const [kind, setKind] = useState<StickerKind | null>(null);
  const [msg, setMsg] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");
  const [thanks, setThanks] = useState("");
  const [stuck, setStuck] = useState<Stuck[]>([]);
  const cupRef = useRef<HTMLButtonElement>(null);
  const popRef = useRef<HTMLDivElement>(null);

  /* the stickers this visitor left last time */
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORE) ?? "[]") as Stuck[];
      if (Array.isArray(saved)) setStuck(saved);
    } catch {
      /* storage blocked: start with a clean table */
    }
  }, []);

  useEffect(() => () => window.clearTimeout(brewTimer.current), []);

  /** first tap pours the coffee and the popover follows; after that it just toggles */
  const makeCoffee = () => {
    if (brew === "pouring") return;
    if (brew === "made") {
      setOpen((o) => !o);
      return;
    }
    setBrew("pouring");
    brewTimer.current = window.setTimeout(() => {
      setBrew("made");
      setOpen(true);
    }, 900);
  };

  /* close the popover on Escape or a click anywhere else */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      cupRef.current?.focus();
    };
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (!popRef.current?.contains(t) && !cupRef.current?.contains(t)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  const stick = (k: StickerKind, note: string) => {
    const next = [
      ...stuck,
      { id: Date.now(), kind: k, x: 8 + Math.random() * 80, r: -18 + Math.random() * 36, note },
    ].slice(-10);
    setStuck(next);
    try {
      localStorage.setItem(STORE, JSON.stringify(next));
    } catch {
      /* storage blocked: it still shows until they leave */
    }
  };

  const send = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const note = msg.trim();
    const who = name.trim();
    const honey = (e.currentTarget.elements.namedItem("_honey") as HTMLInputElement | null)?.value;
    if (!kind || status === "sending") return;
    const done = () => {
      stick(kind, note);
      setThanks(`Stuck! Thanks${who ? `, ${who}` : ""}. It’s on the table.`);
      setKind(null);
      setMsg("");
      setName("");
      setStatus("idle");
    };
    setStatus("sending");
    try {
      const res = await fetch("/api/sticker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, name: who, note, honey }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean };
      if (!res.ok || !data.ok) throw new Error("not sent");
      done();
    } catch {
      setStatus("error");
    }
  };

  return (
    <section className="pf-bye" id="bye">
      <div className="pf-bye-head">
        <h2>Before you go</h2>
        <p>Have a poke around. Postcards on the fridge, coffee and a sticker pad on the table.</p>
      </div>

      <div className="pf-room">
        <Fridge />
        <div className="pf-scene">
          {/* the instruction bows out once it has been followed */}
          <div className={`pf-cue pf-cue-coffee${brew === "made" ? " pf-cue--done" : ""}`}>
            <button type="button" tabIndex={-1} aria-hidden="true" onClick={makeCoffee}>
              Make me a coffee
            </button>
            <svg viewBox="0 0 120 100" className="pf-cue-arrow" aria-hidden="true">
              <path d="M8 12C52 6 92 26 100 84" />
              <path d="M86 72L100 86L110 68" />
            </svg>
          </div>
          <div className="pf-furniture" aria-hidden="true">
            <span className="pf-t-shadow" />
            <span className="pf-leg pf-leg-back pf-leg-l" />
            <span className="pf-leg pf-leg-back pf-leg-r" />
            <span className="pf-t-apron" />
            <span className="pf-leg pf-leg-l" />
            <span className="pf-leg pf-leg-r" />
            <span className="pf-t-top" />
            <span className="pf-t-edge" />
            <span className="pf-t-pen" />
          </div>
          <div className="pf-t-stickers">
            {stuck.map((t) => (
              <span
                key={t.id}
                className="pf-t-stuck"
                style={{ left: `${t.x}%`, transform: `translateX(-50%) rotate(${t.r}deg)` }}
                title={t.note || undefined}
              >
                <TableSticker kind={t.kind} size={60} />
              </span>
            ))}
          </div>

          <div className="pf-coffee">
            <button
              type="button"
              ref={cupRef}
              className={`pf-cup pf-cup--${brew}`}
              aria-label={brew === "made" ? "Coffee, made" : "Make me a coffee"}
              aria-expanded={open}
              aria-controls="pf-coffee-pop"
              onClick={makeCoffee}
            >
              <svg viewBox="0 0 200 175" aria-hidden="true">
                <g className="pf-steam" fill="none" strokeWidth={4} strokeLinecap="round">
                  <path d="M80 30C70 20 90 12 80 2" />
                  <path d="M100 32C90 20 110 12 100 0" />
                  <path d="M120 30C110 20 130 12 120 2" />
                </g>
                <ellipse cx={100} cy={160} rx={86} ry={13} className="pf-mug-saucer" />
                <path
                  d="M146 64C186 60 186 124 146 118"
                  fill="none"
                  className="pf-mug-handle-edge"
                  strokeWidth={17}
                />
                <path
                  d="M146 64C186 60 186 124 146 118"
                  fill="none"
                  className="pf-mug-handle"
                  strokeWidth={13}
                />
                <path
                  d="M48 44H152V122Q152 154 120 154H80Q48 154 48 122Z"
                  className="pf-mug-body"
                />
                <rect x={48} y={78} width={104} height={16} className="pf-mug-band" />
                <ellipse cx={100} cy={44} rx={52} ry={9} className="pf-mug-rim" />
                <ellipse cx={100} cy={45} rx={45} ry={6} className="pf-mug-hollow" />
                <ellipse cx={100} cy={45} rx={45} ry={6} className="pf-mug-brew" />
              </svg>
            </button>
            {open && (
              <div
                className="pf-coffee-pop"
                id="pf-coffee-pop"
                role="dialog"
                aria-labelledby="pf-coffee-h"
                ref={popRef}
              >
                <b id="pf-coffee-h">One coffee, made.</b>
                <p>
                  That one's on the house. If you feel called to send a real one, it goes into the
                  next side project.
                </p>
                <div className="pf-coffee-picks" role="group" aria-label="How many coffees">
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
                  className="btn btn-primary"
                  onClick={() => setOpen(false)}
                >
                  Send {coffees(count)} · ${count * COFFEE_PRICE}
                </a>
              </div>
            )}
          </div>

          <form className="pf-clip" onSubmit={send}>
            <span className="pf-clip-clamp" aria-hidden="true" />
            <div className="pf-note">
              <h3 id="pf-note-h">Leave me a sticker</h3>
              <p className="pf-note-sub">
                Pick one and stick it on my table. It lands in my inbox too.
              </p>
              <div className="pf-sheet" role="radiogroup" aria-labelledby="pf-note-h">
                {TABLE_STICKERS.map((t) => (
                  <button
                    key={t.kind}
                    type="button"
                    role="radio"
                    aria-checked={kind === t.kind}
                    aria-label={t.label}
                    onClick={() => {
                      setKind(t.kind);
                      setThanks("");
                    }}
                  >
                    <TableSticker kind={t.kind} size={62} />
                  </button>
                ))}
              </div>
              <textarea
                aria-label="Add a note (optional)"
                placeholder="Add a note, if you like…"
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                maxLength={600}
                rows={2}
              />
              <input
                type="text"
                name="_honey"
                className="pf-honey"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
              />
              <div className="pf-note-foot">
                <label>
                  <span className="sr-only">Your name</span>
                  <input
                    type="text"
                    placeholder="— your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={80}
                    autoComplete="name"
                  />
                </label>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={!kind || status === "sending"}
                >
                  {status === "sending" ? "Sticking…" : "Stick it"}
                </button>
              </div>
              <p className="pf-note-msg" role="status">
                {status === "error" ? (
                  <>
                    That didn’t go through. Try again, or{" "}
                    <a href={`mailto:${LINKS.email}`}>email me instead</a>.
                  </>
                ) : (
                  thanks
                )}
              </p>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
