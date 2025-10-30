# Demo Services

Reference implementations showing how to integrate services with the observability platform.

Each demo service demonstrates:
- Metrics collection (`/metrics` endpoint)
- Distributed tracing (OpenTelemetry)
- Health checks for uptime monitoring
- SLO definition and alerting

## Available Demos

- **`demo-typescript/`** - Node.js/TypeScript service integration
- `demo-go/` *(planned)* - Go service integration
- `demo-python/` *(planned)* - Python service integration
- `demo-rust/` *(planned)* - Rust service integration

## Usage

Each demo runs on dedicated ports starting from 4000:
- demo-typescript: 4000
- demo-go: 4001 *(future)*
- etc.

Start a demo service and observe it in the monitoring stack:
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3001
- Tempo: http://localhost:3200
