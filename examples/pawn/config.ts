/**
 * Pawn Shop Simulation Configuration
 *
 * All configurable game settings and constants
 */

export const GAME_CONFIG = {
  // Economic settings
  STARTING_MONEY: 1000,
  MIN_MONEY_TO_CONTINUE: 0, // Game over if money hits this
  // Time settings
  MAX_DAYS: 7,
  // Customer settings
  CUSTOMERS_PER_DAY: 5,
  // Simulation settings
  MAX_TICKS: 100, // Prevent infinite loops in simulation
} as const;

// Derived types for type safety
export type GameConfig = typeof GAME_CONFIG;
