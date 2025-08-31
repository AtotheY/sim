import { createSimulation, type LoopState } from "../../lib/simulation";
import { runEnergyAgent } from "./agent";

// Energy AI simulation state
interface EnergyAIState extends LoopState {
  agentName: string;
  score: number;
  energy: number;
}

// Energy simulation using AI agent
export async function runEnergyAISimulation() {
  const simulation = createSimulation<EnergyAIState>({
    maxTicks: 10,

    initialState: {
      agentName: "AI-Agent",
      score: 0,
      energy: 100,
    },

    onTick: async (state) => {
      console.log(`Agent: ${state.agentName}`);
      console.log(`Score: ${state.score}, Energy: ${state.energy}`);

      const prompt = `
        Current state:
        - Score: ${state.score}
        - Energy: ${state.energy}
        - Tick: ${state.tick}
        
        Available actions: explore, work, rest
        What do you want to do? Also justify your decision in 1 sentence.
      `;

      try {
        const response = await runEnergyAgent(prompt);
        console.log(`Agent reasoning: ${response.text}`);

        // Process tool results
        if (response.toolResults && response.toolResults.length > 0) {
          const toolResult = response.toolResults[0];
          const action = (toolResult?.result as { action: string })?.action;
          console.log(`Agent decision: ${action}`);

          // Apply action effects
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
        } else {
          console.log(
            "⚠️ No tool was called, agent may have just responded with text"
          );
        }
      } catch (error) {
        console.error("❌ Error calling agent:", error);
        return false;
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
      console.log(`\n📊 AI Simulation Results:`);
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
  runEnergyAISimulation().then(() => {
    console.log("🔄 AI simulation completed!");
  });
}
