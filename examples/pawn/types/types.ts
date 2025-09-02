import { type LoopState } from "../../../lib/simulation";
import { type PawnItem } from "./items";
import { type LedgerEntry } from "../helpers/debug";

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

  // Customer tracking
  currentCustomerIndex: number; // Which customer we're currently serving

  // Conversation history for analysis
  conversations: Conversation[]; // All customer conversations

  // Debug tracking ledger
  ledger?: LedgerEntry[]; // Comprehensive interaction tracking
}

// Customer personality types
export type CustomerPersonality =
  | "patient"
  | "aggressive"
  | "reasonable"
  | "touchy"
  | "shrewd";

// Items customer wants to buy with max prices
export interface CustomerBuyingInterest {
  itemId: string;
  maxPrice: number; // Secret - how much they're willing to pay
}

// Customer information (simplified to match spec)
export interface Customer {
  id: string;
  name: string;
  personality: CustomerPersonality;

  // What they want to sell
  itemToSell: CustomerItem;

  // What they might buy (15 items with max prices they're willing to pay)
  interestedInBuying: CustomerBuyingInterest[];
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

// Import game configuration from config file
export { GAME_CONFIG } from "../config";

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

// Conversation tracking for analysis
export interface Conversation {
  id: string;
  customerId: string;
  customerName: string;
  day: number;
  customerSetup: {
    itemToSell: CustomerItem;
    interestedInBuying: CustomerBuyingInterest[];
  };
  messages: ConversationMessage[];
  outcome: "trade_made" | "customer_left" | "ongoing";
}

export interface ConversationMessage {
  timestamp: number;
  sender: "owner" | "customer";
  message: string;
}
