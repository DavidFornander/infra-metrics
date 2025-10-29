# Docker Setup - What You Need to Know

## Decision: Tempo vs Jaeger ✅

**We've chosen Grafana Tempo** for these reasons:

1. **Simpler** - Single binary, minimal configuration
2. **Native Grafana integration** - No UI to maintain separately
3. **Good enough** - Handles traces for small-to-medium scale
4. **Local storage** - Easy to run locally without S3/object storage

This satisfies **Step 2** of your plan.

---

## Current Docker Stack Status

### ✅ Configured and Ready

- Docker Compose file with all 6 services
- Boot order implemented via `depends_on`
- Volumes for data persistence
- Network isolation
- Tempo configuration file

### ⚠️ Needs Configuration (Before First Run)

Configuration status:

1. ✅ `otel-collector/config.yml` - Configured (sends traces to Tempo)
2. ✅ `alertmanager/alertmanager.yml` - Configured (placeholder null receiver)
3. ✅ `blackbox/blackbox.yml` - Configured (HTTP/HTTPS/TLS/TCP/ICMP probes)
4. ⚠️ `prometheus/prometheus.yml` - Empty (Step 3: add service targets)
5. ⚠️ `prometheus/rules/` - Empty (Step 4 & 7: SLO alerts)
6. ⚠️ `grafana/datasources/` - Empty (Step 5: connect to Prometheus + Tempo)
7. ⚠️ `grafana/dashboards/` - Empty (Step 5: dashboard JSON files)

---

## Key Concepts to Understand

### 1. **The Boot Order Matters**

```
Tempo → OTel → Prometheus → Alertmanager → Grafana → Blackbox
```

**Why?**

- OTel needs Tempo running to send traces
- Prometheus needs OTel running (for optional metrics)
- Alertmanager needs Prometheus (to receive alerts)
- Grafana needs Prometheus + Tempo (for datasources)
- Blackbox is probed by Prometheus

The docker-compose.yml handles this automatically with `depends_on`.

### 2. **Port Mappings**

```
3001  → Grafana UI (your main dashboard)
9090  → Prometheus UI (metrics browser)
9093  → Alertmanager UI (alert status)
3200  → Tempo HTTP API
4317  → OTel gRPC (services send traces here)
9115  → Blackbox metrics endpoint
```

### 3. **Data Persistence**

Three Docker volumes store data across restarts:

- `prometheus-data` - 15 days of metrics
- `grafana-data` - Dashboards, users
- `tempo-data` - 48 hours of traces

**To wipe everything clean**: `docker-compose down -v`

### 4. **Configuration Files Flow**

```
Your service apps
    ↓
    Send traces to → otel-collector:4317
    Expose /metrics → prometheus scrapes these
    ↓
Prometheus
    ↓
    Evaluates rules → Fires alerts to Alertmanager
    ↓
Alertmanager
    ↓
    Routes to → Slack/Email (you configure in Step 6)
    ↓
Grafana
    ↓
    Queries Prometheus + Tempo → Shows in dashboards
```

### 5. **What Happens on First Run?**

When you run `docker-compose up -d`:

1. **Containers start** in dependency order
2. **Grafana** auto-provisions datasources from `grafana/datasources/`
3. **Grafana** auto-loads dashboards from `grafana/dashboards/`
4. **Prometheus** loads its config and starts scraping
5. **Prometheus** loads alert rules from `prometheus/rules/`
6. **Alertmanager** starts listening for alerts
7. **All services** become accessible on their ports

**But**: Until you configure the empty files, most things will be non-functional.

---

## What You Can Do Right Now

### Option A: Start the Stack (It Will Work, Just Empty)

```bash
cd infra/
docker-compose up -d
```

Then visit:

- http://localhost:3001 (Grafana - login: admin/admin)
- http://localhost:9090 (Prometheus - will show no targets)
- http://localhost:3200 (Tempo - ready but no traces)

### Option B: Wait Until Configuration is Ready

Complete Steps 3-11 first (configure files), then start the stack.

---

## What This Enables Going Forward

### ✅ You can now:

1. **See the full architecture** - The docker-compose.yml is your single source of truth
2. **Reference port numbers** - When configuring services
3. **Understand dependencies** - What needs what
4. **Test locally** - Spin up the entire platform
5. **Plan configurations** - You know what files to fill in

### 📋 Next Steps in Your Plan:

- **Step 3**: Create target files (dev/stage/prod) with service hostnames
- **Step 4**: Define SLO template and burn rate windows
- **Step 5-9**: Create placeholder configs for each component
- **Step 10**: ✅ Already documented (boot sequence)
- **Step 11**: Define smoke tests
- **Step 12**: ✅ Already possible (can run locally now)

---

## Critical Things to Remember

### 1. **Local vs Production**

This docker-compose.yml is for **local development**.

For production you'd need:

- Separate docker-compose files per environment
- Resource limits
- Health checks
- TLS/HTTPS
- Real passwords (not admin/admin)
- Persistent volume backups

### 2. **Network Communication**

Inside Docker, services talk by container name:

- `http://prometheus:9090`
- `http://tempo:3200`
- `http://otel-collector:4317`

Outside Docker, you use `localhost`:

- `http://localhost:9090`

### 3. **Configuration Reload**

- **Prometheus**: Can reload config without restart: `curl -X POST http://localhost:9090/-/reload`
- **Grafana**: Auto-provisions on startup (requires restart for changes)
- **Alertmanager**: Can reload: `curl -X POST http://localhost:9093/-/reload`

### 4. **Volumes are Precious**

If you run `docker-compose down -v`, you lose:

- All metrics history
- All Grafana dashboards (if not provisioned)
- All traces

Only use `-v` when you want a clean slate.

---

## Quick Reference Commands

```bash
# Start everything
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f [service-name]

# Stop everything (keep data)
docker-compose down

# Stop and wipe data
docker-compose down -v

# Restart one service
docker-compose restart prometheus

# Rebuild after config change
docker-compose up -d --force-recreate
```

---

## You're Ready When...

✅ You understand:

1. What each of the 6 services does
2. Why the boot order matters
3. What ports each service uses
4. Where persistent data is stored
5. What configuration files you need to create next

✅ You can answer:

- "Where do services send traces?" → `otel-collector:4317`
- "Where does Prometheus store data?" → `prometheus-data` volume
- "How do I access Grafana?" → `http://localhost:3001`
- "What happens if I `down -v`?" → You lose all data

**Status**: You now have a working Docker infrastructure skeleton. It will boot, but won't do anything useful until you configure the individual components (Steps 3-11).
