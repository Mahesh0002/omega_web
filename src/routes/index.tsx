import { createFileRoute } from "@tanstack/react-router";
import OmegaAscension from "@/components/OmegaAscension";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Project OMEGA — Sovereign Discovery Engine" },
      {
        name: "description",
        content:
          "Watch Project OMEGA discover physics from chaotic double-pendulum telemetry via 67-token MCTS reasoning.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main className="min-h-[calc(100vh-65px)] px-6 md:px-10 pt-10 pb-20 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="font-mono text-3xl md:text-5xl tracking-[0.08em] text-slate-100">
          Project <span className="omega-text-cyan">OMEGA</span>:{" "}
          <span className="text-slate-300">Ascension Sequence</span>
        </h1>
        <p className="mt-3 font-mono text-xs md:text-sm tracking-[0.2em] uppercase text-slate-400">
          Neuro-Symbolic Discovery ·{" "}
          <span className="omega-text-cyan">Strange Attractor Telemetry</span>
        </p>
      </div>
      <OmegaAscension />
    </main>
  );
}
