import { tool } from "ai";
import { z } from "zod";

export const exploreTool = tool({
  description: "Explore the environment to gain 5 score but lose 20 energy",
  parameters: z.object({}),
  execute: async () => ({ action: "explore" as const }),
});

export const workTool = tool({
  description: "Work to gain 15 score but lose 30 energy",
  parameters: z.object({}),
  execute: async () => ({ action: "work" as const }),
});

export const restTool = tool({
  description: "Rest to gain 40 energy",
  parameters: z.object({}),
  execute: async () => ({ action: "rest" as const }),
});
