/**
 * Rasterize public/icon.svg into the PNG sizes the PWA manifest and iOS need.
 * Run with: npm run icons
 */
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import sharp from "sharp";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const svg = await readFile(path.join(root, "public", "icon.svg"));

const targets = [
  { size: 180, name: "apple-touch-icon.png" },
  { size: 192, name: "icon-192.png" },
  { size: 512, name: "icon-512.png" },
];

for (const { size, name } of targets) {
  const out = path.join(root, "public", name);
  await sharp(svg, { density: (72 * size) / 128 }).resize(size, size).png().toFile(out);
  console.log(`wrote ${name} (${size}x${size})`);
}
