# Port Organization

**Context: This is a local development setup using Docker Compose.**

In production environments (Kubernetes), services use **service discovery** and **dynamic port allocation**. Manual port management is only needed for local development.

---

## Port Categories

### External Access Ports (Developer/UI)

Web interfaces for monitoring and debugging:

| Port | Service         | Purpose                       | Access                    | Standard |
| ---- | --------------- | ----------------------------- | ------------------------- | -------- |
| 3000 | Grafana         | Dashboards and visualizations | http://localhost:3000     | ✅ Yes   |
| 3200 | Tempo           | Trace storage and querying    | http://localhost:3200     | ✅ Yes   |
| 9090 | Prometheus      | Metrics UI and API            | http://localhost:9090     | ✅ Yes   |
| 9093 | Alertmanager    | Alert routing and UI          | http://localhost:9093     | ✅ Yes   |

**All ports use industry standards.** If you have a port conflict (e.g., another service on 3000), stop that service or use `docker-compose` port mapping to resolve it locally.

### Service Integration Ports (Exposed to Host)

Ports that application services connect to:

| Port      | Service        | Purpose                           | Usage                                 |
| --------- | -------------- | --------------------------------- | ------------------------------------- |
| 4317      | OTel Collector | OTLP gRPC receiver                | Services send traces/metrics via gRPC |
| 4318      | OTel Collector | OTLP HTTP receiver                | Services send traces/metrics via HTTP |

**Important**: These ports (4317/4318) are **infrastructure ports**, not application service ports. They are reserved for OpenTelemetry ingestion.

### Internal Monitoring Ports (Docker Network Only)

Ports used for internal stack communication (not exposed to host):

| Port | Service            | Purpose                         | Network        |
| ---- | ------------------ | ------------------------------- | -------------- |
| 4317 | Tempo              | OTLP receiver (OTel → Tempo)    | Docker-only    |
| 4318 | Tempo              | OTLP HTTP (OTel → Tempo)        | Docker-only    |
| 8888 | OTel Collector     | Self-monitoring metrics         | localhost:8888 |
| 9115 | Blackbox Exporter  | Synthetic monitoring metrics    | localhost:9115 |
| 13133| OTel Collector     | Health check endpoint           | localhost:13133|

## Application Service Ports

### Philosophy: Local Development vs Production

**This observability stack is designed for local development using Docker Compose.**

In production environments (Kubernetes), services use:
- **Service discovery** (DNS-based routing: `http://service-name.namespace.svc.cluster.local`)
- **Dynamic port assignment** (Kubernetes assigns ports automatically)
- **Ingress controllers** or **service mesh** for external access
- **No manual port management** needed

The ports documented below are **for local development convenience only.**

---

### Demo/Reference Services

Demonstration services for testing the observability stack locally:

| Port | Service          | Container Port | Status   | Access                    |
| ---- | ---------------- | -------------- | -------- | ------------------------- |
| 5000 | demo-typescript  | 8080           | Planned  | http://localhost:5000     |
| 5001 | demo-go          | 8080           | Planned  | http://localhost:5001     |
| 5002 | demo-python      | 8080           | Planned  | http://localhost:5002     |
| 5003 | demo-rust        | 8080           | Planned  | http://localhost:5003     |

**Port Mapping Explanation:**
- **Host port (5000-5003)**: For accessing from your browser/curl on localhost
- **Container port (8080)**: Standard HTTP port inside the container
- **Internal access**: Other containers use `http://demo-typescript:8080` (Docker DNS)

**Why 5000+?**
- Avoids common development ports (3000, 4000, 8000, 8080)
- Easy to remember range for demos
- In production, these would use service discovery instead

---

### Production Services

**Production services do NOT use manual port allocation.**

In production environments:

```yaml
# Kubernetes Example
apiVersion: v1
kind: Service
metadata:
  name: payment-api
spec:
  selector:
    app: payment-api
  ports:
    - port: 80
      targetPort: 8080
  # Access via: http://payment-api.default.svc.cluster.local
```

**Why no manual ports in production?**
1. **Service discovery**: DNS handles routing (`payment-api.namespace.svc.cluster.local`)
2. **Dynamic scaling**: Multiple replicas can't share the same port
3. **Service mesh**: Envoy/Istio handle traffic routing
4. **Ingress controllers**: External access goes through load balancers
5. **Port exhaustion**: Manual allocation doesn't scale beyond ~50 services

**For local Docker Compose testing of production services:**
- Use any available port range (suggestion: 6000+)
- Document in the service's `docker-compose.override.yml`
- Remember: This is testing only, not production architecture

---

## Port Allocation Strategy

### Service Port Pattern

Each service exposes **one HTTP/gRPC port** with standard endpoints:

- **Main traffic**: Service port (e.g., 8080 inside container)
- **Metrics**: `/metrics` endpoint (Prometheus scraping)
- **Health check**: `/health` or `/healthz` endpoint
- **Readiness**: `/ready` endpoint (optional)

**No separate metrics ports needed** - follow Prometheus best practices by exposing metrics on the same HTTP server.

### Infrastructure Port Rules

1. ✅ **Use industry-standard ports** (Grafana=3000, Prometheus=9090, OTel=4317/4318)
2. ✅ **Document deviations** if you must change a standard port
3. ✅ **Distinguish external vs internal** ports clearly
4. ✅ **Keep infrastructure separate** from application service ranges

### Local Development vs Production

| Aspect | Local (Docker Compose) | Production (Kubernetes) |
|--------|------------------------|-------------------------|
| Port allocation | Manual (documented here) | Dynamic (K8s assigns) |
| Service discovery | Docker DNS (`service-name:port`) | K8s DNS (`service.namespace.svc.cluster.local`) |
| External access | `localhost:PORT` | Ingress/LoadBalancer |
| Scaling | Single instance per service | Multiple replicas |
| Port conflicts | Manually avoid | Not applicable |

## Adding New Services

### Demo Service (Local Development)

1. **Choose next available port**: 5004+ (5000-5003 are taken)
2. **Define docker-compose service**:
   ```yaml
   demo-java:
     image: demo-java:latest
     container_name: demo-java
     networks:
       - observability
     ports:
       - "5004:8080"  # localhost:5004 -> container:8080
     environment:
       - OTEL_EXPORTER_OTLP_ENDPOINT=http://otel-collector:4317
   ```
3. **Update documentation**:
   - Add to this file's demo services table
   - Update `demos/README.md`
4. **Configure monitoring**:
   - Add Prometheus scrape target: `http://demo-java:8080/metrics`
   - Create service catalog entry
5. **Access**:
   - External: `http://localhost:5004`
   - Internal (from other containers): `http://demo-java:8080`

### Production Service (Kubernetes)

Production services use **service discovery**, not manual ports.

**Example Kubernetes manifests:**

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: payment-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: payment-api
  template:
    metadata:
      labels:
        app: payment-api
    spec:
      containers:
      - name: payment-api
        image: payment-api:v1.0.0
        ports:
        - containerPort: 8080
          name: http
        env:
        - name: OTEL_EXPORTER_OTLP_ENDPOINT
          value: "http://otel-collector.observability:4317"
---
# service.yaml
apiVersion: v1
kind: Service
metadata:
  name: payment-api
spec:
  selector:
    app: payment-api
  ports:
    - protocol: TCP
      port: 80
      targetPort: 8080
  # Other services access via: http://payment-api
```

**No port allocation needed** - Kubernetes handles everything.

**For local testing** (optional):
- Add to local `docker-compose.override.yml` with any free port (6000+)
- This is NOT the production setup, just for local integration testing

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
- Grafana: http://localhost:3000
- Prometheus: http://localhost:9090
- Tempo: http://localhost:3200
- Alertmanager: http://localhost:9093

**Demo services (when running):**
- demo-typescript: http://localhost:5000
- demo-go: http://localhost:5001 *(planned)*
- demo-python: http://localhost:5002 *(planned)*
- demo-rust: http://localhost:5003 *(planned)*

**OTel ingestion (for services to send telemetry):**
- OTLP gRPC: localhost:4317
- OTLP HTTP: localhost:4318

## Related Documentation

- [Architecture Overview](architecture.md) - System design
- [Docker Setup Guide](docker-setup-guide.md) - Getting started
- [Service Catalog](../catalog/) - Service metadata
