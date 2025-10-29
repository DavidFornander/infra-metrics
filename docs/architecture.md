# Architecture Overview

This document describes the observability architecture: how metrics, traces, alerts, and uptime checks flow through the system.
It does not describe any application logic.

---

## System Purpose

Provide a central platform that:

- Collects metrics from all services
- Collects distributed traces
- Displays dashboards
- Sends actionable SLO-based alerts
- Tracks service ownership

This runs independently of application repos.

---

## Core Components

| Component               | Role                                                                                |
| ----------------------- | ----------------------------------------------------------------------------------- |
| Prometheus              | Scrapes metrics from services and exporters. Stores time-series data.               |
| Alertmanager            | Processes alerts from Prometheus and sends notifications.                           |
| Grafana                 | UI for dashboards and visualizations.                                               |
| OpenTelemetry Collector | Receives traces + metrics and routes them (mainly to Prometheus + a trace backend). |
| **Grafana Tempo**       | Stores and lets you query distributed traces. Simple, native Grafana integration.   |
| Blackbox Exporter       | Performs external HTTP/TLS uptime probes.                                           |

### Trace Backend Decision

**Choice: Grafana Tempo**

Reasons:

- Simple single-binary deployment
- Native integration with Grafana (no separate UI)
- Good performance for small-to-medium scale
- Easy local development with file-based storage
- Minimal configuration overhead

Alternative considered: Jaeger (more features but more complex)

---

## Data Flow

```text
   Services
     │
     │  (Instrumentation via OpenTelemetry SDK)
     ▼
OpenTelemetry Collector
     │
     ├─ sends metrics → Prometheus (time series)
     └─ sends traces → Tempo (spans)
```

For external uptime checks:

```text
Blackbox Exporter → Prometheus → Grafana dashboards + Alertmanager alerts
```

Dashboards and alerts:

```text
Prometheus → Grafana (dashboards)
Prometheus → Alertmanager → Slack / Email / Pager
```

---

## Environment Separation

Service endpoints differ by environment:

```text
environments/
  dev/
    prometheus.targets.yml
    blackbox.targets.yml

  stage/
    prometheus.targets.yml
    blackbox.targets.yml

  prod/
    prometheus.targets.yml
    blackbox.targets.yml
```

Only these files change between environments.
The platform configuration stays constant.

---

## Service Catalog

```text
catalog/
  service-a.yaml
  service-b.yaml
  ...
```

Each file declares:

- Service name
- Owner
- Repository URL
- Dashboard URL
- SLO reference

This provides the service inventory.
You do not need Backstage to use it.

---

## SLOs and Alerting

Each service gets one primary SLO (availability or latency).

Alerts use the burn rate model:

- Fast burn → Incident is happening now.
- Slow burn → Error budget leaking gradually.

SLO rules live in:

```text
infra/prometheus/rules/service-slo.rules
```

Infrastructure alerts (instance down, disk full, etc.) live in:

```text
infra/prometheus/rules/infra.rules
```

Alert routing is defined in:

```text
infra/alertmanager/alertmanager.yml
```

---

## Boot Sequence (Startup Order)

1. Grafana Tempo (trace backend)
2. OpenTelemetry Collector
3. Prometheus
4. Alertmanager
5. Grafana
6. Blackbox Exporter

Once running, add services one at a time.

This order ensures each service's dependencies are available when it starts.
The docker-compose.yml in `infra/` enforces this automatically.

---

## What "Done" Looks Like (Acceptance)

- Prometheus shows all UP or probe_success=1 targets.
- Grafana has:
  - A Global Overview dashboard.
  - A Service Template dashboard duplicated per service.
- Tempo shows end-to-end request traces.
- One service has:
  - /metrics endpoint
  - OTel instrumentation
  - An SLO with working alerts
  - catalog/ contains metadata for at least that service.
