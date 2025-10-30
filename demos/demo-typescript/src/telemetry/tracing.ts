import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';

/**
 * OpenTelemetry Tracing Setup
 * 
 * This module initializes distributed tracing with OpenTelemetry.
 * Exports traces to the OpenTelemetry Collector via OTLP/gRPC.
 */

// Define service resource attributes
const resource = new Resource({
  [SemanticResourceAttributes.SERVICE_NAME]: process.env.OTEL_SERVICE_NAME || 'demo-typescript',
  [SemanticResourceAttributes.SERVICE_VERSION]: process.env.OTEL_SERVICE_VERSION || '1.0.0',
  [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV || 'development',
});

// Configure OTLP trace exporter
const traceExporter = new OTLPTraceExporter({
  // OTel Collector endpoint (gRPC)
  // In Docker: http://otel-collector:4317
  // Local dev: http://localhost:4317
  url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4317',
});

// Initialize the OpenTelemetry SDK
const sdk = new NodeSDK({
  resource,
  traceExporter,
  // Automatic instrumentation for HTTP and Express
  instrumentations: [
    new HttpInstrumentation({
      // Don't trace health checks and metrics endpoints
      ignoreIncomingRequestHook: (req) => {
        const url = req.url || '';
        return url === '/health' || url === '/ready' || url === '/metrics';
      },
    }),
    new ExpressInstrumentation({
      // Don't trace health checks and metrics endpoints
      ignoreLayersType: [],
    }),
  ],
});

/**
 * Start the OpenTelemetry SDK
 * This must be called before any other imports that use instrumented libraries
 */
export function startTracing(): void {
  sdk.start();
  console.log('🔍 OpenTelemetry tracing initialized (OTLP exporter)');
}

/**
 * Gracefully shutdown the OpenTelemetry SDK
 * Call this when the application is shutting down
 */
export async function stopTracing(): Promise<void> {
  try {
    await sdk.shutdown();
    console.log('🔍 OpenTelemetry tracing shut down');
  } catch (error) {
    console.error('Error shutting down OpenTelemetry SDK', error);
  }
}

// Handle process termination
process.on('SIGTERM', async () => {
  await stopTracing();
});
