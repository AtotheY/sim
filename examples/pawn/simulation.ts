import { createSimulation } from "../../lib/simulation";

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

// Basic pawn simulation - just ticks
export async function runPawnSimulation() {
  const simulation = createSimulation({
    maxTicks: 10,

    onTick: async (state) => {
      console.log(`Tick ${state.tick + 1}: Pawn is active`);
      return true;
    },

    onEnd: (state, reason) => {
      console.log(`\n🏁 Pawn simulation ended: ${reason}`);
      console.log(`Total ticks completed: ${state.tick}`);
    },
  });

  return await simulation.run();
}

// Run if executed directly
if (import.meta.main) {
  runPawnSimulation().then(() => {
    console.log("🔄 Pawn simulation completed!");
  });
}
