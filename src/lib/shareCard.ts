/** Progress-photo share card: photo(s) with stats overlaid, rendered to a PNG. */

export interface SharePane {
  image: Blob;
  caption: string;
  stats: string[];
}

const WIDTH = 1080;
const IMAGE_HEIGHT = 880;
const FOOTER_HEIGHT = 170;
const PAD = 44;
const FONT = '"Plus Jakarta Sans", system-ui, -apple-system, "Segoe UI", sans-serif';

function drawCover(ctx: CanvasRenderingContext2D, img: ImageBitmap, x: number, y: number, w: number, h: number) {
  const scale = Math.max(w / img.width, h / img.height);
  const dw = img.width * scale;
  const dh = img.height * scale;
  ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
}

function drawPane(ctx: CanvasRenderingContext2D, pane: SharePane, img: ImageBitmap, x: number, w: number) {
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(x, PAD, w, IMAGE_HEIGHT, 28);
  ctx.clip();
  drawCover(ctx, img, x, PAD, w, IMAGE_HEIGHT);
  const fade = ctx.createLinearGradient(0, PAD + IMAGE_HEIGHT - 260, 0, PAD + IMAGE_HEIGHT);
  fade.addColorStop(0, "rgba(10, 8, 24, 0)");
  fade.addColorStop(1, "rgba(10, 8, 24, 0.82)");
  ctx.fillStyle = fade;
  ctx.fillRect(x, PAD + IMAGE_HEIGHT - 260, w, 260);
  ctx.restore();

  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "#ffffff";
  ctx.font = `800 34px ${FONT}`;
  ctx.fillText(pane.caption, x + 28, PAD + IMAGE_HEIGHT - 76);
  ctx.fillStyle = "#e6e1fb";
  ctx.font = `600 27px ${FONT}`;
  ctx.fillText(pane.stats.join("   ·   "), x + 28, PAD + IMAGE_HEIGHT - 32);
}

/** Render one or two photos with captions/stats and a summary footer. */
export async function renderShareCard(panes: SharePane[], summary: string): Promise<Blob> {
  await document.fonts?.ready;
  const images = await Promise.all(panes.map((p) => createImageBitmap(p.image)));
  const height = PAD + IMAGE_HEIGHT + FOOTER_HEIGHT;
  const canvas = document.createElement("canvas");
  canvas.width = WIDTH;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "#14121f";
  ctx.fillRect(0, 0, WIDTH, height);

  const gap = panes.length > 1 ? 20 : 0;
  const paneW = (WIDTH - PAD * 2 - gap * (panes.length - 1)) / panes.length;
  panes.forEach((pane, i) => drawPane(ctx, pane, images[i], PAD + i * (paneW + gap), paneW));
  images.forEach((img) => img.close());

  ctx.fillStyle = "#ffffff";
  ctx.font = `800 40px ${FONT}`;
  ctx.fillText(summary, PAD, height - 78);
  ctx.fillStyle = "#a190f5";
  ctx.font = `700 26px ${FONT}`;
  ctx.textAlign = "right";
  ctx.fillText("ShotMate 💜", WIDTH - PAD, height - 78);

  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("render failed"))), "image/png")
  );
}

/** Native share sheet when available (phones), otherwise a download. */
export async function shareOrDownload(blob: Blob, filename: string): Promise<"shared" | "downloaded"> {
  const file = new File([blob], filename, { type: blob.type });
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: "My ShotMate progress" });
      return "shared";
    } catch {
      // user dismissed the share sheet — fall through to a download
    }
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
  return "downloaded";
}
