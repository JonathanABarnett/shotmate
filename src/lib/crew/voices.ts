import type { MomentKind } from "../moments";
import type { CrewId } from "./cast";

/**
 * What each crew member says about a kind of moment. `{title}` and `{n}` (the first number in
 * the title) fill in from the moment. Specific and true beats cheerleading — no advice, no fluff.
 */
export const VOICES: Record<CrewId, Record<Exclude<MomentKind, "tape">, string[]>> = {
  dana: {
    milestone: [
      "{title} — I still remember mine. The mirror lags the scale by about a month; give it time.",
      "This is the one that made me believe it was real. Yours too, probably.",
      "Trend average, not one good morning — that's why it counts. Nicely done.",
    ],
    badge: [
      "Badges are the habit showing its work. Keep stacking them.",
      "I'd have loved a record like this in month one.",
      "Consistency is the whole game. This is what it looks like.",
    ],
    record: [
      "Longest yet, and it'll be beaten. That's the fun part.",
      "Legs are getting a vote now. Good.",
      "The med quiets the noise; you did the moving. Own that bit.",
    ],
    win: [
      "This is the stuff that lasts after the scale plateaus. Write more of these.",
      "Love a non-scale win. Those are the ones you remember.",
      "Noted, and rooting for the next one.",
    ],
  },
  marcus: {
    milestone: [
      "{title} 👀 okay I need to step it up over here.",
      "Same August start and you're pulling ahead. Respect. Also, ugh.",
      "My scale said the same thing last week and I nearly kissed it.",
    ],
    badge: [
      "Badge count check: you're winning. For now.",
      "Pretty sure this one unlocks a smug feeling. Enjoy it.",
      "Every badge you earn I get a little more motivated. Keep going, it's working.",
    ],
    record: [
      "Longest one yet?? I did a 25-minute walk and called it a day.",
      "Okay that's legit. Tomorrow I'm matching it. (Tomorrow-ish.)",
      "This is why I follow you. Fine. Shoes on.",
    ],
    win: [
      "That's a win-win. Sorry. Great one though.",
      "Frame it. Small stuff like this is the real progress.",
      "Love this. Adding it to my list of reasons to keep going.",
    ],
  },
  priya: {
    milestone: [
      "{title} while doing C25K — the runs get easier at every one of these.",
      "Less weight per stride. Your knees just sent a thank-you note.",
      "This is compounding now. Weight down, pace up.",
    ],
    badge: [
      "The streak badges are the ones I trust. Habits, not luck.",
      "Consistency badge — the only kind that matters. Nice.",
      "Show me a streak and I'll show you someone who finishes the program.",
    ],
    record: [
      "Longest one yet — that's how it goes, one week at a time. Week 5 is the wall, then it's yours.",
      "Big session. Easy day tomorrow; that's when it soaks in.",
      "That's a real distance now. A run badge is coming, I can feel it.",
    ],
    win: [
      "Non-scale wins carried me through my plateau. Keep logging them.",
      "Yes. This is the good stuff.",
      "Wins like this are why the scale doesn't get the last word.",
    ],
  },
  walt: {
    milestone: ["{title}. Good.", "Did that at about your pace. It holds if you keep the habits.", "Solid. Don't let a Saturday number fool you."],
    badge: ["Badge earned. Habit kept. Same thing.", "Good.", "Keep showing up. That's all it is."],
    record: ["Longest one. Rest tomorrow.", "Good legs. Keep them.", "I do 30 a day. You're past me. Fine by me."],
    win: ["That's a real one.", "Good. Write those down. You forget them otherwise.", "Nice."],
  },
  lena: {
    milestone: [
      "{title} on the 7-day trend — that's the honest number. Congrats, mathematically.",
      "The trend crossed it, not a single weigh-in. That's the one I believe.",
      "Steep slope right now. It'll flatten later and that's normal — the trend still counts.",
    ],
    badge: [
      "Logging streaks make the charts honest. Good data in, good insights out.",
      "Consistency badge — my favorite kind. The numbers only work if you feed them.",
      "This one means the trend line can be trusted. Big deal, quietly.",
    ],
    record: [
      "New PR logged. Your minutes-per-week line just bent upward.",
      "Longest yet — and your average is climbing with it.",
      "Nice outlier. Hoping it becomes the average.",
    ],
    win: [
      "Unquantifiable and still the best data point of the week.",
      "Noted. Some things the spreadsheet can't hold.",
      "Keep these. They're the ones you'll reread.",
    ],
  },
  theo: {
    milestone: [
      "{title}?? I'm at week 3 hoping for half that. Okay. Okay.",
      "How?? Tell me your secrets. Actually don't, I'll just keep going.",
      "This is the post I needed today. Thank you.",
    ],
    badge: [
      "Wait, how many badges do you have now. Never mind, back to my own scale.",
      "I just got my first one and felt ridiculous about how happy I was. So, congrats, seriously.",
      "Goals. Literal goals.",
    ],
    record: [
      "Longest one yet — I did 12 minutes and was proud. Genuinely inspired.",
      "Okay I'm going for a walk right now because of this.",
      "You make it look normal. It isn't. Nice.",
    ],
    win: [
      "Love this. The wins nobody else sees are the ones that count, right?",
      "Saving this for a bad day.",
      "This is so good. What a thing to log.",
    ],
  },
};
/** Tape milestones come from the measuring tape, not the scale — the crew talks about them differently. */
export const TAPE_VOICES: Record<CrewId, string[]> = {
  dana: [
    "The tape is the honest one — it can't hold water.",
    "Inches are what your clothes notice. This is the one that changes your closet.",
    "I kept every tape number in a notebook. This was the entry I reread most.",
  ],
  marcus: [
    "Belt-notch energy. Respect.",
    "The scale gets the headlines; the tape gets the pants. Congrats on the pants.",
    "Okay, the tape thing is real. Buying one tomorrow.",
  ],
  priya: [
    "Inches are what the mirror actually sees. The scale can't touch this.",
    "Less around the middle means easier breathing on hills. You'll feel it Friday.",
    "This is the number that changes how running feels.",
  ],
  walt: ["Tape doesn't lie. Good.", "Pants are next.", "Held it two weeks. That's real."],
  lena: [
    "In my data, inches lag pounds by about three weeks — this is the pounds catching up.",
    "Two consecutive readings, so it's signal, not tape tension. Nice.",
    "The tape has less noise than the scale. This one I'd frame.",
  ],
  theo: [
    "I don't even own a tape yet. Buying one because of this.",
    "Wait, the tape moved that much? Okay. Okay okay okay.",
    "This is the first post that made me want to measure.",
  ],
};