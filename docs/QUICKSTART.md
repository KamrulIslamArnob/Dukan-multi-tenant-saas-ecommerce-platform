# Dukaan — Quickstart Guide

**One command to start everything:**
```powershell
.\dev.ps1
```

## URLs

| Service | URL | Credentials |
|---------|-----|-------------|
| Frontend | http://localhost:3000 | — |
| Dukaan API (Swagger) | http://localhost:5001/swagger | — |
| Dukaan Media API | http://localhost:5002/swagger | — |
| Dukaan Notification API | http://localhost:5003/swagger | — |
| Grafana | http://localhost:3001 | admin / admin |
| MinIO Console | http://localhost:9001 | minioadmin / minioadmin |
| MailHog UI | http://localhost:8025 | — |
| Hangfire Dashboard (API) | http://localhost:5001/hangfire | — |
| Hangfire Dashboard (Media) | http://localhost:5002/hangfire | — |

## Test Credentials

| User | Email | Password | Type |
|------|-------|----------|------|
| Merchant | `demo@example.com` | `Demo@123` | Can manage products, categories, orders |
| Customer | `customer@example.com` | `Customer@123` | Can browse storefront, cart, orders |

## Commands

```bash
# Start backend only
cd backend && docker compose up -d

# Start frontend only
cd frontend/dukaan-web && npm run dev

# Stop everything
cd backend && docker compose down

# Run backend tests
cd backend/Dukaan && dotnet test

# Run frontend tests
cd frontend/dukaan-web && npm test

# Lint frontend
cd frontend/dukaan-web && npm run lint

# Build frontend
cd frontend/dukaan-web && npm run build
```

## Key Environment Variables

Create `frontend/dukaan-web/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5001
NEXT_PUBLIC_MEDIA_API_URL=http://localhost:5002
NEXT_PUBLIC_MINIO_URL=http://localhost:9000/dukaan-media
NEXT_PUBLIC_NOTIFICATION_API_URL=http://localhost:5003
```

## Storefront Access

Every merchant has a **slug** (e.g., `demo-store`). Storefront is at:
```
http://localhost:3000/store/{slug}
```
