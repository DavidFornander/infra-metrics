# Platform Observability

This repository contains the monitoring, tracing, alerting, and service ownership layer for the system.

The goal is to provide:

- Visibility into service behavior
- SLO-based alerts, not noisy CPU/host alerts
- A single place to understand what services exist and who owns them
- A repeatable pattern for future services

This is inspired by Spotify's internal observability model: metrics + traces + dashboards + ownership separated from app code.

---

## Repository Structure

```text
platform-observability/
│
├─ infra/                        # The monitoring + tracing stack
│   ├─ prometheus/               # Metrics storage + scrape config
│   ├─ alertmanager/             # Alert routing + severity rules
│   ├─ grafana/                  # Dashboards + data sources
│   ├─ otel-collector/           # Trace + metric pipeline
│   └─ blackbox/                 # External uptime + TLS probes
│
├─ environments/                 # Where endpoints differ per environment
│   ├─ dev/                      # Local / test service endpoints
│   ├─ stage/                    # Pre-production endpoints
│   └─ prod/                     # Production endpoints
│
├─ catalog/                      # Service metadata (ownership, dashboards, SLO links)
│   ├─ service-a.yaml
│   ├─ service-b.yaml
│   └─ ...
│
├─ docs/                         # Operational and system knowledge
│   ├─ architecture.md
│   ├─ service-ownership.md
│   ├─ slo-template.md
│   └─ oncall-runbook.md
│
└─ scripts/                      # Optional helper scripts
```

---

## What Each Part Does (Short, Straight)

| Directory     | Purpose |
|---------------|---------|
| infra/        | Runs the actual monitoring tools (Prometheus, Grafana, OTel, Alertmanager, Blackbox). |
| environments/ | Defines which services are monitored in dev / stage / prod. Only the targets change. |
| catalog/      | List of your services and who owns them (metadata only, no code). |
| docs/         | How the system works, how to define SLOs, and what to do during incidents. |
| scripts/      | Optional automation helpers. |

---

## What the catalog/ Folder Is

This is your service inventory.

Each YAML file in catalog/ describes one real service:

- Name of the service
- Who owns it
- Repository link
- Link to its Grafana dashboard
- Link to its SLO definition

This is not tied to Backstage.
Backstage is just a UI that can read these files later if you choose to add it.

You can run this system perfectly without Backstage.

---

## Why This Repo Exists

Without a central observability platform:

- Metrics end up scattered
- Alerting becomes inconsistent or noisy
- Ownership becomes tribal knowledge
- Onboarding becomes slow
- Systems degrade silently

This repository solves that by establishing:

1. One place to monitor all services
2. One way to define SLOs
3. One place to check uptime
4. One place to understand who owns what

---

## How You Will Use This Repo (Practical Flow)

1. Stand up the platform (Prometheus + Grafana + Alertmanager + OTel + Blackbox).
2. Pick one real service and:
   - Add /metrics
   - Add OpenTelemetry instrumentation
   - Add it to environments/dev/prometheus.targets.yml
   - Create its first SLO
   - Create its dashboard
   - Add its metadata file under catalog/
3. Confirm:
   - You see its metrics
   - You see its traces
   - Its dashboard loads
   - Its SLO alert rules evaluate
4. Repeat for remaining services, one at a time.
