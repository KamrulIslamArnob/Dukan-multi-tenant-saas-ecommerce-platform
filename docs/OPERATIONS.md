# Operations Guide

## Monitoring

### Health Checks
- API Health: `GET http://localhost:5001/health`
- Media Health: `GET http://localhost:5002/health`
- Notification Health: `GET http://localhost:5003/health`

### Metrics
- Prometheus: `http://localhost:9091`
- Grafana: `http://localhost:3001` (admin/admin)
- Loki: `http://localhost:3100`
- Tempo: `http://localhost:3200`

### Logs
All services output structured logs via Serilog. Logs are shipped to Loki via OpenTelemetry.

## Troubleshooting

### Database Connection Issues
1. Check PostgreSQL is running: `docker ps | grep postgres`
2. Verify connection string in appsettings.json
3. Check network connectivity: `docker network ls`

### Redis Connection Issues
1. Check Redis is running: `docker ps | grep redis`
2. Verify Redis connection string
3. Test with: `redis-cli ping`

### Media Service Issues
1. Verify MinIO is accessible: `docker ps | grep minio`
2. Check MinIO credentials in configuration
3. Verify bucket exists and is accessible

## Backup Procedures

### Database Backup
```bash
docker exec postgres pg_dump -U postgres dukaan > backup.sql
```

### Media Backup
MinIO data is stored in the `minio-data` Docker volume.
Backup with volume snapshot tools.