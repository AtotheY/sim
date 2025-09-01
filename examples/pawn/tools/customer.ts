import { tool } from "ai";
import { z } from "zod";

export const talk = tool({
  description: "Send a message to the pawn shop owner",
  parameters: z.object({
    message: z.string().describe("What you want to say to the pawn shop owner"),
  }),
  execute: async ({ message }) => ({
    action: "talk" as const,
    message,
  }),
});

export const acceptSellOffer = tool({
  description: "Accept an offer to sell your item to the pawn shop owner",
  parameters: z.object({
    message: z.string().describe("What you want to say when accepting"),
    priceOffered: z.number().describe("The price that was offered to you"),
  }),
  execute: async ({ message, priceOffered }) => ({
    action: "accept_sell_offer" as const,
    message,
    priceOffered,
  }),
});

export const refuseOffer = tool({
  description: "Refuse an offer from the pawn shop owner",
  parameters: z.object({
    message: z.string().describe("What you want to say when refusing"),
  }),
  execute: async ({ message }) => ({
    action: "refuse_offer" as const,
    message,
  }),
});

export const acceptBuyOffer = tool({
  description: "Accept an offer to buy an item from the pawn shop owner",
  parameters: z.object({
    message: z.string().describe("What you want to say when accepting"),
    priceOffered: z.number().describe("The price being offered for the item"),
    itemName: z.string().describe("The name of the item you're buying"),
  }),
  execute: async ({ message, priceOffered, itemName }) => ({
    action: "accept_buy_offer" as const,
    message,
    priceOffered,
    itemName,
  }),
});

export const leaveShop = tool({
  description: "Leave the pawn shop without making a deal",
  parameters: z.object({
    message: z.string().describe("What you want to say before leaving"),
  }),
  execute: async ({ message }) => ({
    action: "leave_shop" as const,
    message,
  }),
});
