import { Lock } from "lucide-react";
import type { AppData } from "../../types";
import {
  activityVsPace,
  adherenceStats,
  doseStepEffects,
  goalOutlook,
  hungerByTimeOfDay,
  hungerEnergyByCycleDay,
  movementHabit,
  paceShift,
  shotDayBump,
  siteRotationHealth,
  sleepInsight,
  tapeVsScale,
  trendVsToday,
} from "../../lib/insights";
import { OutlookCard, PaceCard, TapeCard, TrendCard, WaterWeightCard } from "./insights/weightInsights";
import { ActivityPaceCard, AdherenceCard, CreepCard, MovementCard, SleepCard, TimeOfDayCard } from "./insights/habitInsights";
import { DoseStepsCard, SitesCard } from "./insights/shotInsights";
import AchievementsCard from "./insights/AchievementsCard";
import { achievements } from "../../lib/achievements";

interface Locked {
  title: string;
  needs: string;
}

function LockedList({ items }: { items: Locked[] }) {
  if (items.length === 0) return null;
  return (
    <section className="card">
      <div className="card-title-row">
        <div>
          <h3 className="card-title">Unlocks as you log</h3>
          <div className="card-sub">Each insight waits for enough data to be honest</div>
        </div>
      </div>
      <div className="spacer-8" />
      <div className="locked-list">
        {items.map((i) => (
          <div className="locked-item" key={i.title}>
            <Lock size={15} className="lock" />
            <span>
              <strong>{i.title}</strong> — {i.needs}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

/** Cross-referenced patterns — each card appears only once its data threshold is met. */
export default function InsightsPanel({ data }: { data: AppData }) {
  const unit = data.settings.unit;
  const creep = hungerEnergyByCycleDay(data);
  const sleep = sleepInsight(data);
  const timeOfDay = hungerByTimeOfDay(data);
  const trend = trendVsToday(data);
  const movement = movementHabit(data);
  const pace = paceShift(data);
  const tape = tapeVsScale(data);
  const outlook = goalOutlook(data);
  const bump = shotDayBump(data);
  const steps = doseStepEffects(data);
  const activity = activityVsPace(data);
  const sites = siteRotationHealth(data);
  const adherence = adherenceStats(data);

  const locked: Locked[] = [
    ...(creep ? [] : [{ title: "Hunger & energy across your cycle", needs: "about 8 daily check-ins on Home" }]),
    ...(sleep ? [] : [{ title: "Sleep", needs: "5+ nights rated on Home" }]),
    ...(timeOfDay ? [] : [{ title: "Hunger through the day", needs: "a few days with morning and evening check-ins" }]),
    ...(pace ? [] : [{ title: "Pace & plateau check", needs: "3+ weeks of weigh-ins" }]),
    ...(trend ? [] : [{ title: "The trend vs. today", needs: "weigh-ins spread across two straight weeks" }]),
    ...(tape ? [] : [{ title: "Tape vs. scale", needs: "two tape check-ins 2+ weeks apart" }]),
    ...(outlook ? [] : [{ title: "Milestones & outlook", needs: "a starting weight and a weigh-in below it" }]),
    ...(bump ? [] : [{ title: "Shot-day water weight", needs: "a month or so of regular weigh-ins" }]),
    ...(steps ? [] : [{ title: "Dose step-ups", needs: "a dose increase and a few side-effect entries" }]),
    ...(activity ? [] : [{ title: "Moving vs. the scale", needs: "a few weeks with activity and 2+ weigh-ins each" }]),
    ...(movement ? [] : [{ title: "Movement habit", needs: "5 active days in the last two weeks" }]),
    ...(sites ? [] : [{ title: "Injection sites", needs: "3+ shots" }]),
    ...(adherence ? [] : [{ title: "Consistency", needs: "3+ shots" }]),
  ];

  return (
    <>
      <AchievementsCard items={achievements(data)} />
      {outlook && <OutlookCard outlook={outlook} unit={unit} goalLbs={data.settings.goalLbs} />}
      {trend && <TrendCard trend={trend} unit={unit} />}
      {pace && <PaceCard pace={pace} unit={unit} />}
      {creep && <CreepCard creep={creep} />}
      {sleep && <SleepCard sleep={sleep} />}
      {timeOfDay && <TimeOfDayCard timeOfDay={timeOfDay} />}
      {tape && <TapeCard tape={tape} unit={unit} />}
      {bump && <WaterWeightCard bump={bump} unit={unit} />}
      {steps && <DoseStepsCard steps={steps} />}
      {movement && <MovementCard habit={movement} unit={unit} />}
      {activity && <ActivityPaceCard pace={activity} unit={unit} />}
      {sites && <SitesCard health={sites} />}
      {adherence && <AdherenceCard adherence={adherence} />}
      <LockedList items={locked} />
    </>
  );
}
