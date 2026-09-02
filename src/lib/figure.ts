import type { BodyType, MeasureKey, SiteId } from "../types";

/**
 * One parametric body outline (200×250 space, centered on x=100) drives the
 * snapshot figure, the injection-site zones, and the measurement callouts, so
 * every body type stays consistent across the app.
 */
export interface FigureShape {
  /** half-widths from the center line, in figure units */
  shoulder: number;
  chest: number;
  waist: number;
  hip: number;
  /** outer edge of the stance at the ankles */
  ankle: number;
}

export const BODY_TYPES: { key: BodyType; label: string }[] = [
  { key: "neutral", label: "Neutral" },
  { key: "slim", label: "Slim" },
  { key: "broad", label: "Broad" },
  { key: "curvy", label: "Curvy" },
];

const SHAPES: Record<BodyType, FigureShape> = {
  neutral: { shoulder: 40, chest: 34, waist: 28, hip: 36, ankle: 22 },
  slim: { shoulder: 36, chest: 30, waist: 24, hip: 31, ankle: 19 },
  broad: { shoulder: 46, chest: 39, waist: 33, hip: 37, ankle: 24 },
  curvy: { shoulder: 36, chest: 33, waist: 25, hip: 41, ankle: 21 },
};

export const figureShape = (type?: BodyType): FigureShape => SHAPES[type ?? "neutral"];

type Pt = readonly [number, number];
/** one cubic segment: control 1, control 2, end */
type Seg = readonly [Pt, Pt, Pt];

const round1 = (n: number) => Math.round(n * 10) / 10;
const pt = ([x, y]: Pt) => `${round1(x)} ${round1(y)}`;
const flip = ([x, y]: Pt): Pt => [200 - x, y];

/** Trace the left-side outline (center-line start → center-line end), then mirror back up the right. */
function mirrorClosed(start: Pt, segs: Seg[]): string {
  let d = `M ${pt(start)}`;
  for (const [a, b, e] of segs) d += ` C ${pt(a)} ${pt(b)} ${pt(e)}`;
  for (let i = segs.length - 1; i >= 0; i--) {
    const [a, b] = segs[i];
    const prev = i === 0 ? start : segs[i - 1][2];
    d += ` C ${pt(flip(b))} ${pt(flip(a))} ${pt(flip(prev))}`;
  }
  return `${d} Z`;
}

function closed(start: Pt, segs: Seg[]): string {
  let d = `M ${pt(start)}`;
  for (const [a, b, e] of segs) d += ` C ${pt(a)} ${pt(b)} ${pt(e)}`;
  return `${d} Z`;
}

/** Head, neck, torso, and legs as one seamless silhouette. */
function corePath({ shoulder: s, chest: c, waist: w, hip: h, ankle: a }: FigureShape): string {
  const kneeOut = 100 - (h + a) / 2 - 1;
  const ankleOut = 100 - a;
  const ankleIn = ankleOut + 12;
  const kneeIn = kneeOut + 22;
  return mirrorClosed(
    [100, 34],
    [
      [[96, 34.5], [94, 36], [93.5, 44]], // neck, tucked under the head
      [[93, 52], [100 - s + 14, 57], [100 - s + 5, 61]], // trapezius
      [[100 - s + 1, 62.5], [100 - s, 65], [100 - s, 70]], // shoulder point
      [[100 - s + 1, 78], [100 - c - 2, 84], [100 - c, 94]], // into the chest
      [[100 - c + 2, 106], [100 - w - 1, 114], [100 - w, 124]], // chest → waist
      [[100 - w + 0.5, 134], [100 - h + 1, 142], [100 - h, 155]], // waist → hip
      [[100 - h - 0.5, 174], [kneeOut - 3, 192], [kneeOut, 206]], // outer thigh → knee
      [[kneeOut + 3, 220], [ankleOut - 1, 228], [ankleOut, 236]], // calf → ankle
      [[ankleOut - 0.5, 240], [ankleOut - 3, 244], [ankleOut + 3, 244.8]], // foot, flared slightly out
      [[ankleIn - 2, 244.8], [ankleIn, 242], [ankleIn, 236]],
      [[ankleIn - 0.5, 226], [kneeIn - 1, 214], [kneeIn, 204]], // inner calf
      [[kneeIn + 1.5, 188], [97, 172], [100, 162]], // inner thigh → crotch
    ]
  );
}

/** One arm, hanging naturally with a slight gap from the torso. */
function armPath(shoulder: number, mirror: boolean): string {
  const S = 100 - shoulder;
  const raw: Seg[] = [
    [[S - 4, 61.5], [S - 7, 66], [S - 7.5, 73]], // deltoid cap
    [[S - 8.5, 86], [S - 9, 96], [S - 10, 106]], // upper arm → elbow
    [[S - 11.5, 120], [S - 12.5, 134], [S - 13.5, 146]], // forearm → wrist
    [[S - 14.5, 152], [S - 13.5, 158], [S - 9.5, 159]], // hand
    [[S - 5.5, 159.5], [S - 4, 156], [S - 4.5, 150]],
    [[S - 5, 138], [S - 4.5, 126], [S - 3, 114]], // inner forearm
    [[S - 1.5, 102], [S + 0.5, 92], [S + 2, 84]], // inner upper arm
    [[S + 3.5, 76], [S + 4, 68], [S + 3, 61]], // back to the cap
  ];
  const start: Pt = [S + 3, 61];
  return mirror ? closed(flip(start), raw.map(([a, b, e]): Seg => [flip(a), flip(b), flip(e)])) : closed(start, raw);
}

export interface FigurePaths {
  /** head + neck + torso + legs in one path */
  core: string;
  leftArm: string;
  rightArm: string;
}

export function figurePaths(shape: FigureShape): FigurePaths {
  return {
    core: corePath(shape),
    leftArm: armPath(shape.shoulder, false),
    rightArm: armPath(shape.shoulder, true),
  };
}

export interface SiteZone {
  id: SiteId;
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Tappable injection zones sized to the body (patient's left is the viewer's right). */
export function siteZones({ shoulder: s, waist: w, hip: h }: FigureShape): SiteZone[] {
  const abW = w - 5;
  const abX = 100 - w + 3;
  const thW = h - 8;
  const thX = 100 - h + 5;
  const armW = 14;
  const armX = 100 - s - 12;
  return [
    { id: "ab-r", x: abX, y: 108, w: abW, h: 28 },
    { id: "ab-l", x: 200 - abX - abW, y: 108, w: abW, h: 28 },
    { id: "th-r", x: thX, y: 162, w: thW, h: 38 },
    { id: "th-l", x: 200 - thX - thW, y: 162, w: thW, h: 38 },
    { id: "arm-r", x: armX, y: 74, w: armW, h: 32 },
    { id: "arm-l", x: 200 - armX - armW, y: 74, w: armW, h: 32 },
  ];
}

/** Where each measurement's callout dot sits on the body. */
export function calloutAnchors({ shoulder: s, chest: c, waist: w, hip: h }: FigureShape): Record<MeasureKey, { x: number; y: number }> {
  return {
    chest: { x: 100 - c + 10, y: 92 },
    waist: { x: 100 + w - 2, y: 122 },
    stomach: { x: 100 + w - 5, y: 136 },
    hips: { x: 100 - h + 10, y: 148 },
    thigh: { x: 100 - h + 16, y: 184 },
    arm: { x: 100 + s + 8, y: 86 },
  };
}
