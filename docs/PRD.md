# Dukaan — Multi-Vendor E-Commerce Platform

**Status:** Draft  
**Version:** 1.0.0  
**Last Updated:** 2026-07-22

---

## 1. What Is Dukaan?

Dukaan is a **multi-vendor e-commerce platform** that enables:

- **Merchants** to register their own store (tenant), manage products, categories, inventory, and process orders.
- **Customers** to browse storefronts, manage carts, place orders, manage addresses, and receive real-time notifications.
- **Platform operators** to run a scalable, observable system with media processing and notification dispatch.

Dukaan follows a **microservices architecture** with a **.NET 10 backend** (Clean Architecture) and a **Next.js 16 frontend**.

---

## 2. Why Dukaan?

**Business problem:** Existing e-commerce platforms lock merchants into rigid ecosystems. Merchants need:
- An independent store identity (custom slug, branding)
- Isolated data (no cross-tenant leak)
- Media management (image upload, processing, hosting)
- Real-time notifications (order updates via WebSocket + email)

**Technical goals:**
- **Multi-tenancy** — shared database, isolated data via EF Core global query filters
- **Event-driven** — async inter-service communication via Redis Streams
- **Observability** — structured logging, distributed tracing, metrics (OpenTelemetry → Grafana)
- **Scalability** — horizontal scaling of notification service via Redis backplane + consumer groups
- **Clean Architecture** — maintainability, testability, dependency inversion

---

## 3. Architecture Overview

### 3.1 High-Level System Diagram

```
                          ┌──────────────────────────────────────────────┐
                          │           Browser (:3000)                    │
                          │         Next.js 16 Frontend                  │
                          └───────┬──────────┬──────────────┬────────────┘
                                  │ REST     │ Upload       │ WebSocket
                                  │ :5001    │ :5002        │ :5003
                                  ▼          ▼              ▼
              ┌─────────────────────────────────────────────────────┐
              │              Application Services                    │
              │  ┌──────────┐  ┌──────────┐  ┌──────────────────┐   │
              │  │ Dukaan   │  │ Dukaan   │  │ Dukaan           │   │
              │  │ API      │  │ Media    │  │ Notification     │   │
              │  │ :5001    │  │ :5002    │  │ :5003            │   │
              │  └────┬─────┘  └────┬─────┘  └────────┬─────────┘   │
              └───────┼─────────────┼──────────────────┼──────────────┘
                      │             │                  │
         ┌────────────┼─────────────┼──────────────────┼──────────────┐
         │           │             │                  │               │
         │     ┌──────▼──────┐ ┌───▼────┐     ┌──────▼──────┐        │
         │     │ PostgreSQL  │ │ MinIO  │     │   Redis     │        │
         │     │  :5433      │ │ :9000  │     │   :6379     │        │
         │     └─────────────┘ └────────┘     └─────────────┘        │
         │                       Data Stores                         │
         └───────────────────────────────────────────────────────────┘

         ┌───────────────────────────────────────────────────────────┐
         │                   Observability Stack                      │
         │  OTel Collector (:4317) → Prometheus (:9091)               │
         │                        → Loki (:3100)                      │
         │                        → Tempo (:3200)                     │
         │                        → Grafana (:3001)                   │
         └───────────────────────────────────────────────────────────┘
```

### 3.2 Service Breakdown

| Service | Port | Nodes | Description |
|---------|------|-------|-------------|
| **Dukaan API** (main) | 5001 | 1,711 | Merchant/customer auth, products, categories, cart, addresses, orders, storefront |
| **Dukaan.Media** | 5002 | 506 | Chunked file upload, WebP conversion via SkiaSharp, MinIO storage |
| **Dukaan.Notification** | 5003 | 475 | Redis Stream consumer, SignalR push, email via SMTP (MailHog) |
| **Frontend (dukaan-web)** | 3000 | 822 | Next.js 16 app router, merchant dashboard + storefront |

---

## 4. Architecture Principles

### 4.1 Clean Architecture (Onion)

Every .NET service follows **Clean Architecture** — dependencies always point inward:

```
*.Domain          — Entities, Enums, Value Objects, Interfaces (zero deps)
     ↑
*.Application    — CQRS Commands/Queries, DTOs, Validators, App Interfaces
     ↑
*.Infrastructure — EF Core DbContext, Repositories, External Services, Hangfire Jobs
     ↑
*.Host           — ASP.NET Controllers, Middleware, Program.cs, DI Registration
```

### 4.2 CQRS + MediatR

- **Commands** — write operations (e.g., `CreateProductCommand`)
- **Queries** — read operations (e.g., `GetProductsQuery`)
- **Handlers** — business logic in `Features/{Entity}/{Action}Handler`
- **Validation pipeline** — `ValidationBehavior<TRequest, TResponse>` runs FluentValidation before handlers

### 4.3 Multi-Tenancy

- **Strategy:** Shared database, tenant-scoped isolation via EF Core global query filters
- **Resolution:** JWT `tenant_id` claim or `X-Tenant-Id` header → `ITenantProvider`
- **Auto-stamping:** `TenantInterceptor` (EF Core `SaveChangesInterceptor`) injects `TenantId` on INSERT
- **Entities:** All tenant-scoped entities implement `ITenantEntity`

### 4.4 Domain Entities (Dukaan API)

| Entity | Key Fields | Notes |
|--------|-----------|-------|
| **Tenant** | Id, StoreName, Slug, Category, Country, Currency | Root, not scoped |
| **ApplicationUser** | Id, Email, UserType (Merchant/Customer/Admin), TenantId | ASP.NET Identity |
| **Merchant** | Id, ApplicationUserId, TenantId | 1:1 with ApplicationUser |
| **Customer** | Id, ApplicationUserId, TenantId, FirstName, LastName, Phone | 1:1 with ApplicationUser |
| **Product** | Id, TenantId, Name, Description, Price, ImageUrl, PendingMediaId, StockQuantity, IsActive | M:N with Category |
| **Category** | Id, TenantId, Name, Description, IsActive, ParentCategoryId | Self-referencing hierarchy |
| **Cart** | Id, TenantId, CustomerId | One per customer |
| **CartItem** | Id, TenantId, CartId, ProductId, Quantity, UnitPrice | Price snapshot |
| **Address** | Id, TenantId, CustomerId, Type (Billing/Delivery), Street, City, District, PostalCode, Phone, IsDefault | Multiple per customer |
| **Order** | Id, TenantId, CustomerId, OrderNumber, Status, SubTotal, TotalAmount, AddressSnapshot | Status enum: Pending/Confirmed/Shipped/Delivered/Cancelled |
| **OrderItem** | Id, OrderId, ProductId, ProductName, UnitPrice, Quantity | Historical snapshot |

### 4.5 Inter-Service Communication

| From | To | Mechanism | Direction | Details |
|------|----|-----------|-----------|---------|
| Dukaan API | Dukaan.Media | HTTP polling | Pull | `MediaResolutionJob` polls `GET /api/media/{id}` every 30s |
| Dukaan API | Dukaan.Notification | Redis Streams | Async push | Publishes to `order-events` stream |
| Dukaan.Notification → Frontend | SignalR WebSocket | Real-time push | Server → Client via `/hubs/notifications` |
| Dukaan.Notification (SignalR) | Redis backplane | Cross-instance | Broadcasts messages across instances |

### 4.6 Inter-Service Data Flow

#### Media Upload Flow

```
Frontend                       Dukaan.Media                       MinIO
   │                               │                               │
   ├── POST /api/media/chunk/init──▶  (create MediaMetadata)       │
   │◀────── {mediaId, chunks} ─────┤                               │
   │                               │                               │
   ├── POST /api/media/chunk/1 ────▶                               │
   │                               ├── PUT chunk/{id}/1 ──────────▶│
   │◀────────── OK ────────────────┤                               │
   │ (repeat for each chunk)       │                               │
   │                               │                               │
   ├── POST /api/media/chunk/complete ──▶                          │
   │                               │  (enqueue ProcessImageJob)    │
   │◀────────── Pending ───────────┤                               │
   │                               │                               │
   │         (background)          │                               │
   │                               ├── GET chunk/{id}/* ───────────▶│
   │                               │◀────── chunks ───────────────┤│
   │                               │  (SkiaSharp: WebP + resize)   │
   │                               ├── PUT media/{tenant}/.../ ────▶│
   │                               │  (original/display/thumbnail) │
   │                               │  (delete chunk files)         │
   │                               │                               │
   │         Dukaan API polls      │                               │
   ├── GET /api/media/{id} ────────▶                               │
   │◀────────── Completed ────────┤                               │
   │  (updates product.ImageUrl)  │                               │
```

#### Order Event → Notification Flow

```
Dukaan API                         Redis                      Notification Service
   │                                │                              │
   │  StreamAdd "order-events" ─────▶                              │
   │                                │                              │
   │                                │   StreamReadGroup ───────────▶│
   │                                │                              │
   │                                │   ┌────────────────────────────┤
   │                                │   │ OrderEventConsumer         │
   │                                │   │  → NotificationDispatchMgr  │
   │                                │   │    ├── InAppDispatcher      │
   │                                │   │    │  (persists + SignalR)  │
   │                                │   │    ├── SignalDispatcher     │
   │                                │   │    │  (raw SignalR toast)   │
   │                                │   │    └── EmailDispatcher      │
   │                                │   │       (SMTP via MailKit)    │
   │                                │   └────────────────────────────┤
   │                                │                              │
   │                                │   Acknowledge ───────────────▶│
```

---

## 5. Conventions Followed

### 5.1 .NET Backend

| Convention | Standard |
|-----------|----------|
| Namespaces | File-scoped `namespace X.Y;` (C# 12) |
| Constructors | Primary constructors for DI |
| DTOs | `record` for immutability |
| Error handling | `ErrorOr` Result pattern (not exceptions) |
| Validation | FluentValidation → `ValidationBehavior<T, TResponse>` |
| Repositories | Generic `IRepository<T>` + `AsNoTracking()` for reads |
| DI registration | Extension methods per layer: `Add{Layer}Services()` |
| Project format | `.slnx` (new .NET solution format) |
| Config | `IOptions<T>` + `ValidateOnStart()` |

### 5.2 Frontend (TypeScript)

| Convention | Standard |
|-----------|----------|
| Components | kebab-case files, PascalCase named exports |
| Pages | One-liner re-exports from modules |
| API layer | `http<T>()` generic wrapper with `authHeaders()` / `tenantHeaders()` |
| State | TanStack Query custom hooks (`useXxx`) |
| Styling | Tailwind CSS v4 + `cn()` helper (clsx + tailwind-merge) |
| UI primitives | shadcn/ui + `@base-ui/react` |
| Icons | `lucide-react` named imports |
| Auth | SSR-safe `localStorageService.getToken()` |
| Routing | Route groups: `(store)` for storefront, `(merchant)` for admin |
| Testing | Jest + React Testing Library |

---

## 6. Dependencies

### 6.1 Infrastructure Services

| Service | Image/Technology | Port | Purpose |
|---------|-----------------|------|---------|
| PostgreSQL | `postgres:17-alpine` | 5433 | Primary database for all services |
| Redis | `redis:7-alpine` | 6379 | Streams (order events), SignalR backplane, caching |
| MinIO | `minio/minio:latest` | 9000/9001 | Object storage for media files (S3-compatible) |
| MailHog | `mailhog/mailhog:latest` | 1025/8025 | Dev email capture (SMTP + web UI) |

### 6.2 Observability Stack

| Service | Image | Port | Purpose |
|---------|-------|------|---------|
| OpenTelemetry Collector | `otel/opentelemetry-collector` | 4317 | Traces, metrics, logs ingestion |
| Prometheus | `prom/prometheus:latest` | 9091 | Metric storage |
| Loki | `grafana/loki:latest` | 3100 | Log aggregation |
| Tempo | `grafana/tempo:latest` | 3200 | Distributed tracing |
| Grafana | `grafana/grafana:latest` | 3001 | Visualization dashboards |

### 6.3 NuGet Packages (per service)

#### Dukaan API (main)

| Package | Purpose |
|---------|---------|
| `MediatR` | CQRS |
| `FluentValidation` | Request validation |
| `ErrorOr` | Result pattern |
| `Npgsql.EntityFrameworkCore.PostgreSQL` | PostgreSQL ORM |
| `Microsoft.AspNetCore.Identity.EntityFrameworkCore` | Auth |
| `Serilog` + `Serilog.Sinks.OpenTelemetry` | Structured logging |
| `OpenTelemetry.*` | Distributed tracing + metrics |
| `Hangfire` + `Hangfire.PostgreSql` | Background jobs |
| `StackExchange.Redis` | Redis Streams |
| `SkiaSharp` | (only in Media service) |

#### Dukaan.Media

| Package | Purpose |
|---------|---------|
| `Minio` | S3-compatible object storage client |
| `SkiaSharp` | Image processing (WebP conversion, resize) |
| `Hangfire` + `Hangfire.PostgreSql` | Background image processing |

#### Dukaan.Notification

| Package | Purpose |
|---------|---------|
| `StackExchange.Redis` | Redis Streams consumer |
| `Microsoft.AspNetCore.SignalR.StackExchangeRedis` | SignalR backplane |
| `MailKit` | SMTP email sending |
| `Hangfire` | (not used — consumer is BackgroundService) |

### 6.4 Frontend Packages (npm)

| Package | Purpose |
|---------|---------|
| `next` (16.2.6) | Framework |
| `react` / `react-dom` (19) | UI library |
| `@tanstack/react-query` (5) | Server state management |
| `@microsoft/signalr` | WebSocket client |
| `tailwindcss` (4) | CSS framework |
| `@base-ui/react` | Accessible UI primitives |
| `@tiptap/react` | Rich text editor |
| `lucide-react` | Icons |
| `react-hook-form` | Form management |
| `sonner` | Toast notifications |
| `@tanstack/react-table` | Table component |
| `jest` + `@testing-library/react` | Testing |

---

## 7. How to Run

### 7.1 Prerequisites

- **Node.js** 20+ (for frontend)
- **Docker** + **Docker Compose** (for backend infrastructure)
- **.NET 10 SDK** (for backend development)

### 7.2 Start Backend

```bash
cd backend
docker compose up -d
```

This starts all services defined in `docker-compose.yml` (PostgreSQL, Redis, MinIO, Dukaan API on :5001, Dukaan Media on :5002, Notification API on :5003, OTel Collector, Grafana, Prometheus, Loki, Tempo, MailHog).

**Health check:**
```bash
curl http://localhost:5001/health
```

### 7.3 Start Frontend

```bash
cd frontend/dukaan-web
npm install
npm run dev
```

Frontend opens at `http://localhost:3000`.

### 7.4 Quick Start (both)

```powershell
# Use the dev script
.\dev.ps1
```

Or manually:
```bash
# Terminal 1 - Backend
cd backend && docker compose up -d

# Terminal 2 - Frontend
cd frontend/dukaan-web && npm run dev
```

### 7.5 Environment Variables

#### Backend (set in `docker-compose.yml`)

| Variable | Default | Notes |
|----------|---------|-------|
| `ASPNETCORE_ENVIRONMENT` | `Development` | |
| `ConnectionStrings__DefaultConnection` | `Host=postgres;Port=5432;Database=dukaan;...` | Docker internal |
| `MediaService__BaseUrl` | `http://dukaan-media:8080` | For media polling |
| `Redis__ConnectionString` | `redis:6379` | |
| `Jwt__Key` | `Your_JWT_secret_Key_...` | Must be 256-bit for HMAC-SHA256 |
| `MinIO__Endpoint` | `minio:9000` | (Media service only) |
| `Observability__OtlpEndpoint` | `http://otel-collector:4317` | |

#### Frontend (`frontend/dukaan-web/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:5001
NEXT_PUBLIC_MEDIA_API_URL=http://localhost:5002
NEXT_PUBLIC_MINIO_URL=http://localhost:9000/dukaan-media
NEXT_PUBLIC_NOTIFICATION_API_URL=http://localhost:5003
```

### 7.6 Stop

```bash
cd backend && docker compose down
```

---

## 8. API Endpoints Summary

### 8.1 Dukaan API (`:5001`)

| Area | Endpoint | Auth |
|------|----------|------|
| **Auth** | `POST /api/auth/login` | Anonymous |
| | `POST /api/auth/customer/login` | Anonymous + `x-tenant-slug` |
| **Merchants** | `POST /api/merchants/register` | Anonymous |
| | `GET /api/merchants/profile` | JWT |
| **Customers** | `POST /api/customers/register` | Anonymous + `x-tenant-slug` |
| | `GET /api/customers/me` | JWT |
| **Products** | `GET /api/products` | JWT (paged) |
| | `GET /api/products/{id}` | Anonymous |
| | `POST /api/products` | JWT |
| | `PUT /api/products/{id}` | JWT |
| | `DELETE /api/products/{id}` | JWT |
| **Categories** | `GET /api/categories` | JWT |
| | `POST /api/categories` | JWT |
| **Cart** | `GET /api/cart` | JWT + `x-tenant-slug` |
| | `POST /api/cart/items` | JWT + `x-tenant-slug` |
| **Addresses** | `GET /api/addresses` | JWT + `x-tenant-slug` |
| | `POST /api/addresses` | JWT + `x-tenant-slug` |
| **Orders** | `POST /api/orders` | JWT + `x-tenant-slug` |
| | `GET /api/orders` | JWT + `x-tenant-slug` |
| | `GET /api/orders/{orderId}` | JWT |
| **Merchant Orders** | `GET /api/merchant/orders` | JWT (merchant) |
| | `PUT /api/merchant/orders/{id}/status` | JWT (merchant) |
| **Storefront** | `GET /api/storefront/products` | Public + `x-tenant-slug` |
| | `GET /api/storefront/categories` | Public + `x-tenant-slug` |

### 8.2 Dukaan.Media (`:5002`)

| Method | Route | Description |
|--------|-------|-------------|
| `POST` | `/api/media/chunk/init` | Initiate chunked upload |
| `POST` | `/api/media/chunk/{mediaId}/{chunkIndex}` | Upload chunk |
| `POST` | `/api/media/chunk/{mediaId}/complete` | Complete upload |
| `GET` | `/api/media/{id}` | Poll status |
| `GET` | `/api/media/{id}/url?variant=display` | Presigned URL |
| `DELETE` | `/api/media/{id}` | Delete media |

### 8.3 Dukaan.Notification (`:5003`)

| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/api/notifications` | List notifications (paged) |
| `GET` | `/api/notifications/unread-count` | Unread count |
| `POST` | `/api/notifications/{id}/read` | Mark as read |
| SignalR | `/hubs/notifications` | WebSocket hub |

### 8.4 Frontend Routes (Next.js)

| Route | Description |
|-------|-------------|
| `/merchant/login` | Merchant login |
| `/merchant/dashboard` | Merchant dashboard |
| `/merchant/products` | Product CRUD |
| `/merchant/categories` | Category management |
| `/merchant/orders` | Order management |
| `/store/[slug]` | Storefront (products, cart, checkout) |
| `/store/[slug]/login` | Customer login |
| `/store/[slug]/register` | Customer registration |
| `/store/[slug]/orders` | Customer order history |
| `/store/[slug]/profile` | Customer profile + addresses |

---

## 9. Database Schema Overview

### 9.1 Main Database (Dukaan API) — `public` schema

```
Tenant ──1:N── ApplicationUser (Identity)
                                ├── Merchant (1:1)
                                └── Customer (1:1)

Product ──M:N── Category (via CategorizedProduct)
Cart ──1:N── CartItem
Customer ──1:N── Address
Customer ──1:N── Order ──1:N── OrderItem
```

### 9.2 Media Database (Dukaan.Media) — `media` schema

```
MediaMetadata (TenantId, Status, TotalChunks, UploadedChunks, ImagePath)
    ├── MediaChunk (MediaId, ChunkIndex, StorageKey)
    └── MediaVariant (MediaId, VariantType, StorageKey, Width, Height, FileSize)
```

### 9.3 Notification Database (Dukaan.Notification) — `notification` schema

```
Notification (id, customer_id, tenant_id, event_type, order_id, is_read, created_at)
```

---

## 10. Background Jobs

### 10.1 MediaResolutionJob (Dukaan API)
- **Schedule:** Every 30 seconds
- **Queue:** `media-resolution`
- **Purpose:** Polls Dukaan.Media for completed uploads, updates product.ImageUrl
- **Storage:** PostgreSQL (schema `hangfire`)

### 10.2 ProcessImageJob (Dukaan.Media)
- **Trigger:** Enqueued on upload complete
- **Purpose:** Downloads chunks from MinIO, combines, processes (WebP + 3 variants), uploads variants, cleans chunks
- **Retry:** 3 attempts (10s, 30s, 60s)
- **Storage:** PostgreSQL (schema `hangfire_media`)

### 10.3 CleanupStagingJob (Dukaan.Media)
- **Schedule:** Daily (cron)
- **Purpose:** Clean abandoned uploads (pending > 24h)

### 10.4 OrderEventConsumer (Dukaan.Notification)
- **Type:** `BackgroundService` (not Hangfire)
- **Mechanism:** Redis Streams consumer group (`notification-group`)
- **Purpose:** Consumes order events, dispatches via strategy pattern (in-app/signal/email)

---

## 11. Database Seeding

On first startup (when database is empty), Dukaan API automatically:

1. Creates **"Demo Store"** tenant (slug: `demo-store`)
2. Creates **merchant**: `demo@example.com` / `Demo@123`
3. Creates **customer**: `customer@example.com` / `Customer@123`
4. Creates **8 categories** (4 top-level + 4 subcategories)
5. Creates **10 sample products**

---

## 12. Observability

### 12.1 Custom Metrics (DukaanMetrics)

| Meter | Metric Name | Type |
|-------|-----------|------|
| `Dukaan` | `dukaan.cart_items_added` | Counter |
| `Dukaan` | `dukaan.cart_items_added_value` | Counter |
| `Dukaan` | `dukaan.cart_items_removed` | Counter |
| `Dukaan` | `dukaan.customer_registrations` | Counter |
| `Dukaan` | `dukaan.merchant_registrations` | Counter |
| `Dukaan` | `dukaan.auth_logins` | Counter (tagged with tenant_id) |
| `Dukaan` | `dukaan.auth_failures` | Counter |

### 12.2 Tracing
- **Instrumentation:** ASP.NET Core, HttpClient, EF Core
- **Export:** OTLP gRPC → OpenTelemetry Collector → Tempo (traces) + Prometheus (metrics) + Loki (logs)
- **Dashboard:** Grafana (`:3001`, admin/admin) with pre-provisioned dashboards

---

## 13. Error Handling

### 13.1 Backend
- **ErrorOr** Result pattern in all handlers (not exceptions)
- `BaseApiController.ToActionResult<T>()` maps errors:
  - `NotFound` → 404
  - `Validation` → 400
  - `Conflict` → 409
  - `Unauthorized` → 401
  - `Forbidden` → 403
  - `Unexpected` → 500
- `GlobalExceptionHandler` catches unhandled exceptions → RFC 7807 `ProblemDetails`

### 13.2 Frontend
- `HttpError` class with status code mapping
- Toast notifications for action errors
- Skeleton placeholders for loading states
- Inline error messages for forms

---

## 14. Testing

| Layer | Framework | Tools |
|-------|-----------|-------|
| Backend | xUnit | FluentAssertions, Moq |
| Frontend | Jest | React Testing Library |

### Notification Service Tests (existing)

| Test File | What It Tests |
|-----------|---------------|
| `InAppDispatcherTests.cs` | In-app notification persistence + SignalR push |
| `SignalDispatcherTests.cs` | SignalR raw signal dispatch |
| `EmailDispatcherTests.cs` | Email formatting + SMTP sending |
| `NotificationDispatchManagerTests.cs` | Manager orchestration with try/catch isolation |

---

## 15. Project Structure

```
E:\00_Portfolio_projects\
├── backend/
│   ├── docker-compose.yml           # All services + observability stack
│   ├── dev.ps1                       # Quick-start script
│   ├── Dukaan/
│   │   ├── Dukaan.Domain/            # 12 files: Entities, Enums, ValueObjects, Interfaces
│   │   ├── Dukaan.Application/       # 264 nodes: Features/{Auth,Products,Categories,Cart,Addresses,Orders,Merchants,Customers,Tenants}
│   │   ├── Dukaan.Infrastructure/    # 152 nodes: DbContext, Repositories, Migrations, Jobs, Services, Identity
│   │   ├── Dukaan.Host/             # 76 nodes: Controllers, Middleware, Program.cs, Observability
│   │   ├── observability/           # OTel config, Prometheus, Tempo, Grafana dashboards
│   │   └── Dukaan.slnx
│   ├── Dukaan.Media/
│   │   ├── Dukaan.Media.Domain/
│   │   ├── Dukaan.Media.Application/
│   │   ├── Dukaan.Media.Infrastructure/  # MinIO, SkiaSharp, Hangfire jobs
│   │   ├── Dukaan.Media.Host/
│   │   └── Dukaan.Media.slnx
│   ├── Dukaan.Notification/
│   │   ├── Dukaan.Notification.Domain/
│   │   ├── Dukaan.Notification.Application/
│   │   ├── Dukaan.Notification.Infrastructure/  # Redis consumer, SignalR hub, dispatchers, SMTP
│   │   ├── Dukaan.Notification.Host/
│   │   ├── Dukaan.Notification.Tests/
│   │   └── Dukaan.Notification.slnx
│   ├── AGENTS.md                    # Project standards
│   ├── CONVENTIONS.md              # Coding conventions with examples
│   ├── README.md                    # Root project readme
│   └── Notes.md                     # Scratch notes
├── frontend/
│   └── dukaan-web/
│       ├── src/
│       │   ├── app/                 # Next.js App Router (merchant + store route groups)
│       │   ├── components/          # Shared UI (shadcn/ui primitives)
│       │   ├── lib/                 # http.ts, utils, localStorage
│       │   ├── hooks/               # Shared hooks (use-mobile)
│       │   └── modules/             # Feature modules
│       │       ├── merchant/        # auth, dashboard, products, categories, orders
│       │       ├── store/           # auth, products, cart, orders, profile
│       │       └── notifications/   # SignalR hub + notification bell
│       ├── package.json
│       └── next.config.ts
├── docs/
│   └── PRD.md                       # This file
└── README.md                        # Project overview + quick start
```

**Total codebase size:** ~3,514 nodes across 4 indexed projects in the knowledge graph.

---

## 16. What's Not Yet Implemented

| Feature | Status |
|---------|--------|
| Payments / checkout integration | Not yet implemented |
| Full order lifecycle (beyond create + status update) | Partially implemented (events published) |
| SMS notifications | Not implemented |
| Push notifications (mobile) | Not implemented |
| Merchant notification dashboard | Not implemented |
| Admin panel | Not implemented |
| Product search / full-text search | Not implemented |
| Rating / reviews | Not implemented |
| Coupon / discount system | Not implemented |
| Multi-language / localization | Not implemented |

---

## 17. Key Code Patterns (Reference)

### Backend Handler Pattern
```csharp
public record CreateProductCommand(string Name, decimal Price)
    : IRequest<Result<ProductDto>>;

public class CreateProductHandler(IProductRepository repo)
    : IRequestHandler<CreateProductCommand, Result<ProductDto>>
{
    public async Task<Result<ProductDto>> Handle(
        CreateProductCommand request, CancellationToken ct)
    {
        var product = new Product { Name = request.Name, Price = request.Price };
        await repo.AddAsync(product, ct);
        return Result.Success(product.ToDto());
    }
}
```

### Frontend Module Pattern
```typescript
// api.ts
export const productsApi = {
  getAll: (page: number, size = 10) =>
    http<PagedResponse<ProductDto>>(`/api/products?pageNumber=${page}&pageSize=${size}`,
      { headers: authHeaders() }),
};

// hooks.ts
export function useProducts(page: number, size = 10) {
  return useQuery({
    queryKey: ["products", page, size],
    queryFn: () => productsApi.getAll(page, size),
  });
}
```

### Frontend Page Pattern (one-liner)
```typescript
// src/app/(merchant)/merchant/products/page.tsx
export { ProductsView as default } from "@/modules/merchant/products/components/products-view";
```
