import { type LoopState } from "../../../lib/simulation";
import { type PawnItem } from "./items";

// Core game state that extends the simulation framework
export interface PawnGameState extends LoopState {
  // Game progression
  day: number; // Current day (1-5)

  // Financial state
  money: number; // Current cash on hand

  // Inventory
  inventory: InventoryItem[]; // Items owned by the pawn shop

  // Daily operations
  currentCustomers: Customer[]; // Today's customers (up to 2)

  // Transaction history
  trades: Trade[]; // All completed transactions
}

// Customer information (simplified to match spec)
export interface Customer {
  id: string;
  name: string;

  // What they want to sell
  itemToSell: CustomerItem;

  // What they might buy (subset of items they're interested in)
  interestedInBuying: string[]; // Item IDs they might purchase
}

// Items in the pawn shop's inventory
export interface InventoryItem {
  item: PawnItem;
  purchasePrice: number; // What we paid for it
  purchaseDay: number; // When we bought it
  fromCustomer: string; // Customer name who sold it
}

// Customer's item they want to sell
export interface CustomerItem {
  item: PawnItem;
  minPrice: number; // Minimum they'll accept (hidden from player)
  maxPrice: number; // What they're hoping to get (might reveal)
}

// Completed transactions
export interface Trade {
  id: string;
  day: number;
  type: "buy" | "sell"; // Did we buy from customer or sell to customer
  item: PawnItem;
  price: number;
  customerName: string;
  profit?: number; // Only for sales (sell price - purchase price)
}

// Game configuration constants
export const GAME_CONFIG = {
  STARTING_MONEY: 10000,
  MAX_DAYS: 5,
  CUSTOMERS_PER_DAY: 2,
  MIN_MONEY_TO_CONTINUE: 0, // Game over if money hits this
} as const;

// End game conditions
export type GameEndReason = "out_of_money" | "max_days_reached";

// Final game results
export interface GameResult {
  reason: GameEndReason;
  finalMoney: number;
  profit: number; // finalMoney - startingMoney
  totalTrades: number;
  daysPlayed: number;
}
