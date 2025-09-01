import { type PawnGameState } from "../types/types";
import { GAME_CONFIG } from "../config";

// Check if the game should end
export function checkGameEndConditions(state: PawnGameState): {
  ended: boolean;
  reason?: string;
} {
  // Out of money
  if (state.money <= 0) {
    return { ended: true, reason: "OUT_OF_MONEY" };
  }

  // Max days reached
  if (state.day > GAME_CONFIG.MAX_DAYS) {
    return { ended: true, reason: "MAX_DAYS_REACHED" };
  }

  return { ended: false };
}
