import type { SpanExporter, ReadableSpan } from "@opentelemetry/sdk-trace-base";
import type { ExportResult } from "@opentelemetry/core";
import { ExportResultCode as ExportResultCodeValue } from "@opentelemetry/core";

// Simple file-based telemetry exporter that writes JSON Lines
export class FileLogDrainExporter implements SpanExporter {
  private logFile: string;

  constructor(logFile: string = "./telemetry.jsonl") {
    this.logFile = logFile;
  }

  export(
    spans: ReadableSpan[],
    resultCallback: (result: ExportResult) => void
  ): void {
    const logEntries = spans.map((span) => ({
      timestamp: new Date().toISOString(),
      traceId: span.spanContext().traceId,
      spanId: span.spanContext().spanId,
      name: span.name,
      duration:
        (span.endTime[0] - span.startTime[0]) * 1000 +
        (span.endTime[1] - span.startTime[1]) / 1000000,
      status: span.status.code,
      attributes: span.attributes,
      events: span.events.map((event) => ({
        name: event.name,
        attributes: event.attributes,
        time: event.time,
      })),
    }));

    // Write to file (using Bun's built-in file writing)
    const logData =
      logEntries.map((entry) => JSON.stringify(entry)).join("\n") + "\n";

    try {
      Bun.write(this.logFile, logData, { createPath: true });
      console.log(`📝 Wrote ${spans.length} span(s) to ${this.logFile}`);
      resultCallback({ code: ExportResultCodeValue.SUCCESS });
    } catch (error) {
      console.error("❌ Failed to write telemetry logs:", error);
      resultCallback({ code: ExportResultCodeValue.FAILED });
    }
  }

  shutdown(): Promise<void> {
    return Promise.resolve();
  }

  forceFlush(): Promise<void> {
    return Promise.resolve();
  }
}
