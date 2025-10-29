# Infrastructure Docker Stack

This directory contains the Docker Compose configuration for the entire observability platform.

## Quick Start

```bash
# From the infra/ directory
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f

# Stop everything
docker-compose down

# Stop and remove volumes (clean slate)
docker-compose down -v
```

## Service URLs (Once Running)

| Service | URL | Purpose |
|---------|-----|---------|
| Grafana | http://localhost:3000 | Dashboards (admin/admin) |
| Prometheus | http://localhost:9090 | Metrics browser |
| Alertmanager | http://localhost:9093 | Alert status |
| Tempo | http://localhost:3200 | Trace backend |
| Blackbox | http://localhost:9115 | Probe metrics |
| OTel Collector | http://localhost:13133 | Health check |

## Boot Order (Dependency Chain)

The services start in this order to avoid connection failures:

1. **Tempo** (trace backend) - Must be up first so OTel can connect
2. **OTel Collector** - Receives traces from services
3. **Prometheus** - Scrapes metrics
4. **Alertmanager** - Receives alerts from Prometheus
5. **Grafana** - Queries Prometheus for dashboards
6. **Blackbox** - Probed by Prometheus

This is handled automatically via `depends_on` in docker-compose.yml.

## What Each Service Does

### Tempo (Trace Backend)
- **Image**: `grafana/tempo:latest`
- **Ports**: 3200 (HTTP), 4317 (OTLP gRPC), 4318 (OTLP HTTP)
- **Purpose**: Stores distributed traces
- **Config**: `tempo/tempo.yml`
- **Data**: Stored in `tempo-data` volume

### OpenTelemetry Collector
- **Image**: `otel/opentelemetry-collector-contrib:latest`
- **Ports**: 4317 (OTLP gRPC), 4318 (HTTP), 8888 (self-metrics)
- **Purpose**: Receives traces/metrics from services and routes them
- **Config**: `otel-collector/config.yml`
- **Flow**: Services → OTel → Tempo (traces) + Prometheus (metrics)

### Prometheus
- **Image**: `prom/prometheus:latest`
- **Port**: 9090
- **Purpose**: Time-series database for metrics
- **Config**: `prometheus/prometheus.yml`
- **Retention**: 15 days (configurable via `--storage.tsdb.retention.time`)
- **Data**: Stored in `prometheus-data` volume

### Alertmanager
- **Image**: `prom/alertmanager:latest`
- **Port**: 9093
- **Purpose**: Routes alerts to Slack/Email/Pager
- **Config**: `alertmanager/alertmanager.yml`

### Grafana
- **Image**: `grafana/grafana:latest`
- **Port**: 3000
- **Purpose**: Dashboard UI
- **Login**: admin/admin (CHANGE IN PRODUCTION)
- **Config**: Auto-provisions datasources and dashboards
- **Data**: Stored in `grafana-data` volume

### Blackbox Exporter
- **Image**: `prom/blackbox-exporter:latest`
- **Port**: 9115
- **Purpose**: External HTTP/TLS/TCP probes
- **Config**: `blackbox/blackbox.yml`

## Volumes (Persistent Data)

These Docker volumes persist data across container restarts:

- `prometheus-data` - Metrics time-series (15 days by default)
- `grafana-data` - Dashboard configs, users, settings
- `tempo-data` - Trace data (48 hours by default)

**To reset everything**: `docker-compose down -v`

## Network

All services run on a shared `observability` bridge network.

This allows:
- Services to communicate by container name (e.g., `http://prometheus:9090`)
- Isolation from other Docker networks
- Easy service discovery

## Configuration Files Status

Before first run, you need to populate these files:

- [ ] `prometheus/prometheus.yml` - Scrape targets
- [ ] `prometheus/rules/` - Alert rules
- [ ] `alertmanager/alertmanager.yml` - Notification routing
- [ ] `grafana/datasources/` - Prometheus + Tempo datasources
- [ ] `grafana/dashboards/` - Dashboard JSON files
- [ ] `blackbox/blackbox.yml` - Probe modules
- [x] `otel-collector/config.yml` - Trace/metric pipeline
- [x] `tempo/tempo.yml` - Trace storage config

## Choosing Between Tempo and Jaeger

### Use Tempo if:
- ✅ You want simplicity (fewer moving parts)
- ✅ You're already using Grafana
- ✅ You don't need advanced sampling strategies
- ✅ You want native Grafana integration

### Use Jaeger if:
- ✅ You need the Jaeger UI's specific features
- ✅ You have existing Jaeger infrastructure
- ✅ You need adaptive sampling

**Current choice**: Tempo (configured)

To switch to Jaeger:
1. Comment out the `tempo` service in docker-compose.yml
2. Uncomment the `jaeger` service
3. Update `otel-collector/config.yml` to export to Jaeger instead of Tempo

## Resource Limits (Optional)

For production, add resource limits:

```yaml
services:
  prometheus:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
```

## Health Checks

OTel Collector exposes a health endpoint at `:13133/health`

Check it with:
```bash
curl http://localhost:13133
```

## Troubleshooting

### Services won't start
```bash
# Check logs for the failing service
docker-compose logs <service-name>

# Common issues:
# - Config file syntax error
# - Port already in use
# - Missing config file
```

### Prometheus can't scrape targets
- Check that target services are reachable from the `observability` network
- Verify `/metrics` endpoints are exposed
- Check `prometheus/prometheus.yml` scrape configs

### Grafana shows "No data"
- Verify Prometheus datasource is configured in `grafana/datasources/`
- Check Prometheus is scraping targets successfully (http://localhost:9090/targets)
- Verify dashboard queries are correct

### OTel Collector not receiving traces
- Check services are sending to `http://otel-collector:4317` (gRPC) or `:4318` (HTTP)
- Verify OTel SDK is initialized in your services
- Check collector logs: `docker-compose logs otel-collector`

## Next Steps

1. **Configure Prometheus** - Add scrape targets in `prometheus/prometheus.yml`
2. **Configure Grafana** - Add datasources and dashboards
3. **Configure Alertmanager** - Set up notification channels
4. **Configure Blackbox** - Define probe modules
5. **Configure OTel** - Set up trace/metric exporters
6. **Start the stack** - `docker-compose up -d`
7. **Smoke test** - Verify all UIs are accessible

## Security Notes (PRODUCTION)

⚠️ Before deploying to production:

1. **Change Grafana password** - Default is `admin/admin`
2. **Add authentication** - Consider adding reverse proxy with auth
3. **Use secrets** - Don't commit passwords in docker-compose.yml
4. **Network isolation** - Restrict port exposure
5. **TLS/HTTPS** - Enable HTTPS for all UIs
6. **Update images** - Pin specific versions instead of `latest`
