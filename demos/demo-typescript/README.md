# Demo TypeScript Service

A reference implementation demonstrating observability best practices with **OpenTelemetry**, **Prometheus**, and **distributed tracing** using Node.js, TypeScript, and Express.

This service showcases production-ready patterns for instrumenting applications with metrics, logs, and traces - the three pillars of observability.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Quick Start](#quick-start)
- [Local Development](#local-development)
- [API Endpoints](#api-endpoints)
- [Observability](#observability)
- [Docker](#docker)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

**Purpose**: Demonstrate how to build observable microservices with industry-standard tools

**Tech Stack**:
- **Runtime**: Node.js 20 + TypeScript (strict mode)
- **Framework**: Express.js
- **Logging**: Pino (structured JSON logging)
- **Metrics**: Prometheus client (`prom-client`)
- **Tracing**: OpenTelemetry SDK with OTLP exporter
- **Build**: Multi-stage Docker build

**Key Concepts Demonstrated**:
- ✅ Auto-instrumentation with OpenTelemetry
- ✅ Custom Prometheus metrics (histograms, counters, gauges)
- ✅ Distributed tracing with context propagation
- ✅ Health checks (liveness + readiness probes)
- ✅ Graceful shutdown
- ✅ Production-ready Docker image
- ✅ Service catalog integration

---

## ✨ Features

### Observability
- **Metrics**: Prometheus exposition format at `/metrics`
  - HTTP request duration (histogram)
  - Request count by method/route/status (counter)
  - In-flight requests (gauge)
  - Node.js runtime metrics (memory, CPU, event loop)

- **Tracing**: OpenTelemetry with OTLP gRPC export
  - Automatic HTTP/Express instrumentation
  - Trace context propagation
  - Integration with Grafana Tempo

- **Logging**: Structured JSON logs with Pino
  - Request/response logging
  - Correlation IDs
  - Pretty printing for local development
  - JSON format for production

### Endpoints
- `GET /` - Service metadata
- `GET /health` - Liveness probe (uptime)
- `GET /ready` - Readiness probe
- `GET /metrics` - Prometheus metrics
- `GET /api/users` - List mock users
- `GET /api/users/:id` - Get user by ID
- `GET /api/slow` - Slow endpoint (500-2000ms delay) for latency testing

---

## 🏗️ Architecture

```
┌─────────────────┐
│  Your Request   │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│  demo-typescript (Express + OTel)       │
│  ┌─────────────────────────────────┐   │
│  │  HTTP Middleware Stack          │   │
│  │  1. Pino Logger                 │   │
│  │  2. Metrics Middleware          │   │
│  │  3. OTel Auto-Instrumentation   │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Exports:                               │
│  • Metrics → :8080/metrics              │
│  • Traces  → OTel Collector:4317        │
│  • Logs    → stdout (structured JSON)   │
└─────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│  Observability Stack                    │
│  ┌──────────────┐  ┌────────────────┐  │
│  │  Prometheus  │  │ OTel Collector │  │
│  │  (scrapes)   │  │   (receives)   │  │
│  └──────┬───────┘  └────────┬───────┘  │
│         │                   │           │
│         ▼                   ▼           │
│  ┌──────────────┐  ┌────────────────┐  │
│  │   Grafana    │  │  Tempo (traces)│  │
│  │ (dashboards) │  │                │  │
│  └──────────────┘  └────────────────┘  │
└─────────────────────────────────────────┘
```

**Data Flow**:
1. HTTP request arrives → Express server
2. Pino logs request details (with trace ID)
3. Metrics middleware records duration/status
4. OTel creates spans for HTTP + Express layers
5. Spans exported to OTel Collector via gRPC
6. Collector forwards to Tempo for storage
7. Prometheus scrapes `/metrics` every 10s
8. Grafana queries both Prometheus + Tempo

---

## 🚀 Quick Start

### Prerequisites
- Docker Desktop running
- Node.js 20+ (for local development)
- curl or Postman (for testing)

### Start the Full Stack

```bash
# From project root
cd infra
docker compose up -d

# Wait 10 seconds for services to start
sleep 10

# Verify service is healthy
curl http://localhost:5001/health
```

### Access Points
- **Service**: http://localhost:5001
- **Metrics**: http://localhost:5001/metrics
- **Grafana**: http://localhost:3000 (admin/admin)
- **Prometheus**: http://localhost:9090
- **Tempo**: http://localhost:3200

---

## 💻 Local Development

### Install Dependencies

```bash
cd demos/demo-typescript
npm install
```

### Run in Development Mode

```bash
# Start with auto-reload
npm run dev

# Or build and run
npm run build
npm start
```

**Environment Variables**:
```bash
PORT=8080                                    # HTTP server port
NODE_ENV=development                          # Environment (dev uses pretty logs)
OTEL_SERVICE_NAME=demo-typescript             # Service name for traces
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4317  # OTel Collector endpoint
LOG_LEVEL=info                                # Logging level (debug/info/warn/error)
```

### Development Workflow

```bash
# 1. Make code changes in src/

# 2. Build TypeScript
npm run build

# 3. Run linter (if configured)
npm run lint

# 4. Test locally
curl http://localhost:8080/health

# 5. Check metrics
curl http://localhost:8080/metrics | grep http_request
```

---

## 📡 API Endpoints

### Health Checks

#### `GET /health` (Liveness Probe)
Returns service health and uptime.

```bash
curl http://localhost:5001/health
```

**Response**:
```json
{
  "status": "healthy",
  "timestamp": "2025-10-30T23:52:50.655Z",
  "uptime": 42
}
```

#### `GET /ready` (Readiness Probe)
Indicates if service is ready to accept traffic.

```bash
curl http://localhost:5001/ready
```

**Response**: `200 OK` (empty body)

### Service Info

#### `GET /`
Returns service metadata and available endpoints.

```bash
curl http://localhost:5001/
```

**Response**:
```json
{
  "service": "demo-typescript",
  "version": "1.0.0",
  "message": "Hello from demo-typescript observability service!",
  "endpoints": {
    "health": "/health",
    "ready": "/ready",
    "metrics": "/metrics",
    "api": "/api/users"
  }
}
```

### User API

#### `GET /api/users`
Returns list of mock users (for testing).

```bash
curl http://localhost:5001/api/users
```

**Response**:
```json
{
  "users": [
    {
      "id": 1,
      "name": "Alice Johnson",
      "email": "alice@example.com",
      "role": "admin"
    }
    // ... 4 more users
  ],
  "count": 5
}
```

#### `GET /api/users/:id`
Get specific user by ID.

```bash
curl http://localhost:5001/api/users/3
```

**Response**:
```json
{
  "id": 3,
  "name": "Charlie Brown",
  "email": "charlie@example.com",
  "role": "user"
}
```

**Error Response** (404):
```json
{
  "error": "User not found"
}
```

### Testing Endpoints

#### `GET /api/slow`
Simulates a slow request (random 500-2000ms delay). Useful for testing latency monitoring.

```bash
curl http://localhost:5001/api/slow
```

**Response**:
```json
{
  "message": "This was a slow request",
  "delay_ms": 1247,
  "timestamp": "2025-10-30T23:52:50.655Z"
}
```

---

## 📊 Observability

### Viewing Metrics in Prometheus

1. Open Prometheus: http://localhost:9090
2. Try these queries:

**Request Rate**:
```promql
rate(http_requests_total{job="demo-typescript"}[5m])
```

**P95 Latency**:
```promql
histogram_quantile(0.95, 
  rate(http_request_duration_seconds_bucket{job="demo-typescript"}[5m])
)
```

**Error Rate**:
```promql
rate(http_requests_total{job="demo-typescript", status_code=~"5.."}[5m])
```

**In-Flight Requests**:
```promql
http_requests_in_flight{job="demo-typescript"}
```

### Viewing Traces in Grafana

1. Open Grafana: http://localhost:3000 (admin/admin)
2. Navigate to **Explore** (compass icon)
3. Select **Tempo** data source
4. Search for traces:
   - By service: `demo-typescript`
   - By operation: `GET /api/users`
   - By duration: `> 100ms`

**Generate Test Traffic**:
```bash
# Generate some requests to create traces
for i in {1..10}; do
  curl -s http://localhost:5001/api/users > /dev/null
  curl -s http://localhost:5001/api/slow > /dev/null
done
```

### Viewing Logs

**Docker Logs**:
```bash
docker logs demo-typescript -f
```

**Filter by Level**:
```bash
docker logs demo-typescript 2>&1 | grep '"level":30'  # Info
docker logs demo-typescript 2>&1 | grep '"level":40'  # Warn
docker logs demo-typescript 2>&1 | grep '"level":50'  # Error
```

**Pretty Print JSON Logs**:
```bash
docker logs demo-typescript 2>&1 | jq .
```

---

## 🐳 Docker

### Build Image

```bash
cd demos/demo-typescript
docker build -t demo-typescript:latest .
```

**Multi-stage build**:
- Stage 1 (builder): Installs all deps, compiles TypeScript
- Stage 2 (production): Only production deps + compiled JS
- Result: ~200MB image (vs ~500MB without multi-stage)

### Run Standalone Container

```bash
docker run -d \
  --name demo-typescript \
  -p 8080:8080 \
  -e NODE_ENV=production \
  -e OTEL_EXPORTER_OTLP_ENDPOINT=http://host.docker.internal:4317 \
  demo-typescript:latest

# Check health
docker exec demo-typescript wget -qO- http://localhost:8080/health

# View logs
docker logs -f demo-typescript

# Stop
docker rm -f demo-typescript
```

### Docker Compose

The service is already configured in `infra/docker-compose.yml`:

```bash
# Start all services
cd infra
docker compose up -d

# View service logs
docker compose logs -f demo-typescript

# Restart just this service
docker compose restart demo-typescript

# Stop everything
docker compose down
```

---

## 🧪 Testing

### Manual Testing

```bash
# Health check
curl http://localhost:5001/health

# Get users
curl http://localhost:5001/api/users | jq .

# Get specific user
curl http://localhost:5001/api/users/2 | jq .

# Test 404
curl http://localhost:5001/api/users/999

# Test slow endpoint
time curl http://localhost:5001/api/slow

# Check metrics
curl http://localhost:5001/metrics | grep http_request
```

### Load Testing (Optional)

Using Apache Bench:
```bash
# 1000 requests, 10 concurrent
ab -n 1000 -c 10 http://localhost:5001/api/users
```

Using curl loop:
```bash
# Generate traffic for 30 seconds
end=$((SECONDS+30))
while [ $SECONDS -lt $end ]; do
  curl -s http://localhost:5001/api/users > /dev/null &
  sleep 0.1
done
wait
```

Then check Prometheus for metrics spike!

---

## 🔧 Troubleshooting

### Service Won't Start

**Check Docker logs**:
```bash
docker logs demo-typescript
```

**Common issues**:
- Port 5001 already in use: Change port in `docker-compose.yml`
- OTel Collector not running: Start with `docker compose up -d otel-collector`

### No Metrics in Prometheus

**Verify service is being scraped**:
```bash
# Check Prometheus targets
curl http://localhost:9090/api/v1/targets | jq '.data.activeTargets[] | select(.labels.job == "demo-typescript")'
```

**If target is missing**:
```bash
# Reload Prometheus config
curl -X POST http://localhost:9090/-/reload
```

**Manual metrics check**:
```bash
curl http://localhost:5001/metrics
```

### No Traces in Tempo

**Check OTel Collector is receiving**:
```bash
# Collector metrics (should show spans received)
curl http://localhost:8888/metrics | grep otelcol_receiver
```

**Verify OTLP endpoint**:
```bash
# From inside container
docker exec demo-typescript sh -c 'nc -zv otel-collector 4317'
```

**Generate test traffic**:
```bash
# Create traces
for i in {1..5}; do
  curl http://localhost:5001/api/users
done

# Wait 10 seconds for batching
sleep 10

# Search in Grafana → Explore → Tempo
```

### High Memory Usage

**Check container stats**:
```bash
docker stats demo-typescript
```

**Normal usage**: ~150-200MB
**High usage**: Check for memory leaks in custom code

### Debugging Performance

**Enable debug logs**:
```bash
docker compose restart demo-typescript
docker compose exec demo-typescript sh -c 'kill -USR2 1'  # Toggle log level
```

**Profile with Node.js**:
```bash
# Locally
node --inspect dist/index.js
# Then open chrome://inspect
```

---

## 📚 Additional Resources

- [OpenTelemetry Documentation](https://opentelemetry.io/docs/instrumentation/js/)
- [Prometheus Best Practices](https://prometheus.io/docs/practices/naming/)
- [Grafana Tempo Guide](https://grafana.com/docs/tempo/latest/)
- [Express.js Documentation](https://expressjs.com/)
- [Pino Logger](https://getpino.io/)

---

## 📝 License

Part of the `infra-metrics` observability platform demo.

---

## 🤝 Contributing

This is a reference implementation. Feel free to:
- Add more endpoints
- Implement additional metrics
- Create custom Grafana dashboards
- Add alert rules

See [../../docs/CONTRIBUTING.md](../../docs/CONTRIBUTING.md) for guidelines.
