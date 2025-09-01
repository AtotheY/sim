import { type LoopState } from "./simulation";

// Global simulation state manager
let currentSimulationState: LoopState | null = null;

export function setSimState<T extends LoopState>(state: T): void {
  currentSimulationState = state;
}

export function getSimState<T extends LoopState>(): T {
  if (!currentSimulationState) {
    throw new Error(
      "Simulation state not initialized. Make sure setSimState() is called from your simulation."
    );
  }
  return currentSimulationState as T;
}

export function clearSimState(): void {
  currentSimulationState = null;
}
