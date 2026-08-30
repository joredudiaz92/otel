const { NodeSDK } = require('@opentelemetry/sdk-node');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-grpc');
const { OTLPMetricExporter } = require('@opentelemetry/exporter-metrics-otlp-grpc');
const { OTLPLogExporter } = require('@opentelemetry/exporter-logs-otlp-grpc');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { PeriodicExportingMetricReader } = require('@opentelemetry/sdk-metrics');
const { SimpleLogRecordProcessor } = require('@opentelemetry/sdk-logs');
const { HostMetricsInstrumentation } = require('@opentelemetry/instrumentation-host-metrics');

const OTLP_HOST = process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://otel-collector.observability:4317';

const metricReader = new PeriodicExportingMetricReader({
  exporter: new OTLPMetricExporter({ url: OTLP_HOST }),
});

const hostMetrics = new HostMetricsInstrumentation();

const sdk = new NodeSDK({
  serviceName: 'service-b',
  traceExporter: new OTLPTraceExporter({ url: OTLP_HOST }),
  metricReader: metricReader,
  logRecordProcessor: new SimpleLogRecordProcessor(new OTLPLogExporter({ url: OTLP_HOST })),
  instrumentations: [
    hostMetrics,
    ...getNodeAutoInstrumentations(),
  ],
});

sdk.start();

console.log('[OTel] SDK inicializado correctamente para service-b');