import type { ReactNode } from "react";

export interface HelpSection {
  emoji: string;
  title: string;
  body: ReactNode;
}

export const HELP_SECTIONS: HelpSection[] = [
  {
    emoji: "💉",
    title: "Giving your shot",
    body: (
      <>
        <p>The calm, unhurried version:</p>
        <ul>
          <li><strong>Wash your hands</strong> and gather the pen, an alcohol swab, and your sharps container.</li>
          <li>If the pen lives in the fridge, letting it sit out ~15–30 minutes can make the shot more comfortable.</li>
          <li><strong>Check the pen</strong> — right medication, right dose, liquid clear, not expired.</li>
          <li>Pick your site (ShotMate suggests one 😉), clean it with the swab, and let it dry.</li>
          <li>Inject exactly as your pen's instructions describe, and hold for the count the instructions give.</li>
          <li>Pen tips and needles go in the <strong>sharps container</strong> — never the trash.</li>
        </ul>
        <p>Your pen's own instructions win over anything here — each brand works a little differently.</p>
      </>
    ),
  },
  {
    emoji: "🔄",
    title: "Why rotate injection sites",
    body: (
      <>
        <p>
          Using the same spot over and over can irritate the skin and form small firm lumps that make absorption less
          predictable. Rotating keeps skin happy.
        </p>
        <ul>
          <li>Abdomen, thighs, and the back of the upper arms are the usual spots.</li>
          <li>On the abdomen, stay about <strong>2 inches away from your belly button</strong>.</li>
          <li>ShotMate suggests the spot you've used least recently — the little <strong>✦ next up</strong> tag.</li>
        </ul>
      </>
    ),
  },
  {
    emoji: "🤢",
    title: "Easing common side effects",
    body: (
      <>
        <p>Most side effects are strongest in the first weeks and after dose increases, then usually settle.</p>
        <ul>
          <li><strong>Nausea</strong> — smaller meals, eat slowly, bland or cold foods, ginger or peppermint tea, and stop at "satisfied" rather than "full".</li>
          <li><strong>Constipation</strong> — water all day, fiber, gentle movement like walking.</li>
          <li><strong>Fatigue</strong> — common early on; be kind to your schedule and protect sleep.</li>
          <li><strong>Heartburn</strong> — smaller dinners, avoid lying down right after eating.</li>
        </ul>
        <p>Logging "How I feel" entries helps you and your provider spot patterns around shot days.</p>
      </>
    ),
  },
  {
    emoji: "🚑",
    title: "When to call your provider",
    body: (
      <>
        <p>Don't wait on these — reach out to your provider or urgent care:</p>
        <ul>
          <li>Severe or persistent stomach/abdominal pain, especially radiating to your back.</li>
          <li>Vomiting that won't stop, or signs of dehydration.</li>
          <li>Allergic reaction signs — swelling of face or throat, trouble breathing, severe rash.</li>
          <li>Pain in the upper right belly, fever, or yellowing skin/eyes.</li>
          <li>If you take insulin or a sulfonylurea: shakiness, sweating, confusion (low blood sugar).</li>
        </ul>
      </>
    ),
  },
  {
    emoji: "🧊",
    title: "Storing your pens",
    body: (
      <ul>
        <li>Unused pens live in the <strong>fridge (36–46°F / 2–8°C)</strong> — never the freezer.</li>
        <li>Once in use, many pens can stay at room temperature for a limited window — check your medication's label for its rule.</li>
        <li>Keep pens in their box, away from light and heat.</li>
        <li>Traveling? An insulated pouch with a cool pack works great — just don't let ice touch the pen.</li>
      </ul>
    ),
  },
  {
    emoji: "⏰",
    title: "Missed a shot?",
    body: (
      <>
        <p>
          It happens! Weekly GLP-1 medications usually have a catch-up window (often a few days) after which the label
          says to skip and resume your schedule — but the window differs by medication and dose.
        </p>
        <ul>
          <li>Check your medication's guide, or ask your pharmacist — it's a 2-minute call.</li>
          <li>Log the shot on the day you <em>actually</em> took it so your charts stay honest.</li>
        </ul>
      </>
    ),
  },
  {
    emoji: "💜",
    title: "About ShotMate",
    body: (
      <>
        <p>
          ShotMate keeps everything <strong>on your device</strong> — no account, no cloud, no subscription. Use
          Settings → Data to back up or move your data.
        </p>
        <p>
          It's a tracking companion, not a medical device: nothing here is medical advice, and the medication-level
          chart is a simple estimate for curiosity, not dosing decisions.
        </p>
      </>
    ),
  },
];
