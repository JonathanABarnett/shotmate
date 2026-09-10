import { drawCover } from "./shareCard";

/** Progress-photo reel: every photo as a short video, each frame stamped with its date and numbers. */

export interface TimelapseFrame {
  image: Blob;
  caption: string;
  stats: string[];
  focus?: { x: number; y: number };
  zoom?: number;
}

const WIDTH = 1080;
const HEIGHT = 1440;
const PAD = 40;
const FONT = '"Plus Jakarta Sans", system-ui, -apple-system, "Segoe UI", sans-serif';
const HOLD_MS = 800;
const LINGER_MS = 1600;
/** repaint through each hold so the canvas stream keeps emitting frames */
const REPAINT_MS = 100;
const FPS = 30;
const MIME_TYPES = ["video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm", "video/mp4"];

const supportedMime = () => (typeof MediaRecorder === "undefined" ? undefined : MIME_TYPES.find((m) => MediaRecorder.isTypeSupported(m)));

export const timelapseSupported = (): boolean => typeof HTMLCanvasElement.prototype.captureStream === "function" && supportedMime() != null;

function drawFrame(ctx: CanvasRenderingContext2D, img: ImageBitmap, frame: TimelapseFrame, index: number, total: number) {
  ctx.fillStyle = "#14121f";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  drawCover(ctx, img, 0, 0, WIDTH, HEIGHT, frame.focus, frame.zoom);
  const fade = ctx.createLinearGradient(0, HEIGHT - 340, 0, HEIGHT);
  fade.addColorStop(0, "rgba(10, 8, 24, 0)");
  fade.addColorStop(1, "rgba(10, 8, 24, 0.85)");
  ctx.fillStyle = fade;
  ctx.fillRect(0, HEIGHT - 340, WIDTH, 340);

  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";
  ctx.fillStyle = "#ffffff";
  ctx.font = `800 46px ${FONT}`;
  ctx.fillText(frame.caption, PAD, HEIGHT - 100);
  ctx.fillStyle = "#e6e1fb";
  ctx.font = `600 32px ${FONT}`;
  ctx.fillText(frame.stats.join("   ·   "), PAD, HEIGHT - 46);
  ctx.textAlign = "right";
  ctx.fillStyle = "#a190f5";
  ctx.font = `700 28px ${FONT}`;
  ctx.fillText(`${index + 1} / ${total}   ShotMate 💜`, WIDTH - PAD, HEIGHT - 46);
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Record the reel — each frame held, the last one lingering. Returns the file and its extension. */
export async function renderTimelapse(frames: TimelapseFrame[]): Promise<{ blob: Blob; ext: string }> {
  const mime = supportedMime();
  if (!mime || frames.length === 0) throw new Error("This browser can't record video");
  await document.fonts?.ready;
  const images = await Promise.all(frames.map((f) => createImageBitmap(f.image)));
  const canvas = document.createElement("canvas");
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext("2d")!;
  const stream = canvas.captureStream(FPS);
  const recorder = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 8_000_000 });
  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };
  const stopped = new Promise<void>((resolve) => {
    recorder.onstop = () => resolve();
  });

  recorder.start();
  for (let i = 0; i < frames.length; i++) {
    const hold = i === frames.length - 1 ? LINGER_MS : HOLD_MS;
    for (let t = 0; t < hold; t += REPAINT_MS) {
      drawFrame(ctx, images[i], frames[i], i, frames.length);
      await sleep(REPAINT_MS);
    }
  }
  recorder.stop();
  await stopped;
  images.forEach((img) => img.close());
  stream.getTracks().forEach((t) => t.stop());
  return { blob: new Blob(chunks, { type: mime }), ext: mime.startsWith("video/mp4") ? "mp4" : "webm" };
}