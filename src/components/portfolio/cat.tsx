/* The black-cat mascot, ported from the design reference.
 * The roaming cat drives her through `refs` every frame. The Camino cat (Camino.tsx)
 * animates the same parts with CSS instead, via the class names below, and wears a
 * pack drawn in the same 84 × 58 space (`children`). */
import type { ReactNode, Ref } from "react";

export type CatRefs = {
  legs: (SVGRectElement | null)[];
  bodyG: SVGGElement | null;
  tail: SVGPathElement | null;
  eyes: SVGGElement | null;
  mouth: SVGPathElement | null;
};

const noRefs = (): CatRefs => ({ legs: [], bodyG: null, tail: null, eyes: null, mouth: null });

export function CatSvg({
  refs = noRefs(),
  flipRef,
  width = 84,
  children,
}: {
  refs?: CatRefs;
  flipRef?: Ref<HTMLDivElement>;
  /** drawn at 84 × 58 */
  width?: number;
  /** anything she's wearing, drawn on top of her in the same viewBox */
  children?: ReactNode;
}) {
  const ink = "var(--color-neutral-900)";
  const leg = (x: number, i: number) => (
    <rect
      key={i}
      ref={(el) => {
        refs.legs[i] = el;
      }}
      x={x}
      y={36}
      width={6}
      height={15}
      rx={3}
      fill={ink}
      className="pf-cat-leg"
      style={{ transformBox: "fill-box", transformOrigin: "50% 0%" }}
    />
  );
  return (
    <div ref={flipRef}>
      <svg
        viewBox="0 0 84 58"
        width={width}
        height={(width * 58) / 84}
        className="pf-cat-svg"
        aria-hidden="true"
      >
        <ellipse cx={42} cy={55} rx={30} ry={3} fill={ink} opacity={0.12} />
        {leg(20, 0)}
        {leg(28, 1)}
        {leg(50, 2)}
        {leg(58, 3)}
        <g
          ref={(el) => {
            refs.bodyG = el;
          }}
          className="pf-cat-body"
          style={{ transformBox: "fill-box", transformOrigin: "50% 100%" }}
        >
          <path
            ref={(el) => {
              refs.tail = el;
            }}
            d="M16 30 C 5 27, 2 14, 9 5"
            stroke={ink}
            strokeWidth={5}
            strokeLinecap="round"
            fill="none"
            className="pf-cat-tail"
            style={{ transformBox: "fill-box", transformOrigin: "100% 100%" }}
          />
          <ellipse cx={38} cy={32} rx={24} ry={12} fill={ink} />
          <path d="M54 15 L55 1 L63 10 Z" fill={ink} />
          <path d="M65 10 L73 1 L75 15 Z" fill={ink} />
          <circle cx={64} cy={21} r={13} fill={ink} />
          <path d="M56.5 12 L57 5 L61 9.5 Z" fill="var(--color-accent-300)" />
          <g
            ref={(el) => {
              refs.eyes = el;
            }}
            className="pf-cat-eyes"
            style={{ transformBox: "fill-box", transformOrigin: "50% 50%" }}
          >
            <ellipse cx={62} cy={20} rx={2.2} ry={2.8} fill="var(--color-accent-2-300)" />
            <ellipse cx={70} cy={20} rx={2.2} ry={2.8} fill="var(--color-accent-2-300)" />
          </g>
          <circle cx={66.5} cy={25} r={1.3} fill="var(--color-accent-400)" />
          <path
            ref={(el) => {
              refs.mouth = el;
            }}
            d="M63 28 L66 31.5 L69 28 Z"
            fill="var(--color-accent-300)"
            className="pf-cat-mouth"
            style={{ opacity: 0 }}
          />

          <path
            d="M52 28 Q 57 34 62 32"
            stroke="var(--color-accent)"
            strokeWidth={3}
            fill="none"
            strokeLinecap="round"
          />
          <circle cx={57} cy={34} r={2.6} fill="var(--color-accent-300)" />
        </g>
        {children}
      </svg>
    </div>
  );
}
