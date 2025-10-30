# Port Organization

This document defines the port allocation scheme for the observability platform.

## Infrastructure Ports

Core monitoring stack components (various ranges):

| Component | Port | Purpose | Access |
|-----------|------|---------|--------|
| Grafana | 3001 | Dashboards and visualizations | http://localhost:3001 |
| Tempo | 3200 | Trace storage and querying | http://localhost:3200 |
| OTel Collector | 4317/4318 | OTLP gRPC/HTTP trace ingestion | localhost:4317/4318 |
| OTel Collector | 8888 | Collector metrics endpoint | localhost:8888 |
| OTel Collector | 13133 | Health check | localhost:13133 |
| Prometheus | 9090 | Metrics UI and API | http://localhost:9090 |
| Alertmanager | 9093 | Alert routing and notifications | http://localhost:9093 |
| Blackbox Exporter | 9115 | Synthetic monitoring metrics | localhost:9115 |

**Note**: OTel Collector ports 4317/4318 are exposed externally for services to send traces. Other infrastructure ports are primarily for internal monitoring stack communication.

## Service Ports

Application services and demos:

| Range | Purpose | Examples | Access Pattern |
|-------|---------|----------|----------------|
| 4000-4100 | Demo/Reference services | demo-typescript: 4000 | http://localhost:4000 |
| 8000-8999 | Production services | *(future real services)* | http://localhost:8000+ |

## Port Allocation Rules

- **Infrastructure**: Various ports across 3000s-9000s ranges
- **Demo Services**: Ports 4000-4100, increment by 1 per service
- **Production Services**: Ports 8000-8999, assigned as needed
- **Conflicts**: Avoid common development ports (3000, 8080, etc.)

## Port Reservations

**To add a new demo service:**
1. Choose next available port in 4000-4100 range
2. Update this document
3. Update `environments/dev/` target files
4. Update service catalog

**To add a production service:**
1. Choose port in 8000-8999 range (avoid conflicts)
2. Follow same process as demo services

## Troubleshooting

**Port already in use:**
- Check: `lsof -i :PORT` or `netstat -tulpn | grep :PORT`
- Solution: Stop conflicting service or choose different port

**Docker port conflicts:**
- Check: `docker ps` to see running containers
- Solution: `docker-compose down` or change port mapping

## Quick Reference

**Start the stack:**
```bash
cd infra && docker-compose up -d
```

**Access services:**
- Grafana: http://localhost:3001
- Prometheus: http://localhost:9090
- Tempo: http://localhost:3200
- Alertmanager: http://localhost:9093

**Demo services start at 4000:**
- demo-typescript: http://localhost:4000

## Related Documentation

- [Architecture Overview](architecture.md) - System design
- [Docker Setup Guide](docker-setup-guide.md) - Getting started
- [Service Catalog](../catalog/) - Service metadata
