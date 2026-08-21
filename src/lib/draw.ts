export interface DrawVolume {
  ml: number;
  /** U-100 insulin syringe units (1 mL = 100 units) */
  units: number;
}

/** Volume to draw for a dose from a vial of the given concentration. */
export function drawVolume(doseMg: number, mgPerMl: number): DrawVolume | undefined {
  if (!(doseMg > 0) || !(mgPerMl > 0)) return undefined;
  const ml = doseMg / mgPerMl;
  return {
    ml: Math.round(ml * 100) / 100,
    units: Math.round(ml * 100),
  };
}

export function fmtDraw(draw: DrawVolume): string {
  return `${draw.ml.toFixed(2)} mL (${draw.units} units on a U-100 syringe)`;
}
