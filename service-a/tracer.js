const { NodeSDK } = require('@opentelemetry/sdk-node');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-grpc');
const { OTLPMetricExporter } = require('@opentelemetry/exporter-metrics-otlp-grpc');
const { OTLPLogExporter } = require('@opentelemetry/exporter-logs-otlp-grpc');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { PeriodicExportingMetricReader } = require('@opentelemetry/sdk-metrics');
const { SimpleLogRecordProcessor } = require('@opentelemetry/sdk-logs');

const OTLP_HOST = process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://otel-collector.observability:4317';

const sdk = new NodeSDK({
  serviceName: 'service-a',
  traceExporter: new OTLPTraceExporter({ url: OTLP_HOST }),
  metricReader: new PeriodicExportingMetricReader({
    exporter: new OTLPMetricExporter({ url: OTLP_HOST }),
  }),
  logRecordProcessor: new SimpleLogRecordProcessor(new OTLPLogExporter({ url: OTLP_HOST })),
  instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();