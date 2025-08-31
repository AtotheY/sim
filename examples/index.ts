import { initTelemetry } from "../lib/instrumentation";
import { runEnergyRngSimulation } from "./energy-rng/simulation";
import { runPawnSimulation } from "./pawn/simulation";
import { runEnergyAISimulation } from "./energy-ai/simulation";

// Initialize telemetry for examples
initTelemetry("./telemetry.jsonl");

async function main() {
  const simType = process.argv[2];

  console.log(`🚀 Starting ${simType || "default"} simulation...\n`);

  try {
    switch (simType) {
      case "energy-rng":
        await runEnergyRngSimulation();
        break;
      case "pawn":
        await runPawnSimulation();
        break;
      case "energy-ai":
        await runEnergyAISimulation();
        break;
      default:
        console.log("Available example simulations:");
        console.log("  energy-rng  - Energy simulation with random actions");
        console.log("  pawn        - Basic pawn simulation");
        console.log("  energy-ai   - Energy simulation with AI agent");
        console.log("\nUsage: bun run examples/index.ts <simulation>");
        break;
    }
  } catch (error) {
    console.error("❌ Simulation failed:", error);
  } finally {
    console.log("\n✅ Simulation complete!");
  }
}

main().catch(console.error);
