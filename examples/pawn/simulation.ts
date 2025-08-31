import { createSimulation } from "../../lib/simulation";

// Basic pawn simulation - just ticks
export async function runPawnSimulation() {
  const simulation = createSimulation({
    maxTicks: 10,

    onTick: async (state) => {
      console.log(`Tick ${state.tick + 1}: Pawn is active`);
      return true;
    },

    onEnd: (state, reason) => {
      console.log(`\n🏁 Pawn simulation ended: ${reason}`);
      console.log(`Total ticks completed: ${state.tick}`);
    },
  });

  return await simulation.run();
}

// Run if executed directly
if (import.meta.main) {
  runPawnSimulation().then(() => {
    console.log("🔄 Pawn simulation completed!");
  });
}
