import client from "prom-client";

export const register = new client.Registry();

// Default system metrics
client.collectDefaultMetrics({
  register,
});

// HTTP Metrics
export const httpRequestDuration = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route", "status_code"],
  buckets: [0.1, 0.3, 0.5, 1, 2, 5],
});

// Request Counter
export const httpRequestsTotal = new client.Counter({
  name: "http_requests_total",
  help: "Total HTTP requests",
  labelNames: ["method", "route", "status_code"],
});

// Mongo Query Duration
export const mongoQueryDuration = new client.Histogram({
  name: "mongo_query_duration_seconds",
  help: "MongoDB query duration",
  labelNames: ["operation", "collection"],
  buckets: [0.005, 0.01, 0.05, 0.1, 0.5, 1],
});

// Register all
register.registerMetric(httpRequestDuration);
register.registerMetric(httpRequestsTotal);
register.registerMetric(mongoQueryDuration);