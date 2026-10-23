export type Params = {
  wDemo: number;
  wPsycho: number;
  wBehavior: number;
  wRelation: number;
  amplitude: number;
  decay: number;
  duration: number;
  period: number;
  spread: number;
  theta: number;
  alpha: number;
  coupling: number;
  noise: number;
  repulsion: number;
};

export type PresetId =
  | "equilibrium"
  | "protest"
  | "polarization"
  | "critical"
  | "validated"
  | "cascade";

export type ClockKind = "genesis" | "bond" | "sever" | "pulse" | "shift" | "reject";

export type ClockEvent = {
  t: number;
  hash: string;
  prev: string;
  kind: ClockKind;
  note: string;
};

export type ValidatorScores = {
  identity: number;
  relation: number;
  temporal: number;
  behavior: number;
  consensus: number;
  accepted: boolean;
};

export type AgentView = {
  id: number;
  name: string;
  pulse: number;
  energy: number;
  idn: number[][];
  bonds: string[];
};

export type HudSnapshot = {
  t: number;
  energy: number;
  energyHistory: number[];
  running: boolean;
  communities: number;
  acceptance: number;
  validators: ValidatorScores;
  events: ClockEvent[];
  agents: AgentView[];
  selected: number | null;
  preset: PresetId;
};

export const CHANNELS = ["Demographic", "Psychographic", "Behavioral", "Relational"] as const;

export const TRAITS = [
  ["Cohort", "Locale", "Status", "Schooling"],
  ["Openness", "Values", "Risk", "Conformity"],
  ["Activity", "Reciprocity", "Novelty", "Loyalty"],
  ["Trust", "Influence", "Bonding", "Exclusivity"],
] as const;

const NAMES = [
  "Avery",
  "Noor",
  "Jules",
  "Mina",
  "Rafael",
  "Sable",
  "Idris",
  "Leila",
  "Cassian",
  "Hana",
  "Omar",
  "Willa",
  "Theo",
  "Priya",
  "Ellis",
  "Samira",
  "Jonah",
  "Amara",
  "Felix",
  "Yara",
  "Nico",
  "Lumen",
];

const PROTOTYPES: number[][][] = [
  [
    [0.62, 0.4, 0.48, 0.72],
    [0.35, 0.7, 0.28, 0.78],
    [0.4, 0.74, 0.3, 0.8],
    [0.76, 0.42, 0.7, 0.55],
  ],
  [
    [0.38, 0.72, 0.55, 0.44],
    [0.82, 0.28, 0.74, 0.22],
    [0.7, 0.48, 0.84, 0.3],
    [0.5, 0.68, 0.36, 0.25],
  ],
  [
    [0.5, 0.55, 0.66, 0.6],
    [0.58, 0.5, 0.46, 0.48],
    [0.55, 0.72, 0.52, 0.5],
    [0.62, 0.8, 0.58, 0.3],
  ],
];

const CENTERS = [
  { x: 270, y: 280 },
  { x: 740, y: 260 },
  { x: 500, y: 520 },
];

const COUNTS = [8, 8, 6];

export const PRESETS: Record<PresetId, { label: string; blurb: string; params: Params }> = {
  equilibrium: {
    label: "Equilibrium",
    blurb: "Communities settle. Bonds hold where affinity is cheap.",
    params: {
      wDemo: 0.55,
      wPsycho: 0.8,
      wBehavior: 0.6,
      wRelation: 0.85,
      amplitude: 0.55,
      decay: 1.15,
      duration: 0.38,
      period: 96,
      spread: 0.28,
      theta: 0.42,
      alpha: 0.22,
      coupling: 1,
      noise: 0.05,
      repulsion: 0.42,
    },
  },
  protest: {
    label: "Protest wave",
    blurb: "A short, loud envelope. Activity spreads, then decays.",
    params: {
      wDemo: 0.35,
      wPsycho: 0.9,
      wBehavior: 1,
      wRelation: 0.7,
      amplitude: 0.95,
      decay: 2.4,
      duration: 0.22,
      period: 70,
      spread: 0.72,
      theta: 0.36,
      alpha: 0.38,
      coupling: 1.25,
      noise: 0.1,
      repulsion: 0.3,
    },
  },
  polarization: {
    label: "Polarization",
    blurb: "Values weigh more. Like finds like. The middle empties.",
    params: {
      wDemo: 0.3,
      wPsycho: 1,
      wBehavior: 0.45,
      wRelation: 0.55,
      amplitude: 0.4,
      decay: 0.6,
      duration: 0.7,
      period: 140,
      spread: 0.08,
      theta: 0.34,
      alpha: 0.16,
      coupling: 1.45,
      noise: 0.04,
      repulsion: 1.15,
    },
  },
  critical: {
    label: "Phase transition",
    blurb: "Near the barrier. Small noise, sudden rearrangement.",
    params: {
      wDemo: 0.5,
      wPsycho: 0.75,
      wBehavior: 0.7,
      wRelation: 0.7,
      amplitude: 0.72,
      decay: 0.85,
      duration: 0.5,
      period: 80,
      spread: 0.45,
      theta: 0.3,
      alpha: 0.48,
      coupling: 1.7,
      noise: 0.2,
      repulsion: 0.7,
    },
  },
  validated: {
    label: "Strict validation",
    blurb: "Raise the threshold. Incoherent moves are refused.",
    params: {
      wDemo: 0.6,
      wPsycho: 0.7,
      wBehavior: 0.55,
      wRelation: 0.8,
      amplitude: 0.35,
      decay: 1.4,
      duration: 0.45,
      period: 110,
      spread: 0.15,
      theta: 0.93,
      alpha: 0.12,
      coupling: 0.85,
      noise: 0.02,
      repulsion: 0.35,
    },
  },
  cascade: {
    label: "Meme cascade",
    blurb: "Fast period, wide spread. Behavior outruns identity.",
    params: {
      wDemo: 0.25,
      wPsycho: 0.4,
      wBehavior: 1,
      wRelation: 0.65,
      amplitude: 0.88,
      decay: 0.45,
      duration: 0.18,
      period: 36,
      spread: 0.95,
      theta: 0.38,
      alpha: 0.42,
      coupling: 1.15,
      noise: 0.12,
      repulsion: 0.25,
    },
  },
};

type Agent = {
  id: number;
  name: string;
  cluster: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  idn: number[][];
  pulse: number;
  prevPulse: number;
  energy: number;
  bonds: string[];
  pinned: boolean;
};

type Ripple = { x: number; y: number; age: number };

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

function chainHash(prev: string, payload: string) {
  let h = 2166136261;
  const s = prev + "|" + payload;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16).padStart(8, "0");
}

function keyOf(i: number, j: number) {
  return i < j ? `${i}-${j}` : `${j}-${i}`;
}

export function adprsAt(phase: number, duration: number, decay: number, amplitude: number) {
  const p = ((phase % 1) + 1) % 1;
  if (p > duration) return 0;
  const u = p / Math.max(0.04, duration);
  return amplitude * Math.exp(-decay * u);
}

export class World {
  agents: Agent[] = [];
  params: Params;
  preset: PresetId;
  t = 0;
  seed: number;
  running = true;
  energy = 1;
  energyHistory: number[] = [];
  events: ClockEvent[] = [];
  validators: ValidatorScores = {
    identity: 1,
    relation: 1,
    temporal: 1,
    behavior: 1,
    consensus: 1,
    accepted: true,
  };
  communities = 3;
  acceptance = 1;
  ripples: Ripple[] = [];
  rejectFlash = 0;
  selected: number | null = null;
  hovered: number | null = null;

  private rng: () => number;
  private bonds = new Set<string>();
  private head = "00000000";
  private acceptWindow: boolean[] = [];
  private lastPulseHigh = false;
  private lastReject = -99;
  private lastShift = -99;
  private affinity: number[][] = [];

  constructor(preset: PresetId, seed: number) {
    this.preset = preset;
    this.params = { ...PRESETS[preset].params };
    this.seed = seed >>> 0;
    this.rng = mulberry32(this.seed || 1);
    this.spawn();
  }

  setParams(params: Params) {
    this.params = { ...params };
  }

  setPreset(preset: PresetId) {
    this.preset = preset;
    this.params = { ...PRESETS[preset].params };
  }

  reseed(seed: number) {
    this.seed = seed >>> 0 || 1;
    this.rng = mulberry32(this.seed);
    this.t = 0;
    this.events = [];
    this.bonds.clear();
    this.energyHistory = [];
    this.acceptWindow = [];
    this.ripples = [];
    this.head = "00000000";
    this.lastPulseHigh = false;
    this.lastReject = -99;
    this.lastShift = -99;
    this.selected = null;
    this.hovered = null;
    this.spawn();
  }

  pin(id: number | null) {
    for (const a of this.agents) a.pinned = false;
    if (id == null) return;
    const a = this.agents[id];
    if (!a) return;
    a.pinned = true;
    a.vx = 0;
    a.vy = 0;
    this.selected = id;
  }

  move(id: number, x: number, y: number) {
    const a = this.agents[id];
    if (!a) return;
    a.x = clamp(x, 36, 964);
    a.y = clamp(y, 36, 664);
    a.vx = 0;
    a.vy = 0;
  }

  handMove(id: number) {
    const agent = this.agents[id];
    if (!agent) return;
    this.pushEvent("shift", `${agent.name} was moved by hand`);
    this.lastShift = this.t;
  }

  perturb(id?: number) {
    const a = this.agents[id ?? Math.floor(this.rng() * this.agents.length)];
    if (!a) return;
    const ang = this.rng() * Math.PI * 2;
    a.vx += Math.cos(ang) * 18;
    a.vy += Math.sin(ang) * 18;
    a.idn[1][1] = clamp(a.idn[1][1] + (this.rng() - 0.5) * 0.35, 0.04, 0.96);
    this.pushEvent("shift", `${a.name} was kicked off the gradient`);
    this.selected = a.id;
  }

  step() {
    const p = this.params;
    const n = this.agents.length;
    const weights = [p.wDemo, p.wPsycho, p.wBehavior, p.wRelation];

    for (let i = 0; i < n; i++) {
      const a = this.agents[i];
      const stagger = (i / n) * p.spread;
      const phase = (this.t / Math.max(8, p.period) + stagger) % 1;
      a.prevPulse = a.pulse;
      a.pulse = adprsAt(phase, p.duration, p.decay, p.amplitude);
      if (a.pulse > 0.55 && a.prevPulse <= 0.55) {
        this.ripples.push({ x: a.x, y: a.y, age: 0 });
      }
    }
    if (this.ripples.length > 36) this.ripples.splice(0, this.ripples.length - 36);

    const aff: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const s = this.pairAffinity(i, j, weights);
        aff[i][j] = s;
        aff[j][i] = s;
      }
    }
    this.affinity = aff;

    const fx = new Array(n).fill(0);
    const fy = new Array(n).fill(0);
    let pairEnergy = 0;
    let pairCount = 0;

    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const ai = this.agents[i];
        const aj = this.agents[j];
        let dx = aj.x - ai.x;
        let dy = aj.y - ai.y;
        let dist = Math.hypot(dx, dy);
        if (dist < 1) {
          dx = 1;
          dy = 0;
          dist = 1;
        }
        const ux = dx / dist;
        const uy = dy / dist;
        const s = aff[i][j];
        const drive = 0.45 + 0.55 * ((ai.pulse + aj.pulse) / 2);
        if (s > 0.28) {
          const ideal = 132 - s * 48;
          const k = p.coupling * s * drive * 0.06;
          const f = k * (dist - ideal);
          fx[i] += ux * f;
          fy[i] += uy * f;
          fx[j] -= ux * f;
          fy[j] -= uy * f;
        } else if (s < -0.05) {
          const reach = 520;
          if (dist < reach) {
            const k =
              p.coupling * -s * (0.45 + p.repulsion) * drive * 2.1 * (1 - dist / reach);
            fx[i] -= ux * k;
            fy[i] -= uy * k;
            fx[j] += ux * k;
            fy[j] += uy * k;
          }
        }
        if (dist < 42) {
          const push = (42 - dist) * 0.35;
          fx[i] -= ux * push;
          fy[i] -= uy * push;
          fx[j] += ux * push;
          fy[j] += uy * push;
        }
        pairEnergy += -s;
        pairCount++;
      }
    }

    for (let i = 0; i < n; i++) {
      const a = this.agents[i];
      fx[i] += (500 - a.x) * 0.0006;
      fy[i] += (360 - a.y) * 0.0006;
    }

    const proposed: { x: number; y: number; idn: number[][] }[] = [];
    let maxStep = 0;
    let traitDelta = 0;
    let traitSamples = 0;

    for (let i = 0; i < n; i++) {
      const a = this.agents[i];
      const drive = 0.55 + a.pulse;
      let vx = (a.vx + fx[i]) * 0.78;
      let vy = (a.vy + fy[i]) * 0.78;
      const sp = Math.hypot(vx, vy);
      const cap = 7 + 14 * a.pulse;
      if (sp > cap) {
        vx *= cap / sp;
        vy *= cap / sp;
      }
      let nx = a.x + vx * drive;
      let ny = a.y + vy * drive;
      nx += (this.rng() - 0.5) * p.noise * 36;
      ny += (this.rng() - 0.5) * p.noise * 36;
      nx = clamp(nx, 40, 960);
      ny = clamp(ny, 40, 660);
      if (a.pinned) {
        nx = a.x;
        ny = a.y;
        vx = 0;
        vy = 0;
      }
      maxStep = Math.max(maxStep, Math.hypot(nx - a.x, ny - a.y));

      const idn = a.idn.map((row) => row.slice());
      for (let j = 0; j < n; j++) {
        if (i === j || aff[i][j] <= 0.12) continue;
        const w = aff[i][j] * (0.35 + this.agents[j].pulse);
        for (let c = 0; c < 4; c++) {
          for (let t = 0; t < 4; t++) {
            const before = idn[c][t];
            const target = this.agents[j].idn[c][t];
            const rate = w * 0.02 * (0.4 + p.alpha);
            idn[c][t] = before + (target - before) * rate;
            traitDelta += Math.abs(idn[c][t] - a.idn[c][t]);
            traitSamples++;
          }
        }
      }

      const actTarget = 0.28 + 0.62 * a.pulse;
      const actBefore = idn[2][0];
      idn[2][0] = actBefore + (actTarget - actBefore) * (0.08 + 0.25 * p.alpha);
      traitDelta += Math.abs(idn[2][0] - a.idn[2][0]);
      traitSamples++;

      for (let c = 0; c < 4; c++) {
        for (let t = 0; t < 4; t++) {
          idn[c][t] = clamp(idn[c][t] + (this.rng() - 0.5) * p.noise * 0.05, 0.03, 0.97);
        }
      }

      a.vx = vx;
      a.vy = vy;
      proposed.push({ x: nx, y: ny, idn });
    }

    const meanTraitDelta = traitDelta / Math.max(1, traitSamples);
    const identityScore = clamp(1 - meanTraitDelta / 0.045, 0, 1);

    let closeHostile = 0;
    let closePairs = 0;
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const d = Math.hypot(proposed[i].x - proposed[j].x, proposed[i].y - proposed[j].y);
        if (d < 96) {
          closePairs++;
          if (aff[i][j] < -0.05) closeHostile++;
        }
      }
    }
    const relationScore = clamp(1 - closeHostile / Math.max(1, closePairs), 0, 1);

    const meanPulse = this.agents.reduce((s, a) => s + a.pulse, 0) / n;
    const temporalLimit = 10 + 22 * meanPulse;
    const temporalScore = clamp(1 - Math.max(0, maxStep - temporalLimit * 0.45) / temporalLimit, 0, 1);

    let meanAct = 0;
    for (const pr of proposed) meanAct += pr.idn[2][0];
    meanAct /= n;
    const behaviorScore = clamp(1 - Math.abs(meanAct - (0.3 + 0.55 * meanPulse)) / 0.55, 0, 1);

    const consensus = Math.pow(
      Math.max(0.001, identityScore) *
        Math.max(0.001, relationScore) *
        Math.max(0.001, temporalScore) *
        Math.max(0.001, behaviorScore),
      0.25,
    );
    const accepted = consensus + 1e-6 >= p.theta;

    const mix = clamp(p.alpha, 0.02, 0.85);
    const project = accepted ? 1 : 0.22;

    let selfEnergy = 0;
    for (let i = 0; i < n; i++) {
      const a = this.agents[i];
      const y = proposed[i];
      if (!a.pinned) {
        a.x = (1 - mix) * a.x + mix * (a.x + (y.x - a.x) * project);
        a.y = (1 - mix) * a.y + mix * (a.y + (y.y - a.y) * project);
      }
      if (!accepted) {
        a.vx *= 0.45;
        a.vy *= 0.45;
      }
      for (let c = 0; c < 4; c++) {
        for (let t = 0; t < 4; t++) {
          const blended = a.idn[c][t] + (y.idn[c][t] - a.idn[c][t]) * project;
          a.idn[c][t] = (1 - mix * 0.65) * a.idn[c][t] + mix * 0.65 * blended;
        }
      }
      let mean = 0;
      const flat: number[] = [];
      for (const row of a.idn) for (const v of row) flat.push(v);
      for (const v of flat) mean += v;
      mean /= flat.length;
      let variance = 0;
      for (const v of flat) variance += (v - mean) ** 2;
      variance /= flat.length;
      const localPairs = aff[i].reduce((s, v, j) => (j === i ? s : s - v), 0) / Math.max(1, n - 1);
      a.energy = variance * 2.2 + (localPairs + 1) * 0.35;
      selfEnergy += variance;
    }

    const prevEnergy = this.energy;
    this.energy = selfEnergy / n * 3.2 + (pairEnergy / Math.max(1, pairCount) + 1) * 0.42;
    this.energyHistory.push(this.energy);
    if (this.energyHistory.length > 180) this.energyHistory.shift();

    this.validators = {
      identity: identityScore,
      relation: relationScore,
      temporal: temporalScore,
      behavior: behaviorScore,
      consensus,
      accepted,
    };
    this.acceptWindow.push(accepted);
    if (this.acceptWindow.length > 40) this.acceptWindow.shift();
    this.acceptance = this.acceptWindow.filter(Boolean).length / this.acceptWindow.length;

    this.rejectFlash = Math.max(0, this.rejectFlash - 0.08);
    for (const r of this.ripples) r.age += 0.03;
    this.ripples = this.ripples.filter((r) => r.age < 1);

    this.syncBonds();
    this.communities = this.countCommunities();

    if (!accepted && this.t - this.lastReject > 10) {
      this.pushEvent("reject", `Validators held the field · Π ${consensus.toFixed(2)} < θ ${p.theta.toFixed(2)}`);
      this.lastReject = this.t;
      this.rejectFlash = 1;
    }

    const high = meanPulse > 0.62;
    if (high && !this.lastPulseHigh) {
      this.pushEvent("pulse", `ADPRS crest · amplitude ${meanPulse.toFixed(2)} across the field`);
    }
    this.lastPulseHigh = high;

    if (Math.abs(this.energy - prevEnergy) > 0.085 && this.t - this.lastShift > 24 && this.t > 8) {
      const dir = this.energy < prevEnergy ? "fell" : "rose";
      this.pushEvent("shift", `Energy ${dir} to ${this.energy.toFixed(2)} · a change of basin`);
      this.lastShift = this.t;
    }

    this.t += 1;
  }

  strength(i: number, j: number) {
    return this.affinity[i]?.[j] ?? 0;
  }

  hud(): HudSnapshot {
    return {
      t: this.t,
      energy: this.energy,
      energyHistory: this.energyHistory.slice(),
      running: this.running,
      communities: this.communities,
      acceptance: this.acceptance,
      validators: { ...this.validators },
      events: this.events.slice(-20),
      agents: this.agents.map((a) => ({
        id: a.id,
        name: a.name,
        pulse: a.pulse,
        energy: a.energy,
        idn: a.idn.map((row) => row.slice()),
        bonds: a.bonds.slice(),
      })),
      selected: this.selected,
      preset: this.preset,
    };
  }

  private spawn() {
    this.agents = [];
    let id = 0;
    for (let c = 0; c < 3; c++) {
      for (let k = 0; k < COUNTS[c]; k++) {
        const ang = (k / COUNTS[c]) * Math.PI * 2 + c;
        const rad = 54 + this.rng() * 78;
        const idn = PROTOTYPES[c].map((row) =>
          row.map((v) => clamp(v + (this.rng() - 0.5) * 0.14, 0.04, 0.96)),
        );
        this.agents.push({
          id,
          name: NAMES[id] ?? `Agent ${id}`,
          cluster: c,
          x: clamp(CENTERS[c].x + Math.cos(ang) * rad, 48, 952),
          y: clamp(CENTERS[c].y + Math.sin(ang) * rad, 48, 652),
          vx: 0,
          vy: 0,
          idn,
          pulse: 0,
          prevPulse: 0,
          energy: 0.5,
          bonds: [],
          pinned: false,
        });
        id++;
      }
    }
    const weights = [
      this.params.wDemo,
      this.params.wPsycho,
      this.params.wBehavior,
      this.params.wRelation,
    ];
    const n = this.agents.length;
    this.affinity = Array.from({ length: n }, () => new Array(n).fill(0));
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const s = this.pairAffinity(i, j, weights);
        this.affinity[i][j] = s;
        this.affinity[j][i] = s;
      }
    }
    this.syncBonds(true);
    this.communities = this.countCommunities();
    this.energy = 0.9;
    this.energyHistory = [0.9];
    this.pushEvent("genesis", `Field seeded · ${n} identity tensors · seed ${this.seed}`);
  }

  private pairAffinity(i: number, j: number, weights: number[]) {
    const A = this.agents[i];
    const B = this.agents[j];
    let dot = 0;
    let na = 0;
    let nb = 0;
    for (let c = 0; c < 4; c++) {
      const w = 0.25 + weights[c];
      for (let t = 0; t < 4; t++) {
        const ai = A.idn[c][t];
        const bi = B.idn[c][t];
        dot += w * ai * bi;
        na += w * ai * ai;
        nb += w * bi * bi;
      }
    }
    const sim = dot / (Math.sqrt(na * nb) + 1e-8);
    const align = (sim - 0.86) / 0.14;
    const valuesGap = Math.abs(A.idn[1][1] - B.idn[1][1]);
    const status = A.idn[0][2] * B.idn[0][2];
    const trust = 0.5 * (A.idn[3][0] + B.idn[3][0]);
    const aff = align * (0.45 + 0.55 * trust) - valuesGap * 1.15 - Math.max(0, status - 0.22) * 0.35;
    return clamp(aff, -1, 1);
  }

  private syncBonds(silent = false) {
    const n = this.agents.length;
    const next = new Set<string>();
    for (let i = 0; i < n; i++) this.agents[i].bonds = [];
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const s = this.affinity[i]?.[j] ?? 0;
        const k = keyOf(i, j);
        const keep = this.bonds.has(k) ? s > 0.16 : s > 0.4;
        if (!keep) continue;
        next.add(k);
        if (this.agents[i].bonds.length < 4) this.agents[i].bonds.push(this.agents[j].name);
        if (this.agents[j].bonds.length < 4) this.agents[j].bonds.push(this.agents[i].name);
      }
    }
    if (!silent) {
      for (const k of next) {
        if (!this.bonds.has(k)) {
          const [a, b] = k.split("-").map(Number);
          this.pushEvent("bond", `${this.agents[a].name} bonded with ${this.agents[b].name}`);
        }
      }
      for (const k of this.bonds) {
        if (!next.has(k)) {
          const [a, b] = k.split("-").map(Number);
          this.pushEvent("sever", `${this.agents[a].name} and ${this.agents[b].name} let go`);
        }
      }
    }
    this.bonds = next;
  }

  private countCommunities() {
    const n = this.agents.length;
    const parent = Array.from({ length: n }, (_, i) => i);
    const find = (x: number): number => {
      while (parent[x] !== x) {
        parent[x] = parent[parent[x]];
        x = parent[x];
      }
      return x;
    };
    for (const k of this.bonds) {
      const [a, b] = k.split("-").map(Number);
      const pa = find(a);
      const pb = find(b);
      if (pa !== pb) parent[pa] = pb;
    }
    const roots = new Set<number>();
    for (let i = 0; i < n; i++) roots.add(find(i));
    return roots.size;
  }

  private pushEvent(kind: ClockKind, note: string) {
    if (kind !== "genesis" && kind !== "reject") {
      const recent = this.events.slice(-6);
      if (recent.filter((e) => e.kind === kind).length >= 3 && kind !== "shift") return;
    }
    const prev = this.head;
    const hash = chainHash(prev, `${this.t}:${kind}:${note}`);
    this.head = hash;
    this.events.push({ t: this.t, hash, prev, kind, note });
    if (this.events.length > 48) this.events.splice(0, this.events.length - 48);
  }
}
