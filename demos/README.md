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

**Local Development Ports** (Docker Compose only):

| Port | Service         | Container Port | Status  |
| ---- | --------------- | -------------- | ------- |
| 5000 | demo-typescript | 8080           | Planned |
| 5001 | demo-go         | 8080           | Planned |
| 5002 | demo-python     | 8080           | Planned |
| 5003 | demo-rust       | 8080           | Planned |

**Port Mapping:**
- **Host (5000+)**: Access from your browser - `http://localhost:5000`
- **Container (8080)**: Standard HTTP port inside the container
- **Internal**: Other containers access via Docker DNS - `http://demo-typescript:8080`

**Note**: These are local development ports. Production deployments use Kubernetes service discovery instead of manual port allocation.

Start a demo service and observe it in the monitoring stack:
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3000
- Tempo: http://localhost:3200
