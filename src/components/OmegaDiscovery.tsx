import React, { useRef, useEffect } from "react";

const generateDataPoints = (count = 150) => {
  const points = [];
  for (let i = 0; i < count; i++) {
    points.push({
      id: i,
      x: 50 + Math.random() * 700,
      y: 50 + Math.random() * 400
    });
  }
  return points;
};

const generateTree = (nodeCount = 67) => {
  const nodes = [];
  const links = [];
  nodes.push({ id: 0, x: 400, y: 60, parentId: null });
  for (let i = 1; i < nodeCount; i++) {
    const parentId = Math.floor(i / 2);
    const parent = nodes[parentId];
    let x = parent.x + (Math.random() - 0.5) * 120;
    x = Math.max(80, Math.min(720, x));
    let y = parent.y + 50 + Math.random() * 30;
    y = Math.max(60, Math.min(440, y));
    nodes.push({ id: i, x, y, parentId });
    links.push({
      sourceId: parentId,
      targetId: i,
      x1: parent.x,
      y1: parent.y,
      x2: x,
      y2: y
    });
  }
  return { nodes, links };
};

const dataPoints = generateDataPoints(150);
const treeData = generateTree(67);

const generateCurvePath = (points) => {
  const sorted = [...points].sort((a, b) => a.x - b.x);
  const sampled = [];
  for (let i = 0; i < sorted.length; i += 10) {
    sampled.push(sorted[i]);
  }
  if (sampled.length === 0) return "";

  let d = `M ${sampled[0].x},${sampled[0].y}`;
  for (let i = 0; i < sampled.length - 1; i++) {
    const p0 = i === 0 ? sampled[0] : sampled[i - 1];
    const p1 = sampled[i];
    const p2 = sampled[i + 1];
    const p3 = i + 2 < sampled.length ? sampled[i + 2] : p2;

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
  }
  return d;
};

const curvePathString = generateCurvePath(dataPoints);

export function OmegaDiscovery() {
  const containerRef = useRef(null);
  const svgRef = useRef(null);
  const placardRef = useRef<HTMLDivElement>(null);
  const problemRef = useRef(null);
  const curveFitRef = useRef(null);
  const equationRef = useRef(null);
  const curveLengthRef = useRef(0);
  const tlRef = useRef(null);

  const dpRefs = useRef(new Array(150).fill(null));
  const nodeRefs = useRef(new Array(67).fill(null));
  const linkRefs = useRef(new Array(66).fill(null));

  useEffect(() => {
    let ctx;

    const initAnimation = () => {
      const gsap = window.gsap;
      if (!gsap) {
        console.error("GSAP not found on window object.");
        return;
      }

      const len = curveFitRef.current.getTotalLength() || 1000;
      curveLengthRef.current = len;

      gsap.set(curveFitRef.current, { strokeDasharray: len, strokeDashoffset: len });
      gsap.set(equationRef.current, { scale: 2, transformOrigin: "400px 250px" });

      ctx = gsap.context(() => {
        const tl = gsap.timeline({ paused: true });

        const updatePlacard = (msg: string, at: number) => {
          tl.call(() => {
            gsap.to(placardRef.current, {
              opacity: 0, duration: 0.1,
              onComplete: () => {
                if (placardRef.current) placardRef.current.innerHTML = msg;
                gsap.to(placardRef.current, { opacity: 1, duration: 0.2 });
              }
            });
          }, [], at);
        };

        // ACT 1 — Problem Statement (0s → 2s)
        updatePlacard("[SYSTEM] Booting...", 0);
        tl.to(problemRef.current, { opacity: 1, duration: 0.5, ease: "power2.out" }, 0);
        tl.to(problemRef.current, { opacity: 0, duration: 0.4, ease: "power2.in" }, 1.6);

        // ACT 2 — Raw Data (2s → 3.5s)
        updatePlacard("[DATA] Ingesting Chaotic Telemetry...", 2);
        tl.to(dpRefs.current, { opacity: 1, duration: 0.8, stagger: 0.006, ease: "power1.out" }, 2);

        // ACT 3 — MCTS Tree, first 30 nodes + links (3.5s → 5s)
        updatePlacard("[EXPLORER] Instantiating MCTS. Tracking Arity in O(1)...", 3.5);
        tl.to(linkRefs.current.slice(0, 30), { opacity: 1, duration: 0.8, stagger: 0.03, ease: "power2.out" }, 3.5);
        tl.to(nodeRefs.current.slice(0, 30), { opacity: 1, duration: 0.8, stagger: 0.03, ease: "power2.out" }, 3.5);

        // ACT 4 — Cache Hit (5s → 6.5s)
        updatePlacard("[ORACLE] CACHE HIT! Zobrist Hash found via Dynamic Programming. Reusing Sub-Graph.", 5);
        tl.to(nodeRefs.current.slice(10, 20), { fill: "#3B82F6", duration: 0.3 }, 5);
        tl.to(nodeRefs.current.slice(10, 20), { scale: 1.5, duration: 0.4, ease: "elastic.out(1, 0.5)", transformOrigin: "center center", stagger: 0.03 }, 5.3);
        tl.to(nodeRefs.current.slice(10, 20), { scale: 1, fill: "#6366f1", duration: 0.4 }, 5.8);

        // ACT 5 — Greedy Pruning (6.5s → 8s)
        updatePlacard("[CENSOR] VETO: Dimensional Mismatch (Meters + Seconds). Initiating Greedy Pruning...", 6.5);
        tl.to(linkRefs.current.slice(30, 66), { opacity: 1, duration: 0.3, stagger: 0.01 }, 6.5);
        tl.to(nodeRefs.current.slice(30, 67), { opacity: 1, duration: 0.3, stagger: 0.01 }, 6.65);
        tl.to(nodeRefs.current.slice(40, 67), { fill: "#FF2A2A", duration: 0.2 }, 7.0);
        tl.to(nodeRefs.current.slice(40, 67), { opacity: 0, duration: 0.5, stagger: 0.01, ease: "power3.in" }, 7.3);
        tl.to(linkRefs.current.slice(40, 66), { opacity: 0, duration: 0.5, stagger: 0.01, ease: "power3.in" }, 7.3);

        // ACT 6 — Convergence (8s → 10s)
        updatePlacard("[ALCHEMIST] Structure locked. L-BFGS Constant Optimization...", 8);
        tl.to(nodeRefs.current.slice(0, 40), { fill: "#FFB300", duration: 0.4, stagger: 0.01 }, 8);
        tl.to(nodeRefs.current.slice(0, 40), { scale: 1.2, duration: 0.3, ease: "power2.out", transformOrigin: "center center", stagger: 0.01 }, 8.5);
        tl.to(nodeRefs.current.slice(0, 40), { scale: 1, duration: 0.3 }, 9.0);
        tl.to(linkRefs.current.slice(0, 30), { stroke: "#FFB300", strokeWidth: 2.5, duration: 0.5 }, 8.2);

        // ACT 7 — Final State (10s → 15s → restart)
        updatePlacard("[SYSTEM] Phase Transition Reached.", 10);
        tl.to([...nodeRefs.current.slice(0, 40), ...linkRefs.current.slice(0, 30)], { opacity: 0, duration: 0.8, ease: "power2.in" }, 10);
        tl.to(dpRefs.current, { opacity: 0, duration: 0.8, ease: "power1.in" }, 10);
        tl.to(curveFitRef.current, { opacity: 1, strokeDashoffset: 0, duration: 1.2, ease: "power2.inOut" }, 11);
        tl.to(equationRef.current, { opacity: 1, scale: 1, duration: 0.8, ease: "back.out(1.7)", transformOrigin: "400px 250px" }, 12);
        tl.to([curveFitRef.current, equationRef.current], { opacity: 0, duration: 0.6, ease: "power2.inOut" }, 14);

        tl.call(() => {
          gsap.set(dpRefs.current, { opacity: 0 });
          gsap.set(nodeRefs.current, { opacity: 0, fill: "#6366f1", scale: 1 });
          gsap.set(linkRefs.current, { opacity: 0, stroke: "#6366f1", strokeWidth: 1.5 });
          gsap.set(curveFitRef.current, { opacity: 0, strokeDashoffset: curveLengthRef.current });
          gsap.set(equationRef.current, { opacity: 0, scale: 2 });
          if (placardRef.current) placardRef.current.innerHTML = "[SYSTEM] STANDBY";
          tlRef.current.restart();
        }, [], 15);

        tlRef.current = tl;
      }, containerRef);
    };

    if (window.gsap) {
      initAnimation();
    } else {
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js";
      script.onload = initAnimation;
      document.head.appendChild(script);
    }

    return () => {
      if (ctx) ctx.revert();
    };
  }, []);

  const handleRun = () => {
    if (tlRef.current) tlRef.current.restart();
  };

  return (
    <section ref={containerRef} className="relative px-6 md:px-10 pt-10 pb-20 max-w-6xl mx-auto">
      {/* HEADER SECTION AS REQUESTED */}
      {/* <div className="mb-6">
        <h1 className="font-mono text-3xl md:text-5xl tracking-[0.08em] text-slate-100">
          Project <span className="omega-text-cyan">OMEGA</span>:{" "}
          <span className="text-slate-300">Ascension Sequence</span>
        </h1>
        <p className="mt-3 font-mono text-xs md:text-sm tracking-[0.2em] uppercase text-slate-400">
          Neuro-Symbolic Discovery ·{" "}
          <span className="omega-text-cyan">Strange Attractor Telemetry</span>
        </p>
      </div> */}

      {/* GLOWING BORDER CONTAINER (THE SUB-WINDOW) */}
      <div className="relative rounded-xl overflow-hidden shadow-[0_0_40px_rgba(0,240,255,0.08)] border border-cyan-900/40 bg-[#0f172a] h-[600px] w-full">

        <svg ref={svgRef} viewBox="0 0 800 500" width="100%" height="100%">
          <rect width="800" height="500" fill="#0f172a" />

          <g id="data-points-group">
            {dataPoints.map((p, i) => (
              <circle
                key={`dp-${p.id}`}
                ref={(el) => { if (el) dpRefs.current[i] = el; }}
                cx={p.x}
                cy={p.y}
                r={3}
                fill="#22d3ee"
                opacity={0}
              />
            ))}
          </g>

          <g id="tree-links-group">
            {treeData.links.map((l, i) => (
              <line
                key={`link-${i}`}
                ref={(el) => { if (el) linkRefs.current[i] = el; }}
                x1={l.x1}
                y1={l.y1}
                x2={l.x2}
                y2={l.y2}
                stroke="#6366f1"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                opacity={0}
              />
            ))}
          </g>

          <g id="tree-nodes-group">
            {treeData.nodes.map((n, i) => (
              <circle
                key={`node-${n.id}`}
                ref={(el) => { if (el) nodeRefs.current[i] = el; }}
                cx={n.x}
                cy={n.y}
                r={6}
                fill="#6366f1"
                opacity={0}
              />
            ))}
          </g>

          <path
            id="curve-fit-path"
            ref={curveFitRef}
            d={curvePathString}
            stroke="#FFB300"
            strokeWidth={2}
            fill="none"
            opacity={0}
          />

          <text
            ref={equationRef}
            x={400}
            y={250}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={36}
            fontFamily="monospace"
            fill="#FFB300"
            opacity={0}
            style={{ transformOrigin: "400px 250px" }}
          >
            F = -g · sin(θ₁)
          </text>
        </svg>

        {/* OVERLAYS CONFINED TO THE SUB-WINDOW */}
        <div
          ref={problemRef}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            fontSize: 22,
            fontFamily: "monospace",
            color: "#22d3ee",
            textAlign: "center",
            opacity: 0,
            pointerEvents: "none",
            textShadow: "0 0 20px #22d3ee",
            zIndex: 10
          }}
        >
          Target Lock: 4D Double Pendulum Dynamics
        </div>

        <div
          ref={placardRef}
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            background: "rgba(15,23,42,0.75)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(34,211,238,0.3)",
            borderRadius: 8,
            padding: "12px 16px",
            fontFamily: "monospace",
            fontSize: 12,
            color: "#22d3ee",
            minWidth: 300,
            maxWidth: 420,
            zIndex: 10,
            boxShadow: "0 0 24px rgba(34,211,238,0.08)"
          }}
        >
          [SYSTEM] STANDBY
        </div>

        <button
          className="omega-btn"
          style={{
            position: "absolute",
            bottom: 24,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 10
          }}
          onClick={handleRun}
        >
          Run Grade 3 Evaluation
        </button>

      </div>
    </section>
  );
}
