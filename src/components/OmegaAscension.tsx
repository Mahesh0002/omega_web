import { useEffect, useMemo, useRef } from "react";
import { gsap } from "gsap";

type Role = "root" | "explorer" | "candidate" | "cache" | "pruned" | "solution";
const ROLE_COLOR: Record<Role, string> = {
  root: "#FFB300", explorer: "#00F0FF", candidate: "#4ade80",
  cache: "#3B82F6", pruned: "#FF2A2A", solution: "#FFD700",
};

// RK4 pendulum — returns 120 signal points mapped to full canvas
function pendulumPts(): { x: number; y: number }[] {
  const g = 9.81, mu = 0.15, dt = 0.06;
  const D = (s: number[]) => {
    const [t1, w1, t2, w2] = s, d = t2 - t1;
    const d1 = (2 - Math.cos(2 * d));
    const a1 = (-g * 2 * Math.sin(t1) - g * Math.sin(t1 - 2 * t2) - 2 * Math.sin(d) * (w2 * w2 + w1 * w1 * Math.cos(d)) - mu * w1) / d1;
    const a2 = (2 * Math.sin(d) * (w1 * w1 * 2 + g * 2 * Math.cos(t1) + w2 * w2 * Math.cos(d)) - mu * w2) / d1;
    return [w1, a1, w2, a2];
  };
  const rk = (s: number[]) => {
    const k1 = D(s), k2 = D(s.map((v, i) => v + dt / 2 * k1[i]));
    const k3 = D(s.map((v, i) => v + dt / 2 * k2[i])), k4 = D(s.map((v, i) => v + dt * k3[i]));
    return s.map((v, i) => v + dt / 6 * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]));
  };
  let s = [2.1, 0, -1.5, 0.3];
  const raw: number[][] = [];
  for (let i = 0; i < 120; i++) { raw.push([s[0], s[2]]); s = rk(s); }
  const xs = raw.map(p => p[0]), ys = raw.map(p => p[1]);
  const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  return raw.map(p => ({
    x: 10 + ((p[0] - x0) / (x1 - x0 || 1)) * 80,
    y: 10 + ((p[1] - y0) / (y1 - y0 || 1)) * 80,
  }));
}

// 280 noise points scattered in same region
function noisePts(): { x: number; y: number }[] {
  const pts = [];
  // pseudo-random using sin for determinism
  for (let i = 0; i < 280; i++) {
    const seed = Math.sin(i * 127.1) * 43758.5453;
    const r = seed - Math.floor(seed);
    const seed2 = Math.sin(i * 311.7) * 43758.5453;
    const r2 = seed2 - Math.floor(seed2);
    pts.push({ x: 5 + r * 90, y: 5 + r2 * 90 });
  }
  return pts;
}

// Build exploration tree directly on the scattered points
function buildExploration(signal: { x: number; y: number }[], noise: { x: number; y: number }[]) {
  const PHYSICS_TERMS = ["sin(θ₁)", "cos(θ₂)", "ω₁²", "θ₁'", "g/L", "μ·ω₂", "θ₁·θ₂", "tan(θ₁)"];
  const spineIdx: number[] = [];
  for (let i = 0; i <= 110; i += 10) spineIdx.push(i);
  const steps: any[] = [];
  const edges: any[] = [];

  for (let li = 0; li < spineIdx.length - 1; li++) {
    const currIdx = spineIdx[li];
    const nextIdx = spineIdx[li + 1];
    const currPt = signal[currIdx];
    const nextPt = signal[nextIdx];

    // Find nearby noise points to evaluate as branches
    const nearbyNoise = noise
      .map((pt, idx) => ({ idx, dist: Math.hypot(pt.x - currPt.x, pt.y - currPt.y) }))
      .filter(e => e.dist > 3 && e.dist < 16) // ensure they are close but not overlapping
      .sort((a, b) => a.dist - b.dist)
      .slice(0, 4);

    const branches = nearbyNoise.map((nb, bi) => {
      const q = noise[nb.idx];
      const role = bi === 1 ? "cache" : "pruned"; // Make one a cache hit, rest pruned
      const edgeId = `eb_${li}_${bi}`;
      const term = PHYSICS_TERMS[Math.floor(Math.random() * PHYSICS_TERMS.length)];
      edges.push({ id: edgeId, x1: currPt.x, y1: currPt.y, x2: q.x, y2: q.y, spine: false });
      return { index: nb.idx, role, edgeId, pt: q, term };
    });

    const spineEdgeId = `es_${li}`;
    edges.push({ id: spineEdgeId, x1: currPt.x, y1: currPt.y, x2: nextPt.x, y2: nextPt.y, spine: true });

    steps.push({
      curr: { index: currIdx, pt: currPt },
      next: { index: nextIdx, pt: nextPt, edgeId: spineEdgeId },
      branches
    });
  }
  return { steps, edges };
}

// Predicted curve — proper Catmull-Rom spline through every 4th signal point
function buildCurve(signal: { x: number; y: number }[]): string {
  const s = signal.filter((_, i) => i % 4 === 0);
  if (s.length < 2) return "";
  let d = `M${s[0].x.toFixed(2)},${s[0].y.toFixed(2)}`;
  for (let i = 1; i < s.length; i++) {
    const p0 = s[Math.max(i - 2, 0)];
    const p1 = s[i - 1];
    const p2 = s[i];
    const p3 = s[Math.min(i + 1, s.length - 1)];
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C${cp1x.toFixed(2)},${cp1y.toFixed(2)} ${cp2x.toFixed(2)},${cp2y.toFixed(2)} ${p2.x.toFixed(2)},${p2.y.toFixed(2)}`;
  }
  return d;
}

export default function OmegaAscension() {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const worldRef = useRef<SVGGElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const narRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const termRef = useRef<HTMLDivElement>(null);
  const confRef = useRef<HTMLDivElement>(null);
  const r2Ref = useRef<HTMLSpanElement>(null);
  const eqRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<SVGTextElement>(null);

  const signal = useMemo(() => pendulumPts(), []);
  const noise = useMemo(() => noisePts(), []);
  const exploration = useMemo(() => buildExploration(signal, noise), [signal, noise]);
  const curve = useMemo(() => buildCurve(signal), [signal]);

  const ROWS = [
    "t=0.000  θ₁= 2.100  θ₂=-1.500  ω₁= 0.000  ω₂= 0.300",
    "t=0.060  θ₁= 2.099  θ₂=-1.481  ω₁=-0.041  ω₂= 0.628",
    "t=0.120  θ₁= 2.094  θ₂=-1.443  ω₁=-0.162  ω₂= 0.912",
    "t=0.180  θ₁= 2.083  θ₂=-1.390  ω₁=-0.358  ω₂= 1.101",
    "t=0.240  θ₁= 2.062  θ₂=-1.328  ω₁=-0.611  ω₂= 1.172",
    "t=0.300  θ₁= 2.029  θ₂=-1.261  ω₁=-0.901  ω₂= 1.109",
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      const nar = (t: string) => { if (narRef.current) narRef.current.textContent = t; };

      // ── Initial hidden state ──
      gsap.set(".om-noise", { opacity: 0, scale: 1, transformOrigin: "center center" });
      gsap.set(".om-signal", { opacity: 0, scale: 0, transformOrigin: "center center" });
      gsap.set(".om-edge", { opacity: 0 });
      gsap.set(".om-placard", { opacity: 0 });
      gsap.set(worldRef.current, { x: 0, y: 0, scale: 1, transformOrigin: "0px 0px" });
      gsap.set([titleRef.current, termRef.current, confRef.current, eqRef.current, badgeRef.current], { opacity: 0 });
      gsap.set(".om-eq-term", { opacity: 0, y: 4 });
      gsap.set(".om-term-row", { opacity: 0, x: -8 });

      const curveEl = svgRef.current?.querySelector<SVGPathElement>("#om-curve");
      const cLen = curveEl?.getTotalLength() ?? 500;
      if (curveEl) gsap.set(curveEl, { strokeDasharray: cLen, strokeDashoffset: cLen, opacity: 0 });

      const tl = gsap.timeline({ paused: true });

      // ACT 1 — 0-3s Problem
      tl.call(() => nar("[SYSTEM] Target: Double Pendulum with friction μ=0.15 · 4D phase space"), [], 0);
      tl.to(titleRef.current, { opacity: 1, duration: 0.6 }, 0.2);
      tl.to(titleRef.current, { opacity: 0, duration: 0.5 }, 2.3);

      // ACT 2 — 3-6s Telemetry
      tl.call(() => nar("[DATA] Ingesting raw telemetry · 120 phase-space observations"), [], 3);
      tl.to(termRef.current, { opacity: 1, duration: 0.4 }, 3);
      tl.to(".om-term-row", { opacity: 1, x: 0, duration: 0.25, stagger: 0.28 }, 3.2);
      tl.to(termRef.current, { opacity: 0, duration: 0.5 }, 5.5);

      // ACT 3 — 6-9s Scatter all points
      tl.call(() => nar("[DATA] Projecting 400-point observation cloud onto phase space..."), [], 6);
      tl.to(".om-noise", { opacity: 0.15, duration: 0.8, stagger: { each: 0.003, from: "random" } }, 6);
      tl.to(".om-signal", { opacity: 0.7, scale: 1, duration: 0.4, ease: "back.out(1.5)", stagger: { each: 0.012, from: "random" } }, 6.5);

      // ACT 4 — 9-11s Highlight 120 real points
      tl.call(() => nar("[TARGET] Real trajectory extracted · 120 signal points identified"), [], 9);
      tl.to(".om-signal", { fill: "#FFB300", scale: 1.3, duration: 0.5, stagger: 0.006, ease: "power2.out" }, 9);
      tl.to(".om-signal", { scale: 1, duration: 0.3 }, 9.8);

      // ACT 5 — 11-14s Dim everything, root appears
      tl.call(() => nar("[EXPLORER] Suppressing noise · isolating trajectory root node"), [], 11);
      tl.to(".om-noise", { opacity: 0.05, duration: 0.8 }, 11);
      tl.to(".om-signal", { fill: "#334155", opacity: 0.2, duration: 0.8 }, 11);

      const root = signal[0];
      tl.to("#sig-0", { fill: ROLE_COLOR.root, opacity: 1, scale: 1.5, duration: 0.5, ease: "elastic.out(1,0.5)" }, 12);
      tl.to("#sig-0", { scale: 1.3, duration: 0.4 }, 12.6);
      tl.to(badgeRef.current, { opacity: 1, duration: 0.4 }, 12.7);

      // ACT 6 — 14-30s Zoom in on root + whip pan through spine
      tl.call(() => nar("[EXPLORER] Entering hypothesis space · MCTS expanding from data root"), [], 14);
      tl.to(worldRef.current, { scale: 2, x: 50 - root.x * 2, y: 50 - root.y * 2, duration: 1, ease: "sine.inOut" }, 14);
      tl.to(badgeRef.current, { opacity: 0, duration: 0.3 }, 14);

      const levelNar = [
        "[EXPLORER] Branching hypotheses · evaluating sin(θ₁), cos(θ₁), ω₁²...",
        "[ORACLE] CACHE HIT · Zobrist hash match · reusing sub-graph",
        "[CENSOR] Dimensional violation · branch pruned",
        "[EXPLORER] Convergence narrowing · dominant force emerging",
        "[ORACLE] Second cache hit · force symmetry confirmed",
        "[CENSOR] Non-conservative term rejected · energy violation",
        "[ALCHEMIST] Gravity term locked · g/l ratio stable",
        "[EXPLORER] Friction coupling detected · μ·ω₁ pattern emerges",
        "[ALCHEMIST] L-BFGS constants locking in · μ=0.15 confirmed",
        "[EXPLORER] Leaf node reached · path confirmed",
        "[SYSTEM] Final token: 67-token equation complete",
      ];

      // Pre-collect element refs once to avoid 4,400 DOM queries during the loop
      const sigEls = signal.map((_, i) => document.querySelector(`#sig-${i}`));
      const nzEls = noise.map((_, i) => document.querySelector(`#nz-${i}`));

      const stepDurations = [5.0, 4.5, 4.0, 3.5, 3.0, 0.8, 0.5, 0.4, 0.35, 0.3, 0.3];
      let cursor = 15.5;

      exploration.steps.forEach((step, li) => {
        const stepDuration = stepDurations[li] ?? 0.3;

        const fx = step.curr.pt.x, fy = step.curr.pt.y;
        const baseT = cursor;

        // Smooth pan — minimum 0.5s so fast steps still glide
        const panDur = Math.max(stepDuration * 0.6, 0.5);
        tl.to(worldRef.current, { x: 50 - fx * 2, y: 50 - fy * 2, duration: panDur, ease: "sine.inOut" }, baseT);
        tl.call(() => nar(levelNar[li] ?? levelNar[levelNar.length - 1]), [], baseT);

        // Update focus blur using pre-collected refs
        tl.call(() => {
          sigEls.forEach((el, i) => {
            if (!el) return;
            const dist = Math.hypot(signal[i].x - fx, signal[i].y - fy);
            gsap.to(el, { opacity: dist < 12 ? 0.95 : dist < 25 ? 0.35 : 0.04, duration: stepDuration * 0.8 });
          });
          nzEls.forEach((el, i) => {
            if (!el) return;
            const dist = Math.hypot(noise[i].x - fx, noise[i].y - fy);
            gsap.to(el, { opacity: dist < 12 ? 0.6 : dist < 25 ? 0.15 : 0.01, duration: stepDuration * 0.8 });
          });
        }, [], baseT);

        // Edges fan out
        const allEdgeIds = step.branches.map((b: any) => `#ed-${b.edgeId}`).concat(`#ed-${step.next.edgeId}`);
        tl.to(allEdgeIds.join(","), { opacity: 0.6, strokeDashoffset: 0, duration: stepDuration * 0.3 }, baseT + stepDuration * 0.1);

        // Highlight branch targets (noise points)
        const branchIds = step.branches.map((b: any) => `#nz-${b.index}`);
        if (branchIds.length) {
          tl.to(branchIds.join(","), { fill: ROLE_COLOR.candidate, scale: 1.5, opacity: 1, duration: stepDuration * 0.15, ease: "back.out(1.5)" }, baseT + stepDuration * 0.1);
        }

        // Show placards
        const placardIds = step.branches.map((b: any) => `#pl-${b.edgeId}`);
        if (placardIds.length) {
          tl.to(placardIds.join(","), { opacity: 0.9, y: "-1", duration: stepDuration * 0.2 }, baseT + stepDuration * 0.1);
        }

        // Highlight next spine node
        tl.to(`#sig-${step.next.index}`, { fill: ROLE_COLOR.candidate, scale: 1.4, opacity: 1, duration: stepDuration * 0.15, ease: "back.out(1.5)" }, baseT + stepDuration * 0.1);

        // Pruned branches die
        const pruned = step.branches.filter((b: any) => b.role === "pruned");
        if (pruned.length > 0) {
          const prunedIds = pruned.map((b: any) => `#nz-${b.index}`);
          tl.to(prunedIds.join(","), { fill: ROLE_COLOR.pruned, scale: 1.5, duration: stepDuration * 0.15, ease: "power2.out" }, baseT + stepDuration * 0.4);
          tl.to(prunedIds.join(","), { fill: "#1e3a4a", scale: 1, duration: stepDuration * 0.2, ease: "power2.in" }, baseT + stepDuration * 0.6);
          const prunedEdges = pruned.map((b: any) => `#ed-${b.edgeId}`);
          tl.to(prunedEdges.join(","), { stroke: ROLE_COLOR.pruned, opacity: 0, duration: stepDuration * 0.2 }, baseT + stepDuration * 0.4);

          const prunedPlacards = pruned.map((b: any) => `#pl-${b.edgeId}`);
          tl.call(() => {
            prunedPlacards.forEach((id: string) => {
              const el = document.querySelector(id);
              if (el) el.textContent = "[PRUNED]";
            });
          }, [], baseT + stepDuration * 0.35);
          tl.to(prunedPlacards.join(","), { fill: ROLE_COLOR.pruned, opacity: 0, duration: stepDuration * 0.25 }, baseT + stepDuration * 0.4);
        }

        // Cache nodes pulse
        const cache = step.branches.filter((b: any) => b.role === "cache");
        if (cache.length > 0) {
          const cacheIds = cache.map((b: any) => `#nz-${b.index}`);
          tl.to(cacheIds.join(","), { fill: ROLE_COLOR.cache, scale: 1.5, duration: stepDuration * 0.2, ease: "elastic.out(1,0.5)" }, baseT + stepDuration * 0.4);
          tl.to(cacheIds.join(","), { scale: 1.2, duration: stepDuration * 0.2 }, baseT + stepDuration * 0.6);
          const cacheEdges = cache.map((b: any) => `#ed-${b.edgeId}`);
          tl.to(cacheEdges.join(","), { stroke: ROLE_COLOR.cache, opacity: 0.2, duration: stepDuration * 0.2 }, baseT + stepDuration * 0.4);

          const cachePlacards = cache.map((b: any) => `#pl-${b.edgeId}`);
          tl.call(() => {
            cachePlacards.forEach((id: string) => {
              const el = document.querySelector(id);
              if (el) el.textContent = "[CACHE HIT]";
            });
          }, [], baseT + stepDuration * 0.35);
          tl.to(cachePlacards.join(","), { fill: ROLE_COLOR.cache, duration: stepDuration * 0.2 }, baseT + stepDuration * 0.4);
          tl.to(cachePlacards.join(","), { opacity: 0, duration: stepDuration * 0.2 }, baseT + stepDuration * 0.6);
        }

        // Next spine node confirmed
        tl.to(`#sig-${step.next.index}`, { fill: ROLE_COLOR.explorer, scale: 1.5, duration: stepDuration * 0.2, ease: "back.out(1.5)" }, baseT + stepDuration * 0.7);
        tl.to(`#sig-${step.next.index}`, { scale: 1.3, duration: stepDuration * 0.3 }, baseT + stepDuration * 0.9);
        tl.to(`#ed-${step.next.edgeId}`, { stroke: ROLE_COLOR.explorer, strokeWidth: 0.4, opacity: 1, duration: stepDuration * 0.3 }, baseT + stepDuration * 0.7);

        // Locked placard
        tl.to(`#pl-spine-${step.next.edgeId}`, { opacity: 0.9, y: "-1", duration: stepDuration * 0.2 }, baseT + stepDuration * 0.7);
        tl.to(`#pl-spine-${step.next.edgeId}`, { opacity: 0, duration: stepDuration * 0.2 }, baseT + stepDuration * 0.9);

        cursor += stepDuration;
      });

      // Zoom out — timing derived from cursor so it always follows the last exploration step
      const zoomOutAt = cursor + 0.5;
      tl.call(() => nar("[ALCHEMIST] Structure locked · zooming out · full trajectory visible"), [], zoomOutAt);
      tl.to(worldRef.current, { scale: 1, x: 0, y: 0, duration: 1.4, ease: "power2.inOut" }, zoomOutAt);
      tl.to(".om-placard", { opacity: 0, duration: 0.4 }, zoomOutAt);

      // Restore scatter visibility
      tl.to(".om-signal", { opacity: 0.5, fill: "#FFB300", scale: 1, duration: 0.8 }, zoomOutAt + 0.5);
      tl.to(".om-noise", { opacity: 0.05, fill: "#1e3a4a", scale: 1, duration: 0.8 }, zoomOutAt + 0.5);

      // Spine path turns gold
      tl.to(".om-edge-spine", { strokeWidth: 0.4, opacity: 1, stroke: "#FFD700", duration: 0.8 }, zoomOutAt + 1.5);

      // ACT 7 — Solution node pulse
      const solutionAt = zoomOutAt + 3;
      tl.call(() => nar("[SYSTEM] Leaf confirmed · L-BFGS optimization complete"), [], solutionAt);
      const lastSpineIdx = exploration.steps[exploration.steps.length - 1].next.index;
      tl.to(`#sig-${lastSpineIdx}`, { scale: 2.0, fill: ROLE_COLOR.solution, duration: 0.5, ease: "elastic.out(1,0.4)" }, solutionAt);
      tl.to(`#sig-${lastSpineIdx}`, { scale: 1.5, duration: 0.4 }, solutionAt + 0.6);

      // ACT 8 — Draw predicted curve + show residuals
      const curveAt = solutionAt + 2;
      tl.call(() => nar("[ORACLE] Overlaying predicted path · computing residuals..."), [], curveAt);
      tl.to(".om-signal", { opacity: 0.25, fill: "#94a3b8", duration: 0.6 }, curveAt);
      if (curveEl) tl.to(curveEl, { strokeDashoffset: 0, opacity: 1, duration: 1.8, ease: "power2.inOut" }, curveAt + 0.5);

      // Residual lines
      tl.to(".om-residual", { opacity: 1, duration: 0.3, stagger: 0.1 }, curveAt + 2.5);
      tl.to(".om-residual", { opacity: 0, duration: 0.5, stagger: 0.05 }, curveAt + 3.5);

      // ACT 9 — Confidence + Equation (timing follows curveAt)
      const eqAt = curveAt + 5;
      tl.call(() => nar("[SYSTEM] Governing law discovered · Run 044-OMEGA complete"), [], eqAt);
      tl.to(confRef.current, { opacity: 1, duration: 0.5 }, eqAt);
      const obj = { v: 0 };
      tl.to(obj, {
        v: 97.33, duration: 2.2, ease: "power1.out",
        onUpdate: () => { if (r2Ref.current) r2Ref.current.textContent = obj.v.toFixed(2); }
      }, eqAt + 0.3);
      // Reveal container then stagger terms in
      tl.to(eqRef.current, { opacity: 1, duration: 0.4 }, eqAt + 2.5);
      tl.to(".om-eq-term", { opacity: 1, y: 0, duration: 0.4, ease: "back.out(1.5)", stagger: 0.3 }, eqAt + 2.8);

      tlRef.current = tl;
    }, containerRef);
    return () => ctx.revert();
  }, [signal, noise, exploration, curve]);

  const run = () => tlRef.current?.restart();

  // Pre-compute 5 residual sample lines
  const residuals = useMemo(() => [20, 35, 50, 65, 80].map(i => ({
    x1: signal[i].x, y1: signal[i].y,
    x2: signal[i].x + (signal[(i + 5) % 120].x - signal[i].x) * 0.4,
    y2: signal[i].y + (signal[(i + 5) % 120].y - signal[i].y) * 0.4,
  })), [signal]);

  return (
    <div ref={containerRef} className="relative w-full bg-[#020817] border border-cyan-900/40 rounded-xl overflow-hidden" style={{ height: 640 }}>

      {/* Narrative */}
      <div className="absolute top-0 inset-x-0 z-20 bg-black/70 border-b border-cyan-900/40 px-4 py-2">
        <div ref={narRef} className="font-mono text-[11px] text-cyan-400 tracking-wide">[SYSTEM] Awaiting Protocol Zero…</div>
      </div>

      {/* SVG */}
      <svg ref={svgRef} viewBox="0 0 100 100" width="100%" height="100%" className="absolute inset-0"
        style={{ paddingTop: 32 }}>
        <defs>
          <filter id="glow-sm"><feGaussianBlur stdDeviation="0.4" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
          <radialGradient id="bgr" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="#00F0FF" stopOpacity="0.03" />
            <stop offset="100%" stopColor="#020817" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="100" height="100" fill="url(#bgr)" />

        <g ref={worldRef}>
          {/* Depth Grid
          <g stroke="#1e3a4a" strokeWidth="0.15" opacity="0.3">
            {Array.from({ length: 21 }).map((_, i) => (
              <line key={`v${i}`} x1={i * 5} y1="0" x2={i * 5} y2="100" />
            ))}
            {Array.from({ length: 21 }).map((_, i) => (
              <line key={`h${i}`} x1="0" y1={i * 5} x2="100" y2={i * 5} />
            ))}
          </g> */}

          {/* Edges */}
          {exploration.edges.map(e => {
            const len = Math.hypot(e.x2 - e.x1, e.y2 - e.y1) + 2;
            return (
              <line key={e.id} id={`ed-${e.id}`}
                className={e.spine ? "om-edge om-edge-spine" : "om-edge"}
                x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2}
                stroke="#475569"
                strokeWidth={e.spine ? 0.25 : 0.12}
                strokeDasharray={len} strokeDashoffset={len}
                strokeLinecap="round" opacity={0} />
            );
          })}

          {/* Noise points */}
          {noise.map((p, i) => (
            <circle key={i} id={`nz-${i}`} className="om-noise"
              cx={p.x} cy={p.y} r={0.5} fill="#1e3a4a" opacity={0} />
          ))}

          {/* Signal points (real trajectory) */}
          {signal.map((p, i) => (
            <circle key={i} id={`sig-${i}`} className="om-signal"
              cx={p.x} cy={p.y} r={0.9} fill="#00F0FF"
              filter="url(#glow-sm)" opacity={0} />
          ))}

          {/* Predicted curve */}
          <path id="om-curve" d={curve} fill="none" stroke="#FFD700" strokeWidth="0.5"
            strokeLinecap="round" opacity={0} style={{ filter: "drop-shadow(0 0 1px #FFD700)" }} />

          {/* Residual lines */}
          {residuals.map((r, i) => (
            <line key={i} className="om-residual"
              x1={r.x1} y1={r.y1} x2={r.x2} y2={r.y2}
              stroke="#FF2A2A" strokeWidth="0.4" strokeDasharray="0.6 0.6" opacity={0} />
          ))}

          {/* Root badge — anchored to signal[0] in SVG space, scales with zoom */}
          <text ref={badgeRef} id="om-root-badge" className="om-placard pointer-events-none"
            x={signal[0].x + 2} y={signal[0].y - 2.5}
            fontSize="2" fontFamily="monospace" fill="#FFB300" opacity={0}
            style={{ textShadow: "0px 0px 2px #000" }}>
            Ω ROOT · signal[0]
          </text>

          {/* Placards */}
          {exploration.steps.map((step: any, stepIdx: number) => (
            <g key={`pl-${stepIdx}`}>
              {step.branches.map((b: any) => (
                <text key={b.edgeId} id={`pl-${b.edgeId}`} className="om-placard pointer-events-none"
                  x={b.pt.x + 1} y={b.pt.y - 1} fontSize="1.8" fontFamily="monospace" fill="#4ade80" opacity={0}
                  style={{ textShadow: "0px 0px 1px #000, 0px 0px 2px #000" }}>
                  [EVAL: {b.term}]
                </text>
              ))}
              <text id={`pl-spine-${step.next.edgeId}`} className="om-placard pointer-events-none"
                x={step.next.pt.x + 1.5} y={step.next.pt.y - 1} fontSize="1.8" fontFamily="monospace" fill="#00F0FF" opacity={0}
                style={{ textShadow: "0px 0px 1px #000, 0px 0px 2px #000" }}>
                [LOCKED]
              </text>
            </g>
          ))}
        </g>
      </svg>

      {/* Problem title */}
      <div ref={titleRef} className="absolute z-10 inset-0 flex items-center justify-center opacity-0 pointer-events-none">
        <div className="text-center">
          <p className="font-mono text-2xl font-bold text-cyan-200 tracking-widest" style={{ textShadow: "0 0 28px rgba(34,211,238,0.7)" }}>
            Double Pendulum Under Friction
          </p>
          <p className="font-mono text-xs text-cyan-500/80 mt-2 tracking-wider">μ = 0.15 · 4D Phase Space · 120 observations</p>
        </div>
      </div>

      {/* Terminal */}
      <div ref={termRef} className="absolute z-10 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/85 backdrop-blur border border-cyan-700/40 rounded-lg px-5 py-4 opacity-0 min-w-[400px]">
        <p className="font-mono text-[10px] text-cyan-700 mb-2">// telemetry stream</p>
        {ROWS.map((r, i) => <div key={i} className="om-term-row font-mono text-[11px] text-cyan-300 leading-5 whitespace-pre">{r}</div>)}
      </div>

      {/* Confidence */}
      <div ref={confRef} className="absolute z-10 left-1/2 -translate-x-1/2 bottom-24 opacity-0 font-mono text-sm text-cyan-300 bg-black/80 border border-cyan-700/40 rounded px-4 py-1">
        R² = <span ref={r2Ref}>0.00</span>%
      </div>

      {/* Equation — term-by-term reveal */}
      <div ref={eqRef} className="absolute z-10 left-1/2 -translate-x-1/2 bottom-36 font-mono text-base text-amber-300 bg-black border border-amber-500/50 rounded-lg px-5 py-2 shadow-[0_0_28px_rgba(255,179,0,0.3)] flex gap-1 items-baseline">
        {["θ₁''", "=", "−(g/l)·sin(θ₁)", "−", "μ·ω₁"].map((term, i) => (
          <span key={i} className="om-eq-term" style={{ opacity: 0, transform: "translateY(4px)", display: "inline-block" }}>{term}</span>
        ))}
      </div>

      {/* Button */}
      <button onClick={run} className="absolute z-20 left-1/2 -translate-x-1/2 bottom-4 font-mono text-xs text-cyan-300 bg-transparent border border-cyan-500/60 px-6 py-2 rounded tracking-widest hover:bg-cyan-500/10 transition-all">
        Run Model Omega
      </button>
    </div>
  );
}
