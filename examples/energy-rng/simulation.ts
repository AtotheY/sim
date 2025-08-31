import { createSimulation, type LoopState } from "../../lib/simulation";

// Energy simulation state
interface EnergyState extends LoopState {
  agentName: string;
  score: number;
  energy: number;
}

// Simple RNG agent
function getRandomAction(): string {
  const actions = ["explore", "work", "rest"];
  return actions[Math.floor(Math.random() * actions.length)];
}

// Energy simulation with random actions
export async function runEnergyRngSimulation() {
  const simulation = createSimulation<EnergyState>({
    maxTicks: 10,

    initialState: {
      agentName: "RNG-Agent",
      score: 0,
      energy: 100,
    },

    onTick: async (state) => {
      console.log(`Agent: ${state.agentName}`);
      console.log(`Score: ${state.score}, Energy: ${state.energy}`);

      const action = getRandomAction();
      console.log(`Random action: ${action}`);

      // Process action
      if (action === "explore") {
        state.score += 5;
        state.energy -= 20;
        console.log("🔍 Exploring... +5 score, -20 energy");
      } else if (action === "work") {
        state.score += 15;
        state.energy -= 30;
        console.log("💼 Working... +15 score, -30 energy");
      } else if (action === "rest") {
        state.energy += 40;
        console.log("😴 Resting... +40 energy");
      }

      // Clamp energy
      state.energy = Math.max(0, Math.min(100, state.energy));

      // Check if exhausted
      if (state.energy <= 0) {
        console.log("😴 Agent is exhausted!");
        return false;
      }

      console.log("");
      return true;
    },

    onEnd: (state, reason) => {
      console.log(`\n📊 RNG Simulation Results:`);
      console.log(`Agent: ${state.agentName}`);
      console.log(`Final Score: ${state.score}`);
      console.log(`Final Energy: ${state.energy}`);
      console.log(`Total Ticks: ${state.tick}`);
      console.log(`End Reason: ${reason}`);
    },
  });

  return await simulation.run();
}

// Run if executed directly
if (import.meta.main) {
  runEnergyRngSimulation().then(() => {
    console.log("🔄 RNG simulation completed!");
  });
}
