# @fallom/sim

Universal simulation framework for AI agents and autonomous systems.

## Library Structure

```
lib/                    # Core simulation library
├── index.ts           # Main exports
├── simulation.ts      # Simulation engine
├── telemetry.ts       # Telemetry system
└── instrumentation.ts # OpenTelemetry setup

examples/              # Example implementations
├── energy-rng/        # Random energy simulation
├── pawn/             # Basic pawn simulation
└── energy-ai/        # AI-powered energy simulation
    ├── agent.ts      # AI agent logic
    ├── tools.ts      # Agent tools
    └── simulation.ts # Simulation runner
```

## Quick Start

### Using the Library

```typescript
import { createSimulation } from "@fallom/sim";

const simulation = createSimulation({
  maxTicks: 10,
  
  onTick: async (state) => {
    console.log(`Tick ${state.tick}`);
    return true; // continue simulation
  },
  
  onEnd: (state, reason) => {
    console.log(`Ended: ${reason}`);
  }
});

await simulation.run();
```

### Running Examples

```bash
# Install dependencies
bun install

# Run example simulations
bun run example:pawn        # Basic simulation
bun run example:energy-rng  # Random agent
bun run example:energy-ai   # AI agent (requires OpenAI API key)
```

## Features

- **Universal simulation loop** - Works with any agent type
- **Built-in telemetry** - JSON Lines logging with OpenTelemetry
- **TypeScript support** - Full type safety
- **Extensible** - Easy to build custom agents and environments
- **Observable** - Rich telemetry and debugging

## Development

The library is designed to be framework-agnostic. Examples show how to integrate with:
- Random/programmatic agents
- AI frameworks (Vercel AI SDK)
- Custom agent logic

Each example is self-contained with its own agents and simulation logic.