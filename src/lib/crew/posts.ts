import type { CrewId } from "./cast";

/** A scripted post on the crew's own journeys — placed by week and weekday since the user's first log. */
export interface CrewPost {
  week: number;
  day: number;
  hour: number;
  member: CrewId;
  text: string;
}

export const POSTS: CrewPost[] = [
  { week: 0, day: 2, hour: 19, member: "dana", text: "New folks this month: the scale will lie to you on weekends. The trend line won't. Weigh every morning and believe the average." },
  { week: 0, day: 4, hour: 12, member: "theo", text: "First shot done. Hands shook a little. Nobody tells you the needle is the easy part." },
  { week: 1, day: 1, hour: 20, member: "marcus", text: "Week 2 report: appetite is weird. Made dinner, ate half, stared at the rest like it owed me money." },
  { week: 1, day: 3, hour: 7, member: "walt", text: "Shot 49 this morning. Still count them." },
  { week: 1, day: 5, hour: 18, member: "priya", text: "C25K week 1 again, third attempt. This time I'm not skipping the rest days. That was the bug." },
  { week: 2, day: 0, hour: 9, member: "lena", text: "Reminder from a spreadsheet person: a stall is four weeks flat, not four days. Nothing under that is data." },
  { week: 2, day: 3, hour: 21, member: "theo", text: "Day 3 after the shot and I finally get what people mean by the food noise going quiet. It's just… quiet." },
  { week: 2, day: 6, hour: 17, member: "dana", text: "Fourteen months. Maintenance is its own skill — turns out the habits were the point, not the number." },
  { week: 3, day: 1, hour: 19, member: "marcus", text: "Ate out for the first time since starting. Ordered like a normal person, left half. Nobody noticed. Felt like a superpower." },
  { week: 3, day: 4, hour: 8, member: "walt", text: "Shot 50. Half of a hundred. My daughter made a cake I didn't finish. Progress." },
  { week: 4, day: 2, hour: 18, member: "priya", text: "First 20-minute run of the program. Slow enough that a dog walker passed me. Didn't stop, though." },
  { week: 4, day: 5, hour: 20, member: "lena", text: "Month one chart is in. Loss curves always look linear at first. The interesting part is month three." },
  { week: 5, day: 0, hour: 10, member: "theo", text: "Missed a weigh-in yesterday and felt weirdly guilty. Then I remembered nobody is grading this. Back on the scale today." },
  { week: 5, day: 3, hour: 19, member: "dana", text: "PSA for the compounders: check your vial's beyond-use date. Mine was hiding under the label. Had to toss half a vial once." },
  { week: 6, day: 1, hour: 21, member: "marcus", text: "Belt went in a notch. Not a new belt. Same belt, new hole. Small thing, big day." },
  { week: 6, day: 4, hour: 7, member: "walt", text: "Doc visit. Blood pressure down enough to talk about the pills. First time in ten years." },
  { week: 7, day: 2, hour: 18, member: "priya", text: "Ran the whole 5K today. Walked the last hill last week. Not this week." },
  { week: 8, day: 0, hour: 9, member: "lena", text: "Two-month check: the water spikes still come, they just come from a lower floor. That's what winning looks like on a chart." },
  { week: 8, day: 5, hour: 20, member: "theo", text: "Ten pounds. Said it out loud to my sister and she said 'I can tell.' Going to think about that for a week." },
  { week: 9, day: 3, hour: 19, member: "dana", text: "If the loss slows this month, that's the plan working, not failing. The body catches up. Keep the rituals." },
  { week: 10, day: 1, hour: 18, member: "marcus", text: "Plateau week. Scale didn't move. Tape did. Apparently my waist reads the trend line and my scale doesn't." },
  { week: 11, day: 4, hour: 8, member: "walt", text: "Shot 58. Same time, same chair, same left side. Boring is good." },
  { week: 12, day: 2, hour: 17, member: "priya", text: "Three months. Slowest 5K in the club and the happiest. Sign up for one, whenever. Nobody looks at your time." },
  { week: 12, day: 6, hour: 20, member: "lena", text: "Quarter one is done. Whatever the number is, the streak of mornings is the stat I'd frame." },
  { week: 14, day: 1, hour: 19, member: "theo", text: "Titrated up this week. Nausea day two, gone by day four. Writing it down so future me stops panicking." },
  { week: 16, day: 3, hour: 18, member: "dana", text: "Four months is where people quit the rituals because it 'works now.' It works because of the rituals. Ask me how I know." },
  { week: 18, day: 5, hour: 9, member: "walt", text: "Bought pants two sizes down. Kept the receipt out of habit. Didn't need it." },
  { week: 20, day: 2, hour: 20, member: "marcus", text: "Five months. Ran into someone from spring. The double-take was worth every shot." },
  { week: 22, day: 4, hour: 18, member: "priya", text: "10K. Slow. Finished. Started as someone who couldn't run to the mailbox. Same for you, I'd bet." },
  { week: 24, day: 6, hour: 19, member: "lena", text: "Six months of mornings. The chart is boring now, which is the best thing a chart can be." },
];