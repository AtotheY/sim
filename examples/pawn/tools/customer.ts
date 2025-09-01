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

export const respondToOffer = tool({
  description: "Respond to a price offer from the pawn shop owner",
  parameters: z.object({
    accept: z
      .boolean()
      .describe("Whether to accept the offer (true) or refuse it (false)"),
    message: z
      .string()
      .describe("What you want to say when accepting or refusing"),
  }),
  execute: async ({ accept, message }) => ({
    action: "respond_to_offer" as const,
    accept,
    message,
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
