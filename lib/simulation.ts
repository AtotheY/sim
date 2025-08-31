// Basic simulation loop state
export interface LoopState {
  tick: number;
}

// Simulation configuration
export interface SimulationConfig<T extends LoopState> {
  maxTicks?: number;
  initialState?: Partial<T>;
  onTick: (state: T) => Promise<boolean>;
  onEnd?: (state: T, reason: string) => void;
}

// Create and run a simulation
export function createSimulation<T extends LoopState>(
  config: SimulationConfig<T>
) {
  return {
    async run(): Promise<T> {
      const state = {
        tick: 0,
        ...config.initialState,
      } as T;

      console.log("🔄 Simulation starting...\n");

      while (true) {
        console.log(`=== Tick ${state.tick + 1} ===`);

        // Run the tick
        const shouldContinue = await config.onTick(state);
        state.tick++;

        // Check end conditions
        if (!shouldContinue) {
          config.onEnd?.(state, "Tick returned false");
          break;
        }

        if (config.maxTicks && state.tick >= config.maxTicks) {
          config.onEnd?.(state, "Max ticks reached");
          break;
        }
      }

      console.log("\n🏁 Simulation ended");
      return state;
    },
  };
}
