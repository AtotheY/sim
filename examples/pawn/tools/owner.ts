import { tool } from "ai";
import { z } from "zod";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { getSimState } from "../../../lib/state";
import { type PawnGameState } from "../types/types";
import { GAME_CONFIG } from "../config";
import { createCustomerPrompt } from "../prompts";
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

    const customerPrompt = createCustomerPrompt({
      customerName: currentCustomer.name,
      itemName: currentCustomer.itemToSell.item.name,
      itemCondition: currentCustomer.itemToSell.item.condition,
      itemDescription: currentCustomer.itemToSell.item.description,
      minPrice: currentCustomer.itemToSell.minPrice,
      maxPrice: currentCustomer.itemToSell.maxPrice,
      interestedInBuying: currentCustomer.interestedInBuying,
      conversationHistory,
      ownerMessage: message,
    });

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

    return `The customer responds: "${customerResponse}"`;
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
    const state = getSimState<PawnGameState>();

    // Advance to next day
    state.day++;

    // Generate new customers for the new day
    const { generateDailyCustomers } = await import("../helpers/customers");
    state.currentCustomers = generateDailyCustomers(state.day);
    state.currentCustomerIndex = 0;

    console.log(`\n📅 Day ${state.day} begins! New customers arrive.`);

    return `Day ${state.day} begins! 2 new customers have arrived at your pawn shop. You now have fresh opportunities to buy and sell items.`;
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
  execute: async ({ itemId }) => {
    const { PAWN_ITEMS, getActualValue } = await import("../types/items");

    const item = PAWN_ITEMS.find((item) => item.id === itemId);
    if (!item) {
      return `Item with ID "${itemId}" not found in the catalog.`;
    }

    const actualValue = getActualValue(item);
    return `${item.name} (${item.condition}): Market value is $${actualValue}. Description: ${item.description}`;
  },
});

export const makeOffer = tool({
  description: "Make a price offer to buy an item from the current customer",
  parameters: z.object({
    price: z.number().describe("The price you want to offer for their item"),
  }),
  execute: async ({ price }) => {
    const state = getSimState<PawnGameState>();

    const currentCustomer =
      state.currentCustomers[state.currentCustomerIndex || 0];
    if (!currentCustomer) {
      return "No customer is currently available to make an offer to.";
    }

    if (price > state.money) {
      return `You don't have enough money. You only have $${state.money} but are offering $${price}.`;
    }

    // Check if customer accepts the offer
    const minPrice = currentCustomer.itemToSell.minPrice;
    const willAccept = price >= minPrice;

    if (willAccept) {
      // Complete the transaction
      const item = currentCustomer.itemToSell.item;

      // Add to inventory
      state.inventory.push({
        item: item,
        purchasePrice: price,
        purchaseDay: state.day,
        fromCustomer: currentCustomer.name,
      });

      // Deduct money
      state.money -= price;

      // Record trade
      state.trades.push({
        id: `trade_${Date.now()}`,
        day: state.day,
        type: "buy",
        item: item,
        price: price,
        customerName: currentCustomer.name,
      });

      // Update conversation outcome
      const conversation = state.conversations.find(
        (c) => c.customerId === currentCustomer.id
      );
      if (conversation) {
        conversation.outcome = "trade_made";
        conversation.messages.push({
          timestamp: Date.now(),
          sender: "customer",
          message: `Great! I'll sell you my ${item.name} for $${price}. (TRADE COMPLETED)`,
        });
      }

      return `✅ Deal! You bought ${item.name} (${item.condition}) for $${price} from ${currentCustomer.name}. You now have $${state.money} remaining.`;
    } else {
      return `❌ ${currentCustomer.name} shakes their head. "Sorry, that's too low for my ${currentCustomer.itemToSell.item.name}. I was hoping for at least $${currentCustomer.itemToSell.maxPrice}."`;
    }
  },
});

export const sellItemToCustomer = tool({
  description:
    "Offer to sell an item from your inventory to the current customer",
  parameters: z.object({
    inventoryIndex: z
      .number()
      .describe("The index of the item in your inventory (starting from 0)"),
    price: z.number().describe("The price you want to sell it for"),
  }),
  execute: async ({ inventoryIndex, price }) => {
    const state = getSimState<PawnGameState>();

    const currentCustomer =
      state.currentCustomers[state.currentCustomerIndex || 0];
    if (!currentCustomer) {
      return "No customer is currently available to sell to.";
    }

    if (inventoryIndex >= state.inventory.length || inventoryIndex < 0) {
      return `Invalid inventory index. You have ${state.inventory.length} items in inventory (indices 0-${state.inventory.length - 1}).`;
    }

    const inventoryItem = state.inventory[inventoryIndex]!;
    const isInterested = currentCustomer.interestedInBuying.includes(
      inventoryItem.item.id
    );

    if (!isInterested) {
      return `${currentCustomer.name} doesn't seem interested in the ${inventoryItem.item.name}. They're looking for: ${currentCustomer.interestedInBuying.join(", ")}`;
    }

    // Simple customer acceptance logic - they'll accept reasonable prices
    const { getActualValue } = await import("../types/items");
    const marketValue = getActualValue(inventoryItem.item);
    const maxCustomerWillPay = marketValue * (0.7 + Math.random() * 0.3); // 70-100% of market value

    if (price <= maxCustomerWillPay) {
      // Complete the sale
      const profit = price - inventoryItem.purchasePrice;

      // Add money
      state.money += price;

      // Remove from inventory
      state.inventory.splice(inventoryIndex, 1);

      // Record trade
      state.trades.push({
        id: `trade_${Date.now()}`,
        day: state.day,
        type: "sell",
        item: inventoryItem.item,
        price: price,
        customerName: currentCustomer.name,
        profit: profit,
      });

      // Update conversation
      const conversation = state.conversations.find(
        (c) => c.customerId === currentCustomer.id
      );
      if (conversation) {
        conversation.outcome = "trade_made";
        conversation.messages.push({
          timestamp: Date.now(),
          sender: "customer",
          message: `Perfect! I'll buy your ${inventoryItem.item.name} for $${price}. (SALE COMPLETED)`,
        });
      }

      return `✅ Sale! You sold ${inventoryItem.item.name} for $${price} to ${currentCustomer.name}. Profit: $${profit}. You now have $${state.money}.`;
    } else {
      return `❌ ${currentCustomer.name} thinks $${price} is too expensive for the ${inventoryItem.item.name}. They might pay up to around $${Math.round(maxCustomerWillPay)}.`;
    }
  },
});
