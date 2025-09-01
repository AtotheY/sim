import { GAME_CONFIG } from "../config";

export interface OwnerPromptParams {
  day: number;
  money: number;
  inventoryCount: number;
  dayStatus: string;
}

export function createOwnerPrompt(params: OwnerPromptParams): string {
  return `You are the owner of a pawn shop. Your goal is to maximize profit over ${GAME_CONFIG.MAX_DAYS} days.

Current Status:
- Day ${params.day} of ${GAME_CONFIG.MAX_DAYS}
- Money: $${params.money}
- Inventory: ${params.inventoryCount} items
- ${params.dayStatus}

Strategy: Talk briefly to understand what customers have, look up item values, then make smart offers. Don't overthink - be decisive!

you should keep calling tools everyday until there are no more customers.`;
}
