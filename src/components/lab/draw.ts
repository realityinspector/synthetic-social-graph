import { adprsAt, type Params, type World } from "@/lib/ssg/engine";

export const FIELD_W = 1000;
export const FIELD_H = 700;

type Palette = {
  bg: string;
  surface: string;
  fg: string;
  muted: string;
  faint: string;
  line: string;
  accent: string;
  ink: string;
};

let cached: Palette | null = null;

function palette(): Palette {
  if (cached) return cached;
  const s = getComputedStyle(document.documentElement);
  const v = (name: string, fallback: string) => s.getPropertyValue(name).trim() || fallback;
  cached = {
    bg: v("--color-bg", "#12110e"),
    surface: v("--color-surface", "#1c1a16"),
    fg: v("--color-fg", "#f3efe6"),
    muted: v("--color-muted", "#9a9284"),
    faint: v("--color-faint", "#6b655c"),
    line: v("--color-line", "#3a342c"),
    accent: v("--color-accent", "#e8a04a"),
    ink: v("--color-ink", "#0c0b09"),
  };
  return cached;
}

function mapPoint(x: number, y: number, w: number, h: number, pad: number) {
  return {
    x: pad + (x / FIELD_W) * (w - pad * 2),
    y: pad + (y / FIELD_H) * (h - pad * 2),
  };
}

export function screenToField(sx: number, sy: number, w: number, h: number) {
  const pad = Math.max(16, Math.min(w, h) * 0.045);
  const x = ((sx - pad) / Math.max(1, w - pad * 2)) * FIELD_W;
  const y = ((sy - pad) / Math.max(1, h - pad * 2)) * FIELD_H;
  return { x, y };
}

export function pickAgent(world: World, sx: number, sy: number, w: number, h: number) {
  const pad = Math.max(16, Math.min(w, h) * 0.045);
  let best = -1;
  let bestD = 26;
  for (const agent of world.agents) {
    const p = mapPoint(agent.x, agent.y, w, h, pad);
    const d = Math.hypot(p.x - sx, p.y - sy);
    if (d < bestD) {
      bestD = d;
      best = agent.id;
    }
  }
  return best;
}

export function drawField(
  canvas: HTMLCanvasElement,
  world: World,
  selected: number | null,
  hovered: number | null,
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const pal = palette();
  const cssW = canvas.clientWidth || canvas.width;
  const cssH = canvas.clientHeight || canvas.height;
  const scale = canvas.width / Math.max(1, cssW);
  const w = canvas.width;
  const h = canvas.height;
  const padPx = Math.max(16, Math.min(cssW, cssH) * 0.045) * scale;

  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = pal.bg;
  ctx.fillRect(0, 0, w, h);

  ctx.save();
  ctx.strokeStyle = pal.line;
  ctx.globalAlpha = 0.45;
  ctx.lineWidth = 1;
  const gap = 36 * scale;
  for (let x = padPx; x < w - padPx; x += gap) {
    ctx.beginPath();
    ctx.moveTo(x, padPx);
    ctx.lineTo(x, h - padPx);
    ctx.stroke();
  }
  for (let y = padPx; y < h - padPx; y += gap) {
    ctx.beginPath();
    ctx.moveTo(padPx, y);
    ctx.lineTo(w - padPx, y);
    ctx.stroke();
  }
  ctx.restore();

  const n = world.agents.length;
  const negatives = new Map<number, { j: number; s: number }>();
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const s = world.strength(i, j);
      if (s > -0.5) continue;
      const best = negatives.get(i);
      if (!best || s < best.s) negatives.set(i, { j, s });
    }
  }
  const tension = new Set<string>();
  for (const [i, link] of negatives) {
    const j = link.j;
    tension.add(i < j ? `${i}-${j}` : `${j}-${i}`);
  }

  ctx.save();
  ctx.lineCap = "round";
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const s = world.strength(i, j);
      const tense = tension.has(`${i}-${j}`);
      if (s < 0.48 && !tense) continue;
      const A = mapPoint(world.agents[i].x, world.agents[i].y, w, h, padPx);
      const B = mapPoint(world.agents[j].x, world.agents[j].y, w, h, padPx);
      ctx.beginPath();
      ctx.moveTo(A.x, A.y);
      ctx.lineTo(B.x, B.y);
      if (s >= 0.48) {
        ctx.globalAlpha = Math.min(0.8, 0.2 + s * 0.65);
        ctx.strokeStyle = pal.accent;
        ctx.setLineDash([]);
        ctx.lineWidth = (0.7 + s * 1.3) * scale;
      } else {
        ctx.globalAlpha = 0.4;
        ctx.strokeStyle = pal.muted;
        ctx.setLineDash([4 * scale, 6 * scale]);
        ctx.lineWidth = 1 * scale;
      }
      ctx.stroke();
    }
  }
  ctx.restore();

  for (const ripple of world.ripples) {
    const p = mapPoint(ripple.x, ripple.y, w, h, padPx);
    ctx.beginPath();
    ctx.arc(p.x, p.y, (10 + ripple.age * 46) * scale, 0, Math.PI * 2);
    ctx.strokeStyle = pal.accent;
    ctx.globalAlpha = (1 - ripple.age) * 0.45;
    ctx.lineWidth = 1.25 * scale;
    ctx.setLineDash([]);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  const fontPx = Math.max(10, 11 * scale);
  ctx.font = `500 ${fontPx}px "IBM Plex Mono", ui-monospace, monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  const labeled: { x: number; y: number }[] = [];

  for (const agent of world.agents) {
    const p = mapPoint(agent.x, agent.y, w, h, padPx);
    const radius = (9 + agent.pulse * 4) * scale;
    if (agent.pulse > 0.35) {
      const glow = ctx.createRadialGradient(p.x, p.y, radius * 0.2, p.x, p.y, radius * 3.2);
      glow.addColorStop(0, `rgba(232, 160, 74, ${0.22 * agent.pulse})`);
      glow.addColorStop(1, "rgba(232, 160, 74, 0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(p.x, p.y, radius * 3.2, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.beginPath();
    ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
    ctx.fillStyle = pal.surface;
    ctx.fill();
    ctx.lineWidth = (agent.id === selected ? 2.4 : 1.25) * scale;
    ctx.strokeStyle = agent.id === selected || agent.id === hovered ? pal.fg : pal.accent;
    ctx.globalAlpha = 0.5 + agent.pulse * 0.4;
    ctx.stroke();
    ctx.globalAlpha = 1;

    for (let c = 0; c < 4; c++) {
      let mean = 0;
      for (let t = 0; t < 4; t++) mean += agent.idn[c][t];
      mean /= 4;
      const start = -Math.PI / 2 + c * (Math.PI / 2) + 0.08;
      const end = start + (Math.PI / 2 - 0.16) * (0.25 + mean * 0.75);
      ctx.beginPath();
      ctx.arc(p.x, p.y, radius + 4 * scale, start, end);
      ctx.strokeStyle = pal.accent;
      ctx.globalAlpha = 0.35 + mean * 0.65;
      ctx.lineWidth = 1.6 * scale;
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    const emphasize = agent.id === selected || agent.id === hovered;
    const crowded = labeled.some((label) => Math.hypot(label.x - p.x, label.y - p.y) < 72 * scale);
    if (emphasize || !crowded) {
      ctx.fillStyle = emphasize ? pal.fg : pal.muted;
      ctx.fillText(agent.name, p.x, p.y + radius + 6 * scale);
      labeled.push(p);
    }
  }

  if (world.rejectFlash > 0.04) {
    ctx.strokeStyle = pal.accent;
    ctx.globalAlpha = world.rejectFlash * 0.75;
    ctx.lineWidth = 3 * scale;
    ctx.strokeRect(8 * scale, 8 * scale, w - 16 * scale, h - 16 * scale);
    ctx.globalAlpha = 1;
  }
}

export function drawWave(canvas: HTMLCanvasElement, params: Params, t: number) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const pal = palette();
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = pal.ink;
  ctx.fillRect(0, 0, w, h);

  ctx.strokeStyle = pal.line;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, h * 0.78);
  ctx.lineTo(w, h * 0.78);
  ctx.stroke();

  const sample = (shift: number) => {
    ctx.beginPath();
    for (let x = 0; x <= w; x++) {
      const phase = (t / Math.max(8, params.period) + shift + x / w) % 1;
      const yv = adprsAt(phase, params.duration, params.decay, params.amplitude);
      const y = h * 0.78 - yv * (h * 0.62);
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  };

  ctx.globalAlpha = 0.35;
  ctx.strokeStyle = pal.muted;
  ctx.lineWidth = 1.25;
  sample(params.spread * 0.5);
  ctx.globalAlpha = 1;
  ctx.strokeStyle = pal.accent;
  ctx.lineWidth = 1.75;
  sample(0);
}
