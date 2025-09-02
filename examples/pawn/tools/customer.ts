import { tool } from "ai";
import { z } from "zod";
import { logToolCall, logToolResult } from "../helpers/logging";
import { getSimState } from "../../../lib/state";
import { type PawnGameState } from "../types/types";

// Helper function to get current customer name
function getCurrentCustomerName(): string {
  try {
    const state = getSimState<PawnGameState>();
    const currentCustomer =
      state.currentCustomers[state.currentCustomerIndex || 0];
    return currentCustomer?.name || "Customer";
  } catch {
    return "Customer";
  }
}

export const talk = tool({
  description: "Send a message to the pawn shop owner",
  parameters: z.object({
    message: z.string().describe("What you want to say to the pawn shop owner"),
  }),
  execute: async ({ message }) => {
    logToolCall("customer", "talk", { message }, getCurrentCustomerName());
    return {
      action: "talk" as const,
      message,
    };
  },
});

export const acceptSellOffer = tool({
  description: "Accept an offer to sell your item to the pawn shop owner",
  parameters: z.object({
    message: z.string().describe("What you want to say when accepting"),
    priceOffered: z.number().describe("The price that was offered to you"),
  }),
  execute: async ({ message, priceOffered }) => {
    const customerName = getCurrentCustomerName();
    logToolCall(
      "customer",
      "acceptSellOffer",
      { message, priceOffered },
      customerName
    );
    const result = {
      action: "accept_sell_offer" as const,
      message,
      priceOffered,
    };
    logToolResult("customer", "acceptSellOffer");
    return result;
  },
});

export const refuseOffer = tool({
  description: "Refuse an offer from the pawn shop owner",
  parameters: z.object({
    message: z.string().describe("What you want to say when refusing"),
  }),
  execute: async ({ message }) => {
    const customerName = getCurrentCustomerName();
    logToolCall("customer", "refuseOffer", { message }, customerName);
    const result = {
      action: "refuse_offer" as const,
      message,
    };
    logToolResult("customer", "refuseOffer");
    return result;
  },
});

export const acceptBuyOffer = tool({
  description: "Accept an offer to buy an item from the pawn shop owner",
  parameters: z.object({
    message: z.string().describe("What you want to say when accepting"),
    priceOffered: z.number().describe("The price being offered for the item"),
    itemName: z.string().describe("The name of the item you're buying"),
  }),
  execute: async ({ message, priceOffered, itemName }) => {
    const customerName = getCurrentCustomerName();
    logToolCall(
      "customer",
      "acceptBuyOffer",
      {
        message,
        priceOffered,
        itemName,
      },
      customerName
    );
    const result = {
      action: "accept_buy_offer" as const,
      message,
      priceOffered,
      itemName,
    };
    logToolResult("customer", "acceptBuyOffer");
    return result;
  },
});

export const leaveShop = tool({
  description: "Leave the pawn shop without making a deal",
  parameters: z.object({
    message: z.string().describe("What you want to say before leaving"),
  }),
  execute: async ({ message }) => {
    const customerName = getCurrentCustomerName();
    logToolCall("customer", "leaveShop", { message }, customerName);
    const result = {
      action: "leave_shop" as const,
      message,
    };
    logToolResult("customer", "leaveShop");
    return result;
  },
});
