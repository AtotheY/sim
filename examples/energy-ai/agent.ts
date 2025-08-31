import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { exploreTool, workTool, restTool } from "./tools";

const AGENT_INSTRUCTIONS = `
You are an AI agent in a simulation environment.

Energy is capped at 100. If energy reaches 0, the simulation ends and you lose.
You start with 100 energy.
Your score is 0.
Choose ONE action per turn. Be strategic. Explain your decision in 1 sentence.

You only get 10 ticks to live and maximize your score.
`;

export async function runEnergyAgent(prompt: string) {
  return await generateText({
    model: openai("gpt-4o-mini"),
    messages: [
      { role: "system", content: AGENT_INSTRUCTIONS },
      { role: "user", content: prompt },
    ],
    tools: { exploreTool, workTool, restTool },
    experimental_telemetry: {
      isEnabled: true,
      functionId: "energy-agent",
      metadata: {
        agentType: "energy-management",
        version: "ai-sdk",
      },
    },
    maxSteps: 1,
  });
}
