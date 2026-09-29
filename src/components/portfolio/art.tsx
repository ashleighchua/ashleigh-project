/*
 * SVG art for the page: hero stickers (8 shapes), the flat-lay table objects
 * they turn into, and the little scenes on the timeline cards.
 */
import type { ReactNode } from "react";
import { COL, OBJ, SH, STK, type ObjKey, type Scene } from "./data";

export type Look = { c: number; s: number };

const HEADING = "var(--font-heading)";
const N1 = "var(--color-neutral-100)";
const N3 = "var(--color-neutral-300)";
const INK = "var(--color-neutral-900)";

const ringD = (c: number, r: number) =>
  `M ${c - r} ${c} a ${r} ${r} 0 1 1 ${2 * r} 0 a ${r} ${r} 0 1 1 ${-2 * r} 0`;

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
        <text
          x={C}
          y={C}
          textAnchor="middle"
          dominantBaseline="central"
          fill={fg}
          style={{ fontFamily: HEADING, fontSize: 38 * z }}
        >
          {"✳︎"}
        </text>
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
        <text
          x={sx / 2}
          y={h / 2}
          textAnchor="middle"
          dominantBaseline="central"
          fill={fg}
          style={{ fontFamily: HEADING, fontSize: 30 * z }}
        >
          {"✳︎"}
        </text>
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
          <rect x={42} y={42} width={88} height={58} rx={12} fill={N1} />
          <text
            x={86}
            y={66}
            textAnchor="middle"
            fill="var(--color-accent-2-900)"
            style={{ fontFamily: HEADING, fontSize: 15 }}
          >
            FIND THE
          </text>
          <text
            x={86}
            y={86}
            textAnchor="middle"
            fill="var(--color-accent-2-900)"
            style={{ fontFamily: HEADING, fontSize: 15 }}
          >
            PROBLEM
          </text>
          <rect x={118} y={6} width={7} height={168} fill="var(--color-accent-500)" />
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
              MAKE THE MESS LEGIBLE • TURN SOMETHING VAGUE INTO A PLAN •{" "}
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
    case "notes": {
      const cols = [
        "var(--color-accent-200)",
        "var(--color-accent-2-200)",
        "var(--color-neutral-200)",
        "var(--color-accent-300)",
      ];
      const notes = [];
      for (let r = 0; r < 3; r++)
        for (let q = 0; q < 4; q++)
          notes.push(
            <rect
              key={`${r}-${q}`}
              x={4 + q * 31}
              y={4 + r * 32}
              width={28}
              height={28}
              rx={4}
              fill={cols[(r + q) % 4]}
              transform={`rotate(${((r * 4 + q) % 3) * 4 - 4} ${18 + q * 31} ${18 + r * 32})`}
            />,
          );
      return (
        <>
          {notes}
          <rect x={30} y={30} width={70} height={44} rx={8} fill={N1} stroke={N3} strokeWidth={2} />
          <text
            x={65}
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
            MAKE IT USEFUL
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
            GO LIVE
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

/* ═════ Timeline scenes (160 × 96) ═════ */

function sceneKids(scene: Scene): ReactNode {
  switch (scene) {
    case "flask":
      return (
        <>
          <path
            d="M70 14 H90 V38 L112 80 Q115 88 106 88 H54 Q45 88 48 80 L70 38 Z"
            fill={N1}
            stroke="var(--color-neutral-500)"
            strokeWidth={2.5}
            strokeLinejoin="round"
          />
          <path
            d="M60 60 H100 L110 80 Q112 85 106 85 H54 Q48 85 50 80 Z"
            fill="var(--color-accent-2-400)"
          />
          <circle cx={74} cy={72} r={4} fill={N1} opacity={0.8} />
          <circle cx={88} cy={66} r={3} fill={N1} opacity={0.8} />
          <circle cx={80} cy={50} r={2.5} fill="var(--color-accent-2-400)" />
          <circle cx={84} cy={40} r={2} fill="var(--color-accent-2-400)" />
          <rect x={66} y={10} width={28} height={6} rx={3} fill="var(--color-neutral-500)" />
          <g transform="rotate(14 128 56)">
            <rect
              x={120}
              y={26}
              width={16}
              height={60}
              rx={8}
              fill={N1}
              stroke="var(--color-neutral-500)"
              strokeWidth={2.5}
            />
            <rect x={122.5} y={58} width={11} height={26} rx={5.5} fill="var(--color-accent-400)" />
          </g>
          <g transform="rotate(-10 30 60)">
            <rect
              x={22}
              y={40}
              width={14}
              height={46}
              rx={7}
              fill={N1}
              stroke="var(--color-neutral-500)"
              strokeWidth={2.5}
            />
            <rect x={24.5} y={64} width={9} height={20} rx={4.5} fill="var(--color-accent-2-600)" />
          </g>
        </>
      );
    case "violin":
      return (
        <g transform="translate(0 6) rotate(-62 80 44) scale(.9) translate(9 5)">
          <path
            d="M80 20 C 60 20, 56 34, 64 42 C 58 46, 58 54, 64 58 C 56 66, 60 82, 80 82 C 100 82, 104 66, 96 58 C 102 54, 102 46, 96 42 C 104 34, 100 20, 80 20 Z"
            fill="var(--color-accent-600)"
          />
          <path
            d="M72 44 q -3 7 0 14 M88 44 q 3 7 0 14"
            stroke={INK}
            strokeWidth={2}
            fill="none"
            strokeLinecap="round"
          />
          <rect x={76} y={-22} width={8} height={48} rx={3} fill={INK} />
          <circle cx={80} cy={-26} r={6} fill={INK} />
          <rect x={70} y={64} width={20} height={4} rx={2} fill={INK} />
          {[-3, -1, 1, 3].map((dx) => (
            <line
              key={dx}
              x1={80 + dx}
              y1={-20}
              x2={80 + dx}
              y2={66}
              stroke="var(--color-neutral-300)"
              strokeWidth={0.8}
            />
          ))}
          <line
            x1={40}
            y1={34}
            x2={124}
            y2={66}
            stroke="var(--color-neutral-700)"
            strokeWidth={2.5}
            strokeLinecap="round"
          />
        </g>
      );
    case "binders":
      return (
        <>
          {(
            [
              [26, "var(--color-accent-2-600)"],
              [50, "var(--color-accent-600)"],
              [74, "var(--color-neutral-700)"],
            ] as const
          ).map(([x, c]) => (
            <g key={x}>
              <rect x={x} y={14} width={22} height={74} rx={4} fill={c} />
              <rect x={x + 4} y={24} width={14} height={20} rx={2} fill={N1} />
              <circle cx={x + 11} cy={72} r={4} fill={N1} opacity={0.6} />
            </g>
          ))}
          <g transform="rotate(8 124 52)">
            <rect
              x={102}
              y={18}
              width={46}
              height={62}
              rx={4}
              fill={N1}
              stroke="var(--color-neutral-400)"
              strokeWidth={1.5}
            />
            {[28, 36, 44].map((y) => (
              <rect key={y} x={110} y={y} width={30} height={3} rx={1.5} fill={N3} />
            ))}
            <circle
              cx={125}
              cy={64}
              r={10}
              fill="none"
              stroke="var(--color-accent-600)"
              strokeWidth={2.5}
            />
            <path
              d="M120 64 l4 4 l7 -8"
              stroke="var(--color-accent-600)"
              strokeWidth={2.5}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        </>
      );
    case "signpost":
      return (
        <>
          <rect x={76} y={8} width={8} height={82} rx={3} fill="var(--color-accent-700)" />
          {(
            [
              [84, 14, 60, "LUNAR", "var(--color-accent-2-300)", 1],
              [26, 38, 50, "BOOK", "var(--color-accent-300)", -1],
              [84, 62, 50, "WEB", "var(--color-accent-200)", 1],
            ] as const
          ).map(([x, y, w, t, c, dir]) => {
            const d =
              dir === 1
                ? `M${x} ${y}H${x + w}L${x + w + 10} ${y + 9}L${x + w} ${y + 18}H${x}Z`
                : `M${x + w} ${y}H${x}L${x - 10} ${y + 9}L${x} ${y + 18}H${x + w}Z`;
            return (
              <g key={t}>
                <path d={d} fill={c} />
                <text
                  x={x + w / 2}
                  y={y + 9.5}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill={INK}
                  style={{ fontFamily: HEADING, fontSize: 10 }}
                >
                  {t}
                </text>
              </g>
            );
          })}
          <ellipse cx={80} cy={91} rx={26} ry={3} fill={INK} opacity={0.12} />
        </>
      );
    case "inbox":
      return (
        <>
          {[0, 1, 2].map((j) => (
            <g
              key={j}
              transform={`translate(${36 + j * 8} ${36 - j * 10}) rotate(${(j - 1) * 5} 40 26)`}
            >
              <rect
                x={0}
                y={0}
                width={80}
                height={52}
                rx={6}
                fill={N1}
                stroke="var(--color-neutral-400)"
                strokeWidth={1.5}
              />
              <path
                d="M2 4 L40 30 L78 4"
                stroke="var(--color-neutral-400)"
                strokeWidth={1.5}
                fill="none"
                strokeLinejoin="round"
              />
            </g>
          ))}
          <circle cx={128} cy={20} r={12} fill="var(--color-accent-600)" />
          <text
            x={128}
            y={20.5}
            textAnchor="middle"
            dominantBaseline="central"
            fill={N1}
            style={{ fontFamily: HEADING, fontSize: 11 }}
          >
            12
          </text>
        </>
      );
    case "coach":
      return (
        <>
          <rect x={22} y={24} width={118} height={52} rx={12} fill="var(--color-accent)" />
          <rect x={22} y={60} width={118} height={6} fill="var(--color-accent-700)" />
          {[32, 54, 76, 98].map((x) => (
            <rect
              key={x}
              x={x}
              y={32}
              width={18}
              height={18}
              rx={4}
              fill="var(--color-accent-100)"
            />
          ))}
          <rect x={120} y={32} width={14} height={30} rx={3} fill="var(--color-accent-100)" />
          <circle
            cx={46}
            cy={78}
            r={10}
            fill={INK}
            stroke="var(--color-neutral-500)"
            strokeWidth={3}
          />
          <circle
            cx={116}
            cy={78}
            r={10}
            fill={INK}
            stroke="var(--color-neutral-500)"
            strokeWidth={3}
          />
          <rect x={136} y={52} width={6} height={6} rx={2} fill="var(--color-accent-300)" />
          <line
            x1={10}
            y1={91}
            x2={150}
            y2={91}
            stroke="var(--color-neutral-600)"
            strokeWidth={2}
            strokeDasharray="10 8"
          />
          <path
            d="M40 24 V10 L58 15 L40 20"
            fill="var(--color-accent-2-300)"
            stroke="var(--color-neutral-300)"
            strokeWidth={1.5}
            strokeLinejoin="round"
          />
        </>
      );
  }
}

export function SceneArt({ scene }: { scene: Scene }) {
  return (
    <svg viewBox="0 0 160 96" className="pf-scene-svg" aria-hidden="true">
      {sceneKids(scene)}
    </svg>
  );
}
