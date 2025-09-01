import { createSimulation } from "../../lib/simulation";
import { setSimState, clearSimState } from "../../lib/state";
import { generateDailyCustomers } from "./helpers/customers";
import {
  type PawnGameState,
  GAME_CONFIG,
  type GameResult,
} from "./types/types";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import * as ownerTools from "./tools/owner";

/*
Pawn bench rules (Pawn shop simulation):

5 days to make as much money as possible.
Agent starts with $10,000 in cash.
Agent has a pawn shop.
Each day 2 customers come to the pawn shop, with something they want to pawn, 
and things they are open to buying.

The agent needs to buy and sell items to make money.

The agent has the following actions:
- Talk to customer 
- See next customer
- Go to the next day
- View their items 
- View their money
- View the trades made up to this point
- Lookup item price

The agent has the following goals:
- Make as much money as possible

The simulation ends if:
- The agent runs out of money (they hit $0)
- The agent runs out of days (they hit 10 days)

items:
we should generate a pre-made list of like 100 items that customers can have and store it in a constants file.

customers:
 At the start of each day, generate 2 customers.
 Each customer should:
 - Have 1 item they want to sell, with a min and max price.
   (They might not reveal these prices to the pawn shop owner!)
 - Have a subset of items (from the original items list) they might be interested in buying.
 - they should haggle a bit with the agent.. and should feel free to walk away if they don't like it.


System:
- State should keep track of the following:
  - the agent's money
  - the agent's items
  - the agent's trades
  - misc state of things like what day it is, etc.
*/

// Initialize the pawn shop game state
function initializePawnState(): PawnGameState {
  const initialState = {
    tick: 0,
    day: 1,
    money: GAME_CONFIG.STARTING_MONEY,
    inventory: [],
    trades: [],
    currentCustomers: generateDailyCustomers(1),
    currentCustomerIndex: 0,
    conversations: [],
  };

  console.log(`\n📅 Day ${initialState.day} begins! New customers arrive.`);
  return initialState;
}

// Check if the game should end
function checkGameEndConditions(state: PawnGameState): {
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

// Run the owner AI agent for one turn
async function runOwnerAgentTurn(state: PawnGameState): Promise<boolean> {
  const currentCustomer =
    state.currentCustomers[state.currentCustomerIndex || 0];
  const dayStatus =
    state.currentCustomerIndex >= state.currentCustomers.length
      ? "No more customers today"
      : `Current customer: ${currentCustomer?.name}`;

  const gamePrompt = `You are the owner of a pawn shop. Your goal is to maximize profit over ${GAME_CONFIG.MAX_DAYS} days.

Current Status:
- Day ${state.day} of ${GAME_CONFIG.MAX_DAYS}
- Money: $${state.money}
- Inventory: ${state.inventory.length} items
- ${dayStatus}

Available actions:
- talkToCustomer: Speak with the current customer to learn about their item
- lookupItemPrice: Research market value of items by ID
- makeOffer: Make a price offer to buy their item
- sellItemToCustomer: Offer to sell an item from your inventory
- seeNextCustomer: Move to the next customer (when done with current one)
- goToNextDay: Advance to the next day (when no more customers)
- viewItems, viewMoney, viewTrades: Check your status

Strategy: Talk briefly to understand what customers have, look up item values, then make smart offers. Don't overthink - be decisive!`;

  try {
    const response = await generateText({
      model: openai("gpt-4o-mini"),
      prompt: gamePrompt,
      tools: ownerTools,
      toolChoice: "auto",
      temperature: 0.3,
    });

    console.log("\n=== RESPONSE DEBUG ===");
    console.log("Finish reason:", response.finishReason);
    console.log("Tool calls:", response.toolCalls?.length || 0);
    if (response.toolCalls) {
      response.toolCalls.forEach((call, i) => {
        console.log(`Tool call ${i + 1}:`, call.toolName, call.args);
      });
    }
    if (response.toolResults) {
      response.toolResults.forEach((result, i) => {
        console.log(
          `Tool result ${i + 1}:`,
          result.toolName,
          typeof result.result === "string"
            ? result.result.slice(0, 100) + "..."
            : result.result
        );
      });
    }
    console.log("=== END DEBUG ===\n");

    return true;
  } catch (error) {
    console.error("❌ Error running agent turn:", error);
    return false;
  }
}

// Main pawn shop simulation
export async function runPawnSimulation(): Promise<GameResult> {
  const initialState = initializePawnState();

  const simulation = createSimulation<PawnGameState>({
    maxTicks: 100, // Prevent infinite loops
    initialState,

    onTick: async (state) => {
      // Set global state for tools to access
      setSimState(state);

      console.log(`\n=== Day ${state.day}, Tick ${state.tick + 1} ===`);
      console.log(
        `💰 Money: $${state.money} | 📦 Inventory: ${state.inventory.length} items`
      );

      // Check end conditions
      const endCheck = checkGameEndConditions(state);
      if (endCheck.ended) {
        console.log(`\n🏁 Game Over: ${endCheck.reason}`);
        return false;
      }

      // Run owner agent turn
      const shouldContinue = await runOwnerAgentTurn(state);

      // After every agent turn, advance to the next day with new customers
      state.day++;

      // Check if we've reached max days after advancing
      if (state.day > GAME_CONFIG.MAX_DAYS) {
        console.log(
          `\n🏁 Max days (${GAME_CONFIG.MAX_DAYS}) reached, ending simulation`
        );
        return false;
      }

      // Generate new customers for the new day
      state.currentCustomers = generateDailyCustomers(state.day);
      state.currentCustomerIndex = 0;

      console.log(`🗓️ Advanced to Day ${state.day} - New customers generated!`);

      return shouldContinue;
    },

    onEnd: (state, reason) => {
      clearSimState();

      const profit = state.money - GAME_CONFIG.STARTING_MONEY;
      const endReason =
        state.money <= 0
          ? "OUT_OF_MONEY"
          : state.day > GAME_CONFIG.MAX_DAYS
            ? "MAX_DAYS_REACHED"
            : "SIMULATION_ENDED";

      console.log(`\n🏁 Pawn Shop Simulation Results:`);
      console.log({ endReason });
      console.log(`📅 Days completed: ${state.day - 1}`);
      console.log(`💰 Final money: $${state.money}`);
      console.log(`📈 Profit/Loss: ${profit >= 0 ? "+" : ""}$${profit}`);
      console.log(`🤝 Total trades: ${state.trades.length}`);
      console.log(`📦 Final inventory: ${state.inventory.length} items`);
      console.log(`💬 Conversations: ${state.conversations.length}`);
      console.log(`🎯 End reason: ${reason}`);
    },
  });

  const finalState = await simulation.run();

  // Return game result
  const profit = finalState.money - GAME_CONFIG.STARTING_MONEY;
  return {
    reason:
      finalState.money <= 0
        ? "out_of_money"
        : finalState.day > GAME_CONFIG.MAX_DAYS
          ? "max_days_reached"
          : "out_of_money", // fallback, shouldn't happen
    finalMoney: finalState.money,
    profit,
    daysPlayed: finalState.day - 1,
    totalTrades: finalState.trades.length,
  };
}

// Run if executed directly
if (import.meta.main) {
  runPawnSimulation().then(() => {
    console.log("🔄 Pawn simulation completed!");
  });
}
