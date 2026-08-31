import type { AppData } from "../../types";
import { DAY, startOfDay } from "../dates";
import { weeklyRate } from "../weight";
import { mean } from "./shared";

export interface FuelCheck {
  avgKcal: number;
  days: number;
  weeklyRateLbs: number;
  impliedBurnKcal: number;
  lowDays7: number;
  summary: string;
  careNote?: string;
}

const MIN_DAYS = 10;
const WINDOW_DAYS = 21;
const KCAL_PER_LB = 3500;
const LOW_KCAL = 1200;
const LOW_DAYS_WORTH_NOTING = 3;

/** Logged calories against the weight trend — what the numbers say you're actually burning. */
export function fuelVsPace(data: AppData, now = Date.now()): FuelCheck | undefined {
  const windowStart = startOfDay(now) - WINDOW_DAYS * DAY;
  const logged = data.intake.filter((i) => i.day >= windowStart && (i.kcal ?? 0) > 0);
  if (logged.length < MIN_DAYS) return undefined;
  const rate = weeklyRate(data.weights, WINDOW_DAYS);
  if (rate == null) return undefined;

  const avgKcal = Math.round(mean(logged.map((i) => i.kcal!))!);
  const impliedBurnKcal = Math.round(avgKcal - (rate * KCAL_PER_LB) / 7);
  const lowDays7 = data.intake.filter((i) => i.day >= startOfDay(now) - 7 * DAY && (i.kcal ?? 0) > 0 && i.kcal! < LOW_KCAL).length;

  const summary =
    rate <= -0.2
      ? `Around ${avgKcal} kcal a day while the scale trends down — your body is burning roughly ${impliedBurnKcal}. That gap is the engine; no need to starve it.`
      : `Around ${avgKcal} kcal a day with a flat-ish trend — your true burn sits near ${avgKcal}. A small trim or a few more walks tips the balance.`;
  const careNote =
    lowDays7 >= LOW_DAYS_WORTH_NOTING
      ? `${lowDays7} of the last 7 logged days landed under ${LOW_KCAL} kcal — strong appetite suppression. Protein first, and mention it to your provider if it keeps up.`
      : undefined;

  return { avgKcal, days: logged.length, weeklyRateLbs: rate, impliedBurnKcal, lowDays7, summary, careNote };
}
