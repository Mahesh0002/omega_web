import { createFileRoute } from "@tanstack/react-router";
import { OmegaDiscovery } from "@/components/OmegaDiscovery";

export const Route = createFileRoute("/discovery")({
  head: () => ({
    meta: [
      { title: "Discovery — Project OMEGA" },
      {
        name: "description",
        content:
          "Project OMEGA's ascension sequence — witness the neuro-symbolic engine projecting chaotic telemetry into state space via MCTS.",
      },
    ],
  }),
  component: DiscoveryPage,
});

function DiscoveryPage() {
  return (
    <main className="min-h-[calc(100vh-65px)]">
      <OmegaDiscovery />
    </main>
  );
}
