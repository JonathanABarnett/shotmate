import type { AppData } from "../../types";
import { DAY, HOUR, startOfDay } from "../dates";
import { moments, type Moment, type MomentKind } from "../moments";
import { CREW, crewById, type CrewMember } from "./cast";
import { POSTS } from "./posts";
import { hashString, mulberry32, pickSome } from "./random";
import { VOICES } from "./voices";

export interface CrewReaction {
  member: CrewMember;
  emoji: string;
}

export interface CrewComment {
  key: string;
  ts: number;
  member: CrewMember;
  text: string;
  /** the moment this is about — absent for the crew's own posts */
  about?: string;
}

const REACT_COUNT: Record<MomentKind, [number, number]> = { milestone: [3, 5], badge: [1, 3], record: [1, 3], win: [2, 4] };
const COMMENT_CHANCE: Record<MomentKind, number> = { milestone: 1, badge: 0.55, record: 0.7, win: 0.9 };
const MAX_COMMENTS: Record<MomentKind, number> = { milestone: 2, badge: 1, record: 1, win: 2 };
/** comments trickle in over the hours after a moment, like people do */
const MIN_DELAY_H = 1;
const MAX_DELAY_H = 9;

const numberIn = (title: string) => title.match(/\d+(\.\d+)?/)?.[0] ?? "";
const fill = (line: string, m: Moment) => line.replace("{title}", m.title).replace("{n}", numberIn(m.title));

/** Who reacted to a moment, and with what — fixed per moment forever. */
export function crewReactions(m: Moment): CrewReaction[] {
  const rng = mulberry32(hashString("react:" + m.key));
  const [lo, hi] = REACT_COUNT[m.kind];
  const count = Math.min(CREW.length, lo + Math.floor(rng() * (hi - lo + 1)));
  return pickSome(rng, CREW, count).map((member) => ({ member, emoji: member.reacts[Math.floor(rng() * member.reacts.length)] }));
}

/** Comments on a moment, stamped a few hours after it — the same ones every time. */
export function crewComments(m: Moment): CrewComment[] {
  const rng = mulberry32(hashString("comment:" + m.key));
  if (rng() > COMMENT_CHANCE[m.kind]) return [];
  const count = 1 + Math.floor(rng() * MAX_COMMENTS[m.kind]);
  return pickSome(rng, CREW, count).map((member, i) => {
    const lines = VOICES[member.id][m.kind];
    const delay = (MIN_DELAY_H + rng() * (MAX_DELAY_H - MIN_DELAY_H) + i) * HOUR;
    return { key: `${m.key}:${member.id}`, ts: m.ts + delay, member, text: fill(lines[Math.floor(rng() * lines.length)], m), about: m.title };
  });
}

/** The crew's own scripted posts, unfolding week by week from the user's first log. */
export function crewPosts(data: AppData, now = Date.now()): CrewComment[] {
  const first = Math.min(...data.shots.map((s) => s.ts), ...data.weights.map((w) => w.ts));
  if (!Number.isFinite(first)) return [];
  const day0 = startOfDay(first);
  return POSTS.map((p) => ({
    key: `post:${p.week}-${p.day}-${p.member}`,
    ts: day0 + (p.week * 7 + p.day) * DAY + p.hour * HOUR,
    member: crewById(p.member),
    text: p.text,
  })).filter((p) => p.ts <= now);
}

/** Everything the crew has said so far, newest first. */
export function crewFeed(data: AppData, now = Date.now()): CrewComment[] {
  const comments = moments(data, now).flatMap(crewComments).filter((c) => c.ts <= now);
  return [...comments, ...crewPosts(data, now)].sort((a, b) => b.ts - a.ts);
}