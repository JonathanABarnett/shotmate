/**
 * Capture app screenshots from a running dev server using the installed Chrome.
 * Run with: npm run dev (in another terminal), then: npm run shots [-- <outDir>]
 */
import { mkdir } from "node:fs/promises";
import path from "node:path";
import puppeteer from "puppeteer-core";

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const BASE = "http://localhost:5173";
const outDir = process.argv[2] ?? "screenshots";

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function clickByText(page, selector, text) {
  await page.evaluate(
    ({ selector, text }) => {
      const el = [...document.querySelectorAll(selector)].find((b) => b.textContent.includes(text));
      if (!el) throw new Error(`not found: ${selector} "${text}"`);
      el.click();
    },
    { selector, text }
  );
  await wait(600);
}

async function shoot(page, name) {
  await page.screenshot({ path: path.join(outDir, `${name}.png`) });
  console.log(`captured ${name}.png`);
}

await mkdir(outDir, { recursive: true });
const browser = await puppeteer.launch({ executablePath: CHROME, headless: "new" });

const page = await browser.newPage();
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });

// Onboarding (fresh profile has no stored data).
await page.goto(BASE, { waitUntil: "networkidle0" });
await wait(800);
await shoot(page, "onboarding");

// Demo-mode tour.
await page.goto(`${BASE}/?demo`, { waitUntil: "networkidle0" });
await wait(900);
await shoot(page, "home");

await clickByText(page, ".dock-btn", "Trends");
await shoot(page, "trends-weight");
for (const [tab, name] of [["Med level", "trends-level"], ["Doses", "trends-doses"], ["Feels", "trends-feels"]]) {
  await clickByText(page, ".seg-btn", tab);
  await shoot(page, name);
}

await clickByText(page, ".dock-btn", "History");
await shoot(page, "history");

await clickByText(page, ".dock-btn", "Help");
await clickByText(page, ".acc-head", "Giving your shot");
await shoot(page, "help");

await clickByText(page, ".dock-btn", "Home");
await page.evaluate(() => document.querySelector(".fab").click());
await wait(600);
await shoot(page, "log-menu");

await clickByText(page, ".logmenu-btn", "Shot");
await shoot(page, "log-shot");

await browser.close();
console.log(`done → ${outDir}/`);
