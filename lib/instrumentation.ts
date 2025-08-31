import { NodeSDK } from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { FileLogDrainExporter } from "./telemetry";

// Initialize telemetry with our custom file exporter
export function initTelemetry(logFile: string = "./telemetry.jsonl") {
  const customExporter = new FileLogDrainExporter(logFile);

  const sdk = new NodeSDK({
    traceExporter: customExporter,
    instrumentations: [getNodeAutoInstrumentations()],
  });

  console.log(`🚀 Telemetry initialized - logging to ${logFile}`);
  sdk.start();

  return sdk;
}
