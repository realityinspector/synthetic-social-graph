import { useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw, SkipForward, Zap } from "lucide-react";
import {
  CHANNELS,
  PRESETS,
  TRAITS,
  World,
  type HudSnapshot,
  type Params,
  type PresetId,
} from "@/lib/ssg/engine";
import { drawField, drawWave, pickAgent, screenToField } from "@/components/lab/draw";

const PRESET_ORDER: PresetId[] = [
  "equilibrium",
  "protest",
  "polarization",
  "critical",
  "validated",
  "cascade",
];

const WEIGHTS: { key: keyof Params; label: string; hint: string }[] = [
  { key: "wDemo", label: "Demographic", hint: "Cohort, locale, status, schooling" },
  { key: "wPsycho", label: "Psychographic", hint: "Values and temperament" },
  { key: "wBehavior", label: "Behavioral", hint: "What people actually do" },
  { key: "wRelation", label: "Relational", hint: "Trust, influence, bonding" },
];

export function Laboratory() {
  const worldRef = useRef<World | null>(null);
  const fieldRef = useRef<HTMLCanvasElement>(null);
  const fieldWrapRef = useRef<HTMLDivElement>(null);
  const waveRef = useRef<HTMLCanvasElement>(null);
  const dragRef = useRef<number | null>(null);
  const movedRef = useRef(false);
  const selectedRef = useRef<number | null>(null);
  const hoverRef = useRef<number | null>(null);
  const runningRef = useRef(true);
  const chainRef = useRef<HTMLOListElement>(null);

  const [params, setParams] = useState<Params>(PRESETS.equilibrium.params);
  const [preset, setPreset] = useState<PresetId | null>("equilibrium");
  const [seed, setSeed] = useState(20250228);
  const [running, setRunning] = useState(true);
  const [hud, setHud] = useState<HudSnapshot | null>(null);
  const [selected, setSelected] = useState<number | null>(null);

  useEffect(() => {
    const el = chainRef.current;
    if (!el) return;
    el.scrollLeft = el.scrollWidth;
  }, [hud?.events.length]);

  useEffect(() => {
    const world = new World("equilibrium", 20250228);
    worldRef.current = world;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      world.running = false;
      runningRef.current = false;
      setRunning(false);
      for (let i = 0; i < 48; i++) world.step();
    }
    setHud(world.hud());

    let raf = 0;
    let acc = 0;
    let last = performance.now();
    let hudAcc = 0;

    const fit = (canvas: HTMLCanvasElement | null, box?: HTMLElement | null) => {
      if (!canvas) return;
      const rect = (box ?? canvas.parentElement)?.getBoundingClientRect();
      if (!rect || rect.width < 2) return;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const height = box ? Math.max(1, rect.height) : 76;
      const bw = Math.floor(rect.width * dpr);
      const bh = Math.floor(height * dpr);
      if (canvas.width !== bw || canvas.height !== bh) {
        canvas.width = bw;
        canvas.height = bh;
      }
    };

    const frame = (now: number) => {
      const dt = Math.min(48, now - last);
      last = now;
      acc += dt;
      hudAcc += dt;
      let stepped = 0;
      while (runningRef.current && acc >= 42 && stepped < 6) {
        acc -= 42;
        stepped += 1;
        world.step();
      }
      if (!runningRef.current) acc = 0;
      fit(fieldRef.current, fieldWrapRef.current);
      fit(waveRef.current);
      if (fieldRef.current) drawField(fieldRef.current, world, selectedRef.current, hoverRef.current);
      if (waveRef.current) drawWave(waveRef.current, world.params, world.t);
      if (hudAcc > 150) {
        hudAcc = 0;
        setHud(world.hud());
      }
      raf = requestAnimationFrame(frame);
    };

    const onKey = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
      if (event.code !== "Space") return;
      event.preventDefault();
      world.running = !world.running;
      runningRef.current = world.running;
      setRunning(world.running);
      setHud(world.hud());
    };

    window.addEventListener("keydown", onKey);
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  function publish(next: Params, id: PresetId | null) {
    setParams(next);
    setPreset(id);
    const world = worldRef.current;
    if (!world) return;
    if (id) world.setPreset(id);
    else world.setParams(next);
  }

  function toggleRun() {
    const world = worldRef.current;
    if (!world) return;
    world.running = !world.running;
    runningRef.current = world.running;
    setRunning(world.running);
    setHud(world.hud());
  }

  function stepOnce() {
    const world = worldRef.current;
    if (!world) return;
    world.running = false;
    runningRef.current = false;
    setRunning(false);
    world.step();
    setHud(world.hud());
  }

  function reseed() {
    const world = worldRef.current;
    if (!world) return;
    const next = Number.isFinite(seed) ? Math.trunc(seed) : 20250228;
    world.reseed(next || 1);
    setSelected(null);
    selectedRef.current = null;
    setHud(world.hud());
  }

  function perturb() {
    const world = worldRef.current;
    if (!world) return;
    world.perturb(selectedRef.current ?? undefined);
    if (world.selected != null) {
      selectedRef.current = world.selected;
      setSelected(world.selected);
    }
    setHud(world.hud());
  }

  function onPointerDown(event: React.PointerEvent<HTMLCanvasElement>) {
    const world = worldRef.current;
    const canvas = fieldRef.current;
    if (!world || !canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const hit = pickAgent(world, x, y, rect.width, rect.height);
    canvas.setPointerCapture(event.pointerId);
    if (hit >= 0) {
      dragRef.current = hit;
      movedRef.current = false;
      world.pin(hit);
      selectedRef.current = hit;
      setSelected(hit);
    } else {
      dragRef.current = null;
      world.pin(null);
      world.selected = null;
      selectedRef.current = null;
      setSelected(null);
    }
  }

  function onPointerMove(event: React.PointerEvent<HTMLCanvasElement>) {
    const world = worldRef.current;
    const canvas = fieldRef.current;
    if (!world || !canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const dragging = dragRef.current;
    if (dragging != null) {
      movedRef.current = true;
      const field = screenToField(x, y, rect.width, rect.height);
      world.move(dragging, field.x, field.y);
      return;
    }
    const hit = pickAgent(world, x, y, rect.width, rect.height);
    hoverRef.current = hit >= 0 ? hit : null;
    canvas.style.cursor = hit >= 0 ? "grab" : "crosshair";
  }

  function onPointerUp() {
    const world = worldRef.current;
    if (dragRef.current != null && movedRef.current) world?.handMove(dragRef.current);
    dragRef.current = null;
    movedRef.current = false;
    world?.pin(null);
  }

  const agent = hud?.agents.find((item) => item.id === selected) ?? null;
  const validators = hud?.validators;

  return (
    <main className="min-h-screen bg-bg text-fg">
      <header className="border-b border-line px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <p className="font-mono text-xs tracking-widest text-accent uppercase">
                McDonald · 2025 · interactive reading
              </p>
              <nav aria-label="Project" className="flex items-center gap-3 font-mono text-xs">
                <a
                  href="https://github.com/realityinspector/synthetic-social-graph"
                  target="_blank"
                  rel="noreferrer"
                  className="text-fg underline decoration-line underline-offset-4 hover:text-accent"
                >
                  GitHub
                </a>
                <a
                  href="https://x.com/seanmcdonaldxyz"
                  target="_blank"
                  rel="noreferrer"
                  className="text-muted underline decoration-line underline-offset-4 hover:text-fg"
                >
                  x.com/seanmcdonaldxyz
                </a>
              </nav>
            </div>
            <h1 className="mt-1 text-3xl leading-tight font-medium text-balance sm:text-4xl">
              Synthetic Social Graph
            </h1>
            <p className="mt-2 max-w-lg text-base text-pretty text-muted">
              Social life as an energy field. Twenty-two identity tensors settle, pulse, bond, and refuse
              moves the validators will not sign.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Stat label="Tick" value={hud ? String(hud.t).padStart(5, "0") : "00000"} />
            <Stat label="Energy" value={hud ? hud.energy.toFixed(2) : "—"} />
            <Stat label="Accept" value={hud ? `${Math.round(hud.acceptance * 100)}%` : "—"} />
            <Stat label="Groups" value={hud ? String(hud.communities) : "—"} />
            <button
              type="button"
              onClick={toggleRun}
              className="inline-flex h-11 items-center gap-2 border border-line bg-surface px-3 font-mono text-xs text-fg transition-transform duration-150 ease-out active:scale-[0.96]"
            >
              {running ? <Pause className="size-4" aria-hidden /> : <Play className="size-4" aria-hidden />}
              {running ? "Pause" : "Run"}
            </button>
            <button
              type="button"
              onClick={stepOnce}
              className="inline-flex h-11 items-center gap-2 border border-line bg-surface px-3 font-mono text-xs transition-transform duration-150 ease-out active:scale-[0.96]"
            >
              <SkipForward className="size-4" aria-hidden />
              Step
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-4 px-4 py-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_22.5rem]">
        <section className="flex min-w-0 flex-col gap-3 lg:col-start-1 lg:row-start-1 lg:sticky lg:top-4 lg:self-start">
          <div
            ref={fieldWrapRef}
            className="relative h-[68vw] min-h-80 overflow-hidden border border-line bg-bg sm:h-[32rem]"
          >
            <canvas
              ref={fieldRef}
              className="h-full w-full touch-none"
              aria-label="Living social field. Drag a person to perturb them. Solid lines are bonds, dashed lines are tension."
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
            />
            <p className="pointer-events-none absolute top-3 left-3 max-w-56 bg-bg/80 px-2 py-1 font-mono text-xs text-muted">
              Drag a person. Space pauses. Amber rings are identity. Dashes are strain.
            </p>
            {validators && !validators.accepted && (
              <p className="pointer-events-none absolute right-3 bottom-3 bg-ink px-2 py-1 font-mono text-xs text-accent">
                Rejected by Π
              </p>
            )}
          </div>
          <div className="grid gap-3 border border-line bg-surface p-3 sm:grid-cols-[minmax(0,1fr)_9rem]">
            <div>
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="font-mono text-xs tracking-widest text-muted uppercase">Energy</h2>
                <p className="font-mono text-xs text-faint tabular-nums">lower is a stabler basin</p>
              </div>
              <Sparkline values={hud?.energyHistory ?? []} />
            </div>
            <div className="grid content-center gap-2">
              <Meter label="Consensus" value={validators?.consensus ?? 0} mark={params.theta} />
              <p className="font-mono text-xs text-faint">Mark is θ, the filter.</p>
            </div>
          </div>
        </section>

        <aside className="flex min-w-0 flex-col gap-4 max-lg:order-2 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto lg:pr-1">
          <section className="border border-line bg-surface p-3">
            <h2 className="font-mono text-xs tracking-widest text-muted uppercase">Scores</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {PRESET_ORDER.map((id) => (
                <button
                  key={id}
                  type="button"
                  aria-pressed={preset === id}
                  onClick={() => publish({ ...PRESETS[id].params }, id)}
                  className={
                    "h-11 border px-3 font-mono text-xs transition-transform duration-150 ease-out active:scale-[0.96] " +
                    (preset === id
                      ? "border-accent bg-accent text-ink"
                      : "border-line bg-ink text-fg")
                  }
                >
                  {PRESETS[id].label}
                </button>
              ))}
            </div>
            <p className="mt-3 text-sm text-pretty text-muted">
              {preset ? PRESETS[preset].blurb : "Hand-tuned. The field keeps its memory."}
            </p>
          </section>

          <section className="border border-line bg-surface p-3">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="font-mono text-xs tracking-widest text-muted uppercase">Envelope · ADPRS</h2>
              <p className="font-mono text-xs text-faint">A · λ · D · P · S</p>
            </div>
            <canvas ref={waveRef} className="mt-3 h-16 w-full border border-line bg-ink" aria-hidden />
            <div className="mt-2 grid gap-1">
              <Slider
                label="Amplitude A"
                min={0}
                max={1}
                step={0.01}
                value={params.amplitude}
                onChange={(value) => publish({ ...params, amplitude: value }, null)}
              />
              <Slider
                label="Decay λ"
                min={0}
                max={4}
                step={0.01}
                value={params.decay}
                onChange={(value) => publish({ ...params, decay: value }, null)}
              />
              <Slider
                label="Duration D"
                min={0.08}
                max={0.95}
                step={0.01}
                value={params.duration}
                onChange={(value) => publish({ ...params, duration: value }, null)}
              />
              <Slider
                label="Period P"
                min={16}
                max={220}
                step={1}
                value={params.period}
                digits={0}
                onChange={(value) => publish({ ...params, period: value }, null)}
              />
              <Slider
                label="Spread S"
                min={0}
                max={1}
                step={0.01}
                value={params.spread}
                onChange={(value) => publish({ ...params, spread: value }, null)}
              />
            </div>
          </section>

          <section className="border border-line bg-surface p-3">
            <h2 className="font-mono text-xs tracking-widest text-muted uppercase">Oscillators</h2>
            <p className="mt-1 text-sm text-muted">Channel weights inside the identity tensor.</p>
            <div className="mt-2 grid gap-1">
              {WEIGHTS.map((item) => (
                <Slider
                  key={item.key}
                  label={item.label}
                  hint={item.hint}
                  min={0}
                  max={1}
                  step={0.01}
                  value={params[item.key]}
                  onChange={(value) => publish({ ...params, [item.key]: value }, null)}
                />
              ))}
            </div>
          </section>

          <section className="border border-line bg-surface p-3">
            <h2 className="font-mono text-xs tracking-widest text-muted uppercase">Filter and mix</h2>
            <div className="mt-2 grid gap-1">
              <Slider
                label="Threshold θ"
                hint="Validators must clear this together"
                min={0.2}
                max={0.92}
                step={0.01}
                value={params.theta}
                onChange={(value) => publish({ ...params, theta: value }, null)}
              />
              <Slider
                label="Memory α"
                hint="How fast the field adopts a proposal"
                min={0.04}
                max={0.8}
                step={0.01}
                value={params.alpha}
                onChange={(value) => publish({ ...params, alpha: value }, null)}
              />
              <Slider
                label="Coupling J"
                hint="Strength of attraction and strain"
                min={0.2}
                max={2.2}
                step={0.01}
                value={params.coupling}
                onChange={(value) => publish({ ...params, coupling: value }, null)}
              />
              <Slider
                label="Repulsion"
                min={0}
                max={1.6}
                step={0.01}
                value={params.repulsion}
                onChange={(value) => publish({ ...params, repulsion: value }, null)}
              />
              <Slider
                label="Noise η"
                min={0}
                max={0.4}
                step={0.01}
                value={params.noise}
                onChange={(value) => publish({ ...params, noise: value }, null)}
              />
            </div>
          </section>

          <section className="border border-line bg-surface p-3">
            <h2 className="font-mono text-xs tracking-widest text-muted uppercase">Validators</h2>
            <div className="mt-3 grid gap-3">
              <Meter label="Identity" value={validators?.identity ?? 0} />
              <Meter label="Relation" value={validators?.relation ?? 0} />
              <Meter label="Temporal" value={validators?.temporal ?? 0} />
              <Meter label="Behavior" value={validators?.behavior ?? 0} />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={perturb}
                className="inline-flex h-11 items-center gap-2 border border-accent bg-accent px-3 font-mono text-xs text-ink transition-transform duration-150 ease-out active:scale-[0.96]"
              >
                <Zap className="size-4" aria-hidden />
                Perturb
              </button>
              <label className="inline-flex h-11 items-center gap-2 border border-line bg-ink px-3 font-mono text-xs">
                Seed
                <input
                  type="number"
                  value={seed}
                  onChange={(event) => setSeed(Number(event.target.value))}
                  className="w-24 bg-transparent text-fg tabular-nums outline-none"
                  aria-label="Random seed"
                />
              </label>
              <button
                type="button"
                onClick={reseed}
                className="inline-flex h-11 items-center gap-2 border border-line bg-ink px-3 font-mono text-xs transition-transform duration-150 ease-out active:scale-[0.96]"
              >
                <RotateCcw className="size-4" aria-hidden />
                Reseed
              </button>
            </div>
          </section>

          <section className="border border-line bg-surface p-3">
            <h2 className="font-mono text-xs tracking-widest text-muted uppercase">
              {agent ? agent.name : "Identity tensor"}
            </h2>
            {agent ? (
              <>
                <p className="mt-1 font-mono text-xs text-faint tabular-nums">
                  pulse {agent.pulse.toFixed(2)} · local E {agent.energy.toFixed(2)}
                </p>
                <Tensor idn={agent.idn} />
                <p className="mt-3 text-sm text-muted">
                  {agent.bonds.length
                    ? `Stable bonds: ${agent.bonds.join(", ")}.`
                    : "No stable bond. They are between basins."}
                </p>
              </>
            ) : (
              <p className="mt-2 text-sm text-pretty text-muted">
                Select someone in the field. The four-by-four tensor is demographic, psychographic,
                behavioral, relational — not a single embedding.
              </p>
            )}
          </section>
        </aside>

        <section className="min-w-0 border border-line bg-surface p-3 max-lg:order-3 lg:col-start-1 lg:row-start-2">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="font-mono text-xs tracking-widest text-muted uppercase">Clockchain</h2>
            <p className="font-mono text-xs text-faint">causal digests, newest at the right</p>
          </div>
          <ol ref={chainRef} className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {(hud?.events ?? []).map((event) => (
              <li
                key={`${event.hash}-${event.t}-${event.kind}`}
                className="w-52 shrink-0 border border-line bg-ink px-3 py-2"
              >
                <div className="flex items-baseline justify-between gap-2 font-mono text-xs">
                  <span className="text-accent uppercase">{event.kind}</span>
                  <span className="text-faint tabular-nums">{String(event.t).padStart(5, "0")}</span>
                </div>
                <p className="mt-2 text-sm text-pretty text-fg">{event.note}</p>
                <p className="mt-3 font-mono text-xs text-faint tabular-nums">
                  {event.prev.slice(0, 4)} → {event.hash}
                </p>
              </li>
            ))}
          </ol>
        </section>
      </div>

      <article className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-medium text-balance">The theorem, as an instrument</h2>
          <p className="mt-3 text-base text-pretty text-muted">
            Sean McDonald’s pre-publication paper treats social dynamics as continuous energy flow rather
            than token sequences. This laboratory runs a small, honest version of that idea. It is not a
            proof, and it is not a claim that the field has been empirically validated.
          </p>
          <figure className="mt-6 border border-line bg-surface p-4">
            <figcaption className="font-mono text-xs tracking-widest text-muted uppercase">
              Unified step
            </figcaption>
            <p className="mt-3 font-mono text-xs leading-6 text-fg sm:text-sm">
              Xₜ₊₁ = (1 − αₜ) Xₜ + αₜ Π(arg minᵧ E(Y) + ηₜ)
            </p>
            <p className="mt-2 font-mono text-xs leading-6 text-muted">
              E(Y) = Σᵢ wᵢ φᵢ(Y) + Σᵢⱼ Jᵢⱼ ψᵢⱼ(Yᵢ, Yⱼ)
            </p>
            <p className="mt-2 font-mono text-xs leading-6 text-muted">
              accept only if every validator ψᵢ clears θₜ
            </p>
          </figure>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Note
            k="01"
            title="Identity tensors"
            body="Each person is a 4×4 tensor: demographic, psychographic, behavioral, relational. Oscillators reweight those channels. Neighbors tug traits only when affinity is real."
          />
          <Note
            k="02"
            title="Energy"
            body="Attraction is a low-energy bond. Value conflict and status clash raise the potential. The trace under the field is the system hunting a basin, not a scripted story."
          />
          <Note
            k="03"
            title="ADPRS"
            body="Behavior is an envelope: amplitude, decay, duration, period, spread. The same controls a synthesizer uses for a note, here timing a wave of activity across the graph."
          />
          <Note
            k="04"
            title="Clockchain"
            body="Bonds, breaks, pulses, shocks, and rejections are appended with a chained digest. Order is causal. This is a laboratory stand-in for the paper’s cryptographic DAG, not a ledger."
          />
          <Note
            k="05"
            title="Validators"
            body="Identity, relation, time, and behavior score every proposal. Geometric consensus has to clear θ or the move is projected back. Turn θ up and watch the chain fill with refusals."
          />
          <Note
            k="06"
            title="What to try"
            body="Protest wave, then strict validation. Drag two people from different clusters together and see if the relation validator allows the friendship. Reseed if you want another population."
          />
        </div>
        <footer className="mt-10 border-t border-line pt-4 font-mono text-xs text-faint">
          <p>
            After{" "}
            <a
              className="text-accent underline underline-offset-2"
              href="https://github.com/realityinspector/synthetic-social-graph-paper"
            >
              The Synthetic Social Graph Theorem
            </a>
            , Sean McDonald, February 2025. Untested, unvetted pre-publication.{" "}
            <a className="text-accent underline underline-offset-2" href="https://x.com/seanmcdonaldxyz">
              x.com/seanmcdonaldxyz
            </a>
          </p>
        </footer>
      </article>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-16 border border-line bg-surface px-3 py-2">
      <div className="font-mono text-xs tracking-widest text-faint uppercase">{label}</div>
      <div className="font-mono text-sm text-fg tabular-nums">{value}</div>
    </div>
  );
}

function Slider({
  label,
  hint,
  min,
  max,
  step,
  value,
  digits = 2,
  onChange,
}: {
  label: string;
  hint?: string;
  min: number;
  max: number;
  step: number;
  value: number;
  digits?: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="grid gap-0.5">
      <span className="flex items-baseline justify-between gap-3 font-mono text-xs">
        <span className="text-fg">{label}</span>
        <span className="text-accent tabular-nums">{value.toFixed(digits)}</span>
      </span>
      {hint ? <span className="text-sm text-faint">{hint}</span> : null}
      <input
        className="ssg-range"
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        aria-label={label}
      />
    </label>
  );
}

function Meter({ label, value, mark }: { label: string; value: number; mark?: number }) {
  const width = `${Math.round(clamp01(value) * 100)}%`;
  return (
    <div className="grid gap-1">
      <div className="flex items-baseline justify-between font-mono text-xs">
        <span className="text-muted">{label}</span>
        <span className="text-fg tabular-nums">{value.toFixed(2)}</span>
      </div>
      <div className="relative h-1.5 bg-line">
        <div className="h-full bg-accent" style={{ width }} />
        {mark != null ? (
          <div
            className="absolute top-[-3px] h-3 w-px bg-fg"
            style={{ left: `${Math.round(clamp01(mark) * 100)}%` }}
          />
        ) : null}
      </div>
    </div>
  );
}

function Sparkline({ values }: { values: number[] }) {
  if (values.length < 2) {
    return <div className="h-12 font-mono text-xs text-faint">Waiting for the first basin.</div>;
  }
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = Math.max(0.04, max - min);
  const d = values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * 100;
      const y = 30 - ((value - min) / span) * 26;
      return `${index === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
  return (
    <svg viewBox="0 0 100 32" className="mt-1 h-12 w-full text-accent" role="img" aria-label="Energy over recent ticks">
      <path d={d} fill="none" stroke="currentColor" strokeWidth="1.4" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

function Tensor({ idn }: { idn: number[][] }) {
  return (
    <div className="mt-3 grid gap-3">
      {CHANNELS.map((channel, c) => (
        <div key={channel}>
          <p className="font-mono text-xs text-faint">{channel}</p>
          <div className="mt-1 grid grid-cols-2 gap-1">
            {TRAITS[c].map((trait, index) => {
              const value = idn[c]?.[index] ?? 0;
              return (
                <div
                  key={trait}
                  className="flex items-center justify-between gap-2 border border-line px-2 py-1"
                  style={{ background: `rgba(232, 160, 74, ${0.12 + value * 0.55})` }}
                  title={`${channel} ${trait}: ${value.toFixed(2)}`}
                >
                  <span className="font-mono text-xs text-fg">{trait}</span>
                  <span className="font-mono text-xs text-fg tabular-nums">{value.toFixed(2)}</span>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function Note({ k, title, body }: { k: string; title: string; body: string }) {
  return (
    <section className="border border-line bg-surface p-4">
      <p className="font-mono text-xs text-accent tabular-nums">{k}</p>
      <h3 className="mt-2 text-lg font-medium">{title}</h3>
      <p className="mt-2 text-sm text-pretty text-muted">{body}</p>
    </section>
  );
}

function clamp01(value: number) {
  if (Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(1, value));
}
