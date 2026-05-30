import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/engineering")({
  head: () => ({
    meta: [
      { title: "Engineering Logs — Project OMEGA" },
      {
        name: "description",
        content:
          "Raw telemetry and architecture execution logs from Project OMEGA — the Iron Dome Stack Evaluator, Incremental Zobrist Hashing, and Run 044-OMEGA.",
      },
    ],
  }),
  component: EngineeringPage,
});

const telemetryLog = `[SYSTEM] Genesis Protocol Initiated. Universe set to Float64.
[SYSTEM] Target: Double_Pendulum_Chaotic_Friction.csv (4 Dimensions)
[SYSTEM] Initializing Trinity Modules...
[OK] Explorer (Actor-Critic LSTM) Online.
[OK] Alchemist (L-BFGS Optimizer) Online.
[OK] Shadow (Meta-Controller) Online.

[OMEGA v10.1] - Gen 1 | Acc: 0.00% | Paths: 200
[OMEGA v10.1] - Gen 2 | Acc: 0.00% | Paths: 500
[OMEGA v10.1] - Gen 3 | Acc: 0.00% | Paths: 800
...
[CENSOR] WARNING: Dimensional Violation at Node 14. Pruning Branch.
[CENSOR] WARNING: Dimensional Violation at Node 22. Pruning Branch.
...
[OMEGA v10.1] - Gen 6 | Acc: 0.00% | Paths: 1400 
[OMEGA v10.1] - Gen 7 | Acc: 36.96% | Paths: 1600  <-- SIGNAL ACQUIRED
[OMEGA v10.1] - Gen 8 | Acc: 41.20% | Paths: 1800 
...
[SHADOW] Stagnation detected. Irradiating LSTM weights. Expanding search.
...
[OMEGA v10.1] - Gen 24 | Acc: 58.12% | Paths: 4200
[ALCHEMIST] Commencing Deep Stack Optimization (L-BFGS)...
[ALCHEMIST] Constants fine-tuned. Loss threshold breached.

[SYSTEM] PHASE TRANSITION REACHED.
[SYSTEM] Final R-Squared: 0.6014
[SYSTEM] Sequence Token Count: 67
[OUTPUT] Structural Core Frozen. Reinforcement Learning Initiated.`;

function EngineeringPage() {
  return (
    <main className="min-h-[calc(100vh-65px)] px-6 py-16">
      <article className="prose prose-invert max-w-4xl mx-auto prose-headings:font-mono prose-headings:tracking-wide prose-h1:omega-text-cyan prose-h2:omega-text-gold prose-strong:omega-text-cyan">
        <h1>The Engineering Reality: Building for Scale</h1>
        <p className="!text-slate-400 !font-mono !text-sm uppercase tracking-[0.25em]">
          Raw Telemetry &amp; Architecture Execution Logs
        </p>

        <p>
          Building a theoretical Neuro-Symbolic engine is only half the battle.
          Executing a 67-token deep mathematical Abstract Syntax Tree (AST)
          millions of times per second requires ruthless hardware optimization.
          Standard Python <code>exec()</code> commands or naive recursive tree
          evaluations would instantly bottleneck the GPU.
        </p>

        <h2>1. The "Iron Dome" Stack Evaluator</h2>
        <p>
          To achieve zero-latency mathematical discovery, Model Omega bypasses
          standard string compilation entirely. The AST is evaluated using a
          custom, dynamic PyTorch Stack Evaluator (The "Iron Dome"). By
          utilizing <strong>O(1) Arity Tracking</strong>, the engine pushes and
          pops tensor operations safely, allowing for deeply nested mathematics
          while natively maintaining the PyTorch computational graph for
          flawless backward gradient flow.
        </p>

        <h2>2. Incremental Zobrist Hashing</h2>
        <p>
          During the Monte Carlo Tree Search (MCTS), the AI explores millions of
          potential equations. To prevent the engine from re-evaluating known
          dead-ends (or mathematically identical structures), Model Omega
          utilizes an <strong>Incremental Zobrist Hashing</strong> algorithm.
          Instead of hashing the entire sequence from scratch at every step, the
          system uses binary XOR properties to update the hash state in O(1)
          time, allowing the Topological Compass to navigate the infinite math
          maze with near-zero compute overhead.
        </p>

        <h2>Phase Transition: The Grade 3 Boss Fight</h2>
        <p>
          The following logs capture the exact moment Model Omega was deployed
          against the telemetry of a chaotic 4-dimensional Double Pendulum.
        </p>
        <p>
          The objective was not to artificially fit a perfect curve, but to
          force the AI to discover the dominant physical forces amidst chaotic
          noise. The logs demonstrate the engine actively wrestling with the
          search space before hitting a "Phase Transition"—generating a massive
          67-token equation that achieved a stable R² = 0.60.
        </p>

        <h2 className="!mb-4">System Telemetry: Run 044-OMEGA</h2>
      </article>

      <div className="max-w-4xl mx-auto mt-6">
        <div className="bg-black border border-cyan-500/50 rounded-lg shadow-[0_0_15px_rgba(0,240,255,0.2)] overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2 border-b border-cyan-500/30 bg-black/80">
            <span className="w-3 h-3 rounded-full bg-[#FF2A2A]/80" />
            <span className="w-3 h-3 rounded-full bg-[#FFB300]/80" />
            <span className="w-3 h-3 rounded-full bg-[#00F0FF]/80" />
            <span className="ml-3 font-mono text-xs text-cyan-400/70 tracking-widest uppercase">
              bash — omega@iron-dome ~ run_044
            </span>
          </div>
          <pre className="font-mono text-cyan-400 text-sm p-6 overflow-x-auto whitespace-pre leading-relaxed">
            {telemetryLog}
          </pre>
        </div>
      </div>
    </main>
  );
}
