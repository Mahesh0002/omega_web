import { createFileRoute } from "@tanstack/react-router";
import { OmegaDiscovery } from "@/components/OmegaDiscovery";

export const Route = createFileRoute("/architecture")({
  head: () => ({
    meta: [
      { title: "Architecture — Project OMEGA" },
      {
        name: "description",
        content:
          "Neuro-Symbolic architecture of the OMEGA discovery engine: Trinity modules, Iron Dome dimensional pruning, and Protocol Zero.",
      },
    ],
  }),
  component: ArchitecturePage,
});

function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="!font-mono !text-[#00F0FF] !tracking-[0.15em] !uppercase !text-2xl !mt-16 !mb-4 border-b border-[#00F0FF]/20 pb-3">
      {children}
    </h2>
  );
}

function ArchitecturePage() {
  return (
    <main className="min-h-[calc(100vh-65px)] px-6 py-16 bg-[#0B0F19]">
      {/* ── Live model demo ── */}
      <div className="max-w-5xl mx-auto mb-16">
        <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-[#00F0FF]/70 mb-2">
          // Live Demo · Protocol Zero
        </p>
        <h2 className="font-mono text-2xl text-[#00F0FF] tracking-[0.1em] mb-6">
          Model in Action — 67-Token MCTS Discovery
        </h2>
        <OmegaDiscovery />
      </div>

      {/* ── Whitepaper ── */}
      <article className="prose prose-invert max-w-4xl mx-auto prose-p:text-slate-300 prose-p:leading-relaxed prose-strong:text-[#00F0FF] prose-strong:font-semibold">
        <p className="!font-mono !text-xs !tracking-[0.3em] !uppercase !text-[#00F0FF]/70 !mb-2">
          // Whitepaper · v10.1
        </p>
        <h1 className="!font-mono !text-[#00F0FF] !tracking-[0.1em] !text-4xl md:!text-5xl !mt-0 !mb-3 drop-shadow-[0_0_18px_rgba(0,240,255,0.35)]">
          Project OMEGA: The Sovereign Discovery Engine
        </h1>
        <p className="!text-slate-400 !italic !mt-0">
          A Neuro-Symbolic Architecture for Physics Discovery
        </p>

        <H2>1. The Epistemological Bottleneck</H2>
        <p>
          Modern Deep Learning is fundamentally flawed when applied to the physical sciences.
          Traditional architectures—such as standard Multi-Layer Perceptrons (MLPs)—are{" "}
          <strong>"Black Box"</strong> systems. They are universal function approximators
          designed to fit curves to data, but they lack an intrinsic understanding of the
          physical world.
        </p>
        <p>
          A standard neural network suffers from <strong>Dimensional Blindness</strong>. It
          cannot distinguish between spatial coordinates and temporal measurements, and will
          eagerly add meters to seconds if it mathematically reduces the loss landscape.
          Furthermore, when deep learning models extrapolate outside their training
          distribution, they suffer from "Neural Hallucinations," predicting states that
          violate the fundamental laws of conservation.
        </p>
        <p>
          Project OMEGA was built to solve this. It is a <strong>"White Box"</strong>{" "}
          Neuro-Symbolic Artificial Intelligence designed for Symbolic Regression. It does
          not just predict the next data point; it reverse-engineers the exact, interpretable
          mathematical laws governing a chaotic system from raw observational data.
        </p>

        <H2>2. The Trinity Architecture</H2>
        <p className="!text-slate-400 !italic">The Teacher–Student Paradigm</p>
        <p>
          At the core of Model Omega is an asynchronous, co-evolutionary loop divided into
          three distinct neural entities:
        </p>
        <p>
          <strong>The Explorer (The Brain):</strong> A Transformer-based Actor-Critic neural
          network combined with Monte Carlo Tree Search (MCTS). The Explorer treats
          mathematics as a language, predicting the probability distribution of the next
          logical operator (e.g., ADD, SIN, VAR_THETA). The MCTS uses the Upper Confidence
          Bound (UCB) formula to navigate the combinatorial explosion of mathematical
          sequences, balancing exploration and exploitation.
        </p>
        <p>
          <strong>The Alchemist (The Teacher):</strong> While the Explorer proposes
          structural skeletons (the "Syntax"), the Alchemist evaluates them. Using the L-BFGS
          (Limited-memory Broyden–Fletcher–Goldfarb–Shanno) algorithm with a Strong Wolfe
          Line Search, the Alchemist injects constants into the skeleton and fine-tunes them.
          It then grades the equation and returns a reward signal to train the Explorer via
          Proximal Policy Optimization (PPO).
        </p>
        <p>
          <strong>The Shadow (The Controller):</strong> A Meta-Controller that monitors the
          engine for stagnation. If the Explorer becomes trapped in a local optimum (e.g.,
          repeatedly generating minor variations of an inaccurate equation), the Shadow
          triggers a <strong>Chaos Event</strong>, injecting scaled Gaussian noise directly
          into the neural weights to force a paradigm shift in the search tree.
        </p>

        <H2>3. The Iron Dome</H2>
        <p className="!text-slate-400 !italic">Dimensional Analysis and Pruning</p>
        <p>
          To prevent the combinatorial explosion typical of MCTS, Model Omega employs a
          rigorous <strong>Censor</strong> mechanism.
        </p>
        <p>
          Before the Alchemist ever runs expensive gradient optimization on an equation, the
          Censor performs strict Dimensional Analysis. By tracking the physical units of
          variables (e.g., Velocity as <code className="text-[#FFB300]">[L^1, M^0, T^-1]</code>),
          the engine automatically shatters and prunes any MCTS branches that violate
          dimensional homogeneity. This cuts the active search space by orders of magnitude,
          allowing the engine to solve complex systems like the Double Pendulum with a
          fraction of the compute required by traditional evolutionary algorithms.
        </p>

        <H2>4. Protocol Zero</H2>
        <p className="!text-slate-400 !italic">Ascending the Complexity Ladder</p>
        <p>
          OMEGA scales using an elastic co-evolution algorithm known as{" "}
          <strong>Protocol Zero</strong>. Instead of attempting to solve a deeply chaotic
          system all at once, Protocol Zero isolates the strongest continuous force in the
          data, locks the corresponding equation segment, and subtracts it to find the
          residual <code className="text-[#FFB300]">(Residual = Target − Prediction)</code>.
          The engine then recursively launches new search trees on the residuals, stacking
          partial solutions until the chaotic system is fully deterministic.
        </p>
      </article>
    </main>
  );
}
