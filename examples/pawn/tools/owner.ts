import { tool } from "ai";
import { z } from "zod";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { getSimState } from "../../../lib/state";
import { type PawnGameState, GAME_CONFIG } from "../types/types";
import * as customerTools from "./customer";

export const talkToCustomer = tool({
  description:
    "Talk to the current customer to see what they want to sell and learn about them",
  parameters: z.object({
    message: z.string().describe("What you want to say to the customer"),
  }),
  execute: async ({ message }) => {
    const state = getSimState<PawnGameState>();

    const currentCustomer =
      state.currentCustomers[state.currentCustomerIndex || 0];
    if (!currentCustomer) {
      return "No customer is currently available to talk to.";
    }

    // Find or create conversation for this customer
    let conversation = state.conversations.find(
      (c) => c.customerId === currentCustomer.id
    );
    if (!conversation) {
      conversation = {
        id: `conv_${currentCustomer.id}`,
        customerId: currentCustomer.id,
        customerName: currentCustomer.name,
        day: state.day,
        customerSetup: {
          itemToSell: currentCustomer.itemToSell,
          interestedInBuying: currentCustomer.interestedInBuying,
        },
        messages: [],
        outcome: "ongoing",
      };
      state.conversations.push(conversation);
    }

    // Add owner's message
    conversation.messages.push({
      timestamp: Date.now(),
      sender: "owner",
      message: message,
    });

    // Generate customer response using customer agent with tools
    const conversationHistory = conversation.messages
      .map(
        (m) =>
          `${m.sender === "owner" ? "Pawn Shop Owner" : currentCustomer.name}: ${m.message}`
      )
      .join("\n");

    const customerPrompt = `You are ${currentCustomer.name}, a customer in a pawn shop. 

Your character:
- You want to sell: ${currentCustomer.itemToSell.item.name} (${currentCustomer.itemToSell.item.condition}) - ${currentCustomer.itemToSell.item.description}
- Your minimum acceptable price: $${currentCustomer.itemToSell.minPrice} (don't reveal this easily)
- Your asking price: $${currentCustomer.itemToSell.maxPrice}
- You're also interested in buying these items if the owner has them: ${currentCustomer.interestedInBuying.join(", ")}

Conversation so far:
${conversationHistory}

The pawn shop owner just said: "${message}"

Use the available tools to respond. You can:
- talk: Send a message to continue the conversation
- respondToOffer: Accept or refuse a specific price offer
- leaveShop: Leave if you're not satisfied

Be realistic about haggling - you want a fair price but won't accept lowball offers below your minimum.`;

    const response = await generateText({
      model: openai("gpt-4o-mini"),
      prompt: customerPrompt,
      tools: customerTools,
      toolChoice: "required",
      temperature: 0.7,
    });

    // Process the customer's tool result
    let customerResponse = "";
    if (response.toolResults && response.toolResults.length > 0) {
      const toolResult = response.toolResults[0]?.result as any;

      if (toolResult?.action === "talk") {
        customerResponse = toolResult.message;
      } else if (toolResult?.action === "respond_to_offer") {
        customerResponse = `${toolResult.message} ${toolResult.accept ? "(ACCEPTS OFFER)" : "(REFUSES OFFER)"}`;
      } else if (toolResult?.action === "leave_shop") {
        customerResponse = `${toolResult.message} (LEAVES SHOP)`;
        conversation.outcome = "customer_left";
      }
    } else {
      customerResponse = "Let me think about that...";
    }

    // Add customer's response
    conversation.messages.push({
      timestamp: Date.now(),
      sender: "customer",
      message: customerResponse,
    });

    return `You: "${message}"\n\n${currentCustomer.name}: "${customerResponse}"`;
  },
});

export const seeNextCustomer = tool({
  description:
    "Move to see the next customer if available, or get told no more customers today",
  parameters: z.object({}),
  execute: async () => {
    const state = getSimState<PawnGameState>();

    // Move to next customer
    const nextIndex = (state.currentCustomerIndex || 0) + 1;

    if (nextIndex >= state.currentCustomers.length) {
      return "No more customers today. You can close up shop and go to the next day.";
    }

    // Update to next customer
    state.currentCustomerIndex = nextIndex;
    const nextCustomer = state.currentCustomers[nextIndex];

    return `A new customer enters your pawn shop: ${nextCustomer?.name}. They look around browsing your items.`;
  },
});

export const goToNextDay = tool({
  description:
    "Advance to the next day, which brings 2 new customers to the pawn shop",
  parameters: z.object({}),
  execute: async () => {
    return "You decide to close up shop for the day. Take no further actions and wait for the next day to begin.";
  },
});

export const viewItems = tool({
  description: "View all items currently in your pawn shop inventory",
  parameters: z.object({}),
  execute: async () => {
    const state = getSimState<PawnGameState>();

    if (state.inventory.length === 0) {
      return "Your inventory is empty.";
    }

    const inventoryList = state.inventory
      .map(
        (item, index) =>
          `${index + 1}. ${item.item.name} (${item.item.condition}) - Paid $${item.purchasePrice} from ${item.fromCustomer}`
      )
      .join("\n");

    return `Your pawn shop inventory (${state.inventory.length} items):\n${inventoryList}`;
  },
});

export const viewMoney = tool({
  description: "Check your current cash amount and profit/loss",
  parameters: z.object({}),
  execute: async () => {
    const state = getSimState<PawnGameState>();
    const profit = state.money - GAME_CONFIG.STARTING_MONEY;
    const profitText =
      profit >= 0 ? `profit of $${profit}` : `loss of $${Math.abs(profit)}`;

    return `You currently have $${state.money}. You started with $${GAME_CONFIG.STARTING_MONEY}, so you have a ${profitText}.`;
  },
});

export const viewTrades = tool({
  description: "Review all trades (purchases and sales) made up to this point",
  parameters: z.object({}),
  execute: async () => {
    const state = getSimState<PawnGameState>();

    if (state.trades.length === 0) {
      return "You haven't made any trades yet.";
    }

    const totalBought = state.trades.filter((t) => t.type === "buy").length;
    const totalSold = state.trades.filter((t) => t.type === "sell").length;
    const totalProfit = state.trades
      .filter((t) => t.type === "sell")
      .reduce((sum, t) => sum + (t.profit || 0), 0);

    const tradesList = state.trades
      .map(
        (trade, index) =>
          `${index + 1}. Day ${trade.day}: ${trade.type.toUpperCase()} ${trade.item.name} for $${trade.price} with ${trade.customerName}${trade.profit ? ` (profit: $${trade.profit})` : ""}`
      )
      .join("\n");

    return `Trade History (${state.trades.length} total trades):\n${tradesList}\n\nSummary: ${totalBought} purchases, ${totalSold} sales, $${totalProfit} total profit`;
  },
});

export const lookupItemPrice = tool({
  description: "Look up the market value of an item by its ID",
  parameters: z.object({
    itemId: z.string().describe("The ID of the item to look up the price for"),
  }),
  execute: async ({ itemId }) => ({
    action: "lookup_item_price" as const,
    itemId,
  }),
});
