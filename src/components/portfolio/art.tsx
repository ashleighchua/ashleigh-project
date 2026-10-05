/*
 * SVG art for the page: hero stickers (8 shapes), the flat-lay table objects
 * they turn into, and the little scenes on the timeline cards.
 */
import type { ReactNode } from "react";
import type { FlagCode } from "./data";
import { COL, OBJ, SH, STK, type ObjKey, type StickerKind } from "./data";

export type Look = { c: number; s: number };

const HEADING = "var(--font-heading)";
const N1 = "var(--color-neutral-100)";
const N3 = "var(--color-neutral-300)";
const INK = "var(--color-neutral-900)";

const ringD = (c: number, r: number) =>
  `M ${c - r} ${c} a ${r} ${r} 0 1 1 ${2 * r} 0 a ${r} ${r} 0 1 1 ${-2 * r} 0`;

/** A "C"-shaped crescent: a circle of radius r with the same circle, moved d to the right, cut out */
const crescentD = (cx: number, cy: number, r: number, d: number) => {
  const x = cx + d / 2;
  const h = Math.sqrt(r * r - (d * d) / 4);
  return `M${x} ${cy - h}A${r} ${r} 0 1 0 ${x} ${cy + h}A${r} ${r} 0 0 1 ${x} ${cy - h}Z`;
};

const scallopD = (cx: number, cy: number, R: number, amp: number, n: number) => {
  let d = "";
  for (let i = 0; i <= 180; i++) {
    const a = (i / 180) * Math.PI * 2;
    const r = R + amp * Math.cos(n * a);
    d +=
      (i ? "L" : "M") + (cx + r * Math.cos(a)).toFixed(1) + " " + (cy + r * Math.sin(a)).toFixed(1);
  }
  return d + "Z";
};

const burstD = (cx: number, cy: number, R: number, r: number, n: number) => {
  let d = "";
  for (let i = 0; i < n * 2; i++) {
    const a = (i / (n * 2)) * Math.PI * 2 - Math.PI / 2;
    const rad = i % 2 ? r : R;
    d +=
      (i ? "L" : "M") +
      (cx + rad * Math.cos(a)).toFixed(1) +
      " " +
      (cy + rad * Math.sin(a)).toFixed(1);
  }
  return d + "Z";
};

/** Organic pebble: an ellipse with a couple of slow wobbles in its radius */
const blobD = (cx: number, cy: number, rx: number, ry: number) => {
  let d = "";
  for (let i = 0; i <= 120; i++) {
    const a = (i / 120) * Math.PI * 2;
    const k = 1 + 0.07 * Math.cos(3 * a + 0.6) + 0.04 * Math.sin(2 * a);
    d +=
      (i ? "L" : "M") +
      (cx + rx * k * Math.cos(a)).toFixed(1) +
      " " +
      (cy + ry * k * Math.sin(a)).toFixed(1);
  }
  return d + "Z";
};

const roundRect = (x: number, y: number, w: number, h: number, r: number) =>
  `M${x + r} ${y}H${x + w - r}Q${x + w} ${y} ${x + w} ${y + r}V${y + h - r}Q${x + w} ${y + h} ${x + w - r} ${y + h}H${x + r}Q${x} ${y + h} ${x} ${y + h - r}V${y + r}Q${x} ${y} ${x + r} ${y}Z`;

/** Centred multi-line label, auto-fitted to the box it's given */
function Label({
  lines,
  cx,
  cy,
  w,
  h,
  base,
  fill,
}: {
  lines: string[];
  cx: number;
  cy: number;
  w: number;
  h: number;
  base: number;
  fill: string;
}) {
  const maxLen = Math.max(...lines.map((l) => l.length));
  const fs = Math.min(base, w / (maxLen * 0.66), h / (lines.length * 1.08));
  return (
    <text
      textAnchor="middle"
      fill={fill}
      style={{ fontFamily: HEADING, fontSize: fs, letterSpacing: ".02em", transition: "fill .35s" }}
    >
      {lines.map((l, j) => (
        <tspan
          key={j}
          x={cx}
          y={cy + (j - (lines.length - 1) / 2) * fs * 1.04}
          dominantBaseline="central"
        >
          {l}
        </tspan>
      ))}
    </text>
  );
}

const SIZE: Record<(typeof SH)[number], [number, number]> = {
  square: [150, 150],
  wide: [240, 104],
  ticket: [230, 112],
  tag: [220, 112],
  stamp: [160, 160],
  tape: [250, 84],
  circle: [156, 156],
  scallop: [172, 172],
  arch: [150, 178],
  burst: [178, 178],
  flower: [176, 176],
  blob: [214, 150],
};

export function StickerFace({ i, look, k }: { i: number; look: Look; k: number }) {
  const p = STK[i]!;
  const shape = SH[look.s]!;
  const [bg, fg] = COL[look.c]!;
  const z = k * p.m;
  const [bw, bh] = SIZE[shape];
  const w = bw * z;
  const h = bh * z;
  const lines = p.label.split("/");
  const fillStyle = { transition: "fill .35s" };
  let body: ReactNode;

  if (shape === "circle" || shape === "scallop") {
    const C = w / 2;
    const rr = shape === "circle" ? C - 22 * z : C - 28 * z;
    const id = `rg${i}-${look.s}`;
    const txt = lines.join(" ") + " • ";
    const ring = txt.length < 16 ? txt + txt : txt;
    body = (
      <>
        <defs>
          <path id={id} d={ringD(C, rr)} />
        </defs>
        {shape === "circle" ? (
          <circle cx={C} cy={C} r={C - 2} fill={bg} style={fillStyle} />
        ) : (
          <path d={scallopD(C, C, C - 8 * z, 6 * z, 14)} fill={bg} style={fillStyle} />
        )}
        <text fill={fg} style={{ fontFamily: HEADING, fontSize: 13.5 * z, letterSpacing: ".06em" }}>
          <textPath
            href={`#${id}`}
            textLength={(2 * Math.PI * rr - 6).toFixed(1)}
            lengthAdjust="spacing"
          >
            {ring}
          </textPath>
        </text>
        <path
          d={crescentD(C + 3 * z, C, 14 * z, 8 * z)}
          fill={fg}
          transform={`rotate(-12 ${C} ${C})`}
          style={fillStyle}
        />
      </>
    );
  } else if (shape === "ticket") {
    const sx = w * 0.26;
    const n = 10 * z;
    const r = 18 * z;
    const d = `M${r} 0H${sx - n}A${n} ${n} 0 0 0 ${sx + n} 0H${w - r}Q${w} 0 ${w} ${r}V${h - r}Q${w} ${h} ${w - r} ${h}H${sx + n}A${n} ${n} 0 0 0 ${sx - n} ${h}H${r}Q0 ${h} 0 ${h - r}V${r}Q0 0 ${r} 0Z`;
    body = (
      <>
        <path d={d} fill={bg} style={fillStyle} />
        <line
          x1={sx}
          y1={n + 4 * z}
          x2={sx}
          y2={h - n - 4 * z}
          stroke={fg}
          strokeWidth={2 * z}
          strokeDasharray={`${5 * z} ${5 * z}`}
          opacity={0.45}
        />
        <path
          d={crescentD(sx / 2 + 2 * z, h / 2, 11 * z, 6.5 * z)}
          fill={fg}
          transform={`rotate(-12 ${sx / 2} ${h / 2})`}
          style={fillStyle}
        />
        <Label
          lines={lines}
          cx={sx + (w - sx) / 2}
          cy={h / 2}
          w={w - sx - 26 * z}
          h={h - 28 * z}
          base={26 * z}
          fill={fg}
        />
      </>
    );
  } else if (shape === "tag") {
    const cut = w * 0.16;
    const r = 16 * z;
    const d = `M${cut} 0H${w - r}Q${w} 0 ${w} ${r}V${h - r}Q${w} ${h} ${w - r} ${h}H${cut}L0 ${h * 0.68}V${h * 0.32}Z`;
    const hx = cut * 0.72;
    body = (
      <>
        <path
          d={`M${hx} ${h / 2} C ${hx - 30 * z} ${h / 2 - 34 * z}, ${-26 * z} ${h / 2 - 20 * z}, ${-40 * z} ${h / 2 - 46 * z}`}
          stroke={fg}
          strokeWidth={2.5 * z}
          fill="none"
          strokeLinecap="round"
          opacity={0.7}
        />
        <path d={d} fill={bg} style={fillStyle} />
        <circle
          cx={hx}
          cy={h / 2}
          r={8 * z}
          fill="none"
          stroke={fg}
          strokeWidth={2.5 * z}
          opacity={0.7}
        />
        <Label
          lines={lines}
          cx={cut + (w - cut) / 2}
          cy={h / 2}
          w={w - cut - 26 * z}
          h={h - 28 * z}
          base={26 * z}
          fill={fg}
        />
      </>
    );
  } else if (shape === "stamp") {
    const id = `st${i}-${look.s}`;
    const step = 16 * z;
    const holes: ReactNode[] = [];
    for (let x = step / 2; x < w; x += step)
      holes.push(
        <circle key={`t${x}`} cx={x} cy={0} r={5 * z} />,
        <circle key={`b${x}`} cx={x} cy={h} r={5 * z} />,
      );
    for (let y = step / 2; y < h; y += step)
      holes.push(
        <circle key={`l${y}`} cx={0} cy={y} r={5 * z} />,
        <circle key={`r${y}`} cx={w} cy={y} r={5 * z} />,
      );
    body = (
      <>
        <defs>
          <mask id={id}>
            <rect width={w} height={h} fill="white" />
            <g fill="black">{holes}</g>
          </mask>
        </defs>
        <rect width={w} height={h} fill={bg} mask={`url(#${id})`} style={fillStyle} />
        <rect
          x={13 * z}
          y={13 * z}
          width={w - 26 * z}
          height={h - 26 * z}
          fill="none"
          stroke={fg}
          strokeWidth={1.5 * z}
          strokeDasharray={`${4 * z} ${4 * z}`}
          opacity={0.5}
        />
        <Label
          lines={lines}
          cx={w / 2}
          cy={h / 2}
          w={w - 44 * z}
          h={h - 44 * z}
          base={24 * z}
          fill={fg}
        />
      </>
    );
  } else if (shape === "arch") {
    const R = w / 2;
    body = (
      <>
        <path d={`M0 ${h}V${R}A${R} ${R} 0 0 1 ${w} ${R}V${h}Z`} fill={bg} style={fillStyle} />
        <path
          d={`M${14 * z} ${h - 12 * z}V${R}A${R - 14 * z} ${R - 14 * z} 0 0 1 ${w - 14 * z} ${R}V${h - 12 * z}`}
          fill="none"
          stroke={fg}
          strokeWidth={1.5 * z}
          opacity={0.35}
        />
        <Label
          lines={lines}
          cx={w / 2}
          cy={h * 0.6}
          w={w - 36 * z}
          h={h * 0.5}
          base={24 * z}
          fill={fg}
        />
      </>
    );
  } else if (shape === "burst") {
    const C = w / 2;
    body = (
      <>
        <path d={burstD(C, C, C - 2, C - 20 * z, 18)} fill={bg} style={fillStyle} />
        <Label lines={lines} cx={C} cy={C} w={w * 0.6} h={h * 0.5} base={24 * z} fill={fg} />
      </>
    );
  } else if (shape === "flower") {
    const C = w / 2;
    const petal = C * 0.42;
    body = (
      <>
        {Array.from({ length: 6 }, (_, j) => {
          const a = (j / 6) * Math.PI * 2;
          return (
            <circle
              key={j}
              cx={C + (C - petal - 2) * Math.cos(a)}
              cy={C + (C - petal - 2) * Math.sin(a)}
              r={petal}
              fill={bg}
              style={fillStyle}
            />
          );
        })}
        <circle cx={C} cy={C} r={C * 0.62} fill={bg} style={fillStyle} />
        <circle
          cx={C}
          cy={C}
          r={C * 0.56}
          fill="none"
          stroke={fg}
          strokeWidth={1.5 * z}
          strokeDasharray={`${3 * z} ${4 * z}`}
          opacity={0.4}
        />
        <Label lines={lines} cx={C} cy={C} w={C * 0.95} h={C * 0.8} base={22 * z} fill={fg} />
      </>
    );
  } else if (shape === "blob") {
    body = (
      <>
        <path d={blobD(w / 2, h / 2, w / 2 - 8 * z, h / 2 - 8 * z)} fill={bg} style={fillStyle} />
        <Label
          lines={lines}
          cx={w / 2}
          cy={h / 2}
          w={w * 0.66}
          h={h * 0.56}
          base={26 * z}
          fill={fg}
        />
      </>
    );
  } else if (shape === "tape") {
    const zz = 7 * z;
    const teeth = 6;
    let d = `M0 0H${w}`;
    for (let j = 1; j <= teeth; j++) d += `L${w - (j % 2 ? zz : 0)} ${(j * h) / teeth}`;
    d += `H0`;
    for (let j = teeth - 1; j >= 0; j--) d += `L${j % 2 ? zz : 0} ${(j * h) / teeth}`;
    d += "Z";
    body = (
      <>
        <path d={d} fill={bg} opacity={0.95} style={fillStyle} />
        <rect x={0} y={8 * z} width={w} height={3 * z} fill={N1} opacity={0.25} />
        <rect x={0} y={h - 11 * z} width={w} height={3 * z} fill={N1} opacity={0.25} />
        <Label
          lines={lines}
          cx={w / 2}
          cy={h / 2}
          w={w - 40 * z}
          h={h - 26 * z}
          base={24 * z}
          fill={fg}
        />
      </>
    );
  } else {
    const sq = shape === "square";
    body = (
      <>
        <path d={roundRect(0, 0, w, h, (sq ? 38 : 32) * z)} fill={bg} style={fillStyle} />
        <Label
          lines={lines}
          cx={w / 2}
          cy={h / 2}
          w={w - 30 * z}
          h={h - 28 * z}
          base={(sq ? 28 : 26) * z}
          fill={fg}
        />
      </>
    );
  }

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="pf-stk-svg">
      {body}
    </svg>
  );
}

/* ═════ Table objects (flat lay, top-down) ═════ */

function objectKids(kind: ObjKey): ReactNode {
  switch (kind) {
    case "notebook":
      return (
        <>
          <rect x={6} y={6} width={138} height={168} rx={16} fill="var(--color-accent-2-300)" />
          <rect x={6} y={6} width={24} height={168} rx={12} fill="var(--color-accent-2-600)" />
          <rect x={118} y={6} width={7} height={168} fill="var(--color-accent-500)" />
          <rect x={42} y={42} width={88} height={58} rx={12} fill={N1} />
          <text
            x={82}
            y={66}
            textAnchor="middle"
            fill="var(--color-accent-2-900)"
            style={{ fontFamily: HEADING, fontSize: 13 }}
          >
            FIND THE
          </text>
          <text
            x={82}
            y={86}
            textAnchor="middle"
            fill="var(--color-accent-2-900)"
            style={{ fontFamily: HEADING, fontSize: 13 }}
          >
            PROBLEM
          </text>
        </>
      );
    case "cup":
      return (
        <>
          <circle cx={50} cy={50} r={46} fill={N1} stroke={N3} strokeWidth={2} />
          <rect x={74} y={43} width={30} height={14} rx={7} fill={N1} stroke={N3} strokeWidth={2} />
          <circle cx={50} cy={50} r={30} fill={N1} stroke={N3} strokeWidth={2} />
          <circle cx={50} cy={50} r={24} fill="var(--color-accent-700)" />
          <path
            d="M50 60 C 37 51, 40 40, 50 47 C 60 40, 63 51, 50 60 Z"
            fill="var(--color-accent-200)"
          />
        </>
      );
    case "compass":
      return (
        <>
          <circle cx={46} cy={46} r={43} fill="var(--color-accent-600)" />
          <circle cx={46} cy={46} r={36} fill={N1} />
          {Array.from({ length: 16 }, (_, j) => (
            <line
              key={j}
              x1={46}
              y1={13}
              x2={46}
              y2={j % 4 ? 17 : 21}
              stroke="var(--color-neutral-500)"
              strokeWidth={j % 4 ? 1.2 : 2}
              transform={`rotate(${j * 22.5} 46 46)`}
            />
          ))}
          <text
            x={46}
            y={29}
            textAnchor="middle"
            fill="var(--color-accent-700)"
            style={{ fontFamily: HEADING, fontSize: 10 }}
          >
            N
          </text>
          <path d="M46 26 L52 46 L46 66 L40 46 Z" fill="var(--color-neutral-400)" />
          <path d="M46 26 L52 46 L40 46 Z" fill="var(--color-accent-500)" />
          <circle cx={46} cy={46} r={3.5} fill={INK} />
        </>
      );
    case "plate":
      return (
        <>
          <defs>
            <path id="plate-ring" d={ringD(85, 71)} />
          </defs>
          <circle cx={85} cy={85} r={82} fill={N1} stroke={N3} strokeWidth={2} />
          <circle cx={85} cy={85} r={60} fill="none" stroke={N3} strokeWidth={2} />
          <text
            fill="var(--color-neutral-700)"
            style={{ fontFamily: HEADING, fontSize: 11, letterSpacing: ".08em" }}
          >
            <textPath href="#plate-ring" textLength={440} lengthAdjust="spacing">
              MAKE THE MESS LEGIBLE • 12 SHEETS, ONE SYSTEM •{" "}
            </textPath>
          </text>
          {(
            [
              ["var(--color-accent-300)", 57],
              ["var(--color-accent-2-300)", 85],
              ["var(--color-accent-200)", 113],
            ] as const
          ).map(([f, x]) => (
            <g key={x}>
              <circle cx={x} cy={85} r={13} fill={f} />
              <circle cx={x} cy={85} r={8} fill="none" stroke={N1} strokeWidth={2} opacity={0.7} />
            </g>
          ))}
        </>
      );
    /* Twelve spreadsheets, filed into one thing you can actually open: a ring
       binder with the messy sheets tabbed and tucked inside it. */
    case "notes": {
      const tabs = [
        "var(--color-accent-400)",
        "var(--color-accent-2-400)",
        "var(--color-accent-300)",
        "var(--color-accent-2-300)",
      ];
      return (
        <>
          {/* the loose sheets, poking out of the back */}
          <rect
            x={30}
            y={8}
            width={92}
            height={80}
            rx={4}
            fill={N1}
            stroke={N3}
            strokeWidth={2}
            transform="rotate(-4 76 48)"
          />
          <rect
            x={32}
            y={12}
            width={92}
            height={80}
            rx={4}
            fill={N1}
            stroke={N3}
            strokeWidth={2}
            transform="rotate(3 78 52)"
          />
          {/* the tabbed dividers down the right edge */}
          {tabs.map((c, i) => (
            <rect key={c} x={110} y={20 + i * 17} width={18} height={13} rx={3} fill={c} />
          ))}
          {/* the cover */}
          <rect x={16} y={10} width={94} height={86} rx={7} fill="var(--color-accent-2-600)" />
          <rect x={16} y={10} width={20} height={86} rx={7} fill="var(--color-accent-2-700)" />
          {/* the rings on the spine */}
          {[26, 48, 70].map((cy) => (
            <circle key={cy} cx={26} cy={cy + 6} r={6} fill="none" stroke={N3} strokeWidth={3} />
          ))}
          {/* the label on the cover */}
          <rect x={40} y={38} width={66} height={28} rx={5} fill={N1} />
          <text
            x={73}
            y={52}
            textAnchor="middle"
            dominantBaseline="central"
            fill="var(--color-accent-2-800)"
            style={{ fontFamily: HEADING, fontSize: 12 }}
          >
            1 SYSTEM
          </text>
        </>
      );
    }
    /* a little something on the table, because four settings and no cake is sad */
    case "cake":
      return (
        <>
          {/* the paper case, pleated */}
          <path
            d="M20 38 H72 L64 84 Q63 90 56 90 H36 Q29 90 28 84 Z"
            fill="var(--color-accent-300)"
            stroke="var(--color-accent-600)"
            strokeWidth={2.5}
            strokeLinejoin="round"
          />
          <path
            d="M34 40 L39 88 M46 40 L46 90 M58 40 L53 88"
            stroke="var(--color-accent-500)"
            strokeWidth={2.5}
            fill="none"
            strokeLinecap="round"
          />
          {/* the cream, swirled */}
          <path
            d="M14 40 Q12 22 30 22 Q33 10 46 10 Q59 10 62 22 Q80 22 78 40 Z"
            fill={N1}
            stroke={N3}
            strokeWidth={2.5}
            strokeLinejoin="round"
          />
          <path
            d="M22 34 Q32 25 46 27"
            stroke={N3}
            strokeWidth={2}
            fill="none"
            strokeLinecap="round"
          />
          {/* the strawberry, sitting in it */}
          <path
            d="M46 4 Q60 5 60 16 Q60 28 46 33 Q32 28 32 16 Q32 5 46 4 Z"
            fill="var(--color-accent-600)"
          />
          <path d="M38 6 L46 10 L54 6 L46 1 Z" fill="var(--color-accent-2-600)" />
          <circle cx={42} cy={14} r={1.6} fill={N1} />
          <circle cx={50} cy={17} r={1.6} fill={N1} />
          <circle cx={46} cy={24} r={1.6} fill={N1} />
        </>
      );
    case "jar":
      return (
        <>
          <rect x={4} y={14} width={64} height={84} rx={16} fill={N1} stroke={N3} strokeWidth={2} />
          <rect x={10} y={66} width={52} height={26} rx={8} fill="var(--color-accent-300)" />
          <rect x={10} y={46} width={52} height={20} fill="var(--color-accent-2-300)" />
          <rect x={10} y={30} width={52} height={16} fill="var(--color-accent-200)" />
          <rect x={10} y={2} width={52} height={16} rx={5} fill="var(--color-accent-700)" />
          <rect x={12} y={50} width={48} height={14} rx={3} fill={N1} />
          <text
            x={36}
            y={57}
            textAnchor="middle"
            dominantBaseline="central"
            fill="var(--color-accent-800)"
            style={{ fontFamily: HEADING, fontSize: 9 }}
          >
            SORTED
          </text>
        </>
      );
    case "laptop": {
      const keys = [];
      for (let r = 0; r < 3; r++)
        for (let q = 0; q < 12; q++)
          keys.push(
            <rect
              key={`k${r}-${q}`}
              x={21 + q * 12.6}
              y={84 + r * 8.6}
              width={9.6}
              height={6}
              rx={2}
              fill={N3}
            />,
          );
      return (
        <>
          <rect x={0} y={0} width={190} height={136} rx={16} fill="var(--color-neutral-400)" />
          <rect x={10} y={9} width={170} height={64} rx={9} fill={INK} />
          <text
            x={92}
            y={47}
            textAnchor="middle"
            fill="var(--color-accent-300)"
            style={{ fontFamily: HEADING, fontSize: 16 }}
          >
            GO LIVE
          </text>
          <rect x={164} y={35} width={3} height={16} fill="var(--color-accent-300)" />
          <rect x={16} y={80} width={158} height={30} rx={7} fill="var(--color-neutral-500)" />
          <rect x={72} y={115} width={46} height={15} rx={5} fill={N3} />
          {keys}
        </>
      );
    }
    case "parcel":
      return (
        <>
          <rect x={2} y={2} width={100} height={86} rx={8} fill="var(--color-accent-400)" />
          <rect x={44} y={2} width={16} height={86} fill="var(--color-accent-200)" opacity={0.75} />
          <rect x={10} y={48} width={48} height={32} rx={4} fill={N1} />
          <text
            x={34}
            y={58}
            textAnchor="middle"
            dominantBaseline="central"
            fill={INK}
            style={{ fontFamily: HEADING, fontSize: 9 }}
          >
            SHIPPED
          </text>
          <rect x={16} y={66} width={34} height={3} rx={1.5} fill={N3} />
          <rect x={16} y={72} width={24} height={3} rx={1.5} fill={N3} />
        </>
      );
    case "phone":
      return (
        <>
          <rect x={1} y={1} width={62} height={116} rx={14} fill={INK} />
          <rect x={6} y={10} width={52} height={98} rx={8} fill={N1} />
          <rect x={14} y={20} width={30} height={12} rx={6} fill="var(--color-accent-2-300)" />
          <circle cx={20} cy={26} r={2.5} fill="var(--color-accent-2-700)" />
          <text
            x={32}
            y={26.5}
            textAnchor="middle"
            dominantBaseline="central"
            fill="var(--color-accent-2-900)"
            style={{ fontFamily: HEADING, fontSize: 7 }}
          >
            READY
          </text>
          <circle cx={32} cy={60} r={14} fill="var(--color-accent-2-500)" />
          <path
            d="M25 60 l5 5 l9 -10"
            stroke={N1}
            strokeWidth={3}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <rect x={14} y={84} width={36} height={4} rx={2} fill={N3} />
          <rect x={18} y={92} width={28} height={4} rx={2} fill={N3} />
        </>
      );
    case "plant":
      return (
        <>
          <circle
            cx={75}
            cy={75}
            r={40}
            fill="var(--color-accent-500)"
            stroke="var(--color-accent-600)"
            strokeWidth={4}
          />
          <circle cx={75} cy={75} r={31} fill="var(--color-accent-800)" />
          {Array.from({ length: 7 }, (_, j) => (
            <ellipse
              key={j}
              cx={75}
              cy={40}
              rx={15}
              ry={36}
              fill={j % 2 ? "var(--color-accent-2-500)" : "var(--color-accent-2-600)"}
              transform={`rotate(${j * 51.4 + 10} 75 75)`}
            />
          ))}
          <circle cx={75} cy={75} r={8} fill="var(--color-accent-2-400)" />
        </>
      );
    case "card":
      return (
        <>
          <rect x={1} y={1} width={128} height={98} rx={14} fill={N1} stroke={N3} strokeWidth={2} />
          <text
            x={16}
            y={30}
            fill="var(--color-accent-700)"
            style={{ fontFamily: HEADING, fontSize: 15 }}
          >
            PLAYBOOKS
          </text>
          {[98, 84, 60].map((lw, j) => (
            <rect key={j} x={16} y={44 + j * 14} width={lw} height={5} rx={2.5} fill={N3} />
          ))}
          <circle cx={108} cy={80} r={11} fill="var(--color-accent-2-500)" />
          <path
            d="M103 80 l4 4 l7 -8"
            stroke={N1}
            strokeWidth={2.75}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      );
    case "keys":
      return (
        <>
          <circle
            cx={30}
            cy={30}
            r={17}
            fill="none"
            stroke="var(--color-neutral-500)"
            strokeWidth={4}
          />
          <g transform="rotate(35 30 30)">
            <circle cx={30} cy={52} r={9} fill="var(--color-neutral-400)" />
            <rect x={27} y={58} width={6} height={26} rx={2} fill="var(--color-neutral-400)" />
            <rect x={33} y={72} width={7} height={4} fill="var(--color-neutral-400)" />
            <rect x={33} y={78} width={5} height={4} fill="var(--color-neutral-400)" />
            <circle cx={30} cy={52} r={3} fill={N1} />
          </g>
          <path
            d="M40 16 L78 10 Q84 9 84 15 L84 33 Q84 39 78 38 L40 34 L32 25 Z"
            fill="var(--color-accent-2-300)"
          />
          <circle cx={42} cy={25} r={3} fill={N1} />
          <text
            x={63}
            y={24}
            textAnchor="middle"
            dominantBaseline="central"
            fill="var(--color-accent-2-900)"
            style={{ fontFamily: HEADING, fontSize: 10 }}
          >
            YOURS
          </text>
        </>
      );
  }
}

export function TableObject({ objKey, k }: { objKey: ObjKey; k: number }) {
  const o = OBJ[objKey];
  return (
    <svg
      width={o.w * k}
      height={o.h * k}
      viewBox={`0 0 ${o.w} ${o.h}`}
      className="pf-obj-svg"
      style={{ transform: `rotate(${o.r}deg)` }}
    >
      {objectKids(objKey)}
    </svg>
  );
}

/** The "A" from the wordmark: Fraunces 800, soft and wonky, at the header's optical size */
const LOGO_A =
  "M5.62 15.55H10.5L10.5 17.08H5.6ZM6.99 19.76Q6.99 20.1 6.79 20.3Q6.58 20.5 6.15 20.5H3.91Q3.48 20.5 3.28 20.3Q3.07 20.1 3.07 19.76Q3.07 19.53 3.18 19.37Q3.28 19.21 3.51 19.03L3.7 18.91Q3.86 18.8 3.96 18.65Q4.05 18.5 4.22 17.97L6.15 11.88Q6.28 11.49 6.26 11.31Q6.23 11.13 5.94 11Q5.71 10.88 5.6 10.69Q5.48 10.5 5.48 10.24Q5.48 9.9 5.69 9.7Q5.89 9.5 6.32 9.5H11.37Q11.8 9.5 12 9.7Q12.21 9.9 12.21 10.24Q12.21 10.52 12.08 10.71Q11.95 10.9 11.7 11.03Q11.52 11.12 11.51 11.31Q11.49 11.5 11.59 11.83L13.41 17.49Q13.62 18.16 13.76 18.47Q13.9 18.78 14.16 18.92Q14.49 19.11 14.61 19.29Q14.73 19.48 14.73 19.76Q14.73 20.1 14.52 20.3Q14.32 20.5 13.89 20.5H10.17Q9.74 20.5 9.54 20.3Q9.33 20.1 9.33 19.76Q9.33 19.5 9.46 19.32Q9.58 19.15 9.83 19.03L10.13 18.9Q10.32 18.81 10.28 18.62Q10.24 18.42 10.11 18.01L7.9 10.83L8.12 10.85L5.98 17.66Q5.87 18.02 5.79 18.24Q5.72 18.46 5.79 18.6Q5.87 18.75 6.19 18.92L6.5 19.05Q6.72 19.16 6.86 19.33Q6.99 19.49 6.99 19.76Z";

/** "AC" badge: the wordmark's cream A and orange moon-C on a sage tile (the favicon, drawn bigger above the hero headline) */
export function MoonMark({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 30 30" className="pf-logo" aria-hidden="true">
      <rect width={30} height={30} rx={9} fill="var(--color-accent-2-800)" />
      <path d={LOGO_A} fill="var(--color-bg)" />
      <path
        d="M22.76 9.36A5.9 5.9 0 1 0 22.76 20.64A5.9 5.9 0 0 1 22.76 9.36Z"
        fill="var(--color-accent-400)"
        transform="rotate(-12 21.03 15)"
      />
    </svg>
  );
}

/* ═════ Before you go: stickers a visitor can leave on the table ═════ */

const HEART = "M50 90C18 68 4 48 14 28C24 10 44 14 50 30C56 14 76 10 86 28C96 48 82 68 50 90Z";

function StickerWords({
  lines,
  y,
  size,
  fill,
}: {
  lines: string[];
  y: number;
  size: number;
  fill: string;
}) {
  const top = y - ((lines.length - 1) * size * 0.95) / 2;
  return (
    <text
      textAnchor="middle"
      fill={fill}
      style={{ fontFamily: HEADING, fontSize: size, letterSpacing: ".02em" }}
    >
      {lines.map((l, k) => (
        <tspan key={l} x={50} y={top + k * size * 0.95} dominantBaseline="central">
          {l}
        </tspan>
      ))}
    </text>
  );
}

export function TableSticker({ kind, size }: { kind: StickerKind; size: number }) {
  // a white die-cut edge round every shape, like a real sticker
  const cut = {
    stroke: N1,
    strokeWidth: 5,
    paintOrder: "stroke" as const,
    strokeLinejoin: "round" as const,
  };
  let body: ReactNode;
  switch (kind) {
    case "hi":
      body = (
        <>
          <circle cx={50} cy={50} r={44} fill="var(--color-accent)" {...cut} />
          <StickerWords lines={["HI!"]} y={52} size={30} fill={N1} />
        </>
      );
      break;
    case "hire":
      body = (
        <>
          <path d={burstD(50, 50, 47, 38, 14)} fill="var(--color-accent-2)" {...cut} />
          <StickerWords lines={["HIRE", "HER"]} y={51} size={17} fill="var(--color-accent-2-900)" />
        </>
      );
      break;
    case "coffee":
      body = (
        <>
          <rect
            x={6}
            y={22}
            width={88}
            height={56}
            rx={14}
            fill="var(--color-accent-2-200)"
            {...cut}
          />
          <rect
            x={13}
            y={29}
            width={74}
            height={42}
            rx={9}
            fill="none"
            stroke="var(--color-accent-2-600)"
            strokeWidth={1.5}
            strokeDasharray="4 3"
          />
          <StickerWords
            lines={["COFFEE", "SOON?"]}
            y={50}
            size={14}
            fill="var(--color-accent-2-800)"
          />
        </>
      );
      break;
    case "love":
      body = (
        <>
          <path d={HEART} fill="var(--color-accent-300)" {...cut} />
          <StickerWords lines={["LOVE", "THIS"]} y={46} size={15} fill="var(--color-accent-800)" />
        </>
      );
      break;
    case "build":
      body = (
        <>
          <path d={scallopD(50, 50, 40, 5, 12)} fill="var(--color-accent-200)" {...cut} />
          <StickerWords
            lines={["LET’S", "BUILD"]}
            y={51}
            size={15}
            fill="var(--color-accent-700)"
          />
        </>
      );
      break;
    case "moon":
      body = (
        <>
          <circle cx={50} cy={50} r={44} fill="var(--color-neutral-900)" {...cut} />
          <path
            d={crescentD(54, 50, 26, 15)}
            fill="var(--color-accent-400)"
            transform="rotate(-12 50 50)"
          />
        </>
      );
      break;
    case "yay":
      body = (
        <>
          <path d={burstD(50, 50, 48, 23, 5)} fill="var(--color-accent-400)" {...cut} />
          <StickerWords lines={["YAY"]} y={52} size={20} fill="var(--color-text)" />
        </>
      );
      break;
    case "thanks":
      body = (
        <>
          <circle cx={50} cy={50} r={44} fill={N1} {...cut} />
          <circle
            cx={50}
            cy={50}
            r={37}
            fill="none"
            stroke="var(--color-accent-500)"
            strokeWidth={3}
          />
          <StickerWords lines={["THANK", "YOU"]} y={51} size={17} fill="var(--color-accent-600)" />
        </>
      );
      break;
  }
  return (
    <svg
      width={size}
      height={size}
      viewBox="-4 -4 108 108"
      className="pf-tsticker"
      aria-hidden="true"
    >
      {body}
    </svg>
  );
}

/* ═════ Lunar Playground: the report's lifecycle ═════ */

type StageState = "idle" | "active" | "done";

function stationKids(kind: "order" | "chart" | "reading" | "pdf", state: StageState) {
  switch (kind) {
    case "order":
      return (
        <>
          <rect x={-15} y={-10} width={30} height={20} rx={3.5} className="lp-card" />
          <circle cx={-9} cy={-3} r={2.5} className="lp-line" />
          <line x1={-3} y1={-4} x2={9} y2={-4} className="lp-line" strokeWidth={1.6} />
          <line x1={-3} y1={1} x2={5} y2={1} className="lp-line" strokeWidth={1.6} />
          <line x1={-3} y1={6} x2={9} y2={6} className="lp-line" strokeWidth={1.6} />
        </>
      );
    case "chart": {
      const spokes = Array.from({ length: 8 }, (_, j) => {
        const a = (j / 8) * Math.PI * 2 - Math.PI / 2;
        return { x: Math.cos(a) * 16, y: Math.sin(a) * 16, d: j };
      });
      return (
        <>
          <circle r={16} className="lp-ring" />
          <circle r={10} className="lp-ring" opacity={0.6} />
          {spokes.map((s, j) => (
            <line
              key={j}
              x1={0}
              y1={0}
              x2={s.x}
              y2={s.y}
              pathLength={1}
              className="lp-spoke"
              style={{ transitionDelay: state === "idle" ? "0s" : `${j * 0.05}s` }}
            />
          ))}
          <circle r={3} className="lp-dot" />
        </>
      );
    }
    case "reading":
      return (
        <>
          <rect x={-13} y={-16} width={26} height={32} rx={3} className="lp-card" />
          {[-6, 1, 8].map((y, j) => (
            <line
              key={y}
              x1={-8}
              y1={y}
              x2={j === 1 ? 4 : 8}
              y2={y}
              pathLength={1}
              className="lp-line lp-write"
              strokeWidth={1.8}
              style={{ transitionDelay: state === "idle" ? "0s" : `${j * 0.18}s` }}
            />
          ))}
        </>
      );
    case "pdf":
      return (
        <>
          <path d="M-15 -16H7L15 -8V16H-15Z" className="lp-card" />
          <path d="M7 -16V-8H15Z" className="lp-fold" />
          <text
            x={-4}
            y={7}
            textAnchor="middle"
            className="lp-pdf-text"
            style={{ fontFamily: HEADING, fontSize: 8 }}
          >
            PDF
          </text>
          <g className="lp-check">
            <circle cx={11} cy={13} r={8} className="lp-check-bg" />
            <path
              d="M7.5 13 L10 15.5 L15 9.5"
              className="lp-check-mark"
              strokeWidth={1.8}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        </>
      );
  }
}

export function LunarPipeline({ step }: { step: number }) {
  const xs = [42, 114, 186, 258];
  const stageOf = (i: number): StageState => (step > i ? "done" : step === i ? "active" : "idle");
  const doneFrac = step < 0 ? 0 : step >= 4 ? 4 : step + 0.5;
  const trackW = xs[3]! - xs[0]!;
  const fillW = (doneFrac / 4) * trackW;

  /* The viewBox is cropped to the band the stations actually occupy (r22 around
     y45), so the panel is not mostly empty dark space above and below them. */
  return (
    <svg
      viewBox="0 20 300 50"
      className={`pf-pipe-map${step >= 0 ? " on" : ""}`}
      aria-hidden="true"
    >
      <line x1={xs[0]} y1={45} x2={xs[3]} y2={45} className="lp-track" />
      <rect x={xs[0]} y={43} width={fillW} height={4} rx={2} className="lp-progress" />
      {(["order", "chart", "reading", "pdf"] as const).map((kind, i) => {
        const state = stageOf(i);
        return (
          <g
            key={kind}
            data-state={state}
            className="lp-station"
            transform={`translate(${xs[i]} 45)`}
          >
            <circle r={22} className="lp-badge" />
            {stationKids(kind, state)}
          </g>
        );
      })}
    </svg>
  );
}

/* ═════ Flags, drawn properly, for the stamp on each postcard ═════ */

/** How far to turn a star so its top point aims at (tx, ty). */
const aimAt = (cx: number, cy: number, tx: number, ty: number) =>
  Math.atan2(ty - cy, tx - cx) + Math.PI / 2;

/** An n-pointed star as a path, first point straight up unless turned. */
const starD = (cx: number, cy: number, R: number, n = 5, inner = 0.382, turn = 0) => {
  let d = "";
  for (let i = 0; i < n * 2; i++) {
    const a = (i / (n * 2)) * Math.PI * 2 - Math.PI / 2 + turn;
    const r = i % 2 ? R * inner : R;
    d +=
      (i ? "L" : "M") + (cx + r * Math.cos(a)).toFixed(2) + " " + (cy + r * Math.sin(a)).toFixed(2);
  }
  return d + "Z";
};

/** A crescent: the part of one disc left uncovered by a second, offset to the right.
 *  Traced as a single outline through the two points where the discs cross — two
 *  circles with even-odd fill leave the cutting disc's own lump behind instead. */
const crescent = (cx: number, cy: number, r: number, dx: number, cut: number) => {
  const x = (dx * dx + r * r - cut * cut) / (2 * dx);
  const y = Math.sqrt(Math.max(0, r * r - x * x));
  const p1 = `${(cx + x).toFixed(2)} ${(cy - y).toFixed(2)}`;
  const p2 = `${(cx + x).toFixed(2)} ${(cy + y).toFixed(2)}`;
  return `M${p1}A${r} ${r} 0 1 0 ${p2}A${cut} ${cut} 0 1 1 ${p1}Z`;
};

/** The Union Flag, drawn into a w×h box at (x, y) — Australia reuses it as its canton. */
function UnionJack({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  const id = `uj${x}-${y}-${w}`;
  return (
    <g>
      <clipPath id={id}>
        <rect x={x} y={y} width={w} height={h} />
      </clipPath>
      <g clipPath={`url(#${id})`}>
        <rect x={x} y={y} width={w} height={h} fill="#012169" />
        {/* the saltires: white first, then the narrower red over them */}
        <g stroke="#f7f7f7" strokeWidth={h * 0.2}>
          <line x1={x} y1={y} x2={x + w} y2={y + h} />
          <line x1={x + w} y1={y} x2={x} y2={y + h} />
        </g>
        <g stroke="#c8102e" strokeWidth={h * 0.085}>
          <line x1={x} y1={y} x2={x + w} y2={y + h} />
          <line x1={x + w} y1={y} x2={x} y2={y + h} />
        </g>
        {/* then the upright cross, which sits over both */}
        <g stroke="#f7f7f7" strokeWidth={h * 0.29}>
          <line x1={x + w / 2} y1={y} x2={x + w / 2} y2={y + h} />
          <line x1={x} y1={y + h / 2} x2={x + w} y2={y + h / 2} />
        </g>
        <g stroke="#c8102e" strokeWidth={h * 0.17}>
          <line x1={x + w / 2} y1={y} x2={x + w / 2} y2={y + h} />
          <line x1={x} y1={y + h / 2} x2={x + w} y2={y + h / 2} />
        </g>
      </g>
    </g>
  );
}

/** Each flag on a 60 × 40 field. */
export function Flag({ code }: { code: FlagCode }) {
  switch (code) {
    case "th":
      return (
        <>
          <rect width={60} height={40} fill="#f4f5f8" />
          <rect width={60} height={6.67} fill="#a51931" />
          <rect y={33.33} width={60} height={6.67} fill="#a51931" />
          <rect y={13.33} width={60} height={13.34} fill="#2d2a4a" />
        </>
      );
    case "cn":
      return (
        <>
          <rect width={60} height={40} fill="#de2910" />
          <path d={starD(12, 10, 6)} fill="#ffde00" />
          {/* the four small stars each point at the big one */}
          {(
            [
              [22, 4],
              [26, 8.5],
              [26, 14.5],
              [22, 19],
            ] as const
          ).map(([cx, cy]) => (
            <path
              key={cx + cy}
              d={starD(cx, cy, 2, 5, 0.382, aimAt(cx, cy, 12, 10))}
              fill="#ffde00"
            />
          ))}
        </>
      );
    case "sg":
      return (
        <>
          <rect width={60} height={40} fill="#f7f7f7" />
          <rect width={60} height={20} fill="#ed2939" />
          <path d={crescent(13, 10, 7.6, 3.6, 6.9)} fill="#f7f7f7" />
          {(
            [
              [21.6, 5.4],
              [26.4, 8.9],
              [24.6, 14.6],
              [18.6, 14.6],
              [16.8, 8.9],
            ] as const
          ).map(([cx, cy]) => (
            <path key={cx} d={starD(cx, cy, 2.4)} fill="#f7f7f7" />
          ))}
        </>
      );
    case "jp":
      return (
        <>
          <rect width={60} height={40} fill="#f7f7f7" />
          <circle cx={30} cy={20} r={12} fill="#bc002d" />
        </>
      );
    case "vn":
      return (
        <>
          <rect width={60} height={40} fill="#da251d" />
          <path d={starD(30, 20, 12)} fill="#ffff00" />
        </>
      );
    case "my":
      return (
        <>
          <rect width={60} height={40} fill="#f7f7f7" />
          {[0, 2, 4, 6, 8, 10, 12].map((i) => (
            <rect key={i} y={(i * 40) / 14} width={60} height={40 / 14} fill="#cc0001" />
          ))}
          <rect width={30} height={(8 * 40) / 14} fill="#010066" />
          <path d={crescent(11, 11.4, 6.8, 3.2, 6.2)} fill="#ffcc00" />
          <path d={starD(20.5, 11.4, 5.6, 14, 0.58)} fill="#ffcc00" />
        </>
      );
    case "es":
      return (
        <>
          <rect width={60} height={40} fill="#aa151b" />
          <rect y={10} width={60} height={20} fill="#f1bf00" />
        </>
      );
    case "be":
      return (
        <>
          <rect width={20} height={40} fill="#2d2926" />
          <rect x={20} width={20} height={40} fill="#fae042" />
          <rect x={40} width={20} height={40} fill="#ed2939" />
        </>
      );
    case "gb":
      return <UnionJack x={0} y={0} w={60} h={40} />;
    case "au":
      return (
        <>
          <rect width={60} height={40} fill="#012169" />
          <UnionJack x={0} y={0} w={30} h={20} />
          <path d={starD(15, 30, 5, 7, 0.46)} fill="#f7f7f7" />
          {/* the Southern Cross */}
          <path d={starD(45, 8, 3, 7, 0.46)} fill="#f7f7f7" />
          <path d={starD(38, 20, 3, 7, 0.46)} fill="#f7f7f7" />
          <path d={starD(52, 21, 3, 7, 0.46)} fill="#f7f7f7" />
          <path d={starD(45, 33, 3, 7, 0.46)} fill="#f7f7f7" />
          <path d={starD(47.5, 16, 1.7, 5, 0.46)} fill="#f7f7f7" />
        </>
      );
  }
}

/* ═════ A postage stamp: perforated edge, white margin, the flag as its picture ═════ */

/** The outline of a stamp: a rectangle with half-round bites taken out of every edge. */
const perfD = (w: number, h: number, r: number, gap: number) => {
  const run = (len: number) => {
    const n = Math.max(2, Math.round(len / gap));
    return Array.from({ length: n }, (_, i) => ((i + 0.5) * len) / n);
  };
  let d = `M0 0`;
  for (const t of run(w)) d += `L${(t - r).toFixed(2)} 0A${r} ${r} 0 0 0 ${(t + r).toFixed(2)} 0`;
  d += `L${w} 0`;
  for (const t of run(h))
    d += `L${w} ${(t - r).toFixed(2)}A${r} ${r} 0 0 0 ${w} ${(t + r).toFixed(2)}`;
  d += `L${w} ${h}`;
  for (const t of run(w))
    d += `L${(w - t + r).toFixed(2)} ${h}A${r} ${r} 0 0 0 ${(w - t - r).toFixed(2)} ${h}`;
  d += `L0 ${h}`;
  for (const t of run(h))
    d += `L0 ${(h - t + r).toFixed(2)}A${r} ${r} 0 0 0 0 ${(h - t - r).toFixed(2)}`;
  return d + "Z";
};

/** The stamp on the back: perforated edge, a plain block of the place's colour, and
 *  a face value, so no two cards carry quite the same stamp. */
export function Stamp({ tone, value }: { tone: string; value: string }) {
  return (
    <svg viewBox="0 0 100 124" className="pf-k-stamp-svg" aria-hidden="true">
      <path d={perfD(100, 124, 4.2, 13)} fill="#fffdf5" />
      <rect x={13} y={13} width={74} height={62} rx={2} fill={tone} />
      <text
        x={50}
        y={92}
        textAnchor="middle"
        fill="#6f6754"
        style={{ fontFamily: HEADING, fontSize: 11, letterSpacing: 1.4 }}
      >
        POSTAGE
      </text>
      <text
        x={50}
        y={112}
        textAnchor="middle"
        fill="#3f3a30"
        style={{ fontFamily: HEADING, fontSize: 17, fontWeight: 700 }}
      >
        {value}
      </text>
    </svg>
  );
}
