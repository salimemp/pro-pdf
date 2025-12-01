# Monitoring Quick Start Guide

## 🚀 5-Minute Setup

### 1. Check Metrics Endpoint

```bash
# Start the app
yarn dev

# Test metrics endpoint
curl http://localhost:3000/api/metrics

# Test health endpoint
curl http://localhost:3000/api/metrics/health
```

### 2. Start Prometheus (Local)

```bash
cd monitoring/prometheus
docker-compose up -d

# Check Prometheus UI
open http://localhost:9090

# Verify targets are up
open http://localhost:9090/targets
```

### 3. Connect to Grafana Cloud

1. **Sign up:** https://grafana.com/auth/sign-up
2. **Create stack** and note credentials
3. **Add to .env:**
   ```bash
   GRAFANA_CLOUD_PROMETHEUS_URL=https://prometheus-xxx.grafana.net/api/prom/push
   GRAFANA_CLOUD_PROMETHEUS_USER=123456
   GRAFANA_CLOUD_API_KEY=your_key_here
   ```
4. **Restart Prometheus:**
   ```bash
   cd monitoring/prometheus
   docker-compose restart
   ```

### 4. Import Dashboards

1. Go to Grafana Cloud → **Dashboards** → **Import**
2. Upload these files:
   - `monitoring/grafana/dashboards/application-overview.json`
   - `monitoring/grafana/dashboards/pdf-operations.json`
   - `monitoring/grafana/dashboards/business-metrics.json`
3. Select Prometheus datasource
4. Click **Import**

## 📊 Available Dashboards

### 1. Application Overview
- Request rate and duration
- HTTP status codes
- Memory usage
- System metrics

### 2. PDF Operations
- Conversion rates by operation
- Processing duration
- Active jobs
- File sizes

### 3. Business Metrics
- Total users
- Active sessions
- Login/signup attempts
- Subscription events

## 🔍 Example Queries

```promql
# Request rate
sum(rate(propdf_http_requests_total[5m]))

# P95 response time
histogram_quantile(0.95, sum(rate(propdf_http_request_duration_seconds_bucket[5m])) by (le))

# Error rate
sum(rate(propdf_http_requests_total{status_code=~"5.."}[5m]))

# Conversion success rate
sum(rate(propdf_conversions_total{status="success"}[5m])) / sum(rate(propdf_conversions_total[5m]))

# Active users
propdf_active_sessions
```

## ⚠️ Common Issues

### Metrics endpoint returns 500
```bash
# Check if prom-client is installed
yarn list prom-client

# Reinstall if needed
yarn add prom-client
```

### Prometheus can't scrape
```bash
# Check if app is running
curl http://localhost:3000/api/metrics

# Check Prometheus logs
docker logs pro-pdf-prometheus
```

### No data in Grafana
```bash
# Verify Prometheus is receiving data
open http://localhost:9090/graph
# Run query: propdf_http_requests_total

# Check Grafana datasource
# Grafana → Configuration → Data Sources → Test
```

## 📚 Documentation

For detailed information, see:
- **Full Guide:** `MONITORING_GUIDE.md`
- **Prometheus Config:** `monitoring/prometheus/prometheus.yml`
- **Dashboard JSONs:** `monitoring/grafana/dashboards/`

## 🔗 Quick Links

- **Metrics API:** http://localhost:3000/api/metrics
- **Health Check:** http://localhost:3000/api/metrics/health
- **Prometheus UI:** http://localhost:9090
- **Grafana Cloud:** https://grafana.com/

---

**Need help?** Check the full [MONITORING_GUIDE.md](../MONITORING_GUIDE.md)
