import type { AppData } from "../../types";
import { fmtDay } from "../../lib/dates";
import { cycleReview } from "../../lib/insights";
import { signedWeight } from "../trends/insights/format";

interface RowProps {
  label: string;
  value: string;
  delta?: string;
  deltaClass?: string;
}

function ReviewRow({ label, value, delta, deltaClass }: RowProps) {
  return (
    <div className="review-row">
      <span className="review-label">{label}</span>
      <span className="review-value">{value}</span>
      <span className={`review-delta ${deltaClass ?? ""}`}>{delta ?? ""}</span>
    </div>
  );
}

const vsPrev = (prev: number | undefined, unit = "") => (prev == null ? undefined : `last: ${prev}${unit}`);

/** The "how's it going?" digest: this shot cycle next to the previous one. */
export default function CycleReviewCard({ data }: { data: AppData }) {
  const review = cycleReview(data);
  if (!review) return null;
  const unit = data.settings.unit;
  const { weightChangeLbs: w, prevWeightChangeLbs: pw } = review;

  return (
    <section className="card">
      <div className="card-title-row">
        <div>
          <h3 className="card-title">This cycle · day {review.daysIn + 1}</h3>
          <div className="card-sub">Since your shot on {fmtDay(review.cycleStart)}</div>
        </div>
      </div>
      <div className="spacer-8" />
      <ReviewRow
        label="Weight"
        value={w != null ? signedWeight(w, unit) : "—"}
        delta={pw != null ? `last: ${signedWeight(pw, unit)}` : undefined}
        deltaClass={w != null && pw != null ? (w < pw ? "delta-down" : w > pw ? "delta-up" : "") : ""}
      />
      <ReviewRow
        label="Active minutes"
        value={`${review.activeMinutes} min`}
        delta={vsPrev(review.prevActiveMinutes, " min")}
        deltaClass={review.prevActiveMinutes != null && review.activeMinutes > review.prevActiveMinutes ? "delta-down" : ""}
      />
      <ReviewRow
        label="Protein goal"
        value={review.proteinDaysTracked > 0 ? `${review.proteinDaysHit}/${review.proteinDaysTracked} days` : "—"}
      />
      <ReviewRow
        label="Side effects"
        value={`${review.effectCount}`}
        delta={vsPrev(review.prevEffectCount)}
        deltaClass={review.prevEffectCount != null && review.effectCount < review.prevEffectCount ? "delta-down" : ""}
      />
      <ReviewRow label="Wins" value={`${review.winCount} 🎉`} />
    </section>
  );
}
