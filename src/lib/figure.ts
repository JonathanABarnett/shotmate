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
  ankle: number;
}

export const BODY_TYPES: { key: BodyType; label: string }[] = [
  { key: "neutral", label: "Neutral" },
  { key: "slim", label: "Slim" },
  { key: "broad", label: "Broad" },
  { key: "curvy", label: "Curvy" },
];

const SHAPES: Record<BodyType, FigureShape> = {
  neutral: { shoulder: 40, chest: 34, waist: 30, hip: 36, ankle: 32 },
  slim: { shoulder: 36, chest: 30, waist: 25, hip: 31, ankle: 28 },
  broad: { shoulder: 46, chest: 38, waist: 32, hip: 35, ankle: 32 },
  curvy: { shoulder: 36, chest: 33, waist: 26, hip: 40, ankle: 30 },
};

export const figureShape = (type?: BodyType): FigureShape => SHAPES[type ?? "neutral"];

export interface FigurePaths {
  torso: string;
  leftArm: string;
  rightArm: string;
  leftLeg: string;
  rightLeg: string;
}

const mirrorX = (mirror: boolean) => (x: number) => (mirror ? 200 - x : x);

function armPath(shoulder: number, mirror: boolean): string {
  const x = mirrorX(mirror);
  const o = 100 - shoulder;
  return `M ${x(o)} 70 C ${x(o - 12)} 74 ${x(o - 20)} 90 ${x(o - 22)} 110 C ${x(o - 24)} 126 ${x(o - 24)} 140 ${x(o - 22)} 150 C ${x(o - 20)} 157 ${x(o - 8)} 157 ${x(o - 6)} 150 C ${x(o - 4)} 136 ${x(o - 4)} 120 ${x(o - 4)} 106 C ${x(o - 4)} 92 ${x(o)} 80 ${x(o + 6)} 70 Z`;
}

function legPath(hip: number, ankle: number, mirror: boolean): string {
  const x = mirrorX(mirror);
  const h = 100 - hip;
  const a = 100 - ankle;
  return `M ${x(h)} 150 C ${x(h - 2)} 176 ${x(a - 2)} 200 ${x(a)} 222 C ${x(a)} 238 ${x(a + 4)} 246 ${x(a + 14)} 246 C ${x(a + 24)} 246 ${x(a + 28)} 240 ${x(a + 28)} 230 C ${x(a + 28)} 210 ${x(99)} 180 ${x(99)} 152 Z`;
}

function torsoPath({ shoulder: s, chest: c, waist: w, hip: h }: FigureShape): string {
  return `M 92 56 C 78 57 ${106 - s} 60 ${100 - s} 70 C ${98 - s} 78 ${100 - s} 92 ${100 - c} 104 C ${104 - c} 112 ${100 - w} 118 ${100 - w} 124 C ${100 - w} 134 ${100 - h} 142 ${100 - h} 152 L ${100 + h} 152 C ${100 + h} 142 ${100 + w} 134 ${100 + w} 124 C ${100 + w} 118 ${96 + c} 112 ${100 + c} 104 C ${100 + s} 92 ${102 + s} 78 ${100 + s} 70 C ${94 + s} 60 122 57 108 56 Z`;
}

export function figurePaths(shape: FigureShape): FigurePaths {
  return {
    torso: torsoPath(shape),
    leftArm: armPath(shape.shoulder, false),
    rightArm: armPath(shape.shoulder, true),
    leftLeg: legPath(shape.hip, shape.ankle, false),
    rightLeg: legPath(shape.hip, shape.ankle, true),
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
  const abW = w - 6;
  const abX = 100 - w + 2;
  const thW = h - 9;
  const thX = 100 - h + 6;
  const armW = 19;
  const armX = 100 - s - 21;
  return [
    { id: "ab-r", x: abX, y: 106, w: abW, h: 27 },
    { id: "ab-l", x: 200 - abX - abW, y: 106, w: abW, h: 27 },
    { id: "th-r", x: thX, y: 160, w: thW, h: 38 },
    { id: "th-l", x: 200 - thX - thW, y: 160, w: thW, h: 38 },
    { id: "arm-r", x: armX, y: 76, w: armW, h: 30 },
    { id: "arm-l", x: 200 - armX - armW, y: 76, w: armW, h: 30 },
  ];
}

/** Where each measurement's callout dot sits on the body. */
export function calloutAnchors({ shoulder: s, chest: c, waist: w, hip: h }: FigureShape): Record<MeasureKey, { x: number; y: number }> {
  return {
    chest: { x: 100 - c + 14, y: 86 },
    waist: { x: 100 + w - 2, y: 112 },
    stomach: { x: 100 + w - 6, y: 134 },
    hips: { x: 100 - h + 12, y: 140 },
    thigh: { x: 100 - h + 19, y: 186 },
    arm: { x: 100 + s + 12, y: 80 },
  };
}
