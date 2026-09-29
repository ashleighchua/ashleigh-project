/*
 * "Before you go": a table seen from the side, with a coffee (opens a Ko-fi popover)
 * and a sheet of stickers. Pick one, add a note if you like, and it gets stuck on the
 * table and emailed to Ashleigh (via FormSubmit). Your own stickers stay on the table
 * in your browser; other visitors don't see them.
 */
import { useEffect, useRef, useState, type FormEvent } from "react";
import { TableSticker } from "./art";
import { COFFEE_COUNTS, COFFEE_PRICE, LINKS, TABLE_STICKERS, type StickerKind } from "./data";

type Stuck = { id: number; kind: StickerKind; x: number; r: number; note: string };

const coffees = (n: number) => `${n} coffee${n === 1 ? "" : "s"}`;
const STORE = "pf-table-stickers";

export function BeforeYouGo() {
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(3);
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
    const label = TABLE_STICKERS.find((t) => t.kind === kind)!.label;
    const done = () => {
      stick(kind, note);
      setThanks(`Stuck! Thanks${who ? `, ${who}` : ""}. It’s on the table.`);
      setKind(null);
      setMsg("");
      setName("");
      setStatus("idle");
    };
    // bots fill the hidden field; pretend it worked
    if (honey) return done();
    setStatus("sending");
    try {
      const res = await fetch(LINKS.notes, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          sticker: label,
          name: who || "Anonymous",
          message: note || "(no note, just the sticker)",
          _subject: `${who || "Someone"} left you a “${label}” sticker`,
          _template: "box",
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { success?: string | boolean };
      if (!res.ok || String(data.success) !== "true") throw new Error("not sent");
      done();
    } catch {
      setStatus("error");
    }
  };

  return (
    <section className="pf-bye" id="bye">
      <div className="pf-bye-head">
        <h2>Before you go</h2>
        <p>Grab a coffee with me, or leave a sticker on the table.</p>
      </div>

      <div className="pf-scene">
        <div className="pf-cue pf-cue-coffee">
          <button type="button" tabIndex={-1} aria-hidden="true" onClick={() => setOpen((o) => !o)}>
            Buy me a coffee
          </button>
          <svg viewBox="0 0 120 100" className="pf-cue-arrow" aria-hidden="true">
            <path d="M8 12C52 6 92 26 100 84" />
            <path d="M86 72L100 86L110 68" />
          </svg>
        </div>
        <div className="pf-cue pf-cue-note" aria-hidden="true">
          <span>Leave me a sticker</span>
          <svg viewBox="0 0 120 100" className="pf-cue-arrow">
            <path d="M8 30C40 70 80 76 108 58" />
            <path d="M92 50L109 57L100 73" />
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
            className="pf-cup"
            aria-label="Buy me a coffee"
            aria-expanded={open}
            aria-controls="pf-coffee-pop"
            onClick={() => setOpen((o) => !o)}
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
              <path d="M48 44H152V122Q152 154 120 154H80Q48 154 48 122Z" className="pf-mug-body" />
              <rect x={48} y={78} width={104} height={16} className="pf-mug-band" />
              <ellipse cx={100} cy={44} rx={52} ry={9} className="pf-mug-rim" />
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
              <b id="pf-coffee-h">Buy me a coffee</b>
              <p>Every coffee goes straight into the next side project.</p>
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
    </section>
  );
}
